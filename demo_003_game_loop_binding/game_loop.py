#!/usr/bin/env python3
"""DEMO-003 logical game-tick adapter over the promoted mal-fabric stack."""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import sys
from typing import Any, Iterable, Mapping, Sequence


HERE = Path(__file__).resolve().parent
DEMO_002_PATH = HERE.parent / "demo_002_vibe_proposer" / "proposal_kernel.py"
DEMO_002_ACCEPTANCE_PATH = HERE.parent / "demo_002_vibe_proposer" / "acceptance-summary.json"
DEMO_002_PROMOTION_PATH = HERE.parent / "demo_002_vibe_proposer" / "PROMOTION_RECORD.md"

DEMO_002_KERNEL_SHA256 = "FDA888C840F0F6B2D8F35704F9BDF51D5B9F25F6E3592F1A15161A4271B0A3E1"
DEMO_002_ACCEPTANCE_SHA256 = "D598260003D7706E5F3CA99837A2A4D9A523C637C729233E0943C6378C68ADA2"
DEMO_002_PROMOTION_SHA256 = "391D81E6F0E07776DFFE56CF47565F8F927C9A762D7D49A0449ACE91C68DD8B9"
V0_5_0_DOI = "10.5281/zenodo.22725249"


class GameLoopError(ValueError):
    """Fail-closed product-boundary error."""


class BindingMismatch(GameLoopError):
    pass


class RunResetRequired(GameLoopError):
    pass


def _file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


for _path, _expected, _label in (
    (DEMO_002_PATH, DEMO_002_KERNEL_SHA256, "DEMO_002_KERNEL"),
    (DEMO_002_ACCEPTANCE_PATH, DEMO_002_ACCEPTANCE_SHA256, "DEMO_002_ACCEPTANCE"),
    (DEMO_002_PROMOTION_PATH, DEMO_002_PROMOTION_SHA256, "DEMO_002_PROMOTION"),
):
    if not _path.is_file() or _file_sha256(_path) != _expected:
        raise GameLoopError(f"{_label}_IMPORT_MISMATCH")

_DEMO_002_NAME = "mal_fabric_demo_002_game_import"
_DEMO_002_SPEC = importlib.util.spec_from_file_location(_DEMO_002_NAME, DEMO_002_PATH)
if _DEMO_002_SPEC is None or _DEMO_002_SPEC.loader is None:
    raise GameLoopError("DEMO_002_IMPORT_UNAVAILABLE")
demo2 = importlib.util.module_from_spec(_DEMO_002_SPEC)
sys.modules[_DEMO_002_NAME] = demo2
_DEMO_002_SPEC.loader.exec_module(demo2)

demo1 = demo2.demo1
v31 = demo2.v31
v32 = demo2.v32
v33 = demo1.v33

APPROACH = "APPROACH"
FLEE = "FLEE"
PATROL = "PATROL"
NO_ACTION = "NO_ACTION"
ENEMY_ACTIONS = (APPROACH, FLEE, PATROL, NO_ACTION)
SET_ENEMY_ACTION = "SET_ENEMY_ACTION"
GAME_UPDATE_LAW_ID = "TOY_INTEGER_GRID_UPDATE_V1"


def canonical_value(value: Any) -> Any:
    if hasattr(value, "canonical") and callable(value.canonical):
        return canonical_value(value.canonical())
    if isinstance(value, Mapping):
        return {str(key): canonical_value(value[key]) for key in sorted(value, key=str)}
    if isinstance(value, (tuple, list)):
        return [canonical_value(item) for item in value]
    if isinstance(value, (set, frozenset)):
        return sorted((canonical_value(item) for item in value), key=canonical_json)
    return value


def canonical_json(value: Any, *, pretty: bool = False) -> str:
    return json.dumps(
        canonical_value(value),
        ensure_ascii=False,
        sort_keys=True,
        indent=2 if pretty else None,
        separators=None if pretty else (",", ":"),
    ) + ("\n" if pretty else "")


