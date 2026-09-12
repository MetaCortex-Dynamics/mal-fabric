#!/usr/bin/env python3
"""Execute the frozen 24-vector DEMO-002 conformance corpus."""

from __future__ import annotations

import argparse
from dataclasses import replace
import json
from pathlib import Path
from typing import Any, Callable

from proposal_kernel import (
    ACCEPTED_FOR_ADMISSION,
    COMMITTED,
    DeterministicGrammar,
    GOVERNANCE_MAYBE,
    GOVERNANCE_NO,
    PROPOSAL_PARSE_MAYBE,
    PROPOSAL_READY,
    PROPOSED,
    REJECTED,
    STALE,
    SUPERSEDED,
    IntentRequest,
    VibeSession,
    apply_sequence,
    canonical_digest,
    demo1,
    fabric_digest,
    project_context,
    route_id,
    v31,
    v32,
)


def check(condition: bool, because: str) -> None:
    if not condition:
        raise AssertionError(because)


def visual_location(region: str) -> dict[str, Any]:
    return {
        "triad_position": {"kind": "INTERIOR", "dimension": region},
        "containment_path": ["behavior", "behavior_block", "visible_fabric"],
    }


def connect(source: str, target_role: str = "MEMBER") -> dict[str, str]:
    return {
        "kind": "CONNECT",
        "source_cell": source,
        "source_role": "RESULT",
        "target_cell": "action_bus",
        "target_role": target_role,
    }


def move_health_low(region: str = "□F") -> dict[str, Any]:
    return {
        "kind": "MOVE",
        "cell_id": "health_low",
        "from_location": visual_location("□S"),
        "to_location": visual_location(region),
    }


def p01() -> dict[str, Any]:
    session = VibeSession()
    before = session.current_fabric_digest
    view = session.propose("Make the enemy flee when health is low.")
    check(view["parse"]["status"] == PROPOSAL_READY, "supported intent did not parse")
    check(view["proposal"]["status"] == PROPOSED, "proposal lifecycle did not reach PROPOSED")
    check(view["promoted"]["canonical_digest"] == before, "proposer mutated promoted fabric")
    check(view["candidate"]["canonical_digest"] != before, "candidate preview was not derived")
    check(view["text_surfaces"]["PROMOTED"] != view["text_surfaces"]["CANDIDATE"], "text split absent")
    context = project_context(session.base.fabric)
    check(not hasattr(context, "fabric"), "ProposalContext exposed a FabricSpec handle")
    return {
        "status": view["proposal"]["status"],
        "proposal_id": view["proposal"]["proposal_id"],
        "text_split": True,
        "context_digest": context.digest,
    }


def p02() -> dict[str, Any]:
    left = VibeSession()
    right = VibeSession()
    p_left = left.propose("Make the enemy flee when health is low.")["proposal"]
    p_right = right.propose("Make the enemy flee when health is low.")["proposal"]
    check(p_left["proposal_id"] == p_right["proposal_id"], "proposal_id was nondeterministic")
    return {"left": p_left["proposal_id"], "right": p_right["proposal_id"], "same": True}


def p03() -> dict[str, Any]:
    session = VibeSession()
    current = session.current_fabric_digest
    view = session.propose("When the player is near, make the enemy approach.")
    check(view["proposal"]["baseline_fabric_digest"] == current, "proposal baseline not request-bound")
    check(view["geometric_diff"]["baseline_fabric_digest"] == current, "diff baseline diverged")
    return {"request_baseline": current, "proposal_baseline": view["proposal"]["baseline_fabric_digest"]}


def p04() -> dict[str, Any]:
    session = VibeSession()
    session.propose("When the player is near, make the enemy approach.")
    proposal = session.current.proposal
    check(proposal.proposal_ast.intent_kind == "APPROACH_WHEN_PLAYER_NEAR", "wrong ProposalAST")
    check(len(proposal.proposed_edits) == 1, "ProposalAST did not lower to one edit")
    check(isinstance(proposal.proposed_edits[0], v31.ConnectEdit), "lowered edit is not canonical CONNECT")
    return {
        "ast": proposal.proposal_ast.canonical(),
        "edits": [v31.edit_dict(item) for item in proposal.proposed_edits],
    }


