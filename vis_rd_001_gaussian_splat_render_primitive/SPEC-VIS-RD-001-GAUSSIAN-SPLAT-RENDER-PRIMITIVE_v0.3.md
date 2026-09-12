# SPEC-VIS-RD-001-GAUSSIAN-SPLAT-RENDER-PRIMITIVE

**Version:** v0.3  
**Status:** PROPOSED  
**Import:** mal-fabric v0.7.0 (`10.5281/zenodo.22727508`) unchanged  
**Concept DOI:** `10.5281/zenodo.22678127`  
**Authority:** DECIDE ∧ PROMOTE := Devon  
**Track:** Visual R&D / presentation substrate  
**Hard invariant:** `GAUSSIAN_PRESENTATION_NONINTERFERENCE`

---

## 0. Purpose

VIS-R&D-001 proves one narrow visual-substrate claim:

```text
one conventional GAME-view render asset
  → replaced by
one static 3D Gaussian-splat asset

while:

  FabricSpec trace
  FabricState trace
  GameLoopState trace
  GameRunIdentity
  EnemyAction sequence
  logical tick sequence

remain unchanged
```

This is NOT a new game semantic layer.

This is NOT a 4D/dynamic Gaussian actor.

This is NOT rendering-as-measurement.

It is the first controlled substitution of a Gaussian representation into the published dual-surface renderer.

Product claim:

> A Gaussian splat can participate as a GAME-view presentation primitive without acquiring semantic authority.

---

## 1. Published import boundary

Import mal-fabric v0.7.0 unchanged:

```text
VERSION DOI:
  10.5281/zenodo.22727508

CONCEPT DOI:
  10.5281/zenodo.22678127
```

Imported product stack:

```text
V3.1      canonical static fabric
V3.2      governed admission
V3.3      synchronous execution
DEMO-001  visible fabric
DEMO-002  vibe proposer
DEMO-003  game-loop binding
DEMO-004  dual-surface render binding
```

Published conformance floor:

```text
253/253
```

Published deterministic-evidence floor:

```text
242/242 BYTE_IDENTICAL
```

Cannot modify:

```text
FabricSpec semantics
FabricState semantics
GameLoopState semantics
GameRunIdentity semantics
RenderSnapshot semantics
RenderBindingSpec authority boundary
DEMO-004 dual-surface invariants
prior evidence artifacts
```

---

## 2. Technology boundary

Normative reference implementation target:

```text
Three.js GaussianSplat
under Three.js WebGPURenderer
```

The current Three.js Gaussian-splat addon is a `WebGPURenderer` feature. A WebGPU-backed WebGL fallback may be used where the renderer supports it; plain `WebGLRenderer` is NOT the normative Gaussian path.

Normative fixture format:

```text
fixed-width .splat
```

Optional fixture formats:

```text
3DGS-compatible .ply
other formats already supported by the selected renderer/loader
```

No format becomes semantic program state.

---

## 2A. Corpus grounding

VIS-R&D-001 does not introduce renderer nonauthority, witness separation, or readout evidence as isolated product conventions. It instantiates existing MaL separation laws at the presentation layer.

These references are architectural provenance for the spec. They do not add new conformance vectors or empirical claims beyond VIS-R&D-001's stated acceptance domain.

### 2A.1 Witness readout noninterference

Grounding source:

```text
SPEC-MALCOG-V3-SUBSTRATE-001 §3.1
```

Corpus principle:

```text
readout is noninvasive
substrate remains unchanged by observation
witness/readout layer is structurally separated from update law
```

VIS-R&D-001 instantiation:

```text
render_readout :
  committed RenderSnapshot
  × RenderBindingSpec
  × presentation state
  → visual output + render evidence
```

Required:

```text
committed semantic substrate
  UNCHANGED by render readout
```

Therefore:

```text
RENDERER_NONAUTHORITY
  := presentation-layer instance of
     WITNESS_READOUT_NONINVASIVENESS
```

This is a structural reuse of the same separation principle at a different scale.

