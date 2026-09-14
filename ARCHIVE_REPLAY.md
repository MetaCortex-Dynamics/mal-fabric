# MaL Fabric v0.11.0 Archive Replay

```text
record_id: MAL-FABRIC-V0.11.0-ZENODO-REPLAY-001
verification_date: 2026-09-13
result: HOLDS

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.11.0

release_commit:
  f53ebb2964904c761322ca308cdaba5b145efaea

release_tag_object:
  9afa4d9d8269d38b6d825bc9b85f1325f39f755d

upstream_cgp_world_promotion_commit:
  dd5025176cf9902d6028d11b2929baf0b19c8112

zenodo_record:
  https://zenodo.org/records/22739341

software_version_doi:
  10.5281/zenodo.22739341

software_concept_doi:
  10.5281/zenodo.22678127

archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.11.0.zip

archive_size_bytes:
  8539764

archive_md5:
  E06A0E0F6A6C43067ABA7D4C9EEB3514

archive_sha256:
  6F17ADA61F3DF8AFAA6D63E46ECA62AEF742BF68F8C9B2C754F1AAE675A6C289
```

The archive was downloaded directly from Zenodo and extracted into a fresh
disposable replay workspace outside the publication working tree. The
inherited DEMO-004 Windows-native evidence was materialized exactly as stated
in `ARCHIVE_REPLAY_PREFLIGHT_v0.11.0.md` before execution.

```text
v0.10.0 public floor:       335/335
ASCII-GEN0 player agency:    16/16
ASCII-ENV-001:               15/15
CGP-WORLD-001:               44/44
-----------------------------------
total conformance:          410/410

v0.10.0 evidence floor:     304/304 BYTE_IDENTICAL
ASCII-GEN0 evidence:          17/17 BYTE_IDENTICAL
ASCII-ENV-001 evidence:       16/16 BYTE_IDENTICAL
CGP-WORLD-001 evidence:       45/45 BYTE_IDENTICAL
-----------------------------------
total evidence:             382/382 BYTE_IDENTICAL

published JSON parse:       465/465
product-stage files:          17/17 VERIFIED
```

CGP-WORLD-001 retained its promoted identities and commitments after archive
extraction and replay:

```text
spec SHA-256:
  7F3F784F0BACED1F0D6521B78123DE9FCE88242466B19B73E47AD1B01B2B0788

implementation commit:
  307da4fc32c318ad7e5a8160ccfee1bee8496b2d

binding commit:
  f2154c8bd6d6cb1682b3d76b3f20a44109a87287

promotion commit:
  dd5025176cf9902d6028d11b2929baf0b19c8112

numeric domain:
  Q32.32

measurement normalization:
  EXP_NEG_Q32_TAYLOR18_LN2_REDUCTION_V1

consistency predicate:
  OUTCOME_DISTANCE_LE_ONE_V1

presentation authority:
  NONE
```

The separately imported browser beauty pass matched all 17 hashes in
`PRODUCT_STAGE_MANIFEST.json`. It remains `PRODUCT_STAGE`, noncanonical,
unpromoted, and excluded from both normative totals.

O5 remains `WITNESSED, NOT DISCHARGED`: this release supplies one bounded
constructive realization and does not claim the general unified-law theorem.