def p05() -> dict[str, Any]:
    session = VibeSession()
    session.propose("Move the health-low branch into the functional region.")
    proposal = session.current.proposal
    derived = apply_sequence(session.current.baseline, proposal.proposed_edits)
    check(fabric_digest(derived) == proposal.candidate_fabric_digest, "candidate digest not APPLY_SEQUENCE+NORMALIZE")
    return {"candidate_digest": proposal.candidate_fabric_digest, "derived_digest": fabric_digest(derived)}


def p06() -> dict[str, Any]:
    left = VibeSession()
    right = VibeSession()
    left.propose("Make the enemy flee when health is low.")
    right.propose("Make the enemy flee when health is low.")
    p_left = left.current.proposal
    p_right = right.current.proposal
    changed_prose = replace(p_left, proposer_explanation="Different descriptive prose; no authority.")
    check(p_left.proposer_receipt == p_right.proposer_receipt, "proposer receipt diverged")
    check(canonical_digest(p_left.identity_payload()) == canonical_digest(changed_prose.identity_payload()), "prose entered identity")
    check(p_left.candidate_fabric_digest == changed_prose.candidate_fabric_digest, "prose changed candidate")
    return {
        "receipt": p_left.proposer_receipt,
        "proposal_id": p_left.proposal_id,
        "explanation_excluded": True,
    }


def gd01() -> dict[str, Any]:
    session = VibeSession()
    view = session.propose("When the player is near, make the enemy approach.")
    diff = view["geometric_diff"]
    check(len(diff["added_routes"]) == 1, "CONNECT not rendered as added route")
    rid = diff["added_routes"][0]["route_id"]
    trace = view["geometric_diff"]["origin_trace"].get(f"route:{rid}")
    check(trace is not None and trace["kind"] == "CONNECT", "added route lacks CONNECT trace")
    check(not diff["added_cells"], "grammar emitted an added cell")
    return {"route_id": rid, "origin": trace, "g01_edit_closure": "CONNECT"}


def gd02() -> dict[str, Any]:
    session = VibeSession()
    view = session.propose("Disconnect the patrol consequence.")
    diff = view["geometric_diff"]
    check(len(diff["removed_routes"]) == 1, "DISCONNECT not rendered as removed route")
    rid = diff["removed_routes"][0]["route_id"]
    check(diff["origin_trace"][f"route:{rid}"]["kind"] == "DISCONNECT", "removed route trace absent")
    return {"route_id": rid, "origin": diff["origin_trace"][f"route:{rid}"]}


def gd03() -> dict[str, Any]:
    session = VibeSession()
    view = session.propose("Move the health-low branch into the functional region.")
    diff = view["geometric_diff"]
    check(len(diff["moved_cells"]) == 1, "semantic location change not MOVE")
    check(len(diff["triad_changes"]) == 1, "TRIAD change not derived")
    before = diff["diff_id"]
    presented = session.set_presentation("health_low", 480.0, 210.0)
    check(presented["geometric_diff"]["diff_id"] == before, "x/y created semantic MOVE")
    return {"moved": diff["moved_cells"], "triad": diff["triad_changes"], "presentation_move": False}


def gd04() -> dict[str, Any]:
    session = VibeSession()
    view = session.propose("When the player is near, make the enemy approach.")
    diff = session.current.diff
    semantic = diff.semantic_delta()
    check("unchanged_context" not in semantic, "unchanged context entered semantic delta")
    check(len(diff.unchanged_context) > 0, "display context not retained")
    check(all(item["route_id"] != route_id("patrol", "action_bus", "MEMBER") for item in semantic["added_routes"]), "unchanged route entered delta")
    return {"semantic_keys": sorted(semantic), "unchanged_context_count": len(diff.unchanged_context)}


def gd05() -> dict[str, Any]:
    session = VibeSession()
    first = session.propose("Make the enemy flee when health is low.")["geometric_diff"]["diff_id"]
    view = session.set_presentation("enemy_flee", 12.5, 330.0)
    second = view["geometric_diff"]["diff_id"]
    check(first == second, "presentation rearrangement changed GeometricDiff identity")
    return {"before": first, "after": second, "same": True}


def d01() -> dict[str, Any]:
    session = VibeSession()
    session.propose("Make the enemy flee when health is low.")
    candidate = session.current.proposal.candidate_fabric_digest
    accepted = session.accept()
    check(accepted["proposal"]["status"] == ACCEPTED_FOR_ADMISSION, "ACCEPT did not submit candidate")
    committed = session.submit_admission()
    check(committed["promoted"]["canonical_digest"] == candidate, "authority path did not commit exact candidate")
    check(committed["proposal_history"][-1]["admission_outcome"] == COMMITTED, "commit not recorded")
    return {"candidate_digest": candidate, "promoted_digest": committed["promoted"]["canonical_digest"]}


