# Binding Record — ASCII-GEN0 / Game Input Agency 001

```text
ASCII_GEN0                           := BOUND
AMENDMENT_GAME_INPUT_AGENCY_001      := BOUND

IMPLEMENTATION_COMMIT:
  fa549aeef9a21e291503e5507fe53517e9320207

PROMOTION:
  NOT_PERFORMED
```

## Normative artifact identities

The SHA-256 values below bind the exact implementation-tree file bytes at the
implementation commit.

```text
AMENDMENT-GAME-INPUT-AGENCY-001.md:
  616DB21477A40E84113F63D8297BCD4FF4D0679541A743073A1B72B9BBBEA184

README.md:
  9849972D7704AE0AC8101D2D4EF9E35F6781355D605818DE4FF3281799C5524B

IMPLEMENTATION_REPORT.md:
  657B4643E57F5971E3EB51F8E4FF7BEF90A44C8523F25E51451FF0C303E455D4

agency_kernel.py:
  A69AB28712667BF4E0836488A33545115497D0216E9FAE5451C5893689C92A22

ascii_projection.py:
  B69AAF9CA200CCC259B0C25C1968DA8DDF388303789D05CDBBB778B7D6163A77

ascii_gen0.py:
  7CAC14574E9FA916C2A5A49766FC87878019715E95A6CE995DEDC3A21CF2B651

run_conformance.py:
  67271167A5F0FD77DC1D76147828A5097D6479020CE7AF5BB5E2EF8EFB07F47E

acceptance-summary.json:
  F9626FCD75A872ECF14369154BF72F66648E5D9C0F3B85AE2BCAFAE33C90CFCD

evidence corpus:
  F7D805B2C5A7C238A464FC206C48637B45A276DA24B94FFF03FF0FA3CC6C4931
```

Evidence-corpus hash domain:

```text
17 files in evidence/
sorted by filename
each line := filename<TAB>uppercase-file-sha256<LF>
manifest encoding := UTF-8 without BOM
corpus identity := SHA-256(manifest bytes)
```

## Imported predecessor identities

```text
DEMO-003 game_loop.py:
  F711C6499E345C6B6952D8E8AA570B385D7F48A46F3E2189491E98653C4C1833

DEMO-003 acceptance-summary.json:
  F6BCFDCA7C58CB363ACAB9F03B349CD052EDE0819653E6B01B06A492EDAB6DFE

DEMO-003 PROMOTION_RECORD.md:
  9F3DF4BB5F1B2F47C8A5DE4549B67C1769B64A30016D641AFFAAC2A9298E6510

DEMO_003_REPLAY := 28/28 UNCHANGED
```

`GameTickInputV0` is retained solely by that immutable legacy replay path. It
is rejected by the active agency engine.

## Bound world and unfolding

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

PLAYER_ACTION_HAS_ZERO_W_AUTHORITY := HOLDS
```

An arena-boundary or obstruction violation records `BLOCKED` and retains the
prior entity position. No clamped or nearby successor is invented.

## Evidence closure

```text
M01-M16                := 16/16
EVIDENCE_REPLAY        := 17/17 BYTE_IDENTICAL
DEMO_003_REPLAY        := 28/28 UNCHANGED

BLOCK_NOT_CLAMP        := HOLDS
KERNEL_POSITION_AUTHORITY := HOLDS
ALL_ENTITY_ADMISSIBILITY  := HOLDS
ASCII_ATTACHED_EQ_HEADLESS := HOLDS
GAME_CARRIER_TOGGLE_NONMUTATION := HOLDS
ASCII_AUTHORITY        := NONE
```

The central bound claim is:

> **ASCII-GEN0 is playable, but ASCII owns no gameplay semantics.**

The projector receives immutable committed snapshots, writes a canonical glyph
buffer, and owns presentation-surface selection only. It cannot advance a tick,
admit movement, change position, or mutate the kernel trace.

## Lifecycle

```text
TECHNICAL_EVIDENCE := CLOSED
ARTIFACT_IDENTITY  := CLOSED
BINDING            := CLOSED
PROMOTION          := OPEN
```
