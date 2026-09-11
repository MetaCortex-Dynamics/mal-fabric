"""Deterministic V3.2 static admission kernel.

This module imports the sealed V3.1 kernel by identity and implements only the
V3.2 static-admission surface.
"""

from __future__ import annotations

from dataclasses import dataclass, fields, is_dataclass, replace
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import sys
from typing import Any, Iterable, Mapping, Sequence


SPEC_VERSION = "0.2.0-candidate-r2"
SPEC_SHA256 = "df253688da9ded75d59793bc88c13f33365ecd6ee2d24f090e0dfed43aaddabc"
V3_1_KERNEL_SHA256 = "8b983301dad795dd9c3f020970bad76017ef648ac0c71e3fb6fdef3d0e4347c0"
V3_1_SUMMARY_SHA256 = "16ce384323538a69627b1cfdcddb677a3056ab5e9b3cd28e3f9b371de82e04bb"

IF_THEN = "IF_THEN"
MAYBE = "MAYBE"
NO = "NO"
NOT_SAME = "NOT_SAME"

SANDBOX = "SANDBOX"
CANDIDATE = "CANDIDATE"
PROMOTED = "PROMOTED"
REJECTED = "REJECTED"

LOCAL = "LOCAL"
CROSSING_CLASSES = ("G->S", "S->G", "S->F", "F->S", "G->F", "F->G")
ALLOWED_REPAIR_RULES = ("SR-1", "SR-2", "SR-3")
ALLOWED_EDIT_TYPES = ("PlaceEdit", "MoveEdit", "ConnectEdit", "DisconnectEdit")
AUTHORIZED_REPAIR_SEMANTICS = {
    ("THIS", "WHAT", "PLACE"),
    ("INSIDE_OUTSIDE", "WHERE", "PLACE"),
    ("INSIDE_OUTSIDE", "WHERE", "MOVE"),
    ("NEAR_FAR", "WHERE", "MOVE"),
    ("GOES_WITH", "WHICH", "CONNECT"),
    ("NO+TOGETHER_ALONE", "WHAT+HOW", "DISCONNECT"),
    ("TOGETHER_ALONE", "HOW", "COMPOSE"),
    ("CAN_CANNOT", "HOW", "CAPABILITY_GATE"),
    ("EVERY_SOME", "WHICH", "CANDIDATE_SEARCH"),
    ("IF_THEN", "WHEN", "CONDITIONAL_REEVALUATION"),
    ("MUST_LET", "FOR_WHAT", "DOWNSTREAM_OBLIGATION"),
    ("MAYBE", "FOR_WHAT", "UNRESOLVED_REPAIR_DECISION"),
    ("BECAUSE", "WHENCE", "TRIGGER_GENEALOGY"),
}


