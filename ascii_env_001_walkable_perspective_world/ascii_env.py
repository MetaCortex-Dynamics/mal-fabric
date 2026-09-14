#!/usr/bin/env python3
"""ASCII-ENV-001 fresh implementation candidate.

Normative source:
  SPEC_COMMIT              e100efa1c3e143c1c531082da1c637022d5ded05
  PROMOTION_COMMIT         5f852eed331fe97dc542b4a8a4eb3eb3975202e5
  SPEC_SHA256              C2C37A530B9589FE87D0EA5897826337B6719A15A98FEF5C8828C0E48F59B9A8

This module is presentation-only. It contains no canonical movement or enemy
behavior transition function.
"""
from __future__ import annotations

from dataclasses import dataclass
import hashlib
import struct
from typing import Iterable, Sequence

PROJECTOR_ID = "ASCII_ENV_001_PROJECTOR"
PROJECTOR_VERSION = "ASCII_ENV_001_PROJECTOR_V1"
SPEC_COMMIT = "e100efa1c3e143c1c531082da1c637022d5ded05"
PROMOTION_COMMIT = "5f852eed331fe97dc542b4a8a4eb3eb3975202e5"
SPEC_SHA256 = "C2C37A530B9589FE87D0EA5897826337B6719A15A98FEF5C8828C0E48F59B9A8"

ARENA_X_MIN, ARENA_X_MAX = -10, 10
ARENA_Y_MIN, ARENA_Y_MAX = -6, 6
ARENA_Z_MIN, ARENA_Z_MAX = -2, 2
GEN0_Z0 = 0
OBSTRUCTIONS = frozenset({(2, -1, 0), (2, 0, 0), (2, 1, 0)})

# Immutable presentation numeric domains.
# angle: uint8 turn, 0..255 => [0, 1 revolution)
# distance: unsigned Q8.8 cells
# trig: signed Q2.14 lookup values, table is literal and immutable
ANGLE_MODULUS = 256
DISTANCE_FRAC_BITS = 8
DISTANCE_ONE = 1 << DISTANCE_FRAC_BITS
TRIG_FRAC_BITS = 14
TRIG_ONE = 1 << TRIG_FRAC_BITS
RAY_STEP_Q8 = 16  # 1/16 cell

SIN_Q14 = (0, 402, 804, 1205, 1606, 2006, 2404, 2801, 3196, 3590, 3981, 4370, 4756, 5139, 5520, 5897, 6270, 6639, 7005, 7366, 7723, 8076, 8423, 8765, 9102, 9434, 9760, 10080, 10394, 10702, 11003, 11297, 11585, 11866, 12140, 12406, 12665, 12916, 13160, 13395, 13623, 13842, 14053, 14256, 14449, 14635, 14811, 14978, 15137, 15286, 15426, 15557, 15679, 15791, 15893, 15986, 16069, 16143, 16207, 16261, 16305, 16340, 16364, 16379, 16384, 16379, 16364, 16340, 16305, 16261, 16207, 16143, 16069, 15986, 15893, 15791, 15679, 15557, 15426, 15286, 15137, 14978, 14811, 14635, 14449, 14256, 14053, 13842, 13623, 13395, 13160, 12916, 12665, 12406, 12140, 11866, 11585, 11297, 11003, 10702, 10394, 10080, 9760, 9434, 9102, 8765, 8423, 8076, 7723, 7366, 7005, 6639, 6270, 5897, 5520, 5139, 4756, 4370, 3981, 3590, 3196, 2801, 2404, 2006, 1606, 1205, 804, 402, 0, -402, -804, -1205, -1606, -2006, -2404, -2801, -3196, -3590, -3981, -4370, -4756, -5139, -5520, -5897, -6270, -6639, -7005, -7366, -7723, -8076, -8423, -8765, -9102, -9434, -9760, -10080, -10394, -10702, -11003, -11297, -11585, -11866, -12140, -12406, -12665, -12916, -13160, -13395, -13623, -13842, -14053, -14256, -14449, -14635, -14811, -14978, -15137, -15286, -15426, -15557, -15679, -15791, -15893, -15986, -16069, -16143, -16207, -16261, -16305, -16340, -16364, -16379, -16384, -16379, -16364, -16340, -16305, -16261, -16207, -16143, -16069, -15986, -15893, -15791, -15679, -15557, -15426, -15286, -15137, -14978, -14811, -14635, -14449, -14256, -14053, -13842, -13623, -13395, -13160, -12916, -12665, -12406, -12140, -11866, -11585, -11297, -11003, -10702, -10394, -10080, -9760, -9434, -9102, -8765, -8423, -8076, -7723, -7366, -7005, -6639, -6270, -5897, -5520, -5139, -4756, -4370, -3981, -3590, -3196, -2801, -2404, -2006, -1606, -1205, -804, -402,)

