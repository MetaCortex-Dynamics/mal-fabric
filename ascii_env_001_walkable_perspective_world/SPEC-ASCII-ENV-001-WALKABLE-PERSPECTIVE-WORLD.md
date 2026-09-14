# SPEC-ASCII-ENV-001-WALKABLE-PERSPECTIVE-WORLD

Status: PROPOSED

## 1. Purpose

ASCII-ENV-001 defines an immersive perspective environment projection over the promoted ASCII-GEN0 game.

It MUST NOT alter game semantics.

Its purpose is to establish a spatially coherent, walkable, atmospheric reference environment before any Gaussian, mesh, or other richer realization is attempted.

The ASCII surface is a first-class projection of the same governed world, not a debug representation.

## 2. Canonical state boundary

```text
WorldPositionV1 := (x, y, z)

WorldlineV1 := w

WorldStateV1(w) := (
  player_position(w),
  enemy_position(w),
  enemy_action(w),
  committed_game_state(w),
  committed_fabric_state(w)
)
```

Normative interpretation:

```text
x, y, z := spatial coordinates

w := worldline
   := governed unfolding
   := logical_tick_index
```

`w` is NOT a fourth movement axis.

Forbidden:

```text
PlayerAction addressing w
renderer incrementing w
renderer decrementing w
renderer preserving/skipping w by authority
renderer mutating canonical x/y/z
ray caster treating w as spatial
```

Only the governed kernel transition advances the worldline.

## 3. Environment fixture

ASCII-ENV-001 inherits the promoted Gen0 arena exactly.

```text
ArenaSpecV1:

  x := -10..10
  y :=  -6..6
  z :=  -2..2

GEN0_MOVEMENT_PLANE:

  z0 := 0

obstructions := {
  (2, -1, 0),
  (2,  0, 0),
  (2,  1, 0)
}

ADMISSIBILITY_SCOPE := ALL_ENTITY_MOVEMENT
```

ASCII-ENV-001 MUST NOT silently replace, enlarge, shrink, or reinterpret this canonical topology.

The projector MAY derive visible enclosing surfaces from the arena bounds.

Those surfaces are projections of the already-authoritative out-of-bounds law.

They MUST NOT create additional canonical obstruction cells.

## 4. Perspective projection

The projector MAY compute presentation quantities including:

```text
camera position derived from committed player position
camera heading
camera pitch
field of view
ray direction
ray traversal
first visible surface
depth
perspective size
fog
glyph density
ASCII glyph selection
ANSI foreground color
ANSI background color
presentation interpolation
```

These values are NONCANONICAL.

The projector MUST NOT compute:

```text
movement admissibility
movement successor
collision consequence
enemy patrol decision
enemy detection decision
enemy approach decision
enemy attack decision
enemy flee decision
health transition
logical tick
worldline successor
```

The renderer observes consequences. It does not decide them.

## 5. Environment projection law

At committed worldline point `w`:

```text
CommittedWorldState(w)
        +
ProjectionState
        ↓
ASCII_PROJECT
        ↓
AsciiFrameV1(w)
```

The ray caster operates over canonical `x,y,z` geometry belonging to the committed state at `w`.

`w` selects the world-state being projected.

It does not participate in spatial ray traversal.

## 6. Projection objects

```text
AsciiProjectionStateV1 := (
  projector_version,
  width,
  height,
  heading,
  pitch,
  field_of_view,
  max_distance
)
```

```text
AsciiFrameV1 := (
  game_run_id,
  w,
  snapshot_digest,
  projection_state_digest,
  deterministic_projection_buffer
)
```

`deterministic_projection_buffer` is:

```text
NONCANONICAL
PRESENTATION_ONLY
ZERO_SEMANTIC_AUTHORITY
```

It is a deterministic output of the bound projector contract.

Its determinism does NOT make it canonical game state.

It MUST NOT:

```text
authorize movement
authorize collision
authorize enemy behavior
authorize worldline transition
be consumed as semantic input by the kernel
become part of canonical world-state identity
```

The only permitted dependency direction is:

```text
committed canonical state
        +
bound projection state
        ↓
deterministic_projection_buffer
```

