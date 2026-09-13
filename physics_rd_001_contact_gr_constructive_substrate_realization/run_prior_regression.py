#!/usr/bin/env python3
"""Replay the immutable v0.9.0 floor without rewriting predecessor evidence."""

from __future__ import annotations

import argparse
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def run(command: list[str], cwd: Path) -> str:
    result = subprocess.run(command, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if result.returncode != 0:
        print(result.stdout, end="")
        raise SystemExit(result.returncode)
    return result.stdout


def compare_json_tree(actual: Path, expected: Path) -> tuple[int, list[str]]:
    expected_files = tuple(sorted(path for path in expected.rglob("*.json") if path.is_file()))
    mismatches = []
    for source in expected_files:
        relative = source.relative_to(expected)
        generated = actual / relative
        if not generated.is_file() or generated.read_bytes() != source.read_bytes():
            mismatches.append(relative.as_posix())
    extra = tuple(sorted(path.relative_to(actual).as_posix() for path in actual.rglob("*.json") if not (expected / path.relative_to(actual)).is_file()))
    mismatches.extend(f"EXTRA:{item}" for item in extra)
    return len(expected_files), mismatches


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=HERE / "prior-regression-summary.json")
    args = parser.parse_args()
    suites = [
        ("V3.1", ROOT / "static_fabric_v0_1_0", "run_conformance.py", 25, 26),
        ("V3.2", ROOT / "admissibility_v0_2_0", "run_conformance.py", 62, 63),
        ("V3.3", ROOT / "execution_v0_3_0", "run_conformance.py", 70, 71),
        ("DEMO-002", ROOT / "demo_002_vibe_proposer", "run_conformance.py", 24, 25),
        ("DEMO-003", ROOT / "demo_003_game_loop_binding", "run_conformance.py", 28, 29),
        ("DEMO-004", ROOT / "demo_004_dual_surface_render_binding", "run_conformance.py", 26, 27),
        ("VIS-R&D-001", ROOT / "vis_rd_001_gaussian_splat_render_primitive", "run_conformance.py", 24, 25),
    ]
    reports: list[dict[str, Any]] = []
    evidence_total = 0
    conformance_total = 0
    with tempfile.TemporaryDirectory(prefix="physics-rd-001-prior-") as temporary_name:
        temporary = Path(temporary_name)
        for name, root, script, conformance_count, evidence_count in suites:
            output = temporary / name.replace("/", "-") / "evidence"
            summary = temporary / name.replace("/", "-") / "acceptance-summary.json"
            command = [sys.executable, script, "--output", str(output)]
            if name in {"DEMO-003", "DEMO-004", "VIS-R&D-001"}:
                command.extend(["--summary", str(summary)])
            if name == "DEMO-003":
                command.extend(["--trace", str(temporary / "demo003-trace.json")])
            run(command, root)
            count, mismatches = compare_json_tree(output, root / "evidence")
            if count != evidence_count or mismatches:
                raise RuntimeError(f"{name}_EVIDENCE_MISMATCH:{count}:{mismatches}")
            reports.append({"conformance": f"{conformance_count}/{conformance_count}", "evidence": f"{count}/{evidence_count} BYTE_IDENTICAL", "suite": name})
            evidence_total += evidence_count
            conformance_total += conformance_count

        demo1_root = ROOT / "demo_001_visible_fabric"
        demo1_output = temporary / "demo001.json"
        run([sys.executable, "run_acceptance.py", "--json", str(demo1_output)], demo1_root)
        demo1_expected = demo1_root / "acceptance-summary.json"
        if demo1_output.read_bytes() != demo1_expected.read_bytes():
            raise RuntimeError("DEMO_001_EVIDENCE_MISMATCH")
        reports.append({"conformance": "18/18", "evidence": "1/1 BYTE_IDENTICAL", "suite": "DEMO-001"})
        evidence_total += 1
        conformance_total += 18

        showcase_root = ROOT / "showcase_001_mountain_capture"
        code = "import run_acceptance as r; x=r.evaluate(); print(sum(i['verdict']=='PASS' for i in x), len(x))"
        showcase_output = run([sys.executable, "-c", code], showcase_root).strip()
        if showcase_output != "22 22":
            raise RuntimeError(f"SHOWCASE_001_REGRESSION_FAILURE:{showcase_output}")
        reports.append({"acceptance": "22/22", "evidence_class": "PRODUCT_EVIDENCE", "suite": "SHOWCASE-001"})
        conformance_total += 22

    if conformance_total != 299 or evidence_total != 267:
        raise RuntimeError(f"PRIOR_CENSUS_FAILURE:{conformance_total}:{evidence_total}")
    summary = {
        "baseline": "mal-fabric v0.9.0",
        "evidence": "267/267 BYTE_IDENTICAL",
        "prior_conformance": "299/299 UNCHANGED",
        "showcase_001": "22/22",
        "suites": reports,
        "version_doi": "10.5281/zenodo.22729949",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    write_json(args.output, summary)
    print(json.dumps(summary, indent=2, sort_keys=True))
    print(f"PRIOR_REGRESSION_SUMMARY_SHA256 := {file_sha256(args.output)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
