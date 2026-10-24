# Receipt — PROMOTE the first-tick conformance run (V1/V2 CONFORM = IF_THEN) and authorize COMMIT

```text
ACT        := PROMOTE (run result) + COMMIT authorized (local; NO push)
BY         := Devon Generally (DECIDE / PROMOTE)
WHEN       := 2026-10-22 15:23 America/New_York
STATEMENT  := "Promote the run and commit"
RECORDER   := Claude (PROPOSE; records the act, does not perform it)
EXECUTOR   := Codex (EXECUTE: commit on Devon's machine)
```

## What is promoted

The conformance result of SPEC-FLAG-WORLD-FIRST-TICK-001 v0.1.1 (sha256 73429D78A8430AF060197D7022A5FB16549F03EEB5851C4164229E65E92AFFEE)
realized on the RTX 3070, as recorded in Codex's combined run record (parallel_prefill_002):

```text
V1  EXECUTED / SAME   committed output == frozen V1.expected.json
                      sha256 69786966E9B5D66A2078D29C43E1F1511545786AB07BF562E37D91205085B588, 33,563 bytes
                      receipt: 2 discharged, 2 opened, 3 walls after; finished 2026-10-22 12:18 ET
V2  EXECUTED / SAME   committed output == frozen V2.expected.json
                      sha256 BD0492B4CAC427432CC3251EB27FC997C0D5EFF2862ECBC10A89B9AC19F1AD0F, 33,548 bytes
                      finished 2026-10-22 14:38 ET, error 0
CONFORM (002 order)   IF_THEN
```

Identity of the promoted result is carried by the frozen expected bytes above: the promoted run is the one whose
committed outputs equal them. Codex states the combined run record's own SHA-256 in the commit message and in
its acknowledgement of this receipt; that hash is then the record's binding. If it is NOT_SAME across any copy,
the commit stops and both are kept.

Supporting custody (cited, not re-promoted):
- Stage-one closure readback 6C30E87F…DB09849, reproduced byte-identical by exact replay (2026-10-22 11:53 ET).
- Parallel matcher (32 lanes, ordered single-writer commit), bounded qualification SAME (6,484-fact closure).
- Carrier-only prefill manifest D40F88D9…DF4AD7; qualification DEFE7ABF…9DA573.
- Independent reference ref012 (Claude), index 1FA1397F…3FD79: 65/65 full-set comparisons SAME.
- Capacity-exhaustion refusal witnessed. V1 final closure 1,943,316 / 2,097,152; V2 1,506,901.
- Laws in force: readout 057C30E2…, d_G 3419D528…, GPU self-witness 2CBBA4AD…, S/F binding 276EBD71….

## Scope

Promotes: the step law's GPU realization reproduces the specified first tick exactly on both frozen vectors.
Does NOT promote: the J17 hardware-genesis world's own second link (uncommitted); placement beyond J17 at genesis;
marker route geometry for the J17 world. The serial run that ended without a readback is not counted.

## COMMIT — authorized, with these limits

- Commit the realization source, the .mal sources, the run records, readbacks, prefill manifest and qualification
  records, and this receipt, to the existing local review branch(es). One commit (or one per repo), no rebase,
  no force.
- NO push. Push waits on a separate statement from Devon.
- Never stage: `__pycache__/`, `*.pyc` (Devon's standing hygiene rule), frozen expected bytes edits (none permitted),
  binaries written back over originals.
- Byte custody: hashes of every committed evidence file listed in the commit message or a SHA256SUMS file in the
  commit; SHA256SUMS verified SAME after the commit.
- Commit message ends with Codex's own attribution as its environment requires.

## Supersedes

```text
none. First promotion of a flag-world execution result.
```

## Recorded, not performed

- Push / remote seal: NOT authorized.
- The J17 world's second step: next O_exec.
- Runtime-sized fact table: O_next.
