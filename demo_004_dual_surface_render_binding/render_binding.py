#!/usr/bin/env python3
"""Read-only dual render projections over committed DEMO-003 snapshots."""

from __future__ import annotations

from dataclasses import dataclass, replace
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import sys
from typing import Any, Mapping


HERE = Path(__file__).resolve().parent
DEMO_003_PATH = HERE.parent / "demo_003_game_loop_binding" / "game_loop.py"
DEMO_003_ACCEPTANCE_PATH = HERE.parent / "demo_003_game_loop_binding" / "acceptance-summary.json"
DEMO_003_PROMOTION_PATH = HERE.parent / "demo_003_game_loop_binding" / "PROMOTION_RECORD.md"

DEMO_003_KERNEL_SHA256 = "F711C6499E345C6B6952D8E8AA570B385D7F48A46F3E2189491E98653C4C1833"
DEMO_003_ACCEPTANCE_SHA256 = "F6BCFDCA7C58CB363ACAB9F03B349CD052EDE0819653E6B01B06A492EDAB6DFE"
DEMO_003_PROMOTION_SHA256 = "9F3DF4BB5F1B2F47C8A5DE4549B67C1769B64A30016D641AFFAAC2A9298E6510"
V0_6_0_DOI = "10.5281/zenodo.22726846"

GAME = "GAME"
CARRIER = "CARRIER"
SURFACES = (GAME, CARRIER)
SOURCE_KINDS = (
    "COMMITTED_GAME_STATE",
    "COMMITTED_FABRIC_STATE",
    "COMMITTED_RUN_STATUS",
    "IMMUTABLE_DERIVED_STRUCTURE",
)


class RenderBindingError(ValueError):
    """Fail-closed render-boundary error."""


def file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


for _path, _expected, _label in (
    (DEMO_003_PATH, DEMO_003_KERNEL_SHA256, "DEMO_003_KERNEL"),
    (DEMO_003_ACCEPTANCE_PATH, DEMO_003_ACCEPTANCE_SHA256, "DEMO_003_ACCEPTANCE"),
    (DEMO_003_PROMOTION_PATH, DEMO_003_PROMOTION_SHA256, "DEMO_003_PROMOTION"),
):
    if not _path.is_file() or file_sha256(_path) != _expected:
        raise RenderBindingError(f"{_label}_IMPORT_MISMATCH")

_MODULE_NAME = "mal_fabric_demo_003_render_import"
_MODULE_SPEC = importlib.util.spec_from_file_location(_MODULE_NAME, DEMO_003_PATH)
if _MODULE_SPEC is None or _MODULE_SPEC.loader is None:
    raise RenderBindingError("DEMO_003_IMPORT_UNAVAILABLE")
demo3 = importlib.util.module_from_spec(_MODULE_SPEC)
sys.modules[_MODULE_NAME] = demo3
_MODULE_SPEC.loader.exec_module(demo3)
v31 = demo3.v31
v33 = demo3.v33


def canonical_value(value: Any) -> Any:
    return demo3.canonical_value(value)


def canonical_json(value: Any, *, pretty: bool = False) -> str:
    return demo3.canonical_json(value, pretty=pretty)


def canonical_digest(value: Any) -> str:
    return demo3.canonical_digest(value)


@dataclass(frozen=True)
class PresentationDerivation:
    presentation_feature_id: str
    source_kind: str
    source_identity: str
    derivation_rule_id: str

    def __post_init__(self) -> None:
        if self.source_kind not in SOURCE_KINDS:
            raise RenderBindingError("UNDECLARED_PRESENTATION_SOURCE_KIND")
        if not all((self.presentation_feature_id, self.source_identity, self.derivation_rule_id)):
            raise RenderBindingError("INCOMPLETE_PRESENTATION_DERIVATION")

    def canonical(self) -> dict[str, str]:
        return {
            "presentation_feature_id": self.presentation_feature_id,
            "source_kind": self.source_kind,
            "source_identity": self.source_identity,
            "derivation_rule_id": self.derivation_rule_id,
        }


