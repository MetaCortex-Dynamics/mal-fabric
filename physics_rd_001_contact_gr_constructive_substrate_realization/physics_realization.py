#!/usr/bin/env python3
"""Deterministic bounded Contact-GR / Constructive-Substrate realization.

This module is an execution artifact, never a theory authority.  It imports the
closed corpus by byte identity and realizes only the bounded PHYSICS-R&D-001
domain authorized by the promoted specification and v0.2.1 amendment.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, replace
from hashlib import sha256
from itertools import product
import json
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence


HERE = Path(__file__).resolve().parent
CORPUS_ROOT = HERE / "corpus"
AUTHORITATIVE_ROOT = CORPUS_ROOT / "authoritative"
COMPANION_ROOT = CORPUS_ROOT / "companions"
MANIFEST_PATH = HERE / "corpus-manifest.json"

SPEC_PATH = HERE / "SPEC-PHYSICS-R&D-001-CONTACT-GR-CONSTRUCTIVE-SUBSTRATE-REALIZATION.md"
PROMOTION_PATH = HERE / "PROMOTION_RECORD_PHYSICS_R&D_001_SPEC.md"
AMENDMENT_PATH = HERE / "AMENDMENT-PHYSICS-R&D-001-v0.2.1-CORPUS-RESONANCE-O5.md"

SPEC_SHA256 = "7483C3B6001710AF0397AE7AE506539D265AC05A9FDCE021877D02E71E0CCC1B"
PROMOTION_SHA256 = "33B3947DF377F1319A5BC861B20028DD2B8CF5307C701A568814ABF5C7F0ACAF"
AMENDMENT_SHA256 = "A41927D9111FD6FFDB08C752A1FF02E481CD56ACD35C18F554BFF21352E06F51"

V0_9_0_DOI = "10.5281/zenodo.22729949"
V0_9_0_CONCEPT_DOI = "10.5281/zenodo.22678127"
V0_9_0_PROMOTION_COMMIT = "14b70ababc5930f188545b6ba1fdb5c3c40ee93e"
V0_9_0_RELEASE_CARRIER = "19eeb77109d22a1d4a5842879ddd61fb84240ba0"
PRIOR_CONFORMANCE = "299/299 UNCHANGED"
PRIOR_EVIDENCE = "267/267 BYTE_IDENTICAL"
VIS_EVIDENCE = "25/25 BYTE_IDENTICAL"
SHOWCASE_ACCEPTANCE = "22/22"

Q32_ONE = 1 << 32
ORIENTATION_MODULUS = 6
FLAT_FLEX = "FLAT_FLEX"
CARRIER_QUOTIENT = "CARRIER_QUOTIENT"
BLOCKED = "BLOCKED"
COMMITTED = "COMMITTED"


class PhysicsBoundaryError(ValueError):
    """Raised when an authority, domain, or canonicality boundary fails."""


def file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


def canonical_value(value: Any) -> Any:
    if isinstance(value, float):
        raise PhysicsBoundaryError("FLOAT_FORBIDDEN_ON_GOVERNANCE_PATH")
    if hasattr(value, "canonical"):
        return canonical_value(value.canonical())
    if hasattr(value, "__dataclass_fields__"):
        return canonical_value(asdict(value))
    if isinstance(value, Mapping):
        return {str(key): canonical_value(value[key]) for key in sorted(value, key=lambda item: str(item))}
    if isinstance(value, (tuple, list)):
        return [canonical_value(item) for item in value]
    if isinstance(value, set):
        return [canonical_value(item) for item in sorted(value)]
    if value is None or isinstance(value, (str, int, bool)):
        return value
    raise PhysicsBoundaryError(f"NONCANONICAL_VALUE:{type(value).__name__}")


def canonical_json(value: Any, *, pretty: bool = False) -> str:
    kwargs: dict[str, Any] = {"ensure_ascii": False, "sort_keys": True}
    if pretty:
        kwargs["indent"] = 2
    else:
        kwargs["separators"] = (",", ":")
    return json.dumps(canonical_value(value), **kwargs)


def canonical_digest(value: Any) -> str:
    return sha256(canonical_json(value).encode("utf-8")).hexdigest().upper()


def q32_mul(left: int, right: int) -> int:
    return (left * right) // Q32_ONE


def cyclic_distance(left: int, right: int) -> int:
    clockwise = (left - right) % ORIENTATION_MODULUS
    return min(clockwise, ORIENTATION_MODULUS - clockwise)


def _edge(left: int, right: int) -> tuple[int, int]:
    if left == right:
        raise PhysicsBoundaryError("SELF_EDGE")
    return (left, right) if left < right else (right, left)


def dodecahedron_edges() -> tuple[tuple[int, int], ...]:
    """Canonical generalized-Petersen G(10,2) labeling of the carrier."""
    edges: set[tuple[int, int]] = set()
    for index in range(10):
        edges.add(_edge(index, (index + 1) % 10))
        edges.add(_edge(index, 10 + index))
        edges.add(_edge(10 + index, 10 + ((index + 2) % 10)))
    result = tuple(sorted(edges))
    if len(result) != 30:
        raise PhysicsBoundaryError("DODECAHEDRAL_EDGE_CENSUS_FAILURE")
    return result


DODECAHEDRON_EDGES = dodecahedron_edges()


def adjacency(node_count: int, edges: Sequence[tuple[int, int]]) -> tuple[tuple[int, ...], ...]:
    neighbors: list[set[int]] = [set() for _ in range(node_count)]
    for left, right in edges:
        neighbors[left].add(right)
        neighbors[right].add(left)
    return tuple(tuple(sorted(items)) for items in neighbors)


DODECAHEDRON_ADJACENCY = adjacency(20, DODECAHEDRON_EDGES)


def _normalize_cycle(cycle: Sequence[int]) -> tuple[int, ...]:
    values = tuple(cycle)
    rotations: list[tuple[int, ...]] = []
    for oriented in (values, tuple(reversed(values))):
        rotations.extend(oriented[index:] + oriented[:index] for index in range(len(oriented)))
    return min(rotations)


def dodecahedron_faces() -> tuple[tuple[int, ...], ...]:
    found: set[tuple[int, ...]] = set()
    graph = DODECAHEDRON_ADJACENCY
    for start in range(20):
        stack: list[tuple[int, tuple[int, ...]]] = [(start, (start,))]
        while stack:
            current, path = stack.pop()
            if len(path) == 5:
                if start in graph[current]:
                    normalized = _normalize_cycle(path)
                    node_set = set(normalized)
                    induced = sum(1 for left, right in DODECAHEDRON_EDGES if left in node_set and right in node_set)
                    if induced == 5:
                        found.add(normalized)
                continue
            for neighbor in graph[current]:
                if neighbor not in path:
                    stack.append((neighbor, path + (neighbor,)))
    result = tuple(sorted(found))
    if len(result) != 12:
        raise PhysicsBoundaryError(f"DODECAHEDRAL_FACE_CENSUS_FAILURE:{len(result)}")
    return result


DODECAHEDRON_FACES = dodecahedron_faces()


def face_adjacency_edges() -> tuple[tuple[int, int], ...]:
    face_edges = [set(_edge(face[i], face[(i + 1) % 5]) for i in range(5)) for face in DODECAHEDRON_FACES]
    result = tuple(
        (left, right)
        for left in range(12)
        for right in range(left + 1, 12)
        if face_edges[left] & face_edges[right]
    )
    if len(result) != 30:
        raise PhysicsBoundaryError("ICOSAHEDRAL_FACE_ADJACENCY_CENSUS_FAILURE")
    return result


FLEX_EDGES = face_adjacency_edges()
FLEX_ADJACENCY = adjacency(12, FLEX_EDGES)


def opposite_face_pairs() -> tuple[tuple[int, int], ...]:
    disjoint = [
        (left, right)
        for left in range(12)
        for right in range(left + 1, 12)
        if set(DODECAHEDRON_FACES[left]).isdisjoint(DODECAHEDRON_FACES[right])
    ]
    graph = DODECAHEDRON_ADJACENCY

    def vertex_distance(source: int, target: int) -> int:
        frontier = {source}
        visited = {source}
        distance = 0
        while frontier:
            if target in frontier:
                return distance
            distance += 1
            frontier = {neighbor for node in frontier for neighbor in graph[node] if neighbor not in visited}
            visited.update(frontier)
        raise PhysicsBoundaryError("DISCONNECTED_CARRIER")

    scored = []
    for left, right in disjoint:
        score = min(vertex_distance(a, b) for a in DODECAHEDRON_FACES[left] for b in DODECAHEDRON_FACES[right])
        scored.append((score, left, right))
    maximum = max(item[0] for item in scored)
    result = tuple((left, right) for score, left, right in scored if score == maximum)
    if len(result) != 6:
        raise PhysicsBoundaryError(f"FIVE_FOLD_AXIS_CENSUS_FAILURE:{len(result)}")
    return result


OPPOSITE_FACE_PAIRS = opposite_face_pairs()


def carrier_axes() -> tuple[tuple[tuple[int, ...], ...], ...]:
    axes: list[tuple[tuple[int, ...], ...]] = []
    for left_face, right_face in OPPOSITE_FACE_PAIRS:
        top = set(DODECAHEDRON_FACES[left_face])
        bottom = set(DODECAHEDRON_FACES[right_face])
        ring_one = {neighbor for node in top for neighbor in DODECAHEDRON_ADJACENCY[node]} - top
        ring_one -= bottom
        ring_two = set(range(20)) - top - bottom - ring_one
        orbits = (tuple(sorted(top)), tuple(sorted(ring_one)), tuple(sorted(ring_two)), tuple(sorted(bottom)))
        if sorted(len(orbit) for orbit in orbits) != [5, 5, 5, 5]:
            raise PhysicsBoundaryError("INVALID_AXIS_ORBITS")
        reverse = tuple(reversed(orbits))
        axes.append(min(orbits, reverse))
    result = tuple(sorted(set(axes)))
    if len(result) != 6:
        raise PhysicsBoundaryError(f"AXIS_ORBIT_CENSUS_FAILURE:{len(result)}")
    return result


CARRIER_AXES = carrier_axes()


def graph_energy(state: Sequence[int], edges: Sequence[tuple[int, int]]) -> int:
    return sum(cyclic_distance(state[left], state[right]) for left, right in edges)


def local_argmin_update(state: Sequence[int], graph: Sequence[Sequence[int]]) -> tuple[int, ...]:
    snapshot = tuple(state)
    successor: list[int] = []
    for node, neighbors in enumerate(graph):
        costs = {
            candidate: sum(cyclic_distance(candidate, snapshot[neighbor]) for neighbor in neighbors)
            for candidate in range(ORIENTATION_MODULUS)
        }
        minimum = min(costs.values())
        minimizers = tuple(candidate for candidate, cost in costs.items() if cost == minimum)
        successor.append(snapshot[node] if snapshot[node] in minimizers else minimizers[0])
    return tuple(successor)


def coherence_holds(state: Sequence[int], edges: Sequence[tuple[int, int]]) -> bool:
    return all(cyclic_distance(state[left], state[right]) <= 1 for left, right in edges)


def quotient_weights(axis: Sequence[Sequence[int]]) -> tuple[tuple[int, int, int], ...]:
    orbit_of = {node: index for index, orbit in enumerate(axis) for node in orbit}
    counts: dict[tuple[int, int], int] = {}
    for left, right in DODECAHEDRON_EDGES:
        a, b = sorted((orbit_of[left], orbit_of[right]))
        if a != b:
            counts[(a, b)] = counts.get((a, b), 0) + 1
    return tuple((left, right, counts[(left, right)]) for left, right in sorted(counts))


def quotient_energy(state: Sequence[int], axis: Sequence[Sequence[int]]) -> int:
    return sum(weight * cyclic_distance(state[left], state[right]) for left, right, weight in quotient_weights(axis))


def project_to_axis(state: Sequence[int], axis: Sequence[Sequence[int]]) -> tuple[tuple[int, ...], int]:
    quotient: list[int] = []
    score = 0
    for orbit in axis:
        costs = {
            candidate: sum(cyclic_distance(candidate, state[node]) for node in orbit)
            for candidate in range(ORIENTATION_MODULUS)
        }
        minimum = min(costs.values())
        quotient.append(min(candidate for candidate, cost in costs.items() if cost == minimum))
        score += minimum
    return tuple(quotient), score


def select_axis(state: Sequence[int]) -> tuple[int, tuple[int, ...], int]:
    candidates = []
    for index, axis in enumerate(CARRIER_AXES):
        projected, score = project_to_axis(state, axis)
        candidates.append((score, canonical_digest(axis), projected, index))
    score, _, projected, index = min(candidates)
    return index, projected, score


def quotient_step(state: Sequence[int], axis: Sequence[Sequence[int]]) -> tuple[int, ...]:
    current = tuple(state)
    candidate_domains = [tuple(sorted({value, (value - 1) % 6, (value + 1) % 6})) for value in current]
    candidates = tuple(product(*candidate_domains))
    minimum = min(quotient_energy(candidate, axis) for candidate in candidates)
    minimizers = tuple(candidate for candidate in candidates if quotient_energy(candidate, axis) == minimum)
    return current if current in minimizers else min(minimizers)


def lift_quotient(state: Sequence[int], axis: Sequence[Sequence[int]]) -> tuple[int, ...]:
    lifted = [0] * 20
    for orientation, orbit in zip(state, axis):
        for node in orbit:
            lifted[node] = orientation
    return tuple(lifted)


@dataclass(frozen=True)
class CarrierCandidate:
    axis_index: int
    projection_score: int
    prior_quotient: tuple[int, ...]
    successor_quotient: tuple[int, ...]
    successor_carrier: tuple[int, ...]
    prior_quotient_energy: int
    successor_quotient_energy: int

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


def carrier_step(state: Sequence[int], *, axis_index: int | None = None) -> CarrierCandidate:
    if len(state) != 20:
        raise PhysicsBoundaryError("SUBSTRATE_DOMAIN_COLLAPSE")
    if axis_index is None:
        selected, prior_q, score = select_axis(state)
    else:
        selected = axis_index
        prior_q, score = project_to_axis(state, CARRIER_AXES[selected])
    axis = CARRIER_AXES[selected]
    successor_q = quotient_step(prior_q, axis)
    return CarrierCandidate(
        selected,
        score,
        prior_q,
        successor_q,
        lift_quotient(successor_q, axis),
        quotient_energy(prior_q, axis),
        quotient_energy(successor_q, axis),
    )


def carrier_trace(initial_quotient: Sequence[int], axis_index: int = 0, maximum_steps: int = 4) -> tuple[tuple[int, ...], ...]:
    axis = CARRIER_AXES[axis_index]
    current = tuple(initial_quotient)
    trace = [current]
    for _ in range(maximum_steps):
        if quotient_energy(current, axis) == 0:
            break
        current = quotient_step(current, axis)
        trace.append(current)
    return tuple(trace)


def binary_flex_resonances() -> tuple[tuple[int, ...], ...]:
    witnesses = []
    for bits in product((0, 1), repeat=12):
        if bits in ((0,) * 12, (1,) * 12):
            continue
        if local_argmin_update(bits, FLEX_ADJACENCY) == bits:
            witnesses.append(bits)
    return tuple(witnesses)


FLEX_RESONANCES = binary_flex_resonances()


def common_incidence_edges() -> tuple[tuple[int, int], ...]:
    edges = []
    for triangle in range(20):
        for pentagon, face in enumerate(DODECAHEDRON_FACES):
            if triangle in face:
                edges.append((triangle, 20 + pentagon))
    result = tuple(sorted(edges))
    graph = adjacency(32, result)
    if len(result) != 60 or sorted(len(graph[node]) for node in range(20)) != [3] * 20:
        raise PhysicsBoundaryError("ICOSIDODECAHEDRAL_INCIDENCE_FAILURE")
    if sorted(len(graph[node]) for node in range(20, 32)) != [5] * 12:
        raise PhysicsBoundaryError("ICOSIDODECAHEDRAL_INCIDENCE_FAILURE")
    return result


COMMON_INCIDENCE_EDGES = common_incidence_edges()
COMMON_ADJACENCY = adjacency(32, COMMON_INCIDENCE_EDGES)


def binary_common_fixed_points() -> tuple[tuple[int, ...], ...]:
    fixed = []
    for pentagons in product((0, 1), repeat=12):
        triangles = tuple(
            int(sum(pentagons[neighbor - 20] for neighbor in COMMON_ADJACENCY[node]) >= 2)
            for node in range(20)
        )
        if all(
            int(sum(triangles[neighbor] for neighbor in COMMON_ADJACENCY[20 + index]) >= 3) == pentagons[index]
            for index in range(12)
        ):
            fixed.append(triangles + pentagons)
    return tuple(fixed)


COMMON_FIXED_POINTS = binary_common_fixed_points()


def coindividuation_admissible(state: Sequence[int]) -> bool:
    if len(state) != 32:
        return False
    triangles = tuple(state[:20])
    pentagons = tuple(state[20:])
    triangle_ground = len(set(triangles)) == 1
    pentagon_ground = len(set(pentagons)) == 1
    return (not triangle_ground and not pentagon_ground) or (triangle_ground and pentagon_ground)


def verify_corpus_manifest(manifest_path: Path = MANIFEST_PATH) -> dict[str, Any]:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("base_spec_sha256") != SPEC_SHA256 or file_sha256(SPEC_PATH) != SPEC_SHA256:
        raise PhysicsBoundaryError("BASE_SPEC_IDENTITY_UNBOUND")
    if manifest.get("base_promotion_record_sha256") != PROMOTION_SHA256 or file_sha256(PROMOTION_PATH) != PROMOTION_SHA256:
        raise PhysicsBoundaryError("BASE_PROMOTION_IDENTITY_UNBOUND")
    if manifest.get("amendment_sha256") != AMENDMENT_SHA256 or file_sha256(AMENDMENT_PATH) != AMENDMENT_SHA256:
        raise PhysicsBoundaryError("AMENDMENT_IDENTITY_UNBOUND")
    for entry in (*manifest["contact_gr"], *manifest["constructive_substrate"]):
        path = AUTHORITATIVE_ROOT / entry["filename"]
        if entry.get("status") != "BOUND" or not path.is_file() or file_sha256(path) != entry["sha256"]:
            raise PhysicsBoundaryError("CORPUS_IDENTITY_UNBOUND")
    for entry in manifest["companions"]:
        path = COMPANION_ROOT / entry["filename"]
        if not path.is_file() or file_sha256(path) != entry["sha256"]:
            raise PhysicsBoundaryError("CORPUS_COMPANION_IDENTITY_FAILURE")
    return manifest


CORPUS_MANIFEST = verify_corpus_manifest()
CONTACT_CORPUS_DIGEST = canonical_digest(CORPUS_MANIFEST["contact_gr"])
SUBSTRATE_CORPUS_DIGEST = canonical_digest(CORPUS_MANIFEST["constructive_substrate"])


@dataclass(frozen=True)
class ContactSubstrateBinding:
    contact_corpus_digest: str
    substrate_corpus_digest: str
    carrier_geometry_digest: str
    contact_state_embedding_digest: str
    constructive_position_law_digest: str
    dual_admissibility_law_digest: str
    tick_identity_law_digest: str
    quotient_lift_law_digest: str

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class ConstructiveSubstrateSpec:
    schema_version: str
    carrier_digest: str
    dual_grammar_digest: str
    constructive_cell_digest: str
    orientation_group_digest: str
    coherence_window_digest: str
    mismatch_energy_law_digest: str
    flex_law_digest: str
    quotient_law_digest: str
    convergence_law_digest: str
    bounded_realization_domain: tuple[str, ...]

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class ContactHamiltonianSpec:
    logical_id: str
    corpus_entry_digest: str
    generating_potential: str
    bounded_horizontal_step_q32: int
    integration_chart: str

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class LambdaDeformationSpec:
    logical_id: str
    corpus_entry_digest: str
    constructive_position_values: tuple[tuple[int, int], ...]

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def evaluate(self, position: int) -> int:
        values = dict(self.constructive_position_values)
        if position not in values:
            raise PhysicsBoundaryError("LAMBDA_POSITION_UNBOUND")
        return values[position]

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class ContactState:
    path_position_q32: int
    entropy_q32: int
    lambda_q32: int
    accumulated_cost_q32: int
    constructive_cell_id: int

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class ConstructiveSubstrateState:
    substrate_run_id: str
    physics_tick_index: int
    substrate_spec_digest: str
    flex_face_state: tuple[int, ...]
    carrier_vertex_state: tuple[int, ...]
    face_mismatch_energy: int
    quotient_energy: int
    quotient_state_digest: str
    ground_state_status: str

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class ResonanceEntityState:
    resonance_id: str
    support_cell_set_digest: str
    orientation_assignment_digest: str
    boundary_edge_set_digest: str
    resonance_center_binding: int
    fixed_point_witness_digest: str
    contact_state_digest: str
    constructive_substrate_state_digest: str
    physics_tick_index: int

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class ContactPhysicsState:
    physics_run_id: str
    physics_tick_index: int
    entity_id: str
    contact_state: ContactState
    constructive_cell_id: int
    constructive_orientation_class: int
    local_mismatch_energy: int
    substrate_state_digest: str
    contact_object_digest: str
    hamiltonian_digest: str
    deformation_digest: str
    contact_substrate_binding_digest: str
    admissibility_state: str

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class JointPhysicsState:
    contact_physics_state: ContactPhysicsState
    constructive_substrate_state: ConstructiveSubstrateState
    resonance_entity_state: ResonanceEntityState
    physics_tick_index: int

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class BlockedResult:
    status: str
    reason: str
    prior_joint_state_digest: str

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class JointTickWitness:
    tick_index: int
    prior_joint_state_digest: str
    reeb_boundary_witness_digest: str
    unified_substrate_candidate_digest: str
    contact_candidate_digest: str
    governance_decision_digest: str
    successor_joint_state_digest: str

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


@dataclass(frozen=True)
class UnifiedLawRealizationWitness:
    witness_domain_digest: str
    unified_law_digest: str
    initial_common_state_digest: str
    flex_reference_trace_digest: str
    carrier_reference_trace_digest: str
    unified_trace_digest: str
    flex_recovery_witness_digest: str
    carrier_recovery_witness_digest: str
    joint_tick_witness_digest: str
    host_order_replay_digest: str

    @property
    def digest(self) -> str:
        return canonical_digest(self)

    def canonical(self) -> dict[str, Any]:
        return canonical_value(asdict(self))


def _law_digest(logical_id: str, source: str, section: str) -> str:
    return canonical_digest({"logical_id": logical_id, "source": source, "section": section})


CONTACT_BINDING = ContactSubstrateBinding(
    CONTACT_CORPUS_DIGEST,
    SUBSTRATE_CORPUS_DIGEST,
    canonical_digest({"graph": "DODECAHEDRON_G_10_2", "edges": DODECAHEDRON_EDGES, "faces": DODECAHEDRON_FACES}),
    _law_digest("CONTACT_STATE_EMBEDDING", "CGR-HA", "horizontal condition"),
    _law_digest("CONSTRUCTIVE_POSITION", "AMENDMENT", "A4/A13"),
    _law_digest("DUAL_ADMISSIBILITY", "BASE_SPEC", "section 8 + amendment A5"),
    _law_digest("JOINT_TICK_IDENTITY", "BASE_SPEC", "section 12 + amendment A12"),
    _law_digest("QUOTIENT_LIFT", "CS-BASE", "section 12.2"),
)

SUBSTRATE_SPEC = ConstructiveSubstrateSpec(
    "PHYSICS-RD-001/v0.2.1",
    CONTACT_BINDING.carrier_geometry_digest,
    _law_digest("ICOSAHEDRAL_DUAL", "CS-BASE", "sections 3-4"),
    _law_digest("HEXAGONAL_CELL", "CS-BASE", "section 4"),
    _law_digest("C6", "CS-BASE", "section 5"),
    _law_digest("COHERENCE_WINDOW_PLUS_MINUS_ONE", "CS-BASE", "section 5"),
    _law_digest("CYCLIC_MISMATCH_ENERGY", "CS-BASE", "section 5.2"),
    _law_digest("SYNCHRONOUS_ARGMIN_CURRENT_TIE", "CS-BASE", "section 5.3"),
    _law_digest("ORBIT_GLOBAL_QUOTIENT", "CS-BASE", "sections 12-14"),
    _law_digest("GROUND_WITHIN_FOUR", "CS-BASE", "section 13"),
    (FLAT_FLEX, CARRIER_QUOTIENT, "COMMON_ICOSIDODECAHEDRAL_WITNESS"),
)

HAMILTONIAN = ContactHamiltonianSpec(
    "H-R1-NEGATIVE-ENTROPY-BREGMAN",
    canonical_digest(next(item for item in CORPUS_MANIFEST["contact_gr"] if item["authority_role"] == "CGR-MEAS")),
    "NEGATIVE_ENTROPY_BREGMAN_ACTION",
    Q32_ONE // 8,
    "BOUNDED_FLAT_HORIZONTAL_CHART_EXP_X_V_EQUALS_X_PLUS_V",
)

LAMBDA_FIELD = LambdaDeformationSpec(
    "LAMBDA-R1-CONSTRUCTIVE-POSITION-BOUND",
    canonical_digest(next(item for item in CORPUS_MANIFEST["contact_gr"] if item["authority_role"] == "CGR-7R")),
    tuple((position, Q32_ONE + position * (Q32_ONE // 64)) for position in range(12)),
)


def canonical_flex_resonance() -> tuple[int, ...]:
    coherent = tuple(state for state in FLEX_RESONANCES if coherence_holds(state, FLEX_EDGES))
    if not coherent:
        raise PhysicsBoundaryError("RESONANCE_FIXTURE_UNAVAILABLE")
    return min(coherent)


FLEX_RESONANCE = canonical_flex_resonance()


def flex_boundary_edges(state: Sequence[int]) -> tuple[tuple[int, int], ...]:
    return tuple(edge for edge in FLEX_EDGES if state[edge[0]] != state[edge[1]])


def initial_substrate_state() -> ConstructiveSubstrateState:
    carrier_q = (0, 0, 3, 3)
    carrier = lift_quotient(carrier_q, CARRIER_AXES[0])
    return ConstructiveSubstrateState(
        "substrate-run-physics-rd-001",
        0,
        SUBSTRATE_SPEC.digest,
        FLEX_RESONANCE,
        carrier,
        graph_energy(FLEX_RESONANCE, FLEX_EDGES),
        quotient_energy(carrier_q, CARRIER_AXES[0]),
        canonical_digest(carrier_q),
        "NON_GROUND",
    )


def initial_joint_state() -> JointPhysicsState:
    substrate = initial_substrate_state()
    center = min(index for index, value in enumerate(FLEX_RESONANCE) if value == 1)
    contact = ContactState(0, 0, LAMBDA_FIELD.evaluate(center), 0, center)
    physics = ContactPhysicsState(
        "physics-run-physics-rd-001",
        0,
        "resonance-entity-001",
        contact,
        center,
        FLEX_RESONANCE[center],
        sum(cyclic_distance(FLEX_RESONANCE[center], FLEX_RESONANCE[n]) for n in FLEX_ADJACENCY[center]),
        substrate.digest,
        _law_digest("CONTACT_GR_OBJECT", "CGR-HA+CGR-7R+CGR-CSRHS", "bounded joint realization"),
        HAMILTONIAN.digest,
        LAMBDA_FIELD.digest,
        CONTACT_BINDING.digest,
        "ADMITTED",
    )
    support = tuple(index for index, value in enumerate(FLEX_RESONANCE) if value == 1)
    resonance = ResonanceEntityState(
        physics.entity_id,
        canonical_digest(support),
        canonical_digest(FLEX_RESONANCE),
        canonical_digest(flex_boundary_edges(FLEX_RESONANCE)),
        center,
        canonical_digest({"state": FLEX_RESONANCE, "successor": local_argmin_update(FLEX_RESONANCE, FLEX_ADJACENCY)}),
        contact.digest,
        substrate.digest,
        0,
    )
    return JointPhysicsState(physics, substrate, resonance, 0)


def contact_candidate(prior: JointPhysicsState) -> ContactState:
    state = prior.contact_physics_state.contact_state
    support = tuple(index for index, value in enumerate(prior.constructive_substrate_state.flex_face_state) if value == 1)
    support_index = support.index(state.constructive_cell_id)
    next_cell = support[(support_index + 1) % len(support)]
    ds = HAMILTONIAN.bounded_horizontal_step_q32
    entropy_delta = q32_mul(state.lambda_q32, ds)
    return ContactState(
        state.path_position_q32 + ds,
        state.entropy_q32 + entropy_delta,
        LAMBDA_FIELD.evaluate(next_cell),
        state.accumulated_cost_q32 + Q32_ONE,
        next_cell,
    )


def contact_admissible(prior: ContactState, candidate: ContactState) -> bool:
    ds = candidate.path_position_q32 - prior.path_position_q32
    entropy_delta = candidate.entropy_q32 - prior.entropy_q32
    return ds >= 0 and entropy_delta == q32_mul(prior.lambda_q32, ds)


def unified_substrate_candidate(prior: ConstructiveSubstrateState, evaluation_order: Sequence[str]) -> dict[str, Any]:
    required = {"F", "K"}
    if set(evaluation_order) != required or len(evaluation_order) != 2:
        raise PhysicsBoundaryError("SUBSTRATE_DOMAIN_COLLAPSE")
    results: dict[str, Any] = {}
    for branch in evaluation_order:
        if branch == "F":
            results[branch] = local_argmin_update(prior.flex_face_state, FLEX_ADJACENCY)
        else:
            results[branch] = carrier_step(prior.carrier_vertex_state)
    carrier: CarrierCandidate = results["K"]
    return {
        "candidate_version": "U_R1/v0.1",
        "flex_successor": results["F"],
        "carrier": carrier.canonical(),
        "snapshot_digest": prior.digest,
    }


def _common_state(flex_state: Sequence[int], carrier_state: Sequence[int]) -> tuple[int, ...]:
    return tuple(carrier_state) + tuple(flex_state)


def substrate_admissible(
    prior: ConstructiveSubstrateState,
    candidate: Mapping[str, Any],
    *,
    enforce_common_coindividuation: bool = False,
) -> tuple[bool, str | None]:
    flex = tuple(candidate["flex_successor"])
    carrier_data = candidate["carrier"]
    carrier = tuple(carrier_data["successor_carrier"])
    if len(flex) != 12 or len(carrier) != 20:
        return False, "SUBSTRATE_DOMAIN_COLLAPSE"
    if not coherence_holds(flex, FLEX_EDGES):
        return False, "COHERENCE_WINDOW_FAILURE"
    if graph_energy(flex, FLEX_EDGES) > prior.face_mismatch_energy:
        return False, "FLEX_MONOTONICITY_FAILURE"
    if carrier_data["successor_quotient_energy"] > carrier_data["prior_quotient_energy"]:
        return False, "FLEX_MONOTONICITY_FAILURE"
    if tuple(local_argmin_update(prior.flex_face_state, FLEX_ADJACENCY)) != flex:
        return False, "UNIFIED_LAW_RECOVERY_FAILURE"
    expected_carrier = carrier_step(prior.carrier_vertex_state).successor_carrier
    if expected_carrier != carrier:
        return False, "UNIFIED_LAW_RECOVERY_FAILURE"
    if enforce_common_coindividuation and not coindividuation_admissible(_common_state(flex, carrier)):
        return False, "COINDIVIDUATION_FAILURE"
    if canonical_digest(flex) != canonical_digest(prior.flex_face_state):
        return False, "RESONANCE_IDENTITY_FAILURE"
    return True, None


def joint_step(
    prior: JointPhysicsState,
    *,
    branch_order: Sequence[str] = ("CONTACT", "SUBSTRATE", "GOVERNANCE"),
    substrate_order: Sequence[str] = ("F", "K"),
    enforce_common_coindividuation: bool = False,
) -> tuple[JointPhysicsState | BlockedResult, JointTickWitness | None]:
    if set(branch_order) != {"CONTACT", "SUBSTRATE", "GOVERNANCE"} or len(branch_order) != 3:
        raise PhysicsBoundaryError("JOINT_TICK_IDENTITY_FAILURE")
    candidates: dict[str, Any] = {}
    for branch in branch_order:
        if branch == "CONTACT":
            candidates[branch] = contact_candidate(prior)
        elif branch == "SUBSTRATE":
            candidates[branch] = unified_substrate_candidate(prior.constructive_substrate_state, substrate_order)
        else:
            candidates[branch] = {"decision": "DEFER_UNTIL_ALL_CANDIDATES", "snapshot": prior.digest}

    contact: ContactState = candidates["CONTACT"]
    unified: Mapping[str, Any] = candidates["SUBSTRATE"]
    contact_ok = contact_admissible(prior.contact_physics_state.contact_state, contact)
    substrate_ok, substrate_reason = substrate_admissible(
        prior.constructive_substrate_state,
        unified,
        enforce_common_coindividuation=enforce_common_coindividuation,
    )
    if not contact_ok or not substrate_ok:
        reason = "CONTACT_ADMISSIBILITY_FAILURE" if not contact_ok else str(substrate_reason)
        return BlockedResult(BLOCKED, reason, prior.digest), None

    carrier = unified["carrier"]
    flex_successor = tuple(unified["flex_successor"])
    carrier_successor = tuple(carrier["successor_carrier"])
    tick = prior.physics_tick_index + 1
    substrate = ConstructiveSubstrateState(
        prior.constructive_substrate_state.substrate_run_id,
        tick,
        SUBSTRATE_SPEC.digest,
        flex_successor,
        carrier_successor,
        graph_energy(flex_successor, FLEX_EDGES),
        int(carrier["successor_quotient_energy"]),
        canonical_digest(carrier["successor_quotient"]),
        "GROUND" if int(carrier["successor_quotient_energy"]) == 0 else "NON_GROUND",
    )
    cell = contact.constructive_cell_id
    physics = ContactPhysicsState(
        prior.contact_physics_state.physics_run_id,
        tick,
        prior.contact_physics_state.entity_id,
        contact,
        cell,
        flex_successor[cell],
        sum(cyclic_distance(flex_successor[cell], flex_successor[n]) for n in FLEX_ADJACENCY[cell]),
        substrate.digest,
        prior.contact_physics_state.contact_object_digest,
        HAMILTONIAN.digest,
        LAMBDA_FIELD.digest,
        CONTACT_BINDING.digest,
        "ADMITTED",
    )
    resonance = replace(
        prior.resonance_entity_state,
        resonance_center_binding=cell,
        contact_state_digest=contact.digest,
        constructive_substrate_state_digest=substrate.digest,
        physics_tick_index=tick,
    )
    successor = JointPhysicsState(physics, substrate, resonance, tick)
    reeb = canonical_digest({"accumulated_cost_q32": contact.accumulated_cost_q32, "guard": ">= Q32_ONE", "tick": tick})
    governance = canonical_digest({
        "contact_admissible": contact_ok,
        "substrate_admissible": substrate_ok,
        "commit": "SIMULTANEOUS_JOINT_COMMIT",
        "tick": tick,
    })
    witness = JointTickWitness(
        tick,
        prior.digest,
        reeb,
        canonical_digest(unified),
        contact.digest,
        governance,
        successor.digest,
    )
    return successor, witness


def joint_trace(
    steps: int = 4,
    *,
    branch_order: Sequence[str] = ("CONTACT", "SUBSTRATE", "GOVERNANCE"),
    substrate_order: Sequence[str] = ("F", "K"),
) -> dict[str, Any]:
    state = initial_joint_state()
    initial = state.digest
    joint_witnesses: list[str] = []
    substrate_steps: list[str] = []
    contact_steps: list[str] = []
    for _ in range(steps):
        result, witness = joint_step(state, branch_order=branch_order, substrate_order=substrate_order)
        if isinstance(result, BlockedResult) or witness is None:
            return {"run_status": BLOCKED, "blocked": result.canonical()}
        state = result
        joint_witnesses.append(witness.digest)
        substrate_steps.append(state.constructive_substrate_state.digest)
        contact_steps.append(state.contact_physics_state.digest)
    substrate_trace = {
        "substrate_spec_digest": SUBSTRATE_SPEC.digest,
        "initial_substrate_state_digest": initial_joint_state().constructive_substrate_state.digest,
        "ordered_substrate_step_digests": substrate_steps,
        "final_substrate_state_digest": state.constructive_substrate_state.digest,
    }
    contact_trace_value = {
        "contact_physics_spec_digest": canonical_digest({"hamiltonian": HAMILTONIAN, "lambda": LAMBDA_FIELD}),
        "initial_contact_state_digest": initial_joint_state().contact_physics_state.digest,
        "ordered_contact_step_digests": contact_steps,
        "final_contact_state_digest": state.contact_physics_state.digest,
    }
    joint = {
        "contact_substrate_binding_digest": CONTACT_BINDING.digest,
        "initial_joint_state_digest": initial,
        "ordered_joint_tick_witness_digests": joint_witnesses,
        "substrate_trace_digest": canonical_digest(substrate_trace),
        "contact_trace_digest": canonical_digest(contact_trace_value),
        "final_joint_state_digest": state.digest,
        "run_status": COMMITTED,
    }
    return {
        "contact_trace": contact_trace_value,
        "joint_trace": joint,
        "joint_trace_digest": canonical_digest(joint),
        "substrate_trace": substrate_trace,
        "final_state": state.canonical(),
    }


def project_game(state: JointPhysicsState) -> dict[str, Any]:
    return {
        "surface": "GAME",
        "physics_run_id": state.contact_physics_state.physics_run_id,
        "physics_tick_index": state.physics_tick_index,
        "joint_physics_state_digest": state.digest,
        "entity": {
            "entity_id": state.contact_physics_state.entity_id,
            "presentation": "CREATURE_IN_GAUSSIAN_ENVIRONMENT",
            "path_position_q32": state.contact_physics_state.contact_state.path_position_q32,
        },
        "renderer_authority": "NONE",
    }


def project_carrier(state: JointPhysicsState) -> dict[str, Any]:
    return {
        "surface": "CARRIER",
        "physics_run_id": state.contact_physics_state.physics_run_id,
        "physics_tick_index": state.physics_tick_index,
        "joint_physics_state_digest": state.digest,
        "contact": {
            "contact_state_digest": state.contact_physics_state.contact_state.digest,
            "hamiltonian_digest": state.contact_physics_state.hamiltonian_digest,
            "lambda_deformation_digest": state.contact_physics_state.deformation_digest,
        },
        "substrate": {
            "constructive_cell_id": state.contact_physics_state.constructive_cell_id,
            "orientation_class": state.contact_physics_state.constructive_orientation_class,
            "local_mismatch_energy": state.contact_physics_state.local_mismatch_energy,
            "substrate_state_digest": state.constructive_substrate_state.digest,
        },
        "renderer_authority": "NONE",
    }


def quotient_lift_witness() -> dict[str, Any]:
    axis = CARRIER_AXES[0]
    quotient = (0, 1, 2, 3)
    state_a = lift_quotient(quotient, axis)
    state_b = list(state_a)
    state_b[axis[0][0]] = 1
    state_b = tuple(state_b)
    projected_a, _ = project_to_axis(state_a, axis)
    projected_b, _ = project_to_axis(state_b, axis)
    successor_a = carrier_step(state_a, axis_index=0).successor_carrier
    successor_b = carrier_step(state_b, axis_index=0).successor_carrier
    witness = {
        "state_A_digest": canonical_digest(state_a),
        "state_B_digest": canonical_digest(state_b),
        "quotient_digest": canonical_digest(projected_a),
        "successor_A_digest": canonical_digest(successor_a),
        "successor_B_digest": canonical_digest(successor_b),
        "lifted_result_digest": canonical_digest(successor_a),
    }
    witness["exact"] = projected_a == projected_b and successor_a == successor_b
    return witness


def unified_law_witness() -> UnifiedLawRealizationWitness:
    prior = initial_substrate_state()
    forward = unified_substrate_candidate(prior, ("F", "K"))
    reverse = unified_substrate_candidate(prior, ("K", "F"))
    flex_reference = local_argmin_update(prior.flex_face_state, FLEX_ADJACENCY)
    carrier_reference = carrier_step(prior.carrier_vertex_state).successor_carrier
    flex_recovery = tuple(forward["flex_successor"]) == flex_reference
    carrier_recovery = tuple(forward["carrier"]["successor_carrier"]) == carrier_reference
    state, tick = joint_step(initial_joint_state(), enforce_common_coindividuation=True)
    if isinstance(state, BlockedResult) or tick is None:
        raise PhysicsBoundaryError("UNIFIED_LAW_RECOVERY_FAILURE")
    return UnifiedLawRealizationWitness(
        canonical_digest({"common_domain": "ICOSIDODECAHEDRAL_T20_P12", "F": "Z6^12", "K": "Z6^20"}),
        canonical_digest({"law": "U_R1", "single_snapshot": True, "single_commit": True}),
        canonical_digest(_common_state(prior.flex_face_state, prior.carrier_vertex_state)),
        canonical_digest({"initial": prior.flex_face_state, "successor": flex_reference}),
        canonical_digest({"initial": prior.carrier_vertex_state, "successor": carrier_reference}),
        canonical_digest(forward),
        canonical_digest({"recovered": flex_recovery, "successor": flex_reference}),
        canonical_digest({"recovered": carrier_recovery, "successor": carrier_reference}),
        tick.digest,
        canonical_digest({"forward": forward, "reverse": reverse, "same": forward == reverse}),
    )


def imported_identities() -> dict[str, Any]:
    return {
        "amendment_sha256": file_sha256(AMENDMENT_PATH),
        "contact_corpus_digest": CONTACT_CORPUS_DIGEST,
        "corpus_manifest_sha256": file_sha256(MANIFEST_PATH),
        "promotion_record_sha256": file_sha256(PROMOTION_PATH),
        "spec_sha256": file_sha256(SPEC_PATH),
        "substrate_corpus_digest": SUBSTRATE_CORPUS_DIGEST,
        "v0_9_0": {
            "concept_doi": V0_9_0_CONCEPT_DOI,
            "doi": V0_9_0_DOI,
            "promotion_commit": V0_9_0_PROMOTION_COMMIT,
            "release_carrier": V0_9_0_RELEASE_CARRIER,
        },
    }


def physics_disabled_baseline() -> dict[str, Any]:
    """Return the immutable published baseline identity with no physics mutation."""
    return {
        "mode": "PHYSICS_DISABLED",
        "baseline": "mal-fabric v0.9.0",
        "version_doi": V0_9_0_DOI,
        "release_carrier": V0_9_0_RELEASE_CARRIER,
        "promotion_commit": V0_9_0_PROMOTION_COMMIT,
        "conformance": PRIOR_CONFORMANCE,
        "semantic_delta": "NONE",
    }


def theory_substitution_attempt(kind: str, prior: JointPhysicsState | None = None) -> BlockedResult:
    forbidden = {
        "NEWTONIAN_FALLBACK",
        "EULER_INTEGRATION",
        "ARBITRARY_CARTESIAN_LATTICE",
        "GAUSSIAN_CENTERS_AS_CELLS",
        "APPROXIMATE_QUOTIENT_LIFT",
    }
    state = initial_joint_state() if prior is None else prior
    if kind in forbidden:
        return BlockedResult(BLOCKED, "THEORY_SUBSTITUTION_ATTEMPT", state.digest)
    return BlockedResult(BLOCKED, "UNKNOWN_REALIZATION_CHOICE", state.digest)


__all__ = [
    "AMENDMENT_SHA256", "BLOCKED", "CARRIER_AXES", "CARRIER_QUOTIENT", "COMMITTED",
    "COMMON_FIXED_POINTS", "CONTACT_BINDING", "CONTACT_CORPUS_DIGEST", "CORPUS_MANIFEST",
    "DODECAHEDRON_EDGES", "DODECAHEDRON_FACES", "FLAT_FLEX", "FLEX_ADJACENCY", "FLEX_EDGES",
    "FLEX_RESONANCE", "FLEX_RESONANCES", "HAMILTONIAN", "LAMBDA_FIELD", "PRIOR_CONFORMANCE",
    "PRIOR_EVIDENCE", "PhysicsBoundaryError", "Q32_ONE", "SHOWCASE_ACCEPTANCE", "SPEC_SHA256",
    "SUBSTRATE_CORPUS_DIGEST", "SUBSTRATE_SPEC", "V0_9_0_DOI", "VIS_EVIDENCE",
    "binary_common_fixed_points", "canonical_digest", "canonical_json", "canonical_value",
    "carrier_step", "carrier_trace", "coherence_holds", "coindividuation_admissible",
    "contact_admissible", "contact_candidate", "cyclic_distance", "file_sha256", "graph_energy",
    "imported_identities", "initial_joint_state", "initial_substrate_state", "joint_step", "joint_trace",
    "lift_quotient", "local_argmin_update", "physics_disabled_baseline", "project_carrier", "project_game", "project_to_axis",
    "quotient_energy", "quotient_lift_witness", "quotient_step", "select_axis", "substrate_admissible",
    "theory_substitution_attempt", "unified_law_witness", "unified_substrate_candidate", "verify_corpus_manifest",
]
