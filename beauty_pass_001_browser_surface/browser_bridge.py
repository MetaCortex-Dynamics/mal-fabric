#!/usr/bin/env python3
"""Fail-closed adapter from the promoted agency kernel to the browser contract.

This module normalizes committed kernel snapshots for presentation.  It owns no
movement, behavior, collision, admission, tick, or digest semantics.
"""
from __future__ import annotations

from hashlib import sha256
import importlib.util
from pathlib import Path
import sys
from threading import Lock
from typing import Any


HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent
AGENCY_PATH = REPO_ROOT / "v3" / "software_fpga" / "game_input_agency_001" / "agency_kernel.py"
AGENCY_SHA256 = "A69AB28712667BF4E0836488A33545115497D0216E9FAE5451C5893689C92A22"


class BrowserBridgeError(RuntimeError):
    """Fail-closed bridge-boundary error."""


def _file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


if not AGENCY_PATH.is_file() or _file_sha256(AGENCY_PATH) != AGENCY_SHA256:
    raise BrowserBridgeError("PROMOTED_AGENCY_KERNEL_IDENTITY_MISMATCH")

_MODULE_NAME = "mal_fabric_promoted_agency_browser_import"
_MODULE_SPEC = importlib.util.spec_from_file_location(_MODULE_NAME, AGENCY_PATH)
if _MODULE_SPEC is None or _MODULE_SPEC.loader is None:
    raise BrowserBridgeError("PROMOTED_AGENCY_KERNEL_UNAVAILABLE")
agency = importlib.util.module_from_spec(_MODULE_SPEC)
sys.modules[_MODULE_NAME] = agency
_MODULE_SPEC.loader.exec_module(agency)


def _movement_blocked(movement: Any) -> bool:
    return movement is not None and movement.status == agency.BLOCKED


def _carrier(snapshot: Any) -> dict[str, Any]:
    structure = snapshot.immutable_structure
    placements = {
        item["cell_id"]: item["location"]
        for item in structure.get("placements", ())
    }
    cells = []
    for source in structure.get("cells", ()):
        cell = dict(source)
        cell["location"] = placements.get(cell["cell_id"])
        cell["payload_phase"] = snapshot.payload_phases.get(cell["cell_id"], "EMPTY")
        cells.append(cell)
    return {
        "cells": cells,
        "routes": [dict(route) for route in structure.get("routes", ())],
        "payload_states": dict(snapshot.payload_phases),
    }


def _normalize(snapshot: Any) -> dict[str, Any]:
    if snapshot.logical_tick_index != snapshot.world_state.w:
        raise BrowserBridgeError("COMMITTED_W_TICK_MISMATCH")
    snapshot_digest = snapshot.snapshot_digest
    player_move = snapshot.last_player_movement
    resonance_move = snapshot.last_resonance_movement
    player_action = player_move.action if player_move is not None else agency.STAY
    # CommittedSnapshotV1 covers both canonical world and fabric state.  The
    # bridge contract's joint-state field is therefore an alias of its existing
    # authoritative digest, never a renderer- or adapter-computed digest.
    return {
        "snapshot": {
            "game_run_id": snapshot.run_id,
            "logical_tick_index": snapshot.logical_tick_index,
            "snapshot_digest": snapshot_digest,
            "fabric_digest": snapshot.fabric_digest,
            "joint_state_digest": snapshot_digest,
            "run_status": snapshot.run_status,
            "player": {
                "entity_id": "player",
                "position": snapshot.world_state.player_position.canonical(),
                "action": player_action,
                "blocked": _movement_blocked(player_move),
            },
            "enemy": {
                "entity_id": "resonance",
                "position": snapshot.world_state.resonance_position.canonical(),
                "action": snapshot.world_state.resonance_mode,
                "health": snapshot.world_state.resonance_health,
                "blocked": _movement_blocked(resonance_move),
            },
            "carrier": _carrier(snapshot),
        }
    }


class PromotedAgencyBrowserBridge:
    """Serializes browser requests into one-action/one-governed-tick calls."""

    def __init__(self) -> None:
        self._engine = agency.AgencyGameLoopEngine()
        self._lock = Lock()

    def state(self) -> dict[str, Any]:
        with self._lock:
            before_tick = self._engine.state.w
            value = _normalize(self._engine.snapshot())
            if self._engine.state.w != before_tick:
                raise BrowserBridgeError("STATE_READ_ADVANCED_TICK")
            return value

    def submit_player_action(self, action: str) -> dict[str, Any]:
        if action not in agency.PLAYER_ACTIONS:
            raise BrowserBridgeError("UNKNOWN_PLAYER_ACTION")
        with self._lock:
            prior_tick = self._engine.state.w
            snapshot = self._engine.advance(agency.GameTickInputV1(prior_tick, action))
            if snapshot.logical_tick_index != prior_tick + 1:
                raise BrowserBridgeError("ACTION_DID_NOT_ADVANCE_EXACTLY_ONE_TICK")
            return _normalize(snapshot)


def create_browser_bridge() -> PromotedAgencyBrowserBridge:
    return PromotedAgencyBrowserBridge()


__all__ = [
    "AGENCY_PATH",
    "AGENCY_SHA256",
    "BrowserBridgeError",
    "PromotedAgencyBrowserBridge",
    "create_browser_bridge",
]
