# SPEC-DEMO-003-GAME-LOOP-BINDING

**Status:** BUILD AUTHORIZED
**Depends on:** mal-fabric v0.5.0 (`10.5281/zenodo.22725249`)
**Scope:** logical game tick ↔ committed fabric execution boundary
**Hard invariant:** `GAME_FRAME_ORDER ≠ PROGRAM_SEMANTICS`

## 0. Purpose

DEMO-003 proves that the published mal-fabric product surface can drive a running game-like system through an explicit logical tick boundary without modifying V3.1, V3.2, V3.3, DEMO-001, or DEMO-002.

```text
committed geometric fabric
+ canonical game-tick input
+ explicit binding
→ one V3.3 STEP_FABRIC
→ canonical game-effect batch
→ deterministic toy-game state transition
```

The demo succeeds iff an identical logical tick-input trace, from the same initial game/fabric state and same committed fabric/binding identities, produces the same canonical game/fabric trajectory.

This is NOT a claim of general multiplayer, physics-engine, network, wall-clock, or arbitrary frame-rate determinism.

## 1. Imported substrate

Import mal-fabric v0.5.0 unchanged:

```text
V3.1      := canonical FabricSpec
V3.2      := governed admission
V3.3      := synchronous execution
DEMO-001  := visible fabric
DEMO-002  := vibe proposer
```

Publication identity:

```text
v0.5.0 version DOI:
  10.5281/zenodo.22725249

concept DOI:
  10.5281/zenodo.22678127
```

CANNOT MODIFY:

```text
V3.1 semantics
V3.2 semantics
V3.3 semantics
DEMO-001 evidence/behavior
DEMO-002 evidence/behavior
HOST_ORDER_ERASURE theorem domain
```

DEMO-003 is a boundary adapter around committed V3.3 execution.

## 2. Product claim

```text
A committed geometric program can participate in a logical game loop.

External game observations are sampled only at a defined tick boundary.

The bridge converts that observation into canonical fabric ingress.

Exactly one STEP_FABRIC is performed per logical game tick.

Game-visible effects are derived only from the committed successor
fabric state.

Render-frame order and host traversal order do not become program order.
```

Product sentence:

> The game has frames. The fabric has ticks. The binding makes the boundary explicit.

## 3. New objects

DEMO-003 adds:

```text
GameBindingSpec
GameTickInput
GameEffectBatch
GameRunIdentity
GameTickReceipt
GameLoopTrace
ToyGameState
```

These are product-layer bridge objects.

They are NOT additions to `FabricEditAST`.
They are NOT V3.3 payload-state constructors.
They do not modify canonical `FabricSpec`.

## 4. GameBindingSpec

```text
GameBindingSpec := (
  binding_id,
  fabric_digest,
  ingress_bindings,
  egress_bindings,
  game_update_law_id
)
```

```text
binding_id
  := content-addressed identity over canonical binding content

fabric_digest
  := exact committed FabricSpec identity the binding targets

ingress_bindings
  := canonical mapping from supported game observations
     to declared fabric ingress targets

egress_bindings
  := canonical mapping from committed fabric outputs/results
     to supported game effects

game_update_law_id
  := identity of deterministic toy-game update function
```

Law:

```text
binding.fabric_digest = run.fabric_digest
```

Presentation layout is excluded from `binding_id`.

## 5. Toy game domain

Minimum canonical state:

```text
ToyGameState := (
  player_position,
  enemy_position,
  enemy_mode,
  enemy_health
)
```

Minimum observations:

```text
player_near : bool
health_low  : bool
```

Minimum fabric-selected behavior:

```text
EnemyAction :=
  APPROACH
  | FLEE
  | PATROL
  | NO_ACTION
```

The toy game update MUST be deterministic and discrete.

No physics engine is normative.
No floating-point collision system is required.
A reference update may move the enemy by one integer grid unit.

## 6. Logical tick versus render frame

```text
LogicalGameTick := nonnegative integer
RenderFrame     := presentation event

LogicalGameTick ≠ RenderFrame
```

