"""Execute the frozen 62-vector V3.2 admission conformance corpus."""

from __future__ import annotations

import argparse
from dataclasses import replace
from hashlib import sha256
import json
from pathlib import Path
from typing import Any, Callable

from admission_kernel import (
    ADR_CLASS,
    ALLOWED_EDIT_TYPES,
    CANDIDATE,
    CROSSING_LAWS,
    Distribution,
    EvidenceBundle,
    ExtendedDRCContext,
    IF_THEN,
    LOCAL,
    MAYBE,
    MetricInput,
    NO,
    NOT_SAME,
    PROMOTED,
    Q32,
    REJECTED,
    SANDBOX,
    SPEC_SHA256,
    SPEC_VERSION,
    ToleranceProfile,
    CandidateRecord,
    canonical_digest,
    canonical_json,
    compose_terminal,
    distribution_at_distance,
    evaluate_admission,
    evaluate_crossing,
    evaluate_metrics,
    evaluate_pipeline,
    evidence_repair,
    extended_drc,
    import_identities,
    lifecycle_transition,
    rank_repairs,
    structural_repair,
    build_candidate,
    parse_surface,
    v31,
)


QUEUEGATE = "Q-SWFPGA-ADMISSIBILITY-001"
HERE = Path(__file__).resolve().parent
CLASSES = {
    "positive": [f"PA{i:02d}" for i in range(1, 11)],
    "negative": [f"NA{i:02d}" for i in range(1, 23)],
    "quantitative": [f"QA{i:02d}" for i in range(1, 5)],
    "crossing": [f"XA{i:02d}" for i in range(1, 9)],
    "repair": [f"RA{i:02d}" for i in range(1, 9)],
    "lifecycle": [f"LA{i:02d}" for i in range(1, 9)],
    "confluence": [f"CA{i:02d}" for i in range(1, 3)],
}


def location(dimension: str) -> Any:
    return v31.Location(v31.interior(f"□{dimension}"), ("m1", "t1", "root"))


def fabric(source_dimension: str, target_dimension: str, *, mediator: bool = False) -> Any:
    cells = [
        v31.cell_def("src", "THIS", "WHAT", ("□G", "□S", "□F")),
        v31.cell_def("dst", "THIS", "WHAT", ("□G", "□S", "□F")),
    ]
    positions = {"src": source_dimension, "dst": target_dimension}
    if mediator:
        cells.append(v31.cell_def("mid", "THIS", "WHAT", ("□G", "□S", "□F")))
        positions["mid"] = "S"
    children = tuple(cell.cell_id for cell in cells)
    return v31.FabricSpec(
        "root",
        tuple(cells),
        (v31.Motif("m1", children),),
        (v31.TriadBlock("t1", ("m1",)),),
        tuple(v31.Placement(cell.cell_id, location(positions[cell.cell_id])) for cell in cells),
        (),
    )


def connect_projection(source: str = "src", target: str = "dst") -> dict[str, str]:
    return {
        "kind": "CONNECT",
        "source_cell": source,
        "source_role": "RESULT",
        "target_cell": target,
        "target_role": "VALUE",
    }


def connect_core(source_dimension: str, target_dimension: str) -> Any:
    base = fabric(source_dimension, target_dimension)
    edit = v31.ConnectEdit("src", "RESULT", "dst", "VALUE")
    return build_candidate(base, edit)


def full_evidence(core: Any) -> EvidenceBundle:
    artifacts_by_class = {
        LOCAL: (),
        "G->S": ("G_provenance", "S_structural_certificate"),
        "S->G": ("S_structural_certificate", "CertifyG", "MetaGate", "Pattern-A"),
        "S->F": ("FarkasCheck",),
        "F->S": ("F_execution_evidence", "S_structural_registration"),
        "G->F": ("G_provenance", "S_structural_certificate", "F_execution_evidence"),
        "F->G": (
            "F_execution_evidence",
            "S_structural_certificate",
            "CertifyG",
            "MetaGate",
            "Pattern-A",
        ),
    }
    capabilities = () if core.crossing_class == LOCAL else CROSSING_LAWS[core.crossing_class].required_capabilities
    return EvidenceBundle(
        core.digest,
        capabilities,
        tuple((name, True) for name in artifacts_by_class[core.crossing_class]),
    )


