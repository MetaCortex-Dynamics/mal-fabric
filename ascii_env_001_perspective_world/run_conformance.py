#!/usr/bin/env python3
"""Conformance for ASCII-ENV-001."""

from __future__ import annotations

import inspect
import math

from ascii_env import AsciiEnvironmentProjector, AsciiProjectionStateV1, EnvironmentSpecV1

ENV = EnvironmentSpecV1()
PROJECTOR = AsciiEnvironmentProjector(ENV)
P = AsciiProjectionStateV1(width=80, height=28, heading=0.0)

BASE = {
    "snapshot": {
        "game_run_id": "test",
        "logical_tick_index": 7,
        "snapshot_digest": "ABCDEF",
        "player": {"entity_id": "player", "position": [-5, 0, 0], "action": "MOVE_E"},
        "enemy": {"entity_id": "enemy_01", "position": [5, 0, 0], "action": "APPROACH"},
    }
}


def check(condition, label):
    if not condition:
        raise AssertionError(label)
    print(f"{label}: PASS")


def main():
    check((ENV.x_min, ENV.x_max, ENV.y_min, ENV.y_max) == (-10, 10, -6, 6), "AE01")
    check(ENV.obstructions == frozenset({(2,-1,0),(2,0,0),(2,1,0)}), "AE02")
    check((ENV.z_min, ENV.z_max, ENV.z0) == (-2, 2, 0), "AE03")

    view = PROJECTOR.committed_view(BASE)
    check(view.w == 7 and view.player.position[2] == 0, "AE04")

    a = PROJECTOR.frame_digest(BASE, P)
    b = PROJECTOR.frame_digest(BASE, P)
    check(a == b, "AE05")

    source = inspect.getsource(AsciiEnvironmentProjector)
    forbidden_movement = ("submit_player_action", "game_apply", "STEP_FABRIC")
    check(not any(term in source for term in forbidden_movement), "AE06")

    forbidden_behavior = ("player_near", "enemy_health", "detect_threshold")
    check(not any(term in source for term in forbidden_behavior), "AE07")

    hit = PROJECTOR._cast(-9.5, 0, math.pi, P.max_distance)
    check(hit.kind == "BOUND" and (-10, 0, 0) not in ENV.obstructions, "AE08")

    wall_hit = PROJECTOR._cast(-3, 0, 0, P.max_distance)
    check(wall_hit.kind == "OBSTRUCTION" and wall_hit.distance < 8.0, "AE09")

    rotated = AsciiProjectionStateV1(width=80, height=28, heading=math.pi / 2)
    check(PROJECTOR.frame_digest(BASE, P) != PROJECTOR.frame_digest(BASE, rotated)
          and BASE["snapshot"]["logical_tick_index"] == 7, "AE10")

    print("ASCII_ENV_001 := 10/10 PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
