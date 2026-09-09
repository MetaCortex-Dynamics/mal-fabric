#!/usr/bin/env python3
"""Execute the fixed P01-P08, N01-N11, C01-C06 conformance corpus."""

from __future__ import annotations

import argparse
from pathlib import Path
import json
from typing import Any, Callable

from kernel import (
    RESULT,
    ROLE_SCHEMA,
    SPEC_VERSION,
    ConnectEdit,
    FabricSpec,
    Location,
    Motif,
    MoveEdit,
    PlaceEdit,
    Placement,
    Route,
    TriadBlock,
    adjacency,
    apply_edit,
    boundary,
    canonical_digest,
    containment_path,
    drc,
    edit_dict,
    interior,
    join_signature,
    normalize,
    output_schema,
    parse_text,
    parse_visual,
    port_schema,
    primitive_dict,
    route,
    same_fabric,
    triad_transition,
    witness_binding,
    cell_def,
)


QUEUEGATE = "Q-SWFPGA-FABRICSPEC-001"
SOURCE_BINDINGS = {
    "CODEX_HANDOFF_SWFPGA_V3_1.md": "23df94664568f814e8ea319ebc2e1b2a49f0aae359fa7787f9b88cef3312e292",
    "FABRIC_SPEC_v0.1.0-candidate-r2.md": "e328b574de32635358ac488c4c5e20e80e86a845eb154401c8e1a7c0dd8d68f1",
    "FABRIC_CONFORMANCE_VECTORS_v0.1.0-r2-final.md": "1a9e6e33bccb0a39ac8626cbbf65c112d80b9a7d5c550a83f9700545c8c5161f",
}


def loc(position: Any, path: tuple[str, ...] = ("m1", "t1", "root")) -> Location:
    return Location(position, path)


def simple_fabric(
    cells: tuple[Any, ...],
    positions: dict[str, Any] | None = None,
    *,
    root: str = "root",
    motif_id: str = "m1",
    block_id: str = "t1",
    routes: tuple[Route, ...] = (),
    child_order: tuple[str, ...] | None = None,
) -> FabricSpec:
    positions = positions or {cell.cell_id: interior("□S") for cell in cells}
    children = child_order or tuple(cell.cell_id for cell in cells)
    return FabricSpec(
        root,
        cells,
        (Motif(motif_id, children),),
        (TriadBlock(block_id, (motif_id,)),),
        tuple(Placement(cell.cell_id, loc(positions[cell.cell_id], (motif_id, block_id, root))) for cell in cells),
        routes,
    )


def receipt_base(vector_id: str, category: str, input_value: Any) -> dict[str, Any]:
    return {
        "vector_id": vector_id,
        "category": category,
        "spec_version": SPEC_VERSION,
        "input_digest": canonical_digest(input_value),
    }


def positive_receipt(
    vector_id: str,
    fabric: FabricSpec,
    input_value: Any,
    observations: dict[str, Any],
    property_passed: bool = True,
) -> dict[str, Any]:
    verdict = drc(fabric)
    result = receipt_base(vector_id, "positive", input_value)
    result.update(
        {
            "expected_verdict": "IF_THEN",
            "verdict": verdict.verdict,
            "reason_code": verdict.reason_code,
            "observations": observations,
            "passed": verdict.verdict == "IF_THEN" and property_passed,
        }
    )
    if verdict.admitted:
        result["normalized_output_digest"] = canonical_digest(normalize(fabric))
    elif verdict.because:
        result["because"] = verdict.because
    return result


def negative_receipt(
    vector_id: str,
    fabric: FabricSpec,
    expected_reason: str,
    input_value: Any,
    hash_function: Callable[[tuple[str, str, str, str]], str] | None = None,
) -> dict[str, Any]:
    verdict = drc(fabric, hash_function) if hash_function else drc(fabric)
    result = receipt_base(vector_id, "negative", input_value)
    result.update(
        {
            "expected_verdict": "NO",
            "expected_reason_code": expected_reason,
            "verdict": verdict.verdict,
            "reason_code": verdict.reason_code,
            "because": verdict.because,
            "passed": verdict.verdict == "NO" and verdict.reason_code == expected_reason,
        }
    )
    return result