def d02() -> dict[str, Any]:
    session = VibeSession()
    baseline = session.current_fabric_digest
    session.propose("Make the enemy flee when health is low.")
    view = session.accept()
    check(view["promoted"]["canonical_digest"] == baseline, "ACCEPT alone committed")
    check(view["proposal"]["status"] == ACCEPTED_FOR_ADMISSION, "submission state missing")
    return {"promoted_digest": baseline, "status": view["proposal"]["status"], "accept_is_promotion": False}


def d03() -> dict[str, Any]:
    session = VibeSession()
    session.propose("When the player is near, make the enemy approach.")
    predecessor = session.current.proposal
    view = session.modify("TEXT", move_health_low())
    successor = session.current.proposal
    check(successor.parent_proposal_id == predecessor.proposal_id, "successor parent missing")
    check(successor.proposal_id != predecessor.proposal_id, "MODIFY reused proposal identity")
    check(successor.baseline_fabric_digest == predecessor.baseline_fabric_digest, "MODIFY changed baseline")
    return {"predecessor": predecessor.proposal_id, "successor": successor.proposal_id, "status": view["proposal"]["status"]}


def d04() -> dict[str, Any]:
    session = VibeSession()
    session.propose("When the player is near, make the enemy approach.")
    predecessor = session.current.proposal.proposal_id
    view = session.modify("VISUAL", move_health_low())
    history = view["proposal_history"]
    check(len(history) == 2, "MODIFY genealogy not retained")
    check(history[0]["proposal_id"] == predecessor and history[0]["disposition"] == "MODIFY", "predecessor not superseded in history")
    check(history[1]["parent_proposal_id"] == predecessor, "successor genealogy broken")
    return {"history": history}


def d05() -> dict[str, Any]:
    session = VibeSession()
    session.runtime_start()
    baseline = session.current_fabric_digest
    runtime_before = canonical_digest(session.view()["runtime"])
    session.propose("Make the enemy flee when health is low.")
    view = session.reject()
    check(view["promoted"]["canonical_digest"] == baseline, "REJECT mutated promoted fabric")
    check(canonical_digest(view["runtime"]) == runtime_before, "REJECT mutated runtime")
    check(view["proposal_history"][-1]["disposition"] == "REJECT", "REJECT evidence absent")
    committed = VibeSession()
    committed.propose("Make the enemy flee when health is low.")
    committed.accept()
    committed.submit_admission()
    committed_digest = committed.current_fabric_digest
    undo_refused = False
    try:
        committed.reject()
    except ValueError:
        undo_refused = True
    check(undo_refused, "REJECT retroactively undid committed geometry")
    check(committed.current_fabric_digest == committed_digest, "committed fabric changed after REJECT attempt")
    return {
        "promoted_same": True,
        "runtime_same": True,
        "history_status": REJECTED,
        "committed_undo_requires_new_edit": True,
    }


def d06() -> dict[str, Any]:
    session = VibeSession()
    session.propose("Make the enemy flee when health is low.")
    old_baseline = session.current.proposal.baseline_fabric_digest
    session.base.edit("TEXT", connect("enemy_approach"))
    session.base.accept()
    changed = session.current_fabric_digest
    view = session.accept()
    check(old_baseline != changed, "test failed to change baseline")
    check(view["proposal"]["status"] == STALE, "stale proposal not marked STALE")
    check(view["promoted"]["canonical_digest"] == changed, "stale proposal committed")
    return {"proposal_baseline": old_baseline, "current": changed, "status": STALE}


def a01() -> dict[str, Any]:
    session = VibeSession()
    before = session.current_fabric_digest
    view = session.propose("Make the enemy flee when health is low.")
    check(view["promoted"]["canonical_digest"] == before, "proposer wrote promoted state")
    check(not hasattr(session.backend, "commit"), "proposer backend exposes commit")
    check(not hasattr(session, "propose_and_commit"), "direct commit API exists")
    return {"nl_proposer_direct_commit": "FORBIDDEN", "promoted_digest": before}


