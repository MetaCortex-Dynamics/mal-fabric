# PROMOTION_RECORD_VIS_RD_001_SPEC.md

SPEC-VIS-RD-001-GAUSSIAN-SPLAT-RENDER-PRIMITIVE v0.3 := PROMOTED

## Bound authority artifacts

SPEC:
  SPEC-VIS-RD-001-GAUSSIAN-SPLAT-RENDER-PRIMITIVE_v0.3.md

SPEC_SHA256:
  2BFAE9DF042714FF7F5BC701F9F50E8A5B9FDB1139DA8CE6788D0C3731E50A20

HANDOFF:
  CODEX_HANDOFF_VIS_RD_001_GAUSSIAN_SPLAT_RENDER_PRIMITIVE_v0.3.md

HANDOFF_SHA256:
  976E0AD2208AC62A544740A86BE74FAA06049E93B51A5F0AA49CB49A59D5768C

## Import boundary

mal-fabric v0.7.0 := IMMUTABLE IMPORT

VERSION_DOI:
  10.5281/zenodo.22727508

CONCEPT_DOI:
  10.5281/zenodo.22678127

PRIOR_CONFORMANCE_FLOOR:
  253/253

PRIOR_EVIDENCE_FLOOR:
  242/242 BYTE_IDENTICAL

## Normative burden

VECTOR_CENSUS:
  24

EVIDENCE_TARGET:
  25/25 BYTE_IDENTICAL

CLASSES:
  A01–A06 asset identity/provenance
  R01–R06 render integration
  N01–N06 noninterference
  F01–F04 failure/fallback
  P01–P02 product/performance boundary

## Hard invariants

GAUSSIAN_PRESENTATION_NONINTERFERENCE := REQUIRED
ASSET_SUBSTITUTION_SEMANTIC_INVARIANCE := REQUIRED
RENDERER_NONAUTHORITY := REQUIRED
SPLAT_SORT_NONSEMANTIC := REQUIRED
VIEW_DEPENDENT_COLOR_NONSEMANTIC := REQUIRED
FALLBACK_SEMANTIC_INVARIANCE := REQUIRED
PIXEL_NONCANONICAL := REQUIRED

## Corpus grounding

RENDERER_NONAUTHORITY
  := instance of witness readout noninvasiveness

PIXEL_NONCANONICAL
  := grounded in projection/readout separation

GaussianRenderDecision
  := instance of readout evidence pattern

Gaussian ↔ dodecahedral carrier semantics
  := PROSPECTIVE ONLY
  := DEFERRED TO VIS-R&D-003

## Product-evidence boundary

REAL_WORLD_GAUSSIAN_SHOWCASE := PERMITTED
SHOWCASE_FIXTURE := NON-NORMATIVE
CONFORMANCE_FIXTURE := LOCAL + CONTENT_ADDRESSED + DETERMINISTIC

Product still/video may demonstrate:

  GAME view
  ↔ CARRIER view

with:

  same logical tick
  same GameRunIdentity
  same RenderSnapshot digest

but cannot alter conformance requirements.

## Decision

DECISION := ALLOW

PROMOTION := GRANTED

BUILD := AUTHORIZED

## Promotion scope

This promotion authorizes implementation of VIS-R&D-001 only.

It does NOT promote:
  any implementation
  any binding record
  VIS-R&D-002
  VIS-R&D-003
  dynamic/4D Gaussian semantics
  rendering-as-measurement

## Next lifecycle

IMPLEMENT
→ VERIFY 24/24
→ REPLAY 25/25 BYTE_IDENTICAL
→ REGRESSION 253/253 unchanged
→ VERIFY prior 242/242 evidence unchanged
→ BIND
→ separate implementation promotion decision

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