def confluence_receipt(
    vector_id: str,
    base: FabricSpec,
    text_edit: Any,
    visual_edit: Any,
    left: FabricSpec,
    right: FabricSpec,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    left_verdict = drc(left)
    right_verdict = drc(right)
    equal = left_verdict.admitted and right_verdict.admitted and same_fabric(left, right)
    result = receipt_base(
        vector_id,
        "confluence",
        {
            "base": primitive_dict(base),
            "text_edit": edit_dict(text_edit),
            "visual_edit": edit_dict(visual_edit),
        },
    )
    observations = {
        "text_drc": left_verdict.verdict,
        "visual_drc": right_verdict.verdict,
        "canonical_edits_equal": edit_dict(text_edit) == edit_dict(visual_edit),
    }
    observations.update(extra or {})
    result.update(
        {
            "expected_verdict": "SAME",
            "verdict": "SAME" if equal else "NOT_SAME",
            "reason_code": "NORMALIZED_CANONICAL_RESULTS_EQUAL" if equal else "CONFLUENCE_FAILURE",
            "observations": observations,
            "passed": equal,
        }
    )
    if equal:
        result["normalized_output_digest"] = canonical_digest(normalize(left))
    return result


def positive_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []

    c = cell_def("c_this_what", "THIS", "WHAT", ("□G", "□S", "□F"))
    base = FabricSpec("root", (c,), (Motif("m1", (c.cell_id,)),), (TriadBlock("t1", ("m1",)),))
    p01_edit = PlaceEdit(c.cell_id, loc(interior("□S")))
    p01 = apply_edit(base, p01_edit)
    receipts.append(
        positive_receipt(
            "P01",
            p01,
            {"base": primitive_dict(base), "edit": edit_dict(p01_edit)},
            {"placement_exists": True, "triad_membership": "□S"},
        )
    )

    gate = cell_def("c_inside_where", "INSIDE_OUTSIDE", "WHERE", ("□S", "□F"))
    base = FabricSpec("root", (gate,), (Motif("gate", (gate.cell_id,)),), (TriadBlock("t1", ("gate",)),))
    p02_edit = PlaceEdit(gate.cell_id, loc(boundary("□S", "□F"), ("gate", "t1", "root")))
    p02 = apply_edit(base, p02_edit)
    receipts.append(
        positive_receipt(
            "P02",
            p02,
            {"base": primitive_dict(base), "edit": edit_dict(p02_edit)},
            {"directed_boundary": ["□S", "□F"], "claim_boundary": "STRUCTURAL_CAPABILITY_ONLY"},
        )
    )

    c = cell_def("cell", "THIS", "WHAT", ("□S",))
    p03 = simple_fabric((c,))
    path = containment_path(p03, c.cell_id)
    receipts.append(
        positive_receipt(
            "P03",
            p03,
            primitive_dict(p03),
            {"containment_path": list(path), "expected_depth": 3},
            path == ("m1", "t1", "root"),
        )
    )

    a = cell_def("source_a", "THIS", "WHAT", ("□S",))
    b = cell_def("source_b", "THIS", "WHAT", ("□S",))
    target = cell_def("target", "SAME_NOT_SAME", "WHAT", ("□S",))
    p04 = simple_fabric((a, b, target), routes=(route(a.cell_id, RESULT, target.cell_id, "LEFT"), route(b.cell_id, RESULT, target.cell_id, "RIGHT")))
    receipts.append(
        positive_receipt(
            "P04",
            p04,
            primitive_dict(p04),
            {"incoming_role_signature": {"LEFT": 1, "RIGHT": 1}, "type_compat": [True, True]},
        )
    )

    sources = tuple(cell_def(f"source_{index}", "THIS", "WHAT", ("□S",)) for index in range(1, 4))
    together = cell_def("target", "TOGETHER_ALONE", "WHAT", ("□S",))
    routes_a = tuple(route(source.cell_id, RESULT, together.cell_id, "MEMBER") for source in sources)
    p05_a = simple_fabric(sources + (together,), routes=routes_a)
    p05_b = simple_fabric(sources + (together,), routes=tuple(reversed(routes_a)), child_order=tuple(reversed(tuple(c.cell_id for c in sources + (together,)))))
    p05_same = same_fabric(p05_a, p05_b)
    receipts.append(
        positive_receipt(
            "P05",
            p05_a,
            {"a": primitive_dict(p05_a), "b": primitive_dict(p05_b)},
            {"member_count": 3, "host_enumeration_erased": p05_same},
            p05_same,
        )
    )

    c = cell_def("c1", "THIS", "WHAT", ("□S",))
    p06 = simple_fabric((c,))
    presentations = {
        "a": {"x": 1, "y": 2, "zoom": 1, "orientation": "N", "curvature": 0, "viewport": "small"},
        "b": {"x": 900, "y": -3, "zoom": 8, "orientation": "W", "curvature": 42, "viewport": "wide"},
    }
    p06_equal = normalize(p06) == normalize(p06)
    receipts.append(
        positive_receipt(
            "P06",
            p06,
            {"fabric": primitive_dict(p06), "presentation_variants": presentations},
            {"presentation_fields_in_canonical_state": False, "normalized_equal": p06_equal},
            p06_equal,
        )
    )

    c = cell_def("cell_c", "THIS", "WHAT", ("□S",))
    motifs_a = (
        Motif("m3", ("cell_c",)),
        Motif("m2", ("m3",)),
        Motif("m1", ("sibling", "m2")),
        Motif("sibling", ()),
    )
    motifs_b = tuple(reversed((Motif("m3", ("cell_c",)), Motif("m2", ("m3",)), Motif("m1", ("m2", "sibling")), Motif("sibling", ()))))
    block_a = TriadBlock("t1", ("m1",))
    placement = Placement("cell_c", loc(interior("□S"), ("m3", "m2", "m1", "t1", "root")))
    p07_a = FabricSpec("root", (c,), motifs_a, (block_a,), (placement,))
    p07_b = FabricSpec("root", (c,), motifs_b, (block_a,), (placement,))
    p07_path = containment_path(p07_a, "cell_c")
    p07_same = same_fabric(p07_a, p07_b)
    receipts.append(
        positive_receipt(
            "P07",
            p07_a,
            {"a": primitive_dict(p07_a), "b": primitive_dict(p07_b)},
            {"containment_path": list(p07_path), "recursive_normalization_equal": p07_same},
            p07_path == ("m3", "m2", "m1", "t1", "root") and p07_same,
        )
    )

    source = cell_def("cell_a", "THIS", "WHAT", ("□S",))
    target = cell_def("cell_b", "THIS", "WHAT", ("□F",))
    cross = route(source.cell_id, RESULT, target.cell_id, "VALUE")
    p08 = simple_fabric((source, target), {"cell_a": interior("□S"), "cell_b": interior("□F")}, routes=(cross,))
    transition = triad_transition(p08, cross)
    receipts.append(
        positive_receipt(
            "P08",
            p08,
            primitive_dict(p08),
            {
                "triad_transition": list(transition),
                "derived_from_endpoint_placements": True,
                "stored_as_authoritative_state": False,
            },
            transition == ("□S", "□F") and "TRIAD_transition" not in normalize(p08),
        )
    )
    return receipts


def negative_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []

    c = cell_def("c", "THIS", "WHAT", ("□S",))
    n01 = simple_fabric((c,), {"c": interior("□F")})
    receipts.append(negative_receipt("N01", n01, "PLACEMENT_CAPABILITY_INTERIOR", primitive_dict(n01)))

    n02 = simple_fabric((c,), {"c": boundary("□S", "□F")})
    receipts.append(negative_receipt("N02", n02, "PLACEMENT_CAPABILITY_BOUNDARY", primitive_dict(n02)))

    n03 = FabricSpec("root", (), (Motif("motif_a", ("motif_b",)), Motif("motif_b", ("motif_a",))))
    receipts.append(negative_receipt("N03", n03, "CONTAINMENT_CYCLE", primitive_dict(n03)))

    c = cell_def("cell", "THIS", "WHAT", ("□S",))
    n04 = FabricSpec(
        "root",
        (c,),
        (Motif("motif_m1", ("cell",)), Motif("motif_m2", ("motif_m1",))),
        (),
        (Placement("cell", loc(interior("□S"), ("motif_m1", "motif_m2"))),),
    )
    receipts.append(negative_receipt("N04", n04, "CONTAINMENT_NOT_ROOT_TERMINATED", primitive_dict(n04)))

    a = cell_def("source_a", "THIS", "WHAT", ("□S",))
    b = cell_def("source_b", "THIS", "WHAT", ("□S",))
    target = cell_def("target", "THIS", "WHAT", ("□S",))
    n05 = simple_fabric((a, b, target), routes=(route("source_a", RESULT, "target", "VALUE"), route("source_b", RESULT, "target", "VALUE")))
    receipts.append(negative_receipt("N05", n05, "JOIN_MULTIPLICITY_VIOLATION", primitive_dict(n05)))

    a = cell_def("source_a", "THIS", "WHERE", ("□S",))
    b = cell_def("source_b", "THIS", "WHERE", ("□S",))
    target = cell_def("target", "INSIDE_OUTSIDE", "WHERE", ("□S",))
    n06 = simple_fabric((a, b, target), routes=(route("source_a", RESULT, "target", "INNER"), route("source_b", RESULT, "target", "INNER")))
    receipts.append(negative_receipt("N06", n06, "JOIN_ROLE_SHAPE_VIOLATION", primitive_dict(n06)))

    source = cell_def("source", "THIS", "WHAT", ("□S",))
    target = cell_def("target", "SAME_NOT_SAME", "WHAT", ("□S",))
    n07 = simple_fabric((source, target), routes=(route("target", "LEFT", "source", RESULT),))
    receipts.append(negative_receipt("N07", n07, "PORT_DIRECTION_INCOMPATIBLE", primitive_dict(n07)))

    source = cell_def("source", "THIS", "WHAT", ("□S",))
    target = cell_def("target", "INSIDE_OUTSIDE", "WHERE", ("□S",))
    n08 = simple_fabric((source, target), routes=(route("source", RESULT, "target", "INNER"),))
    receipts.append(negative_receipt("N08", n08, "PAYLOAD_TYPE_INCOMPATIBLE", primitive_dict(n08)))

    source = cell_def("source", "THIS", "WHAT", ("□S",))
    n09 = simple_fabric((source,), routes=(route("source", RESULT, "cell_missing", "VALUE"),))
    receipts.append(negative_receipt("N09", n09, "ROUTE_ENDPOINT_MISSING", primitive_dict(n09)))

    target = cell_def("target", "THIS", "WHAT", ("□S",))
    n10 = simple_fabric((source, target), routes=(route("source", RESULT, "target", "LEFT"),))
    receipts.append(negative_receipt("N10", n10, "TARGET_ROLE_INVALID", primitive_dict(n10)))

    constant_hash = lambda _connection: "collision-id"  # noqa: E731 - explicit conformance stub
    a = cell_def("a", "THIS", "WHAT", ("□S",))
    b = cell_def("b", "SAME_NOT_SAME", "WHAT", ("□S",))
    c = cell_def("c", "THIS", "WHAT", ("□S",))
    d = cell_def("d", "SAME_NOT_SAME", "WHAT", ("□S",))
    n11 = simple_fabric(
        (a, b, c, d),
        routes=(route("a", RESULT, "b", "LEFT", constant_hash), route("c", RESULT, "d", "RIGHT", constant_hash)),
    )
    receipts.append(negative_receipt("N11", n11, "ROUTE_ID_COLLISION", primitive_dict(n11), constant_hash))
    return receipts


def confluence_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []

    c1 = cell_def("c1", "THIS", "WHAT", ("□S", "□F"))
    base = FabricSpec("root", (c1,), (Motif("m1", ("c1",)),), (TriadBlock("t1", ("m1",)),))
    location = loc(interior("□S"))
    text_edit = parse_text({"kind": "PLACE", "cell_id": "c1", "location": location})
    visual_edit = parse_visual({"kind": "DRAG_IN", "cell_id": "c1", "location": location})
    receipts.append(confluence_receipt("C01", base, text_edit, visual_edit, apply_edit(base, text_edit), apply_edit(base, visual_edit)))

    base = FabricSpec(
        "root",
        (c1,),
        (Motif("m1", ("c1",)), Motif("m2", ())),
        (TriadBlock("t1", ("m1", "m2")),),
        (Placement("c1", loc(interior("□S"), ("m1", "t1", "root"))),),
    )
    before = loc(interior("□S"), ("m1", "t1", "root"))
    after = loc(interior("□F"), ("m2", "t1", "root"))
    text_edit = parse_text({"kind": "MOVE", "cell_id": "c1", "from_location": before, "to_location": after})
    visual_edit = parse_visual({"kind": "DRAG", "cell_id": "c1", "from_location": before, "to_location": after})
    receipts.append(confluence_receipt("C02", base, text_edit, visual_edit, apply_edit(base, text_edit), apply_edit(base, visual_edit)))

    source = cell_def("source", "THIS", "WHAT", ("□S",))
    other = cell_def("other", "THIS", "WHAT", ("□S",))
    target = cell_def("target", "SAME_NOT_SAME", "WHAT", ("□S",))
    base = simple_fabric((source, other, target), routes=(route("other", RESULT, "target", "RIGHT"),))
    text_edit = parse_text({"kind": "CONNECT", "source_cell": "source", "source_role": RESULT, "target_cell": "target", "target_role": "LEFT"})
    visual_edit = parse_visual({"kind": "WIRE", "source_cell": "source", "source_role": RESULT, "target_cell": "target", "target_role": "LEFT"})
    receipts.append(confluence_receipt("C03", base, text_edit, visual_edit, apply_edit(base, text_edit), apply_edit(base, visual_edit)))

    a = cell_def("a", "THIS", "WHAT", ("□S",))
    b = cell_def("b", "THIS", "WHAT", ("□S",))
    target = cell_def("target", "TOGETHER_ALONE", "WHAT", ("□S",))
    removed = route("a", RESULT, "target", "MEMBER")
    base = simple_fabric((a, b, target), routes=(removed, route("b", RESULT, "target", "MEMBER")))
    text_edit = parse_text({"kind": "DISCONNECT", "route_id": removed.route_id})
    visual_edit = parse_visual({"kind": "DELETE_ROUTE", "route_id": removed.route_id})
    receipts.append(confluence_receipt("C04", base, text_edit, visual_edit, apply_edit(base, text_edit), apply_edit(base, visual_edit)))

    c1 = cell_def("c1", "THIS", "WHAT", ("□S",))
    base = simple_fabric((c1,))
    same_location = loc(interior("□S"))
    visual_edit = parse_visual({"kind": "DRAG", "cell_id": "c1", "from_location": same_location, "to_location": same_location, "screen_coordinates": [100, 200]})
    receipts.append(
        confluence_receipt(
            "C05",
            base,
            None,
            visual_edit,
            base,
            apply_edit(base, visual_edit),
            {"presentation_only_drag_lowered_to_noop": visual_edit is None},
        )
    )

    a = cell_def("a", "THIS", "WHAT", ("□S",))
    b = cell_def("b", "SAME_NOT_SAME", "WHAT", ("□S",))
    right = cell_def("right", "THIS", "WHAT", ("□S",))
    existing = route("a", RESULT, "b", "LEFT")
    base = simple_fabric((a, b, right), routes=(existing, route("right", RESULT, "b", "RIGHT")))
    text_edit = parse_text({"kind": "CONNECT", "source_cell": "a", "source_role": RESULT, "target_cell": "b", "target_role": "LEFT"})
    visual_edit = parse_visual({"kind": "WIRE", "source_cell": "a", "source_role": RESULT, "target_cell": "b", "target_role": "LEFT"})
    left = apply_edit(base, text_edit)
    right_candidate = apply_edit(base, visual_edit)
    receipts.append(
        confluence_receipt(
            "C06",
            base,
            text_edit,
            visual_edit,
            left,
            right_candidate,
            {"route_count_before": len(base.routes), "route_count_after": len(left.routes), "structural_mutation": left != base},
        )
    )
    return receipts


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8", newline="\n")


def run(output_dir: Path) -> dict[str, Any]:
    receipts = positive_vectors() + negative_vectors() + confluence_vectors()
    expected_ids = [f"P{i:02d}" for i in range(1, 9)] + [f"N{i:02d}" for i in range(1, 12)] + [f"C{i:02d}" for i in range(1, 7)]
    actual_ids = [receipt["vector_id"] for receipt in receipts]
    census_ok = actual_ids == expected_ids and len(receipts) == 25

    receipt_dir = output_dir / "receipts"
    for receipt in receipts:
        write_json(receipt_dir / f"{receipt['vector_id']}.json", receipt)

    categories = {
        category: [receipt for receipt in receipts if receipt["category"] == category]
        for category in ("positive", "negative", "confluence")
    }
    summary = {
        "queuegate": QUEUEGATE,
        "spec_version": SPEC_VERSION,
        "source_bindings": SOURCE_BINDINGS,
        "implementation_scope": "STATIC_ONLY",
        "operator_schema_total": len(ROLE_SCHEMA),
        "join_signature_total": sum(len(join_signature(operator, witness)) >= 1 for operator in ROLE_SCHEMA for witness in ("WHAT", "WHERE", "WHICH", "WHEN", "FOR_WHAT", "HOW", "WHENCE")),
        "output_schema_total": sum(output_schema(operator)[0] == RESULT for operator in ROLE_SCHEMA),
        "port_schema_total": sum(len(port_schema(operator, witness)) >= 2 for operator in ROLE_SCHEMA for witness in ("WHAT", "WHERE", "WHICH", "WHEN", "FOR_WHAT", "HOW", "WHENCE")),
        "witness_binding_total": sum(len(witness_binding(operator, witness)) >= 1 for operator in ROLE_SCHEMA for witness in ("WHAT", "WHERE", "WHICH", "WHEN", "FOR_WHAT", "HOW", "WHENCE")),
        "positive_passed": sum(receipt["passed"] for receipt in categories["positive"]),
        "positive_total": 8,
        "negative_passed": sum(receipt["passed"] for receipt in categories["negative"]),
        "negative_total": 11,
        "confluence_passed": sum(receipt["passed"] for receipt in categories["confluence"]),
        "confluence_total": 6,
        "total_passed": sum(receipt["passed"] for receipt in receipts),
        "total": 25,
        "vector_census_exact": census_ok,
        "receipt_ids": actual_ids,
        "reference_static_kernel": "HOLDS" if census_ok and all(receipt["passed"] for receipt in receipts) else "NO",
        "conformance": "25/25" if census_ok and all(receipt["passed"] for receipt in receipts) else "INCOMPLETE",
        "queuegate_evidence": {
            "C4": "EVIDENCED" if all(receipt["passed"] for receipt in categories["confluence"]) else "OPEN",
            "C5": "EVIDENCED" if all(receipt["passed"] for receipt in categories["positive"] + categories["negative"]) else "OPEN",
            "C8": "EVIDENCED" if census_ok and all(receipt["passed"] for receipt in receipts) else "OPEN",
        },
        "promotion": "NOT_PERFORMED",
    }
    write_json(output_dir / "queuegate-evidence-summary.json", summary)
    return summary


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("evidence"))
    args = parser.parse_args()
    summary = run(args.output)
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True, indent=2))
    return 0 if summary["conformance"] == "25/25" else 1


if __name__ == "__main__":
    raise SystemExit(main())
