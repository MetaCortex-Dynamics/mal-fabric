# MaL Fabric v0.7.0 Archive Replay

```text
record_id: MAL-FABRIC-V0.7.0-ZENODO-REPLAY-001
verification_date: 2026-09-12
result: HOLDS

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.7.0

release_commit:
  6560da66a538241539955fa5f8b6abad11d22598

upstream_promotion_commit:
  c023fb62ba229d023aca013783725d7f55111529

zenodo_record:
  https://zenodo.org/records/22727508

software_version_doi:
  10.5281/zenodo.22727508

software_concept_doi:
  10.5281/zenodo.22678127

archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.7.0.zip

archive_size_bytes:
  482927

archive_md5:
  013E1C4B3C56B5737C93985A5FC711E4

archive_sha256:
  32E905DB6F7E952CC5C9983406E4C333BC6BADEE0391FE03AB16D60BCCEF3EF3
```

The archive was downloaded directly from Zenodo, extracted into a fresh
directory, and executed without using the publication working tree. Every
suite was run twice into independent output trees and compared against the
evidence embedded in the archive.

```text
V3.1 run A/B:             25/25
V3.1 evidence:            26/26 byte-identical

V3.2 run A/B:             62/62
V3.2 evidence:            63/63 byte-identical

V3.3 run A/B:             70/70
V3.3 evidence:            71/71 byte-identical

DEMO-001 run A/B:         18/18
DEMO-001 evidence:         1/1 byte-identical

DEMO-002 run A/B:         24/24
DEMO-002 evidence:        25/25 byte-identical

DEMO-003 run A/B:         28/28
DEMO-003 evidence:        29/29 byte-identical

DEMO-004 run A/B:         26/26
DEMO-004 evidence:        27/27 byte-identical

total conformance:       253/253
total evidence:          242/242 byte-identical
published JSON parse:    282/282
DEMO-004 HTTP smoke:     PASS
```

The established predecessor evidence (`215/215`) was reproduced under the
Windows reference environment used for its prior archive closure. GitHub's
archive contains the DEMO-004 JSON evidence with LF line endings; DEMO-004 was
therefore additionally replayed under Ubuntu 24.04 / Python 3.12.3, where all
`27/27` regenerated artifacts matched the archived bytes exactly. A Windows
DEMO-004 replay produced identical semantic JSON and mutually byte-identical
receipts with CRLF line endings; this platform newline normalization was the
only archive-byte difference observed.

The archived HTTP flow passed state retrieval, GAME-to-CARRIER toggle, and one
logical tick. The toggle preserved the committed semantic/run digests while
changing presentation only. Both surfaces retained the same committed
`RenderSnapshot` identity.

This receipt verifies the archived V3.1 static, V3.2 admission, V3.3
execution, DEMO-001 visible-fabric, DEMO-002 vibe-proposer, DEMO-003 game-loop,
and DEMO-004 dual-surface render-binding surfaces. It does not claim that
framebuffer pixels, platform newline conventions, wall-clock timing, GPU
ordering, multiplayer, network, or physics-engine behavior are canonical.