def a02() -> dict[str, Any]:
    session = VibeSession()
    baseline = session.current_fabric_digest
    session.propose("Make the enemy flee when health is low.")
    valid = session.current.proposal
    invalid = v31.ConnectEdit("player_near", v31.RESULT, "action_bus", "RESULT")
    session.current.proposal = replace(valid, proposed_edits=(invalid,))
    session.accept()
    view = session.submit_admission()
    check(view["proposal"]["status"] == GOVERNANCE_NO, "V3.1 rejection did not block commit")
    check(view["promoted"]["canonical_digest"] == baseline, "V3.1-rejected candidate committed")
    receipt = view["proposal"]["admission_receipts"][-1]
    check(receipt["stage"].startswith("V3_1_DRC"), "rejection did not occur at V3.1 boundary")
    return {"status": GOVERNANCE_NO, "stage": receipt["stage"], "promoted_digest": baseline}


def a03() -> dict[str, Any]:
    imported = demo1.DemoSession()
    imported.fabric = demo1.fixture_fabric(action_region="□F")
    session = VibeSession(imported)
    session.propose("When the player is near, make the enemy approach.")
    session.accept()
    view = session.submit_admission("missing_evidence")
    check(view["proposal"]["status"] == GOVERNANCE_MAYBE, "V3.2 MAYBE did not remain pending")
    check(view["promoted"]["canonical_digest"] == session.current.proposal.baseline_fabric_digest, "MAYBE committed")
    return {"status": view["proposal"]["status"], "executable": False}


def a04() -> dict[str, Any]:
    imported = demo1.DemoSession()
    imported.fabric = demo1.fixture_fabric(action_region="□F")
    session = VibeSession(imported)
    baseline = session.current_fabric_digest
    session.propose("When the player is near, make the enemy approach.")
    session.accept()
    view = session.submit_admission("missing_capability")
    check(view["proposal"]["status"] == GOVERNANCE_NO, "V3.2 NO not retained")
    check(view["promoted"]["canonical_digest"] == baseline, "V3.2 NO mutated promoted fabric")
    return {"status": GOVERNANCE_NO, "promoted_digest": baseline}


def a05() -> dict[str, Any]:
    session = VibeSession()
    session.propose("Make the enemy flee when health is low.")
    blocked_proposed = False
    try:
        session.runtime_start()
    except ValueError:
        blocked_proposed = True
    session.accept()
    blocked_accepted = False
    try:
        session.runtime_start()
    except ValueError:
        blocked_accepted = True
    session.submit_admission()
    running = session.runtime_start()["runtime"]["run_status"]
    check(blocked_proposed and blocked_accepted, "pending candidate entered V3.3")
    check(running == "RUNNING", "committed candidate did not execute")
    return {"proposed_blocked": True, "accepted_blocked": True, "committed_status": running}


def n01() -> dict[str, Any]:
    left = VibeSession()
    right = VibeSession()
    p_left = left.propose("Make the enemy flee when health is low.")["proposal"]
    p_right = right.propose("When health is low… the enemy should flee!")["proposal"]
    check(p_left["normalized_intent"] == p_right["normalized_intent"], "declared equivalents normalized differently")
    check(p_left["proposal_id"] == p_right["proposal_id"], "declared equivalents produced NOT-SAME proposal")
    return {"normalized": p_left["normalized_intent"], "proposal_id": p_left["proposal_id"]}


def n02() -> dict[str, Any]:
    session = VibeSession()
    baseline = session.current_fabric_digest
    view = session.propose("Make it smarter and do the right thing.")
    check(view["parse"]["status"] == PROPOSAL_PARSE_MAYBE, "unsupported intent did not produce parser MAYBE")
    check(view["proposal"] is None and view["candidate"] is None, "parser MAYBE constructed candidate")
    check(view["promoted"]["canonical_digest"] == baseline, "malformed intent mutated promoted state")
    check(view["parse"]["proposal"] is None, "parse failure encoded empty proposal")
    return {"status": PROPOSAL_PARSE_MAYBE, "needed": view["parse"]["needed"], "candidate": None}


