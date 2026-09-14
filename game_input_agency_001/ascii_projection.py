#!/usr/bin/env python3
"""Deterministic, mutation-free ASCII projection of committed V1 snapshots."""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from typing import Any

from agency_kernel import BLOCKED, CommittedSnapshotV1, canonical_json


GAME = "GAME"
CARRIER = "CARRIER"
SURFACES = (GAME, CARRIER)


class AsciiProjectionError(ValueError):
    pass


@dataclass(frozen=True)
class AsciiViewport:
    width: int = 80
    height: int = 24
    z_slice: int = 0

    def __post_init__(self) -> None:
        if self.width < 21 or self.height < 13:
            raise AsciiProjectionError("VIEWPORT_TOO_SMALL_FOR_GEN0_ARENA")

    def canonical(self) -> dict[str, int]:
        return {"height": self.height, "width": self.width, "z_slice": self.z_slice}


@dataclass(frozen=True)
class AsciiFrame:
    run_id: str
    logical_tick_index: int
    render_snapshot_digest: str
    active_surface: str
    width: int
    height: int
    canonical_glyph_buffer: str

    @property
    def frame_digest(self) -> str:
        return sha256(canonical_json(self.canonical()).encode("utf-8")).hexdigest()

    def canonical(self) -> dict[str, Any]:
        return {
            "active_surface": self.active_surface,
            "canonical_glyph_buffer": self.canonical_glyph_buffer,
            "height": self.height,
            "logical_tick_index": self.logical_tick_index,
            "render_snapshot_digest": self.render_snapshot_digest,
            "run_id": self.run_id,
            "width": self.width,
        }


def _blank(viewport: AsciiViewport) -> list[list[str]]:
    return [[" " for _ in range(viewport.width)] for _ in range(viewport.height)]


def _write(rows: list[list[str]], row: int, column: int, text: str) -> None:
    if not 0 <= row < len(rows):
        return
    for offset, character in enumerate(text):
        target = column + offset
        if 0 <= target < len(rows[row]):
            rows[row][target] = character


def _buffer(rows: list[list[str]]) -> str:
    return "\n".join("".join(row) for row in rows) + "\n"


def _project_game(snapshot: CommittedSnapshotV1, viewport: AsciiViewport) -> str:
    rows = _blank(viewport)
    arena_width, arena_height = 21, 13
    left = (viewport.width - arena_width) // 2
    top = (viewport.height - arena_height) // 2
    for world_y in range(6, -7, -1):
        for world_x in range(-10, 11):
            rows[top + (6 - world_y)][left + (world_x + 10)] = "."
    obstructions = {(2, -1, 0), (2, 0, 0), (2, 1, 0)}
    for x, y, z in sorted(obstructions):
        if z == viewport.z_slice:
            rows[top + (6 - y)][left + (x + 10)] = "#"

    state = snapshot.world_state
    if state.resonance_position.z == viewport.z_slice:
        glyph = "x" if snapshot.last_resonance_movement and snapshot.last_resonance_movement.status == BLOCKED else "r"
        rows[top + (6 - state.resonance_position.y)][left + (state.resonance_position.x + 10)] = glyph
    if state.player_position.z == viewport.z_slice:
        rows[top + (6 - state.player_position.y)][left + (state.player_position.x + 10)] = "@"
    return _buffer(rows)


def _project_carrier(snapshot: CommittedSnapshotV1, viewport: AsciiViewport) -> str:
    rows = _blank(viewport)
    _write(rows, 1, 2, f"RUN   {snapshot.run_id[:16]}")
    _write(rows, 2, 2, f"TICK  {snapshot.logical_tick_index:06d}")
    _write(rows, 3, 2, f"SNAP  {snapshot.snapshot_digest[:16]}")
    _write(rows, 4, 2, f"STATE {snapshot.fabric_state_digest[:16]}")
    _write(rows, 6, 2, "FABRIC")
    cells = snapshot.immutable_structure.get("cells", [])
    for index, cell in enumerate(cells[: min(len(cells), viewport.height - 10)]):
        cell_id = str(cell["cell_id"])
        phase = snapshot.payload_phases.get(cell_id, "EMPTY")
        _write(rows, 8 + index, 4, f"[{index:02d}] {cell_id[:24]:24s} {phase}")
    player = snapshot.last_player_movement
    resonance = snapshot.last_resonance_movement
    if player is not None:
        _write(rows, viewport.height - 3, 2, f"PLAYER    {player.status:8s} {str(player.reason or '-')[:18]}")
    if resonance is not None:
        _write(rows, viewport.height - 2, 2, f"RESONANCE {resonance.status:8s} {str(resonance.reason or '-')[:18]}")
    return _buffer(rows)


def project_ascii(
    snapshot: CommittedSnapshotV1,
    surface: str = GAME,
    viewport: AsciiViewport = AsciiViewport(),
) -> AsciiFrame:
    if surface not in SURFACES:
        raise AsciiProjectionError("UNKNOWN_ASCII_SURFACE")
    before = snapshot.snapshot_digest
    glyphs = _project_game(snapshot, viewport) if surface == GAME else _project_carrier(snapshot, viewport)
    if before != snapshot.snapshot_digest:
        raise AsciiProjectionError("ASCII_PROJECTOR_MUTATED_SNAPSHOT")
    return AsciiFrame(
        snapshot.run_id,
        snapshot.logical_tick_index,
        snapshot.snapshot_digest,
        surface,
        viewport.width,
        viewport.height,
        glyphs,
    )


class AsciiProjectionController:
    """Owns presentation selection only; never receives a kernel engine."""

    def __init__(self, viewport: AsciiViewport = AsciiViewport()) -> None:
        self.viewport = viewport
        self.surface = GAME
        self.frames: list[AsciiFrame] = []

    def project(self, snapshot: CommittedSnapshotV1) -> AsciiFrame:
        frame = project_ascii(snapshot, self.surface, self.viewport)
        self.frames.append(frame)
        return frame

    def toggle(self, snapshot: CommittedSnapshotV1) -> AsciiFrame:
        before = snapshot.snapshot_digest
        self.surface = CARRIER if self.surface == GAME else GAME
        frame = self.project(snapshot)
        if before != snapshot.snapshot_digest:
            raise AsciiProjectionError("ASCII_TOGGLE_MUTATED_SNAPSHOT")
        return frame


__all__ = [
    "AsciiFrame", "AsciiProjectionController", "AsciiProjectionError", "AsciiViewport", "CARRIER", "GAME",
    "SURFACES", "project_ascii",
]
