# MaL Fabric v0.3.0 Archive Replay

```text
record_id: MAL-FABRIC-V0.3.0-ZENODO-REPLAY-001
verification_date: 2026-09-11
result: HOLDS

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.3.0

release_commit:
  dfe4f37dc9e90ea0141422c27f69d8d8a1c5d363

zenodo_record:
  https://zenodo.org/records/22713736

software_version_doi:
  10.5281/zenodo.22713736

software_concept_doi:
  10.5281/zenodo.22678127

archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.3.0.zip

archive_size_bytes:
  258835

archive_md5:
  EA6F9B38EF02574253212B4091273853
```

The archive was downloaded from the Zenodo record, extracted into a fresh
directory, and executed without using the publication working tree. Each
suite was run twice into separate output trees. Both regenerated trees were
then compared with each other and with the evidence embedded in the archive.

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

layer evidence:          160/160 byte-identical
published JSON parse:    186/186
process replay:          byte-identical
```

The JSON census includes the 160 layer-specific artifacts and 26 retained
top-level V3.1 compatibility artifacts. This receipt verifies the archived
V3.1 static, V3.2 admission, and V3.3 execution surfaces. The V3.3 claim is
limited to fixed-geometry `CLOSED_RUN` semantics over `ValidHostSchedule`.
It does not claim self-modifying geometry, an external stimulus API, or
scheduler independence outside that validity domain.
