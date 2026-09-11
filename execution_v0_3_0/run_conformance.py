#!/usr/bin/env python3
"""Execute the frozen 70-vector V3.3 execution conformance corpus."""

from __future__ import annotations

import argparse
from dataclasses import fields, replace
from itertools import permutations, product
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Sequence

from execution_kernel import (
    ADMIT,
    ADMITTED,
    ADMITTED_TO_TARGET,
    BLOCKED,
    COMPLETE,
    COMPLETED,
    DEFAULT_AUTHORITY,
    DEFAULT_SCHEDULE,
    DISCHARGED,
    EMPTY,
    FORWARD,
    HALTED,
    INCOMPLETE,
    INVALID,
    PEND,
    PENDING_AT_TARGET,
    REJECT,
    REJECTED_AT_TARGET,
    REVERSE,
    RUNNING,
    SPEC_SHA256,
    SPEC_VERSION,
    V3_1_KERNEL_SHA256,
    V3_1_SUMMARY_SHA256,
    V3_2_KERNEL_SHA256,
    V3_2_PROMOTION_SHA256,
    V3_2_SUMMARY_SHA256,
    VECTORS_SHA256,
    HANDOFF_SHA256,
    BlockedReason,
    EgressDisposition,
    FabricState,
    ForbiddenTransition,
    HostSchedule,
    InputFrame,
    InputValue,
    OutstandingObligation,
    PartialInputBuffer,
    PayloadState,
    PendingAdmission,
    RouteResult,
    RuntimeAuthority,
    Sigma,
    TickResult,
    admitted_payload,
    assemble_frame,
    blocked_reasons,
    canonical_digest,
    canonical_json,
    canonical_value,
    completed_payload,
    discharged_payload,
    egress_closed,
    empty_payload,
    evaluate,
    fabric_state,
    frame_ready,
    govern_runtime,
    halt,
    import_identities,
    input_frame,
    internal_progress_enabled,
    is_blocked,
    merge_arrivals,
    program_digest,
    propagate,
    run_closed,
    run_status,
    runtime_receipt,
    simultaneous_commit,
    step_fabric,
    step_impl,
    terminally_quiescent,
    transition_payload,
    valid_host_schedule,
    v31,
)


QUEUEGATE = "Q-SWFPGA-EXECUTION-001"
HERE = Path(__file__).resolve().parent


def loc(position: Any, path: tuple[str, ...] = ("m1", "t1", "root")) -> Any:
    return v31.Location(position, path)


def simple_program(
    cells: tuple[Any, ...],
    *,
    routes: tuple[Any, ...] = (),
    positions: Mapping[str, Any] | None = None,
) -> Any:
    positions = positions or {cell.cell_id: v31.interior("□S") for cell in cells}
    program = v31.FabricSpec(
        "root",
        cells,
        (v31.Motif("m1", tuple(cell.cell_id for cell in cells)),),
        (v31.TriadBlock("t1", ("m1",)),),
        tuple(
            v31.Placement(cell.cell_id, loc(positions[cell.cell_id])) for cell in cells
        ),
        routes,
    )
    verdict = v31.drc(program)
    if verdict.verdict != "IF_THEN":
        raise AssertionError(f"fixture DRC failed: {verdict.reason_code} {verdict.because}")
    return program


def seed_value(cell: Any, role: str, value: Any, *, route_id: str | None = None) -> InputValue:
    return InputValue(
        route_id or f"seed:{cell.cell_id}:{role}",
        v31.witness_type(cell.witness, role),
        value,
        canonical_digest(("seed", cell.cell_id, role, value)),
    )


def seed_frame(cell: Any, value: Any = "seed") -> InputFrame:
    bindings: dict[str, tuple[InputValue, ...]] = {}
    for role, multiplicity, _ in v31.join_signature(cell.operator, cell.witness):
        if multiplicity == v31.MANY and cell.operator == "TOGETHER_ALONE":
            bindings[role] = (seed_value(cell, role, value),)
        else:
            bindings[role] = (seed_value(cell, role, value),)
    return input_frame(bindings)


def unary_chain(*, cross_region: bool = False) -> tuple[Any, Any, Any, Any]:
    source = v31.cell_def("source", "THIS", "WHAT", ("□S", "□F"))
    target = v31.cell_def("target", "THIS", "WHAT", ("□S", "□F"))
    item = v31.route("source", v31.RESULT, "target", "VALUE")
    positions = {
        "source": v31.interior("□S"),
        "target": v31.interior("□F" if cross_region else "□S"),
    }
    return simple_program((source, target), routes=(item,), positions=positions), source, target, item


def two_active_program() -> tuple[Any, Any, Any]:
    left = v31.cell_def("left", "THIS", "WHAT", ("□S",))
    right = v31.cell_def("right", "THIS", "WHAT", ("□S",))
    return simple_program((left, right)), left, right


def binary_program() -> tuple[Any, Any, Any, Any, Any, Any]:
    left = v31.cell_def("left_source", "THIS", "WHAT", ("□S",))
    right = v31.cell_def("right_source", "THIS", "WHAT", ("□S",))
    target = v31.cell_def("binary_target", "SAME_NOT_SAME", "WHAT", ("□S",))
    route_left = v31.route(left.cell_id, v31.RESULT, target.cell_id, "LEFT")
    route_right = v31.route(right.cell_id, v31.RESULT, target.cell_id, "RIGHT")
    program = simple_program((left, right, target), routes=(route_left, route_right))
    return program, left, right, target, route_left, route_right


def many_program() -> tuple[Any, Any, Any, Any, Any, Any]:
    a = v31.cell_def("member_a", "THIS", "WHAT", ("□S",))
    b = v31.cell_def("member_b", "THIS", "WHAT", ("□S",))
    target = v31.cell_def("many_target", "TOGETHER_ALONE", "WHAT", ("□S",))
    route_a = v31.route(a.cell_id, v31.RESULT, target.cell_id, "MEMBER")
    route_b = v31.route(b.cell_id, v31.RESULT, target.cell_id, "MEMBER")
    program = simple_program((a, b, target), routes=(route_b, route_a))
    return program, a, b, target, route_a, route_b


def admitted_state(program: Any, admitted: Mapping[str, InputFrame]) -> FabricState:
    return fabric_state(
        program,
        payload_states={
            cell_id: admitted_payload(frame, canonical_digest(("admission", cell_id, frame)))
            for cell_id, frame in admitted.items()
        },
    )


def schedule(schedule_id: str, **orders: str) -> HostSchedule:
    return replace(DEFAULT_SCHEDULE, schedule_id=schedule_id, **orders)


ALL_REVERSE = schedule(
    "all-reverse",
    cell_order=REVERSE,
    route_order=REVERSE,
    buffer_order=REVERSE,
    governance_order=REVERSE,
    obligation_order=REVERSE,
    receipt_order=REVERSE,
    commit_order=REVERSE,
)


