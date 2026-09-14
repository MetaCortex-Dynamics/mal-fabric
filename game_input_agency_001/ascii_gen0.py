#!/usr/bin/env python3
"""Interactive terminal host for the projection-only ASCII Gen0 surface."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import sys
from typing import Iterator

from agency_kernel import (
    AgencyGameLoopEngine,
    GameTickInputV1,
    MOVE_E,
    MOVE_N,
    MOVE_S,
    MOVE_W,
    PLAYER_ACTIONS,
    STAY,
)
from ascii_projection import AsciiProjectionController


KEY_ACTIONS = {
    "w": MOVE_N,
    "a": MOVE_W,
    "s": MOVE_S,
    "d": MOVE_E,
}


def clear_and_draw(buffer: str) -> None:
    # ANSI transport is deliberately outside canonical AsciiFrame identity.
    sys.stdout.write("\x1b[2J\x1b[H")
    sys.stdout.write(buffer)
    sys.stdout.flush()


def read_key() -> str:
    if os.name == "nt":
        import msvcrt

        key = msvcrt.getwch()
        if key in ("\x00", "\xe0"):
            return {"H": "w", "P": "s", "K": "a", "M": "d"}.get(msvcrt.getwch(), "")
        return key.lower()

    import termios
    import tty

    descriptor = sys.stdin.fileno()
    previous = termios.tcgetattr(descriptor)
    try:
        tty.setraw(descriptor)
        key = sys.stdin.read(1)
        if key == "\x1b":
            suffix = sys.stdin.read(2)
            return {"[A": "w", "[B": "s", "[D": "a", "[C": "d"}.get(suffix, "")
        return key.lower()
    finally:
        termios.tcsetattr(descriptor, termios.TCSADRAIN, previous)


def scripted_tokens(value: str) -> Iterator[str]:
    names = {action: action for action in PLAYER_ACTIONS}
    names.update({key.upper(): action for key, action in KEY_ACTIONS.items()})
    names["C"] = "C"
    for raw in value.split(","):
        token = raw.strip().upper()
        if token not in names:
            raise ValueError(f"UNKNOWN_SCRIPT_TOKEN:{token}")
        yield names[token]


def run_script(value: str) -> int:
    engine = AgencyGameLoopEngine()
    projector = AsciiProjectionController()
    frame = projector.project(engine.snapshot())
    for token in scripted_tokens(value):
        if token == "C":
            frame = projector.toggle(engine.snapshot())
        else:
            frame = projector.project(engine.advance(GameTickInputV1(engine.state.w, token)))
    sys.stdout.write(frame.canonical_glyph_buffer)
    return 0


def run_interactive() -> int:
    engine = AgencyGameLoopEngine()
    projector = AsciiProjectionController()
    frame = projector.project(engine.snapshot())
    clear_and_draw(frame.canonical_glyph_buffer)
    while True:
        key = read_key()
        if key == "q":
            break
        if key == "c":
            frame = projector.toggle(engine.snapshot())
        elif key in KEY_ACTIONS:
            action = KEY_ACTIONS[key]
            snapshot = engine.advance(GameTickInputV1(engine.state.w, action))
            frame = projector.project(snapshot)
        else:
            continue
        clear_and_draw(frame.canonical_glyph_buffer)
    sys.stdout.write("\x1b[2J\x1b[H")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="ASCII Gen0 reference projection")
    parser.add_argument(
        "--script",
        help="comma-separated deterministic input sequence (W,A,S,D,STAY,C or canonical action names)",
    )
    args = parser.parse_args()
    return run_script(args.script) if args.script is not None else run_interactive()


if __name__ == "__main__":
    raise SystemExit(main())
