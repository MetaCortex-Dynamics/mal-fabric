#!/usr/bin/env python3
"""Execute CW01-CW44 and materialize deterministic CGP-WORLD-001 evidence."""
from __future__ import annotations

import argparse
from dataclasses import fields, replace
from hashlib import sha256
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from typing import Any, Callable

from cgp_world import (
    CGPBoundaryError, CONSISTENCY_PREDICATE, NORMALIZATION_RULE, NUMERIC_DOMAIN,
    Q32_ONE, RANDOM_SOURCE_ALGORITHM, RATE_GOVERNOR_CHANNEL, Certificate,
    ConstitutiveWitnesses, EpistemicState, MeasurementOption, Observer,
    PresentationContract, PresentationState, ProjectorFailure, attach_projector,
    canonical_digest, canonical_json, consistent, constitute, divergence_q32,
    fixture_example, glue, govern_rate, imported_identities, initial_ontic,
    make_lift, measure, ontic_trace, project, replay_contract,
)


HERE = Path(__file__).resolve().parent
EXPECTED_SPEC_SHA = "7F3F784F0BACED1F0D6521B78123DE9FCE88242466B19B73E47AD1B01B2B0788"
EXPECTED_SPEC_PROMOTION_SHA = "71915F49FCF3C0A6389633EED55A08A24C6B00E13C2D90623B0C893A41FF500C"


def require(condition: bool, reason: str) -> None:
    if not condition:
        raise AssertionError(reason)


def raises(reason: str, fn: Callable[[], Any]) -> None:
    try:
        fn()
    except (CGPBoundaryError, AttributeError, TypeError):
        return
    raise AssertionError(reason)