It does NOT identify renderer output with substrate witness semantics in every other respect.

---

### 2A.2 Projection loss and pixel noncanonicity

Grounding sources:

```text
SPEC-MALCOG-V3-SUBSTRATE-001 §3.3
The_Constructive_Substrate §6.3
```

Corpus principle:

```text
probability/uncertainty belongs to witness/readout
projection loss does not imply substrate indeterminacy
```

VIS-R&D-001 application:

```text
committed fabric/game state
  := one actual committed state

visual output
  := view-dependent projection of that state
```

Rendering variation may arise from:

```text
camera/view angle
occlusion
Gaussian overlap/compositing
view-dependent color
backend-specific rasterization
presentation transforms
```

These are projection/readout effects.

They MUST NOT be interpreted as semantic indeterminacy of the fabric/game state.

Therefore:

```text
PIXEL_NONCANONICAL
  := presentation-layer consequence of
     projection/readout separation
```

Important boundary:

```text
visual ambiguity
  ≠
semantic ambiguity

pixel variance
  ≠
FabricState variance
```

This grounding does not claim that every rendering artifact is a mathematically complete instance of the corpus probability theory. It establishes only the layer assignment: uncertainty introduced by visual projection remains in the presentation/readout layer.

---

### 2A.3 Readout evidence pattern

Grounding sources:

```text
Publishable_Paper_Prismatic_Witnessing_and_GMM
DevonOS_Archive_Research_Report_GMM_and_Witnessing
```

Corpus pattern:

```text
state
  → pure/replayable readout
  → metrics + witness/evidence

readout evidence
  records what the observer/readout did
  without changing the state being observed
```

VIS-R&D-001 instantiation:

```text
committed render source
  → Gaussian render decision
  → visual output + GaussianRenderDecision
```

Therefore:

```text
GaussianRenderDecision
  := instance of READOUT_EVIDENCE_PATTERN
```

The record captures:

```text
which asset was bound
which backend/capability path was used
whether fallback occurred
which presentation transform was selected
which committed state identity was observed
```

without altering what the fabric/game computes.

Hard law:

```text
evidence-about-rendering
  CANNOT become
authority-over-rendering-source
```

---

### 2A.4 Prospective carrier geometry grounding

Grounding sources:

```text
The_Recursive_Geometry_of_Projection §1–8
SPEC-MALCOG-V3-SUBSTRATE-001 §0
```

Corpus claim supplied to this specification:

```text
projection carrier Π
  has dodecahedral carrier geometry
```

VIS-R&D-001 does NOT prove or operationalize that correspondence.

Current status:

```text
Gaussian asset
  := presentation primitive only

dodecahedral carrier correspondence
  := PROSPECTIVE
```

The intended successor chain is:

```text
VIS-R&D-001
  establishes Gaussian presentation primitive

VIS-R&D-002
  makes the Gaussian representation dynamic / temporal

VIS-R&D-003
  may connect visual projection to Π
  through the formally specified carrier geometry
```

Until VIS-R&D-003:

```text
Gaussian asset
  CANNOT be treated as
canonical dodecahedral carrier

Gaussian center/covariance
  CANNOT be treated as
operator/witness/carrier semantics
```

This keeps the product vision grounded without silently promoting a future correspondence into current semantics.

---

### 2A.5 Grounding summary

```text
RENDERER_NONAUTHORITY
  ← witness readout noninvasiveness

PIXEL_NONCANONICAL
  ← projection/readout layer separation

GaussianRenderDecision
  ← readout evidence pattern

Gaussian ↔ carrier geometry
  ← prospective only
  ← deferred to VIS-R&D-003
```

These corpus links strengthen architectural continuity.

They do not change:

```text
24-vector census
25-artifact evidence target
253/253 prior regression floor
242/242 prior evidence floor
```


## 3. New presentation types

### 3.1 SplatAssetDescriptor

```text
SplatAssetDescriptor := (
  splat_asset_id,
  format,
  content_sha256,
  byte_length,
  declared_splat_count?,
  bounds?,
  provenance
)
```

