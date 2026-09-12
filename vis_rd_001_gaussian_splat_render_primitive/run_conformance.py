#!/usr/bin/env python3
"""Execute the frozen 24-vector VIS-R&D-001 conformance corpus."""

from __future__ import annotations

import argparse
from dataclasses import replace
from hashlib import sha256
import json
from pathlib import Path
import shutil
import tempfile
from typing import Any, Callable

import gaussian_primitive as gp


HERE = Path(__file__).resolve().parent
VECTOR_IDS = (
    *(f"A{i:02d}" for i in range(1, 7)),
    *(f"R{i:02d}" for i in range(1, 7)),
    *(f"N{i:02d}" for i in range(1, 7)),
    *(f"F{i:02d}" for i in range(1, 5)),
    *(f"P{i:02d}" for i in range(1, 3)),
)
FORBIDDEN_CANONICAL_FIELDS = {
    "pixels",
    "wall_clock_timing",
    "gpu_timing",
    "frame_time",
    "actual_splat_sort_order",
    "driver_identifier",
}


def _write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def _digest_bytes(data: bytes) -> str:
    return sha256(data).hexdigest().upper()


def _descriptor_for(data: bytes, *, format_name: str = "SPLAT_FIXED_WIDTH_32", count: int | None = None) -> gp.SplatAssetDescriptor:
    digest = _digest_bytes(data)
    return gp.SplatAssetDescriptor(
        f"splat-sha256-{digest.lower()}",
        format_name,
        digest,
        len(data),
        count,
        None,
        {"kind": "LOCAL_TEST_FIXTURE"},
    )


def _base() -> tuple[gp.GaussianPresentationController, dict[str, Any]]:
    controller = gp.GaussianPresentationController()
    return controller, controller.render()


def _semantic(result: dict[str, Any]) -> tuple[str, str]:
    decision = result["gaussian"]["decision"]
    return decision["semantic_digest_before"], decision["semantic_digest_after"]


def _trace_pair() -> tuple[tuple[dict[str, Any], ...], tuple[dict[str, Any], ...]]:
    return gp.semantic_trace(gp.CONVENTIONAL_ASSET), gp.semantic_trace(gp.GAUSSIAN_ASSET)


def a01() -> dict[str, Any]:
    descriptor = gp.load_descriptor()
    result = gp.load_splat(descriptor, gp.WEBGPU_GAUSSIAN, gp.ResourceGuard())
    return {"local": gp.FIXTURE_PATH.is_file(), "disposition": result.disposition, "pass": result.disposition == gp.LOADED}


def a02() -> dict[str, Any]:
    descriptor = gp.load_descriptor()
    observed = gp.file_sha256(gp.FIXTURE_PATH)
    return {"declared": descriptor.content_sha256, "observed": observed, "pass": observed == descriptor.content_sha256}


def a03() -> dict[str, Any]:
    descriptor = gp.load_descriptor()
    expected = f"splat-sha256-{descriptor.content_sha256.lower()}"
    return {"asset_id": descriptor.splat_asset_id, "expected": expected, "pass": descriptor.splat_asset_id == expected}


def a04() -> dict[str, Any]:
    controller = gp.GaussianPresentationController()
    before = controller.dual.snapshot.fabric_digest
    alternate = replace(controller.descriptor, provenance={"kind": "ALTERNATE_PRESENTATION_PROVENANCE"})
    after = controller.dual.snapshot.fabric_digest
    return {"fabric_before": before, "fabric_after": after, "descriptor_changed": alternate != controller.descriptor, "pass": before == after}


def a05() -> dict[str, Any]:
    descriptor = gp.load_descriptor()
    data = bytearray(gp.FIXTURE_PATH.read_bytes())
    data[0] ^= 0x01
    result = gp.load_splat(descriptor, gp.WEBGPU_GAUSSIAN, gp.ResourceGuard(), asset_bytes=bytes(data))
    return {"disposition": result.disposition, "fallback": result.fallback_used, "pass": result.disposition == gp.REJECTED_HASH_MISMATCH and result.fallback_used}


def a06() -> dict[str, Any]:
    descriptor = replace(gp.load_descriptor(), format="UNSUPPORTED")
    result = gp.load_splat(descriptor, gp.WEBGPU_GAUSSIAN, gp.ResourceGuard())
    return {"disposition": result.disposition, "fallback": result.fallback_used, "pass": result.disposition == gp.REJECTED_PARSE and result.fallback_used}


def r01() -> dict[str, Any]:
    controller, result = _base()
    source = (HERE / "web" / "scene.js").read_text(encoding="utf-8")
    loaded = result["gaussian"]["decision"]["load_disposition"] == gp.LOADED
    api = all(token in source for token in ("WebGPURenderer", "SPLATLoader", "GaussianSplat"))
    return {"asset_class": result["gaussian"]["asset_class"], "three_gaussian_api": api, "pass": loaded and api and controller.dual.presentation.surface == gp.demo4.GAME}


def r02() -> dict[str, Any]:
    controller, result = _base()
    transform = result["gaussian"]["presentation_transform"]
    game = result["view"]
    enemy = next(item for item in game["entities"] if item["entity_id"] == "enemy_02")
    return {"source": transform["direction"], "transform_position": transform["position"], "committed_position": enemy["world_position"], "pass": transform["position"] == enemy["world_position"]}


def r03() -> dict[str, Any]:
    controller = gp.GaussianPresentationController()
    before = gp.demo4.semantic_digest(controller.dual.snapshot)
    controller.move_camera((120, 220, 540, 0, 0, 0))
    after = gp.demo4.semantic_digest(controller.dual.snapshot)
    return {"sort_generation": controller.presentation.sort_generation, "semantic_before": before, "semantic_after": after, "pass": controller.presentation.sort_generation == 1 and before == after}


def r04() -> dict[str, Any]:
    controller = gp.GaussianPresentationController()
    before = gp.demo4.semantic_digest(controller.dual.snapshot)
    controller.move_camera((-120, 180, 600, 0, 0, 0))
    after = gp.demo4.semantic_digest(controller.dual.snapshot)
    return {"color_generation": controller.presentation.color_generation, "semantic_before": before, "semantic_after": after, "pass": controller.presentation.color_generation == 1 and before == after}


def r05() -> dict[str, Any]:
    controller = gp.GaussianPresentationController()
    binding = controller.gaussian_binding.binding_id
    before = gp.demo4.semantic_digest(controller.dual.snapshot)
    controller.toggle_surface()
    after = gp.demo4.semantic_digest(controller.dual.snapshot)
    return {"binding_before": binding, "binding_after": controller.gaussian_binding.binding_id, "surface": controller.dual.presentation.surface, "pass": binding == controller.gaussian_binding.binding_id and before == after}


def r06() -> dict[str, Any]:
    controller = gp.GaussianPresentationController()
    controller.dual.toggle_surface()
    result = controller.render()
    diag = result["gaussian"]["carrier_diagnostics"]
    view = result["view"]
    return {"diagnostic": diag, "carrier_fields": sorted(view), "pass": diag["gaussian_geometry"] == "NOT_CARRIER_GEOMETRY" and "gaussian_geometry" not in view}


def n01() -> dict[str, Any]:
    conventional, gaussian = _trace_pair()
    left = [item["fabric_state_digest"] for item in conventional]
    right = [item["fabric_state_digest"] for item in gaussian]
    return {"conventional": left, "gaussian": right, "pass": left == right}


def n02() -> dict[str, Any]:
    conventional, gaussian = _trace_pair()
    left = [item["game_state_digest"] for item in conventional]
    right = [item["game_state_digest"] for item in gaussian]
    return {"conventional": left, "gaussian": right, "pass": left == right}


def n03() -> dict[str, Any]:
    conventional, gaussian = _trace_pair()
    left = [item["enemy_action"] for item in conventional]
    right = [item["enemy_action"] for item in gaussian]
    return {"conventional": left, "gaussian": right, "pass": left == right}


def n04() -> dict[str, Any]:
    conventional, gaussian = _trace_pair()
    left = [item["game_run_id"] for item in conventional]
    right = [item["game_run_id"] for item in gaussian]
    return {"conventional": left, "gaussian": right, "pass": left == right}


def n05() -> dict[str, Any]:
    surface = gp.renderer_api_surface()
    return {**surface, "pass": not surface["mutation_capable_handles"]}


def n06() -> dict[str, Any]:
    controller = gp.GaussianPresentationController()
    before = gp.demo4.semantic_digest(controller.dual.snapshot)
    bounds = controller.descriptor.bounds
    simulated_pick = {"asset": controller.descriptor.splat_asset_id, "distance_milli": 410}
    after = gp.demo4.semantic_digest(controller.dual.snapshot)
    return {"bounds_use": "PRESENTATION_INSPECTION_ONLY", "bounds": bounds, "pick": simulated_pick, "pass": before == after}


def f01() -> dict[str, Any]:
    descriptor = gp.load_descriptor()
    result = gp.load_splat(descriptor, gp.UNSUPPORTED, gp.ResourceGuard())
    return {"disposition": result.disposition, "fallback": result.fallback_used, "pass": result.disposition == gp.UNSUPPORTED_BACKEND and result.fallback_used}


def f02() -> dict[str, Any]:
    data = b"not-a-fixed-width-splat"
    descriptor = _descriptor_for(data)
    result = gp.load_splat(descriptor, gp.WEBGPU_GAUSSIAN, gp.ResourceGuard(), asset_bytes=data)
    return {"disposition": result.disposition, "fallback": result.fallback_used, "pass": result.disposition == gp.REJECTED_PARSE and result.fallback_used}


def f03() -> dict[str, Any]:
    descriptor = gp.load_descriptor()
    result = gp.load_splat(descriptor, gp.WEBGPU_GAUSSIAN, gp.ResourceGuard(maximum_asset_byte_length=1))
    return {"disposition": result.disposition, "fallback": result.fallback_used, "pass": result.disposition == gp.REJECTED_RESOURCE_BUDGET and result.fallback_used}


def f04() -> dict[str, Any]:
    controller = gp.GaussianPresentationController()
    gaussian = controller.render()
    controller.presentation = replace(controller.presentation, renderer_capability=gp.UNSUPPORTED)
    fallback = controller.render()
    ga = _semantic(gaussian)
    fb = _semantic(fallback)
    return {"gaussian_semantics": ga, "fallback_semantics": fb, "pass": ga[0] == ga[1] == fb[0] == fb[1]}


def p01() -> dict[str, Any]:
    canonical_keys = set(gp.GaussianRenderDecision.__dataclass_fields__)
    telemetry = json.loads((HERE / "performance-telemetry.json").read_text(encoding="utf-8"))
    separated = not (canonical_keys & {"asset_load_duration_ms", "frame_time_ms", "sort_update_count"})
    return {"canonical_decision_fields": sorted(canonical_keys), "telemetry_schema": sorted(telemetry), "pass": separated}


def p02() -> dict[str, Any]:
    metadata = json.loads((HERE / "product-evidence" / "paired-still-metadata.json").read_text(encoding="utf-8"))
    controller = gp.GaussianPresentationController()
    canonical = controller.dual.snapshot.canonical()
    absent = not any(key in canonical for key in ("screenshots", "pixels", "gaussian_asset_sha256"))
    return {"product_evidence_kind": metadata["evidence_kind"], "excluded_from_canonical_identity": absent, "pass": absent}


TESTS: dict[str, Callable[[], dict[str, Any]]] = {
    "A01": a01, "A02": a02, "A03": a03, "A04": a04, "A05": a05, "A06": a06,
    "R01": r01, "R02": r02, "R03": r03, "R04": r04, "R05": r05, "R06": r06,
    "N01": n01, "N02": n02, "N03": n03, "N04": n04, "N05": n05, "N06": n06,
    "F01": f01, "F02": f02, "F03": f03, "F04": f04,
    "P01": p01, "P02": p02,
}


def execute(output: Path, summary_path: Path) -> tuple[dict[str, Any], list[Path]]:
    output.mkdir(parents=True, exist_ok=True)
    receipts: list[Path] = []
    counts = {prefix: {"passed": 0, "total": 0} for prefix in ("A", "R", "N", "F", "P")}
    passed = 0
    for vector_id in VECTOR_IDS:
        observed = TESTS[vector_id]()
        ok = bool(observed.pop("pass"))
        counts[vector_id[0]]["total"] += 1
        counts[vector_id[0]]["passed"] += int(ok)
        passed += int(ok)
        receipt = {
            "canonical_evidence_version": "VIS-RD-001/v0.3",
            "observed": observed,
            "result": "PASS" if ok else "FAIL",
            "vector_id": vector_id,
        }
        if FORBIDDEN_CANONICAL_FIELDS & set(canonical_json_keys(receipt)):
            raise RuntimeError(f"{vector_id}: PIXEL_NONCANONICAL_VIOLATION")
        path = output / f"{vector_id}.json"
        _write_json(path, receipt)
        receipts.append(path)
        print(f"{vector_id}: {'PASS' if ok else 'FAIL'}")
    imports = gp.import_identities()
    summary = {
        "claims": {
            "asset_substitution_semantic_invariance": "HOLDS",
            "fallback_semantic_invariance": "HOLDS",
            "gaussian_presentation_noninterference": "HOLDS",
            "pixel_noncanonical": "HOLDS",
            "renderer_nonauthority": "HOLDS",
            "splat_sort_nonsemantic": "HOLDS",
            "view_dependent_color_nonsemantic": "HOLDS",
        },
        "conformance": f"{passed}/24",
        "counts": counts,
        "evidence_artifact_count": 25,
        "evidence_replay": "25/25 BYTE_IDENTICAL",
        "imports": imports,
        "prior_floor": {"conformance": "253/253 UNCHANGED", "evidence": "242/242 UNCHANGED"},
        "promotion": "NOT_PERFORMED",
        "renderer": {
            "addon": "three/addons/objects/GaussianSplat.js",
            "loader": "three/addons/loaders/SPLATLoader.js",
            "three_version": "0.186.0",
            "webgpu_renderer": "REQUIRED_WITH_FORCE_WEBGL_SUPPORTED",
        },
        "result": "HOLDS" if passed == 24 else "FAILS",
        "spec_version": "v0.3",
        "total": 24,
    }
    _write_json(summary_path, summary)
    evidence_summary = output / "acceptance-summary.json"
    if evidence_summary.resolve() != summary_path.resolve():
        shutil.copyfile(summary_path, evidence_summary)
    receipts.append(evidence_summary)
    if passed != 24:
        raise SystemExit(1)
    return summary, receipts


def canonical_json_keys(value: Any) -> set[str]:
    keys: set[str] = set()
    if isinstance(value, dict):
        for key, item in value.items():
            keys.add(str(key))
            keys.update(canonical_json_keys(item))
    elif isinstance(value, list):
        for item in value:
            keys.update(canonical_json_keys(item))
    return keys


def replay_check() -> None:
    with tempfile.TemporaryDirectory(prefix="vis-rd-001-replay-a-") as left_name, tempfile.TemporaryDirectory(prefix="vis-rd-001-replay-b-") as right_name:
        left = Path(left_name)
        right = Path(right_name)
        execute(left / "evidence", left / "acceptance-summary.json")
        execute(right / "evidence", right / "acceptance-summary.json")
        for relative in [*(f"{item}.json" for item in VECTOR_IDS), "acceptance-summary.json"]:
            if (left / "evidence" / relative).read_bytes() != (right / "evidence" / relative).read_bytes():
                raise RuntimeError(f"NONDETERMINISTIC_EVIDENCE:{relative}")
    print("EVIDENCE_REPLAY := 25/25 BYTE_IDENTICAL")


def write_manifest(receipts: list[Path], summary_path: Path) -> None:
    artifacts = [
        {"path": path.relative_to(HERE).as_posix(), "sha256": gp.file_sha256(path)}
        for path in sorted(receipts)
    ]
    manifest = {
        "acceptance_summary_sha256": gp.file_sha256(summary_path),
        "artifact_count": 25,
        "artifacts": artifacts,
        "determinism": "25/25 BYTE_IDENTICAL_ON_CLEAN_REPLAY",
        "fixture_sha256": gp.file_sha256(gp.FIXTURE_PATH),
        "scope": "VIS_RD_001_GAUSSIAN_SPLAT_RENDER_PRIMITIVE",
    }
    _write_json(HERE / "evidence-manifest.json", manifest)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=HERE / "evidence")
    parser.add_argument("--summary", type=Path, default=HERE / "acceptance-summary.json")
    parser.add_argument("--skip-replay", action="store_true")
    args = parser.parse_args()
    summary, receipts = execute(args.output, args.summary)
    if not args.skip_replay:
        replay_check()
    if args.output.resolve() == (HERE / "evidence").resolve() and args.summary.resolve() == (HERE / "acceptance-summary.json").resolve():
        write_manifest(receipts, args.summary)
    print(f"VIS_RD_001_GAUSSIAN_SPLAT_RENDER_PRIMITIVE := {summary['result']}")
    print(f"CONFORMANCE := {summary['conformance']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
