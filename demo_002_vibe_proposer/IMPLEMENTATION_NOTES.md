# DEMO-002 Implementation Notes

## Authority separation

`proposal_kernel.py` keeps proposal state outside DEMO-001's canonical
`FabricSpec`. `DeterministicGrammar` receives an immutable `ProposalContext`
containing identifiers, types, semantic locations, derived ports, routes, and
the four supported V3.1 edit affordances. It receives no mutable fabric,
runtime, presentation, or authority handle.

There is deliberately no `propose_and_commit` or proposer `commit` method.

```text
propose     → PROPOSED
accept      → ACCEPTED_FOR_ADMISSION
submit      → V3.1 / V3.2
commit      → only after every imported check returns authority
```

Only `submit_admission` can replace the session's promoted fabric, and it does
so atomically after recomputing the candidate from the bound baseline. V3.1
rejection, V3.2 `MAYBE`, `NO`, `NOT_SAME`, candidate mismatch, and stale
baseline all fail closed without mutation.

## Identity surfaces

`proposal_id` covers normalized intent, typed AST, canonical edits, baseline,
candidate digest, and parent proposal identity. Raw phrasing and explanatory
prose are retained as evidence but excluded from proposal identity so declared
equivalent phrasings can be `SAME`.

`GeometricDiff` is derived from baseline and candidate fabrics. Its identity
excludes presentation coordinates and unchanged display context. The generic
renderer understands added cells, but the deterministic grammar emits only
`PLACE`, `MOVE`, `CONNECT`, and `DISCONNECT`.

## Lifecycle and genealogy

`MODIFY` closes the predecessor as `SUPERSEDED`, appends a canonical user edit,
and creates a successor with a new content-addressed identity and explicit
parent. `REJECT` retains history while preserving fabric and runtime. Logical
`proposal_seq` provides deterministic ordering; no wall-clock value enters
identity or evidence.

## Runtime boundary

The V3.3 wrapper rejects execution while any proposal remains open, including
`PROPOSED`, `ACCEPTED_FOR_ADMISSION`, `STALE`, or governance-failed states.
After commit it delegates to unchanged DEMO-001/V3.3 runtime methods.

## Non-goals preserved

No provider dependency, external LLM inference, arbitrary-language claim,
automatic repair, automatic rebase, self-modifying geometry, engine bridge,
or multiplayer-determinism claim is introduced.
