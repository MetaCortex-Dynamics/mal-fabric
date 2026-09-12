# DEMO-003 — Game Loop Binding

DEMO-003 binds the published mal-fabric v0.5.0 product surface to a deterministic toy game. It demonstrates one explicit boundary:

```text
sample canonical game observations once
→ bind legal V3.3 ingress
→ execute exactly one STEP_FABRIC
→ read only the committed successor
→ apply a canonical effect batch to integer-grid game state
```

The game has frames. The fabric has ticks. Render callbacks never advance semantic state.

## Run

From this directory:

```text
python -B demo_server.py
```

Open `http://127.0.0.1:8767`. Stage `player_near` and `enemy_health`, then use **Advance logical tick**. The fabric custody overlay and game state are displayed together. **Render frame** changes presentation instrumentation only.

## Verify

```text
python -B run_conformance.py
```

The frozen target is 28/28 vectors and 29/29 byte-identical JSON evidence artifacts:

```text
B01–B06  binding integrity
T01–T08  tick semantics
D01–D06  deterministic trace
N01–N04  negative and authority boundaries
U01–U04  product surface
```

`replay-fixture.json` is the canonical twelve-tick input sequence. `replay-trace.json` is the resulting canonical multi-tick trace.

## Authority and claim boundary

The active `GameRunIdentity` binds the committed fabric digest, binding identity, initial game-state digest, and initial fabric-state digest. Pending DEMO-002 proposals cannot affect it. A committed geometry change requires an explicit reset and a new run identity; hot-swapping is forbidden.

This demo establishes determinism for the same committed fabric, binding, initial states, and canonical logical-tick inputs. It does not claim network, multiplayer, physics-engine, wall-clock, or arbitrary real-time input determinism.

Imported V3.1, V3.2, V3.3, DEMO-001, and DEMO-002 semantics are unchanged. The publication import is mal-fabric v0.5.0, DOI `10.5281/zenodo.22725249`.
