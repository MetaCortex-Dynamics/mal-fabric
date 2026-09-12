#!/usr/bin/env python3
"""Run the frozen DEMO-001 acceptance target D01-D18."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Callable

from demo_adapter import (
    DEMO_PROMPT,
    DemoSession,
    deterministic_replay,
    fixture_fabric,
    location,
    v31,
    v32,
    v33,
)


def visual_location(region: str) -> dict[str, Any]:
    return {
        "triad_position": {"kind": "INTERIOR", "dimension": region},
        "containment_path": ["behavior", "behavior_block", "visible_fabric"],
    }


def wire(source: str, target: str = "action_bus", role: str = "MEMBER") -> dict[str, str]:
    return {
        "kind": "WIRE",
        "source_cell": source,
        "source_role": "RESULT",
        "target_cell": target,
        "target_role": role,
    }


def text_connect(source: str) -> dict[str, str]:
    item = wire(source)
    item["kind"] = "CONNECT"
    return item


def route_id(source: str, target: str = "action_bus", role: str = "MEMBER") -> str:
    return v31.sha256_route_id((source, "RESULT", target, role))


def check(condition: bool, because: str) -> None:
    if not condition:
        raise AssertionError(because)


def d01() -> dict[str, Any]:
    session = DemoSession()
    committed = session.view()["committed_digest"]
    view = session.propose(DEMO_PROMPT)
    check(view["candidate"]["state"] == "ADMITTED", "NL candidate not admitted")
    check(view["visible"]["valid"], "NL candidate invalid")
    check(view["committed_digest"] == committed, "proposer mutated committed fabric")
    return {"candidate_state": view["candidate"]["state"], "authority": view["nl_authority"]}


def d02() -> dict[str, Any]:
    session = DemoSession()
    view = session.edit("VISUAL", {"kind": "DRAG_IN", "cell_id": "enemy_flee", "location": visual_location("□F")})
    edit = session.candidate.edits[0]
    check(isinstance(edit, v31.PlaceEdit), "visual PLACE did not lower to PlaceEdit")
    check(view["candidate"]["authorized"], "PLACE was not governed")
    return v31.edit_dict(edit)


def d03() -> dict[str, Any]:
    session = DemoSession()
    view = session.edit("VISUAL", {
        "kind": "DRAG", "cell_id": "enemy_flee",
        "from_location": visual_location("□S"), "to_location": visual_location("□F"),
    })
    check(isinstance(session.candidate.edits[0], v31.MoveEdit), "semantic drag did not lower to MoveEdit")
    return view["candidate"]["edits"][0]


def d04() -> dict[str, Any]:
    session = DemoSession()
    before = session.view()["committed_digest"]
    view = session.edit("VISUAL", {
        "kind": "DRAG", "cell_id": "enemy_flee",
        "from_location": visual_location("□S"), "to_location": visual_location("□S"),
    })
    check(session.candidate is None, "cosmetic drag created a candidate")
    check(view["committed_digest"] == before, "cosmetic drag mutated semantics")
    return {"digest": before, "event": view["last_event"]}


def d05() -> dict[str, Any]:
    session = DemoSession()
    view = session.edit("VISUAL", wire("enemy_approach"))
    check(isinstance(session.candidate.edits[0], v31.ConnectEdit), "WIRE did not lower to ConnectEdit")
    return view["candidate"]["edits"][0]


def admitted_demo() -> DemoSession:
    session = DemoSession()
    session.propose(DEMO_PROMPT)
    session.accept()
    return session


def d06() -> dict[str, Any]:
    session = admitted_demo()
    view = session.edit("VISUAL", {"kind": "DELETE_ROUTE", "route_id": route_id("enemy_flee")})
    check(isinstance(session.candidate.edits[0], v31.DisconnectEdit), "delete did not lower to DisconnectEdit")
    check(view["candidate"]["authorized"], "valid disconnect not admitted")
    return view["candidate"]["edits"][0]


def d07() -> dict[str, Any]:
    text = DemoSession()
    visual = DemoSession()
    text.edit("TEXT", text_connect("enemy_approach"))
    visual.edit("VISUAL", wire("enemy_approach"))
    same = v31.same_fabric(text.candidate.successor, visual.candidate.successor)
    check(same, "text/visual edits diverged")
    check(v31.edit_dict(text.candidate.edits[0]) == v31.edit_dict(visual.candidate.edits[0]), "FabricEditAST differs")
    return {"same_fabric": same, "digest": v31.canonical_digest(v31.normalize(text.candidate.successor))}


def d08() -> dict[str, Any]:
    session = DemoSession()
    view = session.edit("VISUAL", wire("player_near", "action_bus", "RESULT"))
    admission = view["candidate"]["admissions"][0]
    check(admission["terminal_verdict"] == v32.NO, "invalid route did not fail")
    check(admission["stage"].startswith("V3_1_DRC"), "V3.1 rejection boundary not visible")
    check(bool(admission["because"]), "V3.1 rejection lacks reason")
    return admission


def crossing_session(mode: str) -> dict[str, Any]:
    session = DemoSession()
    session.fabric = fixture_fabric(action_region="□F")
    return session.edit("VISUAL", wire("enemy_approach"), evidence_mode=mode)


def d09() -> dict[str, Any]:
    view = crossing_session("missing_evidence")
    check(view["candidate"]["state"] == "MAYBE", "missing evidence did not produce MAYBE")
    check(view["candidate"]["execution_authority"] == "NO", "MAYBE gained execution authority")
    obligations = view["candidate"]["admissions"][0]["evidence_obligations"]
    check(bool(obligations), "MAYBE obligation not visible")
    return {"state": "MAYBE", "obligations": obligations}


def d10() -> dict[str, Any]:
    view = crossing_session("missing_capability")
    admission = view["candidate"]["admissions"][0]
    check(view["candidate"]["state"] == "REJECTED", "missing capability not rejected")
    check(admission["terminal_verdict"] == v32.NO and admission["because"], "NO lacks BECAUSE")
    return admission


def d11() -> dict[str, Any]:
    session = admitted_demo()
    started = session.runtime_start()
    ticked = session.runtime_tick()
    check(started["runtime"]["run_status"] == v33.RUNNING, "admitted fabric did not start")
    check(ticked["runtime"]["ticks"] == 1, "V3.3 tick did not execute")
    return {"status": ticked["runtime"]["run_status"], "ticks": 1}


def d12() -> dict[str, Any]:
    session = admitted_demo()
    seen = set(session.runtime_start()["runtime"]["phases"].values())
    for _ in range(7):
        seen.update(session.runtime_tick()["runtime"]["phases"].values())
    expected = {v33.EMPTY, v33.ADMITTED, v33.COMPLETED, v33.DISCHARGED}
    check(expected <= seen, f"runtime overlay phases missing: {sorted(expected - seen)}")
    return {"phases": sorted(seen)}


def d13() -> dict[str, Any]:
    session = admitted_demo()
    runtime = session.runtime_blocked_fixture()["runtime"]
    check(runtime["run_status"] == v33.BLOCKED, "partial custody not BLOCKED")
    check(runtime["blocked_reasons"][0]["kind"] == "PARTIAL_INPUT", "canonical BlockedReason missing")
    return {"status": runtime["run_status"], "reasons": runtime["blocked_reasons"]}


def d14() -> dict[str, Any]:
    session = admitted_demo()
    halted = session.runtime_halted_fixture()["runtime"]
    check(halted["run_status"] == v33.HALTED, "empty terminal state not HALTED")
    check(not halted["blocked_reasons"], "HALTED reported blocked reason")
    return {"halted": halted["run_status"], "not_blocked": halted["run_status"] != v33.BLOCKED}


def d15() -> dict[str, Any]:
    session = DemoSession()
    before = session.view()["visible"]["canonical_json"]
    after = session.edit("VISUAL", wire("enemy_approach"))["visible"]["canonical_json"]
    check(before != after, "visual edit did not update text serialization")
    return {"changed": True}


def d16() -> dict[str, Any]:
    session = DemoSession()
    view = session.edit("TEXT", {
        "kind": "MOVE", "cell_id": "enemy_flee",
        "from_location": visual_location("□S"), "to_location": visual_location("□F"),
    })
    cell = next(item for item in view["visible"]["cells"] if item["cell_id"] == "enemy_flee")
    check(cell["location"]["triad_position"]["dimension"] == "□F", "text MOVE not reflected visually")
    return {"cell": "enemy_flee", "region": "□F"}


def d17() -> dict[str, Any]:
    session = DemoSession()
    result = session.set_presentation("enemy_flee", 48.5, 280)
    check(result["same"], "presentation coordinates entered canonical digest")
    return {"same": result["same"], "digest": result["after"]}


def d18() -> dict[str, Any]:
    left, right = deterministic_replay()
    check(left == right, "repeated run diverged")
    return {"left": left, "right": right, "same": True}


TESTS: tuple[tuple[str, str, Callable[[], dict[str, Any]]], ...] = (
    ("D01", "NL proposal produces valid candidate FabricSpec", d01),
    ("D02", "visual PLACE lowers to canonical PLACE", d02),
    ("D03", "semantic drag lowers to canonical MOVE", d03),
    ("D04", "cosmetic drag is presentation-only", d04),
    ("D05", "visual CONNECT lowers to canonical CONNECT", d05),
    ("D06", "visual DISCONNECT lowers to canonical DISCONNECT", d06),
    ("D07", "text and visual edits converge", d07),
    ("D08", "invalid visual route shows V3.1 rejection", d08),
    ("D09", "V3.2 MAYBE remains visible and blocked", d09),
    ("D10", "V3.2 NO is rejected with BECAUSE", d10),
    ("D11", "admitted fabric executes under V3.3", d11),
    ("D12", "runtime overlay displays every payload phase", d12),
    ("D13", "BLOCKED displays canonical reason", d13),
    ("D14", "HALTED is distinguished from BLOCKED", d14),
    ("D15", "visual edit updates text serialization", d15),
    ("D16", "text edit updates visual geometry", d16),
    ("D17", "presentation x/y preserves canonical digest", d17),
    ("D18", "same initial state replays identically", d18),
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run DEMO-001 D01-D18")
    parser.add_argument("--json", type=Path, help="write a deterministic acceptance summary")
    args = parser.parse_args()
    receipts = []
    for test_id, title, test in TESTS:
        try:
            observations = test()
            receipt = {"test_id": test_id, "title": title, "passed": True, "observations": observations}
            print(f"PASS {test_id}  {title}")
        except Exception as exc:
            receipt = {"test_id": test_id, "title": title, "passed": False, "because": f"{type(exc).__name__}: {exc}"}
            print(f"FAIL {test_id}  {title}: {receipt['because']}")
        receipts.append(receipt)
    passed = sum(item["passed"] for item in receipts)
    summary = {
        "demo": "DEMO-001_VISIBLE_FABRIC",
        "passed": passed,
        "total": len(TESTS),
        "holds": passed == len(TESTS),
        "receipts": receipts,
    }
    if args.json:
        args.json.write_text(json.dumps(summary, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print(f"\nDEMO_001_VISIBLE_FABRIC := {'HOLDS' if summary['holds'] else 'FAILS'}")
    print(f"D01-D18 := {passed}/{len(TESTS)}")
    return 0 if summary["holds"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
