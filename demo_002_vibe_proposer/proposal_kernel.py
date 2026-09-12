#!/usr/bin/env python3
"""Typed, non-authoritative proposal layer for DEMO-002.

This module imports DEMO-001 and the V3.1/V3.2/V3.3 kernels unchanged.  It
owns proposal state and history, never the authority semantics it invokes.
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import re
import sys
from typing import Any, Iterable, Mapping, Protocol


HERE = Path(__file__).resolve().parent
DEMO_001_PATH = HERE.parent / "demo_001_visible_fabric" / "demo_adapter.py"
_DEMO_001_SPEC = importlib.util.spec_from_file_location(
    "mal_fabric_demo_001_adapter", DEMO_001_PATH
)
if _DEMO_001_SPEC is None or _DEMO_001_SPEC.loader is None:
    raise RuntimeError("DEMO_001_IMPORT_UNAVAILABLE")
demo1 = importlib.util.module_from_spec(_DEMO_001_SPEC)
sys.modules["mal_fabric_demo_001_adapter"] = demo1
_DEMO_001_SPEC.loader.exec_module(demo1)

v31 = demo1.v31
v32 = demo1.v32
v33 = demo1.v33

PROPOSAL_READY = "PROPOSAL_READY"
PROPOSAL_PARSE_MAYBE = "PROPOSAL_PARSE_MAYBE"
PROPOSAL_PARSE_NO = "PROPOSAL_PARSE_NO"

PROPOSED = "PROPOSED"
ACCEPTED_FOR_ADMISSION = "ACCEPTED_FOR_ADMISSION"
SUPERSEDED = "SUPERSEDED"
REJECTED = "REJECTED"
STALE = "STALE"
COMMITTED = "COMMITTED"
GOVERNANCE_MAYBE = "GOVERNANCE_MAYBE"
GOVERNANCE_NO = "GOVERNANCE_NO"
GOVERNANCE_NOT_SAME = "GOVERNANCE_NOT_SAME"

TERMINAL_PROPOSAL_STATES = {
    SUPERSEDED,
    REJECTED,
    STALE,
    COMMITTED,
    GOVERNANCE_MAYBE,
    GOVERNANCE_NO,
    GOVERNANCE_NOT_SAME,
}

SUPPORTED_AFFORDANCES = ("PLACE", "MOVE", "CONNECT", "DISCONNECT")
V0_4_0_DOI = "10.5281/zenodo.22718622"


def _jsonable(value: Any) -> Any:
    if hasattr(value, "canonical") and callable(value.canonical):
        return _jsonable(value.canonical())
    if isinstance(value, Mapping):
        return {str(key): _jsonable(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [_jsonable(item) for item in value]
    if hasattr(value, "raw"):
        return {"raw": value.raw}
    return value


def canonical_json(value: Any, *, pretty: bool = False) -> str:
    return json.dumps(
        _jsonable(value),
        ensure_ascii=False,
        sort_keys=True,
        separators=None if pretty else (",", ":"),
        indent=2 if pretty else None,
    )


def canonical_digest(value: Any) -> str:
    return sha256(canonical_json(value).encode("utf-8")).hexdigest()


def fabric_digest(fabric: Any) -> str:
    return v31.canonical_digest(v31.normalize(fabric))


def route_id(source: str, target: str, role: str) -> str:
    return v31.sha256_route_id((source, v31.RESULT, target, role))


@dataclass(frozen=True)
class IntentRequest:
    natural_language_text: str
    current_fabric_digest: str

    @property
    def request_ref(self) -> str:
        return canonical_digest(
            {
                "natural_language_text": self.natural_language_text,
                "current_fabric_digest": self.current_fabric_digest,
            }
        )

    def canonical(self) -> dict[str, Any]:
        return {
            "natural_language_text": self.natural_language_text,
            "current_fabric_digest": self.current_fabric_digest,
            "request_ref": self.request_ref,
        }


@dataclass(frozen=True)
class ProposalContext:
    """Immutable, bounded projection with no FabricSpec or authority handle."""

    fabric_digest: str
    cells: tuple[tuple[str, str, str], ...]
    locations: tuple[tuple[str, str, str], ...]
    ports: tuple[tuple[str, str, str, str, str], ...]
    routes: tuple[tuple[str, str, str, str, str], ...]
    supported_edit_affordances: tuple[str, ...] = SUPPORTED_AFFORDANCES

    def canonical(self) -> dict[str, Any]:
        return {
            "fabric_digest": self.fabric_digest,
            "cells": [list(item) for item in self.cells],
            "locations": [list(item) for item in self.locations],
            "ports": [list(item) for item in self.ports],
            "routes": [list(item) for item in self.routes],
            "supported_edit_affordances": list(self.supported_edit_affordances),
        }

    @property
    def digest(self) -> str:
        return canonical_digest(self.canonical())


def project_context(fabric: Any) -> ProposalContext:
    placements = {item.cell_id: item.location for item in fabric.placements}
    cells = tuple(
        (cell.cell_id, cell.operator, cell.witness)
        for cell in sorted(fabric.cells, key=lambda item: item.cell_id)
    )
    locations_list = []
    for cell_id, placement in sorted(placements.items()):
        triad = placement.triad_position.canonical()
        region = triad["dimension"] if triad["kind"] == "INTERIOR" else f"{triad['source']}→{triad['target']}"
        locations_list.append((cell_id, region, "/".join(placement.containment_path)))
    locations = tuple(locations_list)
    ports = tuple(
        (cell.cell_id, role, direction, multiplicity, payload_type)
        for cell in sorted(fabric.cells, key=lambda item: item.cell_id)
        for role, direction, multiplicity, payload_type in v31.port_schema(cell.operator, cell.witness)
    )
    routes = tuple(
        (route.route_id, route.source_cell, route.source_role, route.target_cell, route.target_role)
        for route in sorted(fabric.routes, key=lambda item: item.route_id)
    )
    return ProposalContext(fabric_digest(fabric), cells, locations, ports, routes)


@dataclass(frozen=True)
class ProposalAST:
    intent_kind: str
    arguments: tuple[tuple[str, str], ...]

    def canonical(self) -> dict[str, Any]:
        return {"intent_kind": self.intent_kind, "arguments": [list(item) for item in self.arguments]}


@dataclass(frozen=True)
class IntentProposal:
    proposal_id: str
    parent_proposal_id: str | None
    request_ref: str
    baseline_fabric_digest: str
    source_intent: str
    normalized_intent: str
    proposal_ast: ProposalAST
    proposed_edits: tuple[Any, ...]
    candidate_fabric_digest: str
    proposer_explanation: str
    genealogy: tuple[str, ...]
    proposer_receipt: str

    def identity_payload(self) -> dict[str, Any]:
        """Canonical identity deliberately excludes prose and raw phrasing."""

        return {
            "parent_proposal_id": self.parent_proposal_id,
            "baseline_fabric_digest": self.baseline_fabric_digest,
            "normalized_intent": self.normalized_intent,
            "proposal_ast": self.proposal_ast.canonical(),
            "proposed_edits": [v31.edit_dict(item) for item in self.proposed_edits],
            "candidate_fabric_digest": self.candidate_fabric_digest,
        }

    def canonical(self) -> dict[str, Any]:
        return {
            "proposal_id": self.proposal_id,
            "parent_proposal_id": self.parent_proposal_id,
            "request_ref": self.request_ref,
            "baseline_fabric_digest": self.baseline_fabric_digest,
            "source_intent": self.source_intent,
            "normalized_intent": self.normalized_intent,
            "proposal_ast": self.proposal_ast.canonical(),
            "proposed_edits": [v31.edit_dict(item) for item in self.proposed_edits],
            "candidate_fabric_digest": self.candidate_fabric_digest,
            "proposer_explanation": self.proposer_explanation,
            "genealogy": list(self.genealogy),
            "proposer_receipt": self.proposer_receipt,
            "authority": "NONE",
        }


@dataclass(frozen=True)
class ProposalParseResult:
    status: str
    proposal: IntentProposal | None = None
    needed: tuple[str, ...] = ()
    reason: str | None = None

    def canonical(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "proposal": self.proposal.canonical() if self.proposal else None,
            "needed": list(self.needed),
            "reason": self.reason,
        }


@dataclass(frozen=True)
class GeometricDiff:
    proposal_id: str
    baseline_fabric_digest: str
    candidate_fabric_digest: str
    added_cells: tuple[dict[str, Any], ...]
    removed_cells: tuple[dict[str, Any], ...]
    moved_cells: tuple[dict[str, Any], ...]
    added_routes: tuple[dict[str, Any], ...]
    removed_routes: tuple[dict[str, Any], ...]
    triad_changes: tuple[dict[str, Any], ...]
    unchanged_context: tuple[str, ...]
    origin_trace: tuple[tuple[str, dict[str, Any]], ...]

    def semantic_delta(self) -> dict[str, Any]:
        return {
            "added_cells": list(self.added_cells),
            "removed_cells": list(self.removed_cells),
            "moved_cells": list(self.moved_cells),
            "added_routes": list(self.added_routes),
            "removed_routes": list(self.removed_routes),
            "triad_changes": list(self.triad_changes),
        }

    @property
    def diff_id(self) -> str:
        return canonical_digest(
            {
                "proposal_id": self.proposal_id,
                "baseline_fabric_digest": self.baseline_fabric_digest,
                "candidate_fabric_digest": self.candidate_fabric_digest,
                "semantic_delta": self.semantic_delta(),
            }
        )

    def canonical(self) -> dict[str, Any]:
        return {
            "diff_id": self.diff_id,
            "proposal_id": self.proposal_id,
            "baseline_fabric_digest": self.baseline_fabric_digest,
            "candidate_fabric_digest": self.candidate_fabric_digest,
            **self.semantic_delta(),
            "unchanged_context": list(self.unchanged_context),
            "origin_trace": {key: value for key, value in self.origin_trace},
        }


def _cell_map(fabric: Any) -> dict[str, Any]:
    return {item.cell_id: item for item in fabric.cells}


def _placement_map(fabric: Any) -> dict[str, Any]:
    return {item.cell_id: item.location for item in fabric.placements}


def _route_dict(route: Any) -> dict[str, Any]:
    return {
        "route_id": route.route_id,
        "source_cell": route.source_cell,
        "source_role": route.source_role,
        "target_cell": route.target_cell,
        "target_role": route.target_role,
    }


def derive_geometric_diff(
    proposal_id: str,
    baseline: Any,
    candidate: Any,
    edits: Iterable[Any],
) -> GeometricDiff:
    baseline_cells = _cell_map(baseline)
    candidate_cells = _cell_map(candidate)
    baseline_placements = _placement_map(baseline)
    candidate_placements = _placement_map(candidate)
    baseline_routes = {item.route_id: item for item in baseline.routes}
    candidate_routes = {item.route_id: item for item in candidate.routes}

    added_cell_ids = sorted(set(candidate_cells) - set(baseline_cells))
    removed_cell_ids = sorted(set(baseline_cells) - set(candidate_cells))
    common_cells = sorted(set(baseline_cells) & set(candidate_cells))
    moved: list[dict[str, Any]] = []
    triad: list[dict[str, Any]] = []
    for cell_id in common_cells:
        before = baseline_placements.get(cell_id)
        after = candidate_placements.get(cell_id)
        if before != after:
            item = {
                "cell_id": cell_id,
                "from": demo1.canonical_location(before) if before else None,
                "to": demo1.canonical_location(after) if after else None,
            }
            moved.append(item)
            before_triad = before.triad_position.canonical() if before else None
            after_triad = after.triad_position.canonical() if after else None
            if before_triad != after_triad:
                triad.append({"cell_id": cell_id, "from": before_triad, "to": after_triad})

    added_route_ids = sorted(set(candidate_routes) - set(baseline_routes))
    removed_route_ids = sorted(set(baseline_routes) - set(candidate_routes))
    unchanged = tuple(
        [f"cell:{item}" for item in common_cells if baseline_placements.get(item) == candidate_placements.get(item)]
        + [f"route:{item}" for item in sorted(set(baseline_routes) & set(candidate_routes))]
    )

    edit_items = [v31.edit_dict(item) for item in edits]
    trace: dict[str, dict[str, Any]] = {}
    for edit in edit_items:
        if edit["kind"] == "CONNECT":
            trace[f"route:{route_id(edit['source_cell'], edit['target_cell'], edit['target_role'])}"] = edit
        elif edit["kind"] == "DISCONNECT":
            trace[f"route:{edit['route_id']}"] = edit
        elif edit["kind"] in ("PLACE", "MOVE"):
            trace[f"cell:{edit['cell_id']}"] = edit

    return GeometricDiff(
        proposal_id=proposal_id,
        baseline_fabric_digest=fabric_digest(baseline),
        candidate_fabric_digest=fabric_digest(candidate),
        added_cells=tuple(_jsonable(candidate_cells[item].__dict__) for item in added_cell_ids),
        removed_cells=tuple(_jsonable(baseline_cells[item].__dict__) for item in removed_cell_ids),
        moved_cells=tuple(moved),
        added_routes=tuple(_route_dict(candidate_routes[item]) for item in added_route_ids),
        removed_routes=tuple(_route_dict(baseline_routes[item]) for item in removed_route_ids),
        triad_changes=tuple(triad),
        unchanged_context=unchanged,
        origin_trace=tuple((key, trace[key]) for key in sorted(trace)),
    )


def apply_sequence(baseline: Any, edits: Iterable[Any]) -> Any:
    current = baseline
    for edit in edits:
        current = v31.apply_edit(current, edit)
    return current


def normalize_intent(text: str) -> tuple[str | None, ProposalAST | None, tuple[str, ...]]:
    words = tuple(re.findall(r"[a-z0-9]+", text.lower().replace("_", " ")))
    token_set = set(words)
    if not words:
        return None, None, ("supported behavior request",)
    if "connect" in token_set and "disconnect" in token_set:
        return None, None, ("choose connect or disconnect",)

    approach = {"enemy", "approach", "player", "near"} <= token_set
    flee = {"enemy", "flee", "health", "low"} <= token_set
    disconnect_patrol = "disconnect" in token_set and "patrol" in token_set and (
        "consequence" in token_set or "action" in token_set or "bus" in token_set
    )
    move_health = (
        "move" in token_set
        and "health" in token_set
        and "low" in token_set
        and ("functional" in token_set or "function" in token_set)
    )
    matches = [approach or flee, disconnect_patrol, move_health]
    if sum(bool(item) for item in matches) != 1:
        return None, None, (
            "one supported conditional, disconnect, or semantic move intent",
        )
    if approach or flee:
        if approach and flee:
            kind = "APPROACH_AND_FLEE"
            normalized = "when player near approach enemy; when health low flee enemy"
            args = (("approach", "player_near"), ("flee", "health_low"))
        elif approach:
            kind = "APPROACH_WHEN_PLAYER_NEAR"
            normalized = "when player near approach enemy"
            args = (("action", "enemy_approach"), ("condition", "player_near"))
        else:
            kind = "FLEE_WHEN_HEALTH_LOW"
            normalized = "when health low flee enemy"
            args = (("action", "enemy_flee"), ("condition", "health_low"))
    elif disconnect_patrol:
        kind = "DISCONNECT_PATROL_CONSEQUENCE"
        normalized = "disconnect patrol consequence"
        args = (("source", "patrol"), ("target", "action_bus"))
    else:
        kind = "MOVE_HEALTH_LOW_TO_FUNCTIONAL"
        normalized = "move health low branch to functional region"
        args = (("cell", "health_low"), ("region", "□F"))
    return normalized, ProposalAST(kind, args), ()


def edits_for_ast(ast: ProposalAST, context: ProposalContext) -> tuple[Any, ...]:
    """Lower typed syntax using only the bounded read-only projection."""

    existing_routes = {item[0] for item in context.routes}
    regions = {cell_id: region for cell_id, region, _path in context.locations}
    edits: list[Any] = []
    if ast.intent_kind in ("APPROACH_WHEN_PLAYER_NEAR", "APPROACH_AND_FLEE"):
        rid = route_id("enemy_approach", "action_bus", "MEMBER")
        if rid not in existing_routes:
            edits.append(v31.ConnectEdit("enemy_approach", v31.RESULT, "action_bus", "MEMBER"))
    if ast.intent_kind in ("FLEE_WHEN_HEALTH_LOW", "APPROACH_AND_FLEE"):
        rid = route_id("enemy_flee", "action_bus", "MEMBER")
        if rid not in existing_routes:
            edits.append(v31.ConnectEdit("enemy_flee", v31.RESULT, "action_bus", "MEMBER"))
    if ast.intent_kind == "DISCONNECT_PATROL_CONSEQUENCE":
        rid = route_id("patrol", "action_bus", "MEMBER")
        if rid in existing_routes:
            edits.append(v31.DisconnectEdit(rid))
    if ast.intent_kind == "MOVE_HEALTH_LOW_TO_FUNCTIONAL":
        before = demo1.location(regions["health_low"])
        after = demo1.location("□F")
        if before != after:
            edits.append(v31.MoveEdit("health_low", before, after))
    return tuple(edits)


def _build_proposal(
    request: IntentRequest,
    context: ProposalContext,
    baseline: Any,
    normalized_intent: str,
    ast: ProposalAST,
    edits: tuple[Any, ...],
    explanation: str,
    parent_proposal_id: str | None = None,
) -> tuple[IntentProposal, Any]:
    if request.current_fabric_digest != context.fabric_digest:
        raise ValueError("REQUEST_CONTEXT_BASELINE_MISMATCH")
    candidate = apply_sequence(baseline, edits)
    candidate_digest = fabric_digest(candidate)
    identity_payload = {
        "parent_proposal_id": parent_proposal_id,
        "baseline_fabric_digest": request.current_fabric_digest,
        "normalized_intent": normalized_intent,
        "proposal_ast": ast.canonical(),
        "proposed_edits": [v31.edit_dict(item) for item in edits],
        "candidate_fabric_digest": candidate_digest,
    }
    proposal_id = canonical_digest(identity_payload)
    ast_digest = canonical_digest(ast.canonical())
    edits_digest = canonical_digest(identity_payload["proposed_edits"])
    genealogy = (
        f"request:{request.request_ref}",
        f"normalized:{normalized_intent}",
        f"ast:{ast_digest}",
        f"edits:{edits_digest}",
    )
    receipt = canonical_digest(
        {
            "request_ref": request.request_ref,
            "context_digest": context.digest,
            "baseline_fabric_digest": request.current_fabric_digest,
            "normalized_intent": normalized_intent,
            "proposal_ast_digest": ast_digest,
            "fabric_edit_ast_digest": edits_digest,
            "proposal_id": proposal_id,
            "candidate_fabric_digest": candidate_digest,
        }
    )
    return (
        IntentProposal(
            proposal_id,
            parent_proposal_id,
            request.request_ref,
            request.current_fabric_digest,
            request.natural_language_text,
            normalized_intent,
            ast,
            edits,
            candidate_digest,
            explanation,
            genealogy,
            receipt,
        ),
        candidate,
    )


@dataclass(frozen=True)
class ParsedProposalSyntax:
    normalized_intent: str
    proposal_ast: ProposalAST
    proposed_edits: tuple[Any, ...]
    proposer_explanation: str


class ProposerBackend(Protocol):
    """Provider-neutral parser boundary; implementations receive no fabric handle."""

    backend_name: str

    def parse(
        self,
        request: IntentRequest,
        context: ProposalContext,
    ) -> ParsedProposalSyntax | ProposalParseResult: ...


class DeterministicGrammar:
    backend_name = "DETERMINISTIC_GRAMMAR"

    def parse(
        self,
        request: IntentRequest,
        context: ProposalContext,
    ) -> ParsedProposalSyntax | ProposalParseResult:
        normalized, ast, needed = normalize_intent(request.natural_language_text)
        if normalized is None or ast is None:
            return ProposalParseResult(PROPOSAL_PARSE_MAYBE, needed=needed)
        edits = edits_for_ast(ast, context)
        explanation = {
            "APPROACH_AND_FLEE": "Add both governed action routes to the action bus.",
            "APPROACH_WHEN_PLAYER_NEAR": "Add the approach action route to the action bus.",
            "FLEE_WHEN_HEALTH_LOW": "Add the flee action route to the action bus.",
            "DISCONNECT_PATROL_CONSEQUENCE": "Remove the patrol action route from the action bus.",
            "MOVE_HEALTH_LOW_TO_FUNCTIONAL": "Move health_low from □S to the functional □F region.",
        }[ast.intent_kind]
        return ParsedProposalSyntax(normalized, ast, edits, explanation)


@dataclass(frozen=True)
class ProposalHistoryRecord:
    proposal_seq: int
    proposal_id: str
    parent_proposal_id: str | None
    request_ref: str
    baseline_fabric_digest: str
    candidate_fabric_digest: str | None
    disposition: str | None = None
    admission_outcome: str | None = None
    commit_identity: str | None = None

    def canonical(self) -> dict[str, Any]:
        return {
            "proposal_seq": self.proposal_seq,
            "proposal_id": self.proposal_id,
            "parent_proposal_id": self.parent_proposal_id,
            "request_ref": self.request_ref,
            "baseline_fabric_digest": self.baseline_fabric_digest,
            "candidate_fabric_digest": self.candidate_fabric_digest,
            "disposition": self.disposition,
            "admission_outcome": self.admission_outcome,
            "commit_identity": self.commit_identity,
        }


@dataclass
class ProposalEnvelope:
    proposal: IntentProposal
    baseline: Any
    candidate: Any
    diff: GeometricDiff
    status: str = PROPOSED
    admission_receipts: tuple[dict[str, Any], ...] = ()


class VibeSession:
    """Session controller preserving PROPOSE ≠ ACCEPT ≠ ADMIT/COMMIT."""

    def __init__(self, session: Any | None = None, backend: ProposerBackend | None = None) -> None:
        self.base = session if session is not None else demo1.DemoSession()
        self.backend = backend if backend is not None else DeterministicGrammar()
        self.current: ProposalEnvelope | None = None
        self.history: list[ProposalHistoryRecord] = []
        self.last_parse = ProposalParseResult(PROPOSAL_PARSE_MAYBE, needed=("intent",))
        self.last_event = "READY"

    @property
    def current_fabric_digest(self) -> str:
        return fabric_digest(self.base.fabric)

    def reset(self) -> dict[str, Any]:
        self.__init__()
        return self.view()

    def _append_history(self, proposal: IntentProposal) -> None:
        self.history.append(
            ProposalHistoryRecord(
                len(self.history),
                proposal.proposal_id,
                proposal.parent_proposal_id,
                proposal.request_ref,
                proposal.baseline_fabric_digest,
                proposal.candidate_fabric_digest,
            )
        )

    def _update_history(self, proposal_id: str, **changes: Any) -> None:
        for index, record in enumerate(self.history):
            if record.proposal_id == proposal_id:
                self.history[index] = replace(record, **changes)
                return
        raise ValueError("PROPOSAL_HISTORY_RECORD_MISSING")

    def propose(self, text: str) -> dict[str, Any]:
        if self.current is not None and self.current.status not in TERMINAL_PROPOSAL_STATES:
            raise ValueError("PENDING_PROPOSAL_MUST_BE_DISPOSED")
        request = IntentRequest(text, self.current_fabric_digest)
        context = project_context(self.base.fabric)
        parsed = self.backend.parse(request, context)
        if isinstance(parsed, ProposalParseResult):
            self.last_parse = parsed
            self.current = None
            self.last_event = parsed.status
            return self.view()
        proposal, candidate = _build_proposal(
            request,
            context,
            self.base.fabric,
            parsed.normalized_intent,
            parsed.proposal_ast,
            parsed.proposed_edits,
            parsed.proposer_explanation,
        )
        result = ProposalParseResult(PROPOSAL_READY, proposal=proposal)
        self.last_parse = result
        diff = derive_geometric_diff(
            proposal.proposal_id,
            self.base.fabric,
            candidate,
            proposal.proposed_edits,
        )
        self.current = ProposalEnvelope(proposal, self.base.fabric, candidate, diff)
        self._append_history(proposal)
        self.last_event = "INTENT_PROPOSAL_PREVIEWED"
        return self.view()

    def modify(self, surface: str, projection: Mapping[str, Any]) -> dict[str, Any]:
        if self.current is None or self.current.status != PROPOSED:
            raise ValueError("NO_MODIFIABLE_PROPOSAL")
        surface = surface.upper()
        if surface not in ("TEXT", "VISUAL"):
            raise ValueError("surface MUST be TEXT or VISUAL")
        normalized_projection = demo1.normalize_projection(projection)
        edit = (
            v31.parse_visual(normalized_projection)
            if surface == "VISUAL"
            else v31.parse_text(normalized_projection)
        )
        if edit is None:
            raise ValueError("MODIFY_REQUIRES_SEMANTIC_EDIT")
        predecessor = self.current
        successor_edits = predecessor.proposal.proposed_edits + (edit,)
        request = IntentRequest(predecessor.proposal.source_intent, predecessor.proposal.baseline_fabric_digest)
        context = project_context(predecessor.baseline)
        edit_identity = canonical_digest(v31.edit_dict(edit))
        normalized_intent = f"{predecessor.proposal.normalized_intent}|user-modify:{edit_identity}"
        ast = ProposalAST(
            "USER_MODIFIED_SUCCESSOR",
            (("parent", predecessor.proposal.proposal_id), ("edit", edit_identity)),
        )
        proposal, candidate = _build_proposal(
            request,
            context,
            predecessor.baseline,
            normalized_intent,
            ast,
            successor_edits,
            "User-authored canonical edit appended as a new proposal identity.",
            predecessor.proposal.proposal_id,
        )
        predecessor.status = SUPERSEDED
        self._update_history(predecessor.proposal.proposal_id, disposition="MODIFY")
        diff = derive_geometric_diff(proposal.proposal_id, predecessor.baseline, candidate, successor_edits)
        self.current = ProposalEnvelope(proposal, predecessor.baseline, candidate, diff)
        self._append_history(proposal)
        self.last_parse = ProposalParseResult(PROPOSAL_READY, proposal=proposal)
        self.last_event = "PROPOSAL_MODIFIED_SUCCESSOR_CREATED"
        return self.view()

    def accept(self) -> dict[str, Any]:
        if self.current is None or self.current.status != PROPOSED:
            raise ValueError("NO_PROPOSED_CANDIDATE")
        if self.current_fabric_digest != self.current.proposal.baseline_fabric_digest:
            self.current.status = STALE
            self._update_history(self.current.proposal.proposal_id, disposition="ACCEPT", admission_outcome=STALE)
            self.last_event = "STALE_PROPOSAL_REFUSED"
            return self.view()
        self.current.status = ACCEPTED_FOR_ADMISSION
        self._update_history(self.current.proposal.proposal_id, disposition="ACCEPT")
        self.last_event = "CANDIDATE_ACCEPTED_FOR_ADMISSION"
        return self.view()

    def _close_governance(self, status: str, receipts: list[dict[str, Any]]) -> dict[str, Any]:
        if self.current is None:
            raise ValueError("NO_CURRENT_PROPOSAL")
        self.current.status = status
        self.current.admission_receipts = tuple(receipts)
        self._update_history(self.current.proposal.proposal_id, admission_outcome=status)
        self.last_event = status
        return self.view()

    def submit_admission(self, evidence_mode: str = "full") -> dict[str, Any]:
        if self.current is None or self.current.status != ACCEPTED_FOR_ADMISSION:
            raise ValueError("CANDIDATE_NOT_ACCEPTED_FOR_ADMISSION")
        if self.current_fabric_digest != self.current.proposal.baseline_fabric_digest:
            return self._close_governance(STALE, [])
        if not self.current.proposal.proposed_edits:
            return self._close_governance(GOVERNANCE_NOT_SAME, [])

        staging = self.base.fabric
        receipts: list[dict[str, Any]] = []
        for edit in self.current.proposal.proposed_edits:
            successor, result, parsed = self.base._evaluate_one(
                staging,
                "TEXT",
                demo1.projection_for_edit(edit, visual=False),
                evidence_mode,
            )
            item = demo1.admission_view(result)
            item["edit"] = v31.edit_dict(edit)
            receipts.append(item)
            if parsed is None or result.terminal_verdict != v32.IF_THEN:
                if result.terminal_verdict == v32.MAYBE:
                    return self._close_governance(GOVERNANCE_MAYBE, receipts)
                if result.terminal_verdict == v32.NOT_SAME or result.disposition == v32.NOT_SAME:
                    return self._close_governance(GOVERNANCE_NOT_SAME, receipts)
                return self._close_governance(GOVERNANCE_NO, receipts)
            staging = successor

        if fabric_digest(staging) != self.current.proposal.candidate_fabric_digest:
            return self._close_governance(GOVERNANCE_NOT_SAME, receipts)
        drc = v31.drc(staging)
        if not drc.admitted:
            receipts.append(
                {
                    "stage": "V3_1_DRC_FINAL",
                    "terminal_verdict": v32.NO,
                    "because": drc.because,
                    "reason_code": drc.reason_code,
                }
            )
            return self._close_governance(GOVERNANCE_NO, receipts)

        proposal = self.current.proposal
        commit_identity = canonical_digest(
            {
                "proposal_id": proposal.proposal_id,
                "candidate_fabric_digest": proposal.candidate_fabric_digest,
                "admission_receipts": receipts,
            }
        )
        self.current.status = COMMITTED
        self.current.admission_receipts = tuple(receipts)
        self.base.fabric = staging
        self.base.candidate = None
        self.base.runtime_sigma = None
        self.base.runtime_history = []
        self._update_history(
            proposal.proposal_id,
            admission_outcome=COMMITTED,
            commit_identity=commit_identity,
        )
        self.current = None
        self.last_event = "GOVERNED_CANDIDATE_COMMITTED"
        return self.view()

    def reject(self) -> dict[str, Any]:
        if self.current is None or self.current.status != PROPOSED:
            raise ValueError("ONLY_PROPOSED_CANDIDATE_CAN_BE_REJECTED")
        proposal_id = self.current.proposal.proposal_id
        self.current.status = REJECTED
        self._update_history(proposal_id, disposition="REJECT")
        self.current = None
        self.last_event = "PROPOSAL_REJECTED"
        return self.view()

    def set_presentation(self, cell_id: str, x: float, y: float) -> dict[str, Any]:
        before = self.current.diff.diff_id if self.current else None
        result = self.base.set_presentation(cell_id, x, y)
        after = self.current.diff.diff_id if self.current else None
        self.last_event = "PRESENTATION_CHANGED_PROPOSAL_SAME"
        view = self.view()
        view["presentation_result"] = {
            "canonical_same": result["same"],
            "diff_before": before,
            "diff_after": after,
            "diff_same": before == after,
        }
        return view

    def runtime_start(self) -> dict[str, Any]:
        if self.current is not None:
            raise ValueError("UNCOMMITTED_PROPOSAL_CANNOT_EXECUTE")
        self.base.runtime_start()
        self.last_event = "V3_3_RUNTIME_STARTED_ON_PROMOTED_FABRIC"
        return self.view()

    def runtime_tick(self) -> dict[str, Any]:
        if self.current is not None:
            raise ValueError("UNCOMMITTED_PROPOSAL_CANNOT_EXECUTE")
        self.base.runtime_tick()
        self.last_event = "V3_3_TICK_COMMITTED_ON_PROMOTED_FABRIC"
        return self.view()

    def view(self) -> dict[str, Any]:
        promoted = self.base._fabric_view(self.base.fabric)
        current = None
        candidate = None
        diff = None
        if self.current is not None:
            current = {
                **self.current.proposal.canonical(),
                "status": self.current.status,
                "admission_receipts": list(self.current.admission_receipts),
            }
            candidate = self.base._fabric_view(self.current.candidate)
            diff = self.current.diff.canonical()
        runtime = self.base.view()["runtime"]
        return {
            "demo": "DEMO-002 — Vibe Proposer",
            "last_event": self.last_event,
            "authority": {
                "nl_proposer_direct_commit": "FORBIDDEN",
                "accept": "SUBMISSION_ONLY",
                "commit": "V3.1_DRC_AND_V3.2_AUTHORITY",
            },
            "import": {
                "version": "mal-fabric v0.4.0",
                "doi": V0_4_0_DOI,
                "kernel_hashes": demo1.KERNEL_HASHES,
            },
            "parse": self.last_parse.canonical(),
            "promoted": promoted,
            "candidate": candidate,
            "proposal": current,
            "geometric_diff": diff,
            "text_surfaces": {
                "PROMOTED": promoted["canonical_json"],
                "CANDIDATE": candidate["canonical_json"] if candidate else None,
            },
            "proposal_history": [item.canonical() for item in self.history],
            "presentation": self.base.presentation,
            "runtime": runtime,
        }


__all__ = [
    "ACCEPTED_FOR_ADMISSION",
    "COMMITTED",
    "DeterministicGrammar",
    "GOVERNANCE_MAYBE",
    "GOVERNANCE_NO",
    "GOVERNANCE_NOT_SAME",
    "GeometricDiff",
    "IntentProposal",
    "IntentRequest",
    "PROPOSAL_PARSE_MAYBE",
    "PROPOSAL_READY",
    "PROPOSED",
    "ParsedProposalSyntax",
    "ProposerBackend",
    "ProposalAST",
    "ProposalContext",
    "REJECTED",
    "STALE",
    "SUPERSEDED",
    "VibeSession",
    "apply_sequence",
    "canonical_digest",
    "canonical_json",
    "demo1",
    "derive_geometric_diff",
    "fabric_digest",
    "project_context",
    "route_id",
    "v31",
    "v32",
    "v33",
]
