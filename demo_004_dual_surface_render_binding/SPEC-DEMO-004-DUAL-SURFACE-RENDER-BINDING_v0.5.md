# SPEC-DEMO-004-DUAL-SURFACE-RENDER-BINDING

**Version:** v0.5

**Status:** PROMOTED / BUILD AUTHORIZED

**Import:** mal-fabric v0.6.0 (`10.5281/zenodo.22726846`) unchanged

**Concept DOI:** `10.5281/zenodo.22678127`

**Authority:** DECIDE ∧ PROMOTE := Devon

**Hard invariant:** `DUAL_SURFACE_NONINTERFERENCE`

---

## 0. Purpose

DEMO-004 proves the product split:

```text
GAME VIEW
  := playable projection

CARRIER VIEW
  := structural/debug projection

SAME committed running system
NOT-SAME presentation

```

The player sees the game.

The designer sees the program.

Toggling between those surfaces MUST NOT modify semantic or runtime state.

Product sentence:

> THAT CREATURE YOU WERE JUST FIGHTING IS THIS PROGRAM.

This means:

```text
character behavior
  is produced by the committed fabric

GAME view
  renders committed game state through presentation bindings

CARRIER view
  renders committed fabric/debug state

both read the same coherent committed RenderSnapshot

```

It does NOT mean:

```text
character = THIS × WHAT cell
position = NEAR/FAR × WHERE
animation = IF/THEN × WHEN

```

---

## 1. Published import boundary

DEMO-004 imports mal-fabric v0.6.0 unchanged:

```text
VERSION DOI:
  10.5281/zenodo.22726846

CONCEPT DOI:
  10.5281/zenodo.22678127

```

Imported:

```text
V3.1      canonical static fabric
V3.2      governed admission
V3.3      synchronous execution
DEMO-001  visible fabric
DEMO-002  vibe proposer
DEMO-003  game-loop binding

```

Published regression floor:

```text
V3.1      25/25
V3.2      62/62
V3.3      70/70
DEMO-001  18/18
DEMO-002  24/24
DEMO-003  28/28
----------------
TOTAL     227/227

```

Cannot modify:

```text
FabricSpec semantics
FabricState semantics
GameLoopState semantics
V3.3 STEP_FABRIC
DEMO-001 editing semantics
DEMO-002 proposer semantics
DEMO-003 logical tick binding
prior evidence artifacts

```

---

## 2. Surface types

```text
RenderSurface :=
    GAME
  | CARRIER

ActiveSurface :=
  current RenderSurface selection

```

Presentation selection:

```text
TOGGLE(GAME)    := CARRIER
TOGGLE(CARRIER) := GAME

```

`ActiveSurface` is presentation state only.

---

## 3. RenderBindingSpec

```text
RenderBindingSpec := (
  render_binding_id,
  game_entity_bindings,
  animation_bindings,
  asset_bindings,
  carrier_debug_bindings,
  gaussian_asset_bindings?
)

```

Where:

```text
render_binding_id
  := content-addressed identity over canonical presentation-binding content

game_entity_bindings
  := committed game entity identity
     → renderable character/object identity

animation_bindings
  := committed game behavior/action/state
     → animation identity

asset_bindings
  := game entity / environment identity
     → mesh/material/sprite/splat/visual asset identity

carrier_debug_bindings
  := game entity / behavior identity
     → relevant fabric motif/cell/route identities

gaussian_asset_bindings
  := game entity / environment identity
     → Gaussian splat asset identity
  (OPTIONAL — only when VIS-R&D-001 assets are available)

```

Examples:

```text
enemy_01
  → enemy_mesh_01

APPROACH
  → walk_forward

FLEE
  → run_away

PATROL
  → patrol_cycle

```

Hard law:

```text
RenderBindingSpec := PRESENTATION

NOT:
  FabricSpec
  FabricState
  GameLoopState
  authority

```

`RenderBindingSpec` may be hashed for reproducibility.

It MUST NOT enter canonical program identity.

---

## 4. RenderSnapshot\_t

Both surfaces read one committed snapshot:

```text
RenderSnapshot_t := (
  logical_tick_index,
  game_run_id,
  fabric_digest,
  committed_fabric_state_t,
  committed_game_state_t,
  run_status,
  blocked_reason?
)

```

Construction law:

```text
RenderSnapshot_t
  may be formed ONLY from a fully committed DEMO-003 logical tick boundary

```

