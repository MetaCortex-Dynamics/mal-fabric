# MaL Fabric v0.5.0 Archive Replay

```text
record_id: MAL-FABRIC-V0.5.0-ZENODO-REPLAY-001
verification_date: 2026-09-12
result: HOLDS

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.5.0

release_commit:
  742ffb4837b0a4055e8b142822c8bffc7c50a7f3

upstream_promotion_commit:
  fb0e1c3ec6a8695c8fcc0de21a8b5ccbbae5b53f

zenodo_record:
  https://zenodo.org/records/22725249

software_version_doi:
  10.5281/zenodo.22725249

software_concept_doi:
  10.5281/zenodo.22678127

archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.5.0.zip

archive_size_bytes:
  353549

archive_md5:
  4F0DEF00E659430D0934055FABCFC2F6

archive_sha256:
  B9962C35A66E8B49C8DAF54489638C3C9A51926376F8718403D7DBD6187BDD0E
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
DEMO-002 HTTP smoke:     PASS on 127.0.0.1:8766

total conformance:      199/199
substrate evidence:     160/160 byte-identical
DEMO-001 evidence:        1/1 byte-identical
DEMO-002 evidence:       25/25 byte-identical
total evidence:         186/186 byte-identical
published JSON parse:   217/217
```

The DEMO-002 archive preserved the normative P01-P06, G01-G05, D01-D06,
A01-A05, and N01-N02 census. G01 remained closed over the imported edit
algebra by tracing an added route to `CONNECT`; no cell-creation constructor
was introduced.

The archived HTTP flow passed through state retrieval, deterministic intent
proposal, visible geometric diff, explicit user acceptance for admission,
governed commit, V3.3 start, and a runtime tick. `ACCEPT` remained submission
authorization only. The proposer had no direct commit authority, and pending
proposal execution remained forbidden.

This receipt verifies the archived V3.1 static, V3.2 admission, V3.3
execution, DEMO-001 visible-fabric, and DEMO-002 vibe-proposer surfaces. It
does not claim arbitrary-language completeness, self-modifying geometry, cell
creation outside V3.1, an external stimulus API, or scheduler independence
outside `ValidHostSchedule`.
