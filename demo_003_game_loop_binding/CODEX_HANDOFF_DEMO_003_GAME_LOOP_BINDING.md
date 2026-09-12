# CODEX_HANDOFF_DEMO_003_GAME_LOOP_BINDING

**Authority spec:** `SPEC-DEMO-003-GAME-LOOP-BINDING.md`
**Import:** published mal-fabric v0.5.0 (`10.5281/zenodo.22725249`)

## Goal

Implement a runnable toy-game vertical slice proving:

```text
canonical game input sampled at logical tick
→ legal V3.3 ingress
→ exactly one STEP_FABRIC
→ committed fabric successor
→ canonical game effect
→ deterministic toy-game update
```

Do not modify V3.1, V3.2, V3.3, DEMO-001, or DEMO-002.

## Preferred directory

```text
v3/software_fpga/demo_003_game_loop_binding/
```

Import existing code; do not fork old semantics.

## Hard invariants

```text
ONE_LOGICAL_TICK_ONE_STEP_FABRIC := REQUIRED
GAME_FRAME_ORDER_IS_NOT_PROGRAM_ORDER := REQUIRED
ACTIVE_RUN_FABRIC_DIGEST_FIXED := REQUIRED
PENDING_PROPOSAL_CANNOT_AFFECT_RUN := REQUIRED
```

Do NOT implement a settle-until-halted inner loop.

## New bridge types

Implement:

```text
GameBindingSpec
GameRunIdentity
GameTickInput
GameEffectBatch
GameTickReceipt
GameLoopTrace
ToyGameState
```

These are product adapter types, not V3.1/V3.3 semantic constructors.

## Toy game

Use deterministic integer-grid state:

```text
player_position
enemy_position
enemy_mode
enemy_health
```

Observations:

```text
player_near
health_low
```

Actions:

```text
APPROACH
FLEE
PATROL
NO_ACTION
```

Avoid physics, floating-point collision, unseeded randomness, networking, or engine dependencies.

## Tick pipeline

Implement exactly:

```text
tick_input_t = SAMPLE(game_state_t)

prepared_t =
  INGRESS_BIND(binding, tick_input_t, fabric_state_t)

fabric_state_{t+1} =
  STEP_FABRIC(program, prepared_t)

effect_batch_t =
  EGRESS_BIND(binding, fabric_state_{t+1})

game_state_{t+1} =
  GAME_APPLY(game_state_t, effect_batch_t)
```

No effect may be applied from intermediate fabric results.

## Ingress boundary

Reuse existing legal runtime input/custody APIs if available.

A bridge-local wrapper may construct only states already legal under V3.3.

Do not:

```text
mutate FabricSpec
create FabricEdits
invoke proposer authority
bypass runtime frame/custody rules
redefine CLOSED_RUN
```

## One-step rule

Instrument so tests prove:

```text
one call to advance_logical_tick()
→ one and only one STEP_FABRIC invocation
```

Render callbacks must never invoke STEP_FABRIC implicitly.

## UI

Reuse the visible fabric UI.

Add:

```text
toy-game panel
Advance Tick
Reset Run
player-near / position control
enemy health control
logical tick counter
game state display
fabric RunStatus
```

Canonical state changes only through logical ticks.

## Fixed run identity

Bind:

```text
fabric_digest
binding_id
initial_game_state_digest
initial_fabric_state_digest
```

If DEMO-002 commits new geometry:

```text
stop/reset current run
create new GameRunIdentity
```

No hot-swap.

Pending proposals may remain visible but cannot affect the active run.

## Egress and effects

Derive effects only from committed successor state.

Canonicalize effect order.

Preferred minimal effect:

```text
SET_ENEMY_ACTION(action)
```

`GAME_APPLY` maps that action deterministically to the toy game state.

## Replay

Add capture/replay of canonical `GameTickInput` sequences.

Required:

```text
same replay fixture
+ different permitted host schedule permutations
+ different render callback cadence
→ same GameLoopTrace
```

Render cadence may be simulated in tests.

## Determinism boundary

Implement/test only:

```text
same committed fabric
same binding
same initial game state
same initial fabric state
same canonical logical tick inputs
→ same canonical trace
```

Do not claim:

```text
network determinism
physics determinism
multiplayer determinism
arbitrary real-time input determinism
```

## Conformance

Exactly 28 vectors:

```text
B01–B06 binding integrity
T01–T08 tick semantics
D01–D06 deterministic trace
N01–N04 negative/boundary
U01–U04 product surface
```

Evidence:

```text
28 vector files
1 canonical summary
29/29 BYTE_IDENTICAL target
```

Also emit a multi-tick replay trace and verify its digest under host-schedule and render-cadence perturbation.

## Regression floor

Must remain unchanged:

```text
V3.1      25/25
V3.2      62/62
V3.3      70/70
DEMO-001  18/18
DEMO-002  24/24
TOTAL PRIOR := 199/199
```

## Required artifacts

At minimum:

```text
README.md
IMPLEMENTATION_NOTES.md
acceptance-summary.json
evidence/
replay fixture
replay trace evidence
```

After implementation freeze, create a separate binding record with:

```text
implementation commit
published v0.5.0 DOI
normative SHA-256 values
acceptance-summary SHA-256
evidence-manifest SHA-256
29/29 replay result
199/199 regression result
unchanged-import statement
```

Do not create a promotion record until separately authorized.

## Exit report

```text
DEMO_003_GAME_LOOP_BINDING := HOLDS

B01–B06 := 6/6
T01–T08 := 8/8
D01–D06 := 6/6
N01–N04 := 4/4
U01–U04 := 4/4

TOTAL := 28/28
EVIDENCE_REPLAY := 29/29 BYTE_IDENTICAL

GAME_LOOP_TRACE_DETERMINISM := HOLDS
ONE_LOGICAL_TICK_ONE_STEP_FABRIC := HOLDS
RENDER_FRAME_NOT_SEMANTIC := HOLDS
ACTIVE_RUN_FABRIC_DIGEST_FIXED := HOLDS
PENDING_PROPOSAL_CANNOT_AFFECT_RUN := HOLDS

V3.1 := UNCHANGED
V3.2 := UNCHANGED
V3.3 := UNCHANGED
DEMO-001 := UNCHANGED
DEMO-002 := UNCHANGED

PROMOTION := NOT PERFORMED
```

## Forbidden shortcuts

Do NOT:

```text
change V3.3 STEP_FABRIC
run multiple hidden STEP_FABRIC calls per logical tick
bind semantic time to requestAnimationFrame
apply game effects from intermediate results
hot-swap committed geometry into active run
let pending proposals affect runtime
invent defaults for BLOCKED state
add engine/network/physics dependencies
claim multiplayer replay determinism
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