def _sha256_file(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


_HERE = Path(__file__).resolve().parent
_V31_PATH = _HERE.parent / "static_fabric_v0_1_0" / "kernel.py"
_V31_SUMMARY_PATH = _HERE.parent / "static_fabric_v0_1_0" / "evidence" / "queuegate-evidence-summary.json"

if _sha256_file(_V31_PATH) != V3_1_KERNEL_SHA256:
    raise RuntimeError("ADR01 V3_1_IMPORT_MISMATCH: kernel identity")
if _sha256_file(_V31_SUMMARY_PATH) != V3_1_SUMMARY_SHA256:
    raise RuntimeError("ADR01 V3_1_IMPORT_MISMATCH: evidence-summary identity")

_V31_MODULE_NAME = "mal_fabric_v3_1_sealed"
_V31_SPEC = importlib.util.spec_from_file_location(_V31_MODULE_NAME, _V31_PATH)
if _V31_SPEC is None or _V31_SPEC.loader is None:
    raise RuntimeError("ADR01 V3_1_IMPORT_MISMATCH: import unavailable")
v31 = importlib.util.module_from_spec(_V31_SPEC)
sys.modules[_V31_MODULE_NAME] = v31
_V31_SPEC.loader.exec_module(v31)


def canonical_json(value: Any, *, pretty: bool = False) -> str:
    canonical = canonical_value(value)
    if pretty:
        return json.dumps(canonical, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    return json.dumps(canonical, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def canonical_digest(value: Any) -> str:
    return sha256(canonical_json(value).encode("utf-8")).hexdigest()


def canonical_value(value: Any) -> Any:
    if isinstance(value, Q32):
        return value.raw
    if isinstance(value, CandidateCore):
        return value.canonical()
    if isinstance(value, EvidenceBundle):
        return value.canonical()
    if isinstance(value, Mapping):
        return {str(k): canonical_value(value[k]) for k in sorted(value, key=str)}
    if isinstance(value, (tuple, list)):
        return [canonical_value(item) for item in value]
    if isinstance(value, (set, frozenset)):
        return sorted(canonical_value(item) for item in value)
    if is_dataclass(value):
        return {field.name: canonical_value(getattr(value, field.name)) for field in fields(value)}
    return value


@dataclass(frozen=True, order=True)
class Q32:
    """Unsigned Q32.32 value used on the admission path."""

    raw: int

    SCALE = 1 << 32

    def __post_init__(self) -> None:
        if self.raw < 0:
            raise ValueError("Q32 admission values MUST be nonnegative")

    @classmethod
    def zero(cls) -> "Q32":
        return cls(0)

    @classmethod
    def one(cls) -> "Q32":
        return cls(cls.SCALE)

    @classmethod
    def ratio(cls, numerator: int, denominator: int) -> "Q32":
        if denominator <= 0 or numerator < 0:
            raise ValueError("invalid nonnegative ratio")
        return cls((numerator * cls.SCALE) // denominator)

    @classmethod
    def maximum(cls, values: Iterable["Q32"]) -> "Q32":
        materialized = tuple(values)
        return max(materialized, default=cls.zero())


@dataclass(frozen=True)
class Distribution:
    true: Q32
    false: Q32
    undefined: Q32

    def __post_init__(self) -> None:
        if self.true.raw + self.false.raw + self.undefined.raw != Q32.SCALE:
            raise ValueError("distribution mass MUST equal Q32.32 one")


DELTA_TRUE = Distribution(Q32.one(), Q32.zero(), Q32.zero())


def distribution_at_distance(numerator: int, denominator: int) -> Distribution:
    distance = Q32.ratio(numerator, denominator)
    if distance > Q32.one():
        raise ValueError("distance fixture MUST be within the unit interval")
    return Distribution(Q32(Q32.SCALE - distance.raw), distance, Q32.zero())


def w1_three_point(left: Distribution, right: Distribution) -> Q32:
    """Exact W1 for the three-point metric in r2, represented in Q32.32."""

    total = abs(left.true.raw - right.true.raw) + abs(left.false.raw - right.false.raw)
    return Q32(total // 2)


@dataclass(frozen=True)
class MetricInput:
    witness_coordinates: tuple[tuple[str, Distribution], ...] = ()
    structural_coordinates: tuple[tuple[str, Distribution], ...] = ()
    residual_count: int = 0
    input_count: int = 1

    def __post_init__(self) -> None:
        if self.residual_count < 0 or self.input_count <= 0 or self.residual_count > self.input_count:
            raise ValueError("invalid residual ratio")


@dataclass(frozen=True)
class ToleranceProfile:
    epsilon_w: Q32
    epsilon_s: Q32
    scope: str = "fabric"
    version: str = "v1"
    epsilon_joint: Q32 | None = None

    @property
    def digest(self) -> str:
        return canonical_digest(self)


@dataclass(frozen=True)
class MetricResult:
    d_wv: Q32
    d_sv_core: Q32
    residual_ratio: Q32
    d_sv: Q32
    d_joint: Q32
    verdict: str


def evaluate_metrics(metric_input: MetricInput, tolerance: ToleranceProfile) -> MetricResult:
    d_wv = Q32.maximum(w1_three_point(value, DELTA_TRUE) for _, value in metric_input.witness_coordinates)
    d_sv_core = Q32.maximum(
        w1_three_point(value, DELTA_TRUE) for _, value in metric_input.structural_coordinates
    )
    residual_ratio = Q32.ratio(metric_input.residual_count, metric_input.input_count)
    d_sv = max(d_sv_core, residual_ratio)
    d_joint = max(d_wv, d_sv)
    verdict = IF_THEN if d_wv <= tolerance.epsilon_w and d_sv <= tolerance.epsilon_s else NO
    return MetricResult(d_wv, d_sv_core, residual_ratio, d_sv, d_joint, verdict)


@dataclass(frozen=True)
class EvidenceBundle:
    subject_digest: str
    capabilities: tuple[str, ...] = ()
    artifacts: tuple[tuple[str, bool], ...] = ()
    schema_valid: bool = True
    authority_chain_valid: bool = True

    def canonical(self) -> dict[str, Any]:
        return {
            "subject_digest": self.subject_digest,
            "capabilities": sorted(set(self.capabilities)),
            "artifacts": {key: value for key, value in sorted(self.artifacts)},
            "schema_valid": self.schema_valid,
            "authority_chain_valid": self.authority_chain_valid,
        }

    def artifact_map(self) -> dict[str, bool]:
        return dict(self.artifacts)


@dataclass(frozen=True)
class CrossingLaw:
    crossing_class: str
    required_capabilities: tuple[str, ...]
    required_artifacts: tuple[str, ...]
    alternative_artifacts: tuple[tuple[str, ...], ...] = ()


CROSSING_LAWS: dict[str, CrossingLaw] = {
    "G->S": CrossingLaw("G->S", ("G", "S"), ("G_provenance", "S_structural_certificate")),
    "S->G": CrossingLaw(
        "S->G",
        ("S", "G"),
        ("S_structural_certificate", "CertifyG", "MetaGate", "Pattern-A"),
    ),
    "S->F": CrossingLaw(
        "S->F",
        ("S", "F"),
        (),
        (("FarkasCheck",), ("equivalent_oracle_witness",)),
    ),
    "F->S": CrossingLaw("F->S", ("F", "S"), ("F_execution_evidence", "S_structural_registration")),
    "G->F": CrossingLaw(
        "G->F",
        ("G", "S", "F"),
        ("G_provenance", "S_structural_certificate", "F_execution_evidence"),
    ),
    "F->G": CrossingLaw(
        "F->G",
        ("F", "S", "G"),
        ("F_execution_evidence", "S_structural_certificate", "CertifyG", "MetaGate", "Pattern-A"),
    ),
}


@dataclass(frozen=True)
class CandidateCore:
    base: Any
    edit: Any
    successor: Any
    route_id: str | None
    crossing_class: str

    def canonical(self) -> dict[str, Any]:
        edit_value = (
            [v31.edit_dict(item) for item in self.edit]
            if isinstance(self.edit, tuple)
            else v31.edit_dict(self.edit)
        )
        route_value = None
        if self.route_id is not None:
            route_value = next(
                (item.connection for item in self.successor.routes if item.route_id == self.route_id),
                None,
            )
        return {
            "F": v31.normalize(self.base),
            "e": edit_value,
            "F_prime": v31.normalize(self.successor),
            "route": route_value,
            "crossing_class": self.crossing_class,
        }

    @property
    def digest(self) -> str:
        return canonical_digest(self.canonical())


@dataclass(frozen=True)
class CandidateRecord:
    core: CandidateCore
    evidence_bundle: EvidenceBundle
    lifecycle: str = SANDBOX
    latest_verdict: str | None = None
    verdict_history: tuple[str, ...] = ()
    repair_history: tuple[str, ...] = ()


def _short_dimension(value: str) -> str:
    if value.startswith("□"):
        return value[1:]
    return value


def derive_crossing_class(fabric: Any, route_id: str | None) -> str:
    if route_id is None:
        return LOCAL
    item = next((candidate for candidate in fabric.routes if candidate.route_id == route_id), None)
    if item is None:
        return LOCAL
    source, target = v31.triad_transition(fabric, item)
    source = _short_dimension(source)
    target = _short_dimension(target)
    if source == target:
        return LOCAL
    crossing = f"{source}->{target}"
    return crossing if crossing in CROSSING_CLASSES else NOT_SAME


def build_candidate(base: Any, edit: Any, *, declared_crossing: str | None = None) -> CandidateCore:
    successor = v31.apply_edit(base, edit)
    v31.normalize(successor)
    route_id: str | None = None
    if isinstance(edit, v31.ConnectEdit):
        route_id = v31.sha256_route_id(
            (edit.source_cell, edit.source_role, edit.target_cell, edit.target_role)
        )
    crossing = derive_crossing_class(successor, route_id)
    return CandidateCore(base, edit, successor, route_id, declared_crossing or crossing)


def same_candidate(left: CandidateCore, right: CandidateCore) -> bool:
    return left.canonical() == right.canonical()


@dataclass(frozen=True)
class CrossingOutcome:
    verdict: str
    required_capabilities: tuple[str, ...]
    missing_capabilities: tuple[str, ...] = ()
    evidence_obligations: tuple[str, ...] = ()
    because: str = ""


def evaluate_crossing(core: CandidateCore, evidence: EvidenceBundle) -> CrossingOutcome:
    actual_class = derive_crossing_class(core.successor, core.route_id)
    if actual_class != core.crossing_class:
        return CrossingOutcome(NOT_SAME, (), because="declared crossing class differs from derived class")
    if actual_class == LOCAL:
        return CrossingOutcome(IF_THEN, (), because="local route requires no crossing law")
    law = CROSSING_LAWS[actual_class]
    capabilities = set(evidence.capabilities)
    missing_capabilities = tuple(sorted(set(law.required_capabilities) - capabilities))
    if missing_capabilities:
        return CrossingOutcome(
            NO,
            law.required_capabilities,
            missing_capabilities=missing_capabilities,
            because="required crossing capability is absent",
        )
    artifacts = evidence.artifact_map()
    invalid = tuple(sorted(key for key in law.required_artifacts if key in artifacts and not artifacts[key]))
    if invalid:
        return CrossingOutcome(NO, law.required_capabilities, because="crossing evidence verification failed")
    missing = [key for key in law.required_artifacts if artifacts.get(key) is not True]
    if law.alternative_artifacts:
        any_alternative = any(all(artifacts.get(key) is True for key in option) for option in law.alternative_artifacts)
        any_invalid_alternative = any(
            any(key in artifacts and not artifacts[key] for key in option) for option in law.alternative_artifacts
        )
        if not any_alternative:
            if any_invalid_alternative:
                return CrossingOutcome(NO, law.required_capabilities, because="crossing oracle evidence failed")
            missing.extend(" OR ".join(option) for option in law.alternative_artifacts)
    if missing:
        return CrossingOutcome(
            MAYBE,
            law.required_capabilities,
            evidence_obligations=tuple(sorted(missing)),
            because="capability present but required evidence remains unresolved",
        )
    return CrossingOutcome(IF_THEN, law.required_capabilities, because="crossing law discharged")


@dataclass(frozen=True)
class ExtendedDRCContext:
    import_kernel_hash: str = V3_1_KERNEL_SHA256
    successor_integrity: bool = True
    route_in_successor: bool = True
    crossing_class_coherent: bool = True
    local_has_crossing_law: bool = False
    crossing_law_count: int = 1
    tolerance_valid: bool = True
    epsilon_joint: Q32 | None = None
    evidence_schema_valid: bool = True
    evidence_subject_matches: bool = True
    lifecycle_verdict_coherent: bool = True
    promotion_receipt_present: bool = True
    authority_chain_valid: bool = True
    evidence_repair_core_same: bool = True
    structural_repair_core_different: bool = True
    repair_edit_types: tuple[str, ...] = ALLOWED_EDIT_TYPES
    repair_semantic: tuple[str, str, str] = ("GOES_WITH", "WHICH", "CONNECT")
    repair_rule: str = "SR-1"
    repair_genealogy_present: bool = True
    structural_repair_lifecycle: str = SANDBOX
    ranking_pairwise_admissible: bool = True
    deterministic_tiebreak: bool = True


@dataclass(frozen=True)
class ExtendedDRCResult:
    verdict: str
    reason_code: str | None
    because: str


ADR_CLASS: dict[str, str] = {
    "ADR01": NOT_SAME,
    "ADR02": NOT_SAME,
    "ADR03": NO,
    "ADR04": NOT_SAME,
    "ADR05": NO,
    "ADR06": NO,
    "ADR07": NO,
    "ADR08": NO,
    "ADR09": NO,
    "ADR10": NOT_SAME,
    "ADR11": NO,
    "ADR12": NO,
    "ADR13": NO,
    "ADR14": NOT_SAME,
    "ADR15": NO,
    "ADR16": NO,
    "ADR17": NO,
    "ADR18": NO,
    "ADR19": NO,
    "ADR20": NO,
    "ADR21": NO,
    "ADR22": NO,
}


def _adr(code: str, because: str) -> ExtendedDRCResult:
    return ExtendedDRCResult(ADR_CLASS[code], code, because)


def extended_drc(context: ExtendedDRCContext) -> ExtendedDRCResult:
    """Validate V3.2 object structure in the normative A-O order."""

    if context.import_kernel_hash != V3_1_KERNEL_SHA256:
        return _adr("ADR01", "sealed V3.1 import identity differs")
    if not context.successor_integrity:
        return _adr("ADR02", "candidate successor differs from NORMALIZE(APPLY(F,e))")
    if not context.route_in_successor:
        return _adr("ADR03", "candidate route is absent from successor")
    if not context.crossing_class_coherent:
        return _adr("ADR04", "declared crossing class differs from endpoint derivation")
    if context.local_has_crossing_law:
        return _adr("ADR05", "LOCAL route carries a crossing law")
    if context.crossing_law_count != 1:
        return _adr("ADR06", "crossing-law lookup is missing or ambiguous")
    if not context.tolerance_valid:
        return _adr("ADR07", "tolerance configuration is malformed")
    if context.epsilon_joint is not None:
        return _adr("ADR08", "governing epsilon_joint is forbidden")
    if not context.evidence_schema_valid:
        return _adr("ADR09", "evidence record shape is malformed")
    if not context.evidence_subject_matches:
        return _adr("ADR10", "evidence subject does not bind the candidate")
    if not context.lifecycle_verdict_coherent:
        return _adr("ADR11", "lifecycle and latest verdict are incoherent")
    if not context.promotion_receipt_present:
        return _adr("ADR12", "PROMOTED lifecycle lacks a promotion receipt")
    if not context.authority_chain_valid:
        return _adr("ADR13", "authority chain is invalid")
    if not context.evidence_repair_core_same:
        return _adr("ADR14", "evidence repair changed CandidateCore")
    if not context.structural_repair_core_different:
        return _adr("ADR15", "structural repair preserved CandidateCore")
    if any(edit_type not in ALLOWED_EDIT_TYPES for edit_type in context.repair_edit_types):
        return _adr("ADR16", "repair contains a non-V3.1 edit constructor")
    if context.repair_semantic not in AUTHORIZED_REPAIR_SEMANTICS:
        return _adr("ADR17", "repair semantic uses an invalid operator-witness form")
    if context.repair_rule not in ALLOWED_REPAIR_RULES:
        return _adr("ADR18", "repair rule is not authorized in v0.2.0")
    if not context.repair_genealogy_present:
        return _adr("ADR19", "repair genealogy is missing")
    if context.structural_repair_lifecycle != SANDBOX:
        return _adr("ADR20", "structural repair did not re-enter SANDBOX")
    if not context.ranking_pairwise_admissible:
        return _adr("ADR21", "ranking attempted tolerance laundering")
    if not context.deterministic_tiebreak:
        return _adr("ADR22", "repair tie-break is nondeterministic")
    return ExtendedDRCResult(IF_THEN, None, "A-O structural checks passed")


def lifecycle_transition(before: str, verdict: str) -> str:
    table = {
        (SANDBOX, IF_THEN): PROMOTED,
        (SANDBOX, MAYBE): CANDIDATE,
        (SANDBOX, NO): REJECTED,
        (SANDBOX, NOT_SAME): REJECTED,
        (CANDIDATE, IF_THEN): PROMOTED,
        (CANDIDATE, MAYBE): CANDIDATE,
        (CANDIDATE, NO): REJECTED,
        (CANDIDATE, NOT_SAME): REJECTED,
    }
    try:
        return table[(before, verdict)]
    except KeyError as exc:
        raise ValueError("unsupported lifecycle transition") from exc


def compose_terminal(
    *,
    identity_same: bool = True,
    v3_1_drc_result: str = IF_THEN,
    extended_result: ExtendedDRCResult | None = None,
    metrics: MetricResult | None = None,
    crossing: CrossingOutcome | None = None,
) -> str:
    if not identity_same:
        return NOT_SAME
    if v3_1_drc_result != IF_THEN:
        return NO
    extended_result = extended_result or ExtendedDRCResult(IF_THEN, None, "default")
    if extended_result.verdict != IF_THEN:
        return extended_result.verdict
    if metrics is not None and metrics.verdict != IF_THEN:
        return NO
    crossing = crossing or CrossingOutcome(IF_THEN, ())
    return crossing.verdict


def structural_decomposition(core: CandidateCore) -> dict[str, Any]:
    base_placements = {item.cell_id: item.location for item in core.base.placements}
    next_placements = {item.cell_id: item.location for item in core.successor.placements}
    changed_placements = sorted(
        cell_id
        for cell_id in set(base_placements) | set(next_placements)
        if base_placements.get(cell_id) != next_placements.get(cell_id)
    )
    base_routes = {item.route_id: item for item in core.base.routes}
    next_routes = {item.route_id: item for item in core.successor.routes}
    added = sorted(set(next_routes) - set(base_routes))
    removed = sorted(set(base_routes) - set(next_routes))
    affected = set(added) | set(removed)
    for route_id, item in {**base_routes, **next_routes}.items():
        if item.source_cell in changed_placements or item.target_cell in changed_placements:
            affected.add(route_id)
    transitions: list[dict[str, Any]] = []
    for route_id in sorted(affected):
        before = v31.triad_transition(core.base, base_routes[route_id]) if route_id in base_routes else None
        after = v31.triad_transition(core.successor, next_routes[route_id]) if route_id in next_routes else None
        transitions.append({"route_id": route_id, "before": before, "after": after})
    return {
        "edit_kind": type(core.edit).__name__,
        "changed_cell_ids": changed_placements,
        "changed_placement_ids": changed_placements,
        "added_route_ids": added,
        "removed_route_ids": removed,
        "affected_route_ids": sorted(affected),
        "containment_delta": [],
        "placement_delta": changed_placements,
        "route_delta": {"added": added, "removed": removed},
        "endpoint_placement_pairs": transitions,
        "derived_transition_delta": transitions,
        "witness_binding_delta": [],
        "join_shape_delta": {"added": added, "removed": removed},
    }


def observable_signature(
    core: CandidateCore,
    decomposition: Mapping[str, Any],
    metric_input: MetricInput,
    tolerance: ToleranceProfile,
    crossing_policy_hash: str,
) -> dict[str, Any]:
    semantic_delta = canonical_digest(decomposition)
    return {
        "base_hash": canonical_digest(v31.normalize(core.base)),
        "edit_hash": canonical_digest(v31.edit_dict(core.edit)),
        "result_hash": canonical_digest(v31.normalize(core.successor)),
        "edit_kind": type(core.edit).__name__,
        "semantic_delta_hash": semantic_delta,
        "witness_axis_observables": metric_input.witness_coordinates,
        "structural_axis_observables": metric_input.structural_coordinates,
        "crossing_observables": {
            "class": core.crossing_class,
            "derived_transition_delta": decomposition["derived_transition_delta"],
        },
        "tolerance_profile_hash": tolerance.digest,
        "crossing_policy_hash": crossing_policy_hash,
    }


def parse_surface(surface: str, projection: Mapping[str, Any]) -> Any:
    if surface == "TEXT":
        return v31.parse_text(projection)
    if surface == "VISUAL":
        return v31.parse_visual(projection)
    raise ValueError("surface MUST be TEXT or VISUAL")


@dataclass(frozen=True)
class PipelineOutcome:
    terminal_verdict: str
    lifecycle_after: str
    core: CandidateCore
    extended: ExtendedDRCResult
    metrics: MetricResult
    crossing: CrossingOutcome
    observable_digest: str


@dataclass(frozen=True)
class TotalPipelineResult:
    """Total stage result for callers that must fail closed without exceptions."""

    disposition: str
    terminal_verdict: str | None
    stage: str
    because: str
    outcome: PipelineOutcome | None = None


def evaluate_pipeline(
    *,
    base: Any,
    surface: str,
    projection: Mapping[str, Any],
    tolerance: ToleranceProfile,
    metric_input: MetricInput,
    evidence_factory: Any,
    lifecycle_before: str = SANDBOX,
    extended_context: ExtendedDRCContext | None = None,
) -> PipelineOutcome:
    edit = parse_surface(surface, projection)
    if edit is None:
        raise ValueError("NO_SEMANTIC_EDIT")
    core = build_candidate(base, edit)
    if v31.same_fabric(base, core.successor):
        raise ValueError("NO_OP")
    v31_result = v31.drc(core.successor)
    extended = extended_drc(extended_context or ExtendedDRCContext())
    decomposition = structural_decomposition(core)
    signature = observable_signature(
        core,
        decomposition,
        metric_input,
        tolerance,
        canonical_digest(sorted(CROSSING_LAWS)),
    )
    metrics = evaluate_metrics(metric_input, tolerance)
    evidence = evidence_factory(core) if callable(evidence_factory) else evidence_factory
    crossing = evaluate_crossing(core, evidence)
    terminal = compose_terminal(
        v3_1_drc_result=v31_result.verdict,
        extended_result=extended,
        metrics=metrics,
        crossing=crossing,
    )
    return PipelineOutcome(
        terminal,
        lifecycle_transition(lifecycle_before, terminal),
        core,
        extended,
        metrics,
        crossing,
        canonical_digest(signature),
    )


def evaluate_admission(
    *,
    base: Any,
    surface: str,
    projection: Mapping[str, Any],
    tolerance: ToleranceProfile,
    metric_input: MetricInput,
    evidence_factory: Any,
    lifecycle_before: str = SANDBOX,
    extended_context: ExtendedDRCContext | None = None,
) -> TotalPipelineResult:
    """Run the complete pipeline and convert every early boundary to a typed result."""

    try:
        v31.normalize(base)
        base_verdict = v31.drc(base)
    except v31.FabricError as exc:
        return TotalPipelineResult("REQUEST_FAILURE", NO, "BASE_PRECONDITION", str(exc))
    if not base_verdict.admitted:
        return TotalPipelineResult(
            "REQUEST_FAILURE",
            NO,
            "BASE_PRECONDITION",
            f"{base_verdict.reason_code}: {base_verdict.because}",
        )
    try:
        edit = parse_surface(surface, projection)
    except (KeyError, TypeError, ValueError, v31.FabricError) as exc:
        return TotalPipelineResult("PARSE_FAILURE", NO, "F_PARSE_FABRIC", str(exc))
    if edit is None:
        return TotalPipelineResult("NO_OP", None, "F_PARSE_FABRIC", "surface denotes no semantic edit")
    try:
        candidate = v31.apply_edit(base, edit)
    except (KeyError, TypeError, ValueError, v31.FabricError) as exc:
        return TotalPipelineResult("APPLY_FAILURE", NO, "APPLY", str(exc))
    try:
        v31.normalize(candidate)
    except (KeyError, TypeError, ValueError, v31.FabricError) as exc:
        # The sealed V3.1 reference normalizer is itself guarded by V3.1 DRC.
        # Preserve the abstract stage distinction by reifying that embedded
        # verdict instead of mislabeling it as a V3.2 admission rejection.
        embedded_drc = v31.drc(candidate)
        if not embedded_drc.admitted:
            return TotalPipelineResult(
                "DRC_REJECTION",
                NO,
                "V3_1_DRC_GUARDED_NORMALIZE",
                f"{embedded_drc.reason_code}: {embedded_drc.because}",
            )
        return TotalPipelineResult("NORMALIZATION_FAILURE", NO, "NORMALIZE", str(exc))
    if v31.same_fabric(base, candidate):
        return TotalPipelineResult("NO_OP", None, "NO_OP_DETECTION", "normalized fabrics are SAME")
    drc_result = v31.drc(candidate)
    if not drc_result.admitted:
        return TotalPipelineResult(
            "DRC_REJECTION",
            NO,
            "V3_1_DRC",
            f"{drc_result.reason_code}: {drc_result.because}",
        )
    try:
        outcome = evaluate_pipeline(
            base=base,
            surface=surface,
            projection=projection,
            tolerance=tolerance,
            metric_input=metric_input,
            evidence_factory=evidence_factory,
            lifecycle_before=lifecycle_before,
            extended_context=extended_context,
        )
    except (KeyError, TypeError, ValueError, v31.FabricError) as exc:
        return TotalPipelineResult("ADMISSION_REJECTION", NO, "V3_2_ADMISSION", str(exc))
    disposition = "ADMIT" if outcome.terminal_verdict == IF_THEN else "ADMISSION_REJECTION"
    return TotalPipelineResult(
        disposition,
        outcome.terminal_verdict,
        "TERMINAL_COMPOSITION",
        outcome.crossing.because,
        outcome,
    )


@dataclass(frozen=True)
class RepairProposal:
    kind: str
    rule: str | None
    parent_candidate_digest: str
    candidate_core: CandidateCore
    evidence_bundle: EvidenceBundle
    lifecycle: str
    edit_realization: tuple[Any, ...]
    because: str


def evidence_repair(record: CandidateRecord, evidence: EvidenceBundle, because: str) -> RepairProposal:
    if record.latest_verdict != MAYBE or record.lifecycle != CANDIDATE:
        raise ValueError("evidence repair domain requires CANDIDATE + MAYBE")
    if evidence.subject_digest != record.core.digest:
        raise ValueError("ADR10 EVIDENCE_SUBJECT_MISMATCH")
    return RepairProposal(
        "EVIDENCE_REPAIR_FIBER",
        None,
        record.core.digest,
        record.core,
        evidence,
        CANDIDATE,
        (),
        because,
    )


def _apply_sequence(base: Any, edits: Sequence[Any]) -> Any:
    current = base
    for edit in edits:
        if type(edit).__name__ not in ALLOWED_EDIT_TYPES:
            raise ValueError("ADR16 NON_V3_1_EDIT_IN_REPAIR")
        current = v31.apply_edit(current, edit)
    v31.normalize(current)
    return current


def structural_repair(
    parent: CandidateCore,
    *,
    rule: str,
    edits: Sequence[Any],
    evidence: EvidenceBundle,
    because: str,
) -> RepairProposal:
    if rule not in ALLOWED_REPAIR_RULES:
        raise ValueError("ADR18 UNAUTHORIZED_REPAIR_RULE")
    successor = _apply_sequence(parent.base, edits)
    if not edits:
        raise ValueError("ADR15 STRUCTURAL_REPAIR_PRESERVED_CORE")
    last_edit = edits[-1]
    route_id = None
    if isinstance(last_edit, v31.ConnectEdit):
        route_id = v31.sha256_route_id(
            (last_edit.source_cell, last_edit.source_role, last_edit.target_cell, last_edit.target_role)
        )
    repaired = CandidateCore(parent.base, tuple(edits), successor, route_id, derive_crossing_class(successor, route_id))
    if repaired.digest == parent.digest:
        raise ValueError("ADR15 STRUCTURAL_REPAIR_PRESERVED_CORE")
    return RepairProposal(
        "STRUCTURAL_REPAIR_FIBER",
        rule,
        parent.digest,
        repaired,
        evidence,
        SANDBOX,
        tuple(edits),
        because,
    )


def rank_repairs(
    repairs: Sequence[tuple[RepairProposal, MetricResult, str, str, str]],
) -> tuple[RepairProposal, ...]:
    """Rank only DRC/extended/metric/crossing-eligible repairs."""

    eligible: list[tuple[RepairProposal, MetricResult]] = []
    for proposal, metric, v31_result, extended_result, crossing_result in repairs:
        if (
            v31_result == IF_THEN
            and extended_result == IF_THEN
            and metric.verdict == IF_THEN
            and crossing_result == IF_THEN
        ):
            eligible.append((proposal, metric))
    eligible.sort(key=lambda item: (item[1].d_joint.raw, canonical_digest(item[0].candidate_core)))
    return tuple(item[0] for item in eligible)


def import_identities() -> dict[str, str]:
    return {
        "kernel_sha256": _sha256_file(_V31_PATH),
        "queuegate_evidence_summary_sha256": _sha256_file(_V31_SUMMARY_PATH),
    }
