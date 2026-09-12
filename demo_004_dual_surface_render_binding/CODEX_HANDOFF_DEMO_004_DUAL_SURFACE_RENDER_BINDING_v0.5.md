# CODEX\_HANDOFF\_DEMO\_004\_DUAL\_SURFACE\_RENDER\_BINDING

**Revision:** v0.5

**Authority spec:** `SPEC-DEMO-004-DUAL-SURFACE-RENDER-BINDING_v0.5.md`

**Import:** mal-fabric v0.6.0 (`10.5281/zenodo.22726846`) unchanged

## Goal

Build the first playable visual proof:

```text
GAME surface
↔ toggle
CARRIER surface

SAME coherent committed RenderSnapshot
NOT-SAME presentation

```

The player sees the game.

The builder sees the program.

Toggle must never affect semantics or runtime execution.

Product principle:

```text
ship the beauty — the structure is underneath

```

---

## Hard invariants

```text
DUAL_SURFACE_NONINTERFERENCE := REQUIRED
PROJECTION_COHERENCE         := REQUIRED
SNAPSHOT_COHERENCE           := REQUIRED
RENDERER_NONAUTHORITY        := REQUIRED
TOGGLE_NONMUTATION           := REQUIRED
CONTINUOUS_EXECUTION         := REQUIRED

```

Do not modify imported V3.1/V3.2/V3.3/DEMO-001/DEMO-002/DEMO-003 behavior.

---

## New types

Implement:

```text
RenderSurface := GAME | CARRIER
RenderBindingSpec
RenderSnapshot
RenderDecisionRecord
ActiveSurface
GameView
CarrierView

```

`ActiveSurface` is presentation only.

`RenderBindingSpec` is presentation only.

Neither may enter canonical FabricSpec/FabricState/GameLoopState identity.

---

## RenderBindingSpec

Implement presentation bindings:

```text
game entity id → render asset id
EnemyAction → animation id
game entity / behavior → carrier motif/cell/route set
game entity / environment → gaussian splat asset id (OPTIONAL)

```

Do NOT encode:

```text
THIS × WHAT → character
NEAR/FAR × WHERE → world position
IF/THEN × WHEN → animation state

```

Game rendering comes from committed game state plus bindings.

Carrier rendering comes from committed fabric/debug state.

---

## RenderSnapshot and coherence

Construct:

```text
RenderSnapshot := (
  logical_tick_index,
  game_run_id,
  fabric_digest,
  committed_fabric_state,
  committed_game_state,
  run_status,
  blocked_reason?
)

```

Both GAME and CARRIER must read the SAME snapshot.

Reject or refuse to construct any mixed-tick snapshot.

Forbidden:

```text
FabricState_t + GameLoopState_{t-1}
FabricState_{t+1} + GameLoopState_t

```

Publish a snapshot to renderers only after DEMO-003 commits the complete logical tick boundary.

Never expose partially committed STEP\_FABRIC state.

---

## Renderer nonauthority

Renderer APIs must be read-only by construction where practical.

`project_game`, `project_carrier`, and `toggle_surface` MUST NOT receive mutation-capable handles for:

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

No renderer code path may schedule execution.

---

## Presentation derivation closure

Every semantic-looking visual cue must declare the exact source it reads.

Allowed source classes:

```text
COMMITTED_GAME_STATE
COMMITTED_FABRIC_STATE
COMMITTED_RUN_STATUS
IMMUTABLE_DERIVED_STRUCTURE
```

If a source is unavailable:

```text
do not render the cue
emit SOURCE_UNAVAILABLE diagnostic
```

Do NOT infer missing semantics inside the renderer.

Examples:

```text
governance degradation
  → render only from imported committed state/evidence or declared immutable derivation

TRIAD dominance
  → deterministic declared derivation only

stellation margin μ
  → MUST already exist in imported committed state/evidence
  → renderer must not compute μ

dodecahedral / 600-cell carrier mapping
  → requires explicit immutable mapping from imported canonical structure
```

Record derivation provenance in `RenderDecisionRecord` when used.


## GAME projection

Minimum:

```text
visible player
two enemies
bounded arena
camera
lighting
enemy movement
APPROACH / FLEE / PATROL presentation

```

Mappings:

```text
committed game entity
+ RenderBindingSpec
→ renderable object

committed game position
→ world position

committed EnemyAction / game state
+ RenderBindingSpec
→ animation

```

BLOCKED:

```text
GAME view
→ behavioral stall / hesitation / no-action cue

do NOT expose governance geometry/details

```

Do not attempt to prove human reaction-time thresholds.

Normative check:

