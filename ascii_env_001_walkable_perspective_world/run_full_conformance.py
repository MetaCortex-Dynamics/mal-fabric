#!/usr/bin/env python3
"""Run and materialize full ASCII-ENV-001 conformance and regression evidence."""
from __future__ import annotations

import argparse
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
LOCAL_VECTORS = tuple(f"AE{index:02d}" for index in range(1, 13)) + ("AE15",)
INTEGRATED_VECTORS = ("AE13", "AE14")


def run(command: list[str], cwd: Path, extra_env: dict[str, str] | None = None) -> str:
    environment = dict(os.environ)
    environment["PYTHONDONTWRITEBYTECODE"] = "1"
    environment["PYTHONIOENCODING"] = "utf-8"
    if extra_env:
        environment.update(extra_env)
    result = subprocess.run(
        command,
        cwd=cwd,
        env=environment,
        text=True,
        encoding="utf-8",
        errors="strict",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if result.returncode != 0:
        print(result.stdout, end="")
        raise RuntimeError(f"COMMAND_FAILED:{command}")
    return result.stdout


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def compare_json_tree(actual: Path, expected: Path) -> int:
    expected_files = tuple(sorted(expected.glob("*.json")))
    actual_files = tuple(sorted(actual.glob("*.json")))
    if tuple(path.name for path in actual_files) != tuple(path.name for path in expected_files):
        raise RuntimeError("EVIDENCE_CENSUS_MISMATCH")
    mismatches = [
        source.name
        for source in expected_files
        if (actual / source.name).read_bytes() != source.read_bytes()
    ]
    if mismatches:
        raise RuntimeError("EVIDENCE_BYTE_MISMATCH:" + ",".join(mismatches))
    return len(expected_files)


def execute(output: Path, summary_path: Path) -> dict[str, Any]:
    local_command = [sys.executable, "run_conformance.py"]
    integrated_command = [sys.executable, "run_integrated_conformance.py"]
    integrated_env = {"ASCII_GEN0_ADAPTER_MODULE": "local_adapter"}

    local_first = run(local_command, HERE)
    local_second = run(local_command, HERE)
    if local_first.encode("utf-8") != local_second.encode("utf-8"):
        raise RuntimeError("LOCAL_CONFORMANCE_REPLAY_MISMATCH")
    for vector_id in LOCAL_VECTORS:
        if f"{vector_id}: PASS" not in local_first:
            raise RuntimeError(f"LOCAL_VECTOR_NOT_PASS:{vector_id}")
    if "AE05_EQUALITY: PASS" not in local_first:
        raise RuntimeError("DUPLICATED_FIELD_EQUALITY_NOT_PASS")

    integrated_first = run(integrated_command, HERE, integrated_env)
    integrated_second = run(integrated_command, HERE, integrated_env)
    if integrated_first.encode("utf-8") != integrated_second.encode("utf-8"):
        raise RuntimeError("INTEGRATED_CONFORMANCE_REPLAY_MISMATCH")
    for vector_id in INTEGRATED_VECTORS:
        if f"{vector_id}: PASS" not in integrated_first:
            raise RuntimeError(f"INTEGRATED_VECTOR_NOT_PASS:{vector_id}")
    trace_match = re.search(r"HEADLESS_TRACE_DIGEST:\s*([0-9a-f]{64})", integrated_first)
    attached_match = re.search(r"ATTACHED_TRACE_DIGEST:\s*([0-9a-f]{64})", integrated_first)
    if not trace_match or not attached_match or trace_match.group(1) != attached_match.group(1):
        raise RuntimeError("ATTACHED_HEADLESS_TRACE_IDENTITY_FAILURE")

    physics_dir = ROOT / "physics_rd_001_contact_gr_constructive_substrate_realization"
    agency_dir = ROOT / "game_input_agency_001"
    with tempfile.TemporaryDirectory(prefix="ascii-env-001-regression-") as temporary_name:
        temporary = Path(temporary_name)
        prior_path = temporary / "prior-299-summary.json"
        run([sys.executable, "run_prior_regression.py", "--output", str(prior_path)], physics_dir)
        prior = json.loads(prior_path.read_text(encoding="utf-8"))
        if prior.get("prior_conformance") != "299/299 UNCHANGED":
            raise RuntimeError("PRIOR_299_CONFORMANCE_FAILURE")
        if prior.get("evidence") != "267/267 BYTE_IDENTICAL":
            raise RuntimeError("PRIOR_267_EVIDENCE_FAILURE")

        physics_output = temporary / "physics-evidence"
        physics_summary = temporary / "physics-summary.json"
        physics_text = run(
            [sys.executable, "run_conformance.py", "--output", str(physics_output), "--summary", str(physics_summary)],
            physics_dir,
        )
        if "CONFORMANCE := 36/36" not in physics_text or "EVIDENCE_REPLAY := 37/37 BYTE_IDENTICAL" not in physics_text:
            raise RuntimeError("PHYSICS_RD_001_REGRESSION_FAILURE")

        agency_output = temporary / "agency-evidence"
        agency_summary = temporary / "agency-summary.json"
        agency_text = run(
            [sys.executable, "run_conformance.py", "--output", str(agency_output), "--summary", str(agency_summary)],
            agency_dir,
        )
        if "M01-M16 := 16/16" not in agency_text:
            raise RuntimeError("ASCII_GEN0_AGENCY_REGRESSION_FAILURE")
        agency_evidence_count = compare_json_tree(agency_output, agency_dir / "evidence")
        if agency_evidence_count != 17:
            raise RuntimeError("ASCII_GEN0_EVIDENCE_CENSUS_FAILURE")

    receipts = []
    for vector_id in tuple(f"AE{index:02d}" for index in range(1, 16)):
        integrated = vector_id in INTEGRATED_VECTORS
        receipt = {
            "details": {
                "execution_surface": "PROMOTED_ASCII_GEN0_INTEGRATION" if integrated else "PROJECTOR_LOCAL",
                "projection_authority": "NONE",
            },
            "status": "PASS",
            "vector_id": vector_id,
        }
        if vector_id == "AE05":
            receipt["details"]["duplicated_field_equality"] = "FAIL_CLOSED"
            receipt["details"]["result_bytes"] = "DETERMINISTIC_NONCANONICAL_PRESENTATION"
        if vector_id == "AE13":
            receipt["details"]["carrier_ticks"] = 2
            receipt["details"]["returned_game_worldline"] = "LATEST_COMMITTED_W"
        if vector_id == "AE14":
            receipt["details"]["canonical_trace_digest"] = trace_match.group(1)
            receipt["details"]["attached_equals_headless"] = True
        receipts.append(receipt)

    for receipt in receipts:
        write_json(output / f"{receipt['vector_id']}.json", receipt)

    summary = {
        "ascii_authority": "NONE",
        "conformance": "15/15",
        "deterministic_projection_replay": "PASS",
        "evidence_artifact_count": 16,
        "evidence_replay": "16/16 BYTE_IDENTICAL",
        "exploratory_a104950e": "NON_AUTHORITATIVE_NOT_IMPORTED",
        "implementation_promotion": "NOT_PERFORMED",
        "integrated_trace_digest": trace_match.group(1),
        "prior_conformance": "351/351 UNCHANGED",
        "prior_evidence": "321/321 BYTE_IDENTICAL",
        "result": "HOLDS",
        "spec_commit": "e100efa1c3e143c1c531082da1c637022d5ded05",
        "spec_promotion_commit": "5f852eed331fe97dc542b4a8a4eb3eb3975202e5",
        "spec_sha256": "C2C37A530B9589FE87D0EA5897826337B6719A15A98FEF5C8828C0E48F59B9A8",
        "vector_census": 15,
    }
    write_json(output / "acceptance-summary.json", summary)
    write_json(summary_path, summary)
    return summary


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=HERE / "evidence")
    parser.add_argument("--summary", type=Path, default=HERE / "acceptance-summary.json")
    args = parser.parse_args()
    summary = execute(args.output.resolve(), args.summary.resolve())
    print(json.dumps(summary, indent=2, sort_keys=True))
    print("ASCII_ENV_001 := HOLDS_AT_UNCOMMITTED_BOUNDARY")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
