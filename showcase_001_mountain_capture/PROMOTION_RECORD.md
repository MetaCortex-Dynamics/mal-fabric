# SHOWCASE-001 Mountain Capture Promotion Record

```text
SHOWCASE_001_MOUNTAIN_CAPTURE := PROMOTED

PROMOTION_DECISION:
  ALLOW

IMPLEMENTATION_COMMIT:
  667d8513a4b9f72642d770055c42f6c8fcff6f7c

BINDING_COMMIT:
  970f2b0ad954bb8370964dcbc05be4f1e3074bf7

BINDING_RECORD_SHA256:
  4C97FC59C6963F5D018D270CE4850EDFD314143F2237EB430A6E9DEA13D15167
```

## Imported authority

```text
IMPORTED_RELEASE:
  mal-fabric v0.8.0
  VERSION DOI 10.5281/zenodo.22728146
  DOI-BINDING COMMIT 5e38d23a90623c19e608fcdb00db85ad37b378f8
  IMPORT STATE UNCHANGED
```

## Closure evidence

```text
SC01-SC22       := 22/22
REQUIRED_STILLS := 6/6
LAUNCH_CLIP     := 44.0s
PROOF_QUARTET   := HOLDS
JSON_PARSE      := 28/28
HTTP_BROWSER    := PASS

PRIOR_CONFORMANCE := 277/277 UNCHANGED
PRIOR_EVIDENCE    := 267/267 UNCHANGED

ASSET_HASH     := UNCHANGED
CLIP_HASH      := UNCHANGED
BOUND_HASHES   := UNCHANGED
SCOPED_TREE    := CLEAN
```

## Promoted product claim

```text
SC07 SAME run_id             := HOLDS
SC08 SAME logical_tick_index := HOLDS
SC09 SAME RenderSnapshot     := HOLDS
SC10 SAME GameRunIdentity    := HOLDS
```

Therefore the GAME and CARRIER proof surfaces are bound to the same run, the
same logical tick, the same committed render snapshot, and the same game-run
identity.

## Asset and authority boundary

```text
MOUNTAIN_ASSET:
  mesh-derived Gaussian terrain
  source mesh author: lastloginname
  license: CC-BY-4.0
  redistribution: permitted with attribution
  NOT a photographic real-world capture

PRODUCT_EVIDENCE:
  six required stills
  one 44.0-second launch clip
  canonical: NO
  semantic authority: NONE
  conformance authority: NONE
```

The asset, renderer, stills, clip, pixels, camera, and presentation surface
cannot modify `FabricSpec`, `FabricState`, `GameLoopState`, logical tick,
`RenderSnapshot`, or `GameRunIdentity`.

## Promotion scope

```text
PROMOTION_DELTA := PROMOTION_RECORD.md ONLY
```

No implementation, evidence, media, asset, attribution, binding, or imported
mal-fabric artifact is modified by this promotion.

## Post-promotion state

```text
TECHNICAL_EVIDENCE := CLOSED
PRODUCT_EVIDENCE   := CLOSED
ARTIFACT_IDENTITY  := CLOSED
BINDING            := CLOSED
PROMOTION          := CLOSED
PUBLICATION        := OPEN
```
