# MaL Fabric v0.1.0

MaL Fabric defines deterministic canonical static semantics for a MaL-native
software-FPGA fabric. This V3.1 defensive-publication snapshot contains the
normative specification, the fixed 25-vector conformance corpus, a small
reference kernel, and deterministic execution evidence.

## Conformance

```text
REFERENCE_STATIC_KERNEL := HOLDS
CONFORMANCE             := 25/25
positive                := 8/8
negative                := 11/11
confluence              := 6/6
```

Run the conformance suite from the repository root:

```text
python -B reference/run_conformance.py --output evidence
```

A successful replay exits zero, reports `25/25`, and regenerates the 26
evidence JSON files byte-for-byte.

## Contents

- [FABRIC_SPEC.md](FABRIC_SPEC.md) — normative static fabric specification.
- [FABRIC_CONFORMANCE_VECTORS.md](FABRIC_CONFORMANCE_VECTORS.md) — normative
  P01-P08, N01-N11, and C01-C06 corpus.
- [reference/kernel.py](reference/kernel.py) — deterministic static reference
  realization.
- [reference/run_conformance.py](reference/run_conformance.py) — executable
  conformance harness.
- [evidence/queuegate-evidence-summary.json](evidence/queuegate-evidence-summary.json)
  and [evidence/receipts](evidence/receipts) — execution evidence.

## Publication provenance

```text
upstream_commit:
  cb69ed7a38749a00084aa815a65e01bbfd88aee6

source_spec_sha256:
  E328B574DE32635358AC488C4C5E20E80E86A845EB154401C8E1A7C0DD8D68F1

source_vector_corpus_sha256:
  1A9E6E33BCCB0A39AC8626CBBF65C112D80B9A7D5C550A83F9700545C8C5161F

upstream_kernel_sha256:
  8B983301DAD795DD9C3F020970BAD76017EF648AC0C71E3FB6FDEF3D0E4347C0

upstream_queuegate_evidence_summary_sha256:
  16CE384323538A69627B1CFDCDDB677A3056AB5E9B3CD28E3F9B371DE82E04BB

conformance:
  25/25

determinism:
  26/26 byte-identical
```

The source-document hashes bind the authority inputs before publication
line-ending normalization. Release-commit and publication-file identities are
recorded by the tagged Git tree and GitHub release.

## Established static result

V3.1 establishes a canonical geometric program object, dual text/visual
projection onto one edit model, operator-derived interfaces, coordinate-free
semantic placement, static operator-coherent joins, derived TRIAD transitions,
deterministic normalization, content-addressed routing, and independently
reproducible 25/25 static conformance.

V3.1 establishes static fabric determinism. It does **not** establish
`HOST_ORDER_ERASURE` for dynamic execution; that obligation belongs to the
separate V3.3 execution specification.

## Scope boundary

This snapshot excludes Aegis/Hyphasis integration, `d_joint`, repair fiber,
runtime payload execution, synchronous fabric execution, `HOST_ORDER_ERASURE`
implementation, quiescence, WHEN overlay, program-counter semantics, and any
fetch/decode/execute loop.

Public disclosure may bear on prior art, but neither publication nor the
Apache-2.0 license guarantees a particular patent outcome. Apache-2.0 governs
the rights granted by contributors.

## License and citation

Licensed under the [Apache License 2.0](LICENSE). Citation metadata is in
[CITATION.cff](CITATION.cff).
