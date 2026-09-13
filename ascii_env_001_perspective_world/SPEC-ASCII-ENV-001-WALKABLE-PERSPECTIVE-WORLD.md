# SPEC-ASCII-ENV-001-WALKABLE-PERSPECTIVE-WORLD

Status: PROPOSED IMPLEMENTATION TARGET

## 1. Purpose

ASCII-ENV-001 adds an immersive perspective environment projection over the promoted ASCII-GEN0 game. It does not alter game semantics.

The surface must make the canonical world feel spatial before any Gaussian/mesh realization is attempted.

## 2. Canonical state boundary

```text
WorldPositionV1 := (x,y,z)
WorldlineV1     := w

WorldStateV1(w) := (
  player_position(w),
  enemy_position(w),
  enemy_action(w),
  committed_game_state(w),
  committed_fabric_state(w)
)
```

`x,y,z` are spatial. `w` is governed unfolding / worldline and equals `logical_tick_index`.

Forbidden:

```text
player action addressing w
renderer incrementing w
renderer mutating x/y/z
ray caster treating w as a spatial axis
```

## 3. Environment fixture

ASCII-ENV-001 reuses the bound Gen0 arena exactly:

```text
ArenaSpecV1:
  x := -10..10
  y :=  -6..6
  z :=  -2..2

GEN0_MOVEMENT_PLANE:
  z0 := 0

obstructions:
  (2,-1,0)
  (2, 0,0)
  (2, 1,0)

ADMISSIBILITY_SCOPE := ALL_ENTITY_MOVEMENT
```

The projector may derive enclosing visible walls from the arena bounds. Those walls are presentation of the existing out-of-bounds rule; they do not add canonical obstruction cells.

## 4. Perspective projector

The projector may compute:

```text
camera heading
field of view
ray direction
first visible surface
perspective size
fog
ASCII glyph
ANSI foreground/background color
presentation interpolation
```

These values are noncanonical.

The projector must not compute:

```text
movement admissibility
collision successor
patrol/chase/attack/flee decision
detection threshold
health transition
logical tick
worldline successor
```

## 5. Projection record

```text
AsciiProjectionStateV1 := (
  width,
  height,
  heading,
  fov,
  max_distance
)

AsciiFrameV1 := (
  game_run_id,
  w,
  snapshot_digest,
  projection_state_digest,
  canonical_glyph_buffer
)
```

Same committed snapshot plus same projection state must yield the same canonical glyph buffer byte-for-byte.

Terminal escape sequences are transport/presentation wrappers around the canonical glyph/color cells and are nonsemantic.

## 6. Worldline law

```text
w_origin := 0
w_(t+1)  := w_t + 1
w        := logical_tick_index
```

A GAME↔CARRIER toggle at worldline point `w` must not change `w`.

If the kernel advances while CARRIER is shown, returning to GAME renders the newer committed `w`.

## 7. Conformance vectors

```text
AE01 bounds equal promoted Gen0 arena
AE02 obstruction set equal promoted Gen0 set
AE03 z remains canonical and Gen0 player movement remains z0=0
AE04 w is present and non-spatial
AE05 identical snapshot + projection state => byte-identical frame
AE06 projector contains no movement transition function
AE07 projector contains no enemy behavior decision function
AE08 arena exterior visually closes without adding canonical obstructions
AE09 enemy visibility is depth-occluded by canonical geometry
AE10 projection heading changes pixels only, never committed state
```

## 8. Success criterion

The ASCII surface should already read as a game:

> I am inside a bounded place; the wall matters; something is hunting me.

Only after that spatial composition works should a richer renderer be registered to the same canonical environment.