@dataclass(frozen=True)
class RenderBindingSpec:
    game_entity_bindings: tuple[tuple[str, str], ...]
    animation_bindings: tuple[tuple[str, str], ...]
    asset_bindings: tuple[tuple[str, str], ...]
    carrier_debug_bindings: tuple[tuple[str, tuple[str, ...]], ...]
    semantic_class_bindings: tuple[tuple[str, str], ...]
    presentation_derivations: tuple[PresentationDerivation, ...]
    gaussian_asset_bindings: tuple[tuple[str, str], ...] = ()

    def __post_init__(self) -> None:
        classes = dict(self.semantic_class_bindings)
        required = {"friend", "enemy", "danger"}
        if not required <= set(classes):
            raise RenderBindingError("LEGIBILITY_CLASS_BINDING_MISSING")
        if len({classes[key] for key in required}) != 3:
            raise RenderBindingError("LEGIBILITY_CLASSES_NOT_DISTINGUISHABLE")

    @property
    def render_binding_id(self) -> str:
        return canonical_digest(self.identity_payload())

    def identity_payload(self) -> dict[str, Any]:
        return {
            "game_entity_bindings": dict(sorted(self.game_entity_bindings)),
            "animation_bindings": dict(sorted(self.animation_bindings)),
            "asset_bindings": dict(sorted(self.asset_bindings)),
            "carrier_debug_bindings": {
                key: sorted(values) for key, values in sorted(self.carrier_debug_bindings)
            },
            "semantic_class_bindings": dict(sorted(self.semantic_class_bindings)),
            "presentation_derivations": [
                item.canonical()
                for item in sorted(self.presentation_derivations, key=lambda item: item.presentation_feature_id)
            ],
            "gaussian_asset_bindings": dict(sorted(self.gaussian_asset_bindings)),
        }

    def canonical(self) -> dict[str, Any]:
        return {"render_binding_id": self.render_binding_id, **self.identity_payload()}


def default_render_binding() -> RenderBindingSpec:
    return RenderBindingSpec(
        game_entity_bindings=(
            ("enemy_01", "enemy_character_primary"),
            ("enemy_02", "enemy_character_echo"),
            ("player", "player_character"),
        ),
        animation_bindings=((demo3.APPROACH, "walk_forward"), (demo3.FLEE, "run_away"), (demo3.PATROL, "patrol_cycle"), (demo3.NO_ACTION, "idle")),
        asset_bindings=(("arena", "bounded_dark_arena"), ("enemy_01", "enemy_mesh_01"), ("enemy_02", "enemy_mesh_02"), ("player", "player_mesh_01")),
        carrier_debug_bindings=(
            ("enemy_01", ("approach_gate", "enemy_approach", "flee_gate", "enemy_flee")),
            ("enemy_02", ("action_bus", "patrol")),
            ("player", ("player_near", "health_low")),
        ),
        semantic_class_bindings=(("danger", "danger_amber"), ("enemy", "enemy_crimson"), ("friend", "friend_cyan")),
        presentation_derivations=(
            PresentationDerivation("entity_positions", "COMMITTED_GAME_STATE", "ToyGameState", "INTEGER_GRID_TO_ARENA_V1"),
            PresentationDerivation("enemy_animation", "COMMITTED_GAME_STATE", "ToyGameState.enemy_mode", "ACTION_TO_ANIMATION_V1"),
            PresentationDerivation("blocked_stall", "COMMITTED_RUN_STATUS", "RenderSnapshot.run_status", "BLOCKED_TO_STALL_V1"),
            PresentationDerivation("enemy_02_offset", "IMMUTABLE_DERIVED_STRUCTURE", "enemy_01", "MIRROR_ENEMY_OFFSET_V1"),
            PresentationDerivation("triad_ambient", "IMMUTABLE_DERIVED_STRUCTURE", "FabricSpec.placements", "TRIAD_DOMINANCE_COUNT_V1"),
            PresentationDerivation("carrier_topology", "IMMUTABLE_DERIVED_STRUCTURE", "FabricSpec", "CANONICAL_TOPOLOGY_V1"),
            PresentationDerivation("payload_phase", "COMMITTED_FABRIC_STATE", "FabricState.payload_states", "PHASE_BADGE_V1"),
            PresentationDerivation("frame_readiness", "COMMITTED_FABRIC_STATE", "FabricState.pending_input_buffers", "PARTIAL_FRAME_V1"),
        ),
    )


