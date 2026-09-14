#!/usr/bin/env python3
"""ASCII-ENV-001 local adapter template for the promoted ASCII-GEN0 kernel.

This file is deliberately incomplete. Fill only the translation/delegation points.
Do not implement movement, collision, enemy behavior, or worldline transitions here.
"""
from __future__ import annotations

from ascii_env import CommittedSnapshot, WorldPosition

class PromotedAsciiGen0Adapter:
    def __init__(self, kernel):
        self.kernel = kernel

    def reset(self) -> None:
        # Delegate to the promoted kernel's deterministic run reset/start API.
        raise NotImplementedError("BIND_PROMOTED_KERNEL_RESET")

    def snapshot(self) -> CommittedSnapshot:
        raw = None  # replace with promoted kernel committed snapshot read
        if raw is None:
            raise NotImplementedError("BIND_PROMOTED_KERNEL_SNAPSHOT_READ")
        # Translation only. No semantic calculation.
        return CommittedSnapshot(
            game_run_id=raw.game_run_id,
            logical_tick_index=raw.logical_tick_index,
            snapshot_digest=raw.snapshot_digest,
            player_position=WorldPosition(*raw.player_position),
            enemy_position=WorldPosition(*raw.enemy_position),
            enemy_action=raw.enemy_action,
            enemy_blocked=bool(getattr(raw, "enemy_blocked", False)),
        )

    def submit_player_action(self, action: str) -> CommittedSnapshot:
        if action not in {"MOVE_N","MOVE_S","MOVE_E","MOVE_W","STAY"}:
            raise ValueError("UNKNOWN_PLAYER_ACTION")
        # Delegate canonical action to promoted kernel; never calculate successor here.
        raise NotImplementedError("BIND_PROMOTED_KERNEL_ACTION_SUBMIT")

    def canonical_trace_digest(self) -> str:
        # Return the promoted kernel's canonical trace digest.
        raise NotImplementedError("BIND_PROMOTED_KERNEL_TRACE_DIGEST")


def create_adapter():
    # Import/construct the already-promoted local kernel here.
    raise NotImplementedError("BIND_PROMOTED_ASCII_GEN0_KERNEL")
