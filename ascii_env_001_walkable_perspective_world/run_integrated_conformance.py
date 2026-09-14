#!/usr/bin/env python3
"""Integrated ASCII-ENV-001 conformance against promoted local ASCII-GEN0.

Usage:
  set ASCII_GEN0_ADAPTER_MODULE=my_ascii_env_adapter
  python run_integrated_conformance.py

Required adapter module:
  create_adapter() -> object with:
    reset()
    snapshot() -> ascii_env.CommittedSnapshot
    submit_player_action(action) -> ascii_env.CommittedSnapshot
    canonical_trace_digest() -> str
"""
from __future__ import annotations

import importlib
import os
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import ascii_env as p

MODULE = os.environ.get("ASCII_GEN0_ADAPTER_MODULE", "").strip()
if not MODULE:
    raise SystemExit("ASCII_GEN0_ADAPTER_MODULE_REQUIRED")

adapter_module = importlib.import_module(MODULE)
factory = getattr(adapter_module, "create_adapter", None)
if not callable(factory):
    raise SystemExit("create_adapter() REQUIRED")
adapter = factory()

for name in ("reset", "snapshot", "submit_player_action", "canonical_trace_digest"):
    if not callable(getattr(adapter, name, None)):
        raise SystemExit(f"ADAPTER_METHOD_REQUIRED:{name}")

contract = p.AsciiProjectorContractV1(width=96, height=32)
state = p.AsciiProjectionStateV1(
    projector_version=p.PROJECTOR_VERSION,
    width=96,
    height=32,
    heading=0,
    pitch=0,
    field_of_view=43,
    max_distance=20*p.DISTANCE_ONE,
)

def validate_snapshot(s):
    if not isinstance(s, p.CommittedSnapshot):
        raise AssertionError("ADAPTER_SNAPSHOT_TYPE")
    if s.logical_tick_index < 0:
        raise AssertionError("NEGATIVE_W")
    if s.player_position.z != p.GEN0_Z0:
        raise AssertionError("PLAYER_Z0_VIOLATION")
    return s

# AE13 — kernel advances while CARRIER is displayed; GAME returns at newer w.
adapter.reset()
s0 = validate_snapshot(adapter.snapshot())
toggle = p.PresentationSurfaceToggle()
assert toggle.toggle(s0) is s0
assert toggle.surface == "CARRIER"
s1 = validate_snapshot(adapter.submit_player_action("STAY"))
s2 = validate_snapshot(adapter.submit_player_action("STAY"))
assert s1.logical_tick_index == s0.logical_tick_index + 1, (s0.logical_tick_index, s1.logical_tick_index)
assert s2.logical_tick_index == s1.logical_tick_index + 1, (s1.logical_tick_index, s2.logical_tick_index)
assert toggle.toggle(s2) is s2
assert toggle.surface == "GAME"
f2 = p.render(s2, state, contract)
assert f2.w == s2.logical_tick_index
print("AE13: PASS")

# AE14 — same canonical action sequence, attached projector vs headless, identical kernel trace.
sequence = ("MOVE_N", "MOVE_E", "STAY", "MOVE_S", "MOVE_W", "STAY")

adapter.reset()
for action in sequence:
    validate_snapshot(adapter.submit_player_action(action))
headless_digest = str(adapter.canonical_trace_digest())

adapter.reset()
s = validate_snapshot(adapter.snapshot())
p.render(s, state, contract)
for action in sequence:
    s = validate_snapshot(adapter.submit_player_action(action))
    p.render(s, state, contract)
attached_digest = str(adapter.canonical_trace_digest())

if headless_digest != attached_digest:
    raise AssertionError(f"AE14_TRACE_MISMATCH:{headless_digest}:{attached_digest}")
print("AE14: PASS")
print("HEADLESS_TRACE_DIGEST:", headless_digest)
print("ATTACHED_TRACE_DIGEST:", attached_digest)

# Integration replay — two identical attached runs must also agree.
def attached_run():
    adapter.reset()
    s = validate_snapshot(adapter.snapshot())
    frame_digests = []
    f = p.render(s, state, contract)
    import hashlib
    frame_digests.append(hashlib.sha256(f.deterministic_projection_buffer).hexdigest().upper())
    for action in sequence:
        s = validate_snapshot(adapter.submit_player_action(action))
        f = p.render(s, state, contract)
        frame_digests.append(hashlib.sha256(f.deterministic_projection_buffer).hexdigest().upper())
    return str(adapter.canonical_trace_digest()), tuple(frame_digests)

r1 = attached_run()
r2 = attached_run()
if r1 != r2:
    raise AssertionError("INTEGRATED_REPLAY_MISMATCH")
print("INTEGRATED_REPLAY: PASS")
print("ASCII_ENV_001_INTEGRATED := PASS")