The renderer MAY produce zero, one, or many frames between logical game ticks.

Excluded from canonical game-loop identity:

```text
render-frame count
wall-clock duration
animation interpolation
browser callback order
```

Only explicit logical tick advancement changes normative game/fabric state.

## 7. GameRunIdentity

```text
GameRunIdentity := (
  run_id,
  fabric_digest,
  binding_id,
  initial_game_state_digest,
  initial_fabric_state_digest
)
```

`run_id` is content-addressed over the canonical fields.

For every tick in one run:

```text
FabricSpec digest = run.fabric_digest
```

If DEMO-002 commits new geometry:

```text
new FabricSpec digest ≠ run.fabric_digest
→ current run cannot continue under new geometry
→ NEW GameRunIdentity required
```

No hot-swapping committed geometry into an active run in DEMO-003.

## 8. GameTickInput

At logical tick `t`, sample game observations exactly once:

```text
GameTickInput := (
  tick_index,
  run_id,
  pre_game_state_digest,
  pre_fabric_state_digest,
  observations
)
```

```text
observations := (
  player_near,
  health_low
)
```

No mid-tick resampling.

UI/keyboard/pointer/network/wall-clock changes after sampling are deferred to a future logical tick.

## 9. Ingress binding

Define a product-layer adapter:

```text
INGRESS_BIND :
  GameBindingSpec
  × GameTickInput
  × FabricState_t
  → PreparedFabricState_t
```

Requirements:

```text
uses declared ingress_bindings only
creates only existing legal V3.3 runtime custody/input structures
does not mutate FabricSpec
does not create FabricEdits
does not invoke DEMO-002 proposer authority
does not bypass existing runtime frame/custody requirements
```

If an existing valid ingress adapter exists, reuse it.

Boundary injection is explicit external stimulus and remains outside the CLOSED_RUN theorem domain.

DEMO-003 does NOT redefine CLOSED_RUN.

## 10. One-step tick law

For each logical tick:

```text
prepared_t :=
  INGRESS_BIND(binding, tick_input_t, fabric_state_t)

fabric_state_{t+1} :=
  STEP_FABRIC(program, prepared_t)
```

Normative law:

```text
ONE LogicalGameTick
→ EXACTLY ONE STEP_FABRIC
```

FORBIDDEN:

```text
loop STEP_FABRIC until HALTED
loop STEP_FABRIC until quiescent
hide extra microticks
use render frames as implicit fabric ticks
```

Any multi-tick propagation latency remains explicit logical latency.

## 11. Egress binding

Game effects derive only from committed successor state:

```text
EGRESS_BIND :
  GameBindingSpec
  × committed FabricState_{t+1}
  → GameEffectBatch_t
```

```text
GameEffectBatch := (
  tick_index,
  run_id,
  effects
)
```

Minimum effect:

```text
SET_ENEMY_ACTION(EnemyAction)
```

Forbidden:

```text
read Phase-2 cell results directly
read partially committed route results
apply effects before STEP_FABRIC commit
derive effect order from host traversal
```

## 12. Game update boundary

```text
GAME_APPLY :
  ToyGameState_t
  × GameEffectBatch_t
  → ToyGameState_{t+1}
```

`GAME_APPLY` MUST be deterministic.

Normative tick equation:

```text
tick_input_t
  := SAMPLE(ToyGameState_t)

prepared_t
  := INGRESS_BIND(binding, tick_input_t, FabricState_t)

FabricState_{t+1}
  := STEP_FABRIC(program, prepared_t)

effect_batch_t
  := EGRESS_BIND(binding, FabricState_{t+1})

ToyGameState_{t+1}
  := GAME_APPLY(ToyGameState_t, effect_batch_t)
```

No game-visible effect from tick `t` may be applied before committed `FabricState_{t+1}` exists.

## 13. GameTickReceipt

Each logical tick emits deterministic evidence:

