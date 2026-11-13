# RECEIPT — DECIDE: publication surface for witness 284 is a filtered export, the rest by hash

```text
ACT        := DECIDE (publication surface)
BY         := Devon A. Generally
STATEMENT  := "filter and hash" (verbatim, 2026-11-13 18:42 America/New_York), in reply to Claude's message of 18:41 setting
              out three surfaces for witness 284 (full push; filtered export; hash only) after Codex's dry run.
RECORDED BY:= Claude (PROPOSE; records the act, does not perform it)
OBJECT     := the discharge witness at commit dfbbffe03fc97796ee78c7eb6eaec93a70196c6a (535-file witness package plus the
              five-file Metis association package; SHA256SUMS in substrate_witness_of_shed_284/).
```

## Reading taken (Claude, PROPOSE)
- Publish a FILTERED export: a separate publication commit with an explicit manifest, in the form of the Genesis
  PUBLIC_EVIDENCE_MANIFEST. Files left out of it are referenced by HASH only.
- The sealed local witness, commits 7b37c9ab, 6338b94d and dfbbffe0, are not amended. dfbbffe0 itself is not pushed, BECAUSE
  pushing it would publish all 540 files in ancestry.
- Proposed split, for Devon to correct: IN: spec, receipts, run record, envelopes, comparison, obligations, SHA256SUMS.
  BY HASH: observer sources, binaries, raw and compressed readbacks, event capture.
- Device identity (UUID, PCI, VBIOS) is inside the receipts and the run record; a manifest that includes those publishes it.

## Not taken from the statement
- Push, DOI deposit or Substack posting. Each needs Devon's word when the filtered commit is ready (the recorded workflow
  separated upload from "publish it"). No Metis byte, status or execution change. 038 untouched.
