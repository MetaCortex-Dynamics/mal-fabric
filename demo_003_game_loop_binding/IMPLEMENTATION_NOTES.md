# DEMO-003 Implementation Notes

## Boundary adapter

`game_loop.py` imports the DEMO-002 kernel by exact SHA-256 and reuses its promoted V3.1/V3.2/V3.3 stack. DEMO-003 adds product-layer bridge values only; it does not add a `FabricEditAST` constructor or payload-custody state.

`GameBindingSpec` is content-addressed over the committed fabric digest, canonical ingress and egress rules, and the toy update-law identity. Presentation data is absent from this hash domain.

`GameRunIdentity` is content-addressed over:

```text
fabric_digest
binding_id
initial_game_state_digest
initial_fabric_state_digest
```

## Tick implementation

`GameLoopEngine.advance_logical_tick()` performs this ordered pipeline:

1. sample staged controls once into a `GameTickInput`;
2. translate the matching ingress rule into legal V3.3 admitted payload custody;
3. invoke one semantic V3.3 `STEP_FABRIC` operation;
4. derive `GameEffectBatch` only from the returned committed successor;
5. apply sorted effects through the integer-only toy update law;
6. append a content-addressed `GameTickReceipt` to `GameLoopTrace`.

Instrumentation records sample calls and semantic step calls. There is no settle loop. `render_frame()` increments presentation instrumentation without sampling, stepping, or mutating canonical game/fabric state.

The reference toy domain uses integer grid positions and integer health. It has no random source, floating-point physics, network input, or engine dependency.

## Proposal interaction

The imported DEMO-002 session remains available while a game run is active. A pending candidate is preview-only and the engine verifies the committed digest before every tick. If the governed path commits a changed `FabricSpec`, the current run transitions to `reset_required`; it cannot execute the changed geometry until `reset_run()` creates a new binding and `GameRunIdentity`.

## Evidence

`run_conformance.py` emits exactly 28 vector receipts plus one canonical summary. It also emits `replay-trace.json` from the canonical fixture and checks the trace under the reversed valid host schedule and altered render cadence.

The evidence claim is limited to deterministic logical inputs under the same run identity. External-stimulus equality is an explicit precondition.
