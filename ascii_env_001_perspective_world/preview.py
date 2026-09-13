#!/usr/bin/env python3
"""Nonsemantic visual preview for ASCII-ENV-001."""

from __future__ import annotations

import math
from ascii_env import AsciiEnvironmentProjector, AsciiProjectionStateV1

SAMPLE = {
    "snapshot": {
        "game_run_id": "ASCII-ENV-001-PREVIEW",
        "logical_tick_index": 12,
        "snapshot_digest": "PREVIEW_ONLY_NOT_RUNTIME_EVIDENCE",
        "player": {
            "entity_id": "player",
            "position": [-6, 0, 0],
            "action": "MOVE_E",
            "blocked": False,
        },
        "enemy": {
            "entity_id": "enemy_01",
            "position": [0, 0, 0],
            "action": "APPROACH",
            "blocked": False,
        },
    }
}

projector = AsciiEnvironmentProjector()
projection = AsciiProjectionStateV1(width=112, height=36, heading=0.0, fov=math.radians(72))
print("\x1b[2J\x1b[H" + projector.render_ansi(SAMPLE, projection))
print("\nPREVIEW_ONLY := TRUE")
print("RUNTIME_EVIDENCE := NONE")
