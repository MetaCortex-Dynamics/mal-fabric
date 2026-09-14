# Local integration — BEAUTY-PASS-001

This branch is based on the published v0.10.0 carrier because the promoted ASCII/agency commits remain local-only. Integrate the presentation package onto the local promoted lineage; do not copy/recreate agency semantics in this branch.

## 1. Bring the additive package onto the promoted local branch

The package is confined to:

```text
beauty_pass_001_browser_surface/
```

No predecessor file needs to be modified.

## 2. Use the additive local bridge adapter

`browser_bridge.py` imports the promoted agency kernel by its bound byte
identity and exports:

```python
def create_browser_bridge():
    return bridge
```

The bridge must expose:

```python
bridge.state()
bridge.submit_player_action(action)
```

and normalize the already-committed kernel state to `BRIDGE_CONTRACT.md`.

The adapter remains inside this successor directory. It does not modify the
promoted agency tree. `joint_state_digest` is a presentation-contract alias of
the authoritative `CommittedSnapshotV1.snapshot_digest`, whose canonical
payload already contains both world and fabric state; the adapter does not
calculate a new digest.

The adapter MAY rename/project fields. It MUST NOT:

```text
compute player position
compute enemy position
choose enemy action
perform collision
perform admission
advance more than the requested canonical tick
invent carrier cells/routes
recompute canonical digests
```

## 3. Presentation assets

The integration includes reproducible original assets at:

```text
beauty_pass_001_browser_surface/assets/player.glb
beauty_pass_001_browser_surface/assets/enemy.glb
beauty_pass_001_browser_surface/assets/kloppenheim_03_1k.hdr   # optional
```

Regenerate the bundled character assets with:

```powershell
python .\beauty_pass_001_browser_surface\generate_character_assets.py
```

Rights-cleared production GLBs may replace them without acquiring semantic
authority. Missing character GLBs still fail closed.

The 100k scene LOD is included locally as
`assets/mountain_100k.splat`. It shares the source, rights chain, and fixed-width
format of the published 10k predecessor, which remains unchanged. The larger
LOD is presentation-only and is required because the camera traverses the
terrain rather than viewing it as a distant object.

## 4. Run

Example only; use the actual local bridge module path:

```powershell
$env:MAL_GEN0_BRIDGE_MODULE = "browser_bridge"
python .\beauty_pass_001_browser_surface\beauty_server.py --port 8780
```

Open `http://127.0.0.1:8780`.

## 5. Fail-closed smoke checks

Before recording any clip:

```text
B01  server refuses to start without bridge module
B02  missing committed snapshot → FAIL_CLOSED
B03  unknown player action → rejected
B04  Tab GAME→CARRIER does not hit /api/action
B05  CARRIER→GAME does not hit /api/action
B06  same pre/post-toggle logical_tick_index
B07  same pre/post-toggle snapshot_digest
B08  WASD causes exactly one canonical action submission
B09  returned player position equals committed bridge state
B10  returned enemy action equals committed bridge state
B11  animation clip changes do not change snapshot digest
B12  camera motion does not change snapshot digest
B13  absent HDRI does not change snapshot digest
B14  100k mountain scene bytes/hash gate passes
B15  missing character GLB blocks beauty surface rather than falling back to proof spheres
```

## 6. Capture proof

At first Tab reveal, record:

```text
game_run_id
logical_tick_index
snapshot_digest
joint_state_digest
enemy.entity_id
enemy.action
```

They must be identical immediately before and after the projection toggle.

Then advance via ordinary admitted kernel input while CARRIER is visible and return to GAME. The latest committed digest before the second toggle must equal the first GAME frame after it.

## Lifecycle boundary

```text
BEAUTY_PASS_CODE := IMPLEMENTED_ON_SUCCESSOR_BRANCH
LOCAL_KERNEL_BINDING := REQUIRED
LOCAL_ASSET_BINDING := REQUIRED
RUNTIME_EVIDENCE := NOT YET CLAIMED
```
