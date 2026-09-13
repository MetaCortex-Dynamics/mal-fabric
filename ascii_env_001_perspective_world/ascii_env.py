#!/usr/bin/env python3
"""ASCII-ENV-001 immersive perspective projector.

Projection only. This module never advances the worldline and never computes
gameplay successors. It renders a committed snapshot against the already-bound
Gen0 arena.
"""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
import json
import math
from typing import Iterable, Mapping, Sequence

Vec3 = tuple[int, int, int]
GLYPH_RAMP = " .,:;irsXA253hMHGS#9B&@"
WALL_RAMP = " .:-=+*#%@"
ENTITY_PATTERNS = {
    "PATROL": (" /\\ ", "/||\\", " /\\ "),
    "APPROACH": (" /\\ ", "<||>", " /\\ "),
    "CHASE": (" /\\ ", "<!!>", " /\\ "),
    "ATTACK": ("\\O/ ", " |>>", "/ \\ "),
    "FLEE": (" /\\ ", "<<| ", " /\\ "),
    "BLOCKED": (" !  ", "/|\\ ", "/ \\ "),
    "DEFAULT": (" o  ", "/|\\ ", "/ \\ "),
}


@dataclass(frozen=True)
class EnvironmentSpecV1:
    x_min: int = -10
    x_max: int = 10
    y_min: int = -6
    y_max: int = 6
    z_min: int = -2
    z_max: int = 2
    z0: int = 0
    obstructions: frozenset[Vec3] = frozenset({(2, -1, 0), (2, 0, 0), (2, 1, 0)})

    def inside_xy(self, x: float, y: float) -> bool:
        return self.x_min <= x <= self.x_max and self.y_min <= y <= self.y_max

    def canonical_dict(self) -> dict:
        return {
            "x": [self.x_min, self.x_max],
            "y": [self.y_min, self.y_max],
            "z": [self.z_min, self.z_max],
            "z0": self.z0,
            "obstructions": [list(p) for p in sorted(self.obstructions)],
            "admissibility_scope": "ALL_ENTITY_MOVEMENT",
        }

    def digest(self) -> str:
        raw = json.dumps(self.canonical_dict(), sort_keys=True, separators=(",", ":")).encode("utf-8")
        return sha256(raw).hexdigest().upper()


@dataclass(frozen=True)
class AsciiProjectionStateV1:
    width: int = 100
    height: int = 34
    heading: float = 0.0
    fov: float = math.radians(72.0)
    max_distance: float = 32.0

    def normalized(self) -> "AsciiProjectionStateV1":
        return AsciiProjectionStateV1(
            max(40, int(self.width)),
            max(18, int(self.height)),
            ((float(self.heading) + math.pi) % (2 * math.pi)) - math.pi,
            min(math.radians(110), max(math.radians(35), float(self.fov))),
            max(8.0, float(self.max_distance)),
        )

    def digest(self) -> str:
        p = self.normalized()
        raw = json.dumps({
            "width": p.width,
            "height": p.height,
            "heading_micro_rad": round(p.heading * 1_000_000),
            "fov_micro_rad": round(p.fov * 1_000_000),
            "max_distance_milli": round(p.max_distance * 1_000),
        }, sort_keys=True, separators=(",", ":")).encode("utf-8")
        return sha256(raw).hexdigest().upper()


@dataclass(frozen=True)
class EntityView:
    entity_id: str
    position: tuple[float, float, float]
    action: str = "DEFAULT"
    blocked: bool = False


@dataclass(frozen=True)
class CommittedView:
    game_run_id: str
    w: int
    snapshot_digest: str
    player: EntityView
    enemy: EntityView


@dataclass(frozen=True)
class RayHit:
    distance: float
    kind: str
    cell: tuple[int, int] | None
    side: int


@dataclass(frozen=True)
class PixelCell:
    char: str
    fg: tuple[int, int, int]
    bg: tuple[int, int, int]


