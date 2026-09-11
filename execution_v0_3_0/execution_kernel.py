"""Deterministic V3.3 synchronous reference execution kernel.

The module imports the sealed V3.1 and V3.2 realizations by SHA-256 identity.
It adds runtime state and pure synchronous stepping without modifying either
static substrate or exposing an external-stimulus interface.
"""

from __future__ import annotations

from dataclasses import dataclass, fields, is_dataclass, replace
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import sys
from typing import Any, Iterable, Mapping, Sequence


SPEC_VERSION = "0.3.0-candidate"
SPEC_SHA256 = "5bb1497aa3d791150f0416feda4e393695a9302b42030add0a7d22c08ccbeac0"
HANDOFF_SHA256 = "7c2806e441785ce98b49476e84a311f8134bde76aedb39a6723826d73d94a36d"
VECTORS_SHA256 = "846dbf4be822c6816e788d4bcce98f34d815d1ab870e62bdc5dea67636e9c055"

V3_1_KERNEL_SHA256 = "8b983301dad795dd9c3f020970bad76017ef648ac0c71e3fb6fdef3d0e4347c0"
V3_1_SUMMARY_SHA256 = "16ce384323538a69627b1cfdcddb677a3056ab5e9b3cd28e3f9b371de82e04bb"
V3_2_KERNEL_SHA256 = "89105692eee04580db1c98556b51d0644292b7fb7b42fa4f41ebd381cde256dc"
V3_2_SUMMARY_SHA256 = "19ee5b395b44e016a24c259674a35ea055a6df4d33d32657a223afcd2cf05c8b"
V3_2_PROMOTION_SHA256 = "12b1e6c73d74b4fdf2c6fa30c4b1af201fe8daacc2c2e3f94aacecc9cd93460a"


EMPTY = "EMPTY"
ADMITTED = "ADMITTED"
COMPLETED = "COMPLETED"
DISCHARGED = "DISCHARGED"

COMPLETE = "COMPLETE"
INCOMPLETE = "INCOMPLETE"
INVALID = "INVALID"

ADMITTED_TO_TARGET = "ADMITTED_TO_TARGET"
PENDING_AT_TARGET = "PENDING_AT_TARGET"
REJECTED_AT_TARGET = "REJECTED_AT_TARGET"

RUNNING = "RUNNING"
HALTED = "HALTED"
BLOCKED = "BLOCKED"

ADMIT = "ADMIT"
PEND = "PEND"
REJECT = "REJECT"

FORWARD = "FORWARD"
REVERSE = "REVERSE"
STAGE_ORDER = ("SNAPSHOT", "EVALUATE", "PROPAGATE_ASSEMBLE", "GOVERN", "COMMIT")
ORDER_SURFACES = (
    "cell_order",
    "route_order",
    "buffer_order",
    "governance_order",
    "obligation_order",
    "receipt_order",
    "commit_order",
)


class ExecutionError(ValueError):
    """Base error for malformed execution state or schedules."""


class ForbiddenTransition(ExecutionError):
    """Raised when a payload phase edge is not in the normative lifecycle."""


class ImportIdentityError(ExecutionError):
    """Raised when an imported V3.1 or V3.2 artifact differs from its seal."""