def metric_input(w_num: int = 0, w_den: int = 1, s_num: int = 0, s_den: int = 1) -> MetricInput:
    return MetricInput(
        (("WHAT", distribution_at_distance(w_num, w_den)),),
        (("route_shape", distribution_at_distance(s_num, s_den)),),
    )


DEFAULT_TOLERANCE = ToleranceProfile(Q32.ratio(1, 2), Q32.ratio(1, 2))


def make_receipt(
    vector_id: str,
    vector_class: str,
    *,
    expected: Any,
    actual: Any,
    core: Any | None = None,
    metrics: Any | None = None,
    crossing: Any | None = None,
    extended: Any | None = None,
    tolerance: ToleranceProfile = DEFAULT_TOLERANCE,
    lifecycle_before: str | None = None,
    lifecycle_after: str | None = None,
    repair_kind: str | None = None,
    repair_rule: str | None = None,
    parent_candidate_digest: str | None = None,
    extra: dict[str, Any] | None = None,
    condition: bool = True,
) -> dict[str, Any]:
    if core is not None:
        v31_result = v31.drc(core.successor).verdict
        candidate_digest = core.digest
        crossing_class = core.crossing_class
    else:
        v31_result = None
        candidate_digest = None
        crossing_class = None
    record = {
        "vector_id": vector_id,
        "class": vector_class,
        "spec_version": SPEC_VERSION,
        "input_digest": canonical_digest({"vector_id": vector_id, "expected": expected}),
        "candidate_digest": candidate_digest,
        "v3_1_drc_result": v31_result,
        "extended_drc_result": extended.verdict if extended else None,
        "extended_drc_reason_code": extended.reason_code if extended else None,
        "d_WV": metrics.d_wv.raw if metrics else None,
        "epsilon_W": tolerance.epsilon_w.raw if metrics else None,
        "d_SV_core": metrics.d_sv_core.raw if metrics else None,
        "residual_ratio": metrics.residual_ratio.raw if metrics else None,
        "d_SV": metrics.d_sv.raw if metrics else None,
        "epsilon_S": tolerance.epsilon_s.raw if metrics else None,
        "d_joint": metrics.d_joint.raw if metrics else None,
        "q32_scale": Q32.SCALE,
        "crossing_class": crossing_class,
        "required_capabilities": list(crossing.required_capabilities) if crossing else None,
        "crossing_verdict": crossing.verdict if crossing else None,
        "lifecycle_before": lifecycle_before,
        "lifecycle_after": lifecycle_after,
        "repair_kind": repair_kind,
        "repair_rule": repair_rule,
        "parent_candidate_digest": parent_candidate_digest,
        "terminal_verdict": actual if isinstance(actual, str) else None,
        "expected": expected,
        "actual": actual,
        "pass": actual == expected and condition,
    }
    if extra:
        record["observations"] = extra
    return record


def terminal_case(
    vector_id: str,
    vector_class: str,
    source: str,
    target: str,
    *,
    metric: MetricInput | None = None,
    tolerance: ToleranceProfile = DEFAULT_TOLERANCE,
    evidence_builder: Callable[[Any], EvidenceBundle] = full_evidence,
    expected: str = IF_THEN,
) -> dict[str, Any]:
    core = connect_core(source, target)
    metrics = evaluate_metrics(metric or metric_input(1, 4, 1, 4), tolerance)
    crossing = evaluate_crossing(core, evidence_builder(core))
    extended = extended_drc(ExtendedDRCContext())
    terminal = compose_terminal(
        v3_1_drc_result=v31.drc(core.successor).verdict,
        extended_result=extended,
        metrics=metrics,
        crossing=crossing,
    )
    return make_receipt(
        vector_id,
        vector_class,
        expected=expected,
        actual=terminal,
        core=core,
        metrics=metrics,
        crossing=crossing,
        extended=extended,
        tolerance=tolerance,
    )


