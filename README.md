# MaL Fabric v0.7.0

[![Concept DOI](https://zenodo.org/badge/1362150755.svg)](https://doi.org/10.5281/zenodo.22678127) [![Paper A DOI](https://img.shields.io/badge/Paper_A-10.5281%2Fzenodo.22677712-blue)](https://doi.org/10.5281/zenodo.22677712) [![Paper B DOI](https://img.shields.io/badge/Paper_B-10.5281%2Fzenodo.22715312-blue)](https://doi.org/10.5281/zenodo.22715312)

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

Version 0.5.0 adds DEMO-002: constrained natural-language intent produces a
typed proposal, a candidate `FabricSpec`, and a visible geometric diff. The
model proposes; user acceptance authorizes submission to the existing
governed commit path. `ACCEPT` is neither promotion nor commit authority.

Version 0.6.0 adds DEMO-003: a committed geometric program participates in an
explicit logical game loop. Each logical tick samples canonical input once,
performs exactly one V3.3 fabric step, derives effects only from the committed
successor, and applies a deterministic integer-grid game update. Render-frame
cadence remains presentation-only.

Version 0.7.0 adds DEMO-004: the same coherent committed running state is
projected through two visual surfaces. GAME presents characters, movement, and
behavior; CARRIER presents operator × witness cells, typed ports, directed
routes, custody phases, pending frames, and TRIAD regions. Toggling surfaces is
presentation-only and cannot modify semantic or runtime state.

**That creature you were just fighting is this program.**

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

DEMO-002 Vibe Proposer
  proposal construction  6/6
  geometric diff         5/5
  disposition            6/6
  authority boundary     5/5
  NL boundary            2/2
  total                 24/24
  evidence determinism  25/25
  HTTP smoke             PASS
  NL direct commit       FORBIDDEN

DEMO-003 Game Loop Binding
  binding integrity       6/6
  tick semantics          8/8
  deterministic trace     6/6
  negative/boundary       4/4
  product surface         4/4
  total                  28/28
  evidence determinism   29/29
  HTTP smoke              PASS
  one tick / one step     HOLDS

DEMO-004 Dual-Surface Render Binding
  toggle/nonmutation       6/6
  game projection          6/6
  carrier projection       6/6
  projection coherence     4/4
  regression boundary      4/4
  total                   26/26
  evidence determinism    27/27
  HTTP smoke               PASS
  renderer authority       NONE

TOTAL CONFORMANCE       253/253
```

Run all suites from the repository root:

```text
python -B static_fabric_v0_1_0/run_conformance.py --output static_fabric_v0_1_0/evidence
python -B admissibility_v0_2_0/run_conformance.py --output admissibility_v0_2_0/evidence
python -B execution_v0_3_0/run_conformance.py --output execution_v0_3_0/evidence
python -B demo_001_visible_fabric/run_acceptance.py
python -B demo_002_vibe_proposer/run_conformance.py --output demo_002_vibe_proposer/evidence
python -B demo_003_game_loop_binding/run_conformance.py --output demo_003_game_loop_binding/evidence
python -B demo_004_dual_surface_render_binding/run_conformance.py --output demo_004_dual_surface_render_binding/evidence
python -B demo_004_dual_surface_render_binding/demo_server.py
```

The DEMO-004 browser surface is served at
[http://127.0.0.1:8768](http://127.0.0.1:8768).

Successful replay regenerates each evidence set byte-for-byte.

The published v0.6.0 Zenodo archive was independently downloaded and replayed
on 2026-09-12. All six suites passed for 227/227 total conformance. All 215
evidence artifacts matched both repeated runs and their archived counterparts
byte-for-byte. The archived DEMO-003 HTTP flow passed, and all 250 published
JSON artifacts parsed. See [ARCHIVE_REPLAY.md](ARCHIVE_REPLAY.md).

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
- [demo_002_vibe_proposer](demo_002_vibe_proposer) contains the promoted
  non-authoritative intent proposer, typed proposal and diff model, explicit
  disposition lifecycle, browser surface, 24-vector runner, and 25 evidence
  artifacts.
- [demo_003_game_loop_binding](demo_003_game_loop_binding) contains the
  promoted fixed-run game adapter, integer-grid toy game, explicit logical
  tick boundary, browser surface, 28-vector runner, and 29 evidence artifacts.
- [demo_004_dual_surface_render_binding](demo_004_dual_surface_render_binding)
  contains the promoted coherent `RenderSnapshot`, read-only GAME and CARRIER
  projections, browser surface, 26-vector runner, and 27 evidence artifacts.
- [PUBLICATION_PROVENANCE.md](PUBLICATION_PROVENANCE.md) binds this filtered
  public carrier to the upstream candidate and promotion commits.
- [ARCHIVE_REPLAY.md](ARCHIVE_REPLAY.md) records the latest completed replay
  from a published Zenodo archive.
- [reference](reference) and [evidence](evidence) retain the original v0.1.0
  publication layout for compatibility.

## Publication provenance

```text
public_predecessor_commit:
  091dfcae35c5c70d985f71608c401a3dfbba794e

public_predecessor_version_doi:
  10.5281/zenodo.22726846

upstream_demo_implementation_commit:
  85d68a84ccc7e17932e6bdd1e660bb22c94ffa78

upstream_demo_binding_commit:
  720507497b936d049391bde501c35c2d1fd4174d

upstream_demo_promotion_commit:
  c023fb62ba229d023aca013783725d7f55111529

demo_binding_record_sha256:
  5AEE391DCE001328228067124796DF77AAC828DDF2F5EFC7E6FF84BC985D57CA

demo_promotion_record_sha256:
  0D4E15694E07BBF14758E217CBC05F85D7C3D6FCADFA55D4D80FFAF2C65400E6

demo_acceptance_summary_sha256:
  50BB725920F17B5BA5565A8BC37F5E2A301B4BD8FE173F7C399AA5B2ECDDC275

demo_evidence_manifest_sha256:
  82E0DB39FF5B8C3C668E8AC80B14F3D8D7FC54EF7C3B1544664451EF6682A2C1

demo_conformance:
  26/26

demo_evidence_replay:
  27/27 byte-identical

public_release_commit:
  PENDING_RELEASE_CARRIER_COMMIT

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.7.0

software_concept_doi:
  10.5281/zenodo.22678127

software_predecessor_version_doi:
  10.5281/zenodo.22726846

software_v0_7_0_version_doi:
  PENDING_ZENODO_INGESTION

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

DEMO-002 establishes that constrained natural-language intent can propose new
program geometry as a visible, typed diff without receiving authority over the
promoted fabric. User acceptance authorizes submission only; V3.1 DRC and V3.2
admission remain the commit path, and only committed geometry enters V3.3.

DEMO-003 establishes the explicit boundary between a logical game tick and a
committed fabric step. Canonical observations are sampled once, exactly one
V3.3 step executes, effects are derived only from the committed successor,
and the integer-grid game update is deterministic for identical canonical
logical input traces. Render callbacks do not advance semantic time.

DEMO-004 establishes that GAME and CARRIER are distinct read-only projections
of the same coherent committed `RenderSnapshot`. Presentation toggles preserve
the program, runtime state, game state, run identity, and logical tick. Every
semantic-looking cue has a declared committed or immutable source, and the
renderer has no proposal, decision, promotion, or execution authority.

## Scope boundary

Version 0.7.0 adds a bounded dual-surface presentation adapter. It does not
authorize self-modifying geometry, hot-swapping a committed fabric into an
active run, an unbounded external-stimulus API, a physics or network engine,
or autonomous model authority. It does not claim wall-clock, multiplayer,
network, physics-engine, or arbitrary real-time input determinism, or
scheduler independence outside `ValidHostSchedule`.

Public disclosure may bear on prior art, but neither publication nor the
Apache-2.0 license guarantees a particular patent outcome. Apache-2.0 governs
the rights granted by contributors.

## License and citation

Licensed under the [Apache License 2.0](LICENSE). Citation metadata is in
[CITATION.cff](CITATION.cff).
