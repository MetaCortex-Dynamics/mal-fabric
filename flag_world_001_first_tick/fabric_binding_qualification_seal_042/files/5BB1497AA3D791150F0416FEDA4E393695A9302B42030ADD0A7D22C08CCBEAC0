# FABRIC_EXECUTION_SPEC_v0.3.0-candidate.md

**Specification:** O-SWFPGA-EXECUTION-1
**Version:** 0.3.0-candidate
**Status:** SPEC COMPLETE — IMPLEMENTATION OPEN
**Scope:** Synchronous execution semantics for the MaL-native software FPGA

## 0. Immutable imports

V3.3 imports V3.1 and V3.2 unchanged.

```text
V3.1:
  canonical FabricSpec
  CellDef
  ROLE_SCHEMA
  JOIN_SIGNATURE
  route identity
  semantic placement
  APPLY / NORMALIZE
  V3.1 DRC
  derived TRIAD_transition

V3.2:
  admission pipeline
  CrossingVerdict
  LifecycleState
  crossing governance
  DIAGONAL_NONLAUNDERING
  pairwise admissibility
  TOLERANCE_NONLAUNDERING
  repair fibers
  extended DRC
```

V3.3 MUST NOT redefine either substrate.

For v0.3.0:
```text
∀t: Σ_t.program = Σ_0.program
```

## 1. Execution state

```text
Σ_t := (
  GEOMETRIC_PROGRAM,
  FABRIC_STATE(t)
)

GEOMETRIC_PROGRAM := FabricSpec

FABRIC_STATE(t) := (
  payload_states,
  route_states,
  pending_admissions,
  pending_input_buffers,
  outstanding_obligations,
  receipts
)
```

## 2. STEP_FABRIC

```text
STEP_FABRIC(Σ_t):

  program := Σ_t.program
  snapshot := immutable(Σ_t.state)

  1. SNAPSHOT

  2. EVALUATE
     active_t :=
       { c | payload_state(c,snapshot) = ADMITTED(frame,_) }

     cell_results_t :=
       { c ↦ evaluate(c, program, snapshot)
         FOR EVERY c ∈ active_t }

  3. PROPAGATE
     route_results_t :=
       { r ↦ propagate(r, program, snapshot, cell_results_t)
         FOR EVERY r ∈ program.routes }

     canonicalize route results by route identity

  4. RUNTIME GOVERNANCE
     governance_results_t :=
       govern_runtime(
         program,
         snapshot,
         route_results_t,
         imported_V3_2_authority
       )

  5. SIMULTANEOUS COMMIT
     state_{t+1} :=
       simultaneous_commit(
         snapshot,
         cell_results_t,
         route_results_t,
         governance_results_t
       )

  RETURN (program, state_{t+1})
```

`govern_runtime` imports V3.2 authority and MUST NOT reinterpret runtime payloads as V3.2 FabricEdit candidates.

## 3. Snapshot isolation

```text
SNAPSHOT_ISOLATION

FOR EVERY active cell c:

  evaluate(c, program, state_t)

depends only on:
  c
  program
  state_t

and CANNOT observe:
  another cell's current-tick result
  current-tick route results
  current-tick governance results
  partially committed state_{t+1}
```

`evaluate`, `propagate`, and `govern_runtime` MUST be pure deterministic functions of declared immutable inputs.

## 4. Route latency

```text
cell_results_t
  → route_results_t
  → target custody in state_{t+1}
```

No extra COMPLETED→propagation cycle.

## 5. Payload state machine

```text
PayloadState :=
    EMPTY
  | ADMITTED(frame, admission_receipt)
  | COMPLETED(frame, result, completion_evidence)
  | DISCHARGED(result_ref, discharge_receipt)

LEGAL:
  EMPTY → ADMITTED → COMPLETED → DISCHARGED → EMPTY
```

Forbidden:
```text
EMPTY→COMPLETED
EMPTY→DISCHARGED
ADMITTED→DISCHARGED
ADMITTED→EMPTY
COMPLETED→ADMITTED
COMPLETED→EMPTY
DISCHARGED→ADMITTED
DISCHARGED→COMPLETED
```

Only ADMITTED cells are active.

## 6. Input frames

`ADMITTED` carries a complete canonical `InputFrame`.

```text
InputFrame :=
  canonical role-keyed payload structure
  derived from:
    ROLE_SCHEMA(operator)
    JOIN_SIGNATURE(operator,witness)
```

## 7. FRAME_READY / ASSEMBLE_FRAME

```text
ASSEMBLE_FRAME
  → COMPLETE(frame)
  | INCOMPLETE(pending_roles)
  | INVALID(reason)
```

```text
FRAME_READY(c, program, route_results_t)
  iff ASSEMBLE_FRAME(...) = COMPLETE(frame)
```

