# BEAUTY-PASS-001 local presentation assets

These files are deliberately not semantic inputs and are not vendored by this branch.

## Required

### `player.glb`
Mixamo-compatible humanoid GLB for the player. Presentation only.

### `enemy.glb`
Mixamo-compatible humanoid GLB for the enemy. Presentation only.

The renderer searches animation names case-insensitively:

- idle: `idle` / `breath`
- locomotion: `walk`, `run` / `jog`
- attack: `attack` / `punch` / `slash` / `strike`
- blocked/hit: `hit` / `impact` / `stagger`

Missing named clips fall back only to another animation clip. Animation never changes committed action.

## Optional

### `kloppenheim_03_1k.hdr`
Optional Poly Haven CC0 environment map. If absent, the renderer uses procedural presentation lighting/fog. Its presence or absence cannot affect kernel state or trace identity.

## Already bound elsewhere

`mountain_10k.splat` is NOT copied here. The server exposes the already-bound SHOWCASE-001 asset and the browser rechecks its 320000-byte length and SHA-256:

`ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41`

## Authority

```text
GLB transform        := projection of committed position
animation selection  := projection of committed action
HDRI / fog / lighting:= presentation only
Gaussian terrain     := presentation only

NONE may:
  choose behavior
  move canonical entities
  detect player
  attack
  flee
  advance tick
  decide admissibility
```
