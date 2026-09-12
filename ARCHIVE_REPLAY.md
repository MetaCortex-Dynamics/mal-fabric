# MaL Fabric v0.8.0 Archive Replay

```text
record_id: MAL-FABRIC-V0.8.0-ZENODO-REPLAY-001
verification_date: 2026-09-12
result: HOLDS

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.8.0

release_commit:
  cd226590ba0eaba06010361662bf9b2219dd43db

upstream_promotion_commit:
  8fecb46c0ca55279a5c843a15404709ed50fd9f3

zenodo_record:
  https://zenodo.org/records/22728146

software_version_doi:
  10.5281/zenodo.22728146

software_concept_doi:
  10.5281/zenodo.22678127

archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.8.0.zip

archive_size_bytes:
  1069845

archive_md5:
  32F58CA46059624C34EA4AE8820B3303

archive_sha256:
  3ECF9FB2B0D870A1ACD6E2C2FC868767426882F2758FF22FD95B4C4B4EC5B5C2
```

The archive was downloaded directly from Zenodo and extracted into a fresh
directory outside the publication working tree. The complete predecessor
regression and VIS-R&D-001 suite were executed from that extraction.

```text
V3.1:                    25/25
V3.2:                    62/62
V3.3:                    70/70
DEMO-001:                18/18
DEMO-002:                24/24
DEMO-003:                28/28
DEMO-004:                26/26
VIS-R&D-001:             24/24
--------------------------------
total conformance:      277/277

predecessor evidence:  242/242 byte-identical to v0.7.0 archive
VIS-R&D-001 evidence:    25/25 replay A/B and archive byte-identical
total evidence:         267/267 byte-identical
published JSON parse:  313/313
archive HTTP smoke:      PASS
archive browser load:    PASS
```

The inherited 242 evidence artifacts were compared path-for-path and
byte-for-byte with the sealed v0.7.0 Zenodo archive. VIS-R&D-001 generated two
independent 25-artifact replays; both matched each other and the evidence in
the v0.8.0 archive exactly.

The established platform-newline boundary remains explicit. DEMO-004's bound
acceptance identity is Windows-native, while GitHub stores LF-normalized JSON
in its archive. The archived predecessor suite was therefore materialized in
its recorded Windows reference environment before VIS-R&D-001 import
verification. The resulting DEMO-004 acceptance SHA-256 was the bound value:

```text
50BB725920F17B5BA5565A8BC37F5E2A301B4BD8FE173F7C399AA5B2ECDDC275
```

VIS-R&D-001 writes canonical evidence with explicit LF endings, so its 25
regenerated artifacts are byte-identical across the replay and archived
surfaces.

The archived fixture and kernel retained their promoted identities:

```text
Gaussian fixture size:    6144 bytes
Gaussian fixture SHA-256: 6AEB775435810389BC47D15F02E3D545E09DED2760E8A15E76DE71D89D55D143
Gaussian kernel SHA-256:  2C760D7BBFC0466DAC8021AEBC3D8704DC6A33D3776F9FFFB708491FF9FE07A9
```

The HTTP replay returned `200` for the application shell, committed state,
render projection, asset descriptor, and 6,144-byte splat fixture. A fresh
headless browser loaded the archived visual surface. The browser screenshot is
diagnostic product evidence only and is not part of canonical identity.

The semantic trace is identical for conventional, Gaussian, and fallback
assets. Pixel identity is neither required nor claimed. This receipt does not
add dynamic or deforming Gaussian actors, 4D temporal evolution, runtime
Gaussian training, rendering-as-measurement, collision truth, navigation
truth, or AI-perception truth.
