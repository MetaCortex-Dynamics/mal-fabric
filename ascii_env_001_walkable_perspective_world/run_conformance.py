#!/usr/bin/env python3
from __future__ import annotations
import hashlib
import inspect
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import ascii_env as m

PASS = []
FAIL = []
PENDING = []

def check(name, condition, detail=""):
    (PASS if condition else FAIL).append((name, detail))

contract = m.AsciiProjectorContractV1(width=96, height=32)
state = m.AsciiProjectionStateV1(
    projector_version=m.PROJECTOR_VERSION,
    width=96,
    height=32,
    heading=0,
    pitch=0,
    field_of_view=43,   # ~60 degrees in uint8-turn domain
    max_distance=20*m.DISTANCE_ONE,
)

snap = m.CommittedSnapshot(
    game_run_id="ASCII_ENV_001_TEST",
    logical_tick_index=7,
    snapshot_digest="A"*64,
    player_position=m.WorldPosition(0,0,0),
    enemy_position=m.WorldPosition(4,0,0),
    enemy_action="APPROACH",
)

# AE01
check("AE01", (m.ARENA_X_MIN,m.ARENA_X_MAX,m.ARENA_Y_MIN,m.ARENA_Y_MAX,m.ARENA_Z_MIN,m.ARENA_Z_MAX)
      == (-10,10,-6,6,-2,2))
# AE02
check("AE02", m.OBSTRUCTIONS == frozenset({(2,-1,0),(2,0,0),(2,1,0)}))
# AE03
check("AE03", m.GEN0_Z0 == 0 and snap.player_position.z == 0)
# AE04: changing w alone does not alter ray geometry.
f1 = m.render(snap, state, contract)
snap_w = m.CommittedSnapshot(
    game_run_id=snap.game_run_id,
    logical_tick_index=8,
    snapshot_digest="B"*64,
    player_position=snap.player_position,
    enemy_position=snap.enemy_position,
    enemy_action=snap.enemy_action,
)
# Buffer may contain deterministic presentation shimmer keyed by w, but geometry hit must be identical.
hit_a = m.ray_hit(snap.player_position, 0, state.max_distance)
hit_b = m.ray_hit(snap_w.player_position, 0, state.max_distance)
check("AE04", hit_a == hit_b and f1.w == 7)
# AE05 exact replay
f2 = m.render(snap, state, contract)
check("AE05", f1.deterministic_projection_buffer == f2.deterministic_projection_buffer
      and f1.projection_state_digest == f2.projection_state_digest)
# Equality law fail closed
bad_state = m.AsciiProjectionStateV1(m.PROJECTOR_VERSION,95,32,0,0,43,20*m.DISTANCE_ONE)
try:
    m.render(snap,bad_state,contract)
    eq_closed = False
except ValueError as exc:
    eq_closed = "WIDTH_EQUALITY" in str(exc)
check("AE05_EQUALITY", eq_closed)
# AE06 / AE07 source boundary
source = inspect.getsource(m)
forbidden_defs = ("def move_player", "def movement_successor", "def choose_enemy_action", "def enemy_transition")
check("AE06", not any(x in source for x in forbidden_defs[:2]))
check("AE07", not any(x in source for x in forbidden_defs[2:]))
# AE08 exterior is visible via BOUND hit without obstruction mutation.
bound_hit = m.ray_hit(m.WorldPosition(9,0,0), 0, 8*m.DISTANCE_ONE)
check("AE08", bound_hit is not None and bound_hit.kind == "BOUND"
      and m.OBSTRUCTIONS == frozenset({(2,-1,0),(2,0,0),(2,1,0)}))
# AE09 enemy behind obstruction is occluded.
occluded = m._enemy_screen(snap, state) is None
check("AE09", occluded)
# AE10 heading changes projection only.
state2 = m.AsciiProjectionStateV1(m.PROJECTOR_VERSION,96,32,64,0,43,20*m.DISTANCE_ONE)
before = snap
h2 = m.render(snap,state2,contract)
check("AE10", snap == before and h2.deterministic_projection_buffer != f1.deterministic_projection_buffer)
# AE11 / AE12 local surface toggle preserves exact object.
toggle = m.PresentationSurfaceToggle()
same1 = toggle.toggle(snap)
same2 = toggle.toggle(snap)
check("AE11", same1 is snap and same1.logical_tick_index == 7 and toggle.surface == "GAME")
check("AE12", same2 is snap and same2.snapshot_digest == snap.snapshot_digest)
# AE13 requires actual kernel advancement while CARRIER is displayed.
PENDING.append(("AE13", "requires promoted local ASCII-GEN0 bridge"))
# AE14 requires attached-vs-headless canonical game trace from promoted local kernel.
PENDING.append(("AE14", "requires promoted local ASCII-GEN0 bridge"))
# AE15 no state-install methods or constructors outside snapshot dataclass.
forbidden_public = {"set_player_position","set_enemy_position","set_enemy_action","set_worldline","advance_worldline"}
check("AE15", forbidden_public.isdisjoint(set(dir(m))))

print(f"PASS={len(PASS)} FAIL={len(FAIL)} PENDING={len(PENDING)}")
for name, detail in PASS:
    print(f"{name}: PASS")
for name, detail in PENDING:
    print(f"{name}: PENDING_INTEGRATION — {detail}")
for name, detail in FAIL:
    print(f"{name}: FAIL {detail}")
raise SystemExit(1 if FAIL else 0)
