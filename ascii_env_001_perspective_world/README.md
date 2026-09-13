# ASCII-ENV-001 — Walkable Perspective World

Status: additive source package; not promoted; not runtime-bound.

## Authority lineage

This branch is a transport/source carrier only. The intended local integration target remains the promoted ASCII-GEN0 kernel:

```text
210a4af0adde21c8ab5ff81d2f417619d1600d91  ASCII-GEN0 promoted kernel
    +
<ASCII-ENV-001 source identity>
    ↓
local ASCII-ENV-001 integration commit
```

The environment projector has **zero movement authority**. It reads committed `(x,y,z,w)` state and renders it.

## Canonical scaffold

The first fixture deliberately preserves the already-bound Gen0 movement domain rather than inventing a new arena:

```text
x := -10..10
y :=  -6..6
z :=  -2..2
z0 := 0

obstructions := {
  (2,-1,0),
  (2, 0,0),
  (2, 1,0)
}

admissibility := ALL_ENTITY_MOVEMENT
```

`w` is the worldline coordinate / governed unfolding:

```text
w_origin       := 0
successor_rule := w + 1
tick_binding   := w = logical_tick_index
```

`w` is not spatial and is never ray-cast as a fourth movement axis.

## Surface model

`ascii_env.py` provides a full-screen ANSI true-color perspective projector:

- horizontal ray casting through the canonical XY occupancy field;
- real canonical Z retained in entity/world positions;
- arena bounds rendered as enclosing structure without changing admissibility;
- the three canonical obstruction cells rendered as a visible wall;
- distance-derived fog, density and glyph selection;
- committed enemy state projected as an occluded ASCII actor;
- deterministic frame output for identical committed snapshot + projection state;
- no collision, movement, detection, health or enemy-action decisions in the projector.

The renderer may use presentation-local camera heading. Heading belongs to the projection record, not to world semantics.

## Run the nonsemantic preview

```powershell
python ascii_env_001_perspective_world/preview.py
```

The preview uses a frozen sample snapshot only to inspect visual composition. It is not gameplay evidence.

## Conformance

```powershell
python ascii_env_001_perspective_world/run_conformance.py
```

Expected: `ASCII_ENV_001 := 10/10 PASS`.

## Integration boundary

The local promoted kernel should supply committed snapshots containing, at minimum:

```text
logical_tick_index / w
player.position = (x,y,z)
enemy.position  = (x,y,z)
enemy.action
snapshot_digest
```

Keyboard handling stays in the already-promoted ASCII-GEN0 input path:

```text
keyboard
→ PlayerAction
→ GameTickInput
→ MaLCog v3
→ committed snapshot(x,y,z,w)
→ ASCII-ENV-001 projector
```

The projector never performs the state transition.