Never:

```text
deterministic_projection_buffer
        ↓
canonical state
```

Terminal escape sequences and host display behavior remain outside `deterministic_projection_buffer`.

### 6.1 Bound projector representation contract

Byte-identity claims are valid only under one explicitly bound `AsciiProjectorContractV1`.

```text
AsciiProjectorContractV1 := (
  projector_id,
  projector_version,
  coordinate_numeric_domain,
  angular_numeric_domain,
  distance_numeric_domain,
  width,
  height,
  cell_encoding,
  glyph_encoding,
  color_encoding,
  row_order,
  column_order,
  serialization_rule
)
```

For a conformance run, every field above MUST be fixed before projection begins.

No byte-identity claim is licensed across different projector contracts.

Required bindings for the first implementation SHALL include:

```text
projector_id:
  ASCII_ENV_001_PROJECTOR

projector_version:
  exact immutable implementation version or content digest

coordinate_numeric_domain:
  exact representation bound by implementation

angular_numeric_domain:
  exact representation bound by implementation

distance_numeric_domain:
  exact representation bound by implementation

width:
  exact positive integer

height:
  exact positive integer

cell_encoding:
  exact field structure for one projected cell

glyph_encoding:
  exact character encoding

color_encoding:
  exact foreground/background representation

row_order:
  exact traversal order

column_order:
  exact traversal order

serialization_rule:
  exact byte serialization of the complete projection buffer
```

A projector implementation MUST fail closed for deterministic replay if any required representation field is unbound.

The spec does not pre-authorize a particular numeric or serialization representation merely by naming these fields. Those values become authoritative for a realization only when explicitly bound in its implementation contract.

#### 6.1.1 Duplicated-field equality law

Fields duplicated between `AsciiProjectionStateV1` and `AsciiProjectorContractV1` MUST agree exactly.

```text
REQUIRE:

  AsciiProjectionStateV1.projector_version
    = AsciiProjectorContractV1.projector_version

  AsciiProjectionStateV1.width
    = AsciiProjectorContractV1.width

  AsciiProjectionStateV1.height
    = AsciiProjectorContractV1.height
```

Otherwise:

```text
FAIL_CLOSED

BYTE_IDENTITY_CLAIM := FORBIDDEN
```

No coercion, normalization, fallback, or implicit substitution may repair a mismatch after projection begins.

## 7. Worldline law

```text
w_origin := 0

w_(t+1) := w_t + 1

w := logical_tick_index
```

A GAME ↔ CARRIER projection toggle at worldline point `w` MUST preserve:

```text
game_run_id
w
snapshot_digest
canonical committed state
```

The toggle itself MUST NOT advance time.

If governed execution continues while CARRIER is displayed:

```text
w
→ w+1
→ w+2
```

then returning to GAME MUST project the latest committed worldline state.

## 8. Entity projection

Player and enemy representations MUST derive exclusively from committed entity state.

Examples:

```text
committed player position
  → projected player location

committed enemy position
  → projected enemy location

committed EnemyAction.PATROL
  → patrol visual treatment

committed EnemyAction.APPROACH
  → approach visual treatment

committed EnemyAction.ATTACK
  → attack visual treatment

committed EnemyAction.FLEE
  → flee visual treatment

committed BLOCKED
  → blocked visual treatment
```

No visual treatment may cause the corresponding semantic action.

## 9. Visibility and occlusion

Canonical geometry MAY occlude projected entities.

Therefore:

```text
canonical obstruction
between camera and enemy
→ enemy may be visually hidden
```

Visibility is a projection result.

Occlusion MUST NOT alter:

```text
enemy existence
enemy state
enemy behavior
player state
admissibility
worldline
```

## 10. Surface authority

```text
ASCII_AUTHORITY := NONE
```

The ASCII environment may:

```text
READ committed state
PROJECT committed state
SUBMIT canonical PlayerAction through the existing input boundary
TOGGLE presentation surface
```

It may not directly mutate canonical state.

The reference authority chain remains:

```text
keyboard event
  ↓
canonical PlayerAction
  ↓
promoted MaLCog v3 / ASCII-GEN0 kernel
  ↓
committed WorldStateV1(w)
  ↓
ASCII-ENV-001 projection
```

