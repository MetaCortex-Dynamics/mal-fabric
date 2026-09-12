# MaL Fabric v0.4.0

[![Release DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22718622.svg)](https://doi.org/10.5281/zenodo.22718622) [![Concept DOI](https://zenodo.org/badge/1362150755.svg)](https://doi.org/10.5281/zenodo.22678127) [![Paper A DOI](https://img.shields.io/badge/Paper_A-10.5281%2Fzenodo.22677712-blue)](https://doi.org/10.5281/zenodo.22677712) [![Paper B DOI](https://img.shields.io/badge/Paper_B-10.5281%2Fzenodo.22715312-blue)](https://doi.org/10.5281/zenodo.22715312)

MaL Fabric defines deterministic canonical static semantics, governed
admission, and synchronous execution for a MaL-native software-FPGA fabric.
Version 0.3.0 preserves the sealed V3.1 and V3.2 substrates and adds the
promoted V3.3 execution kernel: snapshot-isolated ticks, canonical input-frame
assembly, four-state payload custody, quiescence classification, and
host-order erasure over valid schedules.

Version 0.4.0 adds the first product-surface demonstration of mal-fabric:
canonical geometric programs are rendered and manipulated through confluent
text and visual surfaces, governed before commitment, and synchronously
executed with visible runtime custody. The deterministic natural-language
surface proposes edits but has no authority to commit them.

## Companion papers

- [Canonical Geometric Programs: Confluent Dual-Surface Semantics for
  Operator-Witness Fabrics](https://doi.org/10.5281/zenodo.22677712) establishes
  the static program object.
- [Programming with Geometry: Synchronous Spatial Execution and Host-Order
  Erasure in Operator-Witness Fabrics](https://doi.org/10.5281/zenodo.22715312)
  establishes the dynamic execution semantics.

## Conformance

```text
V3.1 static kernel
  conformance          25/25
  evidence determinism 26/26

V3.2 admission kernel
  conformance          62/62
  evidence determinism 63/63

V3.3 execution kernel
  snapshot             10/10
  frame                12/12
  payload              10/10
  quiescence           12/12
  host-order           12/12
  negative              8/8
  end-to-end            6/6
  total                70/70
  evidence determinism 71/71

DEMO-001 Visible Fabric
  acceptance           18/18
  acceptance replay    byte-identical
  HTTP smoke           PASS
  NL proposer authority NONE
```

Run all suites from the repository root:

```text
python -B static_fabric_v0_1_0/run_conformance.py --output static_fabric_v0_1_0/evidence
python -B admissibility_v0_2_0/run_conformance.py --output admissibility_v0_2_0/evidence
python -B execution_v0_3_0/run_conformance.py --output execution_v0_3_0/evidence
python -B demo_001_visible_fabric/run_acceptance.py
```

Successful replay regenerates each evidence set byte-for-byte.

The published v0.4.0 Zenodo archive was independently downloaded and replayed
on 2026-09-11. All three substrate suites and DEMO-001 passed. All 160
layer-specific evidence artifacts matched their archived counterparts and
repeated runs byte-for-byte; the DEMO-001 acceptance summary was also
byte-identical, the archived HTTP flow passed, and all 189 published JSON
artifacts parsed. See [ARCHIVE_REPLAY.md](ARCHIVE_REPLAY.md).

## Contents

- [FABRIC_SPEC.md](FABRIC_SPEC.md) and
  [FABRIC_CONFORMANCE_VECTORS.md](FABRIC_CONFORMANCE_VECTORS.md) preserve the
  V3.1 normative surface.
- [FABRIC_ADMISSION_PIPELINE_SPEC.md](FABRIC_ADMISSION_PIPELINE_SPEC.md) is the
  V3.2 governed-admission specification.
- [FABRIC_EXECUTION_SPEC.md](FABRIC_EXECUTION_SPEC.md) and
  [FABRIC_EXECUTION_CONFORMANCE_VECTORS.md](FABRIC_EXECUTION_CONFORMANCE_VECTORS.md)
  preserve the sealed V3.3 execution specification and 70-vector corpus.
- [static_fabric_v0_1_0](static_fabric_v0_1_0) is the exact V3.1 substrate.
- [admissibility_v0_2_0](admissibility_v0_2_0) contains the promoted V3.2
  implementation, proof, evidence, and promotion record.
- [execution_v0_3_0](execution_v0_3_0) contains the promoted V3.3 kernel,
  host-order-erasure proof, 70-vector runner, 71 evidence artifacts, and
  promotion record.
- [demo_001_visible_fabric](demo_001_visible_fabric) contains the promoted
  one-`FabricSpec` browser demo, deterministic proposer, governed edit adapter,
  V3.3 runtime overlay, scripted fixture, and D01-D18 acceptance evidence.
- [PUBLICATION_PROVENANCE.md](PUBLICATION_PROVENANCE.md) binds this filtered
  public carrier to the upstream candidate and promotion commits.
- [ARCHIVE_REPLAY.md](ARCHIVE_REPLAY.md) records the latest completed replay
  from a published Zenodo archive.
- [reference](reference) and [evidence](evidence) retain the original v0.1.0
  publication layout for compatibility.

## Publication provenance

```text
public_predecessor_commit:
  7cdf70301fe99de361452d6a05bf80d7326e0b5a

upstream_demo_implementation_commit:
  5ba5909b612a2e9e96d5e4d8aecdb69ade23a665

upstream_demo_binding_commit:
  11e4bec034ad49c51272e3e3225cef54275241cd

upstream_demo_promotion_commit:
  147efeaf1a88fce33cdc0a74eab9f9ca347cb202

demo_promotion_record_sha256:
  3E58D5F4A3F6B7BF0A9073955C99C4B9E117D3CFB336DC1979CC7743DC7A001F

demo_acceptance_summary_sha256:
  C634F5E58D6A27D8D53576B0FA62DAD30AF1D28C69A561A0B4797D4FED620E74

v3_3_spec_sha256:
  5BB1497AA3D791150F0416FEDA4E393695A9302B42030ADD0A7D22C08CCBEAC0

v3_3_vector_corpus_sha256:
  846DBF4BE822C6816E788D4BCCE98F34D815D1AB870E62BDC5DEA67636E9C055

v3_3_execution_kernel_sha256:
  96C6F849F3AD64D6B9D8C2469A252E5A813354C1E2C0B7CD47FCDE7B518B4FE2

v3_3_queuegate_evidence_summary_sha256:
  B7FD885ADA3E14845336E547D3A35C5A81418F82998221CE189B1FE100A78E0F

v3_3_conformance:
  70/70

v3_3_determinism:
  71/71 byte-identical

software_concept_doi:
  10.5281/zenodo.22678127

software_predecessor_version_doi:
  10.5281/zenodo.22713736

software_v0_4_0_version_doi:
  10.5281/zenodo.22718622

paper_b_doi:
  10.5281/zenodo.22715312
```

The publication carrier descends from the existing public history and imports
only the promoted software-FPGA subtrees. Upstream commit and artifact hashes
bind the public bytes to their authority points without exposing unrelated
private repository history.

## Established result

V3.1 establishes what the program is: a canonical geometric program object,
dual text/visual projection, operator-derived interfaces, coordinate-free
placement, operator-coherent joins, derived TRIAD transitions, deterministic
normalization, and content-addressed routing.

V3.2 establishes what may enter, cross, or be proposed for repair: pairwise
witness and structural tolerances, directed crossing laws, deterministic
extended checks, proposal-only repair fibers, and lifecycle transitions.

V3.3 establishes how the fabric computes: immutable-program synchronous
snapshots, exact frame readiness, durable payload custody, simultaneous
commit, terminal versus blocked quiescence, and deterministic host-order
erasure. Canonical state, run status, blocked reasons, and tick evidence are
independent of valid within-stage host iteration order.

DEMO-001 establishes that the canonical program can be seen and manipulated
through confluent text and visual surfaces, that semantic gestures lower to
the existing FabricEdit model, and that admitted geometry executes with a
visible V3.3 custody wavefront. Presentation coordinates remain outside
canonical identity and evidence digests.

## Scope boundary

Version 0.4.0 adds a bounded product demonstration. It does not authorize
self-modifying geometry, an external stimulus API, a general-purpose NL
compiler, or autonomous model authority. It does not claim wall-clock
equivalence, different-initial-state determinism, multiplayer determinism,
cross-implementation equality when evaluators differ, or scheduler
independence outside `ValidHostSchedule`.

Public disclosure may bear on prior art, but neither publication nor the
Apache-2.0 license guarantees a particular patent outcome. Apache-2.0 governs
the rights granted by contributors.

## License and citation

Licensed under the [Apache License 2.0](LICENSE). Citation metadata is in
[CITATION.cff](CITATION.cff).
