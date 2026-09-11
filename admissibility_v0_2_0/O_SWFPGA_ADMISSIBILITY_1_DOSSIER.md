# O-SWFPGA-ADMISSIBILITY-1 Obligation Dossier

```text
version: candidate-r2-bound
status: PROMOTED
authority: Devon Generally
date: 2026-09-10
```

## 1. Scope

V3.2 defines governed admission for static fabric edits. It extends the V3.1
static legality floor with quantitative and governance-aware analysis.

```text
V3.1 DRC:
  is the normalized candidate fabric structurally legal?

V3.2 admission:
  is the structurally legal fabric transition governable?
```

V3.1 DRC is necessary for V3.2 admission. V3.2 admission is not necessary for
V3.1 DRC.

## 2. O-ADM-1 — admission pipeline

```text
FabricEditSurface
  -> F_parse^FABRIC
FabricEdit
  -> APPLY(F, e)
CandidateFabricSpec
  -> NORMALIZE
CanonicalCandidateFabricSpec F'
  -> V3.1 DRC(F')
StructurallyLegalTransition(F, e, F')
  -> F_struct^FABRIC
StructuralDecomposition
  -> F_obs
ObservableSignature
  -> (d_WV, d_SV, crossing_obligations)
AdmissibilityVerdict
```

DRC rejection terminates the pipeline before V3.2 admission. The structural
functor receives `(F, e, F')`, not the edit alone.

## 3. O-ADM-2 — TRIAD-crossing governance

The six directed crossing classes are:

```text
G -> S    S -> G
S -> F    F -> S
G -> F    F -> G
```

Each class may carry a distinct governance law. V3.1 placement capability
answers whether a placement is structurally possible. V3.2 crossing
admission answers whether every applicable governance obligation has been
discharged.

Crossing obligations participate in the admission verdict; they are not a
replacement for V3.1 capability checks and are not an independently
authoritative mutation gate.

## 4. O-ADM-3 — quantitative placement quality

```text
d_WV:
  witness-axis distance

d_SV:
  structural-axis distance

d_joint:
  max(d_WV, d_SV)
  aggregate reporting metric only
```

Admission uses pairwise thresholds:

```text
ADMIT iff
  d_WV <= epsilon_W
  AND d_SV <= epsilon_S
  AND every applicable crossing obligation is discharged
```

An exceeded axis produces an axis-specific rejection reason with `BECAUSE`
attribution. If both axes exceed tolerance, both reasons are preserved.

`epsilon_W` and `epsilon_S` are nonnegative, versioned policy parameters that
may be bound per fabric or per region. Governance-path realizations use
Q32.32, not binary floating point.

`PROOF_ADM_3_NONEXP.md` discharges the nonexpansiveness claim on the
post-parse canonical `FabricEdit` domain. Raw-surface nonexpansiveness is not
claimed.

## 5. O-ADM-4 — repair fiber

```text
R(x):
  rejected transition -> set of proposed admissible alternatives
```

Repair is a search over the full admission pipeline. It proposes; it does not
silently mutate. Every candidate requires `BECAUSE` attribution and must
independently pass `APPLY -> NORMALIZE -> DRC -> admission`. A candidate that
fails either DRC or admission is not a valid repair.

## 6. O-ADM-5 — extended checks

The V3.1 eight-condition DRC remains mandatory and unchanged. V3.2 adds these
post-DRC admission conditions:

- directed TRIAD-crossing governance;
- pairwise witness and structural tolerances;
- repair-fiber availability as advisory evidence.

DRC rejection and admission rejection are distinct typed outcomes.

## 7. O-ADM-6 — conformance requirements

The V3.2 vector corpus must include:

- admitted governed crossings with both distances within tolerance;
- rejection for an undischarged crossing obligation;
- separate witness-axis, structural-axis, and dual-axis rejection;
- exact-boundary cases for both tolerances;
- DRC failure terminating before admission analysis;
- successful and unsuccessful repair proposals;
- equivalent text and visual edits producing the same semantic transition and
  admission verdict.

## 8. O-ADM-7 — reference implementation

The implementation imports the V3.1 kernel without forking it and adds:

- `F_struct^FABRIC`;
- `F_obs`;
- witness-axis and structural-axis distance evaluation;
- directed crossing-governance evaluation;
- evidence-preserving and structural repair fibers;
- typed admission results with axis-specific reasons.

The frozen 62-vector corpus passes in full. Its 62 receipts and one summary
are byte-identical across clean-process replay.

## 9. Prohibitions

V3.2 must not:

- introduce payload execution;
- introduce synchronous ticks;
- introduce `WHEN` semantics;
- introduce quiescence;
- make `HOST_ORDER_ERASURE` claims;
- redefine a V3.1 import;
- weaken a V3.1 DRC condition;
- silently mutate through repair.

## 10. Discharge state

```text
O-ADM-1 admission pipeline:             EVIDENCED
O-ADM-2 crossing-governance laws:       DISCHARGED BY SPEC
O-ADM-3 quantitative metric definition: DISCHARGED BY SPEC
O-ADM-4 repair fiber:                    DISCHARGED BY SPEC
O-ADM-5 extended checks:                DISCHARGED BY SPEC
O-ADM-6 conformance vectors:             DISCHARGED BY SPEC
O-ADM-7 reference implementation:        EVIDENCED

Q-SWFPGA-ADMISSIBILITY-001:              PROMOTED
O-SWFPGA-ADMISSIBILITY-1:                DISCHARGED
PROMOTION:                                PERFORMED
```
