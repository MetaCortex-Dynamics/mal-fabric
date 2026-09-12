# DEMO-001 implementation notes

## Architecture

`DemoSession.fabric` is the sole committed semantic program. The visual canvas reads cells, derived ports, routes, containment, and TRIAD placement directly from that object. The canonical text pane renders `V3.1.normalize()` of the same object. Text and visual actions both lower through the existing V3.1 parsers to the same `FabricEdit` classes.

Browser coordinates live only in `DemoSession.presentation`. Updating them compares the canonical digest before and after the update. They never enter `FabricSpec`, V3.1 equality, admission evidence, or runtime evidence.

## Governed candidate lifecycle

The deterministic NL template emits two existing `ConnectEdit` values. It cannot commit them. Every edit follows:

```text
parse surface
→ apply existing FabricEdit
→ V3.1 normalize / DRC
→ V3.2 metrics + crossing governance + terminal composition
→ candidate preview
→ explicit user accept or reject
```

`MAYBE` candidates remain visible with their evidence obligations and have `execution_authority := NO`. `NO` candidates expose the exact `BECAUSE`. V3.3 endpoints refuse to start while any candidate remains unresolved.

## Fixture shape

The fixed `IF_THEN × WHEN` gates are structurally complete. User-changeable action relations terminate at a `TOGETHER_ALONE × WHEN` action bus, whose `MEMBER` port has canonical `MANY` multiplicity. This permits a relation to be connected or disconnected as one valid FabricEdit; it avoids pretending that two non-atomic edits can safely replace an `EXACTLY_ONE` route.

The game-style “visible behavior” strip is explicitly non-normative. It lists the canonical incoming action-bus relations. V3.3 runtime output remains the normative execution evidence.

## Runtime boundary

The demo constructs an initial V3.3 `FabricState` for the closed demonstration and calls only the existing `step_fabric` semantics. It does not add an external-stimulus API, reinterpret runtime payloads through V3.2, mutate geometry during execution, or claim multiplayer determinism.

The BLOCKED button loads a partial target-side input buffer and renders V3.3's canonical `BlockedReason`. The HALTED button loads the empty terminal state, making the distinction inspectable.

## Scope

No V3.1, V3.2, or V3.3 source file is modified by DEMO-001. The UI is dependency-free HTML/CSS/JavaScript served by Python's standard library.