@dataclass(frozen=True)
class RenderSnapshot:
    logical_tick_index: int
    game_tick_index: int
    fabric_tick_index: int
    game_run_id: str
    fabric_digest: str
    committed_fabric_state_json: str
    committed_game_state_json: str
    immutable_structure_json: str
    run_status: str
    blocked_reasons_json: str
    game_state_digest: str
    fabric_state_digest: str
    commit_receipt_digest: str

    def __post_init__(self) -> None:
        if not (self.logical_tick_index == self.game_tick_index == self.fabric_tick_index):
            raise RenderBindingError("MIXED_TICK_RENDER_SNAPSHOT")
        if canonical_digest(json.loads(self.committed_game_state_json)) != self.game_state_digest:
            raise RenderBindingError("GAME_STATE_DIGEST_MISMATCH")
        if canonical_digest(json.loads(self.committed_fabric_state_json)) != self.fabric_state_digest:
            raise RenderBindingError("FABRIC_STATE_DIGEST_MISMATCH")

    @property
    def snapshot_digest(self) -> str:
        return canonical_digest(self.canonical())

    def canonical(self) -> dict[str, Any]:
        return {
            "logical_tick_index": self.logical_tick_index,
            "game_run_id": self.game_run_id,
            "fabric_digest": self.fabric_digest,
            "committed_fabric_state": json.loads(self.committed_fabric_state_json),
            "committed_game_state": json.loads(self.committed_game_state_json),
            "immutable_structure": json.loads(self.immutable_structure_json),
            "run_status": self.run_status,
            "blocked_reasons": json.loads(self.blocked_reasons_json),
            "game_state_digest": self.game_state_digest,
            "fabric_state_digest": self.fabric_state_digest,
            "commit_receipt_digest": self.commit_receipt_digest,
        }


@dataclass(frozen=True)
class ActiveSurface:
    surface: str = GAME
    carrier_zoom_level: str = "FABRIC"

    def __post_init__(self) -> None:
        if self.surface not in SURFACES:
            raise RenderBindingError("UNKNOWN_RENDER_SURFACE")
        if self.carrier_zoom_level not in ("FABRIC", "REGION", "CELL"):
            raise RenderBindingError("UNKNOWN_CARRIER_ZOOM")

    def canonical(self) -> dict[str, str]:
        return {"surface": self.surface, "carrier_zoom_level": self.carrier_zoom_level}


@dataclass(frozen=True)
class GameView:
    snapshot_digest: str
    logical_tick_index: int
    entities: tuple[dict[str, Any], ...]
    arena: dict[str, Any]
    behavior_status: str
    ambient_cue: str | None
    diagnostics: tuple[str, ...]

    def canonical(self) -> dict[str, Any]:
        return canonical_value(self.__dict__)


@dataclass(frozen=True)
class CarrierView:
    snapshot_digest: str
    logical_tick_index: int
    cells: tuple[dict[str, Any], ...]
    routes: tuple[dict[str, Any], ...]
    triad_regions: tuple[dict[str, str], ...]
    pending_buffers: tuple[dict[str, Any], ...]
    obligations: tuple[Any, ...]
    blocked_reasons: tuple[dict[str, Any], ...]
    carrier_zoom_level: str
    diagnostics: tuple[str, ...]

    def canonical(self) -> dict[str, Any]:
        return canonical_value(self.__dict__)


@dataclass(frozen=True)
class RenderDecisionRecord:
    logical_tick_index: int
    game_run_id: str
    active_surface: str
    render_snapshot_digest: str
    render_binding_digest: str
    entity_bindings_used: tuple[str, ...]
    animation_bindings_used: tuple[str, ...]
    carrier_primitives_used: tuple[str, ...]
    semantic_digest_before: str
    semantic_digest_after: str
    governance_cues_emitted: tuple[str, ...]
    presentation_derivations_used: tuple[str, ...]
    source_unavailable_diagnostics: tuple[str, ...]
    carrier_zoom_level: str
    binding_diagnostics: tuple[str, ...]

    @property
    def decision_digest(self) -> str:
        return canonical_digest(self.canonical())

    def canonical(self) -> dict[str, Any]:
        return canonical_value(self.__dict__)


def _structure(engine: Any) -> dict[str, Any]:
    promoted = engine.vibe.view()["promoted"]["canonical"]
    placements = {item["cell_id"]: item["location"] for item in promoted["placements"]}
    cells = []
    for cell in promoted["cells"]:
        signature = v31.join_signature(cell["operator"], cell["witness"])
        ports = [
            {"direction": "IN", "role": role, "multiplicity": multiplicity, "payload_type": payload_type}
            for role, multiplicity, payload_type in signature
        ]
        ports.append({"direction": "OUT", "role": v31.RESULT, "multiplicity": "EXACTLY_ONE", "payload_type": v31.witness_type(cell["witness"], v31.RESULT)})
        cells.append({**cell, "location": placements[cell["cell_id"]], "ports": ports})
    return {"fabric_id": promoted["fabric_id"], "cells": cells, "routes": promoted["routes"], "placements": promoted["placements"]}