Rules:
```text
EXACTLY_ONE:
  0 arrivals → INCOMPLETE
  1 arrival  → bind + type-check
  >1         → INVALID(overconnection)

MANY:
  >=1 → canonicalize + type-check
```

Operator-specific zero-member rule:
```text
TOGETHER/ALONE zero MEMBER → COMPLETE(empty identity frame)
MANY/ONE zero MEMBER        → INCOMPLETE
```

No timeout. No default substitution. No partial evaluation.

## 8. Partial input custody

```text
PartialInputBuffer := (
  arrived_values : RoleName → Value*,
  tick_of_first_arrival,
  source_receipts
)
```

Partial values live in `pending_input_buffers`, not PayloadState.

MANY inputs canonicalize by deterministic route identity.

## 9. RUNTIME_FRAME_SHAPE_SAFETY

```text
IF
  V3.1_DRC(program) = IF_THEN
AND
  FRAME_READY(c,program,route_results_t) = true
AND
  ASSEMBLE_FRAME returns COMPLETE(frame)

THEN
  frame conforms to ROLE_SCHEMA(c.operator)
  AND JOIN_SIGNATURE(c.operator,c.witness)
```

## 10. Evaluation / propagation timing

For ADMITTED at Σ_t:
```text
STEP t→t+1:
  evaluate
  → propagate result in SAME STEP
  → govern egress custody
  → simultaneous commit

Σ_t+1:
  source = COMPLETED(...)
```

COMPLETED is post-propagation custody.

## 11. Egress disposition

```text
EgressDisposition :=
    ADMITTED_TO_TARGET(receipt)
  | PENDING_AT_TARGET(candidate_ref)
  | REJECTED_AT_TARGET(reason_receipt)
```

```text
EGRESS_CLOSED(c)
iff EVERY emitted consequence
has a durable committed disposition
```

```text
COMPLETED → DISCHARGED
iff EGRESS_CLOSED
```

Sink cells close vacuously.

## 12. Canonical timeline

```text
Σ_t     EMPTY
Σ_t+1   ADMITTED
Σ_t+2   COMPLETED
Σ_t+3   DISCHARGED
Σ_t+4   EMPTY
```

Propagation occurs during the ADMITTED→COMPLETED step.

## 13. Quiescence

```text
INTERNAL_PROGRESS_ENABLED(Σ) :=
  SOME ADMITTED cell
  OR SOME COMPLETED cell with enabled discharge
  OR SOME DISCHARGED cell
  OR SOME pending input now COMPLETE
  OR SOME pending admission with satisfied re-evaluation trigger
  OR SOME outstanding obligation with satisfied discharge predicate
```

```text
INTERNALLY_QUIESCENT(Σ) :=
  NO INTERNAL_PROGRESS_ENABLED(Σ)
```

```text
TERMINALLY_QUIESCENT(Σ) :=
  INTERNALLY_QUIESCENT(Σ)
  AND EVERY payload slot = EMPTY
  AND pending_input_buffers = ∅
  AND pending_admissions = ∅
  AND outstanding_obligations = ∅
```

```text
HALT(Σ) iff TERMINALLY_QUIESCENT(Σ)
```

## 14. BLOCKED vs HALTED

```text
BLOCKED(Σ) :=
  INTERNALLY_QUIESCENT(Σ)
  AND NOT TERMINALLY_QUIESCENT(Σ)
```

No timeout-to-halt. No MAYBE-to-NO timeout. No partial-buffer abandonment.

## 15. RunStatus

```text
RunStatus := RUNNING | HALTED | BLOCKED
```

```text
RUNNING := INTERNAL_PROGRESS_ENABLED
HALTED  := TERMINALLY_QUIESCENT
BLOCKED := INTERNALLY_QUIESCENT AND NOT TERMINALLY_QUIESCENT
```

## 16. CLOSED_RUN

```text
CLOSED_RUN :=
  no new external payload injection
  no new external evidence injection
  no governed fabric mutation
```

## 17. BlockedReason

```text
BlockedReason :=
  canonical set of:
    PARTIAL_INPUT(cell_id, missing_roles)
    PENDING_ADMISSION(candidate_id, evidence_obligation)
    EGRESS_OPEN(cell_id, unresolved_routes)
    OUTSTANDING_OBLIGATION(obligation_id)
```

Order by stable semantic identity.

## 18. Quiescence theorems

```text
TERMINAL_FIXED_POINT:
  HALT(Σ) → STEP_FABRIC(Σ)=Σ

FIXED_POINT_NONSUFFICIENCY:
  STEP_FABRIC(Σ)=Σ ⇏ HALT(Σ)

OBLIGATION_EMPTY_NONSUFFICIENCY:
  outstanding_obligations=∅ ⇏ HALT

TERMINAL_CLEANLINESS:
  HALT(Σ)
  → all payload slots EMPTY
    AND pending_input_buffers=∅
    AND pending_admissions=∅
    AND outstanding_obligations=∅
```

## 19. ValidHostSchedule

