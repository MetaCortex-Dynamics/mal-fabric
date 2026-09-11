# FABRIC_ADMISSION_PIPELINE_SPEC_v0.2.0-candidate-r2.md

**Specification:** O-SWFPGA-ADMISSIBILITY-1  
**Version:** 0.2.0-candidate-r2  
**Status:** SPEC COMPLETE — IMPLEMENTATION OPEN  
**Scope:** Governed admissibility for the MaL software-FPGA fabric  
**Import:** V3.1 `mal-fabric` static substrate, unchanged

## 0. Normative status

V3.1 is a fixed imported substrate. V3.2 MUST NOT redefine or weaken `FabricSpec`, `FabricEdit`, `APPLY`, `NORMALIZE`, V3.1 DRC, route identity, semantic placement, derived TRIAD transitions, or V3.1 conformance behavior.

V3.2 adds admissibility evaluation, crossing governance, quantitative metrics, repair fibers, lifecycle management, extended DRC, deterministic evidence, and conformance. Dynamic fabric execution is deferred to V3.3.

## 1. V3.1 import law

```text
V3.1 := CLOSED

IMPORT:
  kernel.py
  canonical FabricSpec
  FabricEdit
  APPLY
  NORMALIZE
  V3.1 DRC
  route identity
  TRIAD placement
  derived TRIAD_transition

MUST:
  use unchanged

CANNOT:
  patch V3.1 behavior
  shadow V3.1 functions
  weaken V3.1 DRC
  introduce alternative canonicalization
```

The implementation MUST validate imported artifact identities against `V3_1_IMPORT_MANIFEST.md`.

## 2. Admission pipeline

```text
1.  FabricEditSurface → FabricEdit
2.  APPLY
3.  NORMALIZE
4.  no-op detection
5.  V3.1 DRC
6.  V3.2 EXTENDED_DRC
7.  F_struct^FABRIC
8.  F_obs
9.  d_WV / d_SV / d_joint
10. crossing governance
11. terminal verdict composition
12. lifecycle transition
13. deterministic receipt emission
```

## 3. Candidate model

```text
CandidateCore := (
  F,
  e,
  F_prime,
  route,
  crossing_class
)

F_prime := NORMALIZE(APPLY(F,e))
```

```text
CandidateRecord := (
  core,
  evidence_bundle,
  lifecycle,
  latest_verdict,
  verdict_history,
  repair_history
)
```

```text
SAME_CANDIDATE(c1,c2)
  iff
    c1.F           = c2.F
    AND c1.e       = c2.e
    AND c1.F_prime = c2.F_prime
    AND c1.route   = c2.route
    AND c1.class   = c2.class
```

Evidence MAY vary while CandidateCore remains SAME. Structural change MUST create a NOT-SAME candidate.

## 4. Verdict and lifecycle

```text
AdmissibilityVerdict :=
    IF_THEN
  | MAYBE
  | NO
  | NOT_SAME

LifecycleState :=
    SANDBOX
  | CANDIDATE
  | PROMOTED
  | REJECTED
```

Verdict and lifecycle are orthogonal.

```text
SANDBOX + IF_THEN  → PROMOTED
SANDBOX + MAYBE    → CANDIDATE
SANDBOX + NO       → REJECTED
SANDBOX + NOT_SAME → REJECTED

CANDIDATE + IF_THEN  → PROMOTED
CANDIDATE + MAYBE    → CANDIDATE
CANDIDATE + NO       → REJECTED
CANDIDATE + NOT_SAME → REJECTED
```

```text
AUTHORIZE(crossing)
  iff lifecycle = PROMOTED
  AND latest_verdict = IF_THEN
```

`MAYBE` MUST NOT be rewritten to `NO`; fail-closed behavior belongs to authority.

```text
PROPOSE ≠ DECIDE ≠ PROMOTE
```
## 5. Directed crossing governance

Crossing class is derived from V3.1 endpoint placement:

```text
LOCAL
G→S
S→G
S→F
F→S
G→F
F→G
```

```text
GOVERNANCE_LAW := (
  crossing_class,
  required_capabilities,
  verification_predicate,
  evidence_shape
)
```

Capability is earned by the transition candidate:

```text
CrossingCandidate := (
  F,
  e,
  F_prime,
  route,
  crossing_class
)
```

