# SHOWCASE-001 Execution Report

```text
SHOWCASE_001_MOUNTAIN_CAPTURE := HOLDS

SC01–SC22 := 22/22
REQUIRED_STILLS := 6/6
LAUNCH_CLIP := 44.0 seconds, H.264, 1440×900, 25 fps
SAME_SNAPSHOT_PROOF_QUARTET := HOLDS
HTTP/BROWSER := PASS
JSON_PARSE := 28/28
```

## Asset identity

```text
asset: mountain_10k.splat
format: SPLAT_FIXED_WIDTH_32
bytes: 320000
splats: 10000
sha256: ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41
license: CC-BY-4.0
source_method: mesh2splat
```

The asset is mesh-derived; no photographic reconstruction or location-capture claim is made.

## Browser evidence

The capture used Three.js 0.186 `WebGPURenderer`, `SPLATLoader`, and `GaussianSplat`. The capture host reported no WebGPU adapter, so Three.js lawfully selected its WebGL2 backend. The native Gaussian asset reached `LOADED`; no mesh fallback was used for the mountain.

Visual inspection confirmed that the final clip includes GAME and CARRIER frames, the Gaussian mountain environment, the patrol-to-approach behavior change, live surface toggles, and logical execution continuing while CARRIER is visible.

## Load-bearing proof pair

```text
GAME:    still-03-proof-game.png
CARRIER: still-04-proof-carrier.png

run_id:
  showcase-run-sha256-19f78c94d6b2e88e70cb5706f5a643a94094a18169e1bfb41ade9dfd5d088a73

logical_tick_index:
  2

RenderSnapshot_digest:
  10c88778dc06f930ee3f458755908c34686a134d21c4e51afcb85326c397c6d1

GameRunIdentity:
  f0af2983f1587cc810ab188dd1169a036ed59e21bcedab9faf84a9f841b5d3ff
```

## Evidence identities

```text
acceptance-summary.json:
  CB1E97531861992135FB0D9FEA3258C725EE7771E86198D33328B102A6E7A588

capture-manifest.json:
  D4F927C4268BFC528292ADFACE9C729E21AC0F3FCDAAFDA3AFD802EEC287E8A3

proof-records.json:
  7D7A24BDC4C5AE8042E3A6819C10D87075D05B2D52EA3F0D18289951EB6B268D

capture-run-record.json:
  FCE419C2C9EA7E76FC9ADA7F07F557C1B9701A36DEF4271C43BF4A420B389DCA

clip-01-launch.mp4:
  35E92C49EFF9F96930155375C24A2C963ABEECB724034F61D7824CDB7F18DDEE
```

The acceptance summary and capture manifest were byte-identical on immediate replay.

## Import integrity

```text
V3.1 / V3.2 / V3.3 := UNCHANGED
DEMO-001–DEMO-004  := UNCHANGED
VIS-R&D-001         := 24/24 + 25/25 BYTE_IDENTICAL
PRIOR CONFORMANCE   := 253/253 UNCHANGED
PRIOR EVIDENCE      := 242/242 UNCHANGED
```

## Authority state

```text
SEMANTIC_AUTHORITY    := NONE
CONFORMANCE_AUTHORITY := NONE
PRODUCT_EVIDENCE      := COMPLETE
WORKTREE              := UNCOMMITTED
COMMIT / BIND          := NOT PERFORMED
PROMOTION              := NOT PERFORMED
```
