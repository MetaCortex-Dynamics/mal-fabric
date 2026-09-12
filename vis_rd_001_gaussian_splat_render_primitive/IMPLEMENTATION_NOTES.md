# VIS-R&D-001 Implementation Notes

## Boundary

This implementation replaces the `enemy_02` GAME-view mesh with a static
Gaussian-splat presentation object. The enemy's position, action, collision,
AI, game state, fabric state, logical tick, and run identity remain sourced
exclusively from the committed DEMO-004 snapshot.

```text
GAME STATE → RENDER TRANSFORM
GAUSSIAN GEOMETRY ↛ GAME STATE
```

`gaussian_render_readout()` accepts only a committed snapshot, presentation
bindings, presentation state, resource guards, and immutable asset bytes. It
does not accept execution, edit, admission, proposal, or tick-injection
handles.

## Browser renderer

The browser surface pins Three.js `0.186.0` and uses:

```text
three/webgpu WebGPURenderer
three/addons/loaders/SPLATLoader.js
three/addons/objects/GaussianSplat.js
```

WebGPU is preferred. Where unavailable, `WebGPURenderer({ forceWebGL: true })`
is used only when WebGL2 is available. Plain `WebGLRenderer` is never treated
as the Gaussian path. Unsupported capability falls back to the conventional
asset.

## Fixture and guards

The fixture is a deterministic synthetic 192-record fixed-width `.splat`
asset. Every 32-byte row contains center, scale, RGBA, and rotation. The browser
and Python reference both verify exact SHA-256 identity before parsing.

Implementation guards:

```text
maximum bytes   := 1,048,576
maximum splats  := 32,768
load timeout    := 5,000 ms (declared presentation budget)
```

Failures produce deterministic diagnostics and conventional fallback; they
cannot alter semantic state.

## Evidence

Canonical evidence excludes pixels, wall-clock/GPU/frame timing, actual sort
order, and driver identifiers. Two PNG captures and performance telemetry are
kept separately as explicitly noncanonical product evidence.

The paired captures use the same:

```text
logical tick          := 0
GameRunIdentity       := f0af2983f1587cc810ab188dd1169a036ed59e21bcedab9faf84a9f841b5d3ff
RenderSnapshot digest := 4382490e71a060f6fde27ff78ce76fd709925c1acca1358b7bf9f8f04c6a5166
```

The product fixture is deliberately synthetic. A rights-cleared real-world
showcase remains optional and non-normative.

## Explicit exclusions

No dynamic/4D Gaussian actor, deformation, runtime training, Gaussian-driven
collision/navigation/perception, rendering-as-measurement, or carrier-geometry
semantics are implemented.