### 5.1 Capability requirements

```text
LAW_GS:
  required := {G,S}
  evidence := G_provenance + S_structural_certificate

LAW_SG:
  required := {S,G}
  evidence := S_structural_certificate
              + CertifyG witness bundle
              + MetaGate acceptance
              + Pattern-A manifest

LAW_SF:
  required := {S,F}
  evidence := FarkasCheck certificate
              OR equivalent oracle witness

LAW_FS:
  required := {F,S}
  evidence := F_execution_evidence
              + S_structural_registration

LAW_GF:
  required := {G,S,F}

LAW_FG:
  required := {F,S,G}
```

### 5.2 DIAGONAL_NONLAUNDERING

```text
No G↔F crossing may be promoted
without S capability being discharged,
either within the direct crossing's
full capability certificate
or through explicit structural mediation.
```

A direct G↔F crossing MAY promote only with full `{G,S,F}` discharge. Otherwise repair MAY propose G→S→F or F→S→G.

## 6. Quantitative metrics

```text
Omega_tilde := {true, false, undefined}

dOmega(true,false)      := 1
dOmega(true,undefined)  := 1/2
dOmega(false,undefined) := 1/2
dOmega(x,x)             := 0
```

```text
d_WV :=
  max W1 over active witness coordinates

d_SV_core :=
  max W1 over active structural labels

residual_ratio :=
  |residual_state| / |input|

d_SV :=
  max(d_SV_core, residual_ratio)

d_joint :=
  max(d_WV, d_SV)
```

`d_joint` is diagnostic and nonexpansiveness/ranking support only.

### 6.1 Pairwise admissibility

```text
METRIC_ADMISSIBLE
  iff d_WV ≤ epsilon_W
  AND d_SV ≤ epsilon_S
```

There is NO governing `epsilon_joint`.

### 6.2 TOLERANCE_NONLAUNDERING

```text
No admissibility axis may borrow unused tolerance
from a NOT-SAME axis.

For every axis i:
  d_i ≤ epsilon_i
MUST hold independently.
```

Metric result is:

```text
MetricResult := IF_THEN | NO
```

`undefined` observation is quantitative, NOT governance `MAYBE`.

## 7. Terminal composition

```text
1. identity mismatch       → NOT_SAME
2. V3.1 DRC failure        → NO
3. EXTENDED_DRC failure    → NO / NOT_SAME
4. d_WV > epsilon_W        → NO
5. d_SV > epsilon_S        → NO
6. crossing governance     → IF_THEN | MAYBE | NO | NOT_SAME
7. all hold                → IF_THEN
```

## 8. Nonexpansiveness boundary

Required proof artifact:

```text
PROOF_ADM_3_NONEXP.md
```

The theorem domain is canonical `FabricEdit` / post-parse state and `d_joint`.

```text
RAW_SURFACE_NONEXPANSIVENESS := NOT CLAIMED
```
## 9. Repair fiber

```text
REPAIR_FIBER :=
    EVIDENCE_REPAIR_FIBER
  | STRUCTURAL_REPAIR_FIBER
```

### 9.1 Evidence repair

Domain:

```text
verdict = MAYBE
lifecycle = CANDIDATE
```

MUST preserve CandidateCore and vary EvidenceBundle.

Every MAYBE MUST carry:

```text
EvidenceObligation := (
  unresolved_capability,
  needed_evidence,
  verification_predicate,
  evidence_subject,
  re_evaluation_trigger
)
```

### 9.2 Structural repair

Structural repair MAY act on NO / REJECTED.

```text
c_prime ∈ R_S(c)
→ c_prime NOT_SAME c
```

It MAY change edit, placement, routing, containment, intermediate cells, or crossing topology. New lifecycle MUST be SANDBOX.

### 9.3 Repair semantics vs realization

```text
RepairSemantic :=
  composition of operator × witness cells

RepairRealization :=
  finite sequence of V3.1 FabricEdits
```

Only V3.1 constructors are legal realizations:

```text
PLACE
MOVE
CONNECT
DISCONNECT
```

FabricEdit constructors are NOT MaL operators.

Invalid semantic forms:

```text
MOVE × WHERE
CONNECT × WHICH
DISCONNECT × WHICH
```