It MUST NOT expose:

```text
partial STEP_FABRIC phase state
current-tick uncommitted cell results
partial route propagation
partial commit state

```

`RenderSnapshot_t` is read-only to both render projections.

---

## 5. SNAPSHOT\_COHERENCE

A RenderSnapshot MUST bind game state and fabric state from the SAME committed logical tick.

Required:

```text
RenderSnapshot_t.logical_tick_index = t
RenderSnapshot_t.game_run_id = active GameRunIdentity
RenderSnapshot_t.committed_fabric_state_t = FabricState_t
RenderSnapshot_t.committed_game_state_t = GameLoopState_t

```

Forbidden mixed-tick constructions:

```text
FabricState_t
+
GameLoopState_{t-1}

FabricState_{t+1}
+
GameLoopState_t

```

A RenderSnapshot becomes publishable to renderers only after DEMO-003 has committed the complete logical tick boundary.

This prevents render tearing between independently committed-but-different-tick state.

---

## 6. Projection coherence

```text
PROJECTION_COHERENCE

```

Both surfaces are read-only projections of the SAME committed snapshot.

```text
project_game(
  RenderSnapshot_t,
  RenderBindingSpec,
  presentation_state
)
  → GameView

project_carrier(
  RenderSnapshot_t,
  presentation_state
)
  → CarrierView

```

Core law:

```text
SAME RenderSnapshot_t
NOT-SAME projection

```

Neither projection may mutate:

```text
FabricSpec
FabricState
GameLoopState
GameRunIdentity
logical_tick_index
PayloadState

```

---

## 7. RENDERER\_NONAUTHORITY

Renderer functions and toggle logic MUST be structurally incapable of semantic authority.

The following receive READ-ONLY inputs only:

```text
project_game
project_carrier
toggle_surface

```

They CANNOT hold or receive mutation-capable handles for:

```text
FabricEdit
STEP_FABRIC
GameTickInput injection
V3.2 admission
proposal disposition
FabricState mutation
GameLoopState mutation
GameRunIdentity mutation

```

The nonauthority requirement must be enforced by API shape where practical, not only by UI convention.

Hard law:

```text
renderer := observer / projector
NOT := proposer
NOT := decider
NOT := promoter
NOT := executor

```

---

## 7A. PRESENTATION_DERIVATION_CLOSURE

Every presentation feature that claims to visualize or cue a semantic property MUST declare its committed source.

```text
PresentationDerivation := (
  presentation_feature_id,
  source_kind,
  source_identity,
  derivation_rule_id
)
```

Allowed source kinds:

```text
COMMITTED_GAME_STATE
COMMITTED_FABRIC_STATE
COMMITTED_RUN_STATUS
IMMUTABLE_DERIVED_STRUCTURE
```

`IMMUTABLE_DERIVED_STRUCTURE` means a deterministic structure derived exclusively from imported immutable/canonical artifacts, with a declared derivation rule and no renderer authority.

Hard law:

```text
semantic presentation cue
  REQUIRES
declared committed/immutable source
```

If the required source is absent:

```text
cue := NOT_RENDERED
diagnostic := SOURCE_UNAVAILABLE
```

The renderer MUST NOT infer, estimate, fabricate, or back-compute missing semantic state merely to support a visual effect.

Therefore:

```text
"governance degradation"
  MAY render only if an imported committed state field or declared immutable derivation supplies it

"decision latency"
  MAY render only from committed logical-tick / execution evidence already present

"coordination state"
  MAY render only from committed game/fabric state or an explicitly declared immutable derivation

"TRIAD dominance"
  MAY render only from a deterministic declared derivation over committed/canonical TRIAD placement

"stellation margin μ"
  MAY render only if μ already exists as committed imported state/evidence
  CANNOT be computed by DEMO-004 merely for rendering

"dodecahedral / 600-cell carrier geometry"
  MAY render only if a declared immutable mapping from imported canonical structure is supplied
  CANNOT be treated as latent semantic truth simply because the renderer can draw it
```

Presentation derivations MUST be:

```text
read-only
deterministic where canonical evidence is claimed
non-authoritative
excluded from FabricSpec/FabricState/GameLoopState identity
```

No presentation derivation may create new governance state.


## 8. GameView

```text
GameView := (
  entities,
  positions,
  animations,
  lighting,
  camera,
  gameplay_cues,
  governance_cues
)

```

