#!/usr/bin/env python3
"""Execute M01-M16 for AMENDMENT-GAME-INPUT-AGENCY-001."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
from typing import Any, Callable

import agency_kernel as agency
from ascii_projection import AsciiProjectionController, AsciiViewport, GAME, project_ascii


HERE = Path(__file__).resolve().parent


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def state_at(player: tuple[int, int, int], resonance: tuple[int, int, int] = (4, 0, 0)) -> agency.WorldGameStateV1:
    return agency.WorldGameStateV1(
        agency.WorldPositionV1(*player),
        agency.WorldPositionV1(*resonance),
        agency.demo3.PATROL,
        100,
        0,
    )


def one(action: str, state: agency.WorldGameStateV1 = agency.DEFAULT_WORLD_STATE) -> tuple[agency.AgencyGameLoopEngine, Any]:
    engine = agency.AgencyGameLoopEngine(state=state)
    return engine, engine.advance(agency.GameTickInputV1(0, action))


def m01() -> dict[str, Any]:
    values = [agency.GameTickInputV1(7, action).canonical() for action in agency.PLAYER_ACTIONS]
    check([item["player_action"] for item in values] == list(agency.PLAYER_ACTIONS), "action encoding changed")
    check(all(sorted(item) == ["player_action", "tick"] for item in values), "V1 contains undeclared authority")
    return {"encodings": values, "w_field": False}


def m02() -> dict[str, Any]:
    engine, snapshot = one(agency.STAY)
    check(snapshot.world_state.player_position == engine.initial_state.player_position, "STAY moved player")
    check(snapshot.world_state.w == 1, "STAY stopped unfolding")
    return {"position": snapshot.world_state.player_position, "w": snapshot.world_state.w}


def directional(vector_id: str, action: str, expected: tuple[int, int, int]) -> dict[str, Any]:
    _engine, snapshot = one(action)
    actual = snapshot.world_state.player_position.canonical()
    check(actual == list(expected), f"{vector_id} successor mismatch")
    check(snapshot.last_player_movement.status == agency.ADMITTED, f"{vector_id} not admitted")
    return {"action": action, "successor": actual}


def m03() -> dict[str, Any]: return directional("M03", agency.MOVE_N, (0, 1, 0))
def m04() -> dict[str, Any]: return directional("M04", agency.MOVE_S, (0, -1, 0))
def m05() -> dict[str, Any]: return directional("M05", agency.MOVE_E, (1, 0, 0))
def m06() -> dict[str, Any]: return directional("M06", agency.MOVE_W, (-1, 0, 0))


def m07() -> dict[str, Any]:
    _engine, snapshot = one(agency.MOVE_E, state_at((10, 0, 0), (4, 0, 0)))
    movement = snapshot.last_player_movement
    check(movement.status == agency.BLOCKED and movement.reason == "ARENA_BOUNDS", "arena exit not blocked")
    check(movement.successor == movement.prior, "arena block changed position")
    return movement.canonical()


def m08() -> dict[str, Any]:
    _engine, snapshot = one(agency.MOVE_E, state_at((1, 0, 0), (4, 0, 0)))
    movement = snapshot.last_player_movement
    check(movement.status == agency.BLOCKED and movement.reason == "OBSTRUCTION", "obstruction not blocked")
    check(movement.successor == movement.prior, "obstruction block changed position")
    return movement.canonical()


def m09() -> dict[str, Any]:
    near = agency.AgencyGameLoopEngine(state=state_at((0, 0, 0), (3, 0, 0)))
    far = agency.AgencyGameLoopEngine(state=state_at((0, 0, 0), (3, 0, 0)))
    near.advance(agency.GameTickInputV1(0, agency.MOVE_E))
    far.advance(agency.GameTickInputV1(0, agency.MOVE_W))
    near.advance(agency.GameTickInputV1(near.state.w, agency.STAY))
    far.advance(agency.GameTickInputV1(far.state.w, agency.STAY))
    check(any(item.observation.player_near for item in near.receipts), "successor player position not observed")
    check(not far.receipts[0].observation.player_near, "far successor incorrectly near")
    check(near.state.resonance_mode == agency.demo3.APPROACH, "resulting player state did not drive APPROACH")
    check(
        near.last_resonance_movement.status == agency.BLOCKED
        and near.last_resonance_movement.reason == "OBSTRUCTION",
        "all-entity obstruction law did not govern resonance",
    )
    return {
        "near_first_observation": near.receipts[0].observation,
        "near_mode": near.state.resonance_mode,
        "near_resonance_movement": near.last_resonance_movement,
        "far_first_observation": far.receipts[0].observation,
        "far_mode": far.state.resonance_mode,
    }


def m10() -> dict[str, Any]:
    engine = agency.run_actions((agency.STAY, agency.MOVE_N, agency.MOVE_S))
    check(engine.state.w == 3 and engine.step_fabric_calls == 3 and len(engine.receipts) == 3, "tick/step cardinality mismatch")
    return {"inputs": 3, "logical_ticks": engine.state.w, "step_fabric_calls": engine.step_fabric_calls}


def m11() -> dict[str, Any]:
    actions = (agency.MOVE_N, agency.MOVE_E, agency.MOVE_S, agency.STAY, agency.MOVE_W)
    left, right = agency.run_actions(actions), agency.run_actions(actions)
    check(left.trace_digest == right.trace_digest, "V1 replay differs")
    return {"actions": list(actions), "trace_digest": left.trace_digest}


def m12() -> dict[str, Any]:
    actions = (agency.MOVE_N, agency.STAY, agency.MOVE_E, agency.MOVE_S)
    projector = AsciiProjectionController()
    attached = agency.run_actions(actions, attached_projector=projector)
    headless = agency.run_actions(actions)
    check(attached.trace_digest == headless.trace_digest, "projector changed canonical trace")
    return {"attached_trace": attached.trace_digest, "headless_trace": headless.trace_digest, "frames": len(projector.frames)}


def m13() -> dict[str, Any]:
    engine = agency.AgencyGameLoopEngine()
    snapshot = engine.snapshot()
    projector = AsciiProjectionController()
    game = projector.project(snapshot)
    carrier = projector.toggle(snapshot)
    returned = projector.toggle(snapshot)
    check(snapshot.snapshot_digest == game.render_snapshot_digest == carrier.render_snapshot_digest == returned.render_snapshot_digest, "toggle changed snapshot")
    check(engine.state.w == 0 and not engine.receipts, "toggle advanced movement/tick")
    return {"game_frame": game.frame_digest, "carrier_frame": carrier.frame_digest, "snapshot": snapshot.snapshot_digest}


def _load_demo3_conformance() -> Any:
    path = agency.DEMO_003_DIR / "run_conformance.py"
    name = "mal_fabric_demo_003_conformance_replay"
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise AssertionError("legacy conformance unavailable")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    sys.path.insert(0, str(agency.DEMO_003_DIR))
    try:
        spec.loader.exec_module(module)
    finally:
        sys.path.pop(0)
    return module


def m14() -> dict[str, Any]:
    expected = json.loads(agency.DEMO_003_ACCEPTANCE_PATH.read_text(encoding="utf-8"))
    _receipts, replayed, _trace = _load_demo3_conformance().execute()
    check(replayed["passed"] == 28 and replayed["trace_digest"] == expected["trace_digest"], "legacy V0 replay changed")
    check(replayed["final_game_state_digest"] == expected["final_game_state_digest"], "legacy final game state changed")
    return {"legacy": "GameTickInputV0", "passed": replayed["passed"], "trace_digest": replayed["trace_digest"]}


def m15() -> dict[str, Any]:
    engine = agency.AgencyGameLoopEngine()
    legacy = agency.demo3.GameTickInput(
        0,
        engine.run_id,
        agency.canonical_digest(engine.state),
        agency.v33.canonical_digest(engine.fabric_state),
        agency.demo3.ObservationSet(False, False),
    )
    try:
        engine.advance(legacy)
    except agency.AgencyError as error:
        check(str(error) == "V0_FORBIDDEN_FOR_ACTIVE_PLAYER_AGENCY", "wrong V0 rejection")
        return {"legacy_input": "REJECTED", "reason": str(error)}
    raise AssertionError("V0 entered active agency path")


def m16() -> dict[str, Any]:
    identities = agency.import_identities()
    check(identities["demo_003_kernel_sha256"] == agency.DEMO_003_KERNEL_SHA256, "DEMO-003 kernel changed")
    check(identities["demo_003_acceptance_sha256"] == agency.DEMO_003_ACCEPTANCE_SHA256, "DEMO-003 evidence changed")
    check(identities["demo_003_promotion_sha256"] == agency.DEMO_003_PROMOTION_SHA256, "DEMO-003 promotion changed")
    return identities


VECTORS: tuple[tuple[str, str, Callable[[], dict[str, Any]]], ...] = (
    ("M01", "PlayerAction canonical encoding", m01),
    ("M02", "STAY preserves player position while w advances", m02),
    ("M03", "MOVE_N derives one canonical north successor", m03),
    ("M04", "MOVE_S derives one canonical south successor", m04),
    ("M05", "MOVE_E derives one canonical east successor", m05),
    ("M06", "MOVE_W derives one canonical west successor", m06),
    ("M07", "arena violation blocks and retains prior position", m07),
    ("M08", "obstruction violation blocks and retains prior position", m08),
    ("M09", "enemy behavior reads resulting canonical player state", m09),
    ("M10", "one GameTickInputV1 produces one logical tick", m10),
    ("M11", "same state and action sequence produces byte-identical trace", m11),
    ("M12", "projector attached and absent traces are identical", m12),
    ("M13", "GAME/CARRIER toggle has zero movement effect", m13),
    ("M14", "legacy V0 replay remains byte-identical", m14),
    ("M15", "V0 is forbidden for new playable Gen0 runs", m15),
    ("M16", "prior DEMO-003 evidence remains unchanged", m16),
)


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(agency.canonical_value(value), ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def execute() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    receipts = []
    for vector_id, description, function in VECTORS:
        details = function()
        receipts.append({"vector_id": vector_id, "description": description, "status": "PASS", "details": details})
        print(f"PASS {vector_id}  {description}")
    summary = {
        "amendment": "AMENDMENT-GAME-INPUT-AGENCY-001",
        "result": "HOLDS",
        "passed": len(receipts),
        "total": len(VECTORS),
        "evidence_artifact_count": len(receipts) + 1,
        "arena": agency.ARENA_GEN0_V1.canonical(),
        "input_versions": {"V0": "LEGACY_REPLAY_ONLY", "V1": "ACTIVE_PLAYER_AGENCY"},
        "player_position_authority": "KERNEL_ONLY",
        "player_action_has_zero_w_authority": "HOLDS",
        "ascii_semantic_authority": "NONE",
        "projector_attached_trace_equals_headless_trace": "HOLDS",
        "demo_003": "28/28 UNCHANGED",
        "imports": agency.import_identities(),
        "promotion": "NOT_PERFORMED",
    }
    return receipts, summary


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=HERE / "evidence")
    parser.add_argument("--summary", type=Path, default=HERE / "acceptance-summary.json")
    args = parser.parse_args()
    receipts, summary = execute()
    args.output.mkdir(parents=True, exist_ok=True)
    for receipt in receipts:
        write_json(args.output / f"{receipt['vector_id']}.json", receipt)
    write_json(args.output / "acceptance-summary.json", summary)
    write_json(args.summary, summary)
    print()
    print("AMENDMENT_GAME_INPUT_AGENCY_001 := HOLDS")
    print(f"M01-M16 := {summary['passed']}/{summary['total']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