def canonical_digest(value: Any) -> str:
    return sha256(canonical_json(value).encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class ToyGameState:
    player_position: tuple[int, int]
    enemy_position: tuple[int, int]
    enemy_mode: str
    enemy_health: int

    def __post_init__(self) -> None:
        if self.enemy_mode not in ENEMY_ACTIONS:
            raise GameLoopError("UNKNOWN_ENEMY_MODE")
        if not all(isinstance(value, int) for value in (*self.player_position, *self.enemy_position)):
            raise GameLoopError("GAME_GRID_REQUIRES_INTEGERS")
        if not isinstance(self.enemy_health, int) or not 0 <= self.enemy_health <= 100:
            raise GameLoopError("ENEMY_HEALTH_OUT_OF_RANGE")

    def canonical(self) -> dict[str, Any]:
        return {
            "player_position": list(self.player_position),
            "enemy_position": list(self.enemy_position),
            "enemy_mode": self.enemy_mode,
            "enemy_health": self.enemy_health,
        }


@dataclass(frozen=True)
class ObservationSet:
    player_near: bool
    health_low: bool

    def canonical(self) -> dict[str, bool]:
        return {"health_low": self.health_low, "player_near": self.player_near}


@dataclass(frozen=True)
class IngressRule:
    rule_id: str
    predicates: tuple[tuple[str, bool], ...]
    targets: tuple[str, ...]

    def canonical(self) -> dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "predicates": {key: value for key, value in sorted(self.predicates)},
            "targets": sorted(self.targets),
        }

    def matches(self, observations: ObservationSet) -> bool:
        values = observations.canonical()
        return all(values.get(key) is expected for key, expected in self.predicates)


@dataclass(frozen=True)
class EgressRule:
    route_id: str
    source_cell: str
    action: str

    def __post_init__(self) -> None:
        if self.action not in ENEMY_ACTIONS:
            raise GameLoopError("UNKNOWN_EGRESS_ACTION")

    def canonical(self) -> dict[str, str]:
        return {
            "route_id": self.route_id,
            "source_cell": self.source_cell,
            "effect": SET_ENEMY_ACTION,
            "action": self.action,
        }


@dataclass(frozen=True)
class GameBindingSpec:
    fabric_digest: str
    ingress_bindings: tuple[IngressRule, ...]
    egress_bindings: tuple[EgressRule, ...]
    game_update_law_id: str = GAME_UPDATE_LAW_ID

    @property
    def binding_id(self) -> str:
        return canonical_digest(self.identity_payload())

    def identity_payload(self) -> dict[str, Any]:
        return {
            "fabric_digest": self.fabric_digest,
            "ingress_bindings": [item.canonical() for item in sorted(self.ingress_bindings, key=lambda x: x.rule_id)],
            "egress_bindings": [item.canonical() for item in sorted(self.egress_bindings, key=lambda x: x.route_id)],
            "game_update_law_id": self.game_update_law_id,
        }

    def canonical(self) -> dict[str, Any]:
        return {"binding_id": self.binding_id, **self.identity_payload()}


@dataclass(frozen=True)
class GameRunIdentity:
    fabric_digest: str
    binding_id: str
    initial_game_state_digest: str
    initial_fabric_state_digest: str

    @property
    def run_id(self) -> str:
        return canonical_digest(self.identity_payload())

    def identity_payload(self) -> dict[str, str]:
        return {
            "fabric_digest": self.fabric_digest,
            "binding_id": self.binding_id,
            "initial_game_state_digest": self.initial_game_state_digest,
            "initial_fabric_state_digest": self.initial_fabric_state_digest,
        }

    def canonical(self) -> dict[str, str]:
        return {"run_id": self.run_id, **self.identity_payload()}


@dataclass(frozen=True)
class GameTickInput:
    tick_index: int
    run_id: str
    pre_game_state_digest: str
    pre_fabric_state_digest: str
    observations: ObservationSet

    def canonical(self) -> dict[str, Any]:
        return {
            "tick_index": self.tick_index,
            "run_id": self.run_id,
            "pre_game_state_digest": self.pre_game_state_digest,
            "pre_fabric_state_digest": self.pre_fabric_state_digest,
            "observations": self.observations.canonical(),
        }