Authorized semantic-realization correspondences include:

```text
THIS × WHAT                         → PLACE
INSIDE/OUTSIDE × WHERE              → PLACE / MOVE
NEAR/FAR × WHERE                    → MOVE
GOES-WITH × WHICH                   → CONNECT
NO × WHAT + TOGETHER/ALONE × HOW   → DISCONNECT
TOGETHER/ALONE × HOW                → edit composition
CAN/CANNOT × HOW                    → capability gate
EVERY/SOME × WHICH                  → candidate search
IF/THEN × WHEN                      → conditional re-evaluation
MUST/LET × FOR-WHAT                 → downstream obligation
MAYBE × FOR-WHAT                    → unresolved repair decision
BECAUSE × WHENCE                    → trigger genealogy
```

### 9.4 Authorized structural rules

```text
SR-1  diagonal mediation
SR-2  capability boundary relocation
SR-3  disconnection
```

No other structural repair rule is authorized in v0.2.0.

### 9.5 Repair theorems

```text
REPAIR_IDENTITY_PRESERVATION
STRUCTURAL_REPAIR_NONSUBSTITUTION
REPAIR_NONOVERRIDE
REPAIR_TOLERANCE_NONLAUNDERING
```

Repair ranking may use `d_joint` only after pairwise admissibility and all other gates hold.

## 10. Repair ranking

```text
ELIGIBLE(r)
  iff
    V3.1_DRC(r) = IF_THEN
    AND EXTENDED_DRC(r) = IF_THEN
    AND d_WV(r) ≤ epsilon_W
    AND d_SV(r) ≤ epsilon_S
    AND crossing_verdict(r) = IF_THEN
```

Only eligible repairs may be ranked by:

```text
(d_joint, canonical_repair_encoding)
```

Tie-breaking MUST be deterministic.

Repair search is not claimed globally complete. Empty repair output means only that the active rule set generated no repair.

## 11. Extended DRC

```text
ExtendedDRCResult :=
    IF_THEN
  | NO
  | NOT_SAME
```

Extended DRC MUST NEVER emit MAYBE.

It validates V3.2 object structure, not admissibility.

### 11.1 Check families A–O

```text
A  V3.1 import identity
B  CandidateCore successor integrity
C  route and crossing derivation coherence
D  governance-law lookup totality
E  metric configuration well-formedness
F  evidence record shape / subject binding
G  lifecycle/verdict coherence
H  authority-chain integrity
I  evidence-repair identity preservation
J  structural-repair identity separation
K  RepairSemantic typing
L  authorized repair-rule set
M  repair genealogy completeness
N  repair ranking nonlaundering
O  deterministic tie handling
```

Additional structural realization check: structural repair may use only V3.1 FabricEdit constructors.

### 11.2 Closed reason-code surface

```text
ADR01  V3_1_IMPORT_MISMATCH
ADR02  CANDIDATE_SUCCESSOR_MISMATCH
ADR03  ROUTE_NOT_IN_SUCCESSOR
ADR04  CROSSING_CLASS_MISMATCH
ADR05  LOCAL_ROUTE_HAS_CROSSING_LAW
ADR06  CROSSING_LAW_MISSING_OR_AMBIGUOUS
ADR07  INVALID_TOLERANCE_CONFIGURATION
ADR08  GOVERNING_EPSILON_JOINT_FORBIDDEN
ADR09  EVIDENCE_SCHEMA_MALFORMED
ADR10  EVIDENCE_SUBJECT_MISMATCH
ADR11  LIFECYCLE_VERDICT_INCOHERENT
ADR12  PROMOTION_RECEIPT_MISSING
ADR13  AUTHORITY_CHAIN_INVALID
ADR14  EVIDENCE_REPAIR_CHANGED_CORE
ADR15  STRUCTURAL_REPAIR_PRESERVED_CORE
ADR16  NON_V3_1_EDIT_IN_REPAIR
ADR17  INVALID_REPAIR_SEMANTIC_OPERATOR
ADR18  UNAUTHORIZED_REPAIR_RULE
ADR19  REPAIR_GENEALOGY_MISSING
ADR20  REPAIR_DID_NOT_REENTER_SANDBOX
ADR21  TOLERANCE_LAUNDERING_IN_RANKING
ADR22  NONDETERMINISTIC_REPAIR_TIEBREAK
```

