# Static software-FPGA reference kernel v0.1.0

This directory realizes the execution-only handoff for
`Q-SWFPGA-FABRICSPEC-001`. It implements the static semantics of
`FABRIC_SPEC` v0.1.0-candidate-r2 and executes the fixed 25-vector corpus.
It does not promote the QueueGate candidate.

## Normative input bindings

```text
CODEX_HANDOFF_SWFPGA_V3_1.md
  SHA-256 23DF94664568F814E8EA319EBC2E1B2A49F0AAE359FA7787F9B88CEF3312E292

FABRIC_SPEC_v0.1.0-candidate-r2.md
  SHA-256 E328B574DE32635358AC488C4C5E20E80E86A845EB154401C8E1A7C0DD8D68F1

FABRIC_CONFORMANCE_VECTORS_v0.1.0-r2-final.md
  SHA-256 1A9E6E33BCCB0A39AC8626CBBF65C112D80B9A7D5C550A83F9700545C8C5161F
```

## Implementation

- `__init__.py` exposes the static reference package.
- `kernel.py` defines the canonical primitive object, total schemas,
  containment, placements, routes, the shared edit AST, deterministic `APPLY`,
  recursive `NORMALIZE`, derived relations, and static `DRC`.
- `run_conformance.py` realizes exactly P01-P08, N01-N11, and C01-C06 and
  emits deterministic machine-readable receipts.
- `evidence/receipts/P01.json` through `P08.json`, `N01.json` through
  `N11.json`, and `C01.json` through `C06.json` contain the 25 individual
  receipts.
- `evidence/queuegate-evidence-summary.json` contains the corpus census and
  C4/C5/C8 execution summary.
- `README.md` is this implementation and claim-boundary record.

Run from this directory:

```text
python -B run_conformance.py
```

The implementation uses no random identifiers, wall clock, filesystem
enumeration, process scheduling, or dictionary iteration as semantic input.
Canonical serialization sorts keys and unordered semantic collections.

## Static claim boundary

The following are intentionally absent: GUI, Aegis/Hyphasis integration,
`d_joint`, repair fiber, runtime payload states, synchronous execution,
`HOST_ORDER_ERASURE`, quiescence, WHEN overlay, program counter, and a
fetch/decode/execute loop. Presentation state is accepted only as a projection
input in vectors and is never stored in `FabricSpec`.

QueueGate promotion remains a separate Devon decision.
