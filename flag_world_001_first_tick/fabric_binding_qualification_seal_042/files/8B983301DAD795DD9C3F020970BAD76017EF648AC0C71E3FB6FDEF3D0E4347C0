"""Canonical static fabric semantics for FABRIC_SPEC v0.1.0-candidate-r2.

This module is deliberately limited to static construction, editing,
normalization, derived relations, and DRC.  It contains no runtime execution
state or V3.2/V3.3 behavior.
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from hashlib import sha256
import json
from typing import Any, Callable, Iterable, Mapping, Sequence


SPEC_VERSION = "0.1.0-candidate-r2"
TRIAD_DIMENSIONS = ("□G", "□S", "□F")
WITNESSES = ("WHAT", "WHERE", "WHICH", "WHEN", "FOR_WHAT", "HOW", "WHENCE")

EXACTLY_ONE = "EXACTLY_ONE"
MANY = "MANY"
RESULT = "RESULT"

ROLE_SCHEMA: dict[str, tuple[tuple[str, str], ...]] = {
    "THIS": (("VALUE", EXACTLY_ONE),),
    "SAME_NOT_SAME": (("LEFT", EXACTLY_ONE), ("RIGHT", EXACTLY_ONE)),
    "NO": (("TARGET", EXACTLY_ONE),),
    "IF_THEN": (("CONDITION", EXACTLY_ONE), ("CONSEQUENT", EXACTLY_ONE)),
    "BECAUSE": (("GROUND", EXACTLY_ONE), ("CONSEQUENT", EXACTLY_ONE)),
    "INSIDE_OUTSIDE": (("INNER", EXACTLY_ONE), ("OUTER", EXACTLY_ONE)),
    "NEAR_FAR": (("REFERENT", EXACTLY_ONE), ("COMPARED", EXACTLY_ONE)),
    "CAN_CANNOT": (("AGENT", EXACTLY_ONE), ("CAPACITY", EXACTLY_ONE)),
    "MAYBE": (("CANDIDATE", EXACTLY_ONE),),
    "MUST_LET": (("SUBJECT", EXACTLY_ONE), ("OBLIGATION", EXACTLY_ONE)),
    "TOGETHER_ALONE": (("MEMBER", MANY),),
    "MORE_LESS": (("REFERENT", EXACTLY_ONE), ("COMPARED", EXACTLY_ONE)),
    "GOES_WITH": (("ANCHOR", EXACTLY_ONE), ("COMPANION", EXACTLY_ONE)),
    "MANY_ONE": (("MEMBER", MANY),),
    "EVERY_SOME": (("DOMAIN", EXACTLY_ONE), ("QUANTIFIER_BODY", EXACTLY_ONE)),
}

_WITNESS_PAYLOAD = {
    "WHAT": "identity/essence",
    "WHERE": "location/context",
    "WHICH": "selection/discrimination",
    "WHEN": "temporal/sequence",
    "FOR_WHAT": "teleological/purpose",
    "HOW": "mechanism/process",
    "WHENCE": "origin/genealogy",
}

_TYPE_ORDER = {"cell": 0, "motif": 1, "triad_block": 2}


class FabricError(ValueError):
    """Base error for malformed static fabric operations."""


class EditApplicationError(FabricError):
    """Raised when an edit cannot deterministically apply to its base."""


class NormalizationError(FabricError):
    """Raised when malformed primitive state cannot be normalized."""


def witness_type(witness: str, role: str) -> str:
    """Return the total symbolic WITNESS_TYPE for a witness/role position.

    In v0.1.0 the role selects a port position while the witness selects the
    symbolic payload class.  Thus WHAT/RESULT and WHAT/LEFT are compatible,
    while WHAT/RESULT and WHERE/INNER are not.
    """

    if witness not in _WITNESS_PAYLOAD:
        raise FabricError(f"unknown witness: {witness}")
    if not role:
        raise FabricError("role must be a non-empty stable symbol")
    return _WITNESS_PAYLOAD[witness]


def witness_binding(operator: str, witness: str) -> tuple[tuple[str, str], ...]:
    return tuple((role, witness_type(witness, role)) for role, _ in role_schema(operator))


def role_schema(operator: str) -> tuple[tuple[str, str], ...]:
    try:
        return ROLE_SCHEMA[operator]
    except KeyError as exc:
        raise FabricError(f"unknown operator: {operator}") from exc


def join_signature(operator: str, witness: str) -> tuple[tuple[str, str, str], ...]:
    binding = dict(witness_binding(operator, witness))
    return tuple((role, multiplicity, binding[role]) for role, multiplicity in role_schema(operator))


def output_schema(operator: str) -> tuple[str, str, str]:
    role_schema(operator)  # prove totality over the same operator domain
    return (RESULT, EXACTLY_ONE, "OUT")


def port_schema(operator: str, witness: str) -> tuple[dict[str, str], ...]:
    inputs = tuple(
        {
            "role": role,
            "direction": "IN",
            "multiplicity": multiplicity,
            "payload_type": witness_type(witness, role),
        }
        for role, multiplicity in role_schema(operator)
    )
    output = {
        "role": RESULT,
        "direction": "OUT",
        "multiplicity": EXACTLY_ONE,
        "payload_type": witness_type(witness, RESULT),
    }
    return inputs + (output,)


def type_compat(source_type: str, target_type: str) -> bool:
    return source_type == target_type


@dataclass(frozen=True)
class CellDef:
    cell_id: str
    operator: str
    witness: str
    payload_slot_type: str
    triad_capability: tuple[str, ...]


def cell_def(cell_id: str, operator: str, witness: str, capability: Iterable[str]) -> CellDef:
    caps = tuple(sorted(set(capability), key=TRIAD_DIMENSIONS.index))
    return CellDef(cell_id, operator, witness, witness_type(witness, RESULT), caps)


@dataclass(frozen=True)
class TriadPosition:
    kind: str
    source: str
    target: str | None = None

    def canonical(self) -> dict[str, Any]:
        if self.kind == "INTERIOR":
            return {"kind": self.kind, "dimension": self.source}
        return {"kind": self.kind, "source": self.source, "target": self.target}


def interior(dimension: str) -> TriadPosition:
    return TriadPosition("INTERIOR", dimension)


def boundary(source: str, target: str) -> TriadPosition:
    return TriadPosition("BOUNDARY", source, target)


@dataclass(frozen=True)
class Location:
    triad_position: TriadPosition
    containment_path: tuple[str, ...]


@dataclass(frozen=True)
class Placement:
    cell_id: str
    location: Location


@dataclass(frozen=True)
class Motif:
    motif_id: str
    contained_ids: tuple[str, ...]


@dataclass(frozen=True)
class TriadBlock:
    block_id: str
    contained_ids: tuple[str, ...]


def _length_prefixed(parts: Sequence[str]) -> bytes:
    encoded = [part.encode("utf-8") for part in parts]
    return b"".join(len(part).to_bytes(8, "big") + part for part in encoded)


HashFunction = Callable[[tuple[str, str, str, str]], str]


def sha256_route_id(connection: tuple[str, str, str, str]) -> str:
    return sha256(_length_prefixed(connection)).hexdigest()


@dataclass(frozen=True)
class Route:
    route_id: str
    source_cell: str
    source_role: str
    target_cell: str
    target_role: str

    @property
    def connection(self) -> tuple[str, str, str, str]:
        return (self.source_cell, self.source_role, self.target_cell, self.target_role)


def route(
    source_cell: str,
    source_role: str,
    target_cell: str,
    target_role: str,
    hash_function: HashFunction = sha256_route_id,
) -> Route:
    connection = (source_cell, source_role, target_cell, target_role)
    return Route(hash_function(connection), *connection)


@dataclass(frozen=True)
class FabricSpec:
    fabric_id: str
    cells: tuple[CellDef, ...] = ()
    motifs: tuple[Motif, ...] = ()
    triad_blocks: tuple[TriadBlock, ...] = ()
    placements: tuple[Placement, ...] = ()
    routes: tuple[Route, ...] = ()


@dataclass(frozen=True)
class PlaceEdit:
    cell_id: str
    location: Location


@dataclass(frozen=True)
class MoveEdit:
    cell_id: str
    from_location: Location
    to_location: Location


@dataclass(frozen=True)
class ConnectEdit:
    source_cell: str
    source_role: str
    target_cell: str
    target_role: str


@dataclass(frozen=True)
class DisconnectEdit:
    route_id: str


FabricEdit = PlaceEdit | MoveEdit | ConnectEdit | DisconnectEdit


def _relocate_cell_membership(
    fabric: FabricSpec, cell_id: str, destination_path: tuple[str, ...]
) -> tuple[tuple[Motif, ...], tuple[TriadBlock, ...]]:
    if not destination_path:
        raise EditApplicationError("DESTINATION_CONTAINMENT_PATH_EMPTY")
    immediate = destination_path[0]
    motif_ids = {motif.motif_id for motif in fabric.motifs}
    block_ids = {block.block_id for block in fabric.triad_blocks}
    if immediate not in motif_ids and immediate not in block_ids:
        raise EditApplicationError("DESTINATION_IMMEDIATE_CONTAINER_MISSING")

    motifs = tuple(
        replace(
            motif,
            contained_ids=tuple(item for item in motif.contained_ids if item != cell_id)
            + ((cell_id,) if motif.motif_id == immediate else ()),
        )
        for motif in fabric.motifs
    )
    blocks = tuple(
        replace(
            block,
            contained_ids=tuple(item for item in block.contained_ids if item != cell_id)
            + ((cell_id,) if block.block_id == immediate else ()),
        )
        for block in fabric.triad_blocks
    )
    return motifs, blocks


def apply_edit(
    fabric: FabricSpec,
    edit: FabricEdit | None,
    hash_function: HashFunction = sha256_route_id,
) -> FabricSpec:
    """Deterministically apply a canonical edit; None is a semantic no-op."""

    if edit is None:
        return fabric
    if isinstance(edit, PlaceEdit):
        placements = [p for p in fabric.placements if p.cell_id != edit.cell_id]
        placements.append(Placement(edit.cell_id, edit.location))
        motifs, blocks = _relocate_cell_membership(fabric, edit.cell_id, edit.location.containment_path)
        return replace(fabric, placements=tuple(placements), motifs=motifs, triad_blocks=blocks)
    if isinstance(edit, MoveEdit):
        current = next((p for p in fabric.placements if p.cell_id == edit.cell_id), None)
        if current is None or current.location != edit.from_location:
            raise EditApplicationError("MOVE_FROM_LOCATION_MISMATCH")
        if edit.from_location == edit.to_location:
            return fabric
        placements = tuple(
            Placement(p.cell_id, edit.to_location) if p.cell_id == edit.cell_id else p
            for p in fabric.placements
        )
        motifs, blocks = _relocate_cell_membership(fabric, edit.cell_id, edit.to_location.containment_path)
        return replace(fabric, placements=placements, motifs=motifs, triad_blocks=blocks)
    if isinstance(edit, ConnectEdit):
        candidate = route(
            edit.source_cell,
            edit.source_role,
            edit.target_cell,
            edit.target_role,
            hash_function,
        )
        for existing in fabric.routes:
            if existing.route_id == candidate.route_id and existing.connection == candidate.connection:
                return fabric
        return replace(fabric, routes=fabric.routes + (candidate,))
    if isinstance(edit, DisconnectEdit):
        return replace(fabric, routes=tuple(r for r in fabric.routes if r.route_id != edit.route_id))
    raise EditApplicationError(f"unknown edit: {type(edit).__name__}")


def parse_text(projection: Mapping[str, Any]) -> FabricEdit:
    """Lower a structured textual projection to the one FabricEdit model."""

    return _lower_projection(projection)


def parse_visual(projection: Mapping[str, Any]) -> FabricEdit | None:
    """Lower a visual gesture projection to the same FabricEdit model."""

    if projection.get("kind") == "DRAG" and projection["from_location"] == projection["to_location"]:
        return None
    visual = dict(projection)
    aliases = {"DRAG_IN": "PLACE", "DRAG": "MOVE", "WIRE": "CONNECT", "DELETE_ROUTE": "DISCONNECT"}
    visual["kind"] = aliases.get(str(visual.get("kind")), visual.get("kind"))
    return _lower_projection(visual)


def _lower_projection(projection: Mapping[str, Any]) -> FabricEdit:
    kind = projection.get("kind")
    if kind == "PLACE":
        return PlaceEdit(str(projection["cell_id"]), projection["location"])
    if kind == "MOVE":
        return MoveEdit(
            str(projection["cell_id"]),
            projection["from_location"],
            projection["to_location"],
        )
    if kind == "CONNECT":
        return ConnectEdit(
            str(projection["source_cell"]),
            str(projection["source_role"]),
            str(projection["target_cell"]),
            str(projection["target_role"]),
        )
    if kind == "DISCONNECT":
        return DisconnectEdit(str(projection["route_id"]))
    raise FabricError(f"unknown projection kind: {kind}")


@dataclass(frozen=True)
class Verdict:
    verdict: str
    reason_code: str | None = None
    because: str | None = None

    @property
    def admitted(self) -> bool:
        return self.verdict == "IF_THEN"


def _reject(reason_code: str, because: str) -> Verdict:
    return Verdict("NO", reason_code, because)


def _identities(fabric: FabricSpec) -> tuple[dict[str, str], Verdict | None]:
    typed: list[tuple[str, str]] = [(c.cell_id, "cell") for c in fabric.cells]
    typed += [(m.motif_id, "motif") for m in fabric.motifs]
    typed += [(b.block_id, "triad_block") for b in fabric.triad_blocks]
    typed.append((fabric.fabric_id, "fabric_root"))
    ids: dict[str, str] = {}
    for identifier, kind in typed:
        if not identifier:
            return {}, _reject("IDENTITY_INTEGRITY", "stable identities MUST be non-empty")
        if identifier in ids:
            return {}, _reject("IDENTITY_INTEGRITY", "stable identities MUST be globally unique")
        ids[identifier] = kind
    return ids, None


def _containment_state(
    fabric: FabricSpec, ids: Mapping[str, str]
) -> tuple[dict[str, str], Verdict | None]:
    parent: dict[str, str] = {}
    edges: list[tuple[str, str]] = []
    for motif in fabric.motifs:
        edges.extend((child, motif.motif_id) for child in motif.contained_ids)
    for block in fabric.triad_blocks:
        edges.extend((child, block.block_id) for child in block.contained_ids)
        edges.append((block.block_id, fabric.fabric_id))

    for child, container in edges:
        if child not in ids or child == fabric.fabric_id:
            return {}, _reject("CONTAINMENT_UNKNOWN_NODE", "every containment edge MUST reference existing non-root nodes")
        if container not in ids:
            return {}, _reject("CONTAINMENT_UNKNOWN_NODE", "every containment container MUST exist")
        if child in parent and parent[child] != container:
            return {}, _reject("CONTAINMENT_AMBIGUOUS", "every contained node MUST have one immediate container")
        parent[child] = container

    for start in ids:
        if start == fabric.fabric_id:
            continue
        seen: set[str] = set()
        node = start
        while node != fabric.fabric_id:
            if node in seen:
                return {}, _reject("CONTAINMENT_CYCLE", "containment MUST be acyclic")
            seen.add(node)
            if node not in parent:
                return {}, _reject("CONTAINMENT_NOT_ROOT_TERMINATED", "containment MUST be root-terminated")
            node = parent[node]
    return parent, None


def containment_path(fabric: FabricSpec, node_id: str) -> tuple[str, ...]:
    ids, error = _identities(fabric)
    if error:
        raise FabricError(error.reason_code or "IDENTITY_INTEGRITY")
    parent, error = _containment_state(fabric, ids)
    if error:
        raise FabricError(error.reason_code or "INVALID_CONTAINMENT")
    if node_id == fabric.fabric_id:
        return ()
    if node_id not in ids:
        raise FabricError(f"unknown node: {node_id}")
    path: list[str] = []
    node = node_id
    while node != fabric.fabric_id:
        node = parent[node]
        path.append(node)
    return tuple(path)


def containment_graph(fabric: FabricSpec) -> dict[str, str]:
    """Derive the unambiguous child-to-parent containment graph."""

    ids, error = _identities(fabric)
    if error:
        raise FabricError(error.reason_code or "IDENTITY_INTEGRITY")
    parent, error = _containment_state(fabric, ids)
    if error:
        raise FabricError(error.reason_code or "INVALID_CONTAINMENT")
    return dict(sorted(parent.items()))


def normalize_containment(fabric: FabricSpec) -> dict[str, tuple[str, ...]]:
    """Recursively normalize unordered membership at every finite depth.

    The returned mapping is a derived normalization aid.  The canonical
    FabricSpec continues to store only motif/block primitive membership.
    """

    ids, error = _identities(fabric)
    if error:
        raise NormalizationError(error.reason_code or "IDENTITY_INTEGRITY")
    _parent, error = _containment_state(fabric, ids)
    if error:
        raise NormalizationError(error.reason_code or "INVALID_CONTAINMENT")

    children: dict[str, list[str]] = {identifier: [] for identifier in ids}
    for motif in fabric.motifs:
        children[motif.motif_id].extend(motif.contained_ids)
    for block in fabric.triad_blocks:
        children[block.block_id].extend(block.contained_ids)
        children[fabric.fabric_id].append(block.block_id)

    normalized: dict[str, tuple[str, ...]] = {}

    def visit(node_id: str) -> None:
        ordered = tuple(sorted(children[node_id], key=lambda child: _child_key(child, ids)))
        normalized[node_id] = ordered
        for child in ordered:
            if ids[child] in {"motif", "triad_block"}:
                visit(child)

    visit(fabric.fabric_id)
    return normalized


def drc(fabric: FabricSpec, hash_function: HashFunction = sha256_route_id) -> Verdict:
    """Execute deterministic static design-rule checks in normative order."""

    ids, error = _identities(fabric)
    if error:
        return error

    cells = {cell.cell_id: cell for cell in fabric.cells}
    for cell in fabric.cells:
        try:
            role_schema(cell.operator)
            expected_payload = witness_type(cell.witness, RESULT)
        except FabricError as exc:
            return _reject("CELL_DEFINITION_INVALID", str(exc))
        if cell.payload_slot_type != expected_payload:
            return _reject("PAYLOAD_SLOT_TYPE_MISMATCH", "payload_slot_type MUST agree with WITNESS_BINDING")
        if not cell.triad_capability or any(dim not in TRIAD_DIMENSIONS for dim in cell.triad_capability):
            return _reject("TRIAD_CAPABILITY_INVALID", "triad_capability MUST be a non-empty TRIAD subset")

    parent, error = _containment_state(fabric, ids)
    if error:
        return error

    placement_by_cell: dict[str, Placement] = {}
    for placement in fabric.placements:
        if placement.cell_id not in cells:
            return _reject("PLACEMENT_ENDPOINT_MISSING", "every placement cell MUST exist")
        if placement.cell_id in placement_by_cell:
            return _reject("PLACEMENT_AMBIGUOUS", "every cell MUST have exactly one LOCATION")
        placement_by_cell[placement.cell_id] = placement
        position = placement.location.triad_position
        if position.kind == "INTERIOR":
            if position.source not in TRIAD_DIMENSIONS or position.target is not None:
                return _reject("TRIAD_POSITION_INVALID", "INTERIOR MUST contain exactly one TRIAD dimension")
            if position.source not in cells[placement.cell_id].triad_capability:
                return _reject("PLACEMENT_CAPABILITY_INTERIOR", f"{position.source} MUST belong to triad_capability")
        elif position.kind == "BOUNDARY":
            if (
                position.source not in TRIAD_DIMENSIONS
                or position.target not in TRIAD_DIMENSIONS
                or position.source == position.target
            ):
                return _reject("TRIAD_POSITION_INVALID", "BOUNDARY MUST contain two distinct directed dimensions")
            needed = {position.source, position.target}
            if not needed.issubset(set(cells[placement.cell_id].triad_capability)):
                return _reject("PLACEMENT_CAPABILITY_BOUNDARY", "both directed boundary dimensions MUST belong to triad_capability")
        else:
            return _reject("TRIAD_POSITION_INVALID", "triad_position MUST be INTERIOR or BOUNDARY")

        if not placement.location.containment_path or placement.location.containment_path[-1] != fabric.fabric_id:
            return _reject("CONTAINMENT_NOT_ROOT_TERMINATED", "containment_path MUST terminate at fabric_root")
        derived: list[str] = []
        node = placement.cell_id
        while node != fabric.fabric_id:
            node = parent[node]
            derived.append(node)
        if tuple(derived) != placement.location.containment_path:
            return _reject("CONTAINMENT_PATH_MISMATCH", "LOCATION containment_path MUST agree with containment membership")

    if set(placement_by_cell) != set(cells):
        return _reject("PLACEMENT_MISSING", "every cell MUST have exactly one LOCATION")

    route_ids: dict[str, tuple[str, str, str, str]] = {}
    connections: set[tuple[str, str, str, str]] = set()
    for item in fabric.routes:
        if item.source_cell not in cells or item.target_cell not in cells:
            return _reject("ROUTE_ENDPOINT_MISSING", "every route endpoint MUST exist")
        expected_id = hash_function(item.connection)
        if item.route_id != expected_id:
            return _reject("ROUTE_ID_MALFORMED", "route_id MUST be derived from the canonical connection tuple")
        if item.route_id in route_ids and route_ids[item.route_id] != item.connection:
            return _reject(
                "ROUTE_ID_COLLISION",
                "NOT-SAME connection tuples CANNOT share semantic route identity",
            )
        if item.connection in connections:
            return _reject("PARALLEL_ROUTE", "parallel edges are prohibited in v0.1.0")
        route_ids[item.route_id] = item.connection
        connections.add(item.connection)

        if item.source_role != RESULT:
            return _reject("PORT_DIRECTION_INCOMPATIBLE", "route source MUST be RESULT/OUT")
        target_roles = {role for role, _ in role_schema(cells[item.target_cell].operator)}
        if item.target_role not in target_roles:
            return _reject(
                "TARGET_ROLE_INVALID",
                f"{item.target_role} MUST belong to ROLE_SCHEMA({cells[item.target_cell].operator})",
            )
        source_type = witness_type(cells[item.source_cell].witness, item.source_role)
        target_type = witness_type(cells[item.target_cell].witness, item.target_role)
        if not type_compat(source_type, target_type):
            return _reject(
                "PAYLOAD_TYPE_INCOMPATIBLE",
                "TYPE_COMPAT requires exact symbolic WITNESS_TYPE equality; "
                f"WITNESS_TYPE({cells[item.source_cell].witness}, {item.source_role})={source_type} "
                "NOT-SAME "
                f"WITNESS_TYPE({cells[item.target_cell].witness}, {item.target_role})={target_type}",
            )

    incoming: dict[str, list[Route]] = {}
    for item in fabric.routes:
        incoming.setdefault(item.target_cell, []).append(item)
    for target_id in sorted(incoming):
        expected = dict(role_schema(cells[target_id].operator))
        counts: dict[str, int] = {}
        for item in incoming[target_id]:
            counts[item.target_role] = counts.get(item.target_role, 0) + 1
        if set(counts) != set(expected):
            actual_shape = ", ".join(
                f"{role}[{counts.get(role, 0)}]" for role in expected
            )
            expected_shape = ", ".join(
                f"{role}[{'1' if multiplicity == EXACTLY_ONE else MANY}]"
                for role, multiplicity in expected.items()
            )
            return _reject(
                "JOIN_ROLE_SHAPE_VIOLATION",
                f"actual role shape {actual_shape} NOT-SAME expected {expected_shape}",
            )
        for role, multiplicity in expected.items():
            count = counts[role]
            if multiplicity == EXACTLY_ONE and count != 1:
                return _reject(
                    "JOIN_MULTIPLICITY_VIOLATION",
                    f"actual {role} multiplicity = {count}; expected EXACTLY_ONE",
                )
            if multiplicity == MANY and count < 1:
                return _reject("JOIN_MULTIPLICITY_VIOLATION", f"actual {role} multiplicity MUST be non-empty MANY")

    return Verdict("IF_THEN", "ADMITTED", None)


def _child_key(identifier: str, ids: Mapping[str, str]) -> tuple[int, str]:
    return (_TYPE_ORDER[ids[identifier]], identifier)


def normalize(fabric: FabricSpec, hash_function: HashFunction = sha256_route_id) -> dict[str, Any]:
    """Return deterministic canonical primitive state, rejecting invalid input."""

    verdict = drc(fabric, hash_function)
    if not verdict.admitted:
        raise NormalizationError(f"{verdict.reason_code}: {verdict.because}")
    membership = normalize_containment(fabric)
    canonical_paths = {cell.cell_id: containment_path(fabric, cell.cell_id) for cell in fabric.cells}
    placements = {p.cell_id: p for p in fabric.placements}
    return {
        "fabric_id": fabric.fabric_id,
        "cells": [
            {
                "cell_id": cell.cell_id,
                "operator": cell.operator,
                "witness": cell.witness,
                "payload_slot_type": cell.payload_slot_type,
                "triad_capability": list(sorted(cell.triad_capability, key=TRIAD_DIMENSIONS.index)),
            }
            for cell in sorted(fabric.cells, key=lambda item: item.cell_id)
        ],
        "motifs": [
            {
                "motif_id": motif.motif_id,
                "contained_ids": list(membership[motif.motif_id]),
            }
            for motif in sorted(fabric.motifs, key=lambda item: item.motif_id)
        ],
        "triad_blocks": [
            {
                "block_id": block.block_id,
                "contained_ids": list(membership[block.block_id]),
            }
            for block in sorted(fabric.triad_blocks, key=lambda item: item.block_id)
        ],
        "placements": [
            {
                "cell_id": cell_id,
                "location": {
                    "triad_position": placements[cell_id].location.triad_position.canonical(),
                    "containment_path": list(canonical_paths[cell_id]),
                },
            }
            for cell_id in sorted(placements)
        ],
        "routes": [
            {
                "route_id": item.route_id,
                "source_cell": item.source_cell,
                "source_role": item.source_role,
                "target_cell": item.target_cell,
                "target_role": item.target_role,
            }
            for item in sorted(fabric.routes, key=lambda r: (r.route_id, r.connection))
        ],
    }


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def canonical_digest(value: Any) -> str:
    return sha256(canonical_json(value).encode("utf-8")).hexdigest()


def same_fabric(left: FabricSpec, right: FabricSpec) -> bool:
    return normalize(left) == normalize(right)


def adjacency(fabric: FabricSpec) -> dict[str, tuple[str, ...]]:
    result: dict[str, set[str]] = {cell.cell_id: set() for cell in fabric.cells}
    for item in fabric.routes:
        result[item.source_cell].add(item.target_cell)
        result[item.target_cell].add(item.source_cell)
    return {key: tuple(sorted(value)) for key, value in sorted(result.items())}


def neighborhood(fabric: FabricSpec, cell_id: str) -> tuple[str, ...]:
    placements = {p.cell_id: p.location.containment_path for p in fabric.placements}
    scope = placements[cell_id]
    return tuple(other for other in adjacency(fabric)[cell_id] if placements[other] == scope)


def triad_transition(fabric: FabricSpec, item: Route) -> tuple[str, str]:
    """Derive TRIAD_transition from endpoint placements; never store it."""

    placements = {p.cell_id: p.location.triad_position for p in fabric.placements}

    def region(position: TriadPosition) -> str:
        if position.kind == "INTERIOR":
            return position.source
        return f"BOUNDARY({position.source},{position.target})"

    return (region(placements[item.source_cell]), region(placements[item.target_cell]))


def triad_membership(fabric: FabricSpec, cell_id: str) -> str | tuple[str, str]:
    """Derive TRIAD membership from placement."""

    position = next(p.location.triad_position for p in fabric.placements if p.cell_id == cell_id)
    if position.kind == "INTERIOR":
        return position.source
    return (position.source, str(position.target))


def boundary_relation(fabric: FabricSpec, cell_id: str) -> tuple[str, str] | None:
    """Derive the directed boundary relation from triad_position."""

    position = next(p.location.triad_position for p in fabric.placements if p.cell_id == cell_id)
    if position.kind != "BOUNDARY":
        return None
    return (position.source, str(position.target))


def primitive_dict(fabric: FabricSpec) -> dict[str, Any]:
    """Serialize primitive input without validating it (for input receipts)."""

    def location_dict(value: Location) -> dict[str, Any]:
        return {
            "triad_position": value.triad_position.canonical(),
            "containment_path": list(value.containment_path),
        }

    return {
        "fabric_id": fabric.fabric_id,
        "cells": [
            {
                "cell_id": c.cell_id,
                "operator": c.operator,
                "witness": c.witness,
                "payload_slot_type": c.payload_slot_type,
                "triad_capability": list(c.triad_capability),
            }
            for c in fabric.cells
        ],
        "motifs": [{"motif_id": m.motif_id, "contained_ids": list(m.contained_ids)} for m in fabric.motifs],
        "triad_blocks": [
            {"block_id": b.block_id, "contained_ids": list(b.contained_ids)} for b in fabric.triad_blocks
        ],
        "placements": [
            {"cell_id": p.cell_id, "location": location_dict(p.location)} for p in fabric.placements
        ],
        "routes": [
            {
                "route_id": r.route_id,
                "source_cell": r.source_cell,
                "source_role": r.source_role,
                "target_cell": r.target_cell,
                "target_role": r.target_role,
            }
            for r in fabric.routes
        ],
    }


def edit_dict(edit: FabricEdit | None) -> dict[str, Any] | None:
    if edit is None:
        return None

    def loc(value: Location) -> dict[str, Any]:
        return {
            "triad_position": value.triad_position.canonical(),
            "containment_path": list(value.containment_path),
        }

    if isinstance(edit, PlaceEdit):
        return {"kind": "PLACE", "cell_id": edit.cell_id, "location": loc(edit.location)}
    if isinstance(edit, MoveEdit):
        return {
            "kind": "MOVE",
            "cell_id": edit.cell_id,
            "from_location": loc(edit.from_location),
            "to_location": loc(edit.to_location),
        }
    if isinstance(edit, ConnectEdit):
        return {
            "kind": "CONNECT",
            "source_cell": edit.source_cell,
            "source_role": edit.source_role,
            "target_cell": edit.target_cell,
            "target_role": edit.target_role,
        }
    return {"kind": "DISCONNECT", "route_id": edit.route_id}
