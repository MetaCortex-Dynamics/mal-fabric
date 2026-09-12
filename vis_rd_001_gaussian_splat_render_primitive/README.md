# VIS-R&D-001 — Gaussian Splat Render Primitive

This vertical slice proves that a static Gaussian splat can replace one
conventional GAME-view asset without acquiring authority over mal-fabric's
canonical program, execution, or game-loop state.

## Run

```powershell
python demo_server.py
```

Open <http://127.0.0.1:8769>. The GAME surface uses Three.js
`WebGPURenderer + SPLATLoader + GaussianSplat`; the CARRIER surface remains the
same semantic/debug projection imported from DEMO-004.

The browser dependencies are pinned to Three.js `0.186.0`. The normative asset
fixture and all conformance checks are local; network availability is not
required for the acceptance suite.

## Verify

```powershell
python run_conformance.py
python run_full_regression.py
```

Expected:

```text
A01–A06 := 6/6
R01–R06 := 6/6
N01–N06 := 6/6
F01–F04 := 4/4
P01–P02 := 2/2
TOTAL   := 24/24

EVIDENCE_REPLAY := 25/25 BYTE_IDENTICAL
PRIOR_CONFORMANCE := 253/253 UNCHANGED
PRIOR_EVIDENCE := 242/242 UNCHANGED
```

## Authority

The v0.3 specification is promoted for implementation. This implementation is
not promoted. `PROMOTION := NOT PERFORMED`.