Where:

```text
splat_asset_id
  := content-addressed presentation identity

format
  := renderer-supported static Gaussian-splat format

content_sha256
  := exact asset byte identity

byte_length
  := exact loaded asset length

declared_splat_count
  := optional deterministic count when available

bounds
  := optional presentation-space bounds

provenance
  := local fixture / generated asset / external capture source metadata
```

`SplatAssetDescriptor` is presentation metadata.

It MUST NOT enter canonical FabricSpec/GameLoopState identity.

---

### 3.2 GaussianAssetBinding

```text
GaussianAssetBinding := (
  render_binding_id,
  target_render_entity,
  splat_asset_id,
  transform_binding,
  fallback_asset_id
)
```

The binding lives inside or adjacent to DEMO-004 `RenderBindingSpec`.

Hard law:

```text
GaussianAssetBinding := PRESENTATION
```

It MUST NOT:

```text
change game entity identity
change EnemyAction
change collision semantics
change navigation semantics
change GameLoopState
change FabricState
```

---

### 3.3 GaussianRenderDecision

```text
GaussianRenderDecision := (
  logical_tick_index,
  game_run_id,
  render_snapshot_digest,
  render_binding_digest,
  splat_asset_id,
  asset_content_sha256,
  renderer_backend,
  load_disposition,
  fallback_used,
  presentation_transform_digest,
  semantic_digest_before,
  semantic_digest_after,
  diagnostics?
)
```

This is deterministic evidence about render decisions.

It is NOT pixel evidence.

---

## 4. Static-only boundary

VIS-R&D-001 permits:

```text
static 3D Gaussian scene/object
camera-relative view changes
presentation transform
renderer sorting
view-dependent Gaussian color evaluation
```

VIS-R&D-001 forbids:

```text
time-varying Gaussian positions as game semantics
deformation driven by FabricState
4D covariance
temporal Gaussian field
Gaussian actor simulation
Gaussian data as collision/navigation truth
Gaussian training during runtime
```

A static asset may be moved as a presentation object according to committed game position, but its internal Gaussian field is not dynamically deformed by VIS-R&D-001.

---

## 5. Render-source law

Gaussian rendering MUST read only:

```text
committed RenderSnapshot
RenderBindingSpec
SplatAssetDescriptor
presentation_state
```

The Gaussian renderer MUST NOT receive mutation-capable handles for:

```text
STEP_FABRIC
FabricEdit
GameTickInput injection
V3.2 admission
proposal disposition
FabricState mutation
GameLoopState mutation
GameRunIdentity mutation
```

This inherits and preserves `RENDERER_NONAUTHORITY`.

---

## 6. GAUSSIAN_PRESENTATION_NONINTERFERENCE

For a fixed:

```text
GameRunIdentity
RenderSnapshot sequence
RenderBindingSpec semantic bindings
logical GameTickInput trace
```

replace:

```text
conventional render asset A
```

with:

```text
Gaussian splat asset G
```

for the same GAME-view entity/environment binding.

Required:

```text
FabricSpec trace_A = FabricSpec trace_G
FabricState trace_A = FabricState trace_G
GameLoopState trace_A = GameLoopState trace_G
EnemyAction trace_A = EnemyAction trace_G
GameRunIdentity_A = GameRunIdentity_G
logical_tick sequence_A = logical_tick sequence_G
```

Allowed to differ:

```text
RenderBindingSpec presentation digest
GaussianRenderDecision
framebuffer pixels
GPU timing
sorting work
presentation transform
asset load timing
visual appearance
```

The substitution is visual only.

---

## 7. ASSET_SUBSTITUTION_SEMANTIC_INVARIANCE

Switching between:

```text
CONVENTIONAL_ASSET
GAUSSIAN_ASSET
FALLBACK_ASSET
```

for the same render entity MUST NOT create a semantic transition.

The renderer may choose a different presentation primitive.

It may not choose a different game behavior.

Hard law:

```text
render asset class ≠ semantic class
```

---

