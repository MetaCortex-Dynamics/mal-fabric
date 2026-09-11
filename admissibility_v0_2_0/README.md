# V3.2 Fabric Admissibility Reference

This directory implements the static V3.2 admission layer bound by
`FABRIC_ADMISSION_PIPELINE_SPEC_v0.2.0-candidate-r2.md` without modifying the
sealed V3.1 kernel.

## Run

From this directory:

```text
python -B run_conformance.py --output evidence
```

The successful result is:

```text
positive       10/10
negative       22/22
quantitative    4/4
crossing        8/8
repair          8/8
lifecycle       8/8
confluence      2/2
total          62/62
```

The runner writes 62 vector receipts plus one summary. All JSON serialization
is key-sorted and excludes timestamps, random identifiers, filesystem order,
and process order.

## Files

- `V3_1_IMPORT_MANIFEST.md` binds the immutable imported substrate.
- `NORMATIVE_TARGET.md` binds the exact r2 specification and SHA-256.
- `admission_kernel.py` implements the pipeline, metrics, crossing laws,
  extended DRC, lifecycle, terminal composition, and repair fibers.
- `run_conformance.py` executes the frozen 62-vector corpus.
- `PROOF_ADM_3_NONEXP.md` proves the scoped post-parse nonexpansiveness result.
- `evidence/` contains deterministic receipts and the QueueGate summary.
- `PROMOTION_RECORD.md` binds Devon's promotion decision to the candidate
  commit and exact implementation and evidence identities.

## Boundary

This is admission analysis only. It contains no synchronous cell execution,
runtime payload state, global quiescence, host-order erasure, `WHEN` overlay,
or program execution. Passing conformance alone does not promote a candidate.
The authority transition recorded in `PROMOTION_RECORD.md` promotes
`Q-SWFPGA-ADMISSIBILITY-001` without changing this execution boundary.
