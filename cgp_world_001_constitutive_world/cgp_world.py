#!/usr/bin/env python3
"""Deterministic reference realization of CGP-WORLD-001 v0.3.

The module separates ontic, epistemic, and presentation state.  It uses only
integer/Q32.32 arithmetic on governed paths and treats upstream realizations as
immutable imports rather than theory authority.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, replace
from functools import lru_cache
from hashlib import sha256
import json
from pathlib import Path
import sys
from typing import Any, Mapping, Sequence


HERE = Path(__file__).resolve().parent
Q32_ONE = 1 << 32
LN2_Q32 = 2_977_044_472
SIGMA_CRIT_Q32 = Q32_ONE // 2
RANDOM_SOURCE_ALGORITHM = "SHA256_COUNTER_V1"
NORMALIZATION_RULE = "EXP_NEG_Q32_TAYLOR18_LN2_REDUCTION_V1"
NUMERIC_DOMAIN = "Q32.32"
CONSISTENCY_PREDICATE = "OUTCOME_DISTANCE_LE_ONE_V1"
RATE_GOVERNOR_CHANNEL = "TAU_POLICY_ONLY"


class CGPBoundaryError(ValueError):
    """A typed fail-closed boundary violation."""


def file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


def canonical_value(value: Any) -> Any:
    if isinstance(value, float):
        raise CGPBoundaryError("FLOAT_FORBIDDEN_ON_GOVERNANCE_PATH")
    if hasattr(value, "canonical"):
        return canonical_value(value.canonical())
    if hasattr(value, "__dataclass_fields__"):
        return canonical_value(asdict(value))
    if isinstance(value, Mapping):
        return {str(key): canonical_value(value[key]) for key in sorted(value, key=str)}
    if isinstance(value, (tuple, list)):
        return [canonical_value(item) for item in value]
    if isinstance(value, set):
        return [canonical_value(item) for item in sorted(value)]
    if value is None or isinstance(value, (str, int, bool)):
        return value
    raise CGPBoundaryError(f"NONCANONICAL_VALUE:{type(value).__name__}")


def canonical_json(value: Any) -> str:
    return json.dumps(canonical_value(value), ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def canonical_digest(value: Any) -> str:
    return sha256(canonical_json(value).encode("utf-8")).hexdigest().upper()


def q32_mul(left: int, right: int) -> int:
    return (left * right) // Q32_ONE


def exp_neg_q32(value: int) -> int:
    """Bound deterministic Q32.32 realization of exp(-value), value >= 0."""
    if value < 0:
        raise CGPBoundaryError("NEGATIVE_EXP_COST")
    shifts, reduced = divmod(value, LN2_Q32)
    term = Q32_ONE
    total = Q32_ONE
    sign = -1
    for order in range(1, 19):
        term = q32_mul(term, reduced) // order
        total += sign * term
        sign *= -1
    return max(1, total >> shifts)


@dataclass(frozen=True)
class WorldFixtureV1:
    fixture_id: str
    fixture_version: str
    spatial_domain: tuple[tuple[int, int, int], ...]
    traversability_domain: tuple[tuple[int, int, int], ...]
    obstruction_domain: tuple[tuple[int, int, int], ...]
    substrate_support_domain: tuple[str, ...]
    spawn_admission_regions: tuple[tuple[int, int, int], ...]
    fixture_serialization_contract: str = "CANONICAL_JSON_V1"

    @property
    def fixture_digest(self) -> str:
        return canonical_digest(asdict(self))


@dataclass(frozen=True)
class ConstitutiveActivity:
    activity_ref: str
    genealogy_ref: str
    structural_pattern_ref: str
    functional_realization_ref: str


@dataclass(frozen=True)
class ConstitutiveWitnesses:
    genealogy_activity_ref: str
    structure_activity_ref: str
    function_activity_ref: str
    genealogy_holds: bool
    structure_holds: bool
    function_holds: bool


@dataclass(frozen=True)
class EntityConstitution:
    entity_ref: str
    activity_ref: str
    w: int
    entity: bool
    witness_digest: str


def constitute(entity_ref: str, w: int, witnesses: ConstitutiveWitnesses) -> EntityConstitution:
    same = len({witnesses.genealogy_activity_ref, witnesses.structure_activity_ref,
                witnesses.function_activity_ref}) == 1
    entity = same and witnesses.genealogy_holds and witnesses.structure_holds and witnesses.function_holds
    activity_ref = witnesses.genealogy_activity_ref if same else "NOT_SAME_ACTIVITY"
    return EntityConstitution(entity_ref, activity_ref, w, entity, canonical_digest(witnesses))


@dataclass(frozen=True)
class OnticWorldState:
    world_ref: str
    w: int
    worldline_prefix: tuple[str, ...]
    constructive_substrate_state: str
    contact_physics_state: str
    fabric_state: str
    governed_spatial_state: tuple[tuple[str, tuple[int, int, int]], ...]
    admitted_world_fixture_digest: str
    constitutions: tuple[EntityConstitution, ...]
    perturbation_count: int = 0


@dataclass(frozen=True)
class Observer:
    observer_id: str
    locale_id: str
    measurement_apparatus: str
    beta_q32: int
    sigma_q32: int


@dataclass(frozen=True)
class MeasurementOption:
    measurement_id: str
    outcome: int
    genealogical_distance_q32: int
    lyapunov_cost_q32: int


@dataclass(frozen=True)
class MeasurementReplayContract:
    kernel_version: str
    normalization_rule: str
    numeric_domain: str
    repair_fiber_enumeration: tuple[str, ...]
    repair_fiber_order: str
    random_source_algorithm: str
    random_source_seed: str
    draw_index_consumption_rule: str
    observer_id: str
    entity_ref: str
    w: int

    def validate(self, repair_fiber: Sequence[MeasurementOption]) -> None:
        expected = tuple(option.measurement_id for option in sorted(repair_fiber, key=lambda item: item.measurement_id))
        if self.kernel_version != "CGP_WORLD_001_V0_3":
            raise CGPBoundaryError("REPLAY_KERNEL_VERSION_MISMATCH")
        if self.normalization_rule != NORMALIZATION_RULE or self.numeric_domain != NUMERIC_DOMAIN:
            raise CGPBoundaryError("REPLAY_NUMERIC_CONTRACT_MISMATCH")
        if self.repair_fiber_enumeration != expected or self.repair_fiber_order != "MEASUREMENT_ID_ASC":
            raise CGPBoundaryError("REPAIR_FIBER_ORDER_MISMATCH")
        if self.random_source_algorithm != RANDOM_SOURCE_ALGORITHM:
            raise CGPBoundaryError("RANDOM_SOURCE_ALGORITHM_MISMATCH")
        if self.draw_index_consumption_rule != "ONE_DRAW_PER_COMMITTED_MEASUREMENT":
            raise CGPBoundaryError("DRAW_CONSUMPTION_RULE_MISMATCH")
        if not self.random_source_seed:
            raise CGPBoundaryError("RANDOM_SOURCE_SEED_UNBOUND")


@dataclass(frozen=True)
class Certificate:
    certificate_ref: str
    observer_id: str
    entity_ref: str
    worldline_point: int
    measurement_id: str
    measurement_outcome: int
    coupling_state: tuple[int, int]
    apparatus_state: str
    replay_contract_ref: str
    provenance_anchors: tuple[str, ...]


@dataclass(frozen=True)
class LiftClaim:
    lift_claim_ref: str
    certificate_ref: str
    entity_constitution_ref: str
    observer_id: str
    locale_id: str
    entity_ref: str
    w: int
    measurement_outcome: int
    margin_q32: int
    tier: str
    locally_admissible: bool


@dataclass(frozen=True)
class SharedFact:
    fact_ref: str
    entity_ref: str
    w: int
    locales: tuple[str, ...]
    outcomes: tuple[int, ...]
    modality: str = "BLACK_SQUARE"
    status: str = "ACTIVE"


@dataclass(frozen=True)
class EpistemicState:
    observers: tuple[Observer, ...] = ()
    certificates: tuple[Certificate, ...] = ()
    lift_claims: tuple[LiftClaim, ...] = ()
    shared_facts: tuple[SharedFact, ...] = ()
    gluing_failures: tuple[str, ...] = ()
    draw_index: int = 0
    tau_q32: int = Q32_ONE // 4


@dataclass(frozen=True)
class PresentationState:
    observer_id: str
    active_surface: str
    camera_state: tuple[int, int, int]
    visual_parameters: tuple[tuple[str, int], ...] = ()
    surface_local_state: tuple[tuple[str, str], ...] = ()


@dataclass(frozen=True)
class PresentationContract:
    surface: str
    version: str
    fail_render: bool = False


@dataclass(frozen=True)
class PresentationOutput:
    observer_id: str
    entity_ref: str
    w: int
    surface: str
    disclosure: str
    projection_digest: str


@dataclass(frozen=True)
class ProjectorFailure:
    surface: str
    reason: str
    entity_still_exists: bool


def fixture_example() -> WorldFixtureV1:
    spatial = tuple((x, y, 0) for y in range(-1, 2) for x in range(-2, 3))
    obstruction = ((1, 0, 0),)
    traversable = tuple(point for point in spatial if point not in obstruction)
    return WorldFixtureV1("CGP_FIXTURE_001", "1", spatial, traversable, obstruction,
                          ("CONTACT_GR", "CONSTRUCTIVE_SUBSTRATE"), ((-1, 0, 0),), "CANONICAL_JSON_V1")


@lru_cache(maxsize=None)
def upstream_physics_trace(steps: int) -> dict[str, Any]:
    """Read the promoted bounded joint realization; never redefine its laws."""
    physics_dir = HERE.parent / "physics_rd_001_contact_gr_constructive_substrate_realization"
    if str(physics_dir) not in sys.path:
        sys.path.insert(0, str(physics_dir))
    import physics_realization  # type: ignore

    trace = physics_realization.joint_trace(steps=steps)
    if trace["joint_trace"]["run_status"] != "COMMITTED":
        raise CGPBoundaryError("UPSTREAM_JOINT_REALIZATION_BLOCKED")
    return trace


def initial_ontic(fixture: WorldFixtureV1, constitution: EntityConstitution) -> OnticWorldState:
    joint = upstream_physics_trace(0)
    return OnticWorldState(
        "WORLD_001", 0, ("GENESIS",),
        joint["substrate_trace"]["final_substrate_state_digest"],
        joint["contact_trace"]["final_contact_state_digest"],
        joint["joint_trace"]["final_joint_state_digest"],
        ((constitution.entity_ref, (-1, 0, 0)),), fixture.fixture_digest,
        (constitution,), 0,
    )


def advance_ontic(state: OnticWorldState, fixture: WorldFixtureV1, semantic_action: str) -> OnticWorldState:
    if fixture.fixture_digest != state.admitted_world_fixture_digest:
        raise CGPBoundaryError("WORLD_FIXTURE_MUTATION_FORBIDDEN")
    next_w = state.w + 1
    joint = upstream_physics_trace(next_w)
    event = canonical_digest((state.w, next_w, semantic_action, state.fabric_state))
    return replace(
        state,
        w=next_w,
        worldline_prefix=state.worldline_prefix + (event,),
        constructive_substrate_state=joint["substrate_trace"]["final_substrate_state_digest"],
        contact_physics_state=joint["contact_trace"]["final_contact_state_digest"],
        fabric_state=joint["joint_trace"]["final_joint_state_digest"],
        constitutions=tuple(replace(item, w=next_w) for item in state.constitutions),
    )


def attach_projector(states: tuple[PresentationState, ...], observer_id: str, surface: str) -> tuple[PresentationState, ...]:
    allowed = {"CARRIER", "ASCII", "GAUSSIAN"}
    if surface not in allowed:
        raise CGPBoundaryError("UNKNOWN_PRESENTATION_SURFACE")
    found = False
    output = []
    for state in states:
        if state.observer_id == observer_id:
            output.append(replace(state, active_surface=surface))
            found = True
        else:
            output.append(state)
    if not found:
        output.append(PresentationState(observer_id, surface, (0, 0, 0)))
    return tuple(sorted(output, key=lambda item: item.observer_id))


def replay_contract(observer: Observer, entity_ref: str, w: int,
                    repair_fiber: Sequence[MeasurementOption], seed: str) -> MeasurementReplayContract:
    return MeasurementReplayContract(
        "CGP_WORLD_001_V0_3", NORMALIZATION_RULE, NUMERIC_DOMAIN,
        tuple(item.measurement_id for item in sorted(repair_fiber, key=lambda option: option.measurement_id)),
        "MEASUREMENT_ID_ASC", RANDOM_SOURCE_ALGORITHM, seed,
        "ONE_DRAW_PER_COMMITTED_MEASUREMENT", observer.observer_id, entity_ref, w,
    )


def select_measurement(observer: Observer, entity_ref: str, w: int,
                       repair_fiber: Sequence[MeasurementOption], contract: MeasurementReplayContract,
                       draw_index: int, eta_q32: int = Q32_ONE) -> MeasurementOption:
    if not repair_fiber:
        raise CGPBoundaryError("EMPTY_REPAIR_FIBER")
    if observer.beta_q32 < 0 or observer.sigma_q32 < 0:
        raise CGPBoundaryError("NEGATIVE_COUPLING_FORBIDDEN")
    contract.validate(repair_fiber)
    if (contract.observer_id, contract.entity_ref, contract.w) != (observer.observer_id, entity_ref, w):
        raise CGPBoundaryError("REPLAY_SUBJECT_BINDING_MISMATCH")
    ordered = tuple(sorted(repair_fiber, key=lambda item: item.measurement_id))
    weights = []
    for option in ordered:
        cost = option.genealogical_distance_q32 + q32_mul(eta_q32, option.lyapunov_cost_q32)
        weights.append(exp_neg_q32(q32_mul(observer.beta_q32, cost)))
    draw_material = canonical_json((contract.random_source_seed, draw_index, observer.observer_id, entity_ref, w))
    draw = int.from_bytes(sha256(draw_material.encode("utf-8")).digest(), "big") % sum(weights)
    cursor = 0
    for option, weight in zip(ordered, weights):
        cursor += weight
        if draw < cursor:
            return option
    raise CGPBoundaryError("MEASUREMENT_SELECTION_EXHAUSTED")


def measure(ontic: OnticWorldState, epistemic: EpistemicState, observer: Observer,
            entity_ref: str, repair_fiber: Sequence[MeasurementOption],
            contract: MeasurementReplayContract, *, governance_margin_q32: int = Q32_ONE,
            ontic_perturbation_authorized: bool = False) -> tuple[OnticWorldState, EpistemicState, Certificate | None]:
    if observer.sigma_q32 < SIGMA_CRIT_Q32:
        return ontic, epistemic, None
    option = select_measurement(observer, entity_ref, ontic.w, repair_fiber, contract, epistemic.draw_index)
    contract_ref = canonical_digest(contract)
    certificate = Certificate(
        canonical_digest((observer.observer_id, entity_ref, ontic.w, option.measurement_id, contract_ref)),
        observer.observer_id, entity_ref, ontic.w, option.measurement_id, option.outcome,
        (observer.beta_q32, observer.sigma_q32), observer.measurement_apparatus,
        contract_ref, (ontic.world_ref, ontic.admitted_world_fixture_digest),
    )
    new_epistemic = replace(
        epistemic,
        observers=tuple(sorted({item.observer_id: item for item in epistemic.observers + (observer,)}.values(),
                               key=lambda item: item.observer_id)),
        certificates=epistemic.certificates + (certificate,),
        draw_index=epistemic.draw_index + 1,
    )
    new_ontic = ontic
    if governance_margin_q32 == 0 and ontic_perturbation_authorized:
        new_ontic = replace(
            ontic,
            perturbation_count=ontic.perturbation_count + 1,
            fabric_state=canonical_digest((ontic.fabric_state, "AUTHORIZED_MEASUREMENT_PERTURBATION",
                                           certificate.certificate_ref)),
        )
    return new_ontic, new_epistemic, certificate


def make_lift(certificate: Certificate, constitution: EntityConstitution, observer: Observer,
              margin_q32: int, tau_q32: int) -> LiftClaim:
    if not constitution.entity:
        raise CGPBoundaryError("ENTITY_CONSTITUTION_IMPORT_REQUIRED")
    if (certificate.entity_ref, certificate.worldline_point) != (constitution.entity_ref, constitution.w):
        raise CGPBoundaryError("ENTITY_CONSTITUTION_REFERENCE_MISMATCH")
    if certificate.observer_id != observer.observer_id:
        raise CGPBoundaryError("CERTIFICATE_OBSERVER_MISMATCH")
    local = margin_q32 >= tau_q32
    return LiftClaim(
        canonical_digest((certificate.certificate_ref, constitution.w, margin_q32, tau_q32)),
        certificate.certificate_ref, constitution.witness_digest, observer.observer_id,
        observer.locale_id, certificate.entity_ref, certificate.worldline_point,
        certificate.measurement_outcome, margin_q32, "OBSERVER_DETERMINED", local,
    )


def consistent(left: LiftClaim, right: LiftClaim) -> bool:
    if left.entity_ref != right.entity_ref or left.w != right.w:
        raise CGPBoundaryError("GLUING_DOMAIN_MISMATCH")
    return abs(left.measurement_outcome - right.measurement_outcome) <= 1


def glue(epistemic: EpistemicState, claims: Sequence[LiftClaim]) -> EpistemicState:
    admitted = tuple(sorted((claim for claim in claims if claim.locally_admissible),
                            key=lambda item: (item.locale_id, item.lift_claim_ref)))
    if not admitted:
        return epistemic
    entity_ref, w = admitted[0].entity_ref, admitted[0].w
    if any(claim.entity_ref != entity_ref or claim.w != w for claim in admitted):
        raise CGPBoundaryError("GLUING_DOMAIN_MISMATCH")
    compatible = all(consistent(admitted[i], admitted[j])
                     for i in range(len(admitted)) for j in range(i + 1, len(admitted)))
    claims_all = epistemic.lift_claims + tuple(claim for claim in admitted if claim not in epistemic.lift_claims)
    if not compatible:
        failure = canonical_digest(("SHEAF_INCONSISTENCY", tuple(item.lift_claim_ref for item in admitted)))
        return replace(epistemic, lift_claims=claims_all,
                       gluing_failures=epistemic.gluing_failures + (failure,))
    fact = SharedFact(
        canonical_digest((entity_ref, w, tuple(item.lift_claim_ref for item in admitted))),
        entity_ref, w, tuple(item.locale_id for item in admitted),
        tuple(item.measurement_outcome for item in admitted),
    )
    return replace(epistemic, lift_claims=claims_all, shared_facts=epistemic.shared_facts + (fact,))


def divergence_q32(claims: Sequence[LiftClaim]) -> int:
    pairs = [(claims[i], claims[j]) for i in range(len(claims)) for j in range(i + 1, len(claims))
             if claims[i].entity_ref == claims[j].entity_ref and claims[i].w == claims[j].w]
    if not pairs:
        return 0
    incompatible = sum(1 for left, right in pairs if not consistent(left, right))
    return (incompatible * Q32_ONE) // len(pairs)


def govern_rate(epistemic: EpistemicState, claims: Sequence[LiftClaim], target_q32: int,
                step_q32: int = Q32_ONE // 16) -> tuple[EpistemicState, int]:
    if target_q32 < 0:
        raise CGPBoundaryError("NEGATIVE_VARIATION_TARGET")
    observed = divergence_q32(claims)
    delta = observed - target_q32
    if delta > 0:
        tau = epistemic.tau_q32 + step_q32
    elif delta < 0:
        tau = max(0, epistemic.tau_q32 - step_q32)
    else:
        tau = epistemic.tau_q32
    return replace(epistemic, tau_q32=tau), delta


def project(certificate: Certificate, contract: PresentationContract) -> PresentationOutput | ProjectorFailure:
    if contract.fail_render:
        return ProjectorFailure(contract.surface, "RENDERER_FAILURE", True)
    disclosure = f"{contract.surface}:{certificate.measurement_outcome}:{contract.version}"
    payload = (certificate.observer_id, certificate.entity_ref, certificate.worldline_point,
               contract.surface, disclosure)
    return PresentationOutput(certificate.observer_id, certificate.entity_ref,
                              certificate.worldline_point, contract.surface, disclosure,
                              canonical_digest(payload))


def ontic_trace(initial: OnticWorldState, fixture: WorldFixtureV1,
                semantic_actions: Sequence[str]) -> tuple[str, ...]:
    state = initial
    trace = [canonical_json(state)]
    for action in semantic_actions:
        state = advance_ontic(state, fixture, action)
        trace.append(canonical_json(state))
    return tuple(trace)


def imported_identities() -> dict[str, str]:
    root = HERE.parent
    paths = {
        "cgp_spec": HERE / "SPEC-CGP-WORLD-001-CONSTITUTIVE-WORLD_v0_3.md",
        "cgp_spec_promotion": HERE / "PROMOTION_RECORD_CGP_WORLD_001_SPEC_v0_3.md",
        "physics_promotion": root / "physics_rd_001_contact_gr_constructive_substrate_realization" / "PROMOTION_RECORD.md",
        "agency_promotion": root / "game_input_agency_001" / "PROMOTION_RECORD.md",
        "ascii_env_promotion": root / "ascii_env_001_walkable_perspective_world" / "PROMOTION_RECORD.md",
    }
    return {name: file_sha256(path) for name, path in paths.items()}