## 11. Conformance vectors

```text
AE01
Arena bounds equal the promoted Gen0 arena.

AE02
Canonical obstruction set equals the promoted Gen0 obstruction set.

AE03
z remains canonical and Gen0 player movement remains restricted to z0 = 0.

AE04
w is explicit, equals logical_tick_index, and is never treated as a spatial coordinate.

AE05
Under one identical bound AsciiProjectorContractV1:

  same committed snapshot
  +
  same AsciiProjectionStateV1

  → byte-identical deterministic_projection_buffer

AE05 is licensed only when:

  AsciiProjectionStateV1.projector_version
    = AsciiProjectorContractV1.projector_version

  AsciiProjectionStateV1.width
    = AsciiProjectorContractV1.width

  AsciiProjectionStateV1.height
    = AsciiProjectorContractV1.height

AE05 MUST NOT be asserted when any of the following differs or is unbound:

  projector version
  numeric representation
  projection dimensions
  glyph encoding
  color encoding
  cell representation
  serialization order
  serialization format

Any duplicated-field mismatch requires:

  FAIL_CLOSED
  BYTE_IDENTITY_CLAIM := FORBIDDEN

AE05 establishes deterministic presentation only.
It establishes no canonical-state authority for the resulting bytes.

AE06
The projector contains no player movement transition authority.

AE07
The projector contains no enemy-behavior decision authority.

AE08
Arena exterior may visually close the scene without adding canonical obstruction cells.

AE09
Canonical obstruction geometry can visually occlude an enemy without mutating enemy state.

AE10
Changing camera heading/pitch/FOV changes projection only and leaves committed state unchanged.

AE11
GAME → CARRIER toggle preserves game_run_id, w, snapshot_digest, and committed state.

AE12
CARRIER → GAME toggle preserves state when no governed tick occurred.

AE13
If governed ticks occur while CARRIER is displayed, returning to GAME renders the newer committed w.

AE14
ASCII attached versus headless execution produces an identical canonical game trace for the same initial state and PlayerAction sequence.

AE15
ASCII projection cannot directly construct or install player_position, enemy_position, EnemyAction, or worldline successor.
```

## 12. Product evidence

```text
STATUS := PRODUCT_EVIDENCE

NORMATIVE_CONFORMANCE_AUTHORITY := NONE
```

The desired experiential result is:

> I am inside a place. The geometry matters. Something is hunting me.

Desired qualities may include:

```text
full-screen
atmospheric
depth-readable
spatially coherent
deliberate glyph density
distance-sensitive fog
minimal debug chrome
```

These are evaluation targets for product quality.

They are NOT:

```text
normative conformance vectors
promotion predicates
semantic invariants
authority gates
proof obligations
```

Failure to achieve the desired experiential quality MAY motivate another presentation revision, but by itself MUST NOT cause a normative conformance failure.

Normative completion of ASCII-ENV-001 is determined only by the explicitly enumerated conformance requirements elsewhere in this specification.

## 13. Successor boundary

Only after ASCII-ENV-001 establishes a coherent encounter may a richer presentation realization inherit the environment.

The intended lineage is:

```text
canonical governed world
        ↓
ASCII-ENV-001
        ↓
environment fixture frozen
        ↓
richer renderer registration
        ↓
same canonical world
```

A Gaussian or mesh renderer MUST NOT redefine world topology, gameplay scale, obstruction authority, entity movement, or worldline semantics.

## 14. Non-goals

ASCII-ENV-001 does not authorize:

```text
new gameplay mechanics
new movement semantics
vertical player movement
new enemy behavior
Gaussian registration
mesh collision
renderer-owned physics
renderer-owned line-of-sight semantics
new canonical obstruction topology
```

Those require separate successor authority.

## Authority clarification

The following remains unchanged:

```text
ASCII_AUTHORITY := NONE
```

Deterministic projection does not imply canonicality.

Therefore:

```text
canonical state
  → deterministic presentation
```

is permitted, while:

```text
deterministic presentation
  → canonical authority
```

is forbidden.