@dataclass(frozen=True)
class GameEffect:
    kind: str
    action: str

    def canonical(self) -> dict[str, str]:
        return {"kind": self.kind, "action": self.action}


@dataclass(frozen=True)
class GameEffectBatch:
    tick_index: int
    run_id: str
    effects: tuple[GameEffect, ...]

    def canonical(self) -> dict[str, Any]:
        return {
            "tick_index": self.tick_index,
            "run_id": self.run_id,
            "effects": [item.canonical() for item in sorted(self.effects, key=lambda x: (x.kind, x.action))],
        }


@dataclass(frozen=True)
class GameTickReceipt:
    tick_index: int
    run_id: str
    fabric_digest: str
    binding_id: str
    pre_game_state_digest: str
    pre_fabric_state_digest: str
    game_tick_input_digest: str
    prepared_fabric_state_digest: str
    post_fabric_state_digest: str
    effect_batch_digest: str
    post_game_state_digest: str
    run_status: str
    blocked_reason: dict[str, Any] | None

    def canonical(self) -> dict[str, Any]:
        return {
            "tick_index": self.tick_index,
            "run_id": self.run_id,
            "fabric_digest": self.fabric_digest,
            "binding_id": self.binding_id,
            "pre_game_state_digest": self.pre_game_state_digest,
            "pre_fabric_state_digest": self.pre_fabric_state_digest,
            "game_tick_input_digest": self.game_tick_input_digest,
            "prepared_fabric_state_digest": self.prepared_fabric_state_digest,
            "post_fabric_state_digest": self.post_fabric_state_digest,
            "effect_batch_digest": self.effect_batch_digest,
            "post_game_state_digest": self.post_game_state_digest,
            "run_status": self.run_status,
            "blocked_reason": canonical_value(self.blocked_reason),
        }


@dataclass(frozen=True)
class GameLoopTrace:
    run_id: str
    ordered_tick_receipts: tuple[GameTickReceipt, ...]

    @property
    def trace_digest(self) -> str:
        return canonical_digest(self.identity_payload())

    def identity_payload(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "ordered_tick_receipts": [item.canonical() for item in sorted(self.ordered_tick_receipts, key=lambda x: x.tick_index)],
        }

    def canonical(self) -> dict[str, Any]:
        return {"trace_digest": self.trace_digest, **self.identity_payload()}


DEFAULT_GAME_STATE = ToyGameState((0, 0), (4, 0), PATROL, 100)


def committed_game_session() -> Any:
    """Create the known fabric by using DEMO-002's governed commit path."""

    session = demo2.VibeSession()
    session.propose(
        "When the player is near, make the enemy approach; "
        "when health is low, make the enemy flee."
    )
    session.accept()
    result = session.submit_admission()
    if result["last_event"] != "GOVERNED_CANDIDATE_COMMITTED":
        raise GameLoopError("KNOWN_GAME_FABRIC_COMMIT_FAILED")
    return session


def default_binding(program: Any) -> GameBindingSpec:
    digest = v33.program_digest(program)
    rules = (
        IngressRule("01_FLEE", (("health_low", True),), ("health_low", "enemy_flee")),
        IngressRule("02_APPROACH", (("health_low", False), ("player_near", True)), ("player_near", "enemy_approach")),
        IngressRule("03_PATROL", (("health_low", False), ("player_near", False)), ("patrol",)),
    )
    action_for_source = {"enemy_approach": APPROACH, "enemy_flee": FLEE, "patrol": PATROL}
    egress = tuple(
        EgressRule(route.route_id, route.source_cell, action_for_source[route.source_cell])
        for route in sorted(program.routes, key=lambda item: item.route_id)
        if route.target_cell == "action_bus"
        and route.target_role == "MEMBER"
        and route.source_cell in action_for_source
    )
    return GameBindingSpec(digest, rules, egress)