def positive_vectors() -> list[dict[str, Any]]:
    receipts = [
        terminal_case("PA01", "positive", "S", "S"),
        terminal_case("PA02", "positive", "G", "S"),
        terminal_case("PA03", "positive", "S", "F"),
        terminal_case("PA04", "positive", "F", "S"),
        terminal_case("PA05", "positive", "S", "G"),
        terminal_case("PA06", "positive", "G", "F"),
        terminal_case("PA07", "positive", "F", "G"),
        terminal_case("PA08", "positive", "S", "S", metric=metric_input(1, 2, 1, 4)),
        terminal_case("PA09", "positive", "S", "S", metric=metric_input(1, 4, 1, 2)),
    ]
    core = connect_core("G", "S")
    partial = EvidenceBundle(core.digest, ("G", "S"), (("G_provenance", True),))
    initial = evaluate_crossing(core, partial)
    record = CandidateRecord(core, partial, CANDIDATE, MAYBE, (MAYBE,), ())
    repaired_evidence = full_evidence(core)
    proposal = evidence_repair(record, repaired_evidence, "supply S structural certificate")
    result = evaluate_crossing(proposal.candidate_core, proposal.evidence_bundle)
    receipts.append(
        make_receipt(
            "PA10",
            "positive",
            expected=IF_THEN,
            actual=result.verdict,
            core=core,
            crossing=result,
            lifecycle_before=CANDIDATE,
            lifecycle_after=lifecycle_transition(CANDIDATE, result.verdict),
            repair_kind=proposal.kind,
            parent_candidate_digest=proposal.parent_candidate_digest,
            condition=initial.verdict == MAYBE and same_core(record.core, proposal.candidate_core),
        )
    )
    return receipts


def same_core(left: Any, right: Any) -> bool:
    return left.digest == right.digest


def negative_vectors() -> list[dict[str, Any]]:
    mutations: list[tuple[str, dict[str, Any]]] = [
        ("ADR01", {"import_kernel_hash": "0" * 64}),
        ("ADR02", {"successor_integrity": False}),
        ("ADR03", {"route_in_successor": False}),
        ("ADR04", {"crossing_class_coherent": False}),
        ("ADR05", {"local_has_crossing_law": True}),
        ("ADR06", {"crossing_law_count": 0}),
        ("ADR07", {"tolerance_valid": False}),
        ("ADR08", {"epsilon_joint": Q32.ratio(1, 2)}),
        ("ADR09", {"evidence_schema_valid": False}),
        ("ADR10", {"evidence_subject_matches": False}),
        ("ADR11", {"lifecycle_verdict_coherent": False}),
        ("ADR12", {"promotion_receipt_present": False}),
        ("ADR13", {"authority_chain_valid": False}),
        ("ADR14", {"evidence_repair_core_same": False}),
        ("ADR15", {"structural_repair_core_different": False}),
        ("ADR16", {"repair_edit_types": ("NonV31Edit",)}),
        ("ADR17", {"repair_semantic": ("MOVE", "WHERE", "MOVE")}),
        ("ADR18", {"repair_rule": "SR-4"}),
        ("ADR19", {"repair_genealogy_present": False}),
        ("ADR20", {"structural_repair_lifecycle": CANDIDATE}),
        ("ADR21", {"ranking_pairwise_admissible": False}),
        ("ADR22", {"deterministic_tiebreak": False}),
    ]
    core = connect_core("S", "S")
    receipts: list[dict[str, Any]] = []
    for index, (code, changes) in enumerate(mutations, 1):
        result = extended_drc(replace(ExtendedDRCContext(), **changes))
        expected = ADR_CLASS[code]
        receipts.append(
            make_receipt(
                f"NA{index:02d}",
                "negative",
                expected=expected,
                actual=result.verdict,
                core=core,
                extended=result,
                condition=result.reason_code == code and result.verdict != MAYBE,
            )
        )
    return receipts


