#!/usr/bin/env python3
"""Minimal full-screen ANSI surface runner for ASCII-ENV-001.

Requires a completed local adapter module. GAME projection only; existing promoted
ASCII-GEN0 CARRIER surface remains authoritative for the CARRIER presentation.
"""
from __future__ import annotations
import importlib
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import ascii_env as p

MODULE = os.environ.get("ASCII_GEN0_ADAPTER_MODULE", "").strip()
if not MODULE:
    raise SystemExit("ASCII_GEN0_ADAPTER_MODULE_REQUIRED")
adapter = importlib.import_module(MODULE).create_adapter()

contract = p.AsciiProjectorContractV1(width=96, height=32)
state = p.AsciiProjectionStateV1(p.PROJECTOR_VERSION,96,32,0,0,43,20*p.DISTANCE_ONE)

def show(snapshot):
    frame = p.render(snapshot, state, contract)
    sys.stdout.write("\x1b[2J\x1b[H")
    sys.stdout.write(p.ansi_transport(frame, state.width, state.height))
    sys.stdout.write(f"\n\x1b[0m w={frame.w}  snapshot={frame.snapshot_digest[:16]}  [WASD move | Q quit]\n")
    sys.stdout.flush()

adapter.reset()
snapshot = adapter.snapshot()
show(snapshot)

# Portable line-mode fallback. Integration may replace with the existing raw-key loop.
mapping = {"w":"MOVE_N","s":"MOVE_S","a":"MOVE_W","d":"MOVE_E",".":"STAY"}
while True:
    value = input("> ").strip().lower()
    if value == "q":
        break
    if value not in mapping:
        continue
    snapshot = adapter.submit_player_action(mapping[value])
    show(snapshot)