```text
ValidHostSchedule(π) :=
  π is a linear extension of:

  SNAPSHOT
     ↓
  EVALUATE
     ↓
  PROPAGATE / ASSEMBLE
     ↓
  GOVERN
     ↓
  COMMIT
```

Within each layer, iteration order is arbitrary.

## 20. HOST_ORDER_ERASURE

```text
FOR ANY π1, π2:

  ValidHostSchedule(π1)
  AND ValidHostSchedule(π2)

THEN

  STEP_IMPL(Σ_t,π1)
  =
  STEP_IMPL(Σ_t,π2)
  =
  STEP_FABRIC(Σ_t)
```

Order surfaces closed:
```text
1. active-cell evaluation
2. route propagation
3. frame / pending-buffer canonicalization
4. governance-candidate evaluation
5. obligation / receipt collection
6. simultaneous commit
```

Required:
```text
pure evaluate
pure propagate
deterministic FRAME_READY / ASSEMBLE_FRAME
MANY canonical by route_id
pending buffer merge canonical by role + route_id
governance evaluations do not mutate shared current-tick state
obligation/receipt sets canonical by stable identity
commit is construction from complete sets, not sequential fold
```

## 21. OBSERVABLE_ORDER_INDEPENDENCE

Because canonical Σ_t+1 is order-independent:
```text
RunStatus
BlockedReason
canonical tick evidence
```
are order-independent.

## 22. HOST_ORDER_ERASURE nonclaims

Does NOT prove:
```text
wall-clock equivalence
different-initial-state determinism
arbitrary external-stimulus equivalence
cross-implementation equivalence where evaluate differs
scheduler independence outside ValidHostSchedule
```

## 23. Proof artifact

Required:
```text
PROOF_EXEC_4_HOST_ORDER_ERASURE.md
```

## 24. Frozen conformance corpus

```text
S01–S10   snapshot semantics        10
F01–F12   frame readiness/assembly  12
P01–P10   payload custody           10
Q01–Q12   quiescence                12
H01–H12   host-order erasure        12
N01–N08   forbidden transitions      8
E01–E06   end-to-end execution       6
──────────────────────────────────────
TOTAL                               70
```

## 25. Evidence target

```text
70 vector receipts
+ 1 summary
= 71 JSON artifacts
```

Run twice:
```text
70/70 run A
70/70 run B
71/71 canonical evidence artifacts byte-identical
```

## 26. O-EXEC-6 boundary

MUST implement:
```text
FABRIC_STATE(t)
PayloadState
InputFrame
PartialInputBuffer
FRAME_READY
ASSEMBLE_FRAME
EgressDisposition
EGRESS_CLOSED
STEP_FABRIC
evaluate
propagate
govern_runtime
simultaneous_commit
INTERNAL_PROGRESS_ENABLED
TERMINALLY_QUIESCENT
BLOCKED
RunStatus
BlockedReason
ValidHostSchedule
deterministic evidence emission
70-vector runner
PROOF_EXEC_4_HOST_ORDER_ERASURE.md
```

MUST NOT:
```text
patch V3.1
patch V3.2
introduce self-modifying geometry
introduce external stimulus API
auto-promote
```

## 27. Exit criteria

```text
O-EXEC-6 COMPLETE IFF:

  V3.1 import unchanged
  AND V3.2 import unchanged

  AND S01–S10 = 10/10
  AND F01–F12 = 12/12
  AND P01–P10 = 10/10
  AND Q01–Q12 = 12/12
  AND H01–H12 = 12/12
  AND N01–N08 = 8/8
  AND E01–E06 = 6/6

  AND TOTAL = 70/70

  AND 71/71 evidence artifacts replay byte-identically

  AND PROOF_EXEC_4_HOST_ORDER_ERASURE.md exists

  AND no V3.1/V3.2 modification
```

Successful implementation establishes:
```text
REFERENCE_EXECUTION_KERNEL := HOLDS
CONFORMANCE                := 70/70
EVIDENCE_DETERMINISM       := 71/71
V3_1_IMPORT                := UNCHANGED
V3_2_IMPORT                := UNCHANGED
PROOF_EXEC_4               := PRESENT

O-EXEC-6 := EVIDENCED

O-SWFPGA-EXECUTION-1
  := CANDIDATE FOR PROMOTION

PROMOTION := NOT PERFORMED
```

## 28. Obligation state

```text
O-EXEC-1  snapshot semantics       := DISCHARGED
O-EXEC-2  payload state machine    := DISCHARGED
O-EXEC-3  quiescence               := DISCHARGED
O-EXEC-4  HOST_ORDER_ERASURE       := DISCHARGED
O-EXEC-5  conformance corpus       := DISCHARGED
O-EXEC-6  reference implementation := AUTHORIZED TO IMPLEMENT

O-SWFPGA-EXECUTION-1
  := SPEC COMPLETE
     IMPLEMENTATION OPEN
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