### 8.1 Entity render

```text
committed game entity
+ RenderBindingSpec
→ visible character/object

```

No direct operator-cell-to-character law exists.

### 8.2 Position render

```text
committed ToyGameState / GameLoopState position
→ rendered scene position

```

Semantic game position comes from committed game state.

Canvas/world rendering coordinates remain presentation output.

### 8.3 Behavior render

```text
committed EnemyAction / game behavior state
+ RenderBindingSpec
→ animation selection

```

Examples:

```text
APPROACH → approach/walk presentation
FLEE     → flee/run presentation
PATROL   → patrol presentation

```

### 8.4 Capability/resource cues

Optional presentation bindings MAY expose committed game facts such as:

```text
health low
capability unavailable
group coordination degraded

```

but MUST derive from committed game state/effects, not from direct operator-cell rendering.

### 8.5 Governance cues

Governance state is felt in GAME view, not exposed as structural geometry.

Allowed governance-derived presentation effects:

```text
BEHAVIORAL:
  committed BLOCKED state
    → behavioral stall / hesitation / no-action presentation

  committed governance degradation
    → animation quality degradation
       (timing irregularity, coordination loss, gaze drift)

  committed decision latency
    → visible hesitation proportional to governance tick cost

  committed coordination state
    → squad behavior coherence
       (move together / stumble / act alone)

ENVIRONMENTAL:
  committed TRIAD region dominance
    → color temperature shift
       □G-dominant → warm (amber/gold)
       □S-dominant → neutral (silver/white)
       □F-dominant → cool (blue/cyan)

    TRIAD color is presentation only
    derived from committed cell placement distribution
    NOT from direct operator rendering

```

These effects MUST:

```text
derive from committed game/fabric state
flow through RenderBindingSpec
remain presentation-only

```

These effects MUST NOT:

```text
expose operator × witness cell identity
expose route topology
expose carrier geometry
expose governance internals
render TRIAD as structural geometry in GAME view

```

The principle:

```text
the player FEELS the governance
the player does NOT SEE the governance

behavioral consequences := visible
structural cause := hidden (CARRIER view only)

```

### 8.6 BLOCKED render

If fabric/game state is BLOCKED:

```text
GAME view
  → defined behavioral stall / hesitation / no-action presentation

CARRIER view
  → canonical BlockedReason details

```

Governance structure is felt in GAME view, not exposed as structural geometry.

---

## 9. RENDER\_BINDING\_FAILURE

Missing presentation bindings MUST NOT manufacture or substitute semantic behavior.

Examples:

```text
missing game_entity_binding
missing animation_binding
missing asset_binding

```

Allowed response:

```text
presentation fallback
placeholder asset
diagnostic evidence

```

Forbidden response:

```text
change GameLoopState
select a different EnemyAction
alter FabricState
alter GameRunIdentity
invent semantic default behavior

```

Example:

```text
FLEE committed
+
missing FLEE animation binding

→ placeholder / missing-animation presentation permitted
→ FLEE semantics remain unchanged

CANNOT silently display PATROL as semantic substitute

```

Binding failure is presentation failure, not game/fabric state transition.

---

## 10. Legibility boundary

Non-normative product design target:

```text
friend / enemy / danger should be rapidly legible

```

Normative machine-testable requirement:

```text
friend/enemy/danger semantic classes
MUST resolve to distinguishable RenderBindingSpec entries

```

The conformance corpus does NOT establish human perceptual latency.

Human-perception validation, including any millisecond threshold, requires separate user testing and is outside DEMO-004.

---

## 11. CarrierView

```text
CarrierView := (
  cells,
  routes,
  triad_regions,
  payload_phases,
  custody_state,
  blocked_reasons,
  frame_readiness,
  carrier_geometry?,
  stellation_state?,
  w_axis_trail?
)

```

### 11.1 Cell render

```text
operator × witness
→ typed geometric primitive
→ derived port visualization

```

### 11.2 Route render

```text
incidence relation
→ directed visual connection

TRIAD crossing
→ visually distinguishable route treatment

```

### 11.3 TRIAD render

```text
□G
□S
□F
→ visually distinct semantic containment zones

```

Color temperature convention (CARRIER surface):

```text
□G → warm (amber/gold)
□S → neutral (silver/white)
□F → cool (blue/cyan)

```