class AsciiEnvironmentProjector:
    """Deterministic projector over committed state."""

    def __init__(self, environment: EnvironmentSpecV1 | None = None) -> None:
        self.environment = environment or EnvironmentSpecV1()

    @staticmethod
    def _entity(payload: Mapping, key: str) -> EntityView:
        value = payload[key]
        position = value.get("position", value.get("world_position"))
        if not isinstance(position, Sequence) or len(position) < 3:
            raise ValueError(f"{key.upper()}_POSITION_XYZ_REQUIRED")
        return EntityView(
            entity_id=str(value.get("entity_id", key)),
            position=(float(position[0]), float(position[1]), float(position[2])),
            action=str(value.get("action", value.get("mode", "DEFAULT"))).upper(),
            blocked=bool(value.get("blocked", False)),
        )

    @classmethod
    def committed_view(cls, payload: Mapping) -> CommittedView:
        snapshot = payload.get("snapshot", payload)
        if not isinstance(snapshot, Mapping):
            raise ValueError("COMMITTED_SNAPSHOT_REQUIRED")
        w = snapshot.get("w", snapshot.get("logical_tick_index"))
        if w is None:
            raise ValueError("WORLDLINE_W_REQUIRED")
        run_id = snapshot.get("game_run_id", payload.get("game_run_id", ""))
        digest = snapshot.get("snapshot_digest", payload.get("snapshot_digest", ""))
        if not digest:
            digest = sha256(json.dumps(snapshot, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")).hexdigest().upper()
        return CommittedView(
            game_run_id=str(run_id),
            w=int(w),
            snapshot_digest=str(digest),
            player=cls._entity(snapshot, "player"),
            enemy=cls._entity(snapshot, "enemy"),
        )

    def _cast(self, ox: float, oy: float, angle: float, max_distance: float) -> RayHit:
        dx, dy = math.cos(angle), math.sin(angle)
        step, distance, previous_cell = 0.035, 0.01, None
        while distance <= max_distance:
            x, y = ox + dx * distance, oy + dy * distance
            if not self.environment.inside_xy(x, y):
                return RayHit(distance, "BOUND", previous_cell, 0 if abs(dx) >= abs(dy) else 1)
            cx, cy = math.floor(x + 0.5), math.floor(y + 0.5)
            cell = (cx, cy)
            if (cx, cy, self.environment.z0) in self.environment.obstructions:
                side = 0 if previous_cell and previous_cell[0] != cx else 1
                return RayHit(distance, "OBSTRUCTION", cell, side)
            previous_cell = cell
            distance += step
        return RayHit(max_distance, "FOG", None, 0)

    @staticmethod
    def _lerp_rgb(a, b, t):
        t = max(0.0, min(1.0, t))
        return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

    @staticmethod
    def _shade(rgb, factor):
        return tuple(max(0, min(255, round(c * factor))) for c in rgb)

    @staticmethod
    def _glyph(value: float, ramp: str = GLYPH_RAMP) -> str:
        return ramp[round(max(0.0, min(1.0, value)) * (len(ramp) - 1))]

    def _base_pixel(self, row, col, p, distance, wall_top, wall_bottom, hit, w):
        horizon = p.height * 0.48
        fog_t = min(1.0, distance / p.max_distance)
        if wall_top <= row <= wall_bottom and hit.kind != "FOG":
            base, accent = ((141, 169, 163), (200, 219, 202)) if hit.kind == "OBSTRUCTION" else ((92, 116, 122), (155, 178, 180))
            side_factor = 0.82 if hit.side else 1.0
            color = self._shade(self._lerp_rgb(accent, base, fog_t), side_factor)
            return PixelCell(self._glyph((1.0 - fog_t) * side_factor, WALL_RAMP), color, (5, 10, 12))
        if row < horizon:
            t = row / max(1.0, horizon)
            haze = ((col * 17 + row * 31 + w * 13) % 29) / 28.0
            sky = self._lerp_rgb((24, 39, 48), (75, 101, 108), t)
            fog = self._lerp_rgb(sky, (95, 111, 112), 0.18 * fog_t)
            glyph = " " if haze < 0.72 else self._glyph(0.08 + 0.10 * haze, " .·")
            return PixelCell(glyph, fog, (4, 8, 11))
        floor_t = (row - horizon) / max(1.0, p.height - horizon)
        depth_hint = max(0.0, 1.0 - floor_t)
        mist = ((row * 19 + col * 7 + w * 5) % 37) / 36.0
        floor_rgb = self._lerp_rgb((36, 51, 45), (10, 16, 15), floor_t)
        value = 0.10 + 0.28 * depth_hint + (0.10 if mist > 0.87 else 0.0)
        return PixelCell(self._glyph(value, " .,:;·"), floor_rgb, (3, 7, 7))

    @staticmethod
    def _angle_delta(target, origin):
        return math.atan2(math.sin(target - origin), math.cos(target - origin))

    def _overlay_enemy(self, grid, depth, view, p):
        px, py, pz = view.player.position
        ex, ey, ez = view.enemy.position
        dx, dy = ex - px, ey - py
        planar_distance = max(0.05, math.hypot(dx, dy))
        delta = self._angle_delta(math.atan2(dy, dx), p.heading)
        if abs(delta) > p.fov * 0.56:
            return
        center_col = round((delta / p.fov + 0.5) * (p.width - 1))
        if center_col < 0 or center_col >= p.width or planar_distance >= depth[center_col] - 0.06:
            return
        sprite_scale = min(7.0, max(1.0, p.height * 0.52 / planar_distance))
        pattern = ENTITY_PATTERNS.get(view.enemy.action, ENTITY_PATTERNS["DEFAULT"])
        sprite_h, sprite_w = len(pattern), max(len(line) for line in pattern)
        scaled_h = max(sprite_h, round(sprite_h * sprite_scale / 2.2))
        scaled_w = max(sprite_w, round(sprite_w * sprite_scale / 2.8))
        center_row = round(p.height * 0.48 + (pz - ez) * sprite_scale * 0.15)
        top, left = center_row - scaled_h // 2, center_col - scaled_w // 2
        if view.enemy.action in {"APPROACH", "CHASE", "ATTACK"}:
            color = (255, 105, 82)
        elif view.enemy.action == "FLEE":
            color = (255, 189, 87)
        elif view.enemy.blocked or view.enemy.action == "BLOCKED":
            color = (224, 110, 110)
        else:
            color = (192, 225, 171)
        for sy in range(scaled_h):
            src_y = min(sprite_h - 1, int(sy * sprite_h / scaled_h))
            line = pattern[src_y]
            for sx in range(scaled_w):
                src_x = min(len(line) - 1, int(sx * len(line) / scaled_w))
                ch = line[src_x]
                if ch == " ":
                    continue
                row, col = top + sy, left + sx
                if 0 <= row < p.height and 0 <= col < p.width and planar_distance < depth[col] - 0.06:
                    grid[row][col] = PixelCell(ch, color, (4, 8, 9))

    def render_cells(self, payload: Mapping, projection: AsciiProjectionStateV1 | None = None):
        view = self.committed_view(payload)
        p = (projection or AsciiProjectionStateV1()).normalized()
        px, py, _ = view.player.position
        depth, hits, walls = [], [], []
        horizon = p.height * 0.48
        for col in range(p.width):
            camera_x = (col + 0.5) / p.width - 0.5
            angle = p.heading + camera_x * p.fov
            hit = self._cast(px, py, angle, p.max_distance)
            corrected = max(0.08, hit.distance * math.cos(angle - p.heading))
            wall_world_height = 4.4 if hit.kind == "BOUND" else 3.5
            wall_height = min(p.height * 1.8, p.height * wall_world_height / corrected * 0.46)
            depth.append(corrected)
            hits.append(hit)
            walls.append((round(horizon - wall_height / 2), round(horizon + wall_height / 2)))
        grid = []
        for row in range(p.height):
            line = []
            for col in range(p.width):
                top, bottom = walls[col]
                line.append(self._base_pixel(row, col, p, depth[col], top, bottom, hits[col], view.w))
            grid.append(line)
        self._overlay_enemy(grid, depth, view, p)
        return view, p, grid

    @staticmethod
    def canonical_buffer(grid: Iterable[Iterable[PixelCell]]) -> str:
        return "\n".join("".join(f"{c.char}|{c.fg[0]:02X}{c.fg[1]:02X}{c.fg[2]:02X};" for c in row) for row in grid)

    @staticmethod
    def ansi(grid: Iterable[Iterable[PixelCell]]) -> str:
        rows = []
        for row in grid:
            parts, last_fg, last_bg = [], None, None
            for cell in row:
                if cell.fg != last_fg:
                    parts.append(f"\x1b[38;2;{cell.fg[0]};{cell.fg[1]};{cell.fg[2]}m")
                    last_fg = cell.fg
                if cell.bg != last_bg:
                    parts.append(f"\x1b[48;2;{cell.bg[0]};{cell.bg[1]};{cell.bg[2]}m")
                    last_bg = cell.bg
                parts.append(cell.char)
            parts.append("\x1b[0m")
            rows.append("".join(parts))
        return "\n".join(rows)

    def frame_digest(self, payload: Mapping, projection: AsciiProjectionStateV1 | None = None) -> str:
        view, p, grid = self.render_cells(payload, projection)
        record = {
            "game_run_id": view.game_run_id,
            "w": view.w,
            "snapshot_digest": view.snapshot_digest,
            "projection_state_digest": p.digest(),
            "environment_digest": self.environment.digest(),
            "buffer": self.canonical_buffer(grid),
        }
        return sha256(json.dumps(record, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest().upper()

    def render_ansi(self, payload: Mapping, projection: AsciiProjectionStateV1 | None = None, *, with_hud: bool = True) -> str:
        view, _, grid = self.render_cells(payload, projection)
        body = self.ansi(grid)
        if not with_hud:
            return body
        hud = f"\x1b[38;2;130;210;190mRUN {view.game_run_id or '—'}  W {view.w}  ENEMY {view.enemy.action}  SNAP {view.snapshot_digest[:16]}\x1b[0m"
        return body + "\n" + hud


def heading_for_action(action: str, current_heading: float) -> float:
    """Presentation-only heading update; never moves an entity."""
    return {
        "MOVE_E": 0.0,
        "MOVE_N": math.pi / 2,
        "MOVE_W": math.pi,
        "MOVE_S": -math.pi / 2,
    }.get(str(action).upper(), current_heading)