def quantitative_vectors() -> list[dict[str, Any]]:
    cases = [
        ("QA01", metric_input(3, 4, 1, 4), DEFAULT_TOLERANCE),
        ("QA02", metric_input(1, 4, 3, 4), DEFAULT_TOLERANCE),
        ("QA03", metric_input(3, 4, 3, 4), DEFAULT_TOLERANCE),
        (
            "QA04",
            metric_input(1, 2, 1, 2),
            ToleranceProfile(Q32.ratio(1, 4), Q32.ratio(3, 4)),
        ),
    ]
    core = connect_core("S", "S")
    receipts = []
    for vector_id, inputs, tolerance in cases:
        metrics = evaluate_metrics(inputs, tolerance)
        scalar_would_admit = metrics.d_joint <= max(tolerance.epsilon_w, tolerance.epsilon_s)
        receipts.append(
            make_receipt(
                vector_id,
                "quantitative",
                expected=NO,
                actual=metrics.verdict,
                core=core,
                metrics=metrics,
                tolerance=tolerance,
                extra={
                    "actual_epsilon_W": tolerance.epsilon_w.raw,
                    "actual_epsilon_S": tolerance.epsilon_s.raw,
                    "scalar_joint_rule_would_admit": scalar_would_admit,
                },
                condition=(vector_id != "QA04" or scalar_would_admit),
            )
        )
    return receipts


def crossing_vectors() -> list[dict[str, Any]]:
    receipts = [
        terminal_case("XA01", "crossing", "G", "S"),
        terminal_case("XA02", "crossing", "S", "G"),
        terminal_case("XA03", "crossing", "S", "F"),
        terminal_case("XA04", "crossing", "F", "S"),
    ]

    def missing_s(core: Any) -> EvidenceBundle:
        caps = tuple(cap for cap in CROSSING_LAWS[core.crossing_class].required_capabilities if cap != "S")
        return EvidenceBundle(core.digest, caps, ())

    receipts.extend(
        [
            terminal_case("XA05", "crossing", "G", "F", evidence_builder=missing_s, expected=NO),
            terminal_case("XA06", "crossing", "G", "F"),
            terminal_case("XA07", "crossing", "F", "G", evidence_builder=missing_s, expected=NO),
            terminal_case("XA08", "crossing", "F", "G"),
        ]
    )
    return receipts


def repair_fixtures() -> tuple[Any, Any, Any]:
    base = fabric("G", "F", mediator=True)
    parent = build_candidate(base, v31.ConnectEdit("src", "RESULT", "dst", "VALUE"))
    sr1_edits = (
        v31.ConnectEdit("src", "RESULT", "mid", "VALUE"),
        v31.ConnectEdit("mid", "RESULT", "dst", "VALUE"),
    )
    proposal = structural_repair(
        parent,
        rule="SR-1",
        edits=sr1_edits,
        evidence=EvidenceBundle(parent.digest),
        because="mediate diagonal through existing S cell",
    )
    return base, parent, proposal


