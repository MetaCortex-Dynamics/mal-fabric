# MaL Fabric v0.6.0 Archive Replay

```text
record_id: MAL-FABRIC-V0.6.0-ZENODO-REPLAY-001
verification_date: 2026-09-12
result: HOLDS

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.6.0

release_commit:
  1c13c27c06562f532418d2b7c1295efb399aadc3

upstream_promotion_commit:
  48a67514b60c5e1f2e428e787c90c4f8884c695b

zenodo_record:
  https://zenodo.org/records/22726846

software_version_doi:
  10.5281/zenodo.22726846

software_concept_doi:
  10.5281/zenodo.22678127

archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.6.0.zip

archive_size_bytes:
  417520

archive_md5:
  DDD4B2AB736B8D85E38F31A81B41BE6E

archive_sha256:
  0E931986590E23A2226032077AEFE15BA147169EA16EF21141A886471698FBD7
```

The archive was downloaded from the Zenodo record, extracted into a fresh
directory, and executed without using the publication working tree. Each
suite was run twice into separate output trees. Every regenerated artifact was
compared both between runs and against the evidence embedded in the archive.

```text
V3.1 run A:              25/25
V3.1 run B:              25/25
V3.1 A/B evidence:       26/26 byte-identical
V3.1 A/archive evidence: 26/26 byte-identical

V3.2 run A:              62/62
V3.2 run B:              62/62
V3.2 A/B evidence:       63/63 byte-identical
V3.2 A/archive evidence: 63/63 byte-identical

V3.3 run A:              70/70
V3.3 run B:              70/70
V3.3 A/B evidence:       71/71 byte-identical
V3.3 A/archive evidence: 71/71 byte-identical

DEMO-001 run A:          18/18
DEMO-001 run B:          18/18
DEMO-001 A/B receipt:     1/1 byte-identical
DEMO-001 A/archive:       1/1 byte-identical

DEMO-002 run A:          24/24
DEMO-002 run B:          24/24
DEMO-002 A/B evidence:   25/25 byte-identical
DEMO-002 A/archive:      25/25 byte-identical

DEMO-003 run A:          28/28
DEMO-003 run B:          28/28
DEMO-003 A/B evidence:   29/29 byte-identical
DEMO-003 A/archive:      29/29 byte-identical
DEMO-003 summary:        byte-identical
DEMO-003 replay trace:   byte-identical
DEMO-003 HTTP smoke:     PASS

total conformance:      227/227
substrate evidence:     160/160 byte-identical
DEMO-001 evidence:        1/1 byte-identical
DEMO-002 evidence:       25/25 byte-identical
DEMO-003 evidence:       29/29 byte-identical
total evidence:         215/215 byte-identical
published JSON parse:   250/250
```

The DEMO-003 archive preserved the normative B01-B06, T01-T08, D01-D06,
N01-N04, and U01-U04 census. Its twelve-tick replay trace was unchanged under
the reversed valid host schedule and altered render cadence.

The archived HTTP flow passed through state retrieval, a presentation-only
render callback, one logical tick with exactly one fabric step, a visible
pending proposal that did not affect the active run, and canonical twelve-tick
fixture replay.

This receipt verifies the archived V3.1 static, V3.2 admission, V3.3
execution, DEMO-001 visible-fabric, DEMO-002 vibe-proposer, and DEMO-003
game-loop surfaces. It does not claim multiplayer, network, physics-engine,
wall-clock, or arbitrary real-time input determinism.
