# Implementation Report — Game Input Agency 001

The movement-input successor is implemented as an isolated import layer over
the promoted DEMO-003 kernel. No predecessor file was modified.

```text
AMENDMENT_GAME_INPUT_AGENCY_001 := HOLDS
M01-M16                         := 16/16
EVIDENCE                        := 17/17 BYTE_IDENTICAL
DEMO_003_REPLAY                 := 28/28 UNCHANGED

PLAYER_POSITION_AUTHORITY       := KERNEL_ONLY
PLAYER_ACTION_HAS_ZERO_W_AUTHORITY := HOLDS
ALL_ENTITY_MOVEMENT_ADMISSIBILITY  := HOLDS
BLOCK_NOT_CLAMP                    := HOLDS
PROJECTOR_ATTACHED_EQ_HEADLESS     := HOLDS
ASCII_SEMANTIC_AUTHORITY            := NONE
```

The reference ASCII projector accepts only committed immutable snapshots. Its
canonical object is a fixed-size glyph buffer. ANSI escape sequences, terminal
font, cursor behavior, and rasterization remain noncanonical transport.

The interactive terminal host maps `W/A/S/D` and arrow keys to
`GameTickInputV1`, calls the governed successor exactly once, and renders the
returned snapshot. `C` changes projection surface only. `Q` closes the terminal
surface only.

Current lifecycle boundary:

```text
TECHNICAL_EVIDENCE := CLOSED
WORKTREE_IDENTITY  := UNCOMMITTED
BINDING            := NOT_PERFORMED
PROMOTION          := NOT_PERFORMED
```
