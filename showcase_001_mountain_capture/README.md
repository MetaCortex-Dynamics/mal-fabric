# SHOWCASE-001 — Mountain Gaussian Capture

This product-evidence package projects the unchanged published mal-fabric v0.8.0 runtime through two presentation surfaces:

- `GAME`: a mesh-derived Gaussian mountain environment with governed game entities;
- `CARRIER`: the executable cells, routes, TRIAD placement, and payload custody behind the same run.

The load-bearing proof pair is `showcase/still-03-proof-game.png` and `showcase/still-04-proof-carrier.png`. Their records share the same run ID, logical tick, RenderSnapshot digest, and GameRunIdentity. The surface differs; the committed moment does not.

## Asset boundary

`assets/mountain_10k.splat` is a 320,000-byte, 10,000-record fixed-width splat asset with SHA-256 `ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41`.

It is mesh-derived, not a photographic reconstruction or capture of a real location. Required attribution is recorded in `showcase/attribution.txt`.

## Run locally

```powershell
python showcase_server.py
```

Then open `http://127.0.0.1:8770`. The browser surface uses pinned Three.js 0.186 modules from jsDelivr and the local hash-verified `.splat` asset.

To reproduce the media packet, install Playwright for Python and run:

```powershell
python capture_showcase.py
python run_acceptance.py
```

The capture output is product evidence only. It is not semantic or conformance authority, and capture operations do not bypass the imported runtime's public controls.

## Acceptance

`run_acceptance.py` checks SC01–SC22, including the same-snapshot proof quartet, six stills, 20–45 second clip, attribution, import cleanliness, and replay metadata.

Primary copy:

> THAT CREATURE YOU WERE JUST FIGHTING<br>
> IS THIS PROGRAM

Support copy:

> Same run. Same tick. Same snapshot. Two surfaces.
