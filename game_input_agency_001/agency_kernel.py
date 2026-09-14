#!/usr/bin/env python3
"""Governed player agency successor over the immutable DEMO-003 kernel.

The module imports DEMO-003 by byte identity.  It does not modify or replace
the legacy V0 replay path.  GameTickInputV1 carries an action proposal; only
AgencyGameLoopEngine decides and commits the resulting world position.
"""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import sys
from typing import Any, Mapping, Sequence


HERE = Path(__file__).resolve().parent
DEMO_003_DIR = HERE.parent / "demo_003_game_loop_binding"
DEMO_003_PATH = DEMO_003_DIR / "game_loop.py"
DEMO_003_ACCEPTANCE_PATH = DEMO_003_DIR / "acceptance-summary.json"
DEMO_003_PROMOTION_PATH = DEMO_003_DIR / "PROMOTION_RECORD.md"

DEMO_003_KERNEL_SHA256 = "F711C6499E345C6B6952D8E8AA570B385D7F48A46F3E2189491E98653C4C1833"
DEMO_003_ACCEPTANCE_SHA256 = "F6BCFDCA7C58CB363ACAB9F03B349CD052EDE0819653E6B01B06A492EDAB6DFE"
DEMO_003_PROMOTION_SHA256 = "9F3DF4BB5F1B2F47C8A5DE4549B67C1769B64A30016D641AFFAAC2A9298E6510"


class AgencyError(ValueError):
    """Fail-closed agency-boundary error."""


def file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


for _path, _expected, _label in (
    (DEMO_003_PATH, DEMO_003_KERNEL_SHA256, "DEMO_003_KERNEL"),
    (DEMO_003_ACCEPTANCE_PATH, DEMO_003_ACCEPTANCE_SHA256, "DEMO_003_ACCEPTANCE"),
    (DEMO_003_PROMOTION_PATH, DEMO_003_PROMOTION_SHA256, "DEMO_003_PROMOTION"),
):
    if not _path.is_file() or file_sha256(_path) != _expected:
        raise AgencyError(f"{_label}_IMPORT_MISMATCH")

_MODULE_NAME = "mal_fabric_demo_003_agency_import"
_MODULE_SPEC = importlib.util.spec_from_file_location(_MODULE_NAME, DEMO_003_PATH)
if _MODULE_SPEC is None or _MODULE_SPEC.loader is None:
    raise AgencyError("DEMO_003_IMPORT_UNAVAILABLE")
demo3 = importlib.util.module_from_spec(_MODULE_SPEC)
sys.modules[_MODULE_NAME] = demo3
_MODULE_SPEC.loader.exec_module(demo3)
v33 = demo3.v33


MOVE_N = "MOVE_N"
MOVE_S = "MOVE_S"
MOVE_E = "MOVE_E"
MOVE_W = "MOVE_W"
STAY = "STAY"
PLAYER_ACTIONS = (MOVE_N, MOVE_S, MOVE_E, MOVE_W, STAY)
ADMITTED = "ADMITTED"
BLOCKED = "BLOCKED"
GEN0_Z = 0


def canonical_value(value: Any) -> Any:
    if hasattr(value, "canonical") and callable(value.canonical):
        return canonical_value(value.canonical())
    if isinstance(value, Mapping):
        return {str(key): canonical_value(value[key]) for key in sorted(value, key=str)}
    if isinstance(value, (tuple, list)):
        return [canonical_value(item) for item in value]
    if isinstance(value, (set, frozenset)):
        return sorted((canonical_value(item) for item in value), key=canonical_json)
    return value


def canonical_json(value: Any, *, pretty: bool = False) -> str:
    return json.dumps(
        canonical_value(value),
        ensure_ascii=False,
        sort_keys=True,
        indent=2 if pretty else None,
        separators=None if pretty else (",", ":"),
    ) + ("\n" if pretty else "")


def canonical_digest(value: Any) -> str:
    return sha256(canonical_json(value).encode("utf-8")).hexdigest()