Expected result classes:

```text
ADR01 → NOT_SAME
ADR02 → NOT_SAME
ADR03 → NO
ADR04 → NOT_SAME
ADR05 → NO
ADR06 → NO
ADR07 → NO
ADR08 → NO
ADR09 → NO
ADR10 → NOT_SAME
ADR11 → NO
ADR12 → NO
ADR13 → NO
ADR14 → NOT_SAME
ADR15–ADR22 → NO
```

### 11.3 Extended DRC theorems

```text
DRC_FLOOR_MONOTONICITY
EXTENDED_DRC_NONAUTHORITY
REPAIR_REENTRY
```

Extended DRC CANNOT decide capability truth, metric admissibility, MAYBE resolution, oracle success, global repair optimality, or global repair completeness.

## 12. Frozen conformance corpus

```text
positive       PA01–PA10   10
negative       NA01–NA22   22
quantitative   QA01–QA04    4
crossing       XA01–XA08    8
repair         RA01–RA08    8
lifecycle      LA01–LA08    8
confluence     CA01–CA02    2
──────────────────────────────
TOTAL                        62
```

### 12.1 Positive

```text
PA01 local route; no crossing law; metrics within tolerance
PA02 G→S admitted with {G,S}
PA03 S→F admitted with {S,F}
PA04 F→S admitted with {F,S}
PA05 S→G admitted through CertifyG
PA06 G→F DIAGONAL admitted with full {G,S,F}
PA07 F→G DIAGONAL admitted with full {F,S,G}
PA08 d_WV = epsilon_W; d_SV within epsilon_S
PA09 d_SV = epsilon_S; d_WV within epsilon_W
PA10 evidence repair MAYBE → IF_THEN
```

### 12.2 Negative

```text
NA01 ADR01 → NOT_SAME
NA02 ADR02 → NOT_SAME
NA03 ADR03 → NO
NA04 ADR04 → NOT_SAME
NA05 ADR05 → NO
NA06 ADR06 → NO
NA07 ADR07 → NO
NA08 ADR08 → NO
NA09 ADR09 → NO
NA10 ADR10 → NOT_SAME
NA11 ADR11 → NO
NA12 ADR12 → NO
NA13 ADR13 → NO
NA14 ADR14 → NOT_SAME
NA15 ADR15 → NO
NA16 ADR16 → NO
NA17 ADR17 → NO
NA18 ADR18 → NO
NA19 ADR19 → NO
NA20 ADR20 → NO
NA21 ADR21 → NO
NA22 ADR22 → NO
```

### 12.3 Quantitative

```text
QA01 d_WV > epsilon_W; d_SV ≤ epsilon_S → NO
QA02 d_WV ≤ epsilon_W; d_SV > epsilon_S → NO
QA03 d_WV > epsilon_W; d_SV > epsilon_S → NO
QA04 d_joint ≤ max(epsilon_W,epsilon_S)
     BUT d_WV > epsilon_W
     → NO
```

### 12.4 Crossing

```text
XA01 G→S admitted with {G,S}
XA02 S→G admitted through CertifyG
XA03 S→F admitted with {S,F}
XA04 F→S admitted with {F,S}
XA05 G→F rejected without S
XA06 G→F admitted with {G,S,F}
XA07 F→G rejected without S
XA08 F→G admitted with {F,S,G}
```

### 12.5 Repair

```text
RA01 evidence repair MAYBE → IF_THEN
RA02 evidence repair MAYBE → MAYBE
RA03 SR-1 diagonal mediation
RA04 SR-2 capability relocation
RA05 SR-3 disconnection
RA06 structural repair re-enters SANDBOX and full pipeline
RA07 d_joint ranks two admissible repairs
RA08 d_joint cannot rescue inadmissible repair
```

### 12.6 Lifecycle

```text
LA01 SANDBOX + IF_THEN  → PROMOTED
LA02 SANDBOX + MAYBE    → CANDIDATE
LA03 SANDBOX + NO       → REJECTED
LA04 SANDBOX + NOT_SAME → REJECTED
LA05 CANDIDATE + MAYBE    → CANDIDATE
LA06 CANDIDATE + IF_THEN  → PROMOTED
LA07 CANDIDATE + NO       → REJECTED
LA08 CANDIDATE + NOT_SAME → REJECTED
```