def publish_snapshot(engine: Any) -> RenderSnapshot:
    game_state = canonical_value(engine.game_state)
    fabric_state = canonical_value(engine.fabric_state)
    game_digest = canonical_digest(game_state)
    fabric_digest = canonical_digest(fabric_state)
    if engine.tick_index == 0:
        if game_digest != engine.run_identity.initial_game_state_digest or fabric_digest != engine.run_identity.initial_fabric_state_digest:
            raise RenderBindingError("UNCOMMITTED_INITIAL_SNAPSHOT")
        receipt_digest = canonical_digest((engine.run_identity.run_id, "INITIAL_COMMITTED_BOUNDARY"))
    else:
        if not engine.receipts:
            raise RenderBindingError("COMMIT_RECEIPT_REQUIRED")
        receipt = engine.receipts[-1]
        if receipt.tick_index != engine.tick_index - 1:
            raise RenderBindingError("COMMIT_RECEIPT_TICK_MISMATCH")
        if receipt.post_game_state_digest != game_digest or receipt.post_fabric_state_digest != fabric_digest:
            raise RenderBindingError("PARTIAL_OR_STALE_COMMIT_BOUNDARY")
        receipt_digest = canonical_digest(receipt)
    reasons = [item.canonical() for item in v33.blocked_reasons(engine.program, engine.fabric_state)]
    return RenderSnapshot(
        engine.tick_index,
        engine.tick_index,
        engine.tick_index,
        engine.run_identity.run_id,
        engine.run_identity.fabric_digest,
        canonical_json(fabric_state),
        canonical_json(game_state),
        canonical_json(_structure(engine)),
        v33.run_status(engine.program, engine.fabric_state),
        canonical_json(reasons),
        game_digest,
        fabric_digest,
        receipt_digest,
    )


def semantic_digest(snapshot: RenderSnapshot) -> str:
    return canonical_digest({
        "tick": snapshot.logical_tick_index,
        "run": snapshot.game_run_id,
        "fabric": snapshot.fabric_digest,
        "fabric_state": snapshot.fabric_state_digest,
        "game_state": snapshot.game_state_digest,
    })


def _derivation(binding: RenderBindingSpec, feature: str) -> PresentationDerivation | None:
    return next((item for item in binding.presentation_derivations if item.presentation_feature_id == feature), None)