```text
GameTickReceipt := (
  tick_index,
  run_id,
  fabric_digest,
  binding_id,
  pre_game_state_digest,
  pre_fabric_state_digest,
  game_tick_input_digest,
  prepared_fabric_state_digest,
  post_fabric_state_digest,
  effect_batch_digest,
  post_game_state_digest,
  run_status,
  blocked_reason?
)
```

Wall-clock timestamps are excluded from canonical receipt identity.

Receipt ordering is by `tick_index`.

## 14. GameLoopTrace

```text
GameLoopTrace := (
  run_id,
  ordered_tick_receipts
)
```

Trace identity is derived from canonical tick receipts.

## 15. Theorem — GAME_LOOP_TRACE_DETERMINISM

For two runs R1 and R2, if:

```text
same committed FabricSpec digest
same GameBindingSpec
same initial ToyGameState
same initial FabricState
same canonical GameTickInput sequence
same deterministic GAME_APPLY law
and each fabric step uses a ValidHostSchedule
```

then for every compared logical tick:

```text
FabricState_R1(t) = FabricState_R2(t)
ToyGameState_R1(t) = ToyGameState_R2(t)
GameEffectBatch_R1(t) = GameEffectBatch_R2(t)
GameTickReceipt_R1(t) = GameTickReceipt_R2(t)
```

therefore:

```text
GameLoopTrace_R1 = GameLoopTrace_R2
```

Reason:

```text
canonical ingress
+ V3.3 HOST_ORDER_ERASURE
+ canonical egress
+ deterministic GAME_APPLY
```

The theorem is conditional on identical canonical tick-input traces.

## 16. Render-rate independence boundary

Allowed:

```text
Given the SAME explicit logical tick sequence and SAME sampled
GameTickInput sequence, differing render-frame counts between ticks
do not change the canonical game/fabric trace.
```

Not claimed:

```text
arbitrary real-time input timing is deterministic
arbitrary browser scheduling is deterministic
arbitrary frame-rate-sensitive game code is deterministic
```

## 17. RunStatus behavior

Import V3.3 unchanged:

```text
RUNNING
HALTED
BLOCKED
```

If BLOCKED, show canonical `BlockedReason`.

BLOCKED does not authorize defaults, timeouts, or skipped operands.

No timeout-to-action semantics.

## 18. Geometry mutation boundary

While `GameRunIdentity` is active:

```text
committed fabric digest is fixed
```

DEMO-002 proposals may remain visible, but:

```text
pending proposal := non-executable

newly committed geometry:
  requires STOP/RESET current run
  requires NEW GameRunIdentity
```

No live geometry swap.

## 19. Demo interaction

UI shows together:

```text
toy game
committed fabric
runtime overlay
logical tick counter
```

Minimum controls:

```text
Advance Tick
player-near / player-position control
enemy-health control
Reset Run
```

Demo flow:

```text
1. start known GameRunIdentity
2. set player_near = true
3. advance logical ticks
4. observe fabric wavefront and eventual APPROACH
5. set health_low = true at a future tick boundary
6. observe subsequent FLEE behavior
7. capture exact tick-input trace
8. replay trace
9. perturb render-frame cadence
10. verify identical canonical GameLoopTrace
```

## 20. Conformance corpus

Freeze DEMO-003 at 28 vectors.

### B — binding integrity (B01–B06)

```text
B01 binding targets exact committed fabric digest
B02 ingress bindings reference declared targets only
B03 egress bindings reference declared outputs only
B04 binding_id deterministic
B05 presentation layout excluded from binding identity
B06 mismatched fabric digest rejects binding/run start
```

### T — tick semantics (T01–T08)

```text
T01 GameTickInput sampled once at tick boundary
T02 one logical tick invokes exactly one STEP_FABRIC
T03 no mid-tick resampling
T04 egress reads committed successor state only
T05 GAME_APPLY occurs after fabric commit
T06 render frames do not advance logical tick
T07 tick receipt uses logical tick index, not wall clock
T08 multi-tick fabric latency remains explicit
```

### D — deterministic trace (D01–D06)