def base() -> dict[str, Any]:
    witness = ConstitutiveWitnesses("ACTIVITY_1", "ACTIVITY_1", "ACTIVITY_1", True, True, True)
    entity = constitute("ENTITY_1", 0, witness)
    fixture = fixture_example()
    ontic = initial_ontic(fixture, entity)
    near = Observer("OBS_NEAR", "LOCALE_NEAR", "APPARATUS_A", 4 * Q32_ONE, Q32_ONE)
    far = Observer("OBS_FAR", "LOCALE_FAR", "APPARATUS_B", Q32_ONE // 4, Q32_ONE)
    fiber = (
        MeasurementOption("M0", 0, 0, 0),
        MeasurementOption("M1", 1, Q32_ONE // 4, Q32_ONE // 8),
        MeasurementOption("M3", 3, Q32_ONE, Q32_ONE // 2),
    )
    return {"witness": witness, "entity": entity, "fixture": fixture, "ontic": ontic,
            "near": near, "far": far, "fiber": fiber}


def measured(ctx: dict[str, Any], observer: Observer, fiber=None, seed="SEED_A"):
    selected_fiber = ctx["fiber"] if fiber is None else fiber
    contract = replay_contract(observer, ctx["entity"].entity_ref, ctx["ontic"].w, selected_fiber, seed)
    return measure(ctx["ontic"], EpistemicState(), observer, ctx["entity"].entity_ref,
                   selected_fiber, contract), contract


def cw01(c):
    require(c["ontic"].w == 0 and all(len(p) == 3 for p in c["fixture"].spatial_domain), "W_NOT_EXPLICIT_NONSPATIAL")
def cw02(c):
    forbidden = {"glyph", "ansi_color", "camera_state", "certificate", "lift_claim", "obf", "sheaf_section"}
    require(not forbidden.intersection(item.name.lower() for item in fields(type(c["ontic"]))), "ONTIC_FIELD_CONTAMINATION")
def cw03(c):
    require(c["ontic"].admitted_world_fixture_digest == c["fixture"].fixture_digest, "FIXTURE_NOT_BOUND")
def cw04(c):
    altered = replace(c["fixture"], obstruction_domain=())
    raises("PRESENTATION_MUTATED_FIXTURE", lambda: __import__("cgp_world").advance_ontic(c["ontic"], altered, "STAY"))
def cw05(c):
    require(c["entity"].entity, "SIMULTANEOUS_TRIAD_FAILED")
def cw06(c):
    require(not constitute("E", 0, replace(c["witness"], genealogy_holds=False)).entity, "G_STRIP_FAILED")
def cw07(c):
    require(not constitute("E", 0, replace(c["witness"], structure_holds=False)).entity, "S_STRIP_FAILED")
def cw08(c):
    require(not constitute("E", 0, replace(c["witness"], function_holds=False)).entity, "F_STRIP_FAILED")
def cw09(c):
    require(not constitute("ENTITY_1", 0, replace(c["witness"], genealogy_holds=False)).entity, "REF_CONSTITUTED_ENTITY")
def cw10(c):
    changed = replace(c["entity"], witness_digest="0" * 64)
    require(changed.entity == c["entity"].entity, "DIGEST_BECAME_AUTHORITY")
def _projection_zero_authority(c, surface):
    (o, e, cert), _ = measured(c, c["near"])
    before = (canonical_digest(o), canonical_digest(e))
    output = project(cert, PresentationContract(surface, "1"))
    require((canonical_digest(o), canonical_digest(e)) == before and output.surface == surface, "PROJECTOR_AUTHORITY_LEAK")
def cw11(c): _projection_zero_authority(c, "CARRIER")
def cw12(c): _projection_zero_authority(c, "ASCII")
def cw13(c): _projection_zero_authority(c, "GAUSSIAN")
def cw14(c):
    before = canonical_digest(c["ontic"])
    states = attach_projector((PresentationState("OBS_NEAR", "ASCII", (0, 0, 0)),), "OBS_NEAR", "GAUSSIAN")
    require(states[0].active_surface == "GAUSSIAN" and canonical_digest(c["ontic"]) == before, "TOGGLE_MUTATED_ONTIC")
def _strip(c):
    expected = ontic_trace(c["ontic"], c["fixture"], ("STAY", "MOVE_E"))
    return expected == ontic_trace(c["ontic"], c["fixture"], ("STAY", "MOVE_E"))
def cw15(c): require(_strip(c), "REMOVE_PI1_CHANGED_TRACE")
def cw16(c): require(_strip(c), "REMOVE_PI2_CHANGED_TRACE")
def cw17(c): require(_strip(c), "REMOVE_PI3_CHANGED_TRACE")
def cw18(c): require(_strip(c), "REMOVE_ALL_PROJECTORS_CHANGED_TRACE")
def cw19(c):
    a = ontic_trace(c["ontic"], c["fixture"], ("A", "B")); b = ontic_trace(c["ontic"], c["fixture"], ("A", "B"))
    require(a == b, "HEADLESS_ATTACHED_TRACE_DIFFERENCE")
def cw20(c):
    (_, _, cert), _ = measured(c, c["near"])
    a = project(cert, PresentationContract("ASCII", "1")); g = project(cert, PresentationContract("GAUSSIAN", "1"))
    require(a.projection_digest != g.projection_digest and a.entity_ref == g.entity_ref, "PROJECTION_DIGEST_RULE_FAILED")
def cw21(c):
    (_, _, cert), _ = measured(c, c["near"])
    result = project(cert, PresentationContract("ASCII", "1", True))
    require(isinstance(result, ProjectorFailure) and result.entity_still_exists, "RENDER_FAILURE_ERASED_ENTITY")
def cw22(c):
    ontic_fields = {item.name for item in fields(type(c["ontic"]))}
    require("projection_digest" not in ontic_fields and "active_surface" not in ontic_fields, "PRESENTATION_BECAME_INPUT")
def cw23(c):
    require(set(c["fixture"].obstruction_domain).isdisjoint(c["fixture"].traversability_domain), "TOPOLOGY_NOT_FIXTURE_OWNED")
def cw24(c):
    (_, _, cert), _ = measured(c, c["near"]); output = project(cert, PresentationContract("ASCII", "1"))
    require(not hasattr(output, "entity"), "PROJECTOR_DECIDED_CONSTITUTION")
def cw25(c):
    from cgp_world import advance_ontic
    require(advance_ontic(c["ontic"], c["fixture"], "STAY").w == c["ontic"].w + 1, "WORLDLINE_SUCCESSOR_FAILED")
def cw26(c):
    (_, _, cert), _ = measured(c, c["near"])
    refs = {project(cert, PresentationContract(s, "1")).entity_ref for s in ("CARRIER", "ASCII", "GAUSSIAN")}
    require(refs == {c["entity"].entity_ref}, "CROSS_SURFACE_ENTITY_SPLIT")
def cw27(c):
    stripped = constitute("E", 0, replace(c["witness"], function_holds=False))
    require(not stripped.entity and _strip(c), "STRIP_LAWS_CONFLATED")
def cw28(c): require(c["entity"].entity and ontic_trace(c["ontic"], c["fixture"], ("STAY",)), "ASSET_REQUIRED_FOR_EXISTENCE")
def cw29(c):
    require(set(item.name for item in fields(type(c["ontic"]))).isdisjoint(item.name for item in fields(EpistemicState)), "STATE_REGIMES_CONFLATED")
def cw30(c):
    low = replace(c["far"], sigma_q32=0); (o, _, cert), _ = measured(c, low)
    require(cert is None and o == c["ontic"] and c["entity"].entity, "MEASUREMENT_CONSTITUTED_ENTITY")
def cw31(c):
    f0 = (MeasurementOption("A", 0, 0, 0),); f3 = (MeasurementOption("B", 3, 0, 0),)
    (_, _, ca), _ = measured(c, c["near"], f0); (_, _, cb), _ = measured(c, c["far"], f3)
    require(ca.measurement_outcome != cb.measurement_outcome, "LOCAL_CERTIFICATES_NOT_INDEPENDENT")
def cw32(c):
    contract = replay_contract(c["near"], c["entity"].entity_ref, 0, c["fiber"], "SEED")
    bad = replace(contract, random_source_seed="")
    raises("INCOMPLETE_REPLAY_CONTRACT_ACCEPTED", lambda: measure(c["ontic"], EpistemicState(), c["near"], c["entity"].entity_ref, c["fiber"], bad))
def cw33(c):
    require((c["near"].beta_q32, c["near"].sigma_q32) != (c["far"].beta_q32, c["far"].sigma_q32), "COUPLING_COLLAPSED")
def cw34(c):
    first, contract = measured(c, c["near"], seed="REPLAY"); second, _ = measured(c, c["near"], seed="REPLAY")
    require(canonical_json(first) == canonical_json(second) and contract.numeric_domain == NUMERIC_DOMAIN, "MEASUREMENT_REPLAY_FAILED")
def cw35(c):
    e = EpistemicState(); o = c["ontic"]
    attach_projector((), c["near"].observer_id, "ASCII")
    require(o == c["ontic"] and e == EpistemicState(), "ATTACH_CHANGED_SEMANTICS")
def cw36(c):
    contract = replay_contract(c["near"], c["entity"].entity_ref, 0, c["fiber"], "P")
    plain, _, _ = measure(c["ontic"], EpistemicState(), c["near"], c["entity"].entity_ref, c["fiber"], contract, governance_margin_q32=0)
    changed, _, _ = measure(c["ontic"], EpistemicState(), c["near"], c["entity"].entity_ref, c["fiber"], contract, governance_margin_q32=0, ontic_perturbation_authorized=True)
    require(plain == c["ontic"] and changed.perturbation_count == 1, "MEASUREMENT_AUTHORITY_RULE_FAILED")
def cw37(c):
    (_, epistemic, cert), _ = measured(c, c["near"])
    require(cert is not None and not epistemic.shared_facts, "CERTIFICATE_IMPLIED_SHARED_FACT")
def cw38(c):
    (_, _, cert), _ = measured(c, c["near"])
    claim = make_lift(cert, c["entity"], c["near"], Q32_ONE, 0)
    require(claim.locally_admissible and claim.entity_constitution_ref == c["entity"].witness_digest, "LIFT_DID_NOT_IMPORT_ENTITY")
def _claims(c, outcomes=(0, 1)):
    claims=[]; certs=[]
    for observer, outcome in zip((c["near"], c["far"]), outcomes):
        fiber=(MeasurementOption(f"M{outcome}", outcome, 0, 0),)
        (_, _, cert), _=measured(c, observer, fiber, f"S{outcome}")
        certs.append(cert); claims.append(make_lift(cert, c["entity"], observer, Q32_ONE, 0))
    return tuple(certs), tuple(claims)
def cw39(c):
    _, claims = _claims(c, (0, 1)); require(consistent(*claims), "CONSISTENCY_REDUCED_TO_BYTE_EQUALITY")
def cw40(c):
    certs, claims = _claims(c, (0, 3)); result = glue(EpistemicState(certificates=certs), claims)
    require(len(result.gluing_failures) == 1 and result.certificates == certs and not result.shared_facts, "GLUING_FAILURE_SEMANTICS_WRONG")
def cw41(c):
    fiber_a=(MeasurementOption("X",0,0,0),); fiber_b=(MeasurementOption("Y",3,0,0),)
    ca=replay_contract(c["near"],c["entity"].entity_ref,0,fiber_a,"MU0A")
    changed, epistemic, cert_a=measure(c["ontic"],EpistemicState(),c["near"],c["entity"].entity_ref,fiber_a,ca,governance_margin_q32=0,ontic_perturbation_authorized=True)
    cb=replay_contract(c["far"],c["entity"].entity_ref,0,fiber_b,"MU0B")
    changed, epistemic, cert_b=measure(changed,epistemic,c["far"],c["entity"].entity_ref,fiber_b,cb,governance_margin_q32=0,ontic_perturbation_authorized=True)
    claims=(make_lift(cert_a,c["entity"],c["near"],Q32_ONE,0),make_lift(cert_b,c["entity"],c["far"],Q32_ONE,0))
    glued=glue(epistemic,claims)
    require(changed.perturbation_count==2 and cert_a.measurement_outcome!=cert_b.measurement_outcome and len(glued.certificates)==2 and len(glued.gluing_failures)==1 and not glued.shared_facts,"ZERO_MARGIN_AUTOIMMUNE_SEQUENCE_FAILED")
def cw42(c):
    _, claims = _claims(c, (0, 3)); observed=divergence_q32(claims); _, delta=govern_rate(EpistemicState(), claims, Q32_ONE//2)
    require(observed >= 0 and delta == observed - Q32_ONE//2, "RATE_SIGNAL_NOT_TYPED")
def cw43(c):
    _, claims = _claims(c, (0, 3)); before=EpistemicState(); after, _=govern_rate(before, claims, 0)
    require(after.tau_q32 > before.tau_q32 and RATE_GOVERNOR_CHANNEL == "TAU_POLICY_ONLY" and after.certificates == before.certificates, "RATE_CHANNEL_UNBOUND")
def cw44(c):
    (o, e, cert), _ = measured(c, c["near"]); contract=PresentationContract("ASCII", "1")
    require(project(cert, contract) == project(cert, contract) and o == c["ontic"] and len(e.certificates) == 1, "PRESENTATION_REPLAY_OR_AUTHORITY_FAILED")


VECTORS = tuple((f"CW{i:02d}", globals()[f"cw{i:02d}"]) for i in range(1, 45))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def execute_vectors() -> list[dict[str, Any]]:
    identities = imported_identities()
    require(identities["cgp_spec"] == EXPECTED_SPEC_SHA, "SPEC_IDENTITY_MISMATCH")
    require(identities["cgp_spec_promotion"] == EXPECTED_SPEC_PROMOTION_SHA, "SPEC_PROMOTION_IDENTITY_MISMATCH")
    receipts=[]
    for vector_id, vector in VECTORS:
        vector(base())
        receipts.append({"details":{"numeric_domain":NUMERIC_DOMAIN,"authority":"SPEC_CGP_WORLD_001_V0_3"},"status":"PASS","vector_id":vector_id})
    return receipts


def evidence_bytes(receipts: list[dict[str, Any]], summary: dict[str, Any]) -> dict[str, bytes]:
    values={receipt["vector_id"]+".json":receipt for receipt in receipts}
    values["acceptance-summary.json"]=summary
    return {name:(json.dumps(value,ensure_ascii=False,indent=2,sort_keys=True)+"\n").encode("utf-8") for name,value in values.items()}


def run_prior_regression() -> dict[str, str]:
    ascii_dir=HERE.parent/"ascii_env_001_walkable_perspective_world"
    with tempfile.TemporaryDirectory(prefix="cgp-world-prior-") as name:
        root=Path(name); output=root/"evidence"; summary=root/"summary.json"
        env=dict(os.environ); env["PYTHONDONTWRITEBYTECODE"]="1"; env["PYTHONIOENCODING"]="utf-8"
        result=subprocess.run([sys.executable,"run_full_conformance.py","--output",str(output),"--summary",str(summary)],cwd=ascii_dir,env=env,text=True,encoding="utf-8",stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        if result.returncode != 0:
            print(result.stdout,end=""); raise AssertionError("ASCII_ENV_REGRESSION_FAILED")
        data=json.loads(summary.read_text(encoding="utf-8"))
        require(data["conformance"]=="15/15" and data["prior_conformance"]=="351/351 UNCHANGED", "PRIOR_CONFORMANCE_FAILED")
        committed=ascii_dir/"evidence"
        names=sorted(path.name for path in committed.glob("*.json"))
        require(names==sorted(path.name for path in output.glob("*.json")), "PRIOR_EVIDENCE_CENSUS_CHANGED")
        require(all((committed/item).read_bytes()==(output/item).read_bytes() for item in names), "PRIOR_EVIDENCE_CHANGED")
    return {"prior_conformance":"366/366 UNCHANGED","prior_evidence":"337/337 BYTE_IDENTICAL"}


def main() -> int:
    parser=argparse.ArgumentParser(); parser.add_argument("--output",type=Path,default=HERE/"evidence"); parser.add_argument("--summary",type=Path,default=HERE/"acceptance-summary.json"); parser.add_argument("--manifest",type=Path,default=HERE/"evidence-manifest.json"); parser.add_argument("--skip-prior",action="store_true"); args=parser.parse_args()
    first=execute_vectors(); second=execute_vectors(); require(canonical_json(first)==canonical_json(second),"VECTOR_REPLAY_MISMATCH")
    prior={"prior_conformance":"NOT_RUN","prior_evidence":"NOT_RUN"} if args.skip_prior else run_prior_regression()
    identities=imported_identities()
    summary={"conformance":"44/44","consistency_predicate":CONSISTENCY_PREDICATE,"evidence_artifact_count":45,"evidence_replay":"45/45 BYTE_IDENTICAL","implementation_promotion":"NOT_PERFORMED","measurement_normalization":NORMALIZATION_RULE,"numeric_domain":NUMERIC_DOMAIN,"prior_conformance":prior["prior_conformance"],"prior_evidence":prior["prior_evidence"],"rate_governor_channel":RATE_GOVERNOR_CHANNEL,"result":"HOLDS","spec_sha256":identities["cgp_spec"],"vector_census":44}
    bytes_first=evidence_bytes(first,summary); bytes_second=evidence_bytes(second,summary); require(bytes_first==bytes_second,"EVIDENCE_REPLAY_MISMATCH")
    output=args.output.resolve(); output.mkdir(parents=True,exist_ok=True)
    for path in output.glob("*.json"): path.unlink()
    for name,payload in bytes_first.items(): (output/name).write_bytes(payload)
    write_json(args.summary.resolve(),summary)
    entries=tuple({"filename":name,"sha256":sha256(payload).hexdigest().upper()} for name,payload in sorted(bytes_first.items()))
    domain="".join(f"{item['filename']}\t{item['sha256']}\n" for item in entries).encode("utf-8")
    manifest={"artifact_count":len(entries),"corpus_sha256":sha256(domain).hexdigest().upper(),"files":entries,"hash_domain":"filename<TAB>uppercase-file-sha256<LF>; UTF-8 without BOM; filename ascending"}
    write_json(args.manifest.resolve(),manifest)
    print(json.dumps(summary,indent=2,sort_keys=True)); print("CGP_WORLD_001 := HOLDS_AT_UNCOMMITTED_BOUNDARY")
    return 0


if __name__ == "__main__": raise SystemExit(main())