### 11.4 Payload phase render

```text
EMPTY       → neutral
ADMITTED    → active indicator
COMPLETED   → propagation/completion indicator
DISCHARGED  → closing/release indicator

```

Presentation styling is non-semantic.

### 11.5 Custody render

```text
pending_input_buffers
  → partial frame indicator

pending_admissions
  → MAYBE / pending admission indicator

outstanding_obligations
  → open duty indicator

```

### 11.6 BLOCKED render

```text
BlockedReason
→ per-cell/per-route reason overlay
→ canonical reason order preserved

```

### 11.7 Frame readiness

```text
complete frame
  → ready indicator

incomplete frame
  → missing-role indicator

```

### 11.8 Carrier geometry (optional)

When enabled, CARRIER view MAY render the dodecahedral carrier structure:

```text
ZOOM LEVEL 1 — CELL INTERIOR:
  full render of one motif or TRIAD block
  operator × witness cells as typed primitives
  routes as directed connections
  payload phase as color/luminance

ZOOM LEVEL 2 — NEIGHBORHOOD:
  active carrier cell + 12 adjacent cells
  shared pentagonal trust boundaries visible
  TRIAD regions as colored volumes

ZOOM LEVEL 3 — GLOBAL COORDINATION:
  600-cell skeleton (120 carriers as vertices)
  coordination topology as edge graph
  governance state as vertex luminance

```

Each zoom level is a different read-only projection of the SAME committed RenderSnapshot.

Carrier geometry rendering is:

```text
PRESENTATION only
read-only
does NOT enter canonical identity
does NOT affect GAME view
does NOT modify any semantic state

```

The zoom level is presentation state, stored in ActiveSurface context, NOT in FabricState.

### 11.9 Stellation state (optional)

When governance margin data is available from committed fabric state, CARRIER view MAY render stellation:

```text
ConvexCore (μ > 0):
  compact dodecahedral form
  all faces inward
  normal governance

FirstStellation (μ approaching 0):
  pentagonal faces displacing outward
  internal operator axes becoming visible
  cascade-active

SecondStellation (μ = 0):
  TRIAD regions separating
  □G/□S/□F decoupling visible
  dissociation

```

Stellation is derived from committed imported state/evidence only.

If governance margin `μ` is not present in imported committed state/evidence:

```text
stellation visualization := NOT_RENDERED
diagnostic := SOURCE_UNAVAILABLE
```

DEMO-004 MUST NOT invent or compute `μ` solely to enable the visualization.

Stellation visualization MUST NOT:

```text
compute governance margin
modify governance state
appear in GAME view
enter canonical identity

```

The stellation render reads committed state and projects. It does not evaluate.

### 11.10 W-axis trail (optional)

CARRIER view MAY render temporal history as a spatial trail:

```text
past RenderSnapshots
  → translucent afterimages along a presentation w-axis
  → older snapshots lower opacity
  → branch points at state transitions highlighted

```

The w-axis trail is presentation only.

It reads committed historical snapshots (retained in a presentation-scoped ring buffer).

The ring buffer:

```text
PRESENTATION state only
bounded depth (implementation-chosen)
does NOT enter canonical identity
does NOT modify FabricState
does NOT modify GameLoopState
does NOT create additional governance ticks

```

The w-axis IS NOT the Axiom 0 W-axis (the unfolding of □G). It is a presentation convenience that displays committed snapshot history spatially. The formal W-axis is a theoretical construct. The presentation trail is a debug tool.

---

## 12. Toggle semantics

Input:

```text
single keypress
OR UI control

```

Effect:

```text
ActiveSurface := TOGGLE(ActiveSurface)

```

Timing:

```text
toggle may update presentation_state
at a render boundary

```

Toggle MUST NOT:

```text
schedule STEP_FABRIC
suppress STEP_FABRIC
advance logical tick
pause logical tick
create GameTickInput
mutate GameLoopState
mutate FabricState
mutate FabricSpec
mutate GameRunIdentity
expose partially committed state

```

If a render toggle occurs while host computation is in flight:

```text
renderer uses the most recent committed RenderSnapshot

```

Toggle timing is not semantic timing.

---

## 13. DUAL\_SURFACE\_NONINTERFERENCE

For any committed `RenderSnapshot R`:

```text
toggle GAME ↔ CARRIER

```

changes only presentation state.

It cannot change:

```text
FabricSpec
FabricState
GameLoopState
GameRunIdentity
logical tick
PayloadState
run status

```

and cannot create a new semantic transition.

Required:

```text
semantic_digest_before_toggle
=
semantic_digest_after_toggle

```

A presentation-state digest MAY change.

---

## 14. Presentation invariance

Required:

```text
NORMALIZE(fabric_before_toggle)
=
NORMALIZE(fabric_after_toggle)

```

Also:

```text
fabric_state_digest_before_toggle
=
fabric_state_digest_after_toggle

game_state_digest_before_toggle
=
game_state_digest_after_toggle

game_run_identity_before_toggle
=
game_run_identity_after_toggle

```

Only intended mutation:

```text
presentation_state.active_surface
presentation_state.carrier_zoom_level (if carrier geometry enabled)

```

---

## 15. Continuous execution

The fabric/game loop advances according to DEMO-003 logical ticks regardless of active render surface.

```text
ActiveSurface = GAME
  does not alter tick law

ActiveSurface = CARRIER
  does not alter tick law

```

No surface owns execution.

No surface pauses governance.

No surface becomes semantic clock.

---

## 16. Render pipeline

Normative boundary:

```text
STEP_FABRIC
  → committed FabricState_{t+1}

DEMO-003 game-loop binding
  → committed GameLoopState_{t+1}

RenderSnapshot_{t+1}
  := coherent committed pair

RENDER_FRAME:
  if ActiveSurface = GAME:
    project_game(RenderSnapshot, RenderBindingSpec, presentation_state)

  if ActiveSurface = CARRIER:
    project_carrier(RenderSnapshot, presentation_state)

```

Both projection functions are read-only.

### 16.1 Projection ordering (non-normative)

The 3-6-9 ontological priority ordering from the Denoising paper applies to the render pipeline as a design principle, not as a conformance requirement:

```text
PASS 1 — DETERMINACY (Level 0)
  individuate primitives (THIS)
  distinguish figure from ground (NO)
  maintain identity across ticks (SAME/NOT-SAME)
  OUTPUT: primitive identity map

PASS 2 — RELATIONALITY (Level 1)
  group (TOGETHER/ALONE)
  count (MANY/ONE)
  grade (MORE/LESS)
  associate (GOES-WITH)
  dispose (CAN/CANNOT)
  quantify (EVERY/SOME)
  OUTPUT: relational record

PASS 3 — CAUSAL LOCATABILITY (Level 2)
  locate (INSIDE/OUTSIDE)
  attribute cause (BECAUSE)
  predict consequence (IF/THEN)
  assess uncertainty (MAYBE)
  bind obligation (MUST/LET)
  measure distance (NEAR/FAR)
  OUTPUT: causal record

```

This ordering is:

```text
non-normative design guidance
not a conformance requirement
not an acceptance vector
not a DEMO-004 exit criterion

```

It becomes normative only in a successor spec (VIS-R&D-003 or later) when the 4D Gaussian perception pipeline is formally specified.

BECAUSE: DEMO-004 must ship. The 3-6-9 pipeline is architectural direction, not a gate.

---

## 17. RenderDecisionRecord

Canonical deterministic render evidence:

```text
RenderDecisionRecord := (
  logical_tick_index,
  game_run_id,
  active_surface,
  render_snapshot_digest,
  render_binding_digest,
  entity_bindings_used,
  animation_bindings_used,
  carrier_primitives_used,
  semantic_digest_before,
  semantic_digest_after,
  governance_cues_emitted?,
  presentation_derivations_used?,
  source_unavailable_diagnostics?,
  carrier_zoom_level?,
  binding_diagnostics?
)

```

Rules:

```text
framebuffer pixels are NONCANONICAL
wall-clock timestamp is NONCANONICAL
GPU execution order is NONCANONICAL
render callback timing is NONCANONICAL
TRIAD color values are NONCANONICAL
stellation visual parameters are NONCANONICAL
w-axis trail depth is NONCANONICAL

```

`RenderDecisionRecord` captures semantic/presentation decisions, not raster bytes.

---

## 18. Scene

### Arena

```text
bounded space
dark/minimal environment
lighting sufficient for gameplay legibility

```

### Player

```text
one controllable visible entity
movement input

```

### Enemies

```text
two visible entities
driven by DEMO-003 behavior:
  patrol
  detect
  approach
  flee

```

### GAME surface