@dataclass(frozen=True, order=True)
class WorldPositionV1:
    x: int
    y: int
    z: int

    def __post_init__(self) -> None:
        if not all(isinstance(value, int) and not isinstance(value, bool) for value in (self.x, self.y, self.z)):
            raise AgencyError("WORLD_POSITION_REQUIRES_SIGNED_INTEGER_LATTICE")

    def canonical(self) -> list[int]:
        return [self.x, self.y, self.z]


@dataclass(frozen=True)
class WorldEventV1:
    position: WorldPositionV1
    w: int

    def __post_init__(self) -> None:
        if not isinstance(self.w, int) or isinstance(self.w, bool) or self.w < 0:
            raise AgencyError("INVALID_UNFOLDING_INDEX")

    def canonical(self) -> dict[str, Any]:
        return {"position": self.position.canonical(), "w": self.w}


@dataclass(frozen=True)
class ArenaSpecV1:
    x_min: int = -10
    x_max: int = 10
    y_min: int = -6
    y_max: int = 6
    z_min: int = -2
    z_max: int = 2
    obstructions: tuple[WorldPositionV1, ...] = (
        WorldPositionV1(2, -1, 0),
        WorldPositionV1(2, 0, 0),
        WorldPositionV1(2, 1, 0),
    )

    def __post_init__(self) -> None:
        if not (self.x_min <= self.x_max and self.y_min <= self.y_max and self.z_min <= self.z_max):
            raise AgencyError("INVALID_ARENA_BOUNDS")
        if len(set(self.obstructions)) != len(self.obstructions):
            raise AgencyError("DUPLICATE_OBSTRUCTION")
        if any(not self.inside(item) for item in self.obstructions):
            raise AgencyError("OBSTRUCTION_OUTSIDE_ARENA")

    def inside(self, position: WorldPositionV1) -> bool:
        return (
            self.x_min <= position.x <= self.x_max
            and self.y_min <= position.y <= self.y_max
            and self.z_min <= position.z <= self.z_max
        )

    def admissible(self, position: WorldPositionV1) -> bool:
        return self.inside(position) and position not in self.obstructions

    @property
    def arena_id(self) -> str:
        return canonical_digest(self.identity_payload())

    def identity_payload(self) -> dict[str, Any]:
        return {
            "bounds": {
                "x": [self.x_min, self.x_max],
                "y": [self.y_min, self.y_max],
                "z": [self.z_min, self.z_max],
            },
            "gen0_movement_plane": {"z0": GEN0_Z, "player_actions_preserve_z": True},
            "obstructions": [item.canonical() for item in sorted(self.obstructions)],
            "admissibility_scope": "ALL_ENTITY_MOVEMENT",
        }

    def canonical(self) -> dict[str, Any]:
        return {"arena_id": self.arena_id, **self.identity_payload()}


ARENA_GEN0_V1 = ArenaSpecV1()


@dataclass(frozen=True)
class GameTickInputV1:
    tick: int
    player_action: str

    def __post_init__(self) -> None:
        if not isinstance(self.tick, int) or isinstance(self.tick, bool) or self.tick < 0:
            raise AgencyError("INVALID_TICK")
        if self.player_action not in PLAYER_ACTIONS:
            raise AgencyError("UNKNOWN_PLAYER_ACTION")

    def canonical(self) -> dict[str, Any]:
        return {"player_action": self.player_action, "tick": self.tick}


@dataclass(frozen=True)
class MovementDisposition:
    entity_id: str
    action: str
    status: str
    reason: str | None
    prior: WorldPositionV1
    candidate: WorldPositionV1
    successor: WorldPositionV1

    def __post_init__(self) -> None:
        if self.status not in (ADMITTED, BLOCKED):
            raise AgencyError("UNKNOWN_MOVEMENT_DISPOSITION")
        if self.status == BLOCKED and self.successor != self.prior:
            raise AgencyError("BLOCKED_MOVEMENT_CHANGED_POSITION")
        if self.status == ADMITTED and self.successor != self.candidate:
            raise AgencyError("ADMITTED_MOVEMENT_DID_NOT_COMMIT_CANDIDATE")

    def canonical(self) -> dict[str, Any]:
        return {
            "action": self.action,
            "candidate": self.candidate.canonical(),
            "entity_id": self.entity_id,
            "prior": self.prior.canonical(),
            "reason": self.reason,
            "status": self.status,
            "successor": self.successor.canonical(),
        }


