# MaL Fabric v0.2.0

[![Release DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22711890.svg)](https://doi.org/10.5281/zenodo.22711890) [![Concept DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.22678127-blue)](https://doi.org/10.5281/zenodo.22678127) [![Paper DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.22677712-blue)](https://doi.org/10.5281/zenodo.22677712)

MaL Fabric defines deterministic canonical static semantics and governed
admission for a MaL-native software-FPGA fabric. Version 0.2.0 preserves the
sealed V3.1 static kernel and adds the promoted V3.2 admission pipeline,
directed TRIAD-crossing governance, pairwise placement metrics, repair fibers,
extended DRC, lifecycle management, and deterministic admission evidence.

## Conformance

```text
V3.1 static kernel
  conformance          25/25
  evidence determinism 26/26

V3.2 admission kernel
  positive             10/10
  negative             22/22
  quantitative          4/4
  crossing              8/8
  repair                8/8
  lifecycle             8/8
  confluence            2/2
  total                 62/62
  evidence determinism 63/63
```

Run both suites from the repository root:

```text
python -B static_fabric_v0_1_0/run_conformance.py --output static_fabric_v0_1_0/evidence
python -B admissibility_v0_2_0/run_conformance.py --output admissibility_v0_2_0/evidence
```

Successful replay regenerates each evidence set byte-for-byte.

## Contents

- [FABRIC_SPEC.md](FABRIC_SPEC.md) and
  [FABRIC_CONFORMANCE_VECTORS.md](FABRIC_CONFORMANCE_VECTORS.md) preserve the
  published V3.1 normative surface.
- [FABRIC_ADMISSION_PIPELINE_SPEC.md](FABRIC_ADMISSION_PIPELINE_SPEC.md) is the
  V3.2 normative admission specification.
- [static_fabric_v0_1_0](static_fabric_v0_1_0) is the exact V3.1 substrate
  imported by the admission kernel.
- [admissibility_v0_2_0](admissibility_v0_2_0) contains the promoted V3.2
  implementation, proof, 62-vector runner, 63 evidence artifacts, and
  promotion record.
- [PUBLICATION_PROVENANCE.md](PUBLICATION_PROVENANCE.md) binds this filtered
  public carrier to the upstream candidate and promotion commits.
- [reference](reference) and [evidence](evidence) retain the original v0.1.0
  publication layout for compatibility.

## Publication provenance

```text
public_base_commit:
  1c1a495406be76ba6d00861fbe2c1044b557c686

public_release_commit:
  7786721994a8fbad32da48ee20ad1eb538924d9a

upstream_candidate_commit:
  ba8428607a5a0291a4a6c0eea275e6d76afbfb5e

upstream_promotion_commit:
  a593b595f674746a532bcd3e2de52bdf1cef9e68

v3_2_spec_sha256:
  DF253688DA9DED75D59793BC88C13F33365ECD6EE2D24F090E0DFED43AADDABC

v3_2_queuegate_evidence_summary_sha256:
  19EE5B395B44E016A24C259674A35EA055A6DF4D33D32657A223AFCD2CF05C8B

v3_2_conformance:
  62/62

v3_2_determinism:
  63/63 byte-identical

software_version_doi:
  10.5281/zenodo.22711890

software_concept_doi:
  10.5281/zenodo.22678127
```

The publication carrier descends from the existing public history and imports
only the promoted software-FPGA subtrees. The upstream commit and artifact
hashes provide the authority and content binding without exposing unrelated
private repository history.

## Established result

V3.1 establishes canonical static fabric semantics: a geometric program
object, dual text/visual projection, operator-derived interfaces,
coordinate-free placement, operator-coherent joins, derived TRIAD transitions,
deterministic normalization, and content-addressed routing.

V3.2 establishes governed static admission over that fixed substrate:
pairwise witness and structural tolerances, directed crossing laws,
deterministic extended checks, proposal-only repair fibers, lifecycle
transitions, and a scoped post-parse nonexpansiveness result.

## Scope boundary

Version 0.2.0 establishes static fabric determinism and static admission. It
does not establish synchronous payload execution, global quiescence,
host-order erasure, a `WHEN` execution overlay, program-counter semantics, or
a fetch/decode/execute loop. Those remain V3.3 work.

Public disclosure may bear on prior art, but neither publication nor the
Apache-2.0 license guarantees a particular patent outcome. Apache-2.0 governs
the rights granted by contributors.

## License and citation

Licensed under the [Apache License 2.0](LICENSE). Citation metadata is in
[CITATION.cff](CITATION.cff).
