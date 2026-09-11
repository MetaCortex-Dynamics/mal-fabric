# V3.3 Fabric Execution Reference

This directory implements the synchronous V3.3 execution layer bound by the
sealed `FABRIC_EXECUTION_SPEC_v0.3.0-candidate.md`. It imports the promoted
V3.1 static fabric and V3.2 admissibility layers by exact SHA-256 identity and
does not modify either predecessor.

## Run

From this directory:

```text
python -B run_conformance.py --output evidence
```

The successful result is:

```text
snapshot       10/10
frame          12/12
payload        10/10
quiescence     12/12
host-order     12/12
negative        8/8
end-to-end      6/6
total          70/70
```

The runner writes 70 vector receipts plus one QueueGate summary. Canonical
JSON uses sorted keys and excludes timestamps, random identifiers,
filesystem-order dependence, and process-order dependence.
Two clean-process executions reproduce all 71 JSON artifacts byte-for-byte.

## Files

- `NORMATIVE_TARGET.md` binds the sealed spec, corpus, and implementation
  handoff by path and SHA-256.
- `V3_IMPORT_MANIFEST.md` binds the unchanged V3.1 and V3.2 imports.
- `execution_kernel.py` implements runtime state, frame assembly, synchronous
  stepping, governance, commit, quiescence, and host schedules.
- `run_conformance.py` executes the frozen 70-vector corpus.
- `PROOF_EXEC_4_HOST_ORDER_ERASURE.md` proves order erasure over valid host
  schedules for this reference kernel.
- `evidence/` contains deterministic vector receipts and the QueueGate
  evidence summary.
- `PROMOTION_RECORD.md` binds Devon's promotion decision to the immutable
  candidate implementation and evidence identities.

## Boundary

The geometry is fixed for every tick. The implementation provides no external
stimulus API and no self-modifying fabric operation. Closed-run examples seed
their initial `FabricState` directly. The pure reference evaluator packages a
cell's operator, witness, and canonical input frame; this deterministic choice
is intentionally non-normative across independently implemented evaluators.

Passing conformance did not itself authorize promotion. The subsequent
authority transition recorded in `PROMOTION_RECORD.md` promotes
`Q-SWFPGA-EXECUTION-001` without changing the execution evidence or its
predecessor boundaries.
