# BEAUTY-PASS-001 local presentation assets

These files are deliberately not semantic inputs and are not vendored by this branch.

## Required

### `player.glb`
Original animation-bearing humanoid GLB for the player. Presentation only.

### `enemy.glb`
Original animation-bearing humanoid GLB for the enemy. Presentation only.

Both bundled files are generated deterministically by
`../generate_character_assets.py`. Their geometry, materials, and animation
clips are original to this repository; they contain no third-party model,
texture, rig, or motion data. Mixamo-compatible replacements remain supported
when stronger production assets are available.

The renderer searches animation names case-insensitively:

- idle: `idle` / `breath`
- locomotion: `walk`, `run` / `jog`
- attack: `attack` / `punch` / `slash` / `strike`
- blocked/hit: `hit` / `impact` / `stagger`

Missing named clips fall back only to another animation clip. Animation never changes committed action.

## Optional

### `kloppenheim_03_1k.hdr`
Optional Poly Haven CC0 environment map. If absent, the renderer uses procedural presentation lighting/fog. Its presence or absence cannot affect kernel state or trace identity.

## Gaussian scene

`mountain_100k.splat` is the inhabitable presentation LOD. The browser checks
its 3,200,000-byte length and SHA-256:

`C6A2004D2801485B10E0D426828A151547A523460DAC62074145852D996A6168`

It comes from the same `marcelpadilla/splats` source commit and CC-BY-4.0
mountain mesh lineage as the published 10k LOD. The 10k asset is retained
unchanged in SHOWCASE-001. The 100k LOD is used here because the mountain is
the scene itself rather than a background prop.

Required attribution: “Mountain” mesh by lastloginname, via odedstein-meshes
(https://github.com/odedstein/meshes), licensed CC-BY-4.0.

## Authority

```text
GLB transform        := projection of committed position
animation selection  := projection of committed action
HDRI / fog / lighting:= presentation only
Gaussian scene/height:= presentation only

NONE may:
  choose behavior
  move canonical entities
  detect player
  attack
  flee
  advance tick
  decide admissibility
```