## 8. Splat load pipeline

Normative load sequence:

```text
SplatAssetDescriptor
  → byte fetch / local load
  → content SHA-256 verify
  → format loader
  → Gaussian geometry
  → renderer object
  → bind to presentation entity
```

If content digest mismatches:

```text
load_disposition := REJECTED_HASH_MISMATCH
fallback := conventional asset
```

If format parsing fails:

```text
load_disposition := REJECTED_PARSE
fallback := conventional asset
```

If renderer capability is unavailable:

```text
load_disposition := UNSUPPORTED_BACKEND
fallback := conventional asset
```

None of these failure modes may alter semantic/game state.

---

## 9. Backend capability boundary

Preferred:

```text
WebGPURenderer + GaussianSplat
```

Permitted:

```text
WebGPURenderer-supported fallback backend
where GaussianSplat remains supported
```

Not permitted as a silent equivalent:

```text
plain WebGLRenderer Gaussian path
```

If no supported Gaussian path exists:

```text
fallback asset renders
Gaussian diagnostic emitted
semantics unchanged
```

Backend capability is presentation capability only.

---

## 10. SPLAT_SORT_NONSEMANTIC

Gaussian splat rendering may require view-dependent sorting.

Sorting order, sorting backend, and sorting latency are noncanonical presentation details.

Required:

```text
camera move
→ may trigger splat sort

splat sort
→ cannot trigger semantic mutation
→ cannot advance logical tick
→ cannot alter GameRunIdentity
```

Canonical evidence MUST NOT store GPU/CPU splat draw order as program state.

---

## 11. VIEW_DEPENDENT_COLOR_NONSEMANTIC

If the renderer evaluates view-dependent spherical-harmonic color:

```text
camera/view change
→ may change rendered Gaussian color
```

but MUST NOT change:

```text
committed game state
fabric state
game action
semantic identity
```

View-dependent color is presentation.

---

## 12. Presentation transform boundary

A Gaussian asset may follow a committed game entity transform through presentation binding:

```text
committed game position/orientation
  → presentation transform
  → Gaussian object transform
```

The renderer MUST NOT infer game position from Gaussian centers.

Hard direction:

```text
GAME STATE → RENDER TRANSFORM
```

Forbidden reverse direction:

```text
GAUSSIAN GEOMETRY → GAME STATE
```

---

## 13. Bounds and picking

Gaussian bounds/raycast results MAY be used for:

```text
editor inspection
camera framing
presentation hover/select
debug visualization
```

They MUST NOT become authoritative for:

```text
game collision
navigation
combat hit detection
AI perception
proximity semantics
```

unless a future separately authorized spec explicitly creates that bridge.

---

## 14. Asset provenance and locality

Conformance assets MUST be:

```text
local
content-addressed
replayable without third-party availability
```

Remote URLs MAY be supported as non-normative product convenience, but they cannot be required for conformance.

The normative fixture MUST bind exact asset bytes by SHA-256.

---

## 15. Resource guard

The implementation MUST define presentation resource guards for at least:

```text
maximum asset byte length
maximum accepted splat count or equivalent renderer budget
load timeout / failure disposition
```

Exact thresholds are implementation parameters, not semantic constants.

Budget violation:

```text
→ diagnostic
→ fallback asset
→ semantic state unchanged
```

No resource guard may alter game behavior.

---

## 16. GAME-view integration

VIS-R&D-001 MUST replace at least ONE conventional asset in DEMO-004 GAME view.

Recommended target:

```text
environment object
OR
one non-player decorative/game entity
```

Permitted target:

```text
enemy visual asset
```

provided collision/AI/game semantics remain sourced from existing committed game state rather than Gaussian geometry.

CARRIER view remains unchanged except optional presentation diagnostics showing:

```text
Gaussian binding present
asset load disposition
asset identity
```

Gaussian geometry itself does not become carrier geometry.

---

## 17. Dual-surface boundary

GAME surface MAY show the Gaussian asset.

CARRIER surface MAY show only presentation diagnostics for the binding unless explicitly toggled into a noncanonical preview pane.

