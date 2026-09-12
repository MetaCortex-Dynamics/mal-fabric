#!/usr/bin/env python3
"""Generate the deterministic, synthetic fixed-width SPLAT conformance fixture."""

from __future__ import annotations

from hashlib import sha256
import json
import math
from pathlib import Path
import struct


HERE = Path(__file__).resolve().parent
ASSET = HERE / "web" / "assets" / "mal_orbit_192.splat"
DESCRIPTOR = HERE / "splat-asset-descriptor.json"
SPLAT_COUNT = 192


def build_fixture() -> bytes:
    rows: list[bytes] = []
    for index in range(SPLAT_COUNT):
        ring = index % 24
        layer = index // 24
        angle = (2.0 * math.pi * ring / 24.0) + (layer % 2) * math.pi / 24.0
        latitude = (layer - 3.5) * 0.115
        radius = 0.72 + 0.07 * math.cos(layer * 1.7)
        x = radius * math.cos(angle)
        y = latitude + 0.08 * math.sin(angle * 3.0)
        z = radius * math.sin(angle)
        scale = 0.115 + 0.012 * ((index * 7) % 5)
        red = 190 + ((index * 13) % 50)
        green = 48 + ((index * 17) % 75)
        blue = 70 + ((index * 11) % 65)
        alpha = 205
        rows.append(
            struct.pack(
                "<3f3f4B4B",
                x,
                y,
                z,
                scale,
                scale * 0.82,
                scale * 1.08,
                red,
                green,
                blue,
                alpha,
                128,
                128,
                128,
                255,
            )
        )
    return b"".join(rows)


def main() -> int:
    data = build_fixture()
    digest = sha256(data).hexdigest().upper()
    ASSET.parent.mkdir(parents=True, exist_ok=True)
    ASSET.write_bytes(data)
    descriptor = {
        "bounds": {"maximum": [0.8, 0.52, 0.8], "minimum": [-0.8, -0.52, -0.8]},
        "byte_length": len(data),
        "content_sha256": digest,
        "declared_splat_count": SPLAT_COUNT,
        "format": "SPLAT_FIXED_WIDTH_32",
        "provenance": {
            "generator": "generate_fixture.py",
            "kind": "LOCAL_SYNTHETIC_CONFORMANCE_FIXTURE",
            "redistribution": "Apache-2.0",
        },
        "splat_asset_id": f"splat-sha256-{digest.lower()}",
    }
    DESCRIPTOR.write_text(json.dumps(descriptor, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
    print(f"fixture={ASSET.relative_to(HERE)} bytes={len(data)} splats={SPLAT_COUNT} sha256={digest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
