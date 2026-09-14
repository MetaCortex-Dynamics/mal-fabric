# Promotion Record — ASCII-GEN0 / Game Input Agency 001

```text
ASCII_GEN0                      := PROMOTED
AMENDMENT_GAME_INPUT_AGENCY_001 := PROMOTED

IMPLEMENTATION_COMMIT:
  fa549aeef9a21e291503e5507fe53517e9320207

BINDING_COMMIT:
  318c328b8c63365d064b9ba8fe4f3d0c05671b07

BINDING_RECORD_SHA256:
  590E5922725001F8F95966D515871F4338699E52A692D676FEEF39AB34EC08D5
```

## Promotion basis

```text
M01-M16                    := 16/16
EVIDENCE_REPLAY            := 17/17 BYTE_IDENTICAL
DEMO_003_REPLAY            := 28/28 UNCHANGED
BOUND_HASHES               := UNCHANGED

BLOCK_NOT_CLAMP            := HOLDS
KERNEL_POSITION_AUTHORITY  := HOLDS
ALL_ENTITY_ADMISSIBILITY   := HOLDS
PLAYER_ACTION_ZERO_W_AUTHORITY := HOLDS
ASCII_ATTACHED_EQ_HEADLESS := HOLDS
GAME_CARRIER_TOGGLE_NONMUTATION := HOLDS
ASCII_AUTHORITY            := NONE
```

## Preserved world contract

```text
WorldPositionV1 := signed integer lattice (x, y, z)

ArenaSpecV1:
  x := -10..10
  y :=  -6..6
  z :=  -2..2

GEN0_MOVEMENT_PLANE:
  z0 := 0
  every PlayerAction preserves z

obstructions := {
  (2, -1, 0),
  (2,  0, 0),
  (2,  1, 0)
}

ADMISSIBILITY_SCOPE := ALL_ENTITY_MOVEMENT

UnfoldingSpecV1:
  w_origin       := 0
  successor_rule := w_(t+1) = w_t + 1
  tick_binding   := w = logical_tick_index
```

## Authority boundary

`GameTickInputV0` remains `LEGACY_REPLAY_ONLY`. Active playable runs accept
`GameTickInputV1` only. A key press proposes movement; the kernel alone admits
or blocks the candidate and commits the successor.

ASCII receives immutable committed snapshots and writes terminal glyphs only.
It cannot advance logical time, move an entity, resolve an obstruction,
calculate behavior, or mutate the canonical trace.

> **ASCII-GEN0 is playable, but ASCII owns no gameplay semantics.**

## Result

```text
TECHNICAL_EVIDENCE := CLOSED
ARTIFACT_IDENTITY  := CLOSED
BINDING            := CLOSED
PROMOTION          := CLOSED
PUBLICATION        := OPEN
```
