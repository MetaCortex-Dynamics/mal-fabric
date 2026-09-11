# PROOF-EXEC-4 — Host-Order Erasure

```text
theorem: HOST_ORDER_ERASURE
domain: valid linear extensions of the STEP_FABRIC dependency DAG
implementation: execution_kernel.py
status: PROVED FOR THE REFERENCE EXECUTION KERNEL
```

## 1. Claim

Let `Sigma_t` be one fixed canonical program and execution state. For any two
host schedules `pi_1` and `pi_2` that preserve the stage dependency order

```text
SNAPSHOT
  -> EVALUATE
  -> PROPAGATE / ASSEMBLE
  -> GOVERN
  -> COMMIT
```

while choosing arbitrary iteration order within a stage, the reference kernel
constructs the same canonical successor and canonical tick evidence:

```text
STEP_IMPL(Sigma_t, pi_1)
  = STEP_IMPL(Sigma_t, pi_2)
  = STEP_FABRIC(Sigma_t)
```

Consequently `RunStatus` and the canonical set of `BlockedReason` values are
also equal. `valid_host_schedule` rejects schedules outside this dependency
DAG before execution.

## 2. Shared basis

Every cell evaluation reads the same immutable `snapshot`. `evaluate`,
`propagate`, frame assembly, runtime governance, and commit construction are
pure with respect to their declared inputs. Stable semantic identities—not
iteration indices, wall clock, random values, or object addresses—identify
routes, candidates, obligations, and receipts. Canonical JSON sorts mapping
keys and set-like collections.

The proof is a stage-local commutation argument followed by composition along
the dependency DAG.

## 3. Active-cell evaluation order

The active set is determined solely by `PayloadState.phase = ADMITTED` in the
snapshot. Each `evaluate(c, program, snapshot)` reads the same snapshot and
cannot observe any peer's current-tick result. The result is keyed by stable
`cell_id`; canonical evidence subsequently sorts by that key. Evaluations of
distinct cells therefore commute, and forward or reverse enumeration yields
the same finite cell-result map.

## 4. Route traversal order

`propagate` reads the immutable snapshot and the complete cell-result map. A
route emits at most one result keyed by its content-addressed V3.1 `route_id`.
It neither consumes nor mutates another route result. Route results are
canonicalized by `route_id`, so any traversal permutation produces the same
route-result set.

## 5. Frame and pending-buffer merge order

Arrivals are grouped by target role. Within each role, `_merge_arrivals`
deduplicates by `(route_id, value_digest)` and sorts by that stable key.
`MANY` input bindings are consequently route-canonical. Existing partial
buffers and current arrivals are merged as a commutative keyed union;
`source_receipts` are a sorted set. `ASSEMBLE_FRAME` processes canonical roles
and applies only multiplicity and exact symbolic-type rules. Therefore route
arrival order, target-buffer order, and insertion order do not affect the
complete frame, incomplete role set, or invalid reason.

## 6. Governance-candidate order

Runtime authority is immutable and is bound to the promoted V3.2 kernel hash.
Each route decision is a pure lookup by `route_id`. Candidate and evidence
obligation identifiers are content digests of canonical inputs. Pending
candidates are keyed by candidate identity; route dispositions are keyed by
route identity. Resolutions contribute to the same canonical arrival union.
Governance iteration order can therefore change construction order but cannot
change the returned disposition, candidate, obligation, buffer, admission, or
receipt sets.

## 7. Obligation and receipt collection order

Outstanding obligations are keyed by `obligation_id`. A satisfied predicate
removes exactly that key and produces a receipt whose identity is a digest of
the receipt kind, subject identity, and canonical payload. Receipt collection
deduplicates by `receipt_id` and sorts by that identity. Thus obligation
enumeration and receipt insertion are order-independent.

## 8. Simultaneous commit order

Commit reads the complete snapshot, complete cell-result set, and complete
governance result. Every cell's next phase is computed from its snapshot phase
and keyed result/disposition set. The function constructs a fresh payload map;
no cell transition reads another cell's partially constructed next state.
Admissions, route dispositions, transitions, and receipts are keyed unions,
and the returned state sorts each collection by stable identity. Commit is
therefore construction from complete sets, not a sequential semantic fold.

## 9. Composition

Sections 3–8 establish permutation invariance within every order surface. The
fixed dependency edges ensure that each stage receives the same canonical
output from its predecessor. Induction over the five stages yields identical
`FabricState(t+1)`. Since the program is immutable, the complete successor
`Sigma_{t+1}` is identical. Canonical tick evidence is a pure projection of
the same sets and successor state, so it is identical as well.

The H01–H12 conformance vectors exercise each order surface, combined forward
and reverse schedules, exhaustive forward/reverse surface combinations, and
multi-tick trajectory equality.

## 10. Nonclaims

This theorem does not claim:

- wall-clock equivalence;
- determinism between different initial states;
- equivalence under arbitrary external stimuli;
- cross-implementation equivalence when `evaluate` semantics differ;
- scheduler independence outside `ValidHostSchedule`.

The reference evaluator is a deterministic pure packaging function. Its
specific payload result is a reference realization, not a normative claim
that all conforming evaluators must choose identical application semantics.