def project_game(snapshot: RenderSnapshot, binding: RenderBindingSpec, presentation: ActiveSurface) -> GameView:
    del presentation  # Surface selection cannot affect the read-only projection.
    game = json.loads(snapshot.committed_game_state_json)
    structure = json.loads(snapshot.immutable_structure_json)
    entity_bindings = dict(binding.game_entity_bindings)
    asset_bindings = dict(binding.asset_bindings)
    animations = dict(binding.animation_bindings)
    visual_classes = dict(binding.semantic_class_bindings)
    diagnostics: list[str] = []
    required = ("entity_positions", "enemy_animation", "enemy_02_offset")
    for feature in required:
        if _derivation(binding, feature) is None:
            diagnostics.append(f"SOURCE_UNAVAILABLE:{feature}")
    player_pos = game["player_position"] if "SOURCE_UNAVAILABLE:entity_positions" not in diagnostics else None
    enemy_pos = game["enemy_position"] if player_pos is not None else None
    enemy_02_pos = [enemy_pos[0], enemy_pos[1] + 2] if enemy_pos is not None and "SOURCE_UNAVAILABLE:enemy_02_offset" not in diagnostics else None
    animation = animations.get(game["enemy_mode"])
    if animation is None or "SOURCE_UNAVAILABLE:enemy_animation" in diagnostics:
        diagnostics.append("BINDING_UNAVAILABLE:enemy_animation")
        animation = "placeholder_idle"
    stalled = snapshot.run_status == "BLOCKED"
    if stalled and _derivation(binding, "blocked_stall") is None:
        diagnostics.append("SOURCE_UNAVAILABLE:blocked_stall")
        stalled = False
    def entity(entity_id: str, position: Any, action: str) -> dict[str, Any]:
        semantic_class = "friend" if entity_id == "player" else "enemy"
        if entity_id not in entity_bindings:
            diagnostics.append(f"BINDING_UNAVAILABLE:{entity_id}:renderable")
        if entity_id not in asset_bindings:
            diagnostics.append(f"BINDING_UNAVAILABLE:{entity_id}:asset")
        return {
            "entity_id": entity_id,
            "renderable_id": entity_bindings.get(entity_id, "placeholder_entity"),
            "asset_id": asset_bindings.get(entity_id, "placeholder_asset"),
            "world_position": position,
            "animation": "hesitation" if stalled and entity_id.startswith("enemy") else action,
            "semantic_class": semantic_class,
            "visual_class_id": visual_classes[semantic_class],
        }
    ambient = None
    if _derivation(binding, "triad_ambient") is not None:
        dimensions = [item["location"]["triad_position"]["dimension"] for item in structure["cells"]]
        ambient = max(sorted(set(dimensions)), key=lambda value: (dimensions.count(value), value)) if dimensions else None
    else:
        diagnostics.append("SOURCE_UNAVAILABLE:triad_ambient")
    entities = (
        entity("player", player_pos, "player_idle"),
        entity("enemy_01", enemy_pos, animation),
        entity("enemy_02", enemy_02_pos, animation),
    )
    return GameView(snapshot.snapshot_digest, snapshot.logical_tick_index, entities, {"asset_id": asset_bindings.get("arena", "placeholder_arena"), "bounded": True, "lighting": "legible"}, "STALL" if stalled else game["enemy_mode"], ambient, tuple(sorted(set(diagnostics))))


def project_carrier(snapshot: RenderSnapshot, presentation: ActiveSurface) -> CarrierView:
    state = json.loads(snapshot.committed_fabric_state_json)
    structure = json.loads(snapshot.immutable_structure_json)
    phases = state["payload_states"]
    diagnostics: list[str] = []
    cells = tuple(
        {
            "cell_id": cell["cell_id"],
            "operator_witness": f'{cell["operator"]} × {cell["witness"]}',
            "operator": cell["operator"],
            "witness": cell["witness"],
            "ports": cell["ports"],
            "location": cell["location"],
            "payload_phase": phases[cell["cell_id"]]["phase"],
            "frame_ready": phases[cell["cell_id"]]["frame"] is not None,
        }
        for cell in structure["cells"]
    )
    locations = {item["cell_id"]: item["location"]["triad_position"]["dimension"] for item in structure["placements"]}
    routes = tuple({**route, "direction": f'{route["source_cell"]}.{route["source_role"]} → {route["target_cell"]}.{route["target_role"]}', "triad_transition": [locations[route["source_cell"]], locations[route["target_cell"]]]} for route in structure["routes"])
    region_tokens = {"□G": "cool", "□S": "neutral", "□F": "warm"}
    regions = tuple({"dimension": key, "temperature_category": value} for key, value in sorted(region_tokens.items()))
    pending = tuple(canonical_value(item) for item in state["pending_input_buffers"])
    reasons = tuple(json.loads(snapshot.blocked_reasons_json))
    return CarrierView(snapshot.snapshot_digest, snapshot.logical_tick_index, cells, routes, regions, pending, tuple(state["outstanding_obligations"]), reasons, presentation.carrier_zoom_level, tuple(diagnostics))