def repair_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []
    core = connect_core("G", "S")
    partial = EvidenceBundle(core.digest, ("G", "S"), (("G_provenance", True),))
    record = CandidateRecord(core, partial, CANDIDATE, MAYBE, (MAYBE,), ())

    complete = evidence_repair(record, full_evidence(core), "complete evidence")
    complete_result = evaluate_crossing(complete.candidate_core, complete.evidence_bundle)
    receipts.append(
        make_receipt(
            "RA01",
            "repair",
            expected=IF_THEN,
            actual=complete_result.verdict,
            core=core,
            crossing=complete_result,
            repair_kind=complete.kind,
            parent_candidate_digest=complete.parent_candidate_digest,
            condition=complete.candidate_core.digest == core.digest,
        )
    )

    still_partial = evidence_repair(record, partial, "evidence remains incomplete")
    partial_result = evaluate_crossing(still_partial.candidate_core, still_partial.evidence_bundle)
    receipts.append(
        make_receipt(
            "RA02",
            "repair",
            expected=MAYBE,
            actual=partial_result.verdict,
            core=core,
            crossing=partial_result,
            repair_kind=still_partial.kind,
            parent_candidate_digest=still_partial.parent_candidate_digest,
        )
    )

    base, parent, sr1 = repair_fixtures()
    sr1_drc = v31.drc(sr1.candidate_core.successor).verdict
    route_classes = sorted(
        {
            derive_route_class(sr1.candidate_core.successor, item.route_id)
            for item in sr1.candidate_core.successor.routes
        }
    )
    receipts.append(
        make_receipt(
            "RA03",
            "repair",
            expected=IF_THEN,
            actual=sr1_drc,
            core=sr1.candidate_core,
            repair_kind=sr1.kind,
            repair_rule=sr1.rule,
            parent_candidate_digest=sr1.parent_candidate_digest,
            extra={"route_classes": route_classes},
            condition=route_classes == ["G->S", "S->F"],
        )
    )

    dst_before = location("F")
    sr2_edits = (
        v31.MoveEdit("dst", dst_before, location("S")),
        v31.ConnectEdit("src", "RESULT", "dst", "VALUE"),
    )
    sr2 = structural_repair(
        parent,
        rule="SR-2",
        edits=sr2_edits,
        evidence=EvidenceBundle(parent.digest),
        because="relocate destination to governed S boundary",
    )
    sr2_crossing = evaluate_crossing(sr2.candidate_core, full_evidence(sr2.candidate_core))
    receipts.append(
        make_receipt(
            "RA04",
            "repair",
            expected=IF_THEN,
            actual=sr2_crossing.verdict,
            core=sr2.candidate_core,
            crossing=sr2_crossing,
            repair_kind=sr2.kind,
            repair_rule=sr2.rule,
            parent_candidate_digest=sr2.parent_candidate_digest,
            condition=sr2.candidate_core.crossing_class == "G->S",
        )
    )

    route_item = v31.route("src", "RESULT", "dst", "VALUE")
    routed_base = replace(fabric("G", "F"), routes=(route_item,))
    parent_for_disconnect = build_candidate(
        routed_base,
        v31.MoveEdit("dst", location("F"), location("G")),
    )
    sr3 = structural_repair(
        parent_for_disconnect,
        rule="SR-3",
        edits=(v31.DisconnectEdit(route_item.route_id),),
        evidence=EvidenceBundle(parent_for_disconnect.digest),
        because="remove the rejected crossing",
    )
    receipts.append(
        make_receipt(
            "RA05",
            "repair",
            expected=IF_THEN,
            actual=v31.drc(sr3.candidate_core.successor).verdict,
            core=sr3.candidate_core,
            repair_kind=sr3.kind,
            repair_rule=sr3.rule,
            parent_candidate_digest=sr3.parent_candidate_digest,
            condition=len(sr3.candidate_core.successor.routes) == 0,
        )
    )

    first_leg = evaluate_pipeline(
        base=base,
        surface="TEXT",
        projection=connect_projection("src", "mid"),
        tolerance=DEFAULT_TOLERANCE,
        metric_input=metric_input(1, 4, 1, 4),
        evidence_factory=full_evidence,
    )
    second_leg = evaluate_pipeline(
        base=first_leg.core.successor,
        surface="TEXT",
        projection=connect_projection("mid", "dst"),
        tolerance=DEFAULT_TOLERANCE,
        metric_input=metric_input(1, 4, 1, 4),
        evidence_factory=full_evidence,
    )
    sr1_terminal = IF_THEN if (
        first_leg.terminal_verdict == IF_THEN
        and second_leg.terminal_verdict == IF_THEN
        and canonical_digest(v31.normalize(second_leg.core.successor))
        == canonical_digest(v31.normalize(sr1.candidate_core.successor))
    ) else NO
    receipts.append(
        make_receipt(
            "RA06",
            "repair",
            expected=IF_THEN,
            actual=sr1_terminal,
            core=sr1.candidate_core,
            metrics=second_leg.metrics,
            crossing=second_leg.crossing,
            extended=second_leg.extended,
            lifecycle_before=sr1.lifecycle,
            lifecycle_after=lifecycle_transition(sr1.lifecycle, sr1_terminal),
            repair_kind=sr1.kind,
            repair_rule=sr1.rule,
            parent_candidate_digest=sr1.parent_candidate_digest,
            extra={
                "first_leg": first_leg.terminal_verdict,
                "second_leg": second_leg.terminal_verdict,
                "repaired_successor_match": sr1_terminal == IF_THEN,
            },
        )
    )

    low_metric = evaluate_metrics(metric_input(1, 4, 1, 4), DEFAULT_TOLERANCE)
    high_metric = evaluate_metrics(metric_input(1, 2, 1, 2), DEFAULT_TOLERANCE)
    ranked = rank_repairs(
        (
            (sr2, high_metric, IF_THEN, IF_THEN, IF_THEN),
            (sr1, low_metric, IF_THEN, IF_THEN, IF_THEN),
        )
    )
    receipts.append(
        make_receipt(
            "RA07",
            "repair",
            expected=sr1.candidate_core.digest,
            actual=ranked[0].candidate_core.digest,
            core=sr1.candidate_core,
            repair_kind="STRUCTURAL_REPAIR_FIBER",
            extra={"ranked_count": len(ranked)},
        )
    )

    lower_but_inadmissible = evaluate_metrics(metric_input(1, 8, 1, 8), DEFAULT_TOLERANCE)
    ranked = rank_repairs(
        (
            (sr2, high_metric, IF_THEN, IF_THEN, IF_THEN),
            (sr1, lower_but_inadmissible, IF_THEN, IF_THEN, NO),
        )
    )
    receipts.append(
        make_receipt(
            "RA08",
            "repair",
            expected=sr2.candidate_core.digest,
            actual=ranked[0].candidate_core.digest,
            core=sr2.candidate_core,
            repair_kind="STRUCTURAL_REPAIR_FIBER",
            extra={"inadmissible_lower_d_joint": lower_but_inadmissible.d_joint.raw},
        )
    )
    return receipts


