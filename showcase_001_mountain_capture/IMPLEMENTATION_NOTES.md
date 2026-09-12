# SHOWCASE-001 Implementation Notes

## Boundary

The showcase imports the published v0.8.0 implementation without modifying V3.1, V3.2, V3.3, DEMO-001 through DEMO-004, or VIS-R&D-001. `showcase_server.py` owns a normal imported presentation controller and exposes only the existing demo controls plus read-only asset/state endpoints.

The media recorder exercises the same browser controls available to a human operator. It has no FabricSpec, FabricEdit, admission, promotion, kernel, or direct `STEP_FABRIC` handle. Screenshots, video, pixels, camera motion, and composites remain noncanonical product evidence.

## Rendering

The GAME surface loads `mountain_10k.splat` through Three.js 0.186 `SPLATLoader` and `GaussianSplat`. Before parsing, browser code verifies:

```text
bytes  = 320000
width  = 32 bytes per record
count  = 10000
sha256 = ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41
```

The environment is mesh-derived. Public copy must describe it as Gaussian-splat terrain or a Gaussian mountain environment, without implying photographic reconstruction or location capture.

## Capture sequence

One run establishes PATROL at tick 0, drives the imported game controls to APPROACH, captures a GAME/CARRIER same-snapshot pair at tick 2, captures a second behavior pair at tick 3, advances the logical runtime while CARRIER remains visible, and returns to GAME. Surface toggles do not advance the logical tick.

The H.264 clip is 22 seconds at 1440×900. The six required stills and three optional composites are derived from that same capture run.

## Proof boundary

The canonical companion metadata is `showcase/proof-records.json`. The public paired-proof claim is allowed only because SC07–SC10 all pass:

```text
same run_id
same logical_tick_index
same RenderSnapshot_digest
same GameRunIdentity
```

No pixel-identity claim is made or required.
