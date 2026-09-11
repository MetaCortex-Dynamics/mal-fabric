# CONFORMANCE_VECTORS_V3_3.md

**Target:** FABRIC_EXECUTION_SPEC_v0.3.0-candidate.md
**Status:** FROZEN — EXECUTION OPEN
**Total:** 70 vectors

## S — Snapshot semantics

```text
S01 identical snapshot for two active cells
S02 current-tick peer result invisible during evaluate
S03 source result at tick t becomes downstream input at t+1
S04 GEOMETRIC_PROGRAM unchanged across STEP_FABRIC
S05 evaluate deterministic on same inputs
S06 propagate deterministic on same inputs
S07 govern_runtime deterministic on same inputs
S08 simultaneous_commit exposes no intermediate state
S09 exactly one synchronous route boundary
S10 runtime governance imports V3.2 authority; payload not treated as FabricEdit
```

## F — Frame readiness / assembly

```text
F01 unary EXACTLY_ONE → COMPLETE
F02 binary same-tick roles → COMPLETE
F03 missing binary role → INCOMPLETE; EMPTY
F04 staggered arrival persists then COMPLETE
F05 successful admission clears pending buffer
F06 MANY insertion permutations → SAME route_id order
F07 TOGETHER/ALONE zero MEMBER → COMPLETE(empty identity)
F08 MANY/ONE zero MEMBER → INCOMPLETE
F09 EXACTLY_ONE over-arrival → INVALID(overconnection)
F10 type mismatch → INVALID(type_failure)
F11 partial frame persists with no timeout/default
F12 V3.1 DRC + FRAME_READY + COMPLETE → RUNTIME_FRAME_SHAPE_SAFETY
```

## P — Payload custody

```text
P01 EMPTY → ADMITTED
P02 ADMITTED → evaluate+propagate same STEP → COMPLETED next snapshot
P03 COMPLETED + ADMITTED_TO_TARGET → DISCHARGED
P04 COMPLETED + PENDING_AT_TARGET durable disposition → DISCHARGED
P05 COMPLETED + REJECTED_AT_TARGET durable disposition → DISCHARGED
P06 sink zero egress → EGRESS_CLOSED vacuously
P07 DISCHARGED → EMPTY
P08 ACTIVE iff ADMITTED
P09 heterogeneous phases commit atomically
P10 release clears slot while receipt persists
```

## Q — Quiescence

```text
Q01 clean empty fabric → HALTED
Q02 ADMITTED → RUNNING
Q03 DISCHARGED → RUNNING
Q04 partial input + no internal progress → BLOCKED
Q05 pending MAYBE + no trigger → BLOCKED
Q06 unresolved egress + no closure → BLOCKED
Q07 O=∅ but pending buffer≠∅ → NOT HALTED
Q08 fixed point + unresolved custody → BLOCKED
Q09 receipts nonempty, otherwise clean → HALTED
Q10 inert route metadata nonempty, otherwise clean → HALTED
Q11 HALTED → STEP_FABRIC(Σ)=Σ under CLOSED_RUN
Q12 BlockedReason canonical order
```

## H — Host-order erasure

```text
H01 forward vs reverse active-cell order
H02 forward vs reverse route traversal
H03 MANY insertion permutations
H04 pending-buffer merge permutations
H05 governance-candidate permutations
H06 obligation-closure permutations
H07 commit-construction permutations
H08 receipt/evidence collection permutations
H09 BlockedReason enumeration permutations
H10 two full ValidHostSchedule linear extensions → SAME Σ_t+1
H11 exhaustive valid schedules for minimal three-cell fixture
H12 same Σ0, different valid schedule each tick → SAME trajectory/status/evidence
```

Each H-vector requires:
```text
state_digest_A = state_digest_B
RunStatus_A = RunStatus_B
canonical_evidence_A = canonical_evidence_B
```

## N — Forbidden transitions

```text
N01 EMPTY→COMPLETED → reject
N02 EMPTY→DISCHARGED → reject
N03 ADMITTED→DISCHARGED → reject
N04 ADMITTED→EMPTY → reject
N05 COMPLETED→ADMITTED → reject
N06 COMPLETED→EMPTY → reject
N07 DISCHARGED→ADMITTED → reject
N08 DISCHARGED→COMPLETED → reject
```

## E — End-to-end

```text
E01 unary local chain → HALTED
E02 staggered binary frame → buffer → admit → compute → HALTED
E03 MANY input with host-order permutation → SAME result → HALTED
E04 cross-region runtime uses valid V3.2 authority; no FabricEdit reinterpretation
E05 missing operand forever → BLOCKED
E06 seeded unresolved runtime MAYBE under CLOSED_RUN → BLOCKED
```

## Evidence contract

Each vector emits:
```text
vector_id
class
program_digest
state_before_digest
state_after_digest
host_schedule_id
comparison_schedule_ids
active_cells
cell_results_digest
route_results_digest
governance_results_digest
payload_transitions
pending_buffer_digest
pending_admission_digest
obligation_digest
receipt_set_digest
run_status
blocked_reasons
expected
actual
pass
```

Schedule labels are audit metadata and MUST NOT contaminate canonical semantic evidence identity.

## Summary

```text
snapshot       10/10
frame          12/12
payload        10/10
quiescence     12/12
host-order     12/12
negative        8/8
end-to-end      6/6
────────────────────
TOTAL          70/70
```

```text
70 receipts + 1 summary = 71 JSON artifacts
```

Repeat requirement:
```text
70/70 run A
70/70 run B
71/71 byte-identical
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