class DualSurfaceController:
    """Execution owner and read-only projection coordinator; renderers never receive it."""

    def __init__(self, engine: Any | None = None, binding: RenderBindingSpec | None = None) -> None:
        self.engine = engine if engine is not None else demo3.GameLoopEngine()
        self.binding = binding if binding is not None else default_render_binding()
        self.presentation = ActiveSurface()
        self.snapshot = publish_snapshot(self.engine)
        self.render_callbacks = 0
        self.decisions: list[RenderDecisionRecord] = []

    def _capture(self, view: GameView | CarrierView, before: str) -> RenderDecisionRecord:
        after = semantic_digest(self.snapshot)
        if before != after:
            raise RenderBindingError("RENDERER_MUTATED_SEMANTIC_STATE")
        game = isinstance(view, GameView)
        diagnostics = view.diagnostics
        if game:
            used = ["entity_positions", "enemy_animation", "enemy_02_offset", "triad_ambient"]
            if view.behavior_status == "STALL":
                used.append("blocked_stall")
            cues = ("BLOCKED_STALL",) if view.behavior_status == "STALL" else ()
        else:
            used = ["carrier_topology", "payload_phase", "frame_readiness"]
            cue_set = {"PAYLOAD_PHASE", "FRAME_READINESS"}
            if view.blocked_reasons:
                cue_set.add("BLOCKED_REASON")
            cues = tuple(sorted(cue_set))
        return RenderDecisionRecord(
            self.snapshot.logical_tick_index,
            self.snapshot.game_run_id,
            self.presentation.surface,
            self.snapshot.snapshot_digest,
            self.binding.render_binding_id,
            tuple(item["entity_id"] for item in view.entities) if game else (),
            tuple(sorted({item["animation"] for item in view.entities})) if game else (),
            () if game else ("cells", "ports", "directed_routes", "triad_regions", "payload_phases", "pending_buffers", "blocked_reasons"),
            before,
            after,
            cues,
            tuple(sorted(used)),
            tuple(item for item in diagnostics if item.startswith("SOURCE_UNAVAILABLE")),
            self.presentation.carrier_zoom_level,
            tuple(item for item in diagnostics if item.startswith("BINDING_UNAVAILABLE")),
        )

    def render(self) -> dict[str, Any]:
        before = semantic_digest(self.snapshot)
        view = project_game(self.snapshot, self.binding, self.presentation) if self.presentation.surface == GAME else project_carrier(self.snapshot, self.presentation)
        record = self._capture(view, before)
        self.render_callbacks += 1
        self.decisions.append(record)
        return {"active_surface": self.presentation.surface, "view": view.canonical(), "render_decision": record.canonical(), "render_decision_digest": record.decision_digest}

    def toggle_surface(self) -> dict[str, Any]:
        before = semantic_digest(self.snapshot)
        target = CARRIER if self.presentation.surface == GAME else GAME
        self.presentation = replace(self.presentation, surface=target)
        result = self.render()
        if before != semantic_digest(self.snapshot):
            raise RenderBindingError("TOGGLE_MUTATED_SEMANTIC_STATE")
        return result

    def set_zoom(self, zoom: str) -> dict[str, Any]:
        self.presentation = replace(self.presentation, carrier_zoom_level=zoom)
        return self.render()

    def stage_controls(self, **controls: Any) -> dict[str, Any]:
        self.engine.stage_controls(**controls)
        return self.state()

    def advance_logical_tick(self, observations: Any | None = None) -> dict[str, Any]:
        self.engine.advance_logical_tick(observations)
        self.snapshot = publish_snapshot(self.engine)
        return self.state()

    def state(self) -> dict[str, Any]:
        return {
            "demo": "DEMO-004 — Dual-Surface Render Binding",
            "publication_import": {"version": "mal-fabric v0.6.0", "doi": V0_6_0_DOI},
            "active_surface": self.presentation.canonical(),
            "snapshot": self.snapshot.canonical(),
            "snapshot_digest": self.snapshot.snapshot_digest,
            "render_binding": self.binding.canonical(),
            "render_binding_digest": self.binding.render_binding_id,
            "render_callbacks": self.render_callbacks,
            "logical_ticks": self.engine.tick_index,
            "step_fabric_calls": self.engine.step_fabric_calls,
            "last_render": self.render(),
        }


def import_identities() -> dict[str, str]:
    return {
        "mal_fabric_v0_6_0_doi": V0_6_0_DOI,
        "demo_003_kernel_sha256": file_sha256(DEMO_003_PATH),
        "demo_003_acceptance_sha256": file_sha256(DEMO_003_ACCEPTANCE_PATH),
        "demo_003_promotion_sha256": file_sha256(DEMO_003_PROMOTION_PATH),
    }


__all__ = [
    "ActiveSurface", "CARRIER", "CarrierView", "DEMO_003_KERNEL_SHA256", "DualSurfaceController",
    "GAME", "GameView", "PresentationDerivation", "RenderBindingError", "RenderBindingSpec",
    "RenderDecisionRecord", "RenderSnapshot", "V0_6_0_DOI", "canonical_digest", "canonical_json",
    "default_render_binding", "demo3", "file_sha256", "import_identities", "project_carrier",
    "project_game", "publish_snapshot", "semantic_digest", "v31", "v33",
]