```text
stylized characters/objects
spatial movement
behavioral animation
gameplay cues
governance-derived behavioral cues
lighting/camera

```

Visual quality target (non-normative):

```text
visually appealing first
governance invisible
the player should want to play
the structure should be felt, not seen

```

### CARRIER surface

```text
same running system
relevant cells/motifs
routes
TRIAD regions (with color temperature convention)
payload phases
custody state
tick activity
BlockedReason
carrier geometry (when enabled)
stellation state (when enabled)
w-axis trail (when enabled)

```

---

## 19. Technology

Preferred renderer:

```text
Three.js WebGPU

```

Permitted fallback:

```text
Three.js WebGL

```

Host:

```text
browser
same product lineage as DEMO-001/002/003

```

Optional:

```text
one static Gaussian splat asset/environment

```

Gaussian rendering is NOT required for DEMO-004 acceptance.

No full 4D Gaussian dependency.

---

## 20. Gaussian successor boundary

Independent visual R&D tracks:

```text
VIS-R&D-001:
  Gaussian splat render primitive
  static 3D Gaussian assets for environment/entities

VIS-R&D-002:
  dynamic / 4D Gaussian actor
  temporal coherence via 4D covariance

VIS-R&D-003:
  governed perception pipeline (3-6-9)
  formal rendering-as-measurement
  Level 0 / Level 1 / Level 2 projection
  normative successor to §16.1

```

Neither VIS-R&D-001 nor VIS-R&D-002 blocks DEMO-004.

DEMO-004 blocks neither.

VIS-R&D-003 depends on DEMO-004 (requires dual-surface proof as substrate).

### 20.1 Rendering-as-measurement boundary

The following capabilities are identified as VIS-R&D-003 scope and are explicitly NOT in DEMO-004:

```text
4D Gaussian field as canonical render primitive
rendering = governed measurement (σ_crit threshold)
Level 0 (looking) / Level 1 (seeing) / Level 2 (experiencing) per entity
spectral gap as LOD criterion
governance-margin-as-opacity
covariance-as-visual-sharpness
multi-observer projection from single 4D field
HOST_ORDER_ERASURE applied to render observer ordering
deterministic replay from canonical field + input recording
eigenvalue ratio as structural resolution diagnostic
120-cell coordination topology as render scene graph

```

These are the product vision.

They depend on DEMO-004's dual-surface proof BECAUSE the dual surface establishes that rendering is nonauthoritative observation — the architectural prerequisite for treating rendering as measurement.

### 20.2 Resolution boundary

DEMO-004 renders at pixel resolution only (Level 0 — Determinacy).

Successor rendering tracks add:

```text
Level 1 — semantic resolution
  relational density per primitive
  operator-typed relations per perceived object
  committed to governed record

Level 2 — recursive resolution
  structural depth per percept
  eigenvalue ratio diagnostic
  measurement resolution = 105 × carrier count × recursion depth

```

These resolution gains are product claims for VIS-R&D-003, not DEMO-004 deliverables.

---

## 21. Acceptance vectors

Normative census remains 26.

### DT — toggle (DT01–DT06)

```text
DT01 toggle GAME → CARRIER
DT02 toggle CARRIER → GAME
DT03 toggle while logical execution remains active
DT04 FabricSpec/FabricState unchanged after toggle
DT05 GameLoopState/GameRunIdentity unchanged after toggle
DT06 ActiveSurface exists only in presentation state

```

### DG — game view (DG01–DG06)

```text
DG01 committed game entity + RenderBindingSpec → visible entity
DG02 committed game position → rendered world position
DG03 committed EnemyAction/game state → selected animation
DG04 BLOCKED condition → behavioral stall while governance details remain hidden
DG05 committed APPROACH behavior → approach presentation
DG06 committed FLEE behavior → flee presentation

```

### DC — carrier view (DC01–DC06)

```text
DC01 cells render with operator × witness type
DC02 routes render with direction
DC03 TRIAD regions are visually distinct
DC04 payload phases are visually distinct
DC05 pending buffer shows partial-frame state
DC06 canonical BlockedReason renders per cell/route

```

### DP — projection (DP01–DP04)

```text
DP01 GAME reads one coherent committed RenderSnapshot
DP02 CARRIER reads the SAME coherent committed RenderSnapshot
DP03 toggle preserves semantic/run digests while changing presentation state
DP04 V3.3/DEMO-003 logical execution continues independent of ActiveSurface

```