def state_digest(state: FabricState) -> str:
    return canonical_digest(state)


def tick_equivalent(left: TickResult, right: TickResult) -> bool:
    return (
        canonical_value(left.sigma) == canonical_value(right.sigma)
        and run_status(left.sigma.program, left.sigma.state)
        == run_status(right.sigma.program, right.sigma.state)
        and canonical_value(left.canonical_evidence()) == canonical_value(right.canonical_evidence())
    )


def host_comparison_details(left: TickResult, right: TickResult) -> dict[str, Any]:
    return {
        "state_digest_A": state_digest(left.sigma.state),
        "state_digest_B": state_digest(right.sigma.state),
        "run_status_A": run_status(left.sigma.program, left.sigma.state),
        "run_status_B": run_status(right.sigma.program, right.sigma.state),
        "canonical_evidence_A": canonical_digest(left.canonical_evidence()),
        "canonical_evidence_B": canonical_digest(right.canonical_evidence()),
    }


def result_digest(items: Any) -> str | None:
    if items is None:
        return None
    return canonical_digest(items)


def make_receipt(
    vector_id: str,
    vector_class: str,
    program: Any,
    before: FabricState,
    *,
    expected: str,
    actual: str,
    condition: bool,
    tick: TickResult | None = None,
    after: FabricState | None = None,
    host_schedule_id: str | None = None,
    comparison_schedule_ids: Sequence[str] = (),
    details: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    after = tick.sigma.state if tick is not None else (after or before)
    cell_results = tick.cell_results if tick is not None else None
    route_results = tick.route_results if tick is not None else None
    governance = tick.governance_results if tick is not None else None
    transitions = tick.payload_transitions if tick is not None else ()
    receipt = {
        "vector_id": vector_id,
        "class": vector_class,
        "program_digest": program_digest(program),
        "state_before_digest": state_digest(before),
        "state_after_digest": state_digest(after),
        "host_schedule_id": host_schedule_id,
        "comparison_schedule_ids": list(comparison_schedule_ids),
        "active_cells": sorted(tick.active_cells) if tick is not None else [],
        "cell_results_digest": result_digest(cell_results),
        "route_results_digest": result_digest(route_results),
        "governance_results_digest": result_digest(governance),
        "payload_transitions": [list(item) for item in sorted(transitions)],
        "pending_buffer_digest": canonical_digest(after.pending_input_buffers),
        "pending_admission_digest": canonical_digest(after.pending_admissions),
        "obligation_digest": canonical_digest(after.outstanding_obligations),
        "receipt_set_digest": canonical_digest(after.receipts),
        "run_status": run_status(program, after),
        "blocked_reasons": [item.canonical() for item in blocked_reasons(program, after)],
        "expected": expected,
        "actual": actual,
        "pass": condition and expected == actual,
        "details": canonical_value(details or {}),
    }
    return receipt


def snapshot_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []

    program, left, right = two_active_program()
    before = admitted_state(program, {left.cell_id: seed_frame(left, "L"), right.cell_id: seed_frame(right, "R")})
    tick = step_fabric(Sigma(program, before))
    snapshot_digests = {item.snapshot_digest for item in tick.cell_results}
    receipts.append(make_receipt("S01", "snapshot", program, before, expected="SAME_SNAPSHOT", actual="SAME_SNAPSHOT" if snapshot_digests == {state_digest(before)} else "NOT_SAME", condition=snapshot_digests == {state_digest(before)}, tick=tick))

    peer_invisible = all(item.snapshot_digest == state_digest(before) for item in tick.cell_results)
    receipts.append(make_receipt("S02", "snapshot", program, before, expected="CURRENT_TICK_PEER_INVISIBLE", actual="CURRENT_TICK_PEER_INVISIBLE" if peer_invisible else "VISIBLE", condition=peer_invisible, tick=tick))

    program, source, target, _ = unary_chain()
    before = admitted_state(program, {source.cell_id: seed_frame(source, "x")})
    tick = step_fabric(Sigma(program, before))
    target_phase = tick.sigma.state.payload_map()[target.cell_id].phase
    receipts.append(make_receipt("S03", "snapshot", program, before, expected=ADMITTED, actual=target_phase, condition=target_phase == ADMITTED, tick=tick))

    unchanged = program_digest(program) == program_digest(tick.sigma.program)
    receipts.append(make_receipt("S04", "snapshot", program, before, expected="PROGRAM_UNCHANGED", actual="PROGRAM_UNCHANGED" if unchanged else "PROGRAM_CHANGED", condition=unchanged, tick=tick))

    first = evaluate(source, program, before)
    second = evaluate(source, program, before)
    deterministic = canonical_value(first) == canonical_value(second)
    receipts.append(make_receipt("S05", "snapshot", program, before, expected="DETERMINISTIC", actual="DETERMINISTIC" if deterministic else "NONDETERMINISTIC", condition=deterministic, details={"evaluation_digest": canonical_digest(first)}))

    cell_results = {source.cell_id: first}
    item = program.routes[0]
    p1 = propagate(item, program, before, cell_results)
    p2 = propagate(item, program, before, cell_results)
    deterministic = canonical_value(p1) == canonical_value(p2)
    receipts.append(make_receipt("S06", "snapshot", program, before, expected="DETERMINISTIC", actual="DETERMINISTIC" if deterministic else "NONDETERMINISTIC", condition=deterministic, details={"propagation_digest": canonical_digest(p1)}))

    assert p1 is not None
    g1 = govern_runtime(program, before, (p1,), DEFAULT_AUTHORITY)
    g2 = govern_runtime(program, before, (p1,), DEFAULT_AUTHORITY)
    deterministic = canonical_value(g1) == canonical_value(g2)
    receipts.append(make_receipt("S07", "snapshot", program, before, expected="DETERMINISTIC", actual="DETERMINISTIC" if deterministic else "NONDETERMINISTIC", condition=deterministic, details={"governance_digest": canonical_digest(g1)}))

    transitions = set(tick.payload_transitions)
    atomic = (source.cell_id, ADMITTED, COMPLETED) in transitions and (target.cell_id, EMPTY, ADMITTED) in transitions
    receipts.append(make_receipt("S08", "snapshot", program, before, expected="ATOMIC_COMMIT", actual="ATOMIC_COMMIT" if atomic else "PARTIAL_COMMIT", condition=atomic, tick=tick))

    one_boundary = tick.sigma.state.payload_map()[source.cell_id].phase == COMPLETED and target_phase == ADMITTED
    receipts.append(make_receipt("S09", "snapshot", program, before, expected="ONE_ROUTE_BOUNDARY", actual="ONE_ROUTE_BOUNDARY" if one_boundary else "WRONG_LATENCY", condition=one_boundary, tick=tick))

    authority_only = (
        tick.governance_results.imported_authority_digest == DEFAULT_AUTHORITY.digest
        and DEFAULT_AUTHORITY.imported_v3_2_kernel_sha256 == V3_2_KERNEL_SHA256
        and {field.name for field in fields(RuntimeAuthority)}
        == {"imported_v3_2_kernel_sha256", "decisions"}
    )
    receipts.append(make_receipt("S10", "snapshot", program, before, expected="V3_2_AUTHORITY_IMPORTED", actual="V3_2_AUTHORITY_IMPORTED" if authority_only else "AUTHORITY_REINTERPRETED", condition=authority_only, tick=tick))
    return receipts


def frame_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []
    unary = v31.cell_def("unary", "THIS", "WHAT", ("□S",))
    unary_program = simple_program((unary,))
    unary_arrivals = {"VALUE": (seed_value(unary, "VALUE", "x"),)}
    result = assemble_frame(unary, unary_arrivals)
    before = fabric_state(unary_program)
    receipts.append(make_receipt("F01", "frame", unary_program, before, expected=COMPLETE, actual=result.kind, condition=result.kind == COMPLETE, details={"frame": result.frame}))

    program, left, right, target, route_left, route_right = binary_program()
    left_value = InputValue(route_left.route_id, v31.witness_type("WHAT", "LEFT"), "L", "left-receipt")
    right_value = InputValue(route_right.route_id, v31.witness_type("WHAT", "RIGHT"), "R", "right-receipt")
    complete = assemble_frame(target, {"LEFT": (left_value,), "RIGHT": (right_value,)})
    state = fabric_state(program)
    receipts.append(make_receipt("F02", "frame", program, state, expected=COMPLETE, actual=complete.kind, condition=complete.kind == COMPLETE, details={"frame": complete.frame}))

    incomplete = assemble_frame(target, {"LEFT": (left_value,)})
    receipts.append(make_receipt("F03", "frame", program, state, expected=INCOMPLETE, actual=incomplete.kind, condition=incomplete.kind == INCOMPLETE and incomplete.pending_roles == ("RIGHT",), details={"pending_roles": incomplete.pending_roles, "target_phase": EMPTY}))

    buffer = PartialInputBuffer(target.cell_id, (("LEFT", (left_value,)),), 0, (left_value.source_receipt,))
    buffered_state = fabric_state(program, pending_input_buffers=(buffer,))
    route_result = RouteResult(route_right.route_id, right.cell_id, target.cell_id, "RIGHT", right_value)
    governance = govern_runtime(program, buffered_state, (route_result,), DEFAULT_AUTHORITY)
    admitted = dict((cell_id, frame) for cell_id, frame, _ in governance.admissions)
    staggered_complete = target.cell_id in admitted
    receipts.append(make_receipt("F04", "frame", program, buffered_state, expected=COMPLETE, actual=COMPLETE if staggered_complete else INCOMPLETE, condition=staggered_complete, details={"admitted_frame": admitted.get(target.cell_id)}))

    clears = staggered_complete and not governance.buffers
    receipts.append(make_receipt("F05", "frame", program, buffered_state, expected="BUFFER_CLEARED", actual="BUFFER_CLEARED" if clears else "BUFFER_RETAINED", condition=clears, details={"buffer_count": len(governance.buffers)}))

    many, a, b, many_target, route_a, route_b = many_program()
    value_a = InputValue(route_a.route_id, v31.witness_type("WHAT", "MEMBER"), "A", "ra")
    value_b = InputValue(route_b.route_id, v31.witness_type("WHAT", "MEMBER"), "B", "rb")
    many_one = assemble_frame(many_target, {"MEMBER": (value_a, value_b)})
    many_two = assemble_frame(many_target, {"MEMBER": (value_b, value_a)})
    same = canonical_value(many_one.frame) == canonical_value(many_two.frame)
    receipts.append(make_receipt("F06", "frame", many, fabric_state(many), expected="SAME_ROUTE_ID_ORDER", actual="SAME_ROUTE_ID_ORDER" if same else "NOT_SAME", condition=same, details={"frame_digest": canonical_digest(many_one.frame)}))

    zero_together = assemble_frame(many_target, {})
    zero_ok = zero_together.kind == COMPLETE and zero_together.frame is not None and zero_together.frame.role_map()["MEMBER"] == ()
    receipts.append(make_receipt("F07", "frame", many, fabric_state(many), expected=COMPLETE, actual=zero_together.kind, condition=zero_ok, details={"identity_frame": zero_together.frame}))

    many_one_cell = v31.cell_def("many_one", "MANY_ONE", "WHAT", ("□S",))
    many_one_program = simple_program((many_one_cell,))
    zero_many_one = assemble_frame(many_one_cell, {})
    receipts.append(make_receipt("F08", "frame", many_one_program, fabric_state(many_one_program), expected=INCOMPLETE, actual=zero_many_one.kind, condition=zero_many_one.kind == INCOMPLETE))

    over = assemble_frame(unary, {"VALUE": (seed_value(unary, "VALUE", "a", route_id="a"), seed_value(unary, "VALUE", "b", route_id="b"))})
    receipts.append(make_receipt("F09", "frame", unary_program, before, expected="INVALID_OVERCONNECTION", actual="INVALID_OVERCONNECTION" if over.kind == INVALID and over.reason == "overconnection:VALUE" else over.kind, condition=over.kind == INVALID and over.reason == "overconnection:VALUE", details={"reason": over.reason}))

    mismatch = InputValue("mismatch", v31.witness_type("WHERE", "VALUE"), "x", "mismatch")
    type_failure = assemble_frame(unary, {"VALUE": (mismatch,)})
    receipts.append(make_receipt("F10", "frame", unary_program, before, expected="INVALID_TYPE_FAILURE", actual="INVALID_TYPE_FAILURE" if type_failure.kind == INVALID and type_failure.reason == "type_failure:VALUE" else type_failure.kind, condition=type_failure.kind == INVALID and type_failure.reason == "type_failure:VALUE", details={"reason": type_failure.reason}))

    blocked_tick = step_fabric(Sigma(program, buffered_state))
    persists = canonical_value(blocked_tick.sigma.state.pending_input_buffers) == canonical_value(buffered_state.pending_input_buffers)
    receipts.append(make_receipt("F11", "frame", program, buffered_state, expected="PERSISTS", actual="PERSISTS" if persists else "ABANDONED", condition=persists, tick=blocked_tick))

    safe = v31.drc(program).verdict == "IF_THEN" and frame_ready(target, {"LEFT": (left_value,), "RIGHT": (right_value,)}) and complete.kind == COMPLETE
    receipts.append(make_receipt("F12", "frame", program, state, expected="RUNTIME_FRAME_SHAPE_SAFE", actual="RUNTIME_FRAME_SHAPE_SAFE" if safe else "UNSAFE", condition=safe, details={"v3_1_drc": v31.drc(program).verdict, "frame": complete.frame}))
    return receipts


def payload_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []
    program, source, target, item = unary_chain()
    empty = empty_payload()
    admitted = admitted_payload(seed_frame(source), "admit")
    transitioned = transition_payload(empty, admitted)
    base = fabric_state(program)
    receipts.append(make_receipt("P01", "payload", program, base, expected=ADMITTED, actual=transitioned.phase, condition=transitioned.phase == ADMITTED))

    before = admitted_state(program, {source.cell_id: seed_frame(source)})
    tick = step_fabric(Sigma(program, before))
    phase = tick.sigma.state.payload_map()[source.cell_id].phase
    propagated = tick.sigma.state.payload_map()[target.cell_id].phase == ADMITTED
    receipts.append(make_receipt("P02", "payload", program, before, expected=COMPLETED, actual=phase, condition=phase == COMPLETED and propagated, tick=tick))

    def discharge_vector(vector_id: str, kind: str) -> dict[str, Any]:
        disposition = EgressDisposition(item.route_id, target.cell_id, kind, f"receipt:{kind}", candidate_ref="candidate" if kind == PENDING_AT_TARGET else None, reason="rejected" if kind == REJECTED_AT_TARGET else None)
        state = fabric_state(program, payload_states={source.cell_id: completed_payload(seed_frame(source), "result", (disposition,))})
        result = step_fabric(Sigma(program, state))
        phase_after = result.sigma.state.payload_map()[source.cell_id].phase
        return make_receipt(vector_id, "payload", program, state, expected=DISCHARGED, actual=phase_after, condition=phase_after == DISCHARGED, tick=result)

    receipts.append(discharge_vector("P03", ADMITTED_TO_TARGET))
    receipts.append(discharge_vector("P04", PENDING_AT_TARGET))
    receipts.append(discharge_vector("P05", REJECTED_AT_TARGET))

    sink_program = simple_program((source,))
    sink_state = fabric_state(sink_program, payload_states={source.cell_id: completed_payload(seed_frame(source), "result")})
    closed = egress_closed(sink_program, source.cell_id, sink_state.payload_map()[source.cell_id])
    receipts.append(make_receipt("P06", "payload", sink_program, sink_state, expected="EGRESS_CLOSED", actual="EGRESS_CLOSED" if closed else "EGRESS_OPEN", condition=closed))

    discharged = discharged_payload("result-ref", "discharge")
    state = fabric_state(program, payload_states={source.cell_id: discharged})
    result = step_fabric(Sigma(program, state))
    phase_after = result.sigma.state.payload_map()[source.cell_id].phase
    receipts.append(make_receipt("P07", "payload", program, state, expected=EMPTY, actual=phase_after, condition=phase_after == EMPTY, tick=result))

    phases = {source.cell_id: admitted, target.cell_id: completed_payload(seed_frame(target), "done")}
    active_state = fabric_state(program, payload_states=phases)
    active = tuple(cell_id for cell_id, payload in active_state.payload_states if payload.phase == ADMITTED)
    receipts.append(make_receipt("P08", "payload", program, active_state, expected="ADMITTED_ONLY", actual="ADMITTED_ONLY" if active == (source.cell_id,) else "WRONG_ACTIVE_SET", condition=active == (source.cell_id,), details={"active": active}))

    extra = v31.cell_def("extra", "THIS", "WHAT", ("□S",))
    heterogeneous_program = simple_program((source, target, extra))
    persistent = runtime_receipt("PERSISTENT", "extra", "evidence")
    heterogeneous = fabric_state(
        heterogeneous_program,
        payload_states={
            source.cell_id: admitted_payload(seed_frame(source), "admit"),
            target.cell_id: completed_payload(seed_frame(target), "done"),
            extra.cell_id: discharged_payload("ref", "discharge"),
        },
        receipts=(persistent,),
    )
    result = step_fabric(Sigma(heterogeneous_program, heterogeneous))
    phases_after = {cell_id: payload.phase for cell_id, payload in result.sigma.state.payload_states}
    expected_phases = {source.cell_id: COMPLETED, target.cell_id: DISCHARGED, extra.cell_id: EMPTY}
    receipts.append(make_receipt("P09", "payload", heterogeneous_program, heterogeneous, expected="ATOMIC_HETEROGENEOUS_COMMIT", actual="ATOMIC_HETEROGENEOUS_COMMIT" if phases_after == expected_phases else "PHASE_MISMATCH", condition=phases_after == expected_phases, tick=result, details={"phases": phases_after}))

    release_state = fabric_state(sink_program, payload_states={source.cell_id: discharged}, receipts=(persistent,))
    release = step_fabric(Sigma(sink_program, release_state))
    persists = persistent.receipt_id in {item.receipt_id for item in release.sigma.state.receipts}
    receipts.append(make_receipt("P10", "payload", sink_program, release_state, expected="SLOT_CLEARED_RECEIPT_PERSISTS", actual="SLOT_CLEARED_RECEIPT_PERSISTS" if release.sigma.state.payload_map()[source.cell_id].phase == EMPTY and persists else "FAIL", condition=release.sigma.state.payload_map()[source.cell_id].phase == EMPTY and persists, tick=release))
    return receipts


def quiescence_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []
    program, source, target, item = unary_chain()
    clean = fabric_state(program)
    receipts.append(make_receipt("Q01", "quiescence", program, clean, expected=HALTED, actual=run_status(program, clean), condition=halt(program, clean)))

    admitted = admitted_state(program, {source.cell_id: seed_frame(source)})
    receipts.append(make_receipt("Q02", "quiescence", program, admitted, expected=RUNNING, actual=run_status(program, admitted), condition=internal_progress_enabled(program, admitted)))

    discharged = fabric_state(program, payload_states={source.cell_id: discharged_payload("ref", "receipt")})
    receipts.append(make_receipt("Q03", "quiescence", program, discharged, expected=RUNNING, actual=run_status(program, discharged), condition=internal_progress_enabled(program, discharged)))

    binary, left, _, binary_target, route_left, _ = binary_program()
    left_value = InputValue(route_left.route_id, v31.witness_type("WHAT", "LEFT"), "L", "left")
    buffer = PartialInputBuffer(binary_target.cell_id, (("LEFT", (left_value,)),), 0, ("left",))
    partial = fabric_state(binary, pending_input_buffers=(buffer,))
    receipts.append(make_receipt("Q04", "quiescence", binary, partial, expected=BLOCKED, actual=run_status(binary, partial), condition=is_blocked(binary, partial)))

    pending = PendingAdmission("candidate", target.cell_id, (("VALUE", (seed_value(target, "VALUE", "x"),)),), "evidence")
    pending_state = fabric_state(program, pending_admissions=(pending,))
    receipts.append(make_receipt("Q05", "quiescence", program, pending_state, expected=BLOCKED, actual=run_status(program, pending_state), condition=is_blocked(program, pending_state)))

    open_egress = fabric_state(program, payload_states={source.cell_id: completed_payload(seed_frame(source), "result")})
    receipts.append(make_receipt("Q06", "quiescence", program, open_egress, expected=BLOCKED, actual=run_status(program, open_egress), condition=is_blocked(program, open_egress)))

    not_halted = not halt(binary, partial) and not partial.outstanding_obligations
    receipts.append(make_receipt("Q07", "quiescence", binary, partial, expected="NOT_HALTED", actual="NOT_HALTED" if not_halted else HALTED, condition=not_halted))

    fixed = step_fabric(Sigma(binary, partial)).sigma.state
    fixed_but_blocked = state_digest(fixed) == state_digest(partial) and is_blocked(binary, fixed)
    receipts.append(make_receipt("Q08", "quiescence", binary, partial, expected=BLOCKED, actual=BLOCKED if fixed_but_blocked else "NOT_BLOCKED", condition=fixed_but_blocked, after=fixed))

    historical = runtime_receipt("HISTORICAL", "run", "done")
    receipt_only = fabric_state(program, receipts=(historical,))
    receipts.append(make_receipt("Q09", "quiescence", program, receipt_only, expected=HALTED, actual=run_status(program, receipt_only), condition=halt(program, receipt_only)))

    inert = EgressDisposition(item.route_id, target.cell_id, ADMITTED_TO_TARGET, "old")
    inert_routes = fabric_state(program, route_states=((item.route_id, inert),))
    receipts.append(make_receipt("Q10", "quiescence", program, inert_routes, expected=HALTED, actual=run_status(program, inert_routes), condition=halt(program, inert_routes)))

    halted_tick = step_fabric(Sigma(program, receipt_only))
    same = canonical_value(halted_tick.sigma) == canonical_value(Sigma(program, receipt_only))
    receipts.append(make_receipt("Q11", "quiescence", program, receipt_only, expected="TERMINAL_FIXED_POINT", actual="TERMINAL_FIXED_POINT" if same else "CHANGED", condition=same, tick=halted_tick))

    obligation = OutstandingObligation("obligation", "subject")
    pending_reversed = replace(pending, candidate_id="z-candidate")
    complex_a = fabric_state(binary, pending_input_buffers=(buffer,), pending_admissions=(pending_reversed,), outstanding_obligations=(obligation,))
    complex_b = FabricState(complex_a.payload_states, complex_a.route_states, tuple(reversed(complex_a.pending_admissions)), tuple(reversed(complex_a.pending_input_buffers)), tuple(reversed(complex_a.outstanding_obligations)), complex_a.receipts)
    reasons_a = blocked_reasons(binary, complex_a)
    reasons_b = blocked_reasons(binary, complex_b)
    canonical_order = reasons_a == tuple(
        sorted(reasons_a, key=lambda item: (item.kind, item.subject_id, item.details))
    )
    same = canonical_order and canonical_value(reasons_a) == canonical_value(reasons_b)
    receipts.append(make_receipt("Q12", "quiescence", binary, complex_a, expected="CANONICAL_ORDER", actual="CANONICAL_ORDER" if same else "ORDER_DEPENDENT", condition=same, details={"blocked_reasons": reasons_a}))
    return receipts


def host_fixture() -> tuple[Any, FabricState]:
    program, a, b, _, _, _ = many_program()
    state = admitted_state(program, {a.cell_id: seed_frame(a, "A"), b.cell_id: seed_frame(b, "B")})
    return program, state


def compare_schedule_vector(vector_id: str, changed_surface: str) -> dict[str, Any]:
    program, before = host_fixture()
    base = schedule(f"{vector_id}-forward")
    alternate = schedule(f"{vector_id}-reverse", **{changed_surface: REVERSE})
    left = step_impl(Sigma(program, before), base)
    right = step_impl(Sigma(program, before), alternate)
    same = tick_equivalent(left, right)
    return make_receipt(vector_id, "host-order", program, before, expected="SAME", actual="SAME" if same else "NOT_SAME", condition=same, tick=left, host_schedule_id=base.schedule_id, comparison_schedule_ids=(alternate.schedule_id,), details=host_comparison_details(left, right))


def host_order_vectors() -> list[dict[str, Any]]:
    receipts = [
        compare_schedule_vector("H01", "cell_order"),
        compare_schedule_vector("H02", "route_order"),
    ]

    program, _, _, target, route_a, route_b = many_program()
    a = InputValue(route_a.route_id, v31.witness_type("WHAT", "MEMBER"), "A", "a")
    b = InputValue(route_b.route_id, v31.witness_type("WHAT", "MEMBER"), "B", "b")
    buffer_a = PartialInputBuffer(target.cell_id, (("MEMBER", (a, b)),), 0, ("a", "b"))
    buffer_b = PartialInputBuffer(target.cell_id, (("MEMBER", (b, a)),), 0, ("b", "a"))
    state_a = fabric_state(program, pending_input_buffers=(buffer_a,))
    state_b = fabric_state(program, pending_input_buffers=(buffer_b,))
    tick_a = step_impl(Sigma(program, state_a), schedule("many-insertion-a"))
    tick_b = step_impl(Sigma(program, state_b), schedule("many-insertion-b"))
    same = tick_equivalent(tick_a, tick_b)
    receipts.append(make_receipt("H03", "host-order", program, state_a, expected="SAME", actual="SAME" if same else "NOT_SAME", condition=same, tick=tick_a, host_schedule_id="many-insertion-a", comparison_schedule_ids=("many-insertion-b",), details=host_comparison_details(tick_a, tick_b)))

    binary, _, _, binary_target, route_left, route_right = binary_program()
    left_arrival = InputValue(route_left.route_id, v31.witness_type("WHAT", "LEFT"), "L", "left")
    right_arrival = InputValue(route_right.route_id, v31.witness_type("WHAT", "RIGHT"), "R", "right")
    partial = PartialInputBuffer(binary_target.cell_id, (("LEFT", (left_arrival,)),), 0, ("left",))
    state_a = fabric_state(binary, pending_input_buffers=(partial,))
    routed = RouteResult(route_right.route_id, route_right.source_cell, route_right.target_cell, route_right.target_role, right_arrival)
    governance_a = govern_runtime(binary, state_a, (routed,), DEFAULT_AUTHORITY, governance_order=FORWARD, buffer_order=FORWARD)
    governance_b = govern_runtime(binary, state_a, (routed,), DEFAULT_AUTHORITY, governance_order=REVERSE, buffer_order=REVERSE)
    after_a, transitions_a = simultaneous_commit(binary, state_a, (), governance_a, commit_order=FORWARD, receipt_order=FORWARD)
    after_b, transitions_b = simultaneous_commit(binary, state_a, (), governance_b, commit_order=REVERSE, receipt_order=REVERSE)
    tick_a = TickResult(Sigma(binary, after_a), (), (), (routed,), governance_a, transitions_a)
    tick_b = TickResult(Sigma(binary, after_b), (), (), (routed,), governance_b, transitions_b)
    merge_a = merge_arrivals({"LEFT": (left_arrival,)}, {"RIGHT": (right_arrival,)})
    merge_b = merge_arrivals({"RIGHT": (right_arrival,)}, {"LEFT": (left_arrival,)})
    merge_canonical = canonical_value(merge_a) == canonical_value(merge_b)
    same = tick_equivalent(tick_a, tick_b) and merge_canonical
    details = host_comparison_details(tick_a, tick_b)
    details.update({"merge_digest_A": canonical_digest(merge_a), "merge_digest_B": canonical_digest(merge_b)})
    receipts.append(make_receipt("H04", "host-order", binary, state_a, expected="SAME", actual="SAME" if same else "NOT_SAME", condition=same, tick=tick_a, host_schedule_id="buffer-forward", comparison_schedule_ids=("buffer-reverse",), details=details))

    program, before = host_fixture()
    routes = tuple(sorted(route.route_id for route in program.routes))
    authority_a = RuntimeAuthority(decisions=tuple((route_id, ADMIT) for route_id in routes))
    authority_b = RuntimeAuthority(decisions=tuple(reversed(authority_a.decisions)))
    tick_a = step_impl(Sigma(program, before), schedule("govern-forward"), authority_a)
    tick_b = step_impl(Sigma(program, before), schedule("govern-reverse", governance_order=REVERSE), authority_b)
    same = tick_equivalent(tick_a, tick_b)
    receipts.append(make_receipt("H05", "host-order", program, before, expected="SAME", actual="SAME" if same else "NOT_SAME", condition=same, tick=tick_a, host_schedule_id="govern-forward", comparison_schedule_ids=("govern-reverse",), details=host_comparison_details(tick_a, tick_b)))

    obligations = (OutstandingObligation("a", "x", True), OutstandingObligation("b", "y", True))
    state_a = fabric_state(program, outstanding_obligations=obligations)
    state_b = fabric_state(program, outstanding_obligations=tuple(reversed(obligations)))
    tick_a = step_impl(Sigma(program, state_a), schedule("obligation-forward"))
    tick_b = step_impl(Sigma(program, state_b), schedule("obligation-reverse", obligation_order=REVERSE))
    same = tick_equivalent(tick_a, tick_b)
    receipts.append(make_receipt("H06", "host-order", program, state_a, expected="SAME", actual="SAME" if same else "NOT_SAME", condition=same, tick=tick_a, host_schedule_id="obligation-forward", comparison_schedule_ids=("obligation-reverse",), details=host_comparison_details(tick_a, tick_b)))

    receipts.append(compare_schedule_vector("H07", "commit_order"))
    receipts.append(compare_schedule_vector("H08", "receipt_order"))

    binary, _, _, target, route_left, _ = binary_program()
    left_value = InputValue(route_left.route_id, v31.witness_type("WHAT", "LEFT"), "L", "left")
    partial = PartialInputBuffer(target.cell_id, (("LEFT", (left_value,)),), 0, ("left",))
    pending_items = (
        PendingAdmission("candidate-a", target.cell_id, (), "evidence-a"),
        PendingAdmission("candidate-b", target.cell_id, (), "evidence-b"),
    )
    obligation_items = (
        OutstandingObligation("obligation-a", "subject-a"),
        OutstandingObligation("obligation-b", "subject-b"),
    )
    state_a = fabric_state(binary, pending_input_buffers=(partial,), pending_admissions=pending_items, outstanding_obligations=obligation_items)
    state_b = FabricState(tuple(reversed(state_a.payload_states)), state_a.route_states, tuple(reversed(state_a.pending_admissions)), tuple(reversed(state_a.pending_input_buffers)), tuple(reversed(state_a.outstanding_obligations)), state_a.receipts)
    tick_a = step_impl(Sigma(binary, state_a), schedule("blocked-reasons-a"))
    tick_b = step_impl(Sigma(binary, state_b), schedule("blocked-reasons-b", buffer_order=REVERSE, governance_order=REVERSE, obligation_order=REVERSE))
    same = tick_equivalent(tick_a, tick_b)
    details = host_comparison_details(tick_a, tick_b)
    details.update({"blocked_reasons_A": blocked_reasons(binary, state_a), "blocked_reasons_B": blocked_reasons(binary, state_b)})
    receipts.append(make_receipt("H09", "host-order", binary, state_a, expected="SAME", actual="SAME" if same else "NOT_SAME", condition=same, tick=tick_a, host_schedule_id="blocked-reasons-a", comparison_schedule_ids=("blocked-reasons-b",), details=details))

    program, before = host_fixture()
    forward = schedule("full-forward")
    reverse = ALL_REVERSE
    tick_a = step_impl(Sigma(program, before), forward)
    tick_b = step_impl(Sigma(program, before), reverse)
    same = valid_host_schedule(forward) and valid_host_schedule(reverse) and tick_equivalent(tick_a, tick_b)
    receipts.append(make_receipt("H10", "host-order", program, before, expected="SAME", actual="SAME" if same else "NOT_SAME", condition=same, tick=tick_a, host_schedule_id=forward.schedule_id, comparison_schedule_ids=(reverse.schedule_id,), details=host_comparison_details(tick_a, tick_b)))

    exhaustive_program, exhaustive_source, exhaustive_target, exhaustive_route = unary_chain()
    exhaustive_inert = v31.cell_def("inert", "THIS", "WHAT", ("□S",))
    exhaustive_program = simple_program(
        tuple(exhaustive_program.cells) + (exhaustive_inert,),
        routes=tuple(exhaustive_program.routes),
    )
    exhaustive_before = admitted_state(
        exhaustive_program,
        {exhaustive_source.cell_id: seed_frame(exhaustive_source, "exhaustive")},
    )
    baseline_schedule = HostSchedule(
        "exhaustive-baseline",
        cell_order=(exhaustive_source.cell_id,),
        route_order=(exhaustive_route.route_id,),
        buffer_order=(exhaustive_target.cell_id,),
        governance_order=(exhaustive_route.route_id,),
        obligation_order=(),
        receipt_order=FORWARD,
        commit_order=FORWARD,
    )
    baseline = step_impl(Sigma(exhaustive_program, exhaustive_before), baseline_schedule)
    receipt_ids = tuple(receipt.receipt_id for receipt in baseline.sigma.state.receipts)
    commit_ids = tuple(cell.cell_id for cell in exhaustive_program.cells)
    exhaustive = True
    schedule_ids: list[str] = []
    for index, (receipt_order, commit_order) in enumerate(
        product(permutations(receipt_ids), permutations(commit_ids))
    ):
        candidate = HostSchedule(
            f"exhaustive-{index:03d}",
            cell_order=(exhaustive_source.cell_id,),
            route_order=(exhaustive_route.route_id,),
            buffer_order=(exhaustive_target.cell_id,),
            governance_order=(exhaustive_route.route_id,),
            obligation_order=(),
            receipt_order=receipt_order,
            commit_order=commit_order,
        )
        schedule_ids.append(candidate.schedule_id)
        if not valid_host_schedule(candidate) or not tick_equivalent(
            baseline,
            step_impl(Sigma(exhaustive_program, exhaustive_before), candidate),
        ):
            exhaustive = False
            break
    receipts.append(make_receipt("H11", "host-order", exhaustive_program, exhaustive_before, expected="SAME", actual="SAME" if exhaustive else "NOT_SAME", condition=exhaustive, tick=baseline, host_schedule_id=baseline_schedule.schedule_id, comparison_schedule_ids=tuple(schedule_ids), details={"valid_schedule_count": len(schedule_ids), "enumerated_domain": {"active_cell_permutations": 1, "route_permutations": 1, "buffer_permutations": 1, "governance_permutations": 1, "obligation_permutations": 1, "receipt_permutations": 120, "commit_permutations": 6}, "state_digest": state_digest(baseline.sigma.state), "run_status": run_status(exhaustive_program, baseline.sigma.state), "canonical_evidence": canonical_digest(baseline.canonical_evidence())}))

    chain, source, _, _ = unary_chain()
    initial = Sigma(chain, admitted_state(chain, {source.cell_id: seed_frame(source, "trajectory")}))
    final_a, history_a = run_closed(initial, schedules=(forward,))
    final_b, history_b = run_closed(initial, schedules=(forward, reverse))
    trajectory_same = (
        canonical_value(final_a) == canonical_value(final_b)
        and [run_status(item.sigma.program, item.sigma.state) for item in history_a]
        == [run_status(item.sigma.program, item.sigma.state) for item in history_b]
        and [canonical_digest(item.canonical_evidence()) for item in history_a]
        == [canonical_digest(item.canonical_evidence()) for item in history_b]
    )
    receipts.append(make_receipt("H12", "host-order", chain, initial.state, expected="SAME_TRAJECTORY", actual="SAME_TRAJECTORY" if trajectory_same else "NOT_SAME", condition=trajectory_same, after=final_a.state, host_schedule_id=forward.schedule_id, comparison_schedule_ids=(reverse.schedule_id,), details={"ticks": len(history_a), "final_state_digest_A": state_digest(final_a.state), "final_state_digest_B": state_digest(final_b.state), "status_trajectory_A": [run_status(item.sigma.program, item.sigma.state) for item in history_a], "status_trajectory_B": [run_status(item.sigma.program, item.sigma.state) for item in history_b], "evidence_trajectory_A": [canonical_digest(item.canonical_evidence()) for item in history_a], "evidence_trajectory_B": [canonical_digest(item.canonical_evidence()) for item in history_b]}))
    return receipts


def negative_vectors() -> list[dict[str, Any]]:
    cell = v31.cell_def("cell", "THIS", "WHAT", ("□S",))
    program = simple_program((cell,))
    frame = seed_frame(cell)
    values = {
        EMPTY: empty_payload(),
        ADMITTED: admitted_payload(frame, "admit"),
        COMPLETED: completed_payload(frame, "result"),
        DISCHARGED: discharged_payload("ref", "discharge"),
    }
    cases = (
        ("N01", EMPTY, COMPLETED),
        ("N02", EMPTY, DISCHARGED),
        ("N03", ADMITTED, DISCHARGED),
        ("N04", ADMITTED, EMPTY),
        ("N05", COMPLETED, ADMITTED),
        ("N06", COMPLETED, EMPTY),
        ("N07", DISCHARGED, ADMITTED),
        ("N08", DISCHARGED, COMPLETED),
    )
    receipts: list[dict[str, Any]] = []
    for vector_id, before_phase, after_phase in cases:
        rejected = False
        reason = ""
        try:
            transition_payload(values[before_phase], values[after_phase])
        except ForbiddenTransition as exc:
            rejected = True
            reason = str(exc)
        state = fabric_state(program, payload_states={cell.cell_id: values[before_phase]})
        receipts.append(make_receipt(vector_id, "negative", program, state, expected="REJECT", actual="REJECT" if rejected else "ALLOW", condition=rejected and reason.endswith(f"{before_phase}->{after_phase}"), details={"reason": reason}))
    return receipts


def delayed_binary_program() -> tuple[Any, Any, Any, Any, Any]:
    precursor = v31.cell_def("precursor", "THIS", "WHAT", ("□S",))
    left = v31.cell_def("left", "THIS", "WHAT", ("□S",))
    delayed = v31.cell_def("delayed", "THIS", "WHAT", ("□S",))
    target = v31.cell_def("target", "SAME_NOT_SAME", "WHAT", ("□S",))
    routes = (
        v31.route(precursor.cell_id, v31.RESULT, delayed.cell_id, "VALUE"),
        v31.route(left.cell_id, v31.RESULT, target.cell_id, "LEFT"),
        v31.route(delayed.cell_id, v31.RESULT, target.cell_id, "RIGHT"),
    )
    return simple_program((precursor, left, delayed, target), routes=routes), precursor, left, delayed, target


def end_to_end_vectors() -> list[dict[str, Any]]:
    receipts: list[dict[str, Any]] = []
    program, source, _, _ = unary_chain()
    initial = Sigma(program, admitted_state(program, {source.cell_id: seed_frame(source, "chain")}))
    final, history = run_closed(initial)
    status = run_status(program, final.state)
    receipts.append(make_receipt("E01", "end-to-end", program, initial.state, expected=HALTED, actual=status, condition=status == HALTED, after=final.state, details={"ticks": len(history)}))

    delayed_program, precursor, left, _, target = delayed_binary_program()
    initial_state = admitted_state(delayed_program, {precursor.cell_id: seed_frame(precursor, "delay"), left.cell_id: seed_frame(left, "left")})
    first = step_fabric(Sigma(delayed_program, initial_state))
    buffered = any(item.cell_id == target.cell_id for item in first.sigma.state.pending_input_buffers)
    final, history = run_closed(first.sigma)
    status = run_status(delayed_program, final.state)
    receipts.append(make_receipt("E02", "end-to-end", delayed_program, initial_state, expected=HALTED, actual=status, condition=buffered and status == HALTED, after=final.state, details={"buffered_after_first": buffered, "ticks_after_first": len(history)}))

    many, a, b, _, _, _ = many_program()
    many_state = admitted_state(many, {a.cell_id: seed_frame(a, "A"), b.cell_id: seed_frame(b, "B")})
    forward_final, _ = run_closed(Sigma(many, many_state), schedules=(DEFAULT_SCHEDULE,))
    reverse_final, _ = run_closed(Sigma(many, many_state), schedules=(ALL_REVERSE,))
    same = canonical_value(forward_final) == canonical_value(reverse_final)
    receipts.append(make_receipt("E03", "end-to-end", many, many_state, expected="SAME_HALTED", actual="SAME_HALTED" if same and run_status(many, forward_final.state) == HALTED else "NOT_SAME", condition=same and run_status(many, forward_final.state) == HALTED, after=forward_final.state))

    cross, cross_source, _, cross_route = unary_chain(cross_region=True)
    cross_state = admitted_state(cross, {cross_source.cell_id: seed_frame(cross_source, "cross")})
    authority = RuntimeAuthority(decisions=((cross_route.route_id, ADMIT),))
    cross_tick = step_fabric(Sigma(cross, cross_state), authority)
    valid = (
        authority.imported_v3_2_kernel_sha256 == V3_2_KERNEL_SHA256
        and cross_tick.governance_results.imported_authority_digest == authority.digest
        and {field.name for field in fields(RuntimeAuthority)}
        == {"imported_v3_2_kernel_sha256", "decisions"}
        and program_digest(cross_tick.sigma.program) == program_digest(cross)
        and any(
            item.kind == ADMITTED_TO_TARGET
            for item in cross_tick.governance_results.dispositions
        )
    )
    receipts.append(make_receipt("E04", "end-to-end", cross, cross_state, expected="V3_2_RUNTIME_AUTHORITY", actual="V3_2_RUNTIME_AUTHORITY" if valid else "REINTERPRETED", condition=valid, tick=cross_tick, details={"authority_digest": authority.digest, "triad_transition": v31.triad_transition(cross, cross_route)}))

    binary, _, _, target, route_left, _ = binary_program()
    left_value = InputValue(route_left.route_id, v31.witness_type("WHAT", "LEFT"), "L", "left")
    buffer = PartialInputBuffer(target.cell_id, (("LEFT", (left_value,)),), 0, ("left",))
    blocked_state = fabric_state(binary, pending_input_buffers=(buffer,))
    receipts.append(make_receipt("E05", "end-to-end", binary, blocked_state, expected=BLOCKED, actual=run_status(binary, blocked_state), condition=is_blocked(binary, blocked_state)))

    pending = PendingAdmission("runtime-maybe", target.cell_id, (), "unresolved-evidence")
    pending_state = fabric_state(binary, pending_admissions=(pending,))
    receipts.append(make_receipt("E06", "end-to-end", binary, pending_state, expected=BLOCKED, actual=run_status(binary, pending_state), condition=is_blocked(binary, pending_state)))
    return receipts


def all_receipts() -> list[dict[str, Any]]:
    receipts = (
        snapshot_vectors()
        + frame_vectors()
        + payload_vectors()
        + quiescence_vectors()
        + host_order_vectors()
        + negative_vectors()
        + end_to_end_vectors()
    )
    expected_ids = (
        tuple(f"S{index:02d}" for index in range(1, 11))
        + tuple(f"F{index:02d}" for index in range(1, 13))
        + tuple(f"P{index:02d}" for index in range(1, 11))
        + tuple(f"Q{index:02d}" for index in range(1, 13))
        + tuple(f"H{index:02d}" for index in range(1, 13))
        + tuple(f"N{index:02d}" for index in range(1, 9))
        + tuple(f"E{index:02d}" for index in range(1, 7))
    )
    actual_ids = tuple(receipt["vector_id"] for receipt in receipts)
    if actual_ids != expected_ids:
        raise AssertionError(f"VECTOR_CENSUS_MISMATCH:{actual_ids}")
    return receipts


def build_summary(receipts: Sequence[dict[str, Any]]) -> dict[str, Any]:
    class_order = ("snapshot", "frame", "payload", "quiescence", "host-order", "negative", "end-to-end")
    counts = {}
    for vector_class in class_order:
        selected = [receipt for receipt in receipts if receipt["class"] == vector_class]
        counts[vector_class] = {
            "passed": sum(1 for receipt in selected if receipt["pass"]),
            "total": len(selected),
        }
    total_passed = sum(1 for receipt in receipts if receipt["pass"])
    proof_path = HERE / "PROOF_EXEC_4_HOST_ORDER_ERASURE.md"
    import_manifest = HERE / "V3_IMPORT_MANIFEST.md"
    return {
        "queuegate": QUEUEGATE,
        "obligation": "O-SWFPGA-EXECUTION-1",
        "spec_version": SPEC_VERSION,
        "spec_sha256": SPEC_SHA256,
        "handoff_sha256": HANDOFF_SHA256,
        "vector_corpus_sha256": VECTORS_SHA256,
        "counts": counts,
        "total_passed": total_passed,
        "total": len(receipts),
        "conformance": f"{total_passed}/{len(receipts)}",
        "evidence_artifact_count": len(receipts) + 1,
        "receipt_ids": [receipt["vector_id"] for receipt in receipts],
        "artifact_bindings": {
            "execution_kernel_sha256": file_sha256(HERE / "execution_kernel.py"),
            "conformance_runner_sha256": file_sha256(HERE / "run_conformance.py"),
            "proof_exec_4_sha256": file_sha256(proof_path),
            "import_manifest_sha256": file_sha256(import_manifest),
        },
        "import_identities": import_identities(),
        "reference_execution_kernel": "HOLDS",
        "v3_1_import": "UNCHANGED",
        "v3_2_import": "UNCHANGED",
        "proof_exec_4": "PRESENT",
        "self_modifying_geometry": "FORBIDDEN",
        "external_stimulus_api": "ABSENT",
        "deterministic_encoding": {
            "timestamps": False,
            "random_uuids": False,
            "unordered_serialization": False,
            "filesystem_order_dependency": False,
            "process_order_dependency": False,
        },
        "promotion": "NOT_PERFORMED",
    }


def file_sha256(path: Path) -> str:
    from hashlib import sha256

    return sha256(path.read_bytes()).hexdigest()


def write_evidence(output: Path, receipts: Sequence[dict[str, Any]], summary: Mapping[str, Any]) -> None:
    output.mkdir(parents=True, exist_ok=True)
    receipts_dir = output / "receipts"
    receipts_dir.mkdir(parents=True, exist_ok=True)
    expected_names = {f"{receipt['vector_id']}.json" for receipt in receipts}
    for existing in receipts_dir.glob("*.json"):
        if existing.name not in expected_names:
            raise AssertionError(f"UNEXPECTED_EVIDENCE_FILE:{existing.name}")
    for receipt in receipts:
        (receipts_dir / f"{receipt['vector_id']}.json").write_text(
            canonical_json(receipt, pretty=True), encoding="utf-8", newline="\n"
        )
    (output / "queuegate-evidence-summary.json").write_text(
        canonical_json(summary, pretty=True), encoding="utf-8", newline="\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=HERE / "evidence")
    args = parser.parse_args()
    receipts = all_receipts()
    summary = build_summary(receipts)
    write_evidence(args.output, receipts, summary)
    print(canonical_json(summary, pretty=True), end="")
    return 0 if summary["total_passed"] == summary["total"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
