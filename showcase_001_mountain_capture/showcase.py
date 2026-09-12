#!/usr/bin/env python3
"""SHOWCASE-001 nonauthoritative asset and proof records."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Mapping


HERE = Path(__file__).resolve().parent
ASSET_PATH = HERE / "assets" / "mountain_10k.splat"
OUTPUT = HERE / "showcase"

ASSET_SHA256 = "ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41"
ASSET_BYTES = 320_000
ASSET_SPLATS = 10_000
RECORD_WIDTH = 32
MAX_ASSET_BYTES = 1_048_576
MAX_SPLATS = 32_768
SPEC_SHA256 = "4768C2167F01CF041277B1BDA7D3DED6B6C4509B760DC5C95BC4C272DBD3E901"
PROMOTION_SHA256 = "9EF1EDB0F3287C5DC07A516154961A834163A15B5BEC2430C434C54554747E5C"
V0_8_DOI = "10.5281/zenodo.22728146"
V0_8_PUBLIC_COMMIT = "5e38d23a90623c19e608fcdb00db85ad37b378f8"
V0_8_UPSTREAM_PROMOTION = "8fecb46c0ca55279a5c843a15404709ed50fd9f3"
ATTRIBUTION = "\u201cMountain\u201d mesh by lastloginname, via odedstein-meshes (https://github.com/odedstein/meshes), licensed CC-BY-4.0."


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def validate_asset() -> dict[str, Any]:
    if not ASSET_PATH.is_file():
        raise ValueError("SHOWCASE_ASSET_ABSENT")
    byte_count = ASSET_PATH.stat().st_size
    actual_sha = file_sha256(ASSET_PATH)
    if ASSET_PATH.suffix.lower() != ".splat":
        raise ValueError("SHOWCASE_ASSET_EXTENSION")
    if byte_count % RECORD_WIDTH:
        raise ValueError("SHOWCASE_ASSET_RECORD_WIDTH")
    splat_count = byte_count // RECORD_WIDTH
    if byte_count != ASSET_BYTES or byte_count > MAX_ASSET_BYTES:
        raise ValueError("SHOWCASE_ASSET_BYTE_GATE")
    if splat_count != ASSET_SPLATS or splat_count > MAX_SPLATS:
        raise ValueError("SHOWCASE_ASSET_SPLAT_GATE")
    if actual_sha != ASSET_SHA256:
        raise ValueError("SHOWCASE_ASSET_HASH_GATE")
    return {
        "admissibility_verdict": "PASS",
        "asset_id": "mountain_10k",
        "attribution_string": ATTRIBUTION,
        "byte_count": byte_count,
        "creator_or_rights_holder": "lastloginname (original mesh author)",
        "filename": ASSET_PATH.name,
        "format": "SPLAT_FIXED_WIDTH_32",
        "license": "CC-BY-4.0",
        "local_path": str(ASSET_PATH),
        "privacy_status": "NOT_APPLICABLE_MESH_DERIVED",
        "redistribution_permission": "YES_SUBJECT_TO_CC_BY_4_0_ATTRIBUTION",
        "sha256": actual_sha,
        "source_origin": {
            "repository": "marcelpadilla/splats",
            "source_commit": "ac7f3850ceadbc0483d10c9f0b597c2ba5e89009",
            "source_file": "data/mountain/mountain_10k.splat",
            "source_method": "mesh2splat",
            "source_mesh": "odedstein-meshes/objects/mountain; originally lastloginname via Thingiverse thing:991578",
        },
        "splat_count": splat_count,
    }


def runtime_build_identity() -> str:
    return "mal-fabric-v0.8.0:" + V0_8_PUBLIC_COMMIT + "+showcase-spec:" + SPEC_SHA256.lower()


def run_id(game_run_identity: str) -> str:
    return "showcase-run-sha256-" + digest({
        "asset_sha256": ASSET_SHA256,
        "game_run_identity": game_run_identity,
        "runtime_build_identity": runtime_build_identity(),
    })


def capture_run_record(initial_state: Mapping[str, Any], events: list[dict[str, Any]], duration: float | None = None) -> dict[str, Any]:
    snapshot = initial_state["snapshot"]
    record = {
        "GameRunIdentity": snapshot["game_run_id"],
        "capture_resolution": [1440, 900],
        "clip_frame_rate": 25,
        "events": events,
        "import": {
            "doi": V0_8_DOI,
            "public_commit": V0_8_PUBLIC_COMMIT,
            "upstream_promotion_commit": V0_8_UPSTREAM_PROMOTION,
        },
        "operator_notes": "Product evidence only. Capture reads committed snapshots; UI controls exercise the imported demo runtime.",
        "run_id": run_id(snapshot["game_run_id"]),
        "runtime_build_identity": runtime_build_identity(),
        "showcase_asset_sha256": ASSET_SHA256,
    }
    if duration is not None:
        record["clip_duration_seconds"] = round(duration, 3)
    return record


def proof_record(state: Mapping[str, Any], surface: str, image_ref: str, proof_id: str) -> dict[str, Any]:
    snapshot = state["snapshot"]
    active_surface = state["active_surface"]["surface"]
    if active_surface != surface:
        raise ValueError("PROOF_SURFACE_MISMATCH")
    return {
        "GameRunIdentity": snapshot["game_run_id"],
        "RenderSnapshot_digest": state["snapshot_digest"],
        "active_surface": surface,
        "image_or_video_ref": image_ref,
        "logical_tick_index": snapshot["logical_tick_index"],
        "overlay_fields": [
            "run_id",
            "logical_tick_index",
            "RenderSnapshot_digest",
            "GameRunIdentity",
            "active_surface",
            "showcase_asset_sha256",
        ],
        "product_evidence_noncanonical": True,
        "proof_id": proof_id,
        "run_id": run_id(snapshot["game_run_id"]),
        "showcase_asset_sha256": ASSET_SHA256,
    }


def semantic_projection(state: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "snapshot": state["snapshot"],
        "snapshot_digest": state["snapshot_digest"],
    }


__all__ = [
    "ASSET_BYTES", "ASSET_PATH", "ASSET_SHA256", "ASSET_SPLATS", "ATTRIBUTION",
    "OUTPUT", "PROMOTION_SHA256", "SPEC_SHA256", "capture_run_record", "digest",
    "file_sha256", "proof_record", "run_id", "runtime_build_identity",
    "semantic_projection", "validate_asset", "write_json",
]
