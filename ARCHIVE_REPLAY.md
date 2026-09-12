# MaL Fabric v0.9.0 Archive Replay

```text
record_id: MAL-FABRIC-V0.9.0-ZENODO-REPLAY-001
verification_date: 2026-09-12
result: HOLDS

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.9.0

release_commit:
  19eeb77109d22a1d4a5842879ddd61fb84240ba0

upstream_promotion_commit:
  14b70ababc5930f188545b6ba1fdb5c3c40ee93e

zenodo_record:
  https://zenodo.org/records/22729949

software_version_doi:
  10.5281/zenodo.22729949

software_concept_doi:
  10.5281/zenodo.22678127

archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.9.0.zip

archive_size_bytes:
  6300239

archive_md5:
  C30781FD80A735876633A105C8FFD77B

archive_sha256:
  D924CEB0D61D3ABC98BE14F237DB08BEC61E69BBB4733A47045CF14385BB7AC5
```

The archive was downloaded directly from Zenodo and extracted into a fresh
disposable replay workspace outside the publication working tree.

```text
V3.1:                    25/25
V3.2:                    62/62
V3.3:                    70/70
DEMO-001:                18/18
DEMO-002:                24/24
DEMO-003:                28/28
DEMO-004:                26/26
VIS-R&D-001:             24/24
SHOWCASE-001:            22/22
--------------------------------
total:                  299/299

predecessor evidence:  267/267 unchanged
VIS-R&D-001 evidence:    25/25 byte-identical replay/archive
SHOWCASE proof quartet:   4/4 HOLDS
SHOWCASE required stills: 6/6
published JSON parse:   341/341
archive HTTP smoke:       PASS
archive browser load:     PASS
native Gaussian asset:  LOADED
```

The v0.8.0 predecessor trees are byte-identical at the Git-object layer between
the v0.8.0 and v0.9.0 tags. The 25 VIS-R&D-001 evidence artifacts regenerated
byte-for-byte and matched the archive.

The established platform-newline boundary remains explicit. DEMO-004's bound
acceptance identity is Windows-native, while GitHub stores LF-normalized JSON
in its archive. Before VIS-R&D-001 verification, that one predecessor artifact
was deterministically materialized with CRLF endings in the disposable replay
workspace. Its resulting SHA-256 matched the bound Windows identity:

```text
50BB725920F17B5BA5565A8BC37F5E2A301B4BD8FE173F7C399AA5B2ECDDC275
```

SHOWCASE-001 retained its bound identities after replay:

```text
mountain asset SHA-256:
  ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41

acceptance summary SHA-256:
  CB1E97531861992135FB0D9FEA3258C725EE7771E86198D33328B102A6E7A588

capture manifest SHA-256:
  D4F927C4268BFC528292ADFACE9C729E21AC0F3FCDAAFDA3AFD802EEC287E8A3

proof records SHA-256:
  7D7A24BDC4C5AE8042E3A6819C10D87075D05B2D52EA3F0D18289951EB6B268D

launch clip SHA-256:
  35E92C49EFF9F96930155375C24A2C963ABEECB724034F61D7824CDB7F18DDEE

required stills:
  6/6

proof quartet:
  SC07 SAME run_id = HOLDS
  SC08 SAME logical_tick_index = HOLDS
  SC09 SAME RenderSnapshot = HOLDS
  SC10 SAME GameRunIdentity = HOLDS
```

The archive browser returned HTTP 200, loaded `mountain_10k.splat` through the
native Gaussian path, and rendered GAME successfully. The asset is
mesh-derived Gaussian terrain distributed under CC-BY-4.0 with attribution;
it is not a photographic capture of a real mountain. The asset, stills, clip,
pixels, camera, and renderer remain noncanonical product evidence with no
semantic, conformance, or execution authority.
