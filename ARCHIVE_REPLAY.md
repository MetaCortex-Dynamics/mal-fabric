# MaL Fabric v0.4.0 Archive Replay

```text
record_id: MAL-FABRIC-V0.4.0-ZENODO-REPLAY-001
verification_date: 2026-09-11
result: HOLDS

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.4.0

release_commit:
  fb7376da2bdc40a407023bc835a9d8f5bf7530ea

zenodo_record:
  https://zenodo.org/records/22718622

software_version_doi:
  10.5281/zenodo.22718622

software_concept_doi:
  10.5281/zenodo.22678127

archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.4.0.zip

archive_size_bytes:
  295056

archive_md5:
  17458240410DFB5E3CDFA86E681AE38D

archive_sha256:
  7C9F523BBA74B64ABE84C4438CB10E5F2EB601187AC83E1D0312C8B27A45A2E2
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

DEMO-001 run A:          18/18
DEMO-001 run B:          18/18
DEMO A/B acceptance:     1/1 byte-identical
DEMO A/archive receipt:  1/1 byte-identical
DEMO HTTP smoke:         PASS

total conformance:       175/175
layer evidence:          160/160 byte-identical
demo evidence:             1/1 byte-identical
published JSON parse:    189/189
```

The JSON census includes the 160 layer-specific artifacts, 26 retained
top-level V3.1 compatibility artifacts, and three DEMO-001/publication JSON
artifacts. The archived HTTP flow passed through state retrieval, natural-
language proposal, explicit user-authority acceptance, V3.3 start, and a
runtime tick. The natural-language surface remained `PROPOSER_ONLY`.

This receipt verifies the archived V3.1 static, V3.2 admission, V3.3
execution, and DEMO-001 visible-fabric surfaces. The V3.3 claim remains
limited to fixed-geometry `CLOSED_RUN` semantics over `ValidHostSchedule`.
It does not claim self-modifying geometry, an external stimulus API, or
scheduler independence outside that validity domain.
