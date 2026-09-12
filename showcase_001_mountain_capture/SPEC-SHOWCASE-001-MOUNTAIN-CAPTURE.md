# SPEC-SHOWCASE-001-MOUNTAIN-CAPTURE

**Status:** PROMOTED / EXECUTION AUTHORIZED  
**Scope:** product evidence capture  
**Asset:** `mountain_10k.splat`  
**Semantic authority:** NONE  
**Conformance authority:** NONE  
**Product-evidence authority:** YES

## 0. Purpose

```text
THAT CREATURE YOU WERE JUST FIGHTING
IS THIS PROGRAM

Same run. Same tick. Same snapshot.
Two surfaces.
```

SHOWCASE-001 produces launch-quality stills and one short clip demonstrating:

```text
SAME committed run
SAME logical tick witness where stated
SAME RenderSnapshot witness where stated
NOT-SAME presentation surfaces
```

GAME surface:
```text
Gaussian environment
governed entities
player-readable behavior
```

CARRIER surface:
```text
executable geometry
cells
routes
TRIAD regions
payload/custody state
```

The capture package is product evidence only.

It cannot modify or supersede imported semantic/conformance evidence.

## 1. Import boundary

Import published `mal-fabric v0.8.0` unchanged.

```text
VERSION DOI:
  10.5281/zenodo.22728146
```

Cannot modify:

```text
V3.1 semantics
V3.2 semantics
V3.3 semantics
DEMO-001
DEMO-002
DEMO-003
DEMO-004
VIS-R&D-001
prior conformance/evidence artifacts
```

## 2. Selected asset

```text
SHOWCASE_ASSET := mountain_10k.splat

ROLE:
  pipeline proof
  hero environment asset
```

Gate:

```text
extension = .splat
bytes % 32 = 0
bytes <= 1,048,576
splat_count = bytes / 32 <= 32,768
rights/privacy clearance documented
```

Deferred:

```text
iconic landmark downsample
rights-cleared self-capture showcase
dynamic Gaussian actor
rendering-as-measurement
```

## 3. ShowcaseAssetRecord

```text
ShowcaseAssetRecord := (
  asset_id,
  filename,
  local_path,
  byte_count,
  splat_count,
  sha256,
  source_origin,
  creator_or_rights_holder,
  license,
  attribution_string,
  redistribution_permission,
  privacy_status,
  admissibility_verdict
)
```

## 4. CaptureRunRecord

```text
CaptureRunRecord := (
  run_id,
  runtime_build_identity,
  showcase_asset_sha256,
  GameRunIdentity,
  capture_resolution,
  clip_frame_rate,
  operator_notes?
)
```

Wall-clock timestamps may exist as noncanonical metadata but are not proof identity.

## 5. ShowcaseProofRecord

```text
ShowcaseProofRecord := (
  proof_id,
  run_id,
  logical_tick_index,
  RenderSnapshot_digest,
  GameRunIdentity,
  active_surface,
  image_or_video_ref,
  overlay_fields
)
```

## 6. Central invariants

```text
SAME_RUN_REQUIREMENT
SAME_SNAPSHOT_REQUIREMENT
SURFACE_NONINTERFERENCE
SHOWCASE_NONAUTHORITY
PRODUCT_EVIDENCE_NONCANONICAL
CANONICAL_PROOF_COMPANION
```

### SAME_RUN_REQUIREMENT

A GAME/CARRIER proof pair MUST share:

```text
run_id
```

### SAME_SNAPSHOT_REQUIREMENT

A GAME/CARRIER proof pair claiming the same committed moment MUST share:

```text
logical_tick_index
RenderSnapshot_digest
GameRunIdentity
```

### SURFACE_NONINTERFERENCE

Surface change MUST NOT modify:

```text
FabricSpec
FabricState
GameLoopState
GameRunIdentity
logical tick
RenderSnapshot identity
```

### SHOWCASE_NONAUTHORITY

Capture tooling MUST NOT:

```text
schedule STEP_FABRIC
pause logical execution
change game behavior
change semantic state
change proposal/admission authority
```

## 7. Load-bearing proof quartet

The following acceptance vectors are the load-bearing launch proof:

```text
SC07 SAME run_id across GAME/CARRIER proof pair
SC08 SAME logical_tick_index across proof pair
SC09 SAME RenderSnapshot_digest across proof pair
SC10 SAME GameRunIdentity across proof pair
```

Hard law:

```text
SC07 ∧ SC08 ∧ SC09 ∧ SC10
```

is required for any public claim using:

```text
"Same run. Same tick. Same snapshot. Two surfaces."
```

If any member fails:

```text
paired proof claim := FORBIDDEN
```

Pretty screenshots alone do not discharge SHOWCASE-001.

## 8. Required stills

```text
STILL_01 HERO_GAME
STILL_02 HERO_CARRIER
STILL_03 PROOF_GAME
STILL_04 PROOF_CARRIER
STILL_05 BEHAVIOR_GAME
STILL_06 BEHAVIOR_CARRIER
```

