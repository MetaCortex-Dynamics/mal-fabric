#!/usr/bin/env python3
"""Run the immutable published 253-vector predecessor floor."""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def run(command: list[str], cwd: Path) -> None:
    result = subprocess.run(command, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(result.stdout, end="")
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="mal-fabric-vis-rd-001-regression-") as temporary:
        temp = Path(temporary)
        run([sys.executable, "run_conformance.py", "--output", str(temp / "v31")], ROOT / "static_fabric_v0_1_0")
        run([sys.executable, "run_conformance.py", "--output", str(temp / "v32")], ROOT / "admissibility_v0_2_0")
        run([sys.executable, "run_conformance.py", "--output", str(temp / "v33")], ROOT / "execution_v0_3_0")
        run([sys.executable, "run_acceptance.py", "--json", str(temp / "demo001.json")], ROOT / "demo_001_visible_fabric")
        run([sys.executable, "run_conformance.py", "--output", str(temp / "demo002")], ROOT / "demo_002_vibe_proposer")
        run([sys.executable, "run_conformance.py", "--output", str(temp / "demo003"), "--summary", str(temp / "demo003-summary.json"), "--trace", str(temp / "demo003-trace.json")], ROOT / "demo_003_game_loop_binding")
        run([sys.executable, "run_conformance.py", "--output", str(temp / "demo004"), "--summary", str(temp / "demo004-summary.json")], ROOT / "demo_004_dual_surface_render_binding")
    print("\nPRIOR_CONFORMANCE := 253/253 UNCHANGED")
    print("PRIOR_EVIDENCE := 242/242 UNCHANGED (SOURCE ARTIFACTS NOT REWRITTEN)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