@dataclass(frozen=True)
class WorldGameStateV1:
    player_position: WorldPositionV1
    resonance_position: WorldPositionV1
    resonance_mode: str
    resonance_health: int
    w: int

    def __post_init__(self) -> None:
        if self.player_position.z != GEN0_Z:
            raise AgencyError("GEN0_PLAYER_OFF_MOVEMENT_PLANE")
        if self.resonance_mode not in demo3.ENEMY_ACTIONS:
            raise AgencyError("UNKNOWN_RESONANCE_MODE")
        if not isinstance(self.resonance_health, int) or not 0 <= self.resonance_health <= 100:
            raise AgencyError("RESONANCE_HEALTH_OUT_OF_RANGE")
        if not isinstance(self.w, int) or isinstance(self.w, bool) or self.w < 0:
            raise AgencyError("INVALID_UNFOLDING_INDEX")

    def canonical(self) -> dict[str, Any]:
        return {
            "player_position": self.player_position.canonical(),
            "resonance_health": self.resonance_health,
            "resonance_mode": self.resonance_mode,
            "resonance_position": self.resonance_position.canonical(),
            "w": self.w,
        }


DEFAULT_WORLD_STATE = WorldGameStateV1(
    WorldPositionV1(0, 0, GEN0_Z),
    WorldPositionV1(4, 0, GEN0_Z),
    demo3.PATROL,
    100,
    0,
)


@dataclass(frozen=True)
class AgencyTickReceipt:
    run_id: str
    tick: int
    game_tick_input: GameTickInputV1
    pre_state_digest: str
    post_state_digest: str
    pre_fabric_state_digest: str
    post_fabric_state_digest: str
    player_movement: MovementDisposition
    resonance_movement: MovementDisposition
    observation: Any
    effect_batch: Any
    run_status: str

    def canonical(self) -> dict[str, Any]:
        return {
            "effect_batch": canonical_value(self.effect_batch),
            "game_tick_input": self.game_tick_input.canonical(),
            "observation": canonical_value(self.observation),
            "player_movement": self.player_movement.canonical(),
            "post_fabric_state_digest": self.post_fabric_state_digest,
            "post_state_digest": self.post_state_digest,
            "pre_fabric_state_digest": self.pre_fabric_state_digest,
            "pre_state_digest": self.pre_state_digest,
            "resonance_movement": self.resonance_movement.canonical(),
            "run_id": self.run_id,
            "run_status": self.run_status,
            "tick": self.tick,
        }


@dataclass(frozen=True)
class CommittedSnapshotV1:
    run_id: str
    logical_tick_index: int
    world_state: WorldGameStateV1
    fabric_digest: str
    fabric_state_digest: str
    run_status: str
    immutable_structure: dict[str, Any]
    payload_phases: dict[str, str]
    last_player_movement: MovementDisposition | None
    last_resonance_movement: MovementDisposition | None

    @property
    def snapshot_digest(self) -> str:
        return canonical_digest(self.canonical())

    def canonical(self) -> dict[str, Any]:
        return {
            "fabric_digest": self.fabric_digest,
            "fabric_state_digest": self.fabric_state_digest,
            "immutable_structure": canonical_value(self.immutable_structure),
            "last_player_movement": canonical_value(self.last_player_movement),
            "last_resonance_movement": canonical_value(self.last_resonance_movement),
            "logical_tick_index": self.logical_tick_index,
            "payload_phases": canonical_value(self.payload_phases),
            "run_id": self.run_id,
            "run_status": self.run_status,
            "world_state": self.world_state.canonical(),
        }


ACTION_DELTAS = {
    MOVE_N: (0, 1, 0),
    MOVE_S: (0, -1, 0),
    MOVE_E: (1, 0, 0),
    MOVE_W: (-1, 0, 0),
    STAY: (0, 0, 0),
}


def movement_candidate(position: WorldPositionV1, action: str) -> WorldPositionV1:
    if action not in ACTION_DELTAS:
        raise AgencyError("UNKNOWN_PLAYER_ACTION")
    dx, dy, dz = ACTION_DELTAS[action]
    candidate = WorldPositionV1(position.x + dx, position.y + dy, position.z + dz)
    if candidate.z != position.z:
        raise AgencyError("PLAYER_ACTION_ATTEMPTED_Z_MUTATION")
    return candidate