Vector = tuple[str, str, str, Callable[[], dict[str, Any]]]
VECTORS: tuple[Vector, ...] = (
    ("P01", "P", "supported IntentRequest produces typed IntentProposal", p01),
    ("P02", "P", "proposal_id is deterministic", p02),
    ("P03", "P", "proposal baseline is request-bound", p03),
    ("P04", "P", "ProposalAST lowers to canonical FabricEditAST", p04),
    ("P05", "P", "candidate digest is APPLY_SEQUENCE plus NORMALIZE", p05),
    ("P06", "P", "receipt deterministic and explanation excluded", p06),
    ("G01", "G", "added route is visible and traced to CONNECT", gd01),
    ("G02", "G", "disconnected relation is visible", gd02),
    ("G03", "G", "MOVE is semantic LOCATION change, not x/y", gd03),
    ("G04", "G", "unchanged context is outside semantic delta", gd04),
    ("G05", "G", "presentation rearrangement preserves diff identity", gd05),
    ("D01", "D", "ACCEPT submits exact candidate to V3.1/V3.2", d01),
    ("D02", "D", "ACCEPT alone does not commit", d02),
    ("D03", "D", "MODIFY creates NOT-SAME successor", d03),
    ("D04", "D", "MODIFY preserves predecessor genealogy", d04),
    ("D05", "D", "REJECT preserves promoted fabric and runtime", d05),
    ("D06", "D", "stale baseline prevents commit", d06),
    ("A01", "A", "direct proposer commit is impossible", a01),
    ("A02", "A", "V3.1 rejection blocks commit", a02),
    ("A03", "A", "V3.2 MAYBE is visible and non-executable", a03),
    ("A04", "A", "V3.2 NO preserves promoted fabric", a04),
    ("A05", "A", "only committed candidate enters V3.3", a05),
    ("N01", "N", "declared-equivalent phrasings produce SAME proposal", n01),
    ("N02", "N", "unsupported intent yields MAYBE with no candidate", n02),
)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def run(output: Path) -> dict[str, Any]:
    receipts = []
    for vector_id, family, title, test in VECTORS:
        try:
            observations = test()
            receipt = {
                "vector_id": vector_id,
                "family": family,
                "title": title,
                "passed": True,
                "observations": observations,
            }
            print(f"PASS {vector_id}  {title}")
        except Exception as exc:
            receipt = {
                "vector_id": vector_id,
                "family": family,
                "title": title,
                "passed": False,
                "because": f"{type(exc).__name__}: {exc}",
            }
            print(f"FAIL {vector_id}  {title}: {receipt['because']}")
        receipts.append(receipt)
        write_json(output / f"{vector_id}.json", receipt)

    counts = {}
    for family in ("P", "G", "D", "A", "N"):
        members = [item for item in receipts if item["family"] == family]
        counts[family] = {"passed": sum(item["passed"] for item in members), "total": len(members)}
    passed = sum(item["passed"] for item in receipts)
    summary = {
        "demo": "DEMO_002_VIBE_PROPOSER",
        "spec_version": "v0.2+G01-EDIT-CLOSURE",
        "counts": counts,
        "passed": passed,
        "total": len(VECTORS),
        "conformance": f"{passed}/{len(VECTORS)}",
        "holds": passed == len(VECTORS),
        "evidence_artifact_count": 25,
        "authority": {
            "nl_proposer_direct_commit": "FORBIDDEN",
            "accept_is_submission_not_promotion": True,
            "pending_proposal_execution": "FORBIDDEN",
        },
        "claims": {
            "g01_edit_closure": "CONNECT_ADDS_ROUTE",
            "modify_creates_successor_identity": True,
            "reject_preserves_promoted_fabric": True,
            "committed_undo_requires_new_edit": True,
            "presentation_invariance": True,
            "malformed_output_creates_no_candidate": True,
            "promoted_candidate_text_split": True,
            "proposal_history": True,
        },
        "imports": {
            "mal_fabric_version": "v0.4.0",
            "mal_fabric_doi": "10.5281/zenodo.22718622",
            "demo_001": "UNCHANGED",
            "v3_1": "UNCHANGED",
            "v3_2": "UNCHANGED",
            "v3_3": "UNCHANGED",
            "kernel_hashes": demo1.KERNEL_HASHES,
        },
        "receipt_ids": [item["vector_id"] for item in receipts],
        "promotion": "NOT_PERFORMED",
    }
    write_json(output / "acceptance-summary.json", summary)
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Run DEMO-002 24-vector conformance")
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("evidence"))
    args = parser.parse_args()
    summary = run(args.output)
    print(f"\nDEMO_002_VIBE_PROPOSER := {'HOLDS' if summary['holds'] else 'FAILS'}")
    for family in ("P", "G", "D", "A", "N"):
        count = summary["counts"][family]
        print(f"{family} := {count['passed']}/{count['total']}")
    print(f"TOTAL := {summary['conformance']}")
    return 0 if summary["holds"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