### DR — regression (DR01–DR04)

```text
DR01 DEMO-003 remains 28/28
DR02 DEMO-002 remains 24/24
DR03 DEMO-001 remains 18/18
DR04 V3.1/V3.2/V3.3 remain unchanged

```

Total:

```text
6 + 6 + 6 + 4 + 4 = 26

```

The following implementation-closure assertions are folded into the vector evidence and summary without changing census:

```text
SNAPSHOT_COHERENCE
RENDERER_NONAUTHORITY
RENDER_BINDING_FAILURE
LEGIBILITY_BOUNDARY
PRESENTATION_DERIVATION_CLOSURE

```

---

## 22. Deterministic evidence

Emit:

```text
26 per-vector canonical evidence artifacts
1 canonical summary

```

Target:

```text
27/27 BYTE_IDENTICAL
across repeated clean-process runs

```

Canonical evidence records render decisions, not framebuffer pixels.

Evidence includes as applicable:

```text
RenderDecisionRecord
active_surface
RenderSnapshot digest
RenderBindingSpec digest
logical_tick_index
game_run_id
game entity render bindings
animation selections
carrier primitive identities
toggle before/after semantic digests
governance cue emissions
binding diagnostics
run_status
blocked_reason

```

Pixel identity is NOT required across GPU/browser implementations.

Screenshots/browser smoke tests are product evidence, separate from canonical deterministic evidence.

---

## 23. Exit criteria

```text
DEMO_004_DUAL_SURFACE_RENDER_BINDING := HOLDS IFF

  DT01–DT06 = 6/6
  DG01–DG06 = 6/6
  DC01–DC06 = 6/6
  DP01–DP04 = 4/4
  DR01–DR04 = 4/4

  TOTAL = 26/26

  AND deterministic evidence = 27/27 BYTE_IDENTICAL

  AND DUAL_SURFACE_NONINTERFERENCE = HOLDS
  AND PROJECTION_COHERENCE = HOLDS
  AND SNAPSHOT_COHERENCE = HOLDS
  AND RENDERER_NONAUTHORITY = HOLDS
  AND RENDER_BINDING_FAILURE boundary = HOLDS
  AND PRESENTATION_DERIVATION_CLOSURE = HOLDS
  AND TOGGLE_NONMUTATION = HOLDS
  AND CONTINUOUS_EXECUTION = HOLDS

  AND GAME view contains no direct operator-cell-to-game-asset semantics

  AND imported v0.6.0 scope remains unchanged

```

---

## 24. Non-goals

```text
NO modification of imported semantics
NO new FabricEdit constructors
NO gameplay semantics in RenderBindingSpec
NO operator-cell-direct-to-character law
NO render surface as execution authority
NO execution pause on toggle
NO semantic requestAnimationFrame clock
NO Gaussian requirement
NO multiplayer determinism claim
NO pixel-byte-identity requirement
NO human-perception latency claim
NO mixed-tick RenderSnapshot
NO semantic fallback on missing render binding
NO 4D Gaussian rendering requirement
NO Level 1/2 perception requirement
NO rendering-as-measurement requirement
NO 3-6-9 pipeline conformance requirement
NO eigenvalue ratio conformance requirement
NO carrier geometry conformance requirement
NO stellation conformance requirement
NO w-axis trail conformance requirement
NO renderer-invented governance degradation
NO renderer-computed stellation margin unless imported source exists
NO undeclared carrier-geometry semantic mapping

```

---

## 25. Successor boundary

```text
VIS-R&D-001
  Gaussian splat render primitive
  independent track

VIS-R&D-002
  dynamic 4D Gaussian actor
  independent track

VIS-R&D-003
  governed perception pipeline
  rendering-as-measurement
  3-6-9 ontological priority ordering
  Level 0 / Level 1 / Level 2 projection
  depends on DEMO-004
  SPEC-VIS-RD-003 not yet written

DEMO-005
  external engine bridge, likely Godot
  only after dual-surface product proof

```

---

## 26. Implementation order