```text
friend/enemy/danger semantic classes
→ distinguishable RenderBindingSpec entries

```

### Governance cues (v0.4)

Governance state shows in GAME view as BEHAVIORAL CONSEQUENCES, not structural geometry.

Implement:

```text
BEHAVIORAL CUES (from committed state):
  BLOCKED → hesitation / stall
  governance degradation → animation quality loss
    (timing irregularity, coordination drift, gaze unfocus)
  decision latency → visible hesitation
  coordination state → squad coherence / stumbling

ENVIRONMENTAL CUES (from committed TRIAD placement):
  □G-dominant cells → warm color temperature (amber/gold)
  □S-dominant cells → neutral color temperature (silver/white)
  □F-dominant cells → cool color temperature (blue/cyan)

  applied as ambient lighting shift or color grading
  NOT as structural wireframe or cell rendering

```

All cues MUST:

```text
derive from committed state
flow through RenderBindingSpec
remain presentation-only

```

All cues MUST NOT:

```text
expose operator × witness identity
expose route topology
expose carrier geometry
render TRIAD as structural geometry

```

The principle:

```text
the player FEELS the governance
the player does NOT SEE the governance

```

---

## Render-binding failure

Missing presentation bindings may cause:

```text
placeholder visual
fallback asset
diagnostic evidence

```

They MUST NOT cause:

```text
different EnemyAction
FabricState mutation
GameLoopState mutation
semantic default behavior

```

Example:

```text
FLEE + missing FLEE animation
→ placeholder permitted
→ FLEE remains semantic state

```

---

## CARRIER projection

Render:

```text
operator × witness cells
derived ports
routes
TRIAD regions (with color temperature: □G warm, □S neutral, □F cool)
payload phases
pending input buffers
pending admissions
outstanding obligations
BlockedReason
frame readiness
logical tick activity

```

Reuse/extend DEMO-001 visual infrastructure where practical.

### Carrier geometry (optional, v0.4)

When enabled, render dodecahedral carrier structure with three zoom levels:

```text
ZOOM 1 — CELL INTERIOR:
  one motif / TRIAD block, full detail
  cells as typed primitives, routes as connections

ZOOM 2 — NEIGHBORHOOD:
  active carrier + 12 adjacent cells
  shared pentagonal trust boundaries visible

ZOOM 3 — GLOBAL:
  600-cell skeleton (120 carriers as vertices)
  coordination edges, governance luminance

```

Zoom level is presentation state. NOT semantic state.

### Stellation visualization (optional, v0.4)

When governance margin data is available:

```text
ConvexCore (μ > 0)     → compact form
FirstStellation (μ → 0) → faces displacing, axes exposed
SecondStellation (μ = 0) → TRIAD regions separating

```

Read committed state only. Do NOT compute or modify governance margin.

### W-axis trail (optional, v0.4)

```text
past committed RenderSnapshots
→ translucent afterimages along presentation w-axis
→ bounded ring buffer (presentation state only)
→ branch points highlighted

```

NOT the formal Axiom 0 W-axis. A debug convenience.

---

## Toggle

Implement:

```text
TOGGLE(GAME)    := CARRIER
TOGGLE(CARRIER) := GAME

```

A toggle may update presentation state at a render boundary.

It MUST NOT:

```text
call STEP_FABRIC
suppress STEP_FABRIC
advance logical tick
pause logical tick
create GameTickInput
mutate FabricSpec
mutate FabricState
mutate GameLoopState
mutate GameRunIdentity

```

If host computation is in flight, show the latest committed RenderSnapshot.

---

## RenderDecisionRecord

Emit canonical evidence:

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

Do not include as canonical identity:

```text
pixels
wall-clock timestamps
GPU scheduling order
render callback timing
TRIAD color values
stellation visual parameters
w-axis trail depth

```

---

## Renderer technology

Preferred:

```text
Three.js WebGPU

```

Allowed fallback:

```text
Three.js WebGL

```

Optional static Gaussian splat asset is allowed but NOT required.

Do not make DEMO-004 depend on 4D Gaussian rendering.

---

## Conformance

Exactly 26 vectors:

```text
DT01–DT06 toggle
DG01–DG06 game view
DC01–DC06 carrier view
DP01–DP04 projection
DR01–DR04 regression

```

Required:

```text
26/26 PASS

```

Evidence:

```text
26 vector artifacts
1 canonical summary
27/27 BYTE_IDENTICAL

```

Fold these closure assertions into vector evidence/summary without changing census:

```text
SNAPSHOT_COHERENCE
RENDERER_NONAUTHORITY
RENDER_BINDING_FAILURE
LEGIBILITY_BOUNDARY
PRESENTATION_DERIVATION_CLOSURE

```