### 12.7 Confluence

```text
CA01 text/visual SAME transition through full admission
     → SAME terminal verdict

CA02 text/visual SAME repair proposal
     → SAME repaired candidate
     → SAME re-evaluation result
```

`PARSE_TEXT` and `PARSE_VISUAL` MUST be distinct implementation paths before canonical `FabricEdit`.

## 13. Deterministic evidence

Each vector emits one JSON receipt.

Minimum schema:

```text
vector_id
class
input_digest
candidate_digest
v3_1_drc_result
extended_drc_result
extended_drc_reason_code
d_WV
epsilon_W
d_SV_core
residual_ratio
d_SV
epsilon_S
d_joint
crossing_class
required_capabilities
crossing_verdict
lifecycle_before
lifecycle_after
repair_kind
repair_rule
parent_candidate_digest
terminal_verdict
expected
actual
pass
```

Not-applicable fields use canonical explicit absence.

Summary target:

```text
positive       10/10
negative       22/22
quantitative    4/4
crossing        8/8
repair          8/8
lifecycle       8/8
confluence      2/2
────────────────────
TOTAL          62/62
```

Evidence count:

```text
62 receipts + 1 summary = 63 JSON artifacts
```

Run twice from clean process state:

```text
62/62 run A
62/62 run B
63/63 evidence artifacts byte-identical
```

Canonical evidence MUST NOT contain timestamps, random UUIDs, unordered serialization, filesystem-order dependence, or process-order dependence.

## 14. O-ADM-7 implementation boundary

MUST implement:

```text
O-ADM-1 pipeline
O-ADM-2 crossing governance
O-ADM-3 pairwise metrics
O-ADM-4 repair fibers
O-ADM-5 extended DRC
lifecycle manager
terminal composition
deterministic receipts
62-vector runner
PROOF_ADM_3_NONEXP.md
```

MUST NOT implement:

```text
synchronous cell execution
runtime payload execution state
global quiescence
host-order erasure
WHEN overlay
program execution
any V3.3 semantics
```

V3.2 evaluates admission. It does not execute the software FPGA.

## 15. Exit criteria

```text
O-ADM-7 COMPLETE IFF:

  V3.1 imported unchanged

  AND O-ADM-2 laws implemented
  AND O-ADM-3 metrics implemented
  AND O-ADM-4 repair fibers implemented
  AND O-ADM-5 A–O checks implemented

  AND ADR01–ADR22 exact

  AND PA01–PA10 = 10/10
  AND NA01–NA22 = 22/22
  AND QA01–QA04 = 4/4
  AND XA01–XA08 = 8/8
  AND RA01–RA08 = 8/8
  AND LA01–LA08 = 8/8
  AND CA01–CA02 = 2/2

  AND TOTAL = 62/62

  AND 63/63 evidence artifacts replay byte-identically

  AND PROOF_ADM_3_NONEXP.md exists

  AND no V3.3 semantics introduced
```

Successful implementation establishes:

```text
REFERENCE_ADMISSION_KERNEL := HOLDS
CONFORMANCE                := 62/62
EVIDENCE_DETERMINISM       := 63/63
V3_1_IMPORT                := UNCHANGED
V3_3_LEAKAGE               := NONE
PROOF_ADM_3_NONEXP         := PRESENT
```

Then:

```text
O-ADM-7 := EVIDENCED

O-SWFPGA-ADMISSIBILITY-1
  := CANDIDATE FOR PROMOTION

PROMOTION := NOT PERFORMED
```

## 16. Obligation state

```text
O-ADM-1  pipeline              := AUTHORED
O-ADM-2  crossing governance   := DISCHARGED
O-ADM-3  quantitative metrics  := DISCHARGED
O-ADM-4  repair fiber          := DISCHARGED
O-ADM-5  extended DRC          := DISCHARGED
O-ADM-6  conformance vectors   := DISCHARGED
O-ADM-7  reference impl        := AUTHORIZED TO IMPLEMENT

O-SWFPGA-ADMISSIBILITY-1
  := SPEC COMPLETE
     IMPLEMENTATION OPEN
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