Required:

```text
GAME/CARRIER toggle
→ no Gaussian semantic mutation
→ no asset-driven semantic mutation
→ no logical tick creation
```

All DEMO-004 dual-surface invariants remain binding.

---

## 18. Fallback law

Fallback must be semantics-preserving.

```text
Gaussian asset available
  → render Gaussian

Gaussian asset unavailable/invalid/unsupported
  → render fallback conventional asset
```

Required:

```text
semantic_digest_gaussian
=
semantic_digest_fallback
```

The only differences may be presentation/evidence fields.

---

## 19. Performance observation boundary

VIS-R&D-001 records presentation performance telemetry such as:

```text
asset load duration
asset byte size
declared/observed splat count
frame time summary
renderer backend
sort/update events
```

This telemetry is NONCANONICAL.

Performance telemetry:

```text
MAY guide later engineering
MUST NOT enter semantic identity
MUST NOT alter conformance verdict except explicit resource-guard failures
```

No universal FPS claim is required.

No quality superiority claim is required.

---

## 20. Product evidence

At minimum capture:

```text
GAME screenshot with conventional asset
GAME screenshot with Gaussian asset
same committed game/fabric state identity
same logical tick
same camera pose where practical
```

Screenshots are product evidence.

They are not deterministic canonical evidence.

Optional:

```text
short screen recording showing live asset substitution
GAME ↔ CARRIER toggle
```

---

## 20A. Product launch evidence profile

The conformance fixture MAY remain small and synthetic.

The launch/showcase fixture SHOULD be a rights-cleared Gaussian capture of a real physical place.

Recommended examples:

```text
room
studio
office
yard
park
streetscape
other controlled real-world environment
```

The purpose is not to strengthen semantic conformance.

The purpose is to demonstrate the visual proposition:

```text
real captured place
+
governed game entities
+
GAME / CARRIER toggle
```

### 20A.1 ShowcaseCaptureDescriptor

```text
ShowcaseCaptureDescriptor := (
  showcase_id,
  capture_provenance,
  asset_content_sha256,
  location_class,
  rights_clearance,
  privacy_clearance,
  renderer_binding_id
)
```

This is product-evidence metadata only.

It MUST NOT enter:

```text
FabricSpec identity
FabricState identity
GameLoopState identity
GameRunIdentity
conformance verdict
```

### 20A.2 Real-world capture boundary

A showcase capture MUST be:

```text
lawfully captured
licensed/owned for publication
free of unapproved private/sensitive content
content-addressed for reproducibility
```

Before public release, remove or avoid:

```text
unconsented identifiable people
license plates where unnecessary
private documents/screens
addresses or other identifying details not intended for publication
third-party copyrighted material that cannot be redistributed
```

A private or sensitive capture MUST NOT become the normative public fixture.

### 20A.3 Appearance boundary

A Gaussian capture may preserve real-world appearance, view-dependent radiance, and scene detail.

VIS-R&D-001 MUST NOT overstate this as:

```text
physically correct game lighting
authoritative world geometry
collision truth
navigation truth
semantic scene understanding
```

The Gaussian asset remains presentation.

### 20A.4 Paired still

Capture one paired product image from the SAME committed render source:

```text
LEFT / GAME:
  Gaussian environment
  visible player/enemies
  committed behavior presentation

RIGHT / CARRIER:
  same logical tick
  same GameRunIdentity
  same RenderSnapshot digest
  relevant cells/routes/TRIAD/custody state
```

Required product-evidence metadata:

```text
logical_tick_index
game_run_id
render_snapshot_digest
game_view_binding_digest
carrier_view_binding_digest
Gaussian asset SHA-256
```

The paired still is visual proof of:

```text
SAME running system
NOT-SAME projection
```

It is not canonical evidence.

### 20A.5 Launch video

Recommended launch sequence:

```text
1. GAME view in real-world Gaussian environment
2. enemy patrols
3. player enters trigger/proximity condition
4. enemy behavior changes
5. toggle to CARRIER view during active execution
6. show current committed decision/custody structure
7. logical execution continues
8. toggle back to GAME view
9. behavior continues without semantic discontinuity
```

The video SHOULD show:

```text
logical tick counter
optional RenderSnapshot digest overlay
GAME/CARRIER surface label
```

The video MUST NOT imply that the render toggle itself causes the behavior change.

### 20A.6 Product-evidence continuity

For any paired still or video cut claiming “same moment”:

```text
same game_run_id
same logical_tick_index
same RenderSnapshot digest
```

If editorial cuts move across ticks, the product evidence MUST label that difference rather than imply snapshot identity.

### 20A.7 Fixture separation

Maintain two explicit fixture classes:

```text
CONFORMANCE FIXTURE:
  minimal
  local
  deterministic
  content-addressed
  optimized for test stability

SHOWCASE FIXTURE:
  visually compelling
  may be much larger
  real-world capture preferred
  product evidence only
```

The showcase fixture MUST NOT make the acceptance suite dependent on:

```text
large asset download
third-party service availability
capture tool availability
GPU-specific pixel identity
photorealistic quality threshold
```

### 20A.8 Product thesis

The intended launch impression is:

> A captured world can host governed entities whose behavior remains fully inspectable as executable geometry.

The differentiator is the juxtaposition:

```text
Gaussian rendering alone
  := visual representation

mal-fabric + Gaussian rendering
  := visual representation
     + governed behavior
     + structural inspectability
     + dual-surface continuity
```

This section is NON-NORMATIVE product evidence guidance.

It does not change the 24-vector census or 25-artifact deterministic evidence target.


## 21. Conformance corpus

Freeze VIS-R&D-001 at 24 vectors.

### A — asset identity/provenance (A01–A06)

```text
A01 local Gaussian fixture loads from bound descriptor
A02 asset SHA-256 matches descriptor
A03 asset id deterministic
A04 descriptor excluded from canonical program identity
A05 digest mismatch rejects Gaussian load and uses fallback
A06 unsupported/invalid format produces diagnostic + fallback
```

### R — render integration (R01–R06)

```text
R01 Gaussian asset renders in GAME view
R02 committed game transform drives Gaussian presentation transform
R03 camera movement may update sort without semantic mutation
R04 view-dependent color changes remain presentation-only
R05 GAME/CARRIER toggle preserves Gaussian binding semantics
R06 CARRIER view remains semantic/debug projection, not Gaussian carrier geometry
```

### N — noninterference (N01–N06)

```text
N01 conventional vs Gaussian asset → identical FabricState trace
N02 conventional vs Gaussian asset → identical GameLoopState trace
N03 conventional vs Gaussian asset → identical EnemyAction trace
N04 asset substitution does not change GameRunIdentity
N05 renderer receives no mutation-capable semantic handles
N06 Gaussian bounds/raycast cannot affect collision/AI/game semantics
```

### F — failure/fallback (F01–F04)

```text
F01 unsupported backend → conventional fallback
F02 parse failure → conventional fallback
F03 resource-budget rejection → conventional fallback
F04 fallback and Gaussian paths preserve identical semantic digest
```

### P — performance/product boundary (P01–P02)

```text
P01 presentation performance telemetry recorded separately from canonical evidence
P02 product screenshots/visual proof captured without entering canonical identity
```

Total:

```text
6 + 6 + 6 + 4 + 2 = 24
```

---

## 22. Deterministic evidence

Emit:

```text
24 per-vector canonical evidence artifacts
1 canonical summary
```

Target:

```text
25/25 BYTE_IDENTICAL
```

Canonical evidence MAY include:

```text
logical_tick_index
game_run_id
render_snapshot_digest
render_binding_digest
splat_asset_id
asset content SHA-256
load_disposition
fallback_used
presentation transform digest
semantic digest before/after
renderer capability class
```

Hard law:

```text
PIXEL_NONCANONICAL := REQUIRED
```

Canonical evidence MUST NOT include:

```text
pixels
wall-clock timing
GPU timing
actual splat sort order
frame time
driver-specific identifiers
```

Performance telemetry and screenshots remain separate product evidence.

---

## 23. Regression floor

Published prior floor MUST remain unchanged:

```text
253/253 conformance
242/242 deterministic evidence
```

VIS-R&D-001 MUST NOT rewrite prior evidence.

---

## 24. Acceptance criteria

```text
VIS_RD_001_GAUSSIAN_SPLAT_RENDER_PRIMITIVE := HOLDS IFF

  A01–A06 = 6/6
  R01–R06 = 6/6
  N01–N06 = 6/6
  F01–F04 = 4/4
  P01–P02 = 2/2

  TOTAL = 24/24

  AND deterministic evidence = 25/25 BYTE_IDENTICAL

  AND GAUSSIAN_PRESENTATION_NONINTERFERENCE = HOLDS
  AND ASSET_SUBSTITUTION_SEMANTIC_INVARIANCE = HOLDS
  AND RENDERER_NONAUTHORITY = HOLDS
  AND SPLAT_SORT_NONSEMANTIC = HOLDS
  AND VIEW_DEPENDENT_COLOR_NONSEMANTIC = HOLDS
  AND FALLBACK_SEMANTIC_INVARIANCE = HOLDS

  AND prior 253/253 regression remains unchanged

  AND prior 242/242 evidence remains unchanged
```

---

## 25. Non-goals

```text
NO dynamic Gaussian actor
NO 4D Gaussian field
NO deformation
NO Gaussian-driven collision
NO Gaussian-driven AI perception
NO Gaussian-driven navigation
NO Gaussian runtime training
NO rendering-as-measurement
NO 3-6-9 perception conformance
NO Level 1/Level 2 perception
NO Gaussian representation as canonical FabricSpec state
NO pixel-byte-identity requirement
NO universal FPS requirement
NO claim that Gaussian rendering is always superior to meshes
NO multiplayer determinism claim
```

---

## 26. Successor boundary

```text
VIS-R&D-002
  dynamic / 4D Gaussian actor

VIS-R&D-003
  governed perception pipeline
  rendering-as-measurement
  3-6-9 projection
  explicit corpus dependency:
    connect visual projection to Π
    through declared dodecahedral carrier geometry
```

VIS-R&D-002 may import VIS-R&D-001 only after separate promotion/publication decision.

VIS-R&D-003 remains independent of VIS-R&D-002 except where explicitly specified later.

---

## 27. Implementation order

```text
1. import published v0.7.0 unchanged
2. bind one local static .splat fixture by SHA-256
3. define SplatAssetDescriptor
4. extend presentation RenderBindingSpec with GaussianAssetBinding
5. integrate Three.js GaussianSplat via WebGPURenderer
6. implement capability detection/fallback
7. render one Gaussian GAME-view asset
8. bind committed game transform → Gaussian presentation transform
9. enforce renderer nonauthority / reverse-flow prohibition
10. implement digest/parse/resource failure paths
11. emit GaussianRenderDecision
12. implement A/R/N/F/P vectors
13. replay 25 deterministic evidence artifacts
14. run 253/253 prior regression
15. verify prior 242/242 evidence unchanged
16. capture product screenshots
17. freeze implementation
18. bind hashes/evidence
19. await DECIDE/PROMOTE
```

---

## 28. Authority state

```text
SPEC-VIS-RD-001-GAUSSIAN-SPLAT-RENDER-PRIMITIVE v0.3
  := PROPOSED

VECTOR CENSUS:
  24

EVIDENCE TARGET:
  25

IMPORT:
  mal-fabric v0.7.0
  DOI 10.5281/zenodo.22727508
  UNCHANGED

BUILD:
  NOT AUTHORIZED pending DECIDE/PROMOTE

PRODUCT_EVIDENCE_PROFILE:
  REAL_WORLD_GAUSSIAN_SHOWCASE := ADDED v0.2
  NORMATIVE_CENSUS := UNCHANGED
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