def derive_route_class(fabric_value: Any, route_id: str) -> str:
    from admission_kernel import derive_crossing_class

    return derive_crossing_class(fabric_value, route_id)


def lifecycle_vectors() -> list[dict[str, Any]]:
    cases = [
        ("LA01", SANDBOX, IF_THEN, PROMOTED),
        ("LA02", SANDBOX, MAYBE, CANDIDATE),
        ("LA03", SANDBOX, NO, REJECTED),
        ("LA04", SANDBOX, NOT_SAME, REJECTED),
        ("LA05", CANDIDATE, MAYBE, CANDIDATE),
        ("LA06", CANDIDATE, IF_THEN, PROMOTED),
        ("LA07", CANDIDATE, NO, REJECTED),
        ("LA08", CANDIDATE, NOT_SAME, REJECTED),
    ]
    return [
        make_receipt(
            vector_id,
            "lifecycle",
            expected=expected,
            actual=lifecycle_transition(before, verdict),
            lifecycle_before=before,
            lifecycle_after=lifecycle_transition(before, verdict),
            extra={"input_verdict": verdict},
        )
        for vector_id, before, verdict, expected in cases
    ]


def confluence_vectors() -> list[dict[str, Any]]:
    base = fabric("G", "S")
    projection = connect_projection()
    text_edit = parse_surface("TEXT", projection)
    visual_edit = parse_surface("VISUAL", projection)
    text_core = build_candidate(base, text_edit)
    visual_core = build_candidate(base, visual_edit)
    text_outcome = evaluate_pipeline(
        base=base,
        surface="TEXT",
        projection=projection,
        tolerance=DEFAULT_TOLERANCE,
        metric_input=metric_input(1, 4, 1, 4),
        evidence_factory=full_evidence,
    )
    visual_outcome = evaluate_pipeline(
        base=base,
        surface="VISUAL",
        projection=projection,
        tolerance=DEFAULT_TOLERANCE,
        metric_input=metric_input(1, 4, 1, 4),
        evidence_factory=full_evidence,
    )
    ca01_actual = IF_THEN if (
        text_core.digest == visual_core.digest
        and text_outcome.terminal_verdict == visual_outcome.terminal_verdict
        and text_outcome.observable_digest == visual_outcome.observable_digest
    ) else NOT_SAME
    receipts = [
        make_receipt(
            "CA01",
            "confluence",
            expected=IF_THEN,
            actual=ca01_actual,
            core=text_core,
            extra={
                "text_terminal": text_outcome.terminal_verdict,
                "visual_terminal": visual_outcome.terminal_verdict,
                "text_observable_digest": text_outcome.observable_digest,
                "visual_observable_digest": visual_outcome.observable_digest,
            },
        )
    ]

    repair_base = fabric("G", "F", mediator=True)
    repair_projection = connect_projection()
    parent_text = build_candidate(repair_base, parse_surface("TEXT", repair_projection))
    parent_visual = build_candidate(repair_base, parse_surface("VISUAL", repair_projection))
    edits = (
        v31.ConnectEdit("src", "RESULT", "mid", "VALUE"),
        v31.ConnectEdit("mid", "RESULT", "dst", "VALUE"),
    )
    repaired_text = structural_repair(
        parent_text,
        rule="SR-1",
        edits=edits,
        evidence=EvidenceBundle(parent_text.digest),
        because="canonical mediation",
    )
    repaired_visual = structural_repair(
        parent_visual,
        rule="SR-1",
        edits=edits,
        evidence=EvidenceBundle(parent_visual.digest),
        because="canonical mediation",
    )
    reevaluation_text = v31.drc(repaired_text.candidate_core.successor).verdict
    reevaluation_visual = v31.drc(repaired_visual.candidate_core.successor).verdict
    ca02_actual = IF_THEN if (
        repaired_text.candidate_core.digest == repaired_visual.candidate_core.digest
        and reevaluation_text == reevaluation_visual == IF_THEN
    ) else NOT_SAME
    receipts.append(
        make_receipt(
            "CA02",
            "confluence",
            expected=IF_THEN,
            actual=ca02_actual,
            core=repaired_text.candidate_core,
            repair_kind=repaired_text.kind,
            repair_rule=repaired_text.rule,
            parent_candidate_digest=repaired_text.parent_candidate_digest,
            extra={
                "text_repaired_digest": repaired_text.candidate_core.digest,
                "visual_repaired_digest": repaired_visual.candidate_core.digest,
                "text_re_evaluation": reevaluation_text,
                "visual_re_evaluation": reevaluation_visual,
            },
        )
    )
    return receipts