def decide_movement(
    arena: ArenaSpecV1,
    entity_id: str,
    action: str,
    prior: WorldPositionV1,
    candidate: WorldPositionV1,
) -> MovementDisposition:
    if not arena.inside(candidate):
        return MovementDisposition(entity_id, action, BLOCKED, "ARENA_BOUNDS", prior, candidate, prior)
    if candidate in arena.obstructions:
        return MovementDisposition(entity_id, action, BLOCKED, "OBSTRUCTION", prior, candidate, prior)
    return MovementDisposition(entity_id, action, ADMITTED, None, prior, candidate, candidate)


def _structure(vibe: Any) -> dict[str, Any]:
    promoted = vibe.view()["promoted"]["canonical"]
    return {
        "fabric_id": promoted["fabric_id"],
        "cells": promoted["cells"],
        "routes": promoted["routes"],
        "placements": promoted["placements"],
    }


class AgencyGameLoopEngine:
    """One V1 action proposal, one governed tick, one simultaneous commit."""

    def __init__(
        self,
        *,
        state: WorldGameStateV1 = DEFAULT_WORLD_STATE,
        arena: ArenaSpecV1 = ARENA_GEN0_V1,
        schedule: Any = v33.DEFAULT_SCHEDULE,
    ) -> None:
        if not arena.admissible(state.player_position) or not arena.admissible(state.resonance_position):
            raise AgencyError("INITIAL_ENTITY_POSITION_INADMISSIBLE")
        if state.w != 0:
            raise AgencyError("RUN_MUST_BEGIN_AT_W_ORIGIN")
        if not v33.valid_host_schedule(schedule):
            raise AgencyError("INVALID_HOST_SCHEDULE")
        self.vibe = demo3.committed_game_session()
        self.program = self.vibe.base.fabric
        self.binding = demo3.default_binding(self.program)
        demo3.validate_binding(self.binding, self.program)
        self.fabric_state = v33.fabric_state(self.program)
        self.state = state
        self.initial_state = state
        self.arena = arena
        self.schedule = schedule
        self.structure = _structure(self.vibe)
        self.run_id = canonical_digest({
            "arena_id": arena.arena_id,
            "fabric_digest": v33.program_digest(self.program),
            "initial_fabric_state_digest": v33.canonical_digest(self.fabric_state),
            "initial_world_state": state.canonical(),
            "input_version": "GameTickInputV1",
        })
        self.receipts: list[AgencyTickReceipt] = []
        self.step_fabric_calls = 0
        self.last_player_movement: MovementDisposition | None = None
        self.last_resonance_movement: MovementDisposition | None = None

    @property
    def trace_digest(self) -> str:
        return canonical_digest({"run_id": self.run_id, "receipts": [item.canonical() for item in self.receipts]})

    def snapshot(self) -> CommittedSnapshotV1:
        phases = {cell_id: payload.phase for cell_id, payload in self.fabric_state.payload_states}
        return CommittedSnapshotV1(
            self.run_id,
            self.state.w,
            self.state,
            v33.program_digest(self.program),
            v33.canonical_digest(self.fabric_state),
            v33.run_status(self.program, self.fabric_state),
            self.structure,
            phases,
            self.last_player_movement,
            self.last_resonance_movement,
        )

    def advance(self, tick_input: GameTickInputV1) -> CommittedSnapshotV1:
        if type(tick_input) is not GameTickInputV1:
            raise AgencyError("V0_FORBIDDEN_FOR_ACTIVE_PLAYER_AGENCY")
        if tick_input.tick != self.state.w:
            raise AgencyError("GAME_TICK_INPUT_W_MISMATCH")

        prior = self.state
        pre_fabric_digest = v33.canonical_digest(self.fabric_state)
        player_candidate = movement_candidate(prior.player_position, tick_input.player_action)
        player_move = decide_movement(
            self.arena, "player", tick_input.player_action, prior.player_position, player_candidate
        )
        player_successor = player_move.successor

        distance = (
            abs(player_successor.x - prior.resonance_position.x)
            + abs(player_successor.y - prior.resonance_position.y)
            + abs(player_successor.z - prior.resonance_position.z)
        )
        observations = demo3.ObservationSet(distance <= 2, prior.resonance_health < 20)
        legacy_input = demo3.GameTickInput(
            prior.w,
            self.run_id,
            canonical_digest(prior),
            pre_fabric_digest,
            observations,
        )
        prepared = demo3.ingress_bind(self.binding, legacy_input, self.fabric_state, self.program)
        sigma = v33.Sigma(self.program, prepared)
        self.step_fabric_calls += 1
        result = v33.step_fabric(sigma) if self.schedule == v33.DEFAULT_SCHEDULE else v33.step_impl(sigma, self.schedule)
        committed_fabric = result.sigma.state
        effects = demo3.egress_bind(self.binding, committed_fabric, prior.w, self.run_id)

        legacy_prior = demo3.ToyGameState(
            (player_successor.x, player_successor.y),
            (prior.resonance_position.x, prior.resonance_position.y),
            prior.resonance_mode,
            prior.resonance_health,
        )
        legacy_successor = demo3.game_apply(legacy_prior, effects)
        resonance_candidate = WorldPositionV1(
            legacy_successor.enemy_position[0],
            legacy_successor.enemy_position[1],
            prior.resonance_position.z,
        )
        resonance_action = legacy_successor.enemy_mode if resonance_candidate != prior.resonance_position else STAY
        resonance_move = decide_movement(
            self.arena,
            "resonance",
            resonance_action,
            prior.resonance_position,
            resonance_candidate,
        )

        successor = WorldGameStateV1(
            player_successor,
            resonance_move.successor,
            legacy_successor.enemy_mode,
            legacy_successor.enemy_health,
            prior.w + 1,
        )
        receipt = AgencyTickReceipt(
            self.run_id,
            prior.w,
            tick_input,
            canonical_digest(prior),
            canonical_digest(successor),
            pre_fabric_digest,
            v33.canonical_digest(committed_fabric),
            player_move,
            resonance_move,
            observations,
            effects,
            v33.run_status(self.program, committed_fabric),
        )
        self.fabric_state = committed_fabric
        self.state = successor
        self.last_player_movement = player_move
        self.last_resonance_movement = resonance_move
        self.receipts.append(receipt)
        return self.snapshot()


def run_actions(
    actions: Sequence[str],
    *,
    state: WorldGameStateV1 = DEFAULT_WORLD_STATE,
    attached_projector: Any | None = None,
) -> AgencyGameLoopEngine:
    engine = AgencyGameLoopEngine(state=state)
    if attached_projector is not None:
        attached_projector.project(engine.snapshot())
    for action in actions:
        snapshot = engine.advance(GameTickInputV1(engine.state.w, action))
        if attached_projector is not None:
            attached_projector.project(snapshot)
    return engine


def import_identities() -> dict[str, str]:
    return {
        "demo_003_acceptance_sha256": file_sha256(DEMO_003_ACCEPTANCE_PATH),
        "demo_003_kernel_sha256": file_sha256(DEMO_003_PATH),
        "demo_003_promotion_sha256": file_sha256(DEMO_003_PROMOTION_PATH),
    }


__all__ = [
    "ADMITTED", "ACTION_DELTAS", "ARENA_GEN0_V1", "AgencyError", "AgencyGameLoopEngine",
    "ArenaSpecV1", "BLOCKED", "CommittedSnapshotV1", "DEFAULT_WORLD_STATE", "DEMO_003_ACCEPTANCE_SHA256",
    "DEMO_003_KERNEL_SHA256", "DEMO_003_PROMOTION_SHA256", "GEN0_Z", "GameTickInputV1", "MOVE_E",
    "MOVE_N", "MOVE_S", "MOVE_W", "MovementDisposition", "PLAYER_ACTIONS", "STAY", "WorldEventV1",
    "WorldGameStateV1", "WorldPositionV1", "canonical_digest", "canonical_json", "canonical_value",
    "decide_movement", "demo3", "file_sha256", "import_identities", "movement_candidate", "run_actions", "v33",
]
