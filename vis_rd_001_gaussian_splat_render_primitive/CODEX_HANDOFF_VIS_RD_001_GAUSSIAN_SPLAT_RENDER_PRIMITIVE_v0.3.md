# CODEX_HANDOFF_VIS_RD_001_GAUSSIAN_SPLAT_RENDER_PRIMITIVE

**Revision:** v0.3 DRAFT  
**Authority spec:** `SPEC-VIS-RD-001-GAUSSIAN-SPLAT-RENDER-PRIMITIVE_v0.3.md`  
**Import:** mal-fabric v0.7.0 (`10.5281/zenodo.22727508`) unchanged

## Authority status

```text
SPEC := PROPOSED
BUILD := NOT AUTHORIZED pending DECIDE/PROMOTE
```

Do not execute until the spec is explicitly promoted.

## Intended goal

Replace one conventional GAME-view presentation asset with a static 3D Gaussian-splat asset while preserving the exact semantic/game/fabric trace.

## Hard invariants

```text
GAUSSIAN_PRESENTATION_NONINTERFERENCE := REQUIRED
ASSET_SUBSTITUTION_SEMANTIC_INVARIANCE := REQUIRED
RENDERER_NONAUTHORITY := REQUIRED
SPLAT_SORT_NONSEMANTIC := REQUIRED
VIEW_DEPENDENT_COLOR_NONSEMANTIC := REQUIRED
FALLBACK_SEMANTIC_INVARIANCE := REQUIRED
```

## Reference renderer

Target:

```text
Three.js GaussianSplat
Three.js WebGPURenderer
```

Use the renderer-supported WebGL backend fallback only where `GaussianSplat` remains supported.

Do not silently substitute plain `WebGLRenderer` as if it were the same Gaussian path.

## Normative fixture

Use one local content-addressed static `.splat` asset.

Bind:

```text
path
byte length
SHA-256
asset id
format
optional splat count
```

Remote availability must not be required for conformance.

## Corpus-grounding implementation discipline

Treat the following as inherited architectural laws:

```text
RENDERER_NONAUTHORITY
  ← witness readout noninvasiveness

PIXEL_NONCANONICAL
  ← projection/readout separation

GaussianRenderDecision
  ← readout evidence pattern
```

Implementation consequences:

```text
renderer reads committed state
renderer never mutates semantic state
render evidence records observation decisions only
pixel/raster variation never becomes semantic identity
```

Do NOT operationalize the dodecahedral carrier claim in VIS-R&D-001.

For this build:

```text
Gaussian asset := presentation primitive only
```

Any mapping from Gaussian structure to formal carrier geometry is deferred to VIS-R&D-003.


## New presentation types

Implement:

```text
SplatAssetDescriptor
GaussianAssetBinding
GaussianRenderDecision
```

These are presentation objects only.

They must not enter canonical FabricSpec/GameLoopState identity.

## Render direction

Allowed:

```text
committed game state
→ presentation transform
→ Gaussian asset transform
```

Forbidden:

```text
Gaussian centers/bounds/raycast
→ game position/collision/AI/navigation
```

## Load/fallback

Implement deterministic dispositions:

```text
LOADED
REJECTED_HASH_MISMATCH
REJECTED_PARSE
UNSUPPORTED_BACKEND
REJECTED_RESOURCE_BUDGET
```

Failure path:

```text
Gaussian failure
→ conventional fallback
→ semantic trace unchanged
```

## Sorting and view-dependent color

Gaussian sorting and spherical-harmonic color evaluation are presentation only.

Never store GPU/CPU sort order as semantic/canonical state.

Camera changes may affect pixels but not game/fabric state.

## Resource guards

Define implementation budgets for:

```text
asset bytes
splat count / equivalent renderer capacity
load timeout/failure
```

Budget breach must fall back without changing semantics.

## Showcase product evidence

Keep the conformance fixture minimal and deterministic.

Separately prepare one visually strong showcase asset:

```text
rights-cleared real-world Gaussian capture
+ two governed game entities
+ GAME/CARRIER toggle
```

Do not make the showcase asset normative.

### Required showcase still

Capture a paired image:

```text
GAME view
  Gaussian real-world environment
  game entities visible

CARRIER view
  same logical tick
  same GameRunIdentity
  same RenderSnapshot digest
  structural program/debug projection
```

Record alongside the still:

```text
logical_tick_index
game_run_id
RenderSnapshot digest
Gaussian asset SHA-256
```

### Recommended launch video

Show:

```text
patrol
→ player condition changes
→ approach/flee transition
→ toggle to CARRIER during execution
→ show current committed structure
→ toggle back
→ game continues
```

Do not pause execution for the toggle.

Do not imply the toggle causes the behavior.

### Privacy / publication hygiene

Public showcase capture must be rights-cleared and scrubbed of unintended:

```text
identifiable people
license plates
private documents/screens
sensitive location details
non-redistributable third-party content
```

### Fixture separation

```text
conformance fixture := small + stable
showcase fixture    := beautiful + real-world
```

Do not let showcase size, capture tooling, or third-party service availability gate 24/24 acceptance.


## Conformance

Exactly 24 vectors:

```text
A01–A06 asset identity/provenance
R01–R06 render integration
N01–N06 noninterference
F01–F04 failure/fallback
P01–P02 product/performance boundary
```

Target:

```text
24/24 PASS
25/25 BYTE_IDENTICAL canonical evidence
```

Prior floor remains:

```text
253/253 conformance
242/242 deterministic evidence
```

## Canonical evidence

Hard law:

```text
PIXEL_NONCANONICAL := REQUIRED
```

May include:

```text
logical tick
game run id
RenderSnapshot digest
RenderBindingSpec digest
splat asset id
asset SHA-256
load disposition
fallback flag
presentation transform digest
semantic before/after digest
renderer capability class
```

Must exclude:

```text
pixels
wall-clock timings
GPU timings
frame times
actual splat sort order
driver identifiers
```

Performance telemetry and screenshots are separate product evidence.

## Product evidence

Capture at least:

```text
conventional asset GAME screenshot
Gaussian asset GAME screenshot
same logical tick / same committed state identity
```

Optional video showing live presentation substitution and GAME/CARRIER toggle.

## Required artifacts after authorization

```text
README.md
IMPLEMENTATION_NOTES.md
acceptance-summary.json
evidence/
asset fixture + descriptor
performance telemetry
product screenshots
```

After implementation freeze:

```text
BINDING_RECORD.md
```

Do not create a promotion record unless separately authorized.

## Exit report target

```text
VIS_RD_001_GAUSSIAN_SPLAT_RENDER_PRIMITIVE := HOLDS

A01–A06 := 6/6
R01–R06 := 6/6
N01–N06 := 6/6
F01–F04 := 4/4
P01–P02 := 2/2

TOTAL := 24/24
EVIDENCE_REPLAY := 25/25 BYTE_IDENTICAL

GAUSSIAN_PRESENTATION_NONINTERFERENCE := HOLDS
ASSET_SUBSTITUTION_SEMANTIC_INVARIANCE := HOLDS
RENDERER_NONAUTHORITY := HOLDS
SPLAT_SORT_NONSEMANTIC := HOLDS
VIEW_DEPENDENT_COLOR_NONSEMANTIC := HOLDS
FALLBACK_SEMANTIC_INVARIANCE := HOLDS

PRIOR_CONFORMANCE := 253/253 UNCHANGED
PRIOR_EVIDENCE := 242/242 UNCHANGED

PROMOTION := NOT PERFORMED
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