def all_receipts() -> list[dict[str, Any]]:
    pipeline_self_checks()
    receipts = (
        positive_vectors()
        + negative_vectors()
        + quantitative_vectors()
        + crossing_vectors()
        + repair_vectors()
        + lifecycle_vectors()
        + confluence_vectors()
    )
    expected_ids = [item for values in CLASSES.values() for item in values]
    actual_ids = [receipt["vector_id"] for receipt in receipts]
    if actual_ids != expected_ids:
        raise AssertionError(f"vector census/order mismatch: {actual_ids}")
    return receipts


def pipeline_self_checks() -> None:
    """Exercise total early exits without adding vectors to the frozen census."""

    base = fabric("G", "S")
    no_op = evaluate_admission(
        base=base,
        surface="VISUAL",
        projection={
            "kind": "DRAG",
            "cell_id": "dst",
            "from_location": location("S"),
            "to_location": location("S"),
        },
        tolerance=DEFAULT_TOLERANCE,
        metric_input=metric_input(),
        evidence_factory=EvidenceBundle("unused"),
    )
    if no_op.disposition != "NO_OP":
        raise AssertionError("total pipeline no-op boundary failed")

    parse_failure = evaluate_admission(
        base=base,
        surface="TEXT",
        projection={"kind": "UNKNOWN"},
        tolerance=DEFAULT_TOLERANCE,
        metric_input=metric_input(),
        evidence_factory=EvidenceBundle("unused"),
    )
    if parse_failure.disposition != "PARSE_FAILURE":
        raise AssertionError("total pipeline parse-failure boundary failed")

    drc_failure = evaluate_admission(
        base=base,
        surface="TEXT",
        projection={**connect_projection(), "target_role": "NOT_A_ROLE"},
        tolerance=DEFAULT_TOLERANCE,
        metric_input=metric_input(),
        evidence_factory=EvidenceBundle("unused"),
    )
    if drc_failure.disposition != "DRC_REJECTION":
        raise AssertionError("total pipeline DRC boundary failed")

    admitted = evaluate_admission(
        base=base,
        surface="TEXT",
        projection=connect_projection(),
        tolerance=DEFAULT_TOLERANCE,
        metric_input=metric_input(1, 4, 1, 4),
        evidence_factory=full_evidence,
    )
    if admitted.disposition != "ADMIT" or admitted.terminal_verdict != IF_THEN:
        raise AssertionError("total pipeline admission boundary failed")

    undefined_observation = MetricInput(
        (("WHAT", Distribution(Q32.zero(), Q32.zero(), Q32.one())),),
        (),
    )
    undefined_result = evaluate_metrics(undefined_observation, DEFAULT_TOLERANCE)
    if undefined_result.verdict == MAYBE:
        raise AssertionError("quantitative undefined observation leaked governance MAYBE")