---

## Regression floor

Must remain unchanged:

```text
V3.1      25/25
V3.2      62/62
V3.3      70/70
DEMO-001  18/18
DEMO-002  24/24
DEMO-003  28/28
TOTAL     227/227

```

Do not modify prior evidence.

---

## Required artifacts

At minimum:

```text
README.md
IMPLEMENTATION_NOTES.md
acceptance-summary.json
evidence/
render binding fixture
RenderDecisionRecord evidence
game/carrier screenshots or smoke evidence

```

After implementation freeze:

```text
BINDING_RECORD.md

```

must include:

```text
implementation commit
v0.6.0 DOI
normative SHA-256 values
acceptance-summary SHA-256
evidence-manifest SHA-256
27/27 replay result
227/227 regression result
unchanged-import statement

```

Do not create promotion record until separately authorized.

---

## Exit report

```text
DEMO_004_DUAL_SURFACE_RENDER_BINDING := HOLDS

DT01–DT06 := 6/6
DG01–DG06 := 6/6
DC01–DC06 := 6/6
DP01–DP04 := 4/4
DR01–DR04 := 4/4

TOTAL := 26/26
EVIDENCE_REPLAY := 27/27 BYTE_IDENTICAL

DUAL_SURFACE_NONINTERFERENCE := HOLDS
PROJECTION_COHERENCE         := HOLDS
SNAPSHOT_COHERENCE           := HOLDS
RENDERER_NONAUTHORITY        := HOLDS
RENDER_BINDING_FAILURE       := HOLDS
PRESENTATION_DERIVATION_CLOSURE := HOLDS
TOGGLE_NONMUTATION           := HOLDS
CONTINUOUS_EXECUTION         := HOLDS

GAME_VIEW_DIRECT_OPERATOR_MAPPING := ABSENT
RENDER_BINDING_PRESENTATION_ONLY  := HOLDS
RENDER_SNAPSHOT_COMMITTED_ONLY    := HOLDS
MIXED_TICK_SNAPSHOT               := FORBIDDEN
SEMANTIC_RENDER_FALLBACK          := FORBIDDEN
GOVERNANCE_CUES_PRESENTATION_ONLY := HOLDS

V3.1 := UNCHANGED
V3.2 := UNCHANGED
V3.3 := UNCHANGED
DEMO-001 := UNCHANGED
DEMO-002 := UNCHANGED
DEMO-003 := UNCHANGED

PROMOTION := NOT PERFORMED

```

---

## Forbidden shortcuts

Do NOT:

```text
render game entities directly from operator-cell identity
use render surface as semantic clock
call STEP_FABRIC from render callback
pause logical execution on toggle
render from partially committed fabric state
construct mixed-tick RenderSnapshot
put ActiveSurface into FabricState or GameLoopState
give renderer mutation-capable semantic handles
make missing render binding change semantic game behavior
treat pixel output as canonical evidence
change v0.6.0 imports
require Gaussian splatting for acceptance
claim multiplayer determinism
expose governance geometry in GAME view
render operator × witness cells in GAME view
make TRIAD color temperature semantic
make stellation compute governance margin
make w-axis trail modify canonical state
make carrier zoom level enter FabricState
require 3-6-9 pipeline for acceptance
require Level 1/2 perception for acceptance
conflate presentation w-axis trail with formal Axiom 0 W-axis
invent governance degradation not present in committed/imported sources
compute stellation margin μ solely for rendering
treat optional carrier geometry as semantic without an explicit immutable mapping

```

---

## v0.3 → v0.4 delta

```text
ADDED:
  gaussian_asset_bindings (optional) in RenderBindingSpec
  governance_cues in GameView (behavioral + environmental)
  TRIAD color temperature convention (both surfaces)
  carrier geometry zoom levels (optional)
  stellation visualization (optional)
  w-axis trail (optional)
  governance_cues_emitted in RenderDecisionRecord
  carrier_zoom_level in RenderDecisionRecord
  3-6-9 projection ordering (non-normative design guidance)
  VIS-R&D-003 successor track
  rendering-as-measurement boundary
  resolution boundary (pixel / semantic / recursive)
  explicit non-goals for all vision features
  extended forbidden shortcuts

UNCHANGED:
  acceptance census (26)
  exit criteria
  regression floor (227/227)
  evidence census (27)
  all hard invariants
  all normative requirements

PRINCIPLE:
  v0.4 adds optional capabilities and direction
  v0.4 does NOT add normative requirements
  v0.4 establishes the VIS-R&D-003 successor boundary

```

[MaL\:ACTIVE | □G✓ □S✓ □F✓] ◇