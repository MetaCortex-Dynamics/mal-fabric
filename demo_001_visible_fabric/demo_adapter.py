#!/usr/bin/env python3
"""DEMO-001 adapter over the sealed V3.1, V3.2, and V3.3 kernels.

The adapter owns one canonical FabricSpec. Browser coordinates and runtime
payload state are projections over that object and never enter its digest.
"""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import sys
from typing import Any, Iterable, Mapping


HERE = Path(__file__).resolve().parent
V33_PATH = HERE.parent / "execution_v0_3_0" / "execution_kernel.py"
_V33_SPEC = importlib.util.spec_from_file_location("mal_fabric_demo_v33", V33_PATH)
if _V33_SPEC is None or _V33_SPEC.loader is None:
    raise RuntimeError("V3_3_IMPORT_UNAVAILABLE")
v33 = importlib.util.module_from_spec(_V33_SPEC)
sys.modules["mal_fabric_demo_v33"] = v33
_V33_SPEC.loader.exec_module(v33)
v32 = v33.v32
v31 = v33.v31


DEMO_PROMPT = (
    "Make the enemy approach when the player is near, "
    "but flee when health is low."
)
ALL_TRIADS = ("□G", "□S", "□F")
PATH = ("behavior", "behavior_block", "visible_fabric")
KERNEL_HASHES = {
    "v3_1": v33.import_identities()["v3_1_kernel_sha256"],
    "v3_2": v33.import_identities()["v3_2_kernel_sha256"],
    "v3_3": sha256(V33_PATH.read_bytes()).hexdigest(),
}


def location(region: str = "□S") -> Any:
    if region not in ALL_TRIADS:
        raise ValueError(f"UNKNOWN_TRIAD_REGION:{region}")
    return v31.Location(v31.interior(region), PATH)


def location_from_json(value: Mapping[str, Any] | Any) -> Any:
    if isinstance(value, v31.Location):
        return value
    position = value["triad_position"]
    if position["kind"] == "INTERIOR":
        triad = v31.interior(str(position["dimension"]))
    else:
        triad = v31.boundary(str(position["source"]), str(position["target"]))
    return v31.Location(triad, tuple(str(item) for item in value["containment_path"]))


def normalize_projection(projection: Mapping[str, Any]) -> dict[str, Any]:
    result = dict(projection)
    for key in ("location", "from_location", "to_location"):
        if key in result:
            result[key] = location_from_json(result[key])
    return result


def fixture_fabric(*, action_region: str = "□S") -> Any:
    """Return the valid sandbox whose MANY action bus accepts safe relation edits."""

    ids = (
        ("player_near", "THIS"),
        ("health_low", "THIS"),
        ("enemy_approach", "THIS"),
        ("enemy_flee", "THIS"),
        ("patrol", "THIS"),
        ("approach_gate", "IF_THEN"),
        ("flee_gate", "IF_THEN"),
        ("action_bus", "TOGETHER_ALONE"),
    )
    cells = tuple(v31.cell_def(cell_id, operator, "WHEN", ALL_TRIADS) for cell_id, operator in ids)
    connections = (
        ("action_bus", "patrol", "VALUE"),
        ("patrol", "player_near", "VALUE"),
        ("patrol", "health_low", "VALUE"),
        ("approach_gate", "enemy_approach", "VALUE"),
        ("flee_gate", "enemy_flee", "VALUE"),
        ("player_near", "approach_gate", "CONDITION"),
        ("enemy_approach", "approach_gate", "CONSEQUENT"),
        ("health_low", "flee_gate", "CONDITION"),
        ("enemy_flee", "flee_gate", "CONSEQUENT"),
        ("patrol", "action_bus", "MEMBER"),
    )
    routes = tuple(v31.route(source, v31.RESULT, target, role) for source, target, role in connections)
    placements = tuple(
        v31.Placement(cell.cell_id, location(action_region if cell.cell_id == "action_bus" else "□S"))
        for cell in cells
    )
    fabric = v31.FabricSpec(
        "visible_fabric",
        cells,
        (v31.Motif("behavior", tuple(cell.cell_id for cell in cells)),),
        (v31.TriadBlock("behavior_block", ("behavior",)),),
        placements,
        routes,
    )
    verdict = v31.drc(fabric)
    if not verdict.admitted:
        raise AssertionError(f"DEMO_FIXTURE_INVALID:{verdict.reason_code}:{verdict.because}")
    return fabric


def canonical_location(value: Any) -> dict[str, Any]:
    return {
        "triad_position": value.triad_position.canonical(),
        "containment_path": list(value.containment_path),
    }


def projection_for_edit(edit: Any, *, visual: bool) -> dict[str, Any]:
    item = v31.edit_dict(edit)
    if item is None:
        raise ValueError("NO_SEMANTIC_EDIT")
    if visual:
        aliases = {"PLACE": "DRAG_IN", "MOVE": "DRAG", "CONNECT": "WIRE", "DISCONNECT": "DELETE_ROUTE"}
        item["kind"] = aliases[item["kind"]]
    return normalize_projection(item)


def metric_input() -> Any:
    return v32.MetricInput(
        (("WHEN", v32.distribution_at_distance(0, 1)),),
        (("route_shape", v32.distribution_at_distance(0, 1)),),
    )


TOLERANCE = v32.ToleranceProfile(v32.Q32.ratio(1, 2), v32.Q32.ratio(1, 2))


def evidence_for(core: Any, mode: str = "full") -> Any:
    if core.crossing_class == v32.LOCAL:
        return v32.EvidenceBundle(core.digest)
    law = v32.CROSSING_LAWS[core.crossing_class]
    capabilities = law.required_capabilities if mode != "missing_capability" else ()
    artifact_names = set(law.required_artifacts)
    for option in law.alternative_artifacts:
        artifact_names.update(option)
    artifacts = tuple((name, True) for name in sorted(artifact_names)) if mode == "full" else ()
    return v32.EvidenceBundle(core.digest, capabilities, artifacts)


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


def admission_view(result: Any) -> dict[str, Any]:
    item: dict[str, Any] = {
        "disposition": result.disposition,
        "terminal_verdict": result.terminal_verdict,
        "stage": result.stage,
        "because": result.because,
    }
    if result.outcome is not None:
        crossing = result.outcome.crossing
        item.update(
            {
                "lifecycle": result.outcome.lifecycle_after,
                "candidate_digest": result.outcome.core.digest,
                "observable_digest": result.outcome.observable_digest,
                "crossing_class": result.outcome.core.crossing_class,
                "missing_capabilities": list(crossing.missing_capabilities),
                "evidence_obligations": list(crossing.evidence_obligations),
            }
        )
    return item


@dataclass
class Candidate:
    base: Any
    successor: Any
    edits: tuple[Any, ...]
    admissions: tuple[Any, ...]
    state: str
    authorized: bool
    source: str


