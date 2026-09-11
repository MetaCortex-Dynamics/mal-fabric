# O-SWFPGA-EXECUTION-1 Obligation Dossier

```text
version: v0.3.0-candidate-bound
status: PROMOTED
authority: Devon Generally
implementation_date: 2026-09-11
promotion: PERFORMED
```

## 1. Scope

V3.3 adds deterministic synchronous execution around the immutable V3.1
canonical fabric and the promoted V3.2 governance boundary. It defines runtime
payload custody; it does not mutate fabric geometry or reinterpret static edit
admission.

## 2. O-EXEC-1 — snapshot semantics

`STEP_FABRIC` takes one immutable state snapshot, evaluates every `ADMITTED`
cell against that snapshot, propagates the complete result set, applies runtime
governance, and constructs a simultaneous successor. Current-tick peer results
and partially committed successor state are invisible during evaluation. The
same-step propagation boundary places downstream custody in the next snapshot.

## 3. O-EXEC-2 — payload and frame custody

Payload slots enforce the sole legal lifecycle:

```text
EMPTY -> ADMITTED -> COMPLETED -> DISCHARGED -> EMPTY
```

`ADMITTED` always contains a complete canonical `InputFrame`. Partial values
remain in `PartialInputBuffer`. Exact-one roles reject overconnection, `MANY`
roles sort by route identity, `TOGETHER/ALONE` admits the zero-member identity,
and `MANY/ONE` does not. Completed egress becomes dischargeable only after
every route has a durable admitted, pending, or rejected disposition; sinks
close vacuously.

## 4. O-EXEC-3 — quiescence

Internal progress includes admitted evaluation, enabled completed discharge,
discharged release, newly complete frames, triggered pending admissions, and
satisfied obligations. A terminal state is internally quiescent and has only
empty payload slots with no pending buffers, admissions, or obligations.
Unresolved custody at a fixed point is `BLOCKED`, never converted to `HALTED`
by timeout. `BlockedReason` is a canonical stable-identity set.

## 5. O-EXEC-4 — host-order erasure

`ValidHostSchedule` preserves the snapshot-to-commit dependency DAG while
allowing arbitrary within-stage order. The reference kernel canonicalizes all
six normative order surfaces. `PROOF_EXEC_4_HOST_ORDER_ERASURE.md` supplies the
stage-local commutation and composition argument. H01–H12 provide executable
surface, combined-schedule, exhaustive, and multi-tick evidence.

## 6. O-EXEC-5 — frozen corpus

```text
S01-S10  snapshot semantics        10/10
F01-F12  frame readiness/assembly  12/12
P01-P10  payload custody           10/10
Q01-Q12  quiescence                12/12
H01-H12  host-order erasure        12/12
N01-N08  forbidden transitions      8/8
E01-E06  end-to-end execution       6/6
TOTAL                               70/70
```

The corpus emits 70 deterministic receipts plus one deterministic summary.

## 7. O-EXEC-6 — reference implementation

The reference implementation provides `FABRIC_STATE(t)`, `PayloadState`,
`InputFrame`, `PartialInputBuffer`, `FRAME_READY`, `ASSEMBLE_FRAME`,
`EgressDisposition`, `EGRESS_CLOSED`, `STEP_FABRIC`, pure evaluation and
propagation, runtime governance, simultaneous commit, progress and quiescence
predicates, terminal and blocked classification, `ValidHostSchedule`, and
canonical evidence.

The evaluator's concrete payload result is deliberately implementation-defined
and pure. Cross-implementation equality is not claimed when evaluator semantics
differ.

## 8. Prohibitions and exclusions

V3.3 does not modify V3.1 or V3.2, does not permit self-modifying geometry,
does not expose an external payload/evidence stimulus API, and does not perform
promotion. Host-order erasure makes no claim about wall clock, different
initial states, arbitrary stimuli, differing evaluators, or invalid schedules.

## 9. Evidence state

```text
REFERENCE_EXECUTION_KERNEL: HOLDS
CONFORMANCE:                70/70
EVIDENCE_ARTIFACTS:         71
EVIDENCE_DETERMINISM:       71/71 BYTE-IDENTICAL
V3_1_IMPORT:                UNCHANGED
V3_2_IMPORT:                UNCHANGED
PROOF_EXEC_4:               PRESENT

O-EXEC-1: EVIDENCED
O-EXEC-2: EVIDENCED
O-EXEC-3: EVIDENCED
O-EXEC-4: EVIDENCED
O-EXEC-5: EVIDENCED
O-EXEC-6: EVIDENCED

Q-SWFPGA-EXECUTION-001: PROMOTED
O-SWFPGA-EXECUTION-1:   DISCHARGED
PROMOTION:              PERFORMED
```
