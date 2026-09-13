# BEAUTY-PASS-001 — Browser GAME/CARRIER Surface

Presentation-only successor over the promoted MaLCog v3 / ASCII-GEN0 kernel.

## Authority boundary

```text
MaLCog v3 / promoted agency kernel := semantic authority
BEAUTY-PASS-001                    := projection only
```

This package MUST NOT compute player position, enemy behavior, collision, health, admissibility, physics, or logical ticks. Keyboard events submit canonical `PlayerAction`; committed snapshots come back from the kernel bridge. `Tab` changes only the local projection surface and never calls the kernel.

## Required local predecessor

The promoted `game_input_agency_001` lineage is local-only and is intentionally not copied into this public branch. `beauty_server.py` therefore fails closed unless `MAL_GEN0_BRIDGE_MODULE` names a local Python module exporting `create_browser_bridge()` with:

```python
bridge.state() -> dict
bridge.submit_player_action(action: str) -> dict
```

The returned dictionary must expose the committed snapshot. The browser never accepts a renderer-computed successor state.

## Assets

- `mountain_10k.splat` is served from the already-bound SHOWCASE-001 asset and revalidated in the browser: 320000 bytes, SHA-256 `ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41`.
- `assets/kloppenheim_03_1k.hdr` is an optional local Poly Haven CC0 lighting/background asset. Run `python fetch_polyhaven_hdr.py`.
- `assets/player.glb` and `assets/enemy.glb` are local Mixamo-compatible GLB exports. They are presentation assets only and are not vendored here.

## Run

From a checkout that also contains the promoted local agency kernel and a bridge module:

```powershell
$env:MAL_GEN0_BRIDGE_MODULE = "game_input_agency_001.browser_bridge"
python beauty_pass_001_browser_surface/beauty_server.py --port 8780
```

Open `http://127.0.0.1:8780`.

Controls:

- `W/A/S/D` or arrows — submit `MOVE_N/MOVE_W/MOVE_S/MOVE_E`
- `Tab` or `C` — toggle GAME/CARRIER without advancing logical time

## Visual contract

GAME is full-screen world only: Gaussian terrain, characters, camera, atmosphere. CARRIER is the existing executable-geometry projection plus run/tick/snapshot identity. Animation is selected only from committed state; interpolation is noncanonical and may not create state transitions.

The launch beat is: play → enemy commits chase → `Tab` → live CARRIER, same run/tick/snapshot → `Tab` → same chase continues.
