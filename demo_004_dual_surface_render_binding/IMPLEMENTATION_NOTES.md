# DEMO-004 implementation notes

## Projection boundary

`DualSurfaceController` owns the imported DEMO-003 engine. It publishes a fresh `RenderSnapshot` only at the initial committed boundary or after a complete logical-tick receipt matches both successor state digests. The snapshot stores canonical JSON values; neither projection receives the controller or engine.

`project_game(snapshot, binding, presentation)` and `project_carrier(snapshot, presentation)` are pure read-only transformations. Their API shape exposes no edit constructor, tick function, ingress path, admission function, proposal disposition, or mutable state handle.

## Presentation derivations

The default binding declares source and rule identity for entity position, animation, BLOCKED stall, the second-enemy visual offset, TRIAD ambient indication, carrier topology, payload phases, and frame readiness. The second visible enemy is explicitly a presentation echo derived by `MIRROR_ENEMY_OFFSET_V1`; it is not a second semantic enemy.

GAME hides cells, operators, routes, witnesses, and canonical blocked reasons. A committed `BLOCKED` status maps only to a hesitation/stall cue. CARRIER retains the imported canonical structure and runtime diagnostics.

## Rendering technology

The reference browser surface is dependency-free HTML/CSS/JavaScript. GAME uses DOM transforms; CARRIER uses SVG primitives. This keeps the acceptance implementation portable and offline. Pixels, actual colors, layout coordinates, callback timing, GPU order, and raster output remain noncanonical.

Three.js/WebGPU, Gaussian splats, carrier stellation, a w-axis trail, and dodecahedral/600-cell mappings can be supplied by later presentation adapters only when their required sources are declared. They are not acceptance requirements here.

## Determinism

`RenderDecisionRecord` includes committed identities, binding selections, projection primitives, derivation rules, diagnostics, and semantic digests before/after projection. It excludes wall-clock time, framebuffer bytes, callback timing, GPU ordering, raw color values, and optional visual parameters.

Evidence is serialized as sorted UTF-8 JSON. The conformance replay must reproduce all 27 evidence artifacts byte-for-byte.