def validate_binding(binding: GameBindingSpec, program: Any) -> None:
    if binding.fabric_digest != v33.program_digest(program):
        raise BindingMismatch("BINDING_FABRIC_DIGEST_MISMATCH")
    if binding.game_update_law_id != GAME_UPDATE_LAW_ID:
        raise BindingMismatch("UNKNOWN_GAME_UPDATE_LAW")
    cells = {cell.cell_id for cell in program.cells}
    routes = {route.route_id: route for route in program.routes}
    allowed_observations = {"player_near", "health_low"}
    for rule in binding.ingress_bindings:
        if not set(key for key, _value in rule.predicates) <= allowed_observations:
            raise BindingMismatch("INGRESS_REFERENCES_UNKNOWN_OBSERVATION")
        if not set(rule.targets) <= cells:
            raise BindingMismatch("INGRESS_REFERENCES_UNKNOWN_TARGET")
    for rule in binding.egress_bindings:
        route = routes.get(rule.route_id)
        if route is None or route.source_cell != rule.source_cell:
            raise BindingMismatch("EGRESS_REFERENCES_UNKNOWN_OUTPUT")
        if route.source_role != v31.RESULT or route.target_cell != "action_bus":
            raise BindingMismatch("EGRESS_NOT_DECLARED_OUTPUT")


def sample(game_state: ToyGameState, controls: Mapping[str, Any] | None = None) -> ObservationSet:
    controls = controls or {}
    player_near = controls.get("player_near")
    if player_near is None:
        distance = abs(game_state.player_position[0] - game_state.enemy_position[0]) + abs(
            game_state.player_position[1] - game_state.enemy_position[1]
        )
        player_near = distance <= 2
    health_value = controls.get("enemy_health", game_state.enemy_health)
    if not isinstance(health_value, int) or not 0 <= health_value <= 100:
        raise GameLoopError("CONTROL_HEALTH_OUT_OF_RANGE")
    return ObservationSet(bool(player_near), health_value < 20)


def _seed_frame(binding: GameBindingSpec, tick_input: GameTickInput, program: Any, cell_id: str) -> Any:
    cell = next((item for item in program.cells if item.cell_id == cell_id), None)
    if cell is None:
        raise BindingMismatch(f"UNKNOWN_INGRESS_CELL:{cell_id}")
    values: dict[str, tuple[Any, ...]] = {}
    payload = {
        "game_tick_input_digest": canonical_digest(tick_input.canonical()),
        "observations": tick_input.observations.canonical(),
        "target_cell": cell_id,
    }
    for role, _multiplicity, payload_type in v31.join_signature(cell.operator, cell.witness):
        route_id = canonical_digest(("GAME_INGRESS", binding.binding_id, tick_input.tick_index, cell_id, role))
        receipt = canonical_digest(("GAME_INGRESS_RECEIPT", route_id, payload))
        values[role] = (v33.InputValue(route_id, payload_type, payload, receipt),)
    return v33.input_frame(values)


def ingress_bind(
    binding: GameBindingSpec,
    tick_input: GameTickInput,
    fabric_state: Any,
    program: Any,
) -> Any:
    validate_binding(binding, program)
    if tick_input.run_id == "":
        raise GameLoopError("TICK_INPUT_RUN_ID_REQUIRED")
    matching = [rule for rule in sorted(binding.ingress_bindings, key=lambda item: item.rule_id) if rule.matches(tick_input.observations)]
    if len(matching) != 1:
        raise BindingMismatch("INGRESS_RULE_MUST_RESOLVE_EXACTLY_ONCE")
    payloads = fabric_state.payload_map()
    for cell_id in sorted(matching[0].targets):
        before = payloads[cell_id]
        if before.phase != v33.EMPTY:
            continue
        frame = _seed_frame(binding, tick_input, program, cell_id)
        receipt = canonical_digest(("GAME_FRAME_ADMITTED", tick_input.run_id, tick_input.tick_index, cell_id, frame.canonical()))
        after = v33.admitted_payload(frame, receipt)
        v33.transition_payload(before, after)
        payloads[cell_id] = after
    return v33.fabric_state(
        program,
        payload_states=payloads,
        route_states=fabric_state.route_states,
        pending_admissions=fabric_state.pending_admissions,
        pending_input_buffers=fabric_state.pending_input_buffers,
        outstanding_obligations=fabric_state.outstanding_obligations,
        receipts=fabric_state.receipts,
    )


def egress_bind(
    binding: GameBindingSpec,
    committed_successor_state: Any,
    tick_index: int,
    run_id: str,
) -> GameEffectBatch:
    payload = committed_successor_state.payload_map().get("action_bus", v33.empty_payload())
    arrived_route_ids: set[str] = set()
    if payload.phase == v33.COMPLETED and payload.frame is not None:
        arrived_route_ids = {
            value.route_id
            for _role, values in payload.frame.bindings
            for value in values
        }
    effects = tuple(
        GameEffect(SET_ENEMY_ACTION, rule.action)
        for rule in binding.egress_bindings
        if rule.route_id in arrived_route_ids
    )
    return GameEffectBatch(tick_index, run_id, tuple(sorted(effects, key=lambda item: (item.kind, item.action))))


def _toward(source: tuple[int, int], target: tuple[int, int]) -> tuple[int, int]:
    x, y = source
    if x != target[0]:
        x += 1 if target[0] > x else -1
    elif y != target[1]:
        y += 1 if target[1] > y else -1
    return (x, y)


def _away(source: tuple[int, int], target: tuple[int, int]) -> tuple[int, int]:
    x, y = source
    if x != target[0]:
        x += 1 if x > target[0] else -1
    elif y != target[1]:
        y += 1 if y > target[1] else -1
    else:
        x += 1
    return (x, y)


def game_apply(game_state: ToyGameState, effect_batch: GameEffectBatch) -> ToyGameState:
    current = game_state
    for effect in sorted(effect_batch.effects, key=lambda item: (item.kind, item.action)):
        if effect.kind != SET_ENEMY_ACTION or effect.action not in ENEMY_ACTIONS:
            raise GameLoopError("UNKNOWN_GAME_EFFECT")
        if effect.action == APPROACH:
            position = _toward(current.enemy_position, current.player_position)
            health = current.enemy_health
        elif effect.action == FLEE:
            position = _away(current.enemy_position, current.player_position)
            health = min(current.enemy_health, 10)
        elif effect.action == PATROL:
            position = (current.enemy_position[0] + 1, current.enemy_position[1])
            health = current.enemy_health
        else:
            position = current.enemy_position
            health = current.enemy_health
        current = ToyGameState(current.player_position, position, effect.action, health)
    return current


REVERSE_SCHEDULE = v33.HostSchedule(
    "reverse",
    cell_order=v33.REVERSE,
    route_order=v33.REVERSE,
    buffer_order=v33.REVERSE,
    governance_order=v33.REVERSE,
    obligation_order=v33.REVERSE,
    receipt_order=v33.REVERSE,
    commit_order=v33.REVERSE,
)


class GameLoopEngine:
    """One explicit logical tick around one imported V3.3 semantic step."""

    def __init__(
        self,
        vibe_session: Any | None = None,
        *,
        game_state: ToyGameState = DEFAULT_GAME_STATE,
        fabric_state: Any | None = None,
        binding: GameBindingSpec | None = None,
        schedule: Any = v33.DEFAULT_SCHEDULE,
    ) -> None:
        self.vibe = vibe_session if vibe_session is not None else committed_game_session()
        self.program = self.vibe.base.fabric
        self.binding = binding if binding is not None else default_binding(self.program)
        validate_binding(self.binding, self.program)
        if not v33.valid_host_schedule(schedule):
            raise GameLoopError("INVALID_HOST_SCHEDULE")
        self.schedule = schedule
        self.initial_game_state = game_state
        self.initial_fabric_state = fabric_state if fabric_state is not None else v33.fabric_state(self.program)
        self.game_state = self.initial_game_state
        self.fabric_state = self.initial_fabric_state
        self.run_identity = GameRunIdentity(
            v33.program_digest(self.program),
            self.binding.binding_id,
            canonical_digest(self.initial_game_state),
            v33.canonical_digest(self.initial_fabric_state),
        )
        self.tick_index = 0
        self.receipts: list[GameTickReceipt] = []
        self.effect_batches: list[GameEffectBatch] = []
        self.sample_calls = 0
        self.step_fabric_calls = 0
        self.last_step_fabric_calls = 0
        self.render_callbacks = 0
        self.active = True
        self.reset_required = False
        self.staged_controls: dict[str, Any] = {"player_near": False, "enemy_health": 100}
        self.last_event = "GAME_RUN_READY"

    @property
    def trace(self) -> GameLoopTrace:
        return GameLoopTrace(self.run_identity.run_id, tuple(self.receipts))

    def stage_controls(
        self,
        *,
        player_near: bool | None = None,
        enemy_health: int | None = None,
    ) -> dict[str, Any]:
        if player_near is not None:
            self.staged_controls["player_near"] = bool(player_near)
        if enemy_health is not None:
            if not isinstance(enemy_health, int) or not 0 <= enemy_health <= 100:
                raise GameLoopError("CONTROL_HEALTH_OUT_OF_RANGE")
            self.staged_controls["enemy_health"] = enemy_health
        self.last_event = "NEXT_TICK_CONTROLS_STAGED"
        return self.view()

    def render_frame(self) -> dict[str, Any]:
        self.render_callbacks += 1
        self.last_event = "RENDER_FRAME_PRESENTED_NONSEMANTIC"
        return self.view()

    def _sample_once(self, observations: ObservationSet | None) -> GameTickInput:
        self.sample_calls += 1
        observed = observations if observations is not None else sample(self.game_state, self.staged_controls)
        return GameTickInput(
            self.tick_index,
            self.run_identity.run_id,
            canonical_digest(self.game_state),
            v33.canonical_digest(self.fabric_state),
            observed,
        )

    def _step_once(self, prepared_state: Any) -> Any:
        self.last_step_fabric_calls = 0
        sigma = v33.Sigma(self.program, prepared_state)
        self.last_step_fabric_calls += 1
        self.step_fabric_calls += 1
        if self.schedule == v33.DEFAULT_SCHEDULE:
            result = v33.step_fabric(sigma)
        else:
            result = v33.step_impl(sigma, self.schedule)
        if self.last_step_fabric_calls != 1:
            raise GameLoopError("ONE_LOGICAL_TICK_ONE_STEP_FABRIC_VIOLATION")
        return result

    def advance_logical_tick(self, observations: ObservationSet | None = None) -> dict[str, Any]:
        if not self.active:
            raise RunResetRequired("GAME_RUN_INACTIVE_RESET_REQUIRED")
        committed_digest = self.vibe.current_fabric_digest
        if committed_digest != self.run_identity.fabric_digest:
            self.active = False
            self.reset_required = True
            raise RunResetRequired("COMMITTED_GEOMETRY_CHANGED_NEW_RUN_REQUIRED")
        before_samples = self.sample_calls
        tick_input = self._sample_once(observations)
        prepared = ingress_bind(self.binding, tick_input, self.fabric_state, self.program)
        result = self._step_once(prepared)
        committed_successor = result.sigma.state
        effects = egress_bind(
            self.binding,
            committed_successor,
            self.tick_index,
            self.run_identity.run_id,
        )
        post_game = game_apply(self.game_state, effects)
        status = v33.run_status(self.program, committed_successor)
        reasons = v33.blocked_reasons(self.program, committed_successor)
        receipt = GameTickReceipt(
            self.tick_index,
            self.run_identity.run_id,
            self.run_identity.fabric_digest,
            self.binding.binding_id,
            canonical_digest(self.game_state),
            v33.canonical_digest(self.fabric_state),
            canonical_digest(tick_input),
            v33.canonical_digest(prepared),
            v33.canonical_digest(committed_successor),
            canonical_digest(effects),
            canonical_digest(post_game),
            status,
            reasons[0].canonical() if reasons else None,
        )
        if self.sample_calls - before_samples != 1:
            raise GameLoopError("GAME_TICK_INPUT_NOT_SAMPLED_EXACTLY_ONCE")
        self.fabric_state = committed_successor
        self.game_state = post_game
        self.effect_batches.append(effects)
        self.receipts.append(receipt)
        self.tick_index += 1
        self.last_event = "LOGICAL_TICK_COMMITTED"
        return self.view()

    def reset_run(self) -> dict[str, Any]:
        self.program = self.vibe.base.fabric
        self.binding = default_binding(self.program)
        validate_binding(self.binding, self.program)
        self.initial_game_state = DEFAULT_GAME_STATE
        self.initial_fabric_state = v33.fabric_state(self.program)
        self.game_state = self.initial_game_state
        self.fabric_state = self.initial_fabric_state
        self.run_identity = GameRunIdentity(
            v33.program_digest(self.program),
            self.binding.binding_id,
            canonical_digest(self.initial_game_state),
            v33.canonical_digest(self.initial_fabric_state),
        )
        self.tick_index = 0
        self.receipts = []
        self.effect_batches = []
        self.sample_calls = 0
        self.step_fabric_calls = 0
        self.last_step_fabric_calls = 0
        self.active = True
        self.reset_required = False
        self.staged_controls = {"player_near": False, "enemy_health": 100}
        self.last_event = "GAME_RUN_RESET"
        return self.view()

    def propose(self, text: str) -> dict[str, Any]:
        self.vibe.propose(text)
        self.last_event = "PENDING_GEOMETRY_VISIBLE_RUN_UNCHANGED"
        return self.view()

    def proposal_accept(self) -> dict[str, Any]:
        self.vibe.accept()
        self.last_event = "PROPOSAL_ACCEPTED_FOR_ADMISSION_RUN_UNCHANGED"
        return self.view()

    def proposal_reject(self) -> dict[str, Any]:
        self.vibe.reject()
        self.last_event = "PROPOSAL_REJECTED_RUN_UNCHANGED"
        return self.view()

    def proposal_modify(self, surface: str, projection: Mapping[str, Any]) -> dict[str, Any]:
        self.vibe.modify(surface, projection)
        self.last_event = "PROPOSAL_MODIFIED_RUN_UNCHANGED"
        return self.view()

    def proposal_submit(self) -> dict[str, Any]:
        before = self.run_identity.fabric_digest
        result = self.vibe.submit_admission()
        after = self.vibe.current_fabric_digest
        if result["last_event"] == "GOVERNED_CANDIDATE_COMMITTED" and after != before:
            self.active = False
            self.reset_required = True
            self.last_event = "GEOMETRY_COMMITTED_GAME_RUN_RESET_REQUIRED"
        else:
            self.last_event = result["last_event"]
        return self.view()

    def view(self) -> dict[str, Any]:
        fabric_view = self.vibe.view()
        phases = {cell_id: payload.phase for cell_id, payload in self.fabric_state.payload_states}
        status = v33.run_status(self.program, self.fabric_state)
        reasons = [item.canonical() for item in v33.blocked_reasons(self.program, self.fabric_state)]
        fabric_view["runtime"] = {
            "run_status": status,
            "phases": phases,
            "blocked_reasons": reasons,
            "logical_ticks": self.tick_index,
        }
        return {
            **fabric_view,
            "demo": "DEMO-003 — Game Loop Binding",
            "last_event": self.last_event,
            "publication_import": {"version": "mal-fabric v0.5.0", "doi": V0_5_0_DOI},
            "game": {
                "state": self.game_state.canonical(),
                "state_digest": canonical_digest(self.game_state),
                "staged_controls": canonical_value(self.staged_controls),
                "logical_tick": self.tick_index,
                "active": self.active,
                "reset_required": self.reset_required,
                "last_effect_batch": self.effect_batches[-1].canonical() if self.effect_batches else None,
            },
            "run_identity": self.run_identity.canonical(),
            "binding": self.binding.canonical(),
            "fabric_runtime": {
                "state_digest": v33.canonical_digest(self.fabric_state),
                "run_status": status,
                "blocked_reasons": reasons,
                "phases": phases,
            },
            "game_loop_trace": self.trace.canonical(),
            "instrumentation": {
                "sample_calls": self.sample_calls,
                "step_fabric_calls": self.step_fabric_calls,
                "last_step_fabric_calls": self.last_step_fabric_calls,
                "render_callbacks": self.render_callbacks,
                "render_frame_semantic": False,
            },
        }


def replay(
    observation_sequence: Sequence[ObservationSet],
    *,
    schedule: Any = v33.DEFAULT_SCHEDULE,
    render_cadence: Sequence[int] = (),
) -> tuple[GameLoopTrace, ToyGameState, Any]:
    engine = GameLoopEngine(schedule=schedule)
    for index, observations in enumerate(observation_sequence):
        frames = render_cadence[index] if index < len(render_cadence) else 0
        for _ in range(frames):
            engine.render_frame()
        engine.advance_logical_tick(observations)
    return engine.trace, engine.game_state, engine.fabric_state


def blocked_engine() -> GameLoopEngine:
    vibe = committed_game_session()
    program = vibe.base.fabric
    cell = next(item for item in program.cells if item.cell_id == "approach_gate")
    payload_type = v31.witness_type(cell.witness, "CONDITION")
    value = v33.InputValue("blocked:condition", payload_type, True, "blocked-condition-receipt")
    partial = v33.PartialInputBuffer(cell.cell_id, (("CONDITION", (value,)),), 0, (value.source_receipt,))
    state = v33.fabric_state(program, pending_input_buffers=(partial,))
    no_ingress = IngressRule(
        "BLOCKED_NO_DEFAULT",
        (("health_low", False), ("player_near", False)),
        (),
    )
    binding = GameBindingSpec(
        v33.program_digest(program),
        (no_ingress,),
        default_binding(program).egress_bindings,
    )
    return GameLoopEngine(vibe, fabric_state=state, binding=binding)


def import_identities() -> dict[str, str]:
    return {
        "mal_fabric_v0_5_0_doi": V0_5_0_DOI,
        "demo_002_kernel_sha256": _file_sha256(DEMO_002_PATH),
        "demo_002_acceptance_sha256": _file_sha256(DEMO_002_ACCEPTANCE_PATH),
        "demo_002_promotion_sha256": _file_sha256(DEMO_002_PROMOTION_PATH),
        "v3_1_kernel_sha256": _file_sha256(HERE.parent / "static_fabric_v0_1_0" / "kernel.py"),
        "v3_2_kernel_sha256": _file_sha256(HERE.parent / "admissibility_v0_2_0" / "admission_kernel.py"),
        "v3_3_kernel_sha256": _file_sha256(HERE.parent / "execution_v0_3_0" / "execution_kernel.py"),
        "demo_001_adapter_sha256": _file_sha256(HERE.parent / "demo_001_visible_fabric" / "demo_adapter.py"),
    }


__all__ = [
    "APPROACH",
    "BindingMismatch",
    "DEFAULT_GAME_STATE",
    "ENEMY_ACTIONS",
    "EgressRule",
    "FLEE",
    "GameBindingSpec",
    "GameEffect",
    "GameEffectBatch",
    "GameLoopEngine",
    "GameLoopError",
    "GameLoopTrace",
    "GameRunIdentity",
    "GameTickInput",
    "GameTickReceipt",
    "IngressRule",
    "NO_ACTION",
    "ObservationSet",
    "PATROL",
    "REVERSE_SCHEDULE",
    "RunResetRequired",
    "SET_ENEMY_ACTION",
    "ToyGameState",
    "blocked_engine",
    "canonical_digest",
    "canonical_json",
    "committed_game_session",
    "default_binding",
    "demo1",
    "demo2",
    "egress_bind",
    "game_apply",
    "import_identities",
    "ingress_bind",
    "replay",
    "sample",
    "v31",
    "v32",
    "v33",
]