```text
D01 identical initial state + input trace → identical fabric trajectory
D02 identical initial state + input trace → identical game trajectory
D03 different ValidHostSchedule + same trace → identical canonical trace
D04 different render-frame cadence + same tick trace → identical canonical trace
D05 effect batch canonical order independent of host traversal
D06 repeated clean-process replay → identical GameLoopTrace
```

### N — negative / boundary (N01–N04)

```text
N01 pending DEMO-002 proposal cannot affect active run
N02 committed geometry change requires new GameRunIdentity
N03 BLOCKED fabric does not invent timeout/default game action
N04 no path/claim for network/physics/multiplayer determinism
```

### U — product surface (U01–U04)

```text
U01 game + fabric + runtime overlay visible together
U02 logical tick controls drive canonical tick progression
U03 exact replay trace can be captured and replayed
U04 reset restores bound initial game/fabric identities
```

Total:

```text
6 + 8 + 6 + 4 + 4 = 28
```

## 21. Deterministic evidence

Emit:

```text
28 per-vector canonical evidence artifacts
1 canonical summary
```

Target:

```text
29/29 byte-identical across repeated clean-process runs
```

Also emit at least one canonical multi-tick `GameLoopTrace`.

Its digest MUST reproduce under:

```text
same initial identities
same canonical GameTickInput sequence
different permitted host schedules
different render-frame cadence
```

## 22. Regression floor

Must remain unchanged:

```text
V3.1      := 25/25
V3.2      := 62/62
V3.3      := 70/70
DEMO-001  := 18/18
DEMO-002  := 24/24
TOTAL PRIOR := 199/199
```

## 23. Acceptance criteria

```text
DEMO_003_GAME_LOOP_BINDING := HOLDS IFF

  B01–B06 = 6/6
  T01–T08 = 8/8
  D01–D06 = 6/6
  N01–N04 = 4/4
  U01–U04 = 4/4

  TOTAL = 28/28

  AND evidence replay = 29/29 BYTE_IDENTICAL

  AND GAME_LOOP_TRACE_DETERMINISM = HOLDS
      for the defined toy-game/binding domain

  AND ONE_LOGICAL_TICK_ONE_STEP_FABRIC = HOLDS
  AND RENDER_FRAME_NOT_SEMANTIC = HOLDS
  AND ACTIVE_RUN_FABRIC_DIGEST_FIXED = HOLDS
  AND pending proposals cannot affect active run
  AND imported v0.5.0 layers remain unchanged
```

## 24. Non-goals

```text
NO general game-engine plugin
NO Godot/Unity/Unreal dependency
NO physical-time guarantee
NO arbitrary frame-rate-sensitive gameplay claim
NO physics-engine determinism claim
NO RNG determinism claim unless explicitly bound later
NO network determinism claim
NO multiplayer replay claim
NO live fabric hot-swap
NO self-modifying V3.3 geometry
NO hidden settle-until-quiescent loop
NO extra FabricEdit constructors
```

## 25. Implementation order

```text
1. import published v0.5.0 unchanged
2. define ToyGameState
3. define GameBindingSpec
4. define GameRunIdentity
5. define GameTickInput
6. implement SAMPLE
7. implement INGRESS_BIND using legal V3.3 custody/input structures
8. call exactly one STEP_FABRIC per logical tick
9. implement EGRESS_BIND from committed successor state
10. implement deterministic GAME_APPLY
11. emit GameTickReceipt
12. emit GameLoopTrace
13. add game panel beside existing fabric UI
14. add Advance Tick / Reset controls
15. add replay capture/replay
16. implement B/T/D/N/U vectors
17. run 199/199 regression floor
18. replay 29 evidence artifacts
19. bind implementation/evidence hashes
20. await separate promotion decision
```

## 26. Promotion boundary

```text
IMPLEMENT
→ VERIFY 28/28
→ REPLAY 29/29 BYTE_IDENTICAL
→ REGRESSION 199/199 unchanged
→ BIND
→ PROMOTE by separate authority action
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
