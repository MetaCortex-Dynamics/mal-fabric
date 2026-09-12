# SHOWCASE-001 Mountain Asset Input

## Exact local destination

```text
C:\Dev\mal_kernel_lab_repo\v3\software_fpga\showcase_001_mountain_capture\assets\mountain_10k.splat
```

Run `fetch_showcase_mountain.ps1` to download and verify the exact bytes.

## Bound source

```text
repository:
  marcelpadilla/splats

source commit:
  ac7f3850ceadbc0483d10c9f0b597c2ba5e89009

source file:
  data/mountain/mountain_10k.splat

source metadata:
  data/mountain/meta.json
```

## Expected immutable identity

```text
format:
  SPLAT_FIXED_WIDTH_32

byte_count:
  320000

splat_count:
  10000

SHA-256:
  ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41

gate:
  extension .splat        PASS
  bytes % 32 = 0          PASS
  bytes <= 1048576        PASS
  splats <= 32768         PASS
```

## Rights / provenance

```text
title:
  Mountain

source method:
  mesh2splat

original mesh author:
  lastloginname

license:
  CC-BY-4.0

commercial use:
  permitted with attribution

redistribution:
  permitted under CC-BY-4.0 terms

required attribution:
  “Mountain” mesh by lastloginname, via odedstein-meshes
  (https://github.com/odedstein/meshes), licensed CC-BY-4.0.

source mesh chain:
  odedstein-meshes:
    https://github.com/odedstein/meshes/tree/master/objects/mountain

  originally:
    lastloginname via Thingiverse
    https://www.thingiverse.com/thing:991578

privacy / model release:
  NOT APPLICABLE
  (mesh-derived asset; not a capture containing identifiable people)
```

## Important product-copy correction

This asset is **not a photographic real-world Gaussian capture**.

The source metadata states that it is a direct mesh-to-splat conversion:

```text
area-uniform surface sampling
→ disk Gaussians
→ smooth normals
→ baked Lambert shading
```

It also states:

```text
no photography
no COLMAP
no training
no spherical harmonics
```

Therefore SHOWCASE-001 may accurately call it:

```text
Gaussian mountain environment
volumetric terrain
Gaussian-splat terrain
```

It should **not** call it:

```text
captured real mountain
photorealistic scan of a real place
real-world capture
captured lighting
```

This provenance correction does not affect the authorized 22-vector SHOWCASE-001 capture contract.

## ShowcaseAssetRecord values

```text
asset_id:
  mountain_10k

filename:
  mountain_10k.splat

creator_or_rights_holder:
  original mesh author: lastloginname

license:
  CC-BY-4.0

redistribution_permission:
  YES, subject to CC-BY-4.0 attribution

privacy_status:
  NOT_APPLICABLE

admissibility_verdict:
  PASS, conditional on exact local SHA-256 match
```