class DemoSession:
    """Stateful demo controller; the only semantic program field is ``fabric``."""

    def __init__(self) -> None:
        self.fabric = fixture_fabric()
        self.candidate: Candidate | None = None
        self.presentation: dict[str, dict[str, float]] = {}
        self.runtime_sigma: Any | None = None
        self.runtime_history: list[Any] = []
        self.last_event = "READY"

    def reset(self) -> dict[str, Any]:
        self.__init__()
        return self.view()

    def _evaluate_one(
        self,
        base: Any,
        surface: str,
        projection: Mapping[str, Any],
        evidence_mode: str,
    ) -> tuple[Any, Any, Any | None]:
        normalized = normalize_projection(projection)
        edit = v31.parse_visual(normalized) if surface == "VISUAL" else v31.parse_text(normalized)
        if edit is None:
            result = v32.TotalPipelineResult("NO_OP", None, "F_PARSE_FABRIC", "surface denotes no semantic edit")
            return base, result, None
        try:
            preview = v31.apply_edit(base, edit)
        except (KeyError, TypeError, ValueError, v31.FabricError):
            preview = base
        result = v32.evaluate_admission(
            base=base,
            surface=surface,
            projection=normalized,
            tolerance=TOLERANCE,
            metric_input=metric_input(),
            evidence_factory=lambda core: evidence_for(core, evidence_mode),
        )
        if result.outcome is not None:
            preview = result.outcome.core.successor
        return preview, result, edit

    def propose(self, prompt: str) -> dict[str, Any]:
        words = " ".join(prompt.lower().replace("_", " ").split())
        required = ("enemy", "approach", "player", "near", "flee", "health", "low")
        if not all(word in words for word in required):
            self.last_event = "NL_TEMPLATE_NOT_MATCHED"
            return self.view()
        edits = (
            v31.ConnectEdit("enemy_approach", v31.RESULT, "action_bus", "MEMBER"),
            v31.ConnectEdit("enemy_flee", v31.RESULT, "action_bus", "MEMBER"),
        )
        current = self.fabric
        admissions: list[Any] = []
        for edit in edits:
            current, result, _ = self._evaluate_one(current, "TEXT", projection_for_edit(edit, visual=False), "full")
            admissions.append(result)
            if result.terminal_verdict != v32.IF_THEN:
                break
        authorized = len(admissions) == len(edits) and all(item.terminal_verdict == v32.IF_THEN for item in admissions)
        state = "ADMITTED" if authorized else (admissions[-1].terminal_verdict or "REJECTED")
        self.candidate = Candidate(self.fabric, current, edits, tuple(admissions), state, authorized, "NL_PROPOSER")
        self.last_event = "NL_PROPOSAL_PREVIEWED"
        return self.view()

    def edit(self, surface: str, projection: Mapping[str, Any], evidence_mode: str = "full") -> dict[str, Any]:
        surface = surface.upper()
        if surface not in ("TEXT", "VISUAL"):
            raise ValueError("surface MUST be TEXT or VISUAL")
        successor, result, edit = self._evaluate_one(self.fabric, surface, projection, evidence_mode)
        if edit is None:
            self.last_event = "PRESENTATION_ONLY_NO_OP"
            return self.view()
        authorized = result.terminal_verdict == v32.IF_THEN
        if result.terminal_verdict == v32.MAYBE:
            state = "MAYBE"
        elif authorized:
            state = "ADMITTED"
        else:
            state = "REJECTED"
        self.candidate = Candidate(self.fabric, successor, (edit,), (result,), state, authorized, surface)
        self.last_event = f"{surface}_EDIT_PREVIEWED"
        return self.view()

    def accept(self) -> dict[str, Any]:
        if self.candidate is None:
            raise ValueError("NO_CANDIDATE")
        if not self.candidate.authorized:
            raise ValueError("CANDIDATE_HAS_NO_EXECUTION_AUTHORITY")
        self.fabric = self.candidate.successor
        self.candidate = None
        self.runtime_sigma = None
        self.runtime_history = []
        self.last_event = "AUTHORIZED_CANDIDATE_COMMITTED"
        return self.view()

    def reject(self) -> dict[str, Any]:
        self.candidate = None
        self.last_event = "CANDIDATE_REJECTED_BY_USER"
        return self.view()

    def set_presentation(self, cell_id: str, x: float, y: float) -> dict[str, Any]:
        if cell_id not in {cell.cell_id for cell in self.fabric.cells}:
            raise ValueError("UNKNOWN_CELL")
        before = v31.canonical_digest(v31.normalize(self.fabric))
        self.presentation[cell_id] = {"x": float(x), "y": float(y)}
        after = v31.canonical_digest(v31.normalize(self.fabric))
        self.last_event = "PRESENTATION_CHANGED_CANONICAL_SAME"
        return {"before": before, "after": after, "same": before == after, "state": self.view()}

    def _seed_frame(self, cell_id: str, value: Any) -> Any:
        cell = next(item for item in self.fabric.cells if item.cell_id == cell_id)
        bindings: dict[str, tuple[Any, ...]] = {}
        for role, _multiplicity, payload_type in v31.join_signature(cell.operator, cell.witness):
            receipt = v33.canonical_digest(("demo-seed", cell_id, role, value))
            bindings[role] = (v33.InputValue(f"seed:{cell_id}:{role}", payload_type, value, receipt),)
        return v33.input_frame(bindings)

    def runtime_start(self) -> dict[str, Any]:
        if self.candidate is not None:
            raise ValueError("CANDIDATE_MUST_BE_RESOLVED_BEFORE_EXECUTION")
        seeded = {
            cell_id: v33.admitted_payload(self._seed_frame(cell_id, "TRUE"), f"demo-admit:{cell_id}")
            for cell_id in ("patrol", "enemy_approach", "enemy_flee")
        }
        self.runtime_sigma = v33.Sigma(self.fabric, v33.fabric_state(self.fabric, payload_states=seeded))
        self.runtime_history = []
        self.last_event = "V3_3_RUNTIME_STARTED"
        return self.view()

    def runtime_tick(self) -> dict[str, Any]:
        if self.runtime_sigma is None:
            self.runtime_start()
        result = v33.step_fabric(self.runtime_sigma)
        self.runtime_sigma = result.sigma
        self.runtime_history.append(result)
        self.last_event = "V3_3_TICK_COMMITTED"
        return self.view()

    def runtime_run(self, max_steps: int = 12) -> dict[str, Any]:
        if self.runtime_sigma is None:
            self.runtime_start()
        for _ in range(max_steps):
            if v33.run_status(self.fabric, self.runtime_sigma.state) != v33.RUNNING:
                break
            self.runtime_tick()
        self.last_event = "V3_3_CLOSED_RUN_STOPPED"
        return self.view()

    def runtime_blocked_fixture(self) -> dict[str, Any]:
        cell = next(item for item in self.fabric.cells if item.cell_id == "approach_gate")
        payload_type = v31.witness_type(cell.witness, "CONDITION")
        value = v33.InputValue("blocked:condition", payload_type, True, "blocked-condition-receipt")
        partial = v33.PartialInputBuffer(cell.cell_id, (("CONDITION", (value,)),), 0, (value.source_receipt,))
        self.runtime_sigma = v33.Sigma(self.fabric, v33.fabric_state(self.fabric, pending_input_buffers=(partial,)))
        self.runtime_history = []
        self.last_event = "BLOCKED_FIXTURE_LOADED"
        return self.view()

    def runtime_halted_fixture(self) -> dict[str, Any]:
        self.runtime_sigma = v33.Sigma(self.fabric, v33.fabric_state(self.fabric))
        self.runtime_history = []
        self.last_event = "HALTED_FIXTURE_LOADED"
        return self.view()

    def _fabric_view(self, fabric: Any) -> dict[str, Any]:
        verdict = v31.drc(fabric)
        normalized = v31.normalize(fabric) if verdict.admitted else v31.primitive_dict(fabric)
        placement_map = {item.cell_id: item.location for item in fabric.placements}
        cells = []
        for cell in sorted(fabric.cells, key=lambda item: item.cell_id):
            loc = placement_map.get(cell.cell_id)
            cells.append(
                {
                    **_jsonable(cell.__dict__),
                    "ports": list(v31.port_schema(cell.operator, cell.witness)),
                    "location": canonical_location(loc) if loc else None,
                }
            )
        return {
            "valid": verdict.admitted,
            "drc": {"verdict": verdict.verdict, "reason_code": verdict.reason_code, "because": verdict.because},
            "canonical": normalized,
            "canonical_json": json.dumps(normalized, ensure_ascii=False, sort_keys=True, indent=2),
            "canonical_digest": v31.canonical_digest(normalized) if verdict.admitted else None,
            "cells": cells,
            "routes": [
                {
                    "route_id": route.route_id,
                    "source_cell": route.source_cell,
                    "source_role": route.source_role,
                    "target_cell": route.target_cell,
                    "target_role": route.target_role,
                    "triad_transition": list(v31.triad_transition(fabric, route)),
                }
                for route in sorted(fabric.routes, key=lambda item: item.route_id)
            ],
        }

    def view(self) -> dict[str, Any]:
        visible = self.candidate.successor if self.candidate is not None else self.fabric
        runtime = None
        if self.runtime_sigma is not None:
            phases = {cell_id: payload.phase for cell_id, payload in self.runtime_sigma.state.payload_states}
            runtime = {
                "run_status": v33.run_status(self.fabric, self.runtime_sigma.state),
                "phases": phases,
                "blocked_reasons": [item.canonical() for item in v33.blocked_reasons(self.fabric, self.runtime_sigma.state)],
                "ticks": len(self.runtime_history),
                "last_evidence": self.runtime_history[-1].canonical_evidence() if self.runtime_history else None,
                "evidence_digest": v33.canonical_digest(
                    [item.canonical_evidence() for item in self.runtime_history]
                ),
            }
        candidate = None
        if self.candidate is not None:
            candidate = {
                "state": self.candidate.state,
                "authorized": self.candidate.authorized,
                "execution_authority": "YES" if self.candidate.authorized else "NO",
                "source": self.candidate.source,
                "edits": [v31.edit_dict(item) for item in self.candidate.edits],
                "admissions": [admission_view(item) for item in self.candidate.admissions],
            }
        bus_members = sorted(
            route.source_cell for route in visible.routes if route.target_cell == "action_bus" and route.target_role == "MEMBER"
        )
        return {
            "demo": "DEMO-001 — Visible Fabric",
            "last_event": self.last_event,
            "kernel_hashes": KERNEL_HASHES,
            "nl_authority": "PROPOSER_ONLY",
            "committed_digest": v31.canonical_digest(v31.normalize(self.fabric)),
            "visible": self._fabric_view(visible),
            "candidate": candidate,
            "presentation": self.presentation,
            "runtime": runtime,
            "behavior": {
                "action_bus_members": bus_members,
                "description": " / ".join(bus_members),
            },
        }


def deterministic_replay(session_factory: Any = DemoSession) -> tuple[str, str]:
    def run_once() -> str:
        session = session_factory()
        session.propose(DEMO_PROMPT)
        session.accept()
        session.runtime_start()
        for _ in range(5):
            session.runtime_tick()
        evidence = [item.canonical_evidence() for item in session.runtime_history]
        return v33.canonical_digest({"fabric": v31.normalize(session.fabric), "evidence": evidence})

    return run_once(), run_once()


__all__ = [
    "ALL_TRIADS",
    "DEMO_PROMPT",
    "DemoSession",
    "KERNEL_HASHES",
    "deterministic_replay",
    "fixture_fabric",
    "location",
    "projection_for_edit",
    "v31",
    "v32",
    "v33",
]
