# AMENDMENT-GAME-INPUT-AGENCY-001

Status: AUTHORIZED FOR IMPLEMENTATION
Authority: Devon Generally

## Purpose

Convert the player from an observed fixture into a governed actor while
preserving DEMO-003 as a byte-identical legacy replay surface.

```text
GameTickInputV0 := LEGACY_REPLAY_ONLY
GameTickInputV1 := (tick, player_action)

PlayerAction :=
  MOVE_N | MOVE_S | MOVE_E | MOVE_W | STAY
```

A key press proposes an action. It does not mutate position. The kernel derives
the candidate, decides arena and obstruction admissibility, derives enemy
observations from the resulting player position, executes exactly one governed
tick, and commits the simultaneous successor.

Inadmissible movement is never clamped:

```text
outside arena OR obstructed
  -> BLOCKED disposition
  -> prior position retained
```

## Canonical arena

```text
WorldPositionV1 := (x, y, z) on a signed integer lattice

x := -10..10
y :=  -6..6
z :=  -2..2

Gen0 movement plane := z = 0

obstructions := {
  (2, -1, 0),
  (2,  0, 0),
  (2,  1, 0)
}

admissibility scope := ALL_ENTITY_MOVEMENT
```

ASCII-GEN0 projects only the selected `z = 0` slice. Canonical off-slice state
is not erased.

## Governed unfolding

```text
w_origin       := 0
w_(t+1)        := w_t + 1
w              := logical_tick_index
```

`PlayerAction` has zero authority over `w`. `STAY` preserves spatial position
while the governed tick still advances `w`.

## Required conformance

`M01-M16`, exactly as authorized, including attached/headless trace identity,
GAME/CARRIER toggle nonmutation, V0 rejection on active Gen0 runs, and
byte-identical DEMO-003 legacy replay.