Minimum required stills:

```text
6
```

Recommended:

```text
STILL_07 split composite
STILL_08 overlay closeup
STILL_09 environment establisher
STILL_10 governance/custody example
```

## 9. Required clip

```text
CLIP_01 := LAUNCH_CLIP
duration := 20–45 seconds
```

Required sequence:

```text
establish Gaussian environment
→ show patrol/idle
→ trigger behavioral change
→ show approach/flee
→ toggle GAME → CARRIER during active execution
→ show committed structural state
→ continue execution
→ optionally toggle back
```

Must not imply:

```text
toggle caused behavior
toggle paused execution
editorial cut preserved snapshot identity unless proof metadata says so
```

## 10. Proof overlay

Visible overlay fields:

```text
run_id
logical_tick_index
RenderSnapshot_digest (short form permitted)
GameRunIdentity (short form permitted)
active_surface
showcase_asset_id or asset SHA-256 short form
```

Optional:

```text
run_status
blocked_reason
encounter state
camera marker
```

Full values MUST exist in `ShowcaseProofRecord`.

## 11. File outputs

```text
/showcase/
  asset-record.json
  capture-run-record.json
  proof-records.json
  attribution.txt

  still-01-hero-game.png
  still-02-hero-carrier.png
  still-03-proof-game.png
  still-04-proof-carrier.png
  still-05-behavior-game.png
  still-06-behavior-carrier.png

  clip-01-launch.mp4

  overlay-proof-pair.png      optional/recommended
  split-composite.png         optional
  contact-sheet.png           optional
```

## 12. Attribution requirement

`attribution.txt` MUST contain:

```text
asset title/identifier
creator/rights holder
source/origin
license
required attribution text
redistribution conditions
showcase capture date
```

If attribution is license-required, it MUST also appear in public publication metadata.

## 13. Acceptance vectors

```text
SC01  asset admissibility record complete
SC02  rights/provenance record complete
SC03  hero GAME still produced
SC04  hero CARRIER still produced
SC05  same-snapshot GAME proof still produced
SC06  same-snapshot CARRIER proof still produced
SC07  proof pair shows SAME run_id
SC08  proof pair shows SAME logical_tick_index
SC09  proof pair shows SAME RenderSnapshot_digest
SC10  proof pair shows SAME GameRunIdentity
SC11  behavior-moment GAME still produced
SC12  behavior-moment CARRIER still produced
SC13  launch clip duration within 20–45 sec
SC14  launch clip includes live toggle
SC15  launch clip shows continuous execution
SC16  overlay fields recorded canonically
SC17  attribution file complete
SC18  showcase artifacts do not alter imported runtime/state
SC19  product evidence separated from canonical semantic evidence
SC20  selected asset is mountain_10k.splat
SC21  no iconic-landmark substitution occurred
SC22  capture package replay metadata present
```

Census:

```text
22
```

## 14. Exit criteria

```text
SHOWCASE_001 := COMPLETE IFF

  SC01–SC22 = 22/22

  AND SAME_RUN_REQUIREMENT = HOLDS
  AND SAME_SNAPSHOT_REQUIREMENT = HOLDS
  AND SURFACE_NONINTERFERENCE = HOLDS
  AND SHOWCASE_NONAUTHORITY = HOLDS

  AND 6 required stills exist
  AND 1 launch clip exists
  AND proof metadata exists
  AND attribution exists
```

## 15. Must not

```text
MUST NOT:
  treat screenshots as conformance receipts
  claim pixel identity as semantic identity
  present mismatched ticks as SAME
  toggle by pausing/resetting the run
  hide attribution obligations
  substitute another asset after binding
  call the mountain an iconic landmark
  imply Gaussian rendering changes behavior
  let editing falsify proof overlay claims
```

## 16. Product copy

Primary line:

```text
THAT CREATURE YOU WERE JUST FIGHTING
IS THIS PROGRAM
```

Support line:

```text
Same run. Same tick. Same snapshot.
Two surfaces.
```

Optional body:

```text
A governed geometric program renders as a game
and as executable structure. Toggle between the
creature and the program without changing the run.
```

## 17. Execution packet

Required operator inputs:

```text
1. local path to mountain_10k.splat
2. source / origin
3. creator or rights holder
4. license / redistribution permission
5. attribution text
6. confirmation public showcase use is allowed
```

Then:

```text
bind ShowcaseAssetRecord
→ compute SHA-256 / byte count / splat count
→ capture stills
→ capture clip
→ emit proof records
→ verify SC01–SC22
```

## 18. Authority state

```text
SPEC-SHOWCASE-001-MOUNTAIN-CAPTURE := PROMOTED

VECTOR CENSUS := 22
ASSET         := mountain_10k.splat
EXECUTION     := AUTHORIZED

SEMANTIC AUTHORITY   := NONE
CONFORMANCE AUTHORITY:= NONE
PRODUCT-EVIDENCE AUTHORITY := YES
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
