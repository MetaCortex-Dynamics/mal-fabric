#!/usr/bin/env python3
"""Verify SHOWCASE-001 SC01–SC22 product-evidence acceptance vectors."""

from __future__ import annotations

import json
from pathlib import Path
import subprocess
from typing import Any, Callable

from PIL import Image
import imageio_ffmpeg

import showcase


HERE = Path(__file__).resolve().parent
EVIDENCE = showcase.OUTPUT / "evidence"
REQUIRED_STILLS = [
    "still-01-hero-game.png",
    "still-02-hero-carrier.png",
    "still-03-proof-game.png",
    "still-04-proof-carrier.png",
    "still-05-behavior-game.png",
    "still-06-behavior-carrier.png",
]
REQUIRED_OVERLAY_FIELDS = {
    "run_id",
    "logical_tick_index",
    "RenderSnapshot_digest",
    "GameRunIdentity",
    "active_surface",
    "showcase_asset_sha256",
}


def load_json(name: str) -> Any:
    return json.loads((showcase.OUTPUT / name).read_text(encoding="utf-8"))


def check(condition: bool, reason: str) -> None:
    if not condition:
        raise AssertionError(reason)


def records_by_id() -> dict[str, dict[str, Any]]:
    records = load_json("proof-records.json")["proof_records"]
    return {record["proof_id"]: record for record in records}


def image_info(filename: str) -> dict[str, Any]:
    path = showcase.OUTPUT / filename
    check(path.is_file() and path.stat().st_size > 10_000, f"missing or empty {filename}")
    with Image.open(path) as image:
        image.verify()
    with Image.open(path) as image:
        check(image.width == 1440 and image.height == 900, f"unexpected dimensions for {filename}")
        return {"filename": filename, "bytes": path.stat().st_size, "dimensions": [image.width, image.height]}


def imported_tree_clean() -> dict[str, Any]:
    scopes = [
        "v3/software_fpga/fabric_v0_1_0",
        "v3/software_fpga/fabric_v0_2_0_admission",
        "v3/software_fpga/fabric_v0_3_0_execution",
        "v3/software_fpga/demo_001_visible_fabric",
        "v3/software_fpga/demo_002_vibe_proposer",
        "v3/software_fpga/demo_003_game_loop_binding",
        "v3/software_fpga/demo_004_dual_surface_render_binding",
        "v3/software_fpga/vis_rd_001_gaussian_splat_render_primitive",
    ]
    completed = subprocess.run(
        ["git", "status", "--porcelain", "--", *scopes],
        cwd=HERE.parents[2],
        capture_output=True,
        text=True,
        check=True,
    )
    check(not completed.stdout.strip(), "imported runtime tree is modified")
    return {"imported_scopes": scopes, "status": "UNCHANGED"}


def pair(left: dict[str, Any], right: dict[str, Any]) -> dict[str, Any]:
    return {
        "game_run_identity": [left["GameRunIdentity"], right["GameRunIdentity"]],
        "logical_tick_index": [left["logical_tick_index"], right["logical_tick_index"]],
        "render_snapshot_digest": [left["RenderSnapshot_digest"], right["RenderSnapshot_digest"]],
        "run_id": [left["run_id"], right["run_id"]],
        "surfaces": [left["active_surface"], right["active_surface"]],
    }


def evaluate() -> list[dict[str, Any]]:
    asset = load_json("asset-record.json")
    run = load_json("capture-run-record.json")
    proof = records_by_id()
    game = proof["SAME_SNAPSHOT_GAME"]
    carrier = proof["SAME_SNAPSHOT_CARRIER"]
    proof_pair = pair(game, carrier)
    events = run["events"]
    attribution = (showcase.OUTPUT / "attribution.txt").read_text(encoding="utf-8")
    image_details = {name: image_info(name) for name in REQUIRED_STILLS}
    clip = showcase.OUTPUT / "clip-01-launch.mp4"
    check(clip.is_file() and clip.stat().st_size > 100_000, "launch clip absent or empty")
    frames, clip_duration = imageio_ffmpeg.count_frames_and_secs(str(clip))
    results: list[tuple[str, str, Callable[[], Any]]] = [
        ("SC01", "asset admissibility record complete", lambda: {
            "asset_id": asset["asset_id"], "bytes": asset["byte_count"], "splats": asset["splat_count"], "verdict": asset["admissibility_verdict"]
        } if asset["admissibility_verdict"] == "PASS" and asset["byte_count"] % 32 == 0 and asset["byte_count"] <= 1_048_576 and asset["splat_count"] <= 32_768 else (_ for _ in ()).throw(AssertionError("asset gate failed"))),
        ("SC02", "rights/provenance record complete", lambda: {
            key: asset[key] for key in ("source_origin", "creator_or_rights_holder", "license", "attribution_string", "redistribution_permission", "privacy_status")
        }),
        ("SC03", "hero GAME still produced", lambda: image_details["still-01-hero-game.png"]),
        ("SC04", "hero CARRIER still produced", lambda: image_details["still-02-hero-carrier.png"]),
        ("SC05", "same-snapshot GAME proof still produced", lambda: image_details["still-03-proof-game.png"]),
        ("SC06", "same-snapshot CARRIER proof still produced", lambda: image_details["still-04-proof-carrier.png"]),
        ("SC07", "proof pair shows SAME run_id", lambda: proof_pair if game["run_id"] == carrier["run_id"] else (_ for _ in ()).throw(AssertionError("run_id differs"))),
        ("SC08", "proof pair shows SAME logical_tick_index", lambda: proof_pair if game["logical_tick_index"] == carrier["logical_tick_index"] else (_ for _ in ()).throw(AssertionError("tick differs"))),
        ("SC09", "proof pair shows SAME RenderSnapshot_digest", lambda: proof_pair if game["RenderSnapshot_digest"] == carrier["RenderSnapshot_digest"] else (_ for _ in ()).throw(AssertionError("snapshot differs"))),
        ("SC10", "proof pair shows SAME GameRunIdentity", lambda: proof_pair if game["GameRunIdentity"] == carrier["GameRunIdentity"] else (_ for _ in ()).throw(AssertionError("game run differs"))),
        ("SC11", "behavior-moment GAME still produced", lambda: image_details["still-05-behavior-game.png"]),
        ("SC12", "behavior-moment CARRIER still produced", lambda: image_details["still-06-behavior-carrier.png"]),
        ("SC13", "launch clip duration within 20–45 seconds", lambda: {
            "bytes": clip.stat().st_size, "duration_seconds": round(clip_duration, 3), "frames": frames
        } if 20 <= clip_duration <= 45 else (_ for _ in ()).throw(AssertionError("clip duration out of range"))),
        ("SC14", "launch clip includes live toggle", lambda: {
            "toggle_events": [event for event in events if event["event"] == "LIVE_TOGGLE"]
        } if any(event["event"] == "LIVE_TOGGLE" for event in events) else (_ for _ in ()).throw(AssertionError("live toggle absent"))),
        ("SC15", "launch clip shows continuous execution", lambda: {
            "continuous_event": next(event for event in events if event["event"] == "CONTROL_ADVANCE_DURING_CARRIER")
        }),
        ("SC16", "overlay fields recorded canonically", lambda: {
            "fields": sorted(REQUIRED_OVERLAY_FIELDS)
        } if all(REQUIRED_OVERLAY_FIELDS.issubset(set(item["overlay_fields"])) for item in proof.values()) else (_ for _ in ()).throw(AssertionError("overlay field absent"))),
        ("SC17", "attribution file complete", lambda: {
            "attribution_sha256": showcase.file_sha256(showcase.OUTPUT / "attribution.txt")
        } if all(text in attribution for text in ("mountain_10k.splat", "lastloginname", "CC-BY-4.0", "2026-09-12", showcase.ATTRIBUTION)) else (_ for _ in ()).throw(AssertionError("attribution incomplete"))),
        ("SC18", "showcase artifacts do not alter imported runtime/state", imported_tree_clean),
        ("SC19", "product evidence separated from canonical semantic evidence", lambda: {
            "authority": "PRODUCT_EVIDENCE_ONLY", "proof_records_noncanonical": True
        } if all(item["product_evidence_noncanonical"] is True for item in proof.values()) and run["capture_tool_authority"] == "NONE" else (_ for _ in ()).throw(AssertionError("authority separation failed"))),
        ("SC20", "selected asset is mountain_10k.splat", lambda: {
            "filename": asset["filename"], "sha256": asset["sha256"]
        } if asset["filename"] == "mountain_10k.splat" and asset["sha256"] == showcase.ASSET_SHA256 else (_ for _ in ()).throw(AssertionError("selected asset differs"))),
        ("SC21", "no iconic-landmark substitution occurred", lambda: {
            "asset_id": asset["asset_id"], "landmark_claim": False, "source_method": asset["source_origin"]["source_method"]
        } if asset["asset_id"] == "mountain_10k" and "iconic" not in run["product_copy"]["primary"].lower() else (_ for _ in ()).throw(AssertionError("landmark substitution or claim"))),
        ("SC22", "capture package replay metadata present", lambda: {
            key: run[key] for key in ("runtime_build_identity", "showcase_asset_sha256", "GameRunIdentity", "capture_resolution", "clip_frame_rate", "import")
        }),
    ]
    receipts: list[dict[str, Any]] = []
    for vector_id, description, operation in results:
        try:
            details = operation()
            check(details is not None, f"{vector_id} returned no evidence")
            receipt = {"description": description, "details": details, "verdict": "PASS", "vector_id": vector_id}
        except Exception as exc:
            receipt = {"description": description, "details": {"error": str(exc)}, "verdict": "FAIL", "vector_id": vector_id}
        receipts.append(receipt)
    return receipts


def main() -> int:
    receipts = evaluate()
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    for receipt in receipts:
        showcase.write_json(EVIDENCE / f"{receipt['vector_id']}.json", receipt)
    passed = sum(receipt["verdict"] == "PASS" for receipt in receipts)
    summary = {
        "acceptance": f"{passed}/{len(receipts)}",
        "asset_sha256": showcase.ASSET_SHA256,
        "product_evidence_noncanonical": True,
        "same_snapshot_requirement": "HOLDS" if all(next(item for item in receipts if item["vector_id"] == vector)["verdict"] == "PASS" for vector in ("SC07", "SC08", "SC09", "SC10")) else "FAILS",
        "showcase": "SHOWCASE-001-MOUNTAIN-CAPTURE",
        "showcase_nonauthority": "HOLDS" if next(item for item in receipts if item["vector_id"] == "SC19")["verdict"] == "PASS" else "FAILS",
        "spec_sha256": showcase.SPEC_SHA256,
        "surface_noninterference": "HOLDS" if next(item for item in receipts if item["vector_id"] == "SC18")["verdict"] == "PASS" else "FAILS",
        "vector_census": len(receipts),
    }
    showcase.write_json(showcase.OUTPUT / "acceptance-summary.json", summary)
    showcase.write_json(EVIDENCE / "acceptance-summary.json", summary)
    manifest_entries = []
    for path in sorted(showcase.OUTPUT.rglob("*")):
        if path.is_file() and path.name != "capture-manifest.json":
            manifest_entries.append({
                "bytes": path.stat().st_size,
                "path": path.relative_to(showcase.OUTPUT).as_posix(),
                "sha256": showcase.file_sha256(path),
            })
    showcase.write_json(showcase.OUTPUT / "capture-manifest.json", {
        "entries": manifest_entries,
        "entry_count": len(manifest_entries),
        "product_evidence": "NONCANONICAL",
        "replay_entrypoint": "python run_acceptance.py",
        "showcase": "SHOWCASE-001-MOUNTAIN-CAPTURE",
    })
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0 if passed == len(receipts) else 1


if __name__ == "__main__":
    raise SystemExit(main())