# 16-entry presentation palette. Indices, not terminal escapes, are serialized.
PALETTE_NAMES = (
    "BLACK", "DEEP_BLUE", "SLATE", "MIST", "STONE_DARK", "STONE",
    "STONE_LIGHT", "WHITE", "EMBER_DARK", "EMBER", "EMBER_LIGHT",
    "GREEN_DARK", "GREEN", "CYAN_DARK", "CYAN", "AMBER",
)

GLYPH_SKY = ord(" ")
GLYPH_FLOOR_NEAR = ord(".")
GLYPH_FLOOR_FAR = ord(" ")
GLYPH_WALL_NEAR = ord("#")
GLYPH_WALL_MID = ord("X")
GLYPH_WALL_FAR = ord("+")
GLYPH_ENEMY = ord("M")
GLYPH_ENEMY_ATTACK = ord("!")
GLYPH_ENEMY_FLEE = ord(">")
GLYPH_ENEMY_PATROL = ord("m")


@dataclass(frozen=True)
class WorldPosition:
    x: int
    y: int
    z: int = 0


@dataclass(frozen=True)
class CommittedSnapshot:
    game_run_id: str
    logical_tick_index: int  # w
    snapshot_digest: str
    player_position: WorldPosition
    enemy_position: WorldPosition
    enemy_action: str
    enemy_blocked: bool = False


@dataclass(frozen=True)
class AsciiProjectorContractV1:
    projector_id: str = PROJECTOR_ID
    projector_version: str = PROJECTOR_VERSION
    coordinate_numeric_domain: str = "SIGNED_INT32_LATTICE"
    angular_numeric_domain: str = "UINT8_TURN_0_255"
    distance_numeric_domain: str = "UNSIGNED_Q8_8_CELL"
    width: int = 120
    height: int = 40
    cell_encoding: str = "3_BYTES:glyph_ascii_u8,fg_palette_u8,bg_palette_u8"
    glyph_encoding: str = "US_ASCII_0_127"
    color_encoding: str = "PALETTE_INDEX_U8_0_15"
    row_order: str = "TOP_TO_BOTTOM"
    column_order: str = "LEFT_TO_RIGHT"
    serialization_rule: str = "RAW_CELL_TRIPLES_NO_HEADER"

    def validate(self) -> None:
        if self.projector_id != PROJECTOR_ID:
            raise ValueError("PROJECTOR_ID_MISMATCH")
        if self.projector_version != PROJECTOR_VERSION:
            raise ValueError("PROJECTOR_VERSION_MISMATCH")
        if not (1 <= self.width <= 4096 and 1 <= self.height <= 4096):
            raise ValueError("INVALID_DIMENSIONS")
        exact = {
            "coordinate_numeric_domain": "SIGNED_INT32_LATTICE",
            "angular_numeric_domain": "UINT8_TURN_0_255",
            "distance_numeric_domain": "UNSIGNED_Q8_8_CELL",
            "cell_encoding": "3_BYTES:glyph_ascii_u8,fg_palette_u8,bg_palette_u8",
            "glyph_encoding": "US_ASCII_0_127",
            "color_encoding": "PALETTE_INDEX_U8_0_15",
            "row_order": "TOP_TO_BOTTOM",
            "column_order": "LEFT_TO_RIGHT",
            "serialization_rule": "RAW_CELL_TRIPLES_NO_HEADER",
        }
        for field, expected in exact.items():
            if getattr(self, field) != expected:
                raise ValueError("UNBOUND_OR_MISMATCHED_CONTRACT:" + field)


@dataclass(frozen=True)
class AsciiProjectionStateV1:
    projector_version: str
    width: int
    height: int
    heading: int
    pitch: int
    field_of_view: int
    max_distance: int  # Q8.8

    def validate_against(self, contract: AsciiProjectorContractV1) -> None:
        contract.validate()
        # §6.1.1 duplicated-field equality law
        if self.projector_version != contract.projector_version:
            raise ValueError("FAIL_CLOSED:PROJECTOR_VERSION_EQUALITY")
        if self.width != contract.width:
            raise ValueError("FAIL_CLOSED:WIDTH_EQUALITY")
        if self.height != contract.height:
            raise ValueError("FAIL_CLOSED:HEIGHT_EQUALITY")
        if not (0 <= self.heading < ANGLE_MODULUS):
            raise ValueError("FAIL_CLOSED:HEADING_DOMAIN")
        if not (-64 <= self.pitch <= 64):
            raise ValueError("FAIL_CLOSED:PITCH_DOMAIN")
        if not (8 <= self.field_of_view <= 120):
            raise ValueError("FAIL_CLOSED:FOV_DOMAIN")
        if not (DISTANCE_ONE <= self.max_distance <= 64 * DISTANCE_ONE):
            raise ValueError("FAIL_CLOSED:DISTANCE_DOMAIN")


@dataclass(frozen=True)
class AsciiFrameV1:
    game_run_id: str
    w: int
    snapshot_digest: str
    projection_state_digest: str
    deterministic_projection_buffer: bytes  # NONCANONICAL / PRESENTATION ONLY


@dataclass(frozen=True)
class RayHit:
    distance_q8: int
    kind: str  # OBSTRUCTION | BOUND


def cos_q14(angle: int) -> int:
    return SIN_Q14[(angle + 64) & 0xFF]


def sin_q14(angle: int) -> int:
    return SIN_Q14[angle & 0xFF]


def _floor_q8(value: int) -> int:
    return value // DISTANCE_ONE


def _inside_xy(x: int, y: int) -> bool:
    return ARENA_X_MIN <= x <= ARENA_X_MAX and ARENA_Y_MIN <= y <= ARENA_Y_MAX


def _obstructed(x: int, y: int) -> bool:
    return (x, y, GEN0_Z0) in OBSTRUCTIONS


def ray_hit(player: WorldPosition, angle: int, max_distance_q8: int) -> RayHit | None:
    """Presentation ray over authoritative arena bounds and obstruction set."""
    base_x = player.x << DISTANCE_FRAC_BITS
    base_y = player.y << DISTANCE_FRAC_BITS
    cx = cos_q14(angle)
    sy = sin_q14(angle)
    distance = RAY_STEP_Q8
    while distance <= max_distance_q8:
        rx = base_x + ((cx * distance) >> TRIG_FRAC_BITS)
        ry = base_y + ((sy * distance) >> TRIG_FRAC_BITS)
        gx, gy = _floor_q8(rx), _floor_q8(ry)
        if not _inside_xy(gx, gy):
            return RayHit(distance, "BOUND")
        if _obstructed(gx, gy):
            return RayHit(distance, "OBSTRUCTION")
        distance += RAY_STEP_Q8
    return None


def _projection_state_bytes(state: AsciiProjectionStateV1) -> bytes:
    version = state.projector_version.encode("ascii")
    if len(version) > 255:
        raise ValueError("PROJECTOR_VERSION_TOO_LONG")
    return (
        struct.pack(">B", len(version)) + version +
        struct.pack(">HHBbBH",
            state.width,
            state.height,
            state.heading,
            state.pitch,
            state.field_of_view,
            state.max_distance,
        )
    )


def projection_state_digest(state: AsciiProjectionStateV1) -> str:
    return hashlib.sha256(_projection_state_bytes(state)).hexdigest().upper()


def _cell(glyph: int, fg: int, bg: int) -> bytes:
    if not (0 <= glyph <= 127):
        raise ValueError("NON_ASCII_GLYPH")
    if not (0 <= fg < 16 and 0 <= bg < 16):
        raise ValueError("COLOR_INDEX_DOMAIN")
    return bytes((glyph, fg, bg))


def _wall_style(distance_q8: int, max_distance_q8: int, kind: str) -> tuple[int, int, int]:
    third = max_distance_q8 // 3
    if distance_q8 <= third:
        glyph, fg = GLYPH_WALL_NEAR, 6
    elif distance_q8 <= 2 * third:
        glyph, fg = GLYPH_WALL_MID, 5
    else:
        glyph, fg = GLYPH_WALL_FAR, 4
    if kind == "BOUND":
        fg = max(2, fg - 2)
    return glyph, fg, 0


def _los_clear(a: WorldPosition, b: WorldPosition) -> bool:
    """Integer Bresenham LOS against canonical obstruction cells only."""
    x0, y0, x1, y1 = a.x, a.y, b.x, b.y
    dx, dy = abs(x1-x0), abs(y1-y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy
    first = True
    while True:
        if not first and (x0, y0) != (x1, y1) and _obstructed(x0, y0):
            return False
        if (x0, y0) == (x1, y1):
            return True
        first = False
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x0 += sx
        if e2 < dx:
            err += dx
            y0 += sy


def _enemy_screen(snapshot: CommittedSnapshot, state: AsciiProjectionStateV1):
    if not _los_clear(snapshot.player_position, snapshot.enemy_position):
        return None
    dx = snapshot.enemy_position.x - snapshot.player_position.x
    dy = snapshot.enemy_position.y - snapshot.player_position.y
    if dx == 0 and dy == 0:
        forward_q14 = TRIG_ONE // 4
        lateral_q14 = 0
    else:
        c, s = cos_q14(state.heading), sin_q14(state.heading)
        forward_q14 = dx * c + dy * s
        lateral_q14 = -dx * s + dy * c
    if forward_q14 <= 0:
        return None
    half_fov = max(1, state.field_of_view // 2)
    sin_half = abs(sin_q14(half_fov))
    cos_half = max(1, abs(cos_q14(half_fov)))
    tan_half_q14 = max(1, (sin_half << TRIG_FRAC_BITS) // cos_half)
    focal_q14 = ((state.width // 2) << TRIG_FRAC_BITS) // tan_half_q14
    xoff = (lateral_q14 * focal_q14) // max(forward_q14, 1)
    sx = state.width // 2 + (xoff >> TRIG_FRAC_BITS)
    if not (0 <= sx < state.width):
        return None
    # Approximate forward distance in Q8.8 from Q14 lattice dot product.
    distance_q8 = max(1, (forward_q14 * DISTANCE_ONE) >> TRIG_FRAC_BITS)
    if distance_q8 > state.max_distance:
        return None
    sprite_h = max(1, min(state.height - 2, (state.height * 180) // distance_q8))
    horizon = state.height // 2 + state.pitch * state.height // 128
    top = max(0, horizon - sprite_h // 2)
    bottom = min(state.height, top + sprite_h)
    action = snapshot.enemy_action.upper()
    glyph = GLYPH_ENEMY
    if "ATTACK" in action:
        glyph = GLYPH_ENEMY_ATTACK
    elif "FLEE" in action:
        glyph = GLYPH_ENEMY_FLEE
    elif "PATROL" in action:
        glyph = GLYPH_ENEMY_PATROL
    fg = 10 if snapshot.enemy_blocked else 9
    return sx, top, bottom, distance_q8, glyph, fg


def render(
    snapshot: CommittedSnapshot,
    state: AsciiProjectionStateV1,
    contract: AsciiProjectorContractV1,
) -> AsciiFrameV1:
    """Pure projection. No canonical mutation and no worldline transition."""
    state.validate_against(contract)
    if snapshot.logical_tick_index < 0:
        raise ValueError("NEGATIVE_WORLDLINE")
    if snapshot.player_position.z != GEN0_Z0:
        raise ValueError("PLAYER_OUTSIDE_GEN0_Z0")
    if len(snapshot.snapshot_digest) != 64:
        raise ValueError("SNAPSHOT_DIGEST_REQUIRED")

    width, height = state.width, state.height
    horizon = height // 2 + state.pitch * height // 128
    buffer = bytearray(width * height * 3)
    depth = [state.max_distance + 1] * width

    def put(x: int, y: int, glyph: int, fg: int, bg: int) -> None:
        off = (y * width + x) * 3
        buffer[off:off+3] = _cell(glyph, fg, bg)

    # Sky/floor baseline.
    for y in range(height):
        for x in range(width):
            if y < horizon:
                put(x, y, GLYPH_SKY, 3 if y > horizon // 2 else 2, 1)
            else:
                # Sparse floor texture is a deterministic function of x,y,w.
                # w affects presentation at the selected committed worldline point;
                # it is not a spatial ray axis and does not affect geometry.
                near = ((x * 17 + y * 31 + snapshot.logical_tick_index * 7) & 7) == 0
                put(x, y, GLYPH_FLOOR_NEAR if near else GLYPH_FLOOR_FAR, 4, 0)

    # One ray per column.
    for x in range(width):
        # FOV uses same uint8-turn domain as heading.
        offset = ((2 * x - (width - 1)) * state.field_of_view) // max(2 * width, 1)
        angle = (state.heading + offset) & 0xFF
        hit = ray_hit(snapshot.player_position, angle, state.max_distance)
        if hit is None:
            continue
        depth[x] = hit.distance_q8
        # Perspective wall slice. Integer-only.
        wall_h = max(1, min(height, (height * 192) // max(hit.distance_q8, 1)))
        top = max(0, horizon - wall_h // 2)
        bottom = min(height, top + wall_h)
        glyph, fg, bg = _wall_style(hit.distance_q8, state.max_distance, hit.kind)
        for y in range(top, bottom):
            put(x, y, glyph, fg, bg)

    enemy = _enemy_screen(snapshot, state)
    if enemy is not None:
        sx, top, bottom, distance_q8, glyph, fg = enemy
        # Sprite draws only when it is in front of wall depth.
        radius = max(0, min(3, (bottom - top) // 5))
        for x in range(max(0, sx-radius), min(width, sx+radius+1)):
            if distance_q8 >= depth[x]:
                continue
            for y in range(top, bottom):
                put(x, y, glyph, fg, 0)

    return AsciiFrameV1(
        game_run_id=snapshot.game_run_id,
        w=snapshot.logical_tick_index,
        snapshot_digest=snapshot.snapshot_digest.upper(),
        projection_state_digest=projection_state_digest(state),
        deterministic_projection_buffer=bytes(buffer),
    )


def ansi_transport(frame: AsciiFrameV1, width: int, height: int) -> str:
    """Noncanonical terminal wrapper around deterministic projection bytes."""
    buf = frame.deterministic_projection_buffer
    if len(buf) != width * height * 3:
        raise ValueError("BUFFER_DIMENSION_MISMATCH")
    # 16-color ANSI mapping. Escape bytes are not in deterministic buffer.
    fg_codes = (30,34,90,37,90,37,97,97,31,91,93,32,92,36,96,33)
    bg_codes = (40,44,40,40,40,40,40,40,40,40,40,40,40,40,40,40)
    rows = []
    for y in range(height):
        out = []
        active = None
        for x in range(width):
            off = (y * width + x) * 3
            glyph, fg, bg = buf[off:off+3]
            pair = (fg, bg)
            if pair != active:
                out.append(f"\x1b[{fg_codes[fg]};{bg_codes[bg]}m")
                active = pair
            out.append(chr(glyph))
        out.append("\x1b[0m")
        rows.append("".join(out))
    return "\n".join(rows)


class PresentationSurfaceToggle:
    """Presentation-local GAME/CARRIER selector. Never mutates a snapshot."""
    def __init__(self) -> None:
        self.surface = "GAME"

    def toggle(self, snapshot: CommittedSnapshot) -> CommittedSnapshot:
        self.surface = "CARRIER" if self.surface == "GAME" else "GAME"
        return snapshot