def build_summary(receipts: list[dict[str, Any]]) -> dict[str, Any]:
    counts: dict[str, dict[str, int]] = {}
    for vector_class, vector_ids in CLASSES.items():
        selected = [receipt for receipt in receipts if receipt["class"] == vector_class]
        counts[vector_class] = {
            "passed": sum(1 for receipt in selected if receipt["pass"]),
            "total": len(vector_ids),
        }
    total_passed = sum(1 for receipt in receipts if receipt["pass"])
    artifact_paths = {
        "admission_kernel_sha256": HERE / "admission_kernel.py",
        "conformance_runner_sha256": HERE / "run_conformance.py",
        "proof_adm_3_nonexp_sha256": HERE / "PROOF_ADM_3_NONEXP.md",
        "v3_1_import_manifest_sha256": HERE / "V3_1_IMPORT_MANIFEST.md",
    }
    return {
        "queuegate": QUEUEGATE,
        "obligation": "O-SWFPGA-ADMISSIBILITY-1",
        "spec_version": SPEC_VERSION,
        "spec_sha256": SPEC_SHA256,
        "v3_1_import": "UNCHANGED",
        "v3_1_import_identities": import_identities(),
        "artifact_bindings": {
            name: sha256(path.read_bytes()).hexdigest()
            for name, path in sorted(artifact_paths.items())
        },
        "reference_admission_kernel": "HOLDS" if total_passed == 62 else "FAILS",
        "counts": counts,
        "total_passed": total_passed,
        "total": 62,
        "conformance": f"{total_passed}/62",
        "receipt_ids": [receipt["vector_id"] for receipt in receipts],
        "evidence_artifact_count": 63,
        "deterministic_encoding": {
            "timestamps": False,
            "random_uuids": False,
            "unordered_serialization": False,
            "filesystem_order_dependency": False,
            "process_order_dependency": False,
        },
        "proof_adm_3_nonexp": "PRESENT",
        "v3_3_leakage": "NONE",
        "promotion": "NOT_PERFORMED",
    }


def write_evidence(output: Path, receipts: list[dict[str, Any]], summary: dict[str, Any]) -> None:
    output.mkdir(parents=True, exist_ok=True)
    receipts_dir = output / "receipts"
    receipts_dir.mkdir(parents=True, exist_ok=True)
    for receipt in receipts:
        (receipts_dir / f"{receipt['vector_id']}.json").write_text(
            canonical_json(receipt, pretty=True),
            encoding="utf-8",
            newline="\n",
        )
    (output / "queuegate-evidence-summary.json").write_text(
        canonical_json(summary, pretty=True),
        encoding="utf-8",
        newline="\n",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent / "evidence")
    args = parser.parse_args()
    receipts = all_receipts()
    summary = build_summary(receipts)
    write_evidence(args.output, receipts, summary)
    print(canonical_json(summary, pretty=True), end="")
    return 0 if summary["total_passed"] == summary["total"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