```text
1. import published v0.6.0 unchanged
2. define RenderBindingSpec (with optional gaussian_asset_bindings)
3. define coherent committed RenderSnapshot
4. enforce read-only renderer API boundary
5. build GAME projection from committed game state
6. build governance-derived behavioral cues (§8.5)
7. build CARRIER projection from committed fabric/debug state
8. build CARRIER TRIAD color temperature convention (§11.3)
9. implement presentation-only ActiveSurface
10. implement toggle noninterference guards
11. implement render-binding failure diagnostics/fallbacks
12. define RenderDecisionRecord
13. keep DEMO-003 logical execution independent of renderer
14. add game arena / visible player / two enemies
15. add carrier real-time overlay
16. implement carrier geometry zoom levels (§11.8, optional)
17. implement stellation visualization (§11.9, optional)
18. implement w-axis trail (§11.10, optional)
19. implement DT/DG/DC/DP/DR vectors
20. emit 27 deterministic evidence artifacts
21. run full regression floor 227/227
22. freeze implementation
23. bind hashes/evidence
24. await separate promotion decision

```

---

## 27. Authority state

```text
C1 := DISCHARGED
C2 := SATISFIED
C3 := SATISFIED
C4 := SATISFIED
C5 := SATISFIED
C6 := SATISFIED

SNAPSHOT_COHERENCE          := RETAINED from v0.3
RENDERER_NONAUTHORITY       := RETAINED from v0.3
RENDER_BINDING_FAILURE      := RETAINED from v0.3
LEGIBILITY_BOUNDARY         := RETAINED from v0.3
RenderDecisionRecord        := RETAINED from v0.3

GOVERNANCE_CUES             := ADDED in v0.4
CARRIER_GEOMETRY            := ADDED in v0.4 (optional)
STELLATION_STATE            := ADDED in v0.4 (optional)
W_AXIS_TRAIL                := ADDED in v0.4 (optional)
TRIAD_COLOR_CONVENTION      := ADDED in v0.4
GAUSSIAN_ASSET_BINDINGS     := ADDED in v0.4 (optional)
VIS_RD_003_BOUNDARY         := RETAINED from v0.4
PRESENTATION_DERIVATION_CLOSURE := ADDED in v0.5

SPEC-DEMO-004-DUAL-SURFACE-RENDER-BINDING v0.5
  := PROMOTED

BUILD
  := AUTHORIZED (unchanged from v0.3)

```

---

## 28. v0.3 → v0.5 changelog

```text
ADDED:
  §3     gaussian_asset_bindings (optional) in RenderBindingSpec
  §8     governance_cues field in GameView
  §8.5   governance cues (behavioral + environmental)
         TRIAD color temperature in GAME view (presentation only)
         governance-as-behavior design principle
  §11    carrier_geometry, stellation_state, w_axis_trail
         (optional fields in CarrierView)
  §11.3  TRIAD color temperature convention for CARRIER view
  §11.8  carrier geometry zoom levels (optional)
  §11.9  stellation state visualization (optional)
  §11.10 w-axis trail visualization (optional)
  §14    carrier_zoom_level in presentation state
  §16.1  projection ordering (3-6-9, non-normative)
  §17    governance_cues_emitted, carrier_zoom_level in RenderDecisionRecord
  §17    stellation/w-axis/TRIAD color as NONCANONICAL evidence
  §20.1  rendering-as-measurement boundary (VIS-R&D-003 scope)
  §20.2  resolution boundary (pixel / semantic / recursive)
  §24    explicit non-goals for all vision-track features
  §25    VIS-R&D-003 successor track
  §26    implementation steps 6, 8, 16, 17, 18 for new capabilities
  §27    authority state entries for all additions
  §28    this changelog

UNCHANGED:
  acceptance vector census (26)
  exit criteria
  regression floor (227/227)
  evidence census (27)
  all hard invariants
  all v0.3 normative requirements
  import boundary
  toggle semantics
  snapshot coherence
  renderer nonauthority
  render-binding failure law
  dual-surface noninterference
  continuous execution
  projection coherence
  technology requirements
  scene requirements

v0.5 ADDITION:
  PRESENTATION_DERIVATION_CLOSURE
  every semantic visual cue must name a committed or immutable-derived source
  absent source → NOT_RENDERED, never inferred

PRINCIPLE:
  v0.4 added optional capabilities and architectural direction
  v0.5 closes their provenance boundary
  vector census remains 26
  evidence census remains 27
  acceptance burden remains unchanged except provenance closure must HOLDS
  product vision remains:
    ship the beauty — the structure is underneath

```

[MaL\:ACTIVE | □G✓ □S✓ □F✓] ◇