#!/usr/bin/env python3
"""Translation-only adapter to the promoted ASCII-GEN0 agency kernel.

The adapter verifies the imported kernel and promotion-record identities before
loading them. It delegates every state transition to AgencyGameLoopEngine and
only translates immutable committed snapshots for ASCII-ENV-001.
"""
from __future__ import annotations

from hashlib import sha256
import importlib.util
from pathlib import Path
import sys

from ascii_env import CommittedSnapshot, WorldPosition


HERE = Path(__file__).resolve().parent
AGENCY_DIR = HERE.parent / "game_input_agency_001"
AGENCY_KERNEL_PATH = AGENCY_DIR / "agency_kernel.py"
AGENCY_PROMOTION_PATH = AGENCY_DIR / "PROMOTION_RECORD.md"

AGENCY_KERNEL_SHA256 = "A69AB28712667BF4E0836488A33545115497D0216E9FAE5451C5893689C92A22"
AGENCY_PROMOTION_SHA256 = "67F0F51C7206A20B348991D823E472693E5D0C641D3B7EB8874B30A56000D522"


def _file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


for _path, _expected, _label in (
    (AGENCY_KERNEL_PATH, AGENCY_KERNEL_SHA256, "ASCII_GEN0_AGENCY_KERNEL"),
    (AGENCY_PROMOTION_PATH, AGENCY_PROMOTION_SHA256, "ASCII_GEN0_PROMOTION_RECORD"),
):
    if not _path.is_file() or _file_sha256(_path) != _expected:
        raise RuntimeError(f"{_label}_IMPORT_MISMATCH")


_MODULE_NAME = "mal_fabric_ascii_gen0_promoted_import"
_MODULE_SPEC = importlib.util.spec_from_file_location(_MODULE_NAME, AGENCY_KERNEL_PATH)
if _MODULE_SPEC is None or _MODULE_SPEC.loader is None:
    raise RuntimeError("ASCII_GEN0_AGENCY_KERNEL_UNAVAILABLE")
agency = importlib.util.module_from_spec(_MODULE_SPEC)
sys.modules[_MODULE_NAME] = agency
_MODULE_SPEC.loader.exec_module(agency)


class PromotedAsciiGen0Adapter:
    """Read/submit facade with no movement, behavior, or tick authority."""

    def __init__(self) -> None:
        self.engine = None
        self.reset()

    def reset(self) -> None:
        self.engine = agency.AgencyGameLoopEngine()

    def snapshot(self) -> CommittedSnapshot:
        if self.engine is None:
            raise RuntimeError("ASCII_GEN0_ENGINE_NOT_INITIALIZED")
        raw = self.engine.snapshot()
        world = raw.world_state
        player = world.player_position
        enemy = world.resonance_position
        enemy_blocked = (
            raw.last_resonance_movement is not None
            and raw.last_resonance_movement.status == agency.BLOCKED
        )
        return CommittedSnapshot(
            game_run_id=raw.run_id,
            logical_tick_index=raw.logical_tick_index,
            snapshot_digest=raw.snapshot_digest,
            player_position=WorldPosition(player.x, player.y, player.z),
            enemy_position=WorldPosition(enemy.x, enemy.y, enemy.z),
            enemy_action=world.resonance_mode,
            enemy_blocked=enemy_blocked,
        )

    def submit_player_action(self, action: str) -> CommittedSnapshot:
        if action not in agency.PLAYER_ACTIONS:
            raise ValueError("UNKNOWN_PLAYER_ACTION")
        if self.engine is None:
            raise RuntimeError("ASCII_GEN0_ENGINE_NOT_INITIALIZED")
        tick_input = agency.GameTickInputV1(self.engine.state.w, action)
        self.engine.advance(tick_input)
        return self.snapshot()

    def canonical_trace_digest(self) -> str:
        if self.engine is None:
            raise RuntimeError("ASCII_GEN0_ENGINE_NOT_INITIALIZED")
        return self.engine.trace_digest


def create_adapter() -> PromotedAsciiGen0Adapter:
    return PromotedAsciiGen0Adapter()