def _sha256_file(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


_HERE = Path(__file__).resolve().parent
_V31_ROOT = _HERE.parent / "static_fabric_v0_1_0"
_V32_ROOT = _HERE.parent / "admissibility_v0_2_0"
_V31_PATH = _V31_ROOT / "kernel.py"
_V31_SUMMARY = _V31_ROOT / "evidence" / "queuegate-evidence-summary.json"
_V32_PATH = _V32_ROOT / "admission_kernel.py"
_V32_SUMMARY = _V32_ROOT / "evidence" / "queuegate-evidence-summary.json"
_V32_PROMOTION = _V32_ROOT / "PROMOTION_RECORD.md"

_IMPORT_BINDINGS = (
    (_V31_PATH, V3_1_KERNEL_SHA256, "V3_1_KERNEL"),
    (_V31_SUMMARY, V3_1_SUMMARY_SHA256, "V3_1_EVIDENCE"),
    (_V32_PATH, V3_2_KERNEL_SHA256, "V3_2_KERNEL"),
    (_V32_SUMMARY, V3_2_SUMMARY_SHA256, "V3_2_EVIDENCE"),
    (_V32_PROMOTION, V3_2_PROMOTION_SHA256, "V3_2_PROMOTION"),
)
for _path, _expected, _name in _IMPORT_BINDINGS:
    if not _path.is_file() or _sha256_file(_path) != _expected:
        raise ImportIdentityError(f"{_name}_IMPORT_MISMATCH")

_V32_MODULE_NAME = "mal_fabric_v3_2_execution_import"
_V32_SPEC = importlib.util.spec_from_file_location(_V32_MODULE_NAME, _V32_PATH)
if _V32_SPEC is None or _V32_SPEC.loader is None:
    raise ImportIdentityError("V3_2_IMPORT_UNAVAILABLE")
v32 = importlib.util.module_from_spec(_V32_SPEC)
sys.modules[_V32_MODULE_NAME] = v32
_V32_SPEC.loader.exec_module(v32)
v31 = v32.v31


def canonical_value(value: Any) -> Any:
    if hasattr(value, "canonical") and callable(value.canonical):
        return canonical_value(value.canonical())
    if isinstance(value, Mapping):
        return {str(key): canonical_value(value[key]) for key in sorted(value, key=str)}
    if isinstance(value, (tuple, list)):
        return [canonical_value(item) for item in value]
    if isinstance(value, (set, frozenset)):
        items = [canonical_value(item) for item in value]
        return sorted(items, key=lambda item: canonical_json(item))
    if is_dataclass(value):
        return {field.name: canonical_value(getattr(value, field.name)) for field in fields(value)}
    return value


def canonical_json(value: Any, *, pretty: bool = False) -> str:
    normalized = canonical_value(value)
    if pretty:
        return json.dumps(normalized, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    return json.dumps(normalized, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def canonical_digest(value: Any) -> str:
    return sha256(canonical_json(value).encode("utf-8")).hexdigest()


def program_digest(program: Any) -> str:
    return v31.canonical_digest(v31.normalize(program))


@dataclass(frozen=True)
class InputValue:
    route_id: str
    payload_type: str
    value: Any
    source_receipt: str

    def canonical(self) -> dict[str, Any]:
        return {
            "route_id": self.route_id,
            "payload_type": self.payload_type,
            "value": canonical_value(self.value),
            "source_receipt": self.source_receipt,
        }


@dataclass(frozen=True)
class InputFrame:
    bindings: tuple[tuple[str, tuple[InputValue, ...]], ...]

    def canonical(self) -> dict[str, Any]:
        return {
            role: [value.canonical() for value in sorted(values, key=input_value_key)]
            for role, values in sorted(self.bindings)
        }

    def role_map(self) -> dict[str, tuple[InputValue, ...]]:
        return {role: tuple(sorted(values, key=input_value_key)) for role, values in self.bindings}


def input_value_key(value: InputValue) -> tuple[str, str]:
    return (value.route_id, canonical_digest(value.value))


def input_frame(bindings: Mapping[str, Iterable[InputValue]]) -> InputFrame:
    return InputFrame(
        tuple(
            (role, tuple(sorted(tuple(values), key=input_value_key)))
            for role, values in sorted(bindings.items())
        )
    )


@dataclass(frozen=True)
class EgressDisposition:
    route_id: str
    target_cell: str
    kind: str
    receipt_id: str
    candidate_ref: str | None = None
    reason: str | None = None

    def canonical(self) -> dict[str, Any]:
        return {
            "route_id": self.route_id,
            "target_cell": self.target_cell,
            "kind": self.kind,
            "receipt_id": self.receipt_id,
            "candidate_ref": self.candidate_ref,
            "reason": self.reason,
        }


@dataclass(frozen=True)
class PayloadState:
    phase: str
    frame: InputFrame | None = None
    admission_receipt: str | None = None
    result: Any = None
    completion_evidence: tuple[EgressDisposition, ...] = ()
    result_ref: str | None = None
    discharge_receipt: str | None = None

    def canonical(self) -> dict[str, Any]:
        return {
            "phase": self.phase,
            "frame": canonical_value(self.frame),
            "admission_receipt": self.admission_receipt,
            "result": canonical_value(self.result),
            "completion_evidence": [
                item.canonical() for item in sorted(self.completion_evidence, key=lambda item: item.route_id)
            ],
            "result_ref": self.result_ref,
            "discharge_receipt": self.discharge_receipt,
        }


def empty_payload() -> PayloadState:
    return PayloadState(EMPTY)


def admitted_payload(frame: InputFrame, receipt: str) -> PayloadState:
    return PayloadState(ADMITTED, frame=frame, admission_receipt=receipt)


def completed_payload(
    frame: InputFrame,
    result: Any,
    evidence: Iterable[EgressDisposition] = (),
) -> PayloadState:
    return PayloadState(
        COMPLETED,
        frame=frame,
        result=result,
        completion_evidence=tuple(sorted(evidence, key=lambda item: item.route_id)),
    )


def discharged_payload(result_ref: str, receipt: str) -> PayloadState:
    return PayloadState(DISCHARGED, result_ref=result_ref, discharge_receipt=receipt)


LEGAL_PHASE_TRANSITIONS = {
    (EMPTY, ADMITTED),
    (ADMITTED, COMPLETED),
    (COMPLETED, DISCHARGED),
    (DISCHARGED, EMPTY),
}


def transition_payload(before: PayloadState, after: PayloadState) -> PayloadState:
    edge = (before.phase, after.phase)
    if edge not in LEGAL_PHASE_TRANSITIONS:
        raise ForbiddenTransition(f"FORBIDDEN_PAYLOAD_TRANSITION:{before.phase}->{after.phase}")
    return after


@dataclass(frozen=True)
class PartialInputBuffer:
    cell_id: str
    arrived_values: tuple[tuple[str, tuple[InputValue, ...]], ...]
    tick_of_first_arrival: int
    source_receipts: tuple[str, ...]

    def canonical(self) -> dict[str, Any]:
        return {
            "cell_id": self.cell_id,
            "arrived_values": input_frame(dict(self.arrived_values)).canonical(),
            "tick_of_first_arrival": self.tick_of_first_arrival,
            "source_receipts": sorted(set(self.source_receipts)),
        }

    def role_map(self) -> dict[str, tuple[InputValue, ...]]:
        return input_frame(dict(self.arrived_values)).role_map()


@dataclass(frozen=True)
class PendingAdmission:
    candidate_id: str
    target_cell: str
    arrivals: tuple[tuple[str, tuple[InputValue, ...]], ...]
    evidence_obligation: str
    trigger_satisfied: bool = False
    resolution: str = ADMIT

    def canonical(self) -> dict[str, Any]:
        return {
            "candidate_id": self.candidate_id,
            "target_cell": self.target_cell,
            "arrivals": input_frame(dict(self.arrivals)).canonical(),
            "evidence_obligation": self.evidence_obligation,
            "trigger_satisfied": self.trigger_satisfied,
            "resolution": self.resolution,
        }


@dataclass(frozen=True)
class OutstandingObligation:
    obligation_id: str
    subject_id: str
    discharge_predicate_satisfied: bool = False

    def canonical(self) -> dict[str, Any]:
        return {
            "obligation_id": self.obligation_id,
            "subject_id": self.subject_id,
            "discharge_predicate_satisfied": self.discharge_predicate_satisfied,
        }


@dataclass(frozen=True)
class RuntimeReceipt:
    receipt_id: str
    kind: str
    subject_id: str
    payload_digest: str

    def canonical(self) -> dict[str, str]:
        return {
            "receipt_id": self.receipt_id,
            "kind": self.kind,
            "subject_id": self.subject_id,
            "payload_digest": self.payload_digest,
        }


def runtime_receipt(kind: str, subject_id: str, payload: Any) -> RuntimeReceipt:
    payload_digest = canonical_digest(payload)
    receipt_id = canonical_digest((kind, subject_id, payload_digest))
    return RuntimeReceipt(receipt_id, kind, subject_id, payload_digest)


@dataclass(frozen=True)
class FabricState:
    payload_states: tuple[tuple[str, PayloadState], ...]
    route_states: tuple[tuple[str, EgressDisposition], ...] = ()
    pending_admissions: tuple[PendingAdmission, ...] = ()
    pending_input_buffers: tuple[PartialInputBuffer, ...] = ()
    outstanding_obligations: tuple[OutstandingObligation, ...] = ()
    receipts: tuple[RuntimeReceipt, ...] = ()

    def canonical(self) -> dict[str, Any]:
        return {
            "payload_states": {
                cell_id: state.canonical() for cell_id, state in sorted(self.payload_states)
            },
            "route_states": {
                route_id: disposition.canonical()
                for route_id, disposition in sorted(self.route_states)
            },
            "pending_admissions": [
                item.canonical() for item in sorted(self.pending_admissions, key=lambda item: item.candidate_id)
            ],
            "pending_input_buffers": [
                item.canonical() for item in sorted(self.pending_input_buffers, key=lambda item: item.cell_id)
            ],
            "outstanding_obligations": [
                item.canonical()
                for item in sorted(self.outstanding_obligations, key=lambda item: item.obligation_id)
            ],
            "receipts": [item.canonical() for item in sorted(self.receipts, key=lambda item: item.receipt_id)],
        }

    def payload_map(self) -> dict[str, PayloadState]:
        return dict(self.payload_states)

    def buffer_map(self) -> dict[str, PartialInputBuffer]:
        return {item.cell_id: item for item in self.pending_input_buffers}


def fabric_state(
    program: Any,
    *,
    payload_states: Mapping[str, PayloadState] | None = None,
    route_states: Iterable[tuple[str, EgressDisposition]] = (),
    pending_admissions: Iterable[PendingAdmission] = (),
    pending_input_buffers: Iterable[PartialInputBuffer] = (),
    outstanding_obligations: Iterable[OutstandingObligation] = (),
    receipts: Iterable[RuntimeReceipt] = (),
) -> FabricState:
    supplied = dict(payload_states or {})
    cells = {cell.cell_id for cell in program.cells}
    if set(supplied) - cells:
        raise ExecutionError("PAYLOAD_STATE_REFERENCES_UNKNOWN_CELL")
    payloads = tuple(sorted((cell_id, supplied.get(cell_id, empty_payload())) for cell_id in cells))
    return FabricState(
        payloads,
        tuple(sorted(route_states, key=lambda item: item[0])),
        tuple(sorted(pending_admissions, key=lambda item: item.candidate_id)),
        tuple(sorted(pending_input_buffers, key=lambda item: item.cell_id)),
        tuple(sorted(outstanding_obligations, key=lambda item: item.obligation_id)),
        tuple(sorted({item.receipt_id: item for item in receipts}.values(), key=lambda item: item.receipt_id)),
    )


@dataclass(frozen=True)
class Sigma:
    program: Any
    state: FabricState

    def canonical(self) -> dict[str, Any]:
        return {"program": v31.normalize(self.program), "state": self.state.canonical()}


@dataclass(frozen=True)
class AssemblyResult:
    kind: str
    frame: InputFrame | None = None
    pending_roles: tuple[str, ...] = ()
    reason: str | None = None


def _cell(program: Any, cell_id: str) -> Any:
    try:
        return next(cell for cell in program.cells if cell.cell_id == cell_id)
    except StopIteration as exc:
        raise ExecutionError(f"UNKNOWN_CELL:{cell_id}") from exc


def assemble_frame(cell: Any, arrivals: Mapping[str, Iterable[InputValue]]) -> AssemblyResult:
    grouped = {
        role: tuple(sorted(tuple(values), key=input_value_key))
        for role, values in arrivals.items()
    }
    signature = {role: (multiplicity, payload_type) for role, multiplicity, payload_type in v31.join_signature(cell.operator, cell.witness)}
    unknown = tuple(sorted(set(grouped) - set(signature)))
    if unknown:
        return AssemblyResult(INVALID, reason=f"unknown_role:{','.join(unknown)}")

    bindings: dict[str, tuple[InputValue, ...]] = {}
    pending: list[str] = []
    for role, (multiplicity, payload_type) in sorted(signature.items()):
        values = grouped.get(role, ())
        if any(not v31.type_compat(value.payload_type, payload_type) for value in values):
            return AssemblyResult(INVALID, reason=f"type_failure:{role}")
        if multiplicity == v31.EXACTLY_ONE:
            if len(values) == 0:
                pending.append(role)
            elif len(values) == 1:
                bindings[role] = values
            else:
                return AssemblyResult(INVALID, reason=f"overconnection:{role}")
        elif multiplicity == v31.MANY:
            if values:
                bindings[role] = values
            elif cell.operator == "TOGETHER_ALONE" and role == "MEMBER":
                bindings[role] = ()
            else:
                pending.append(role)
        else:
            return AssemblyResult(INVALID, reason=f"unknown_multiplicity:{multiplicity}")
    if pending:
        return AssemblyResult(INCOMPLETE, pending_roles=tuple(sorted(pending)))
    return AssemblyResult(COMPLETE, frame=input_frame(bindings))


def frame_ready(cell: Any, arrivals: Mapping[str, Iterable[InputValue]]) -> bool:
    return assemble_frame(cell, arrivals).kind == COMPLETE


@dataclass(frozen=True)
class EvaluationResult:
    cell_id: str
    result: Any
    payload_type: str
    snapshot_digest: str
    receipt: RuntimeReceipt

    def canonical(self) -> dict[str, Any]:
        return {
            "cell_id": self.cell_id,
            "result": canonical_value(self.result),
            "payload_type": self.payload_type,
            "snapshot_digest": self.snapshot_digest,
            "receipt": self.receipt.canonical(),
        }


def evaluate(cell: Any, program: Any, snapshot: FabricState) -> EvaluationResult:
    payload = snapshot.payload_map().get(cell.cell_id, empty_payload())
    if payload.phase != ADMITTED or payload.frame is None:
        raise ExecutionError(f"EVALUATE_REQUIRES_ADMITTED:{cell.cell_id}")
    result = {
        "operator": cell.operator,
        "witness": cell.witness,
        "input_frame": payload.frame.canonical(),
    }
    receipt = runtime_receipt("CELL_EVALUATED", cell.cell_id, result)
    return EvaluationResult(
        cell.cell_id,
        result,
        v31.witness_type(cell.witness, v31.RESULT),
        canonical_digest(snapshot),
        receipt,
    )


@dataclass(frozen=True)
class RouteResult:
    route_id: str
    source_cell: str
    target_cell: str
    target_role: str
    arrival: InputValue

    def canonical(self) -> dict[str, Any]:
        return {
            "route_id": self.route_id,
            "source_cell": self.source_cell,
            "target_cell": self.target_cell,
            "target_role": self.target_role,
            "arrival": self.arrival.canonical(),
        }


def propagate(route: Any, program: Any, snapshot: FabricState, cell_results: Mapping[str, EvaluationResult]) -> RouteResult | None:
    del program, snapshot
    result = cell_results.get(route.source_cell)
    if result is None:
        return None
    arrival = InputValue(route.route_id, result.payload_type, result.result, result.receipt.receipt_id)
    return RouteResult(route.route_id, route.source_cell, route.target_cell, route.target_role, arrival)


@dataclass(frozen=True)
class RuntimeAuthority:
    imported_v3_2_kernel_sha256: str = V3_2_KERNEL_SHA256
    decisions: tuple[tuple[str, str], ...] = ()

    def decision_for(self, route_id: str) -> str:
        decision = dict(self.decisions).get(route_id, ADMIT)
        if decision not in (ADMIT, PEND, REJECT):
            raise ExecutionError(f"UNKNOWN_RUNTIME_GOVERNANCE_DECISION:{decision}")
        return decision

    @property
    def digest(self) -> str:
        return canonical_digest(
            {
                "imported_v3_2_kernel_sha256": self.imported_v3_2_kernel_sha256,
                "decisions": sorted(self.decisions),
            }
        )


@dataclass(frozen=True)
class GovernanceResults:
    dispositions: tuple[EgressDisposition, ...]
    admissions: tuple[tuple[str, InputFrame, str], ...]
    buffers: tuple[PartialInputBuffer, ...]
    pending_admissions: tuple[PendingAdmission, ...]
    outstanding_obligations: tuple[OutstandingObligation, ...]
    receipts: tuple[RuntimeReceipt, ...]
    imported_authority_digest: str

    def canonical(self) -> dict[str, Any]:
        return {
            "dispositions": [item.canonical() for item in sorted(self.dispositions, key=lambda item: item.route_id)],
            "admissions": [
                {"cell_id": cell_id, "frame": frame.canonical(), "receipt_id": receipt_id}
                for cell_id, frame, receipt_id in sorted(self.admissions)
            ],
            "buffers": [item.canonical() for item in sorted(self.buffers, key=lambda item: item.cell_id)],
            "pending_admissions": [
                item.canonical() for item in sorted(self.pending_admissions, key=lambda item: item.candidate_id)
            ],
            "outstanding_obligations": [
                item.canonical()
                for item in sorted(self.outstanding_obligations, key=lambda item: item.obligation_id)
            ],
            "receipts": [item.canonical() for item in sorted(self.receipts, key=lambda item: item.receipt_id)],
            "imported_authority_digest": self.imported_authority_digest,
        }


def merge_arrivals(
    left: Mapping[str, Iterable[InputValue]],
    right: Mapping[str, Iterable[InputValue]],
) -> dict[str, tuple[InputValue, ...]]:
    merged: dict[str, dict[tuple[str, str], InputValue]] = {}
    for source in (left, right):
        for role, values in source.items():
            bucket = merged.setdefault(role, {})
            for value in values:
                bucket[input_value_key(value)] = value
    return {
        role: tuple(sorted(values.values(), key=input_value_key))
        for role, values in sorted(merged.items())
    }


def _ordered(items: Sequence[Any], mode: str | tuple[str, ...], key: Any) -> list[Any]:
    ordered = sorted(items, key=key)
    if mode == REVERSE:
        ordered.reverse()
    elif mode == FORWARD:
        pass
    elif isinstance(mode, tuple):
        keyed = {str(key(item)): item for item in items}
        if len(keyed) != len(items) or len(set(mode)) != len(mode) or not set(keyed) <= set(mode):
            raise ExecutionError(f"INVALID_EXPLICIT_ORDER:{mode}")
        ordered = [keyed[identity] for identity in mode if identity in keyed]
    else:
        raise ExecutionError(f"INVALID_ORDER_MODE:{mode}")
    return ordered


def govern_runtime(
    program: Any,
    snapshot: FabricState,
    route_results: Sequence[RouteResult],
    imported_v3_2_authority: RuntimeAuthority,
    *,
    governance_order: str | tuple[str, ...] = FORWARD,
    buffer_order: str | tuple[str, ...] = FORWARD,
    obligation_order: str | tuple[str, ...] = FORWARD,
) -> GovernanceResults:
    if imported_v3_2_authority.imported_v3_2_kernel_sha256 != V3_2_KERNEL_SHA256:
        raise ImportIdentityError("V3_2_RUNTIME_AUTHORITY_MISMATCH")

    arrivals_by_target: dict[str, dict[str, tuple[InputValue, ...]]] = {}
    dispositions: list[EgressDisposition] = []
    receipts: list[RuntimeReceipt] = []
    pending: dict[str, PendingAdmission] = {
        item.candidate_id: item for item in snapshot.pending_admissions
    }
    obligations: dict[str, OutstandingObligation] = {
        item.obligation_id: item for item in snapshot.outstanding_obligations
    }

    for item in _ordered(tuple(route_results), governance_order, lambda value: value.route_id):
        decision = imported_v3_2_authority.decision_for(item.route_id)
        base = (item.route_id, item.target_cell, item.target_role, item.arrival.canonical(), imported_v3_2_authority.digest)
        if decision == ADMIT:
            receipt = runtime_receipt("ADMITTED_TO_TARGET", item.route_id, base)
            disposition = EgressDisposition(item.route_id, item.target_cell, ADMITTED_TO_TARGET, receipt.receipt_id)
            current = arrivals_by_target.setdefault(item.target_cell, {})
            current[item.target_role] = tuple(current.get(item.target_role, ())) + (item.arrival,)
        elif decision == PEND:
            candidate_id = canonical_digest(("runtime_candidate", base))
            obligation_id = canonical_digest(("runtime_evidence", candidate_id))
            receipt = runtime_receipt("PENDING_AT_TARGET", item.route_id, base)
            disposition = EgressDisposition(
                item.route_id,
                item.target_cell,
                PENDING_AT_TARGET,
                receipt.receipt_id,
                candidate_ref=candidate_id,
            )
            pending[candidate_id] = PendingAdmission(
                candidate_id,
                item.target_cell,
                ((item.target_role, (item.arrival,)),),
                obligation_id,
            )
            obligations[obligation_id] = OutstandingObligation(obligation_id, candidate_id)
        else:
            receipt = runtime_receipt("REJECTED_AT_TARGET", item.route_id, base)
            disposition = EgressDisposition(
                item.route_id,
                item.target_cell,
                REJECTED_AT_TARGET,
                receipt.receipt_id,
                reason="runtime_authority_rejected",
            )
        dispositions.append(disposition)
        receipts.append(receipt)

    for item in _ordered(tuple(pending.values()), governance_order, lambda value: value.candidate_id):
        if not item.trigger_satisfied:
            continue
        pending.pop(item.candidate_id, None)
        obligations.pop(item.evidence_obligation, None)
        if item.resolution == ADMIT:
            current = arrivals_by_target.setdefault(item.target_cell, {})
            arrivals_by_target[item.target_cell] = merge_arrivals(current, dict(item.arrivals))
            receipts.append(runtime_receipt("PENDING_ADMISSION_RESOLVED", item.candidate_id, item.canonical()))
        elif item.resolution == REJECT:
            receipts.append(runtime_receipt("PENDING_ADMISSION_REJECTED", item.candidate_id, item.canonical()))
        else:
            raise ExecutionError(f"INVALID_PENDING_RESOLUTION:{item.resolution}")

    for item in _ordered(tuple(obligations.values()), obligation_order, lambda value: value.obligation_id):
        if item.discharge_predicate_satisfied:
            obligations.pop(item.obligation_id, None)
            receipts.append(runtime_receipt("OBLIGATION_DISCHARGED", item.obligation_id, item.canonical()))

    existing_buffers = snapshot.buffer_map()
    target_ids = _ordered(
        tuple(set(existing_buffers) | set(arrivals_by_target)),
        buffer_order,
        lambda value: value,
    )
    buffers: list[PartialInputBuffer] = []
    admissions: list[tuple[str, InputFrame, str]] = []
    payloads = snapshot.payload_map()
    for cell_id in target_ids:
        existing = existing_buffers.get(cell_id)
        old = existing.role_map() if existing else {}
        merged = merge_arrivals(old, arrivals_by_target.get(cell_id, {}))
        assembly = assemble_frame(_cell(program, cell_id), merged)
        if assembly.kind == COMPLETE and payloads.get(cell_id, empty_payload()).phase == EMPTY:
            receipt = runtime_receipt("FRAME_ADMITTED", cell_id, assembly.frame)
            admissions.append((cell_id, assembly.frame, receipt.receipt_id))
            receipts.append(receipt)
        elif assembly.kind == INVALID:
            receipts.append(runtime_receipt("FRAME_REJECTED", cell_id, assembly.reason))
        else:
            first_tick = existing.tick_of_first_arrival if existing else len(snapshot.receipts)
            source_receipts = tuple(
                sorted({value.source_receipt for values in merged.values() for value in values})
            )
            buffers.append(
                PartialInputBuffer(
                    cell_id,
                    tuple((role, values) for role, values in sorted(merged.items())),
                    first_tick,
                    source_receipts,
                )
            )

    return GovernanceResults(
        tuple(sorted(dispositions, key=lambda item: item.route_id)),
        tuple(sorted(admissions, key=lambda item: item[0])),
        tuple(sorted(buffers, key=lambda item: item.cell_id)),
        tuple(sorted(pending.values(), key=lambda item: item.candidate_id)),
        tuple(sorted(obligations.values(), key=lambda item: item.obligation_id)),
        tuple(sorted({item.receipt_id: item for item in receipts}.values(), key=lambda item: item.receipt_id)),
        imported_v3_2_authority.digest,
    )


def egress_closed(program: Any, cell_id: str, payload: PayloadState) -> bool:
    outgoing = {route.route_id for route in program.routes if route.source_cell == cell_id}
    if not outgoing:
        return True
    durable = {
        item.route_id
        for item in payload.completion_evidence
        if item.kind in (ADMITTED_TO_TARGET, PENDING_AT_TARGET, REJECTED_AT_TARGET)
    }
    return outgoing <= durable


@dataclass(frozen=True)
class BlockedReason:
    kind: str
    subject_id: str
    details: tuple[str, ...] = ()

    def canonical(self) -> dict[str, Any]:
        return {"kind": self.kind, "subject_id": self.subject_id, "details": sorted(self.details)}


def blocked_reasons(program: Any, state: FabricState) -> tuple[BlockedReason, ...]:
    reasons: list[BlockedReason] = []
    payloads = state.payload_map()
    for buffer in state.pending_input_buffers:
        result = assemble_frame(_cell(program, buffer.cell_id), buffer.role_map())
        missing = result.pending_roles if result.kind == INCOMPLETE else ((result.reason or INVALID),)
        reasons.append(BlockedReason("PARTIAL_INPUT", buffer.cell_id, tuple(sorted(missing))))
    for item in state.pending_admissions:
        if not item.trigger_satisfied:
            reasons.append(BlockedReason("PENDING_ADMISSION", item.candidate_id, (item.evidence_obligation,)))
    for cell_id, payload in sorted(payloads.items()):
        if payload.phase == COMPLETED and not egress_closed(program, cell_id, payload):
            present = {item.route_id for item in payload.completion_evidence}
            unresolved = tuple(sorted(route.route_id for route in program.routes if route.source_cell == cell_id and route.route_id not in present))
            reasons.append(BlockedReason("EGRESS_OPEN", cell_id, unresolved))
    for item in state.outstanding_obligations:
        if not item.discharge_predicate_satisfied:
            reasons.append(BlockedReason("OUTSTANDING_OBLIGATION", item.obligation_id, ()))
    return tuple(sorted(reasons, key=lambda item: (item.kind, item.subject_id, item.details)))


def internal_progress_enabled(program: Any, state: FabricState) -> bool:
    for cell_id, payload in state.payload_states:
        if payload.phase == ADMITTED:
            return True
        if payload.phase == COMPLETED and egress_closed(program, cell_id, payload):
            return True
        if payload.phase == DISCHARGED:
            return True
    payloads = state.payload_map()
    for buffer in state.pending_input_buffers:
        if payloads.get(buffer.cell_id, empty_payload()).phase == EMPTY and frame_ready(
            _cell(program, buffer.cell_id), buffer.role_map()
        ):
            return True
    if any(item.trigger_satisfied for item in state.pending_admissions):
        return True
    return any(item.discharge_predicate_satisfied for item in state.outstanding_obligations)


def internally_quiescent(program: Any, state: FabricState) -> bool:
    return not internal_progress_enabled(program, state)


def terminally_quiescent(program: Any, state: FabricState) -> bool:
    return (
        internally_quiescent(program, state)
        and all(payload.phase == EMPTY for _, payload in state.payload_states)
        and not state.pending_input_buffers
        and not state.pending_admissions
        and not state.outstanding_obligations
    )


def halt(program: Any, state: FabricState) -> bool:
    return terminally_quiescent(program, state)


def is_blocked(program: Any, state: FabricState) -> bool:
    return internally_quiescent(program, state) and not terminally_quiescent(program, state)


def run_status(program: Any, state: FabricState) -> str:
    if internal_progress_enabled(program, state):
        return RUNNING
    if terminally_quiescent(program, state):
        return HALTED
    return BLOCKED


@dataclass(frozen=True)
class HostSchedule:
    schedule_id: str
    cell_order: str | tuple[str, ...] = FORWARD
    route_order: str | tuple[str, ...] = FORWARD
    buffer_order: str | tuple[str, ...] = FORWARD
    governance_order: str | tuple[str, ...] = FORWARD
    obligation_order: str | tuple[str, ...] = FORWARD
    receipt_order: str | tuple[str, ...] = FORWARD
    commit_order: str | tuple[str, ...] = FORWARD
    stage_order: tuple[str, ...] = STAGE_ORDER


def _valid_order_specification(order: Any) -> bool:
    return order in (FORWARD, REVERSE) or (
        isinstance(order, tuple)
        and all(isinstance(identity, str) for identity in order)
        and len(order) == len(set(order))
    )


def valid_host_schedule(schedule: HostSchedule) -> bool:
    return schedule.stage_order == STAGE_ORDER and all(
        _valid_order_specification(getattr(schedule, surface)) for surface in ORDER_SURFACES
    )


DEFAULT_SCHEDULE = HostSchedule("canonical")
DEFAULT_AUTHORITY = RuntimeAuthority()


@dataclass(frozen=True)
class TickResult:
    sigma: Sigma
    active_cells: tuple[str, ...]
    cell_results: tuple[EvaluationResult, ...]
    route_results: tuple[RouteResult, ...]
    governance_results: GovernanceResults
    payload_transitions: tuple[tuple[str, str, str], ...]

    def canonical_evidence(self) -> dict[str, Any]:
        return {
            "state_after": self.sigma.state.canonical(),
            "active_cells": sorted(self.active_cells),
            "cell_results": [item.canonical() for item in sorted(self.cell_results, key=lambda item: item.cell_id)],
            "route_results": [item.canonical() for item in sorted(self.route_results, key=lambda item: item.route_id)],
            "governance_results": self.governance_results.canonical(),
            "payload_transitions": [list(item) for item in sorted(self.payload_transitions)],
            "run_status": run_status(self.sigma.program, self.sigma.state),
            "blocked_reasons": [item.canonical() for item in blocked_reasons(self.sigma.program, self.sigma.state)],
        }


def simultaneous_commit(
    program: Any,
    snapshot: FabricState,
    cell_results: Sequence[EvaluationResult],
    governance_results: GovernanceResults,
    *,
    commit_order: str | tuple[str, ...] = FORWARD,
    receipt_order: str | tuple[str, ...] = FORWARD,
) -> tuple[FabricState, tuple[tuple[str, str, str], ...]]:
    payloads = snapshot.payload_map()
    evaluations = {item.cell_id: item for item in cell_results}
    dispositions_by_source: dict[str, list[EgressDisposition]] = {}
    route_by_id = {route.route_id: route for route in program.routes}
    for disposition in governance_results.dispositions:
        source = route_by_id[disposition.route_id].source_cell
        dispositions_by_source.setdefault(source, []).append(disposition)

    transitions: list[tuple[str, str, str]] = []
    cell_ids = _ordered(tuple(payloads), commit_order, lambda item: item)
    next_payloads = dict(payloads)
    for cell_id in cell_ids:
        payload = payloads[cell_id]
        if payload.phase == ADMITTED:
            result = evaluations.get(cell_id)
            if result is None or payload.frame is None:
                raise ExecutionError(f"ACTIVE_CELL_RESULT_MISSING:{cell_id}")
            after = completed_payload(payload.frame, result.result, dispositions_by_source.get(cell_id, ()))
            transition_payload(payload, after)
            next_payloads[cell_id] = after
            transitions.append((cell_id, ADMITTED, COMPLETED))
        elif payload.phase == COMPLETED and egress_closed(program, cell_id, payload):
            result_ref = canonical_digest(payload.result)
            discharge = runtime_receipt("PAYLOAD_DISCHARGED", cell_id, result_ref)
            after = discharged_payload(result_ref, discharge.receipt_id)
            transition_payload(payload, after)
            next_payloads[cell_id] = after
            transitions.append((cell_id, COMPLETED, DISCHARGED))
        elif payload.phase == DISCHARGED:
            after = empty_payload()
            transition_payload(payload, after)
            next_payloads[cell_id] = after
            transitions.append((cell_id, DISCHARGED, EMPTY))

    for cell_id, frame, receipt_id in governance_results.admissions:
        if payloads.get(cell_id, empty_payload()).phase != EMPTY:
            continue
        before = payloads[cell_id]
        after = admitted_payload(frame, receipt_id)
        transition_payload(before, after)
        next_payloads[cell_id] = after
        transitions.append((cell_id, EMPTY, ADMITTED))

    receipts = {item.receipt_id: item for item in snapshot.receipts}
    new_receipts = list(governance_results.receipts) + [item.receipt for item in cell_results]
    for cell_id, before, after in transitions:
        transition_receipt = runtime_receipt("PAYLOAD_TRANSITION", cell_id, (before, after))
        new_receipts.append(transition_receipt)
    for item in _ordered(tuple(new_receipts), receipt_order, lambda value: value.receipt_id):
        receipts[item.receipt_id] = item

    route_states = dict(snapshot.route_states)
    for item in governance_results.dispositions:
        route_states[item.route_id] = item

    next_state = FabricState(
        tuple(sorted(next_payloads.items())),
        tuple(sorted(route_states.items())),
        governance_results.pending_admissions,
        governance_results.buffers,
        governance_results.outstanding_obligations,
        tuple(sorted(receipts.values(), key=lambda item: item.receipt_id)),
    )
    return next_state, tuple(sorted(transitions))


def _empty_governance(authority: RuntimeAuthority) -> GovernanceResults:
    return GovernanceResults((), (), (), (), (), (), authority.digest)


def step_impl(
    sigma: Sigma,
    schedule: HostSchedule,
    imported_v3_2_authority: RuntimeAuthority = DEFAULT_AUTHORITY,
) -> TickResult:
    if not valid_host_schedule(schedule):
        raise ExecutionError("INVALID_HOST_SCHEDULE")
    if halt(sigma.program, sigma.state):
        return TickResult(sigma, (), (), (), _empty_governance(imported_v3_2_authority), ())

    snapshot = sigma.state
    active = tuple(
        cell_id for cell_id, payload in snapshot.payload_states if payload.phase == ADMITTED
    )
    active_cells = _ordered(active, schedule.cell_order, lambda item: item)
    cells = {cell.cell_id: cell for cell in sigma.program.cells}
    cell_results_list = [evaluate(cells[cell_id], sigma.program, snapshot) for cell_id in active_cells]
    cell_results = {item.cell_id: item for item in cell_results_list}

    routes = _ordered(tuple(sigma.program.routes), schedule.route_order, lambda item: item.route_id)
    route_results_list = [
        result
        for route in routes
        if (result := propagate(route, sigma.program, snapshot, cell_results)) is not None
    ]
    governance = govern_runtime(
        sigma.program,
        snapshot,
        route_results_list,
        imported_v3_2_authority,
        governance_order=schedule.governance_order,
        buffer_order=schedule.buffer_order,
        obligation_order=schedule.obligation_order,
    )
    next_state, transitions = simultaneous_commit(
        sigma.program,
        snapshot,
        cell_results_list,
        governance,
        commit_order=schedule.commit_order,
        receipt_order=schedule.receipt_order,
    )
    return TickResult(
        Sigma(sigma.program, next_state),
        tuple(sorted(active)),
        tuple(sorted(cell_results_list, key=lambda item: item.cell_id)),
        tuple(sorted(route_results_list, key=lambda item: item.route_id)),
        governance,
        transitions,
    )


def step_fabric(
    sigma: Sigma,
    imported_v3_2_authority: RuntimeAuthority = DEFAULT_AUTHORITY,
) -> TickResult:
    return step_impl(sigma, DEFAULT_SCHEDULE, imported_v3_2_authority)


def run_closed(
    sigma: Sigma,
    *,
    imported_v3_2_authority: RuntimeAuthority = DEFAULT_AUTHORITY,
    schedules: Sequence[HostSchedule] = (DEFAULT_SCHEDULE,),
    max_steps: int = 64,
) -> tuple[Sigma, tuple[TickResult, ...]]:
    if not schedules:
        raise ExecutionError("RUN_REQUIRES_SCHEDULE")
    current = sigma
    history: list[TickResult] = []
    for index in range(max_steps):
        if run_status(current.program, current.state) != RUNNING:
            return current, tuple(history)
        tick = step_impl(current, schedules[index % len(schedules)], imported_v3_2_authority)
        history.append(tick)
        current = tick.sigma
    raise ExecutionError("CLOSED_RUN_STEP_BOUND_EXCEEDED")


def import_identities() -> dict[str, str]:
    return {
        "v3_1_kernel_sha256": _sha256_file(_V31_PATH),
        "v3_1_summary_sha256": _sha256_file(_V31_SUMMARY),
        "v3_2_kernel_sha256": _sha256_file(_V32_PATH),
        "v3_2_summary_sha256": _sha256_file(_V32_SUMMARY),
        "v3_2_promotion_sha256": _sha256_file(_V32_PROMOTION),
    }
