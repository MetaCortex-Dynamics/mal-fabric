#!/usr/bin/env python3
"""Generate the original BEAUTY-PASS-001 presentation-only GLB actors.

The assets are deliberately small, deterministic, dependency-free, and owned
by this repository. They contain rigid low-poly body-part nodes plus named
idle/walk/run/attack/hit animation clips. No canonical state is encoded here.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
import struct
from typing import Any


HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"


def quaternion(axis: tuple[float, float, float], angle: float) -> tuple[float, float, float, float]:
    half = angle / 2.0
    sine = math.sin(half)
    return axis[0] * sine, axis[1] * sine, axis[2] * sine, math.cos(half)


def generate_actor(path: Path, role: str) -> None:
    binary = bytearray()
    buffer_views: list[dict[str, Any]] = []
    accessors: list[dict[str, Any]] = []

    def append_buffer(data: bytes, *, target: int | None = None) -> int:
        while len(binary) % 4:
            binary.append(0)
        offset = len(binary)
        binary.extend(data)
        view: dict[str, Any] = {"buffer": 0, "byteOffset": offset, "byteLength": len(data)}
        if target is not None:
            view["target"] = target
        buffer_views.append(view)
        return len(buffer_views) - 1

    def accessor(
        values: list[float] | list[int],
        component_type: int,
        value_type: str,
        components: int,
        *,
        target: int | None = None,
        minimum: list[float] | None = None,
        maximum: list[float] | None = None,
    ) -> int:
        format_code = {5126: "f", 5123: "H"}[component_type]
        payload = struct.pack("<" + format_code * len(values), *values)
        view_index = append_buffer(payload, target=target)
        item: dict[str, Any] = {
            "bufferView": view_index,
            "componentType": component_type,
            "count": len(values) // components,
            "type": value_type,
        }
        if minimum is not None:
            item["min"] = minimum
        if maximum is not None:
            item["max"] = maximum
        accessors.append(item)
        return len(accessors) - 1

    # One hard-edged unit cube shared by every body part.
    faces = (
        ((0, 0, 1), ((-0.5, -0.5, 0.5), (0.5, -0.5, 0.5), (0.5, 0.5, 0.5), (-0.5, 0.5, 0.5))),
        ((0, 0, -1), ((0.5, -0.5, -0.5), (-0.5, -0.5, -0.5), (-0.5, 0.5, -0.5), (0.5, 0.5, -0.5))),
        ((1, 0, 0), ((0.5, -0.5, 0.5), (0.5, -0.5, -0.5), (0.5, 0.5, -0.5), (0.5, 0.5, 0.5))),
        ((-1, 0, 0), ((-0.5, -0.5, -0.5), (-0.5, -0.5, 0.5), (-0.5, 0.5, 0.5), (-0.5, 0.5, -0.5))),
        ((0, 1, 0), ((-0.5, 0.5, 0.5), (0.5, 0.5, 0.5), (0.5, 0.5, -0.5), (-0.5, 0.5, -0.5))),
        ((0, -1, 0), ((-0.5, -0.5, -0.5), (0.5, -0.5, -0.5), (0.5, -0.5, 0.5), (-0.5, -0.5, 0.5))),
    )
    positions: list[float] = []
    normals: list[float] = []
    indices: list[int] = []
    for face_index, (normal, vertices) in enumerate(faces):
        for vertex in vertices:
            positions.extend(vertex)
            normals.extend(normal)
        base = face_index * 4
        indices.extend((base, base + 1, base + 2, base, base + 2, base + 3))
    position_accessor = accessor(
        positions, 5126, "VEC3", 3, target=34962,
        minimum=[-0.5, -0.5, -0.5], maximum=[0.5, 0.5, 0.5],
    )
    normal_accessor = accessor(normals, 5126, "VEC3", 3, target=34962)
    index_accessor = accessor(indices, 5123, "SCALAR", 1, target=34963, minimum=[0], maximum=[23])

    if role == "player":
        palette = (
            (0.025, 0.20, 0.20, 1.0),
            (0.08, 0.86, 0.72, 1.0),
            (0.94, 0.72, 0.28, 1.0),
            (0.035, 0.06, 0.08, 1.0),
        )
    else:
        palette = (
            (0.25, 0.025, 0.045, 1.0),
            (0.95, 0.16, 0.18, 1.0),
            (1.0, 0.45, 0.12, 1.0),
            (0.055, 0.02, 0.035, 1.0),
        )
    materials = []
    for index, color in enumerate(palette):
        materials.append({
            "name": f"{role}_material_{index}",
            "pbrMetallicRoughness": {
                "baseColorFactor": list(color),
                "metallicFactor": 0.35 if index == 2 else 0.08,
                "roughnessFactor": 0.38 if index == 2 else 0.58,
            },
            "emissiveFactor": [color[0] * 0.08, color[1] * 0.08, color[2] * 0.08],
        })
    meshes = [
        {
            "name": f"cube_material_{index}",
            "primitives": [{
                "attributes": {"POSITION": position_accessor, "NORMAL": normal_accessor},
                "indices": index_accessor,
                "material": index,
            }],
        }
        for index in range(len(materials))
    ]

    nodes: list[dict[str, Any]] = [{"name": "RigRoot", "children": []}]

    def part(
        name: str,
        translation: tuple[float, float, float],
        scale: tuple[float, float, float],
        material: int,
        rotation: tuple[float, float, float, float] | None = None,
    ) -> int:
        node: dict[str, Any] = {
            "name": name,
            "mesh": material,
            "translation": list(translation),
            "scale": list(scale),
        }
        if rotation is not None:
            node["rotation"] = list(rotation)
        nodes.append(node)
        index = len(nodes) - 1
        nodes[0]["children"].append(index)
        return index

    pelvis = part("Pelvis", (0, 0.92, 0), (0.48, 0.27, 0.30), 0)
    torso = part("Torso", (0, 1.70, 0), (0.66, 0.86, 0.36), 0)
    part("ChestMark", (0, 1.83, 0.37), (0.30, 0.28, 0.035), 2)
    head = part("Head", (0, 2.62, 0), (0.40, 0.43, 0.40), 1)
    part("FaceVisor", (0, 2.65, 0.41), (0.28, 0.12, 0.035), 2)
    left_arm = part("LeftArm", (-0.78, 1.72, 0), (0.18, 0.70, 0.19), 1)
    right_arm = part("RightArm", (0.78, 1.72, 0), (0.18, 0.70, 0.19), 1)
    left_leg = part("LeftLeg", (-0.28, 0.42, 0), (0.22, 0.78, 0.24), 3)
    right_leg = part("RightLeg", (0.28, 0.42, 0), (0.22, 0.78, 0.24), 3)
    if role == "player":
        part("BackBlade", (-0.48, 1.68, -0.34), (0.07, 0.92, 0.08), 2, quaternion((0, 0, 1), -0.28))
        part("ShoulderLight", (0.72, 2.10, 0), (0.14, 0.14, 0.14), 2)
    else:
        part("LeftHorn", (-0.25, 3.05, 0), (0.10, 0.42, 0.10), 2, quaternion((0, 0, 1), -0.42))
        part("RightHorn", (0.25, 3.05, 0), (0.10, 0.42, 0.10), 2, quaternion((0, 0, 1), 0.42))
        part("Core", (0, 1.72, 0.38), (0.18, 0.22, 0.04), 2)

    times = [0.0, 0.5, 1.0]
    time_accessor = accessor(times, 5126, "SCALAR", 1, minimum=[0.0], maximum=[1.0])
    animations: list[dict[str, Any]] = []

    def rotations(axis: tuple[float, float, float], angles: tuple[float, float, float]) -> list[float]:
        result: list[float] = []
        for angle in angles:
            result.extend(quaternion(axis, angle))
        return result

    def add_animation(name: str, channels_data: list[tuple[int, str, list[float], str]]) -> None:
        samplers = []
        channels = []
        for node, path_name, values, value_type in channels_data:
            components = 4 if value_type == "VEC4" else 3
            output = accessor(values, 5126, value_type, components)
            samplers.append({"input": time_accessor, "interpolation": "LINEAR", "output": output})
            channels.append({"sampler": len(samplers) - 1, "target": {"node": node, "path": path_name}})
        animations.append({"name": name, "samplers": samplers, "channels": channels})

    add_animation("Idle", [
        (torso, "rotation", rotations((0, 0, 1), (0.0, 0.025, 0.0)), "VEC4"),
        (head, "rotation", rotations((0, 1, 0), (-0.05, 0.05, -0.05)), "VEC4"),
    ])
    add_animation("Walk", [
        (left_arm, "rotation", rotations((1, 0, 0), (-0.45, 0.45, -0.45)), "VEC4"),
        (right_arm, "rotation", rotations((1, 0, 0), (0.45, -0.45, 0.45)), "VEC4"),
        (left_leg, "rotation", rotations((1, 0, 0), (0.42, -0.42, 0.42)), "VEC4"),
        (right_leg, "rotation", rotations((1, 0, 0), (-0.42, 0.42, -0.42)), "VEC4"),
    ])
    add_animation("Run", [
        (left_arm, "rotation", rotations((1, 0, 0), (-0.85, 0.85, -0.85)), "VEC4"),
        (right_arm, "rotation", rotations((1, 0, 0), (0.85, -0.85, 0.85)), "VEC4"),
        (left_leg, "rotation", rotations((1, 0, 0), (0.72, -0.72, 0.72)), "VEC4"),
        (right_leg, "rotation", rotations((1, 0, 0), (-0.72, 0.72, -0.72)), "VEC4"),
        (torso, "rotation", rotations((1, 0, 0), (0.10, 0.16, 0.10)), "VEC4"),
    ])
    add_animation("Attack", [
        (right_arm, "rotation", rotations((1, 0, 0), (0.2, -2.2, 0.2)), "VEC4"),
        (left_arm, "rotation", rotations((1, 0, 0), (-0.2, -1.0, -0.2)), "VEC4"),
        (torso, "rotation", rotations((0, 1, 0), (-0.15, 0.55, -0.15)), "VEC4"),
    ])
    add_animation("Hit", [
        (torso, "rotation", rotations((0, 0, 1), (0.0, -0.32, 0.0)), "VEC4"),
        (head, "rotation", rotations((1, 0, 0), (0.0, -0.24, 0.0)), "VEC4"),
    ])

    document = {
        "asset": {"version": "2.0", "generator": "mal-fabric BEAUTY-PASS-001 deterministic actor generator"},
        "scene": 0,
        "scenes": [{"name": f"{role}_scene", "nodes": [0]}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "animations": animations,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(binary)}],
    }
    json_chunk = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    json_chunk += b" " * ((4 - len(json_chunk) % 4) % 4)
    while len(binary) % 4:
        binary.append(0)
    total_length = 12 + 8 + len(json_chunk) + 8 + len(binary)
    glb = bytearray(struct.pack("<4sII", b"glTF", 2, total_length))
    glb.extend(struct.pack("<I4s", len(json_chunk), b"JSON"))
    glb.extend(json_chunk)
    glb.extend(struct.pack("<I4s", len(binary), b"BIN\x00"))
    glb.extend(binary)
    path.write_bytes(glb)


def validate_actor(path: Path) -> None:
    payload = path.read_bytes()
    magic, version, total_length = struct.unpack_from("<4sII", payload)
    if magic != b"glTF" or version != 2 or total_length != len(payload):
        raise ValueError(f"INVALID_GLB_HEADER:{path.name}")
    json_length, json_type = struct.unpack_from("<I4s", payload, 12)
    if json_type != b"JSON":
        raise ValueError(f"INVALID_GLB_JSON_CHUNK:{path.name}")
    document = json.loads(payload[20 : 20 + json_length])
    binary_offset = 20 + json_length
    binary_length, binary_type = struct.unpack_from("<I4s", payload, binary_offset)
    if binary_type != b"BIN\x00" or binary_length != document["buffers"][0]["byteLength"]:
        raise ValueError(f"INVALID_GLB_BINARY_CHUNK:{path.name}")
    names = [animation["name"] for animation in document["animations"]]
    if names != ["Idle", "Walk", "Run", "Attack", "Hit"]:
        raise ValueError(f"INVALID_ANIMATION_CENSUS:{path.name}")


def main() -> int:
    ASSETS.mkdir(parents=True, exist_ok=True)
    for filename, role in (("player.glb", "player"), ("enemy.glb", "enemy")):
        path = ASSETS / filename
        generate_actor(path, role)
        validate_actor(path)
    print("BEAUTY_PASS_001_CHARACTER_ASSETS := GENERATED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
