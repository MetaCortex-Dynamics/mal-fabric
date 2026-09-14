# MaL Fabric v0.11.0

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

Version 0.8.0 adds VIS-R&D-001: a static 3D Gaussian splat participates as a
GAME-view presentation primitive through Three.js `WebGPURenderer`,
`SPLATLoader`, and `GaussianSplat`. The conventional asset, Gaussian asset,
and fallback asset produce the same canonical game/fabric trace. Asset
substitution, splat sorting, view-dependent color, backend behavior, and
fallback selection are presentation-only; pixels are noncanonical.

**Ship the beauty. The structure is underneath.**

Version 0.9.0 adds SHOWCASE-001: a mesh-derived, CC-BY-4.0 Gaussian mountain
environment hosts governed enemy behavior. GAME presents the characters in
terrain; CARRIER presents the running program as executable geometry. The
paired proof views preserve the same run, logical tick, committed
`RenderSnapshot`, and `GameRunIdentity`.

**That creature you were just fighting is this program. Same run. Same tick.
Same snapshot. Two surfaces.**

Version 0.10.0 adds PHYSICS-R&D-001: canonical Contact-GR evolution and
canonical Constructive-Substrate dynamics commit together at one governed
joint tick. The realized entity is a self-reproducing substrate resonance,
not a point particle moving through a simulated medium. The committed joint
trace is invariant under admitted host traversal order, while GAME and
CARRIER project the same physical state.

This release supplies one bounded, content-addressed constructive realization
recovering the declared joint behavior. `O5` is therefore witnessed; the
general unified-law obligation is not claimed discharged.

Version 0.11.0 adds CGP-WORLD-001: a constitutive geometric-program world in
which terrain, entities, observer-specific epistemic state, and governed rate
are derived from the canonical operator-witness fabric. ASCII and browser
surfaces remain nonauthoritative projections of the same committed world. The
release also carries a sealed 17-file browser beauty pass as explicitly
noncanonical, unpromoted `PRODUCT_STAGE` material.

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

VIS-R&D-001 Gaussian Splat Render Primitive
  asset/binding integrity  6/6
  render decision          6/6
  noninterference          6/6
  fallback/resource        4/4
  product surface          2/2
  total                   24/24
  evidence determinism    25/25
  HTTP/browser smoke       PASS
  renderer authority       NONE

SHOWCASE-001 Mountain Capture
  acceptance              22/22
  required stills           6/6
  launch clip              44.0s
  proof quartet            HOLDS
  asset provenance         mesh-derived CC-BY-4.0

PHYSICS-R&D-001 Contact-GR × Constructive Substrate
  acceptance              36/36
  evidence determinism    37/37
  common fixed points        334
  carrier quotient       1296/1296
  joint tick identity       HOLDS
  host-order erasure        HOLDS
  O5                        WITNESSED, NOT DISCHARGED

ASCII-GEN0 Player Agency
  acceptance              16/16
  evidence determinism    17/17
  ASCII authority          NONE

ASCII-ENV-001 Walkable Perspective World
  acceptance              15/15
  evidence determinism    16/16
  headless = attached      HOLDS

CGP-WORLD-001 Constitutive Geometric Program World
  acceptance              44/44
  evidence determinism    45/45
  predecessor regression 366/366
  predecessor evidence   337/337
  presentation authority  NONE

TOTAL CONFORMANCE       410/410
TOTAL DETERMINISTIC EVIDENCE 382/382
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
python -B vis_rd_001_gaussian_splat_render_primitive/run_conformance.py
python -B vis_rd_001_gaussian_splat_render_primitive/run_full_regression.py
python -B vis_rd_001_gaussian_splat_render_primitive/demo_server.py
python -B showcase_001_mountain_capture/run_acceptance.py
python -B showcase_001_mountain_capture/showcase_server.py
python -B physics_rd_001_contact_gr_constructive_substrate_realization/run_prior_regression.py
python -B physics_rd_001_contact_gr_constructive_substrate_realization/run_conformance.py
python -B game_input_agency_001/run_conformance.py
python -B ascii_env_001_walkable_perspective_world/run_full_conformance.py
python -B cgp_world_001_constitutive_world/run_conformance.py
```

The VIS-R&D-001 browser surface is served at
[http://127.0.0.1:8769](http://127.0.0.1:8769).

The SHOWCASE-001 browser surface is served at
[http://127.0.0.1:8770](http://127.0.0.1:8770).

Successful replay regenerates each evidence set byte-for-byte.

The published v0.10.0 Zenodo archive was independently downloaded and replayed
on 2026-09-12. The predecessor floor passed 299/299 and PHYSICS-R&D-001 passed
36/36, for 335/335 total conformance and acceptance. All 267 predecessor
deterministic evidence artifacts and all 37 PHYSICS-R&D-001 artifacts matched
independent replay byte-for-byte after the documented DEMO-004 Windows newline
materialization. All 382 published JSON artifacts parsed, the bound physics
and corpus identities were preserved, and archive HTTP smoke passed. See
[ARCHIVE_REPLAY.md](ARCHIVE_REPLAY.md).

The v0.11.0 release carrier was replayed from its exact Git archive on
2026-09-13. After the documented inherited DEMO-004 Windows-newline preflight,
the predecessor floor passed 366/366 with 337/337 byte-identical evidence and
CGP-WORLD-001 passed 44/44 with 45/45 byte-identical evidence, closing the
410/410 and 382/382 release targets. See
[ARCHIVE_REPLAY_PREFLIGHT_v0.11.0.md](ARCHIVE_REPLAY_PREFLIGHT_v0.11.0.md).

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
- [vis_rd_001_gaussian_splat_render_primitive](vis_rd_001_gaussian_splat_render_primitive)
  contains the promoted Gaussian presentation adapter, fixed-width local splat
  fixture, native Three.js browser path, fallback behavior, 24-vector runner,
  25 evidence artifacts, and noncanonical paired product captures.
- [showcase_001_mountain_capture](showcase_001_mountain_capture) contains the
  promoted Gaussian mountain showcase, 22-vector acceptance corpus, six
  required stills, 44-second launch clip, proof records, and CC-BY-4.0
  attribution package.
- [physics_rd_001_contact_gr_constructive_substrate_realization](physics_rd_001_contact_gr_constructive_substrate_realization)
  contains the promoted Contact-GR × Constructive-Substrate reference
  realization, bound mathematical corpus, proof, 36-vector corpus, 37
  deterministic evidence artifacts, resonance witness, fixed-point census,
  quotient convergence evidence, and O5 constructive witness.
- [game_input_agency_001](game_input_agency_001) contains the promoted
  kernel-owned player-action transition and 16-vector agency corpus.
- [ascii_env_001_walkable_perspective_world](ascii_env_001_walkable_perspective_world)
  contains the promoted walkable perspective-world projection and 15-vector
  environment corpus.
- [cgp_world_001_constitutive_world](cgp_world_001_constitutive_world) contains
  the promoted constitutive-world realization, proof, 44-vector corpus, and 45
  deterministic evidence artifacts.
- [beauty_pass_001_browser_surface](beauty_pass_001_browser_surface) is the
  separately sealed, noncanonical and unpromoted browser `PRODUCT_STAGE`.
- [PRODUCT_STAGE_MANIFEST.json](PRODUCT_STAGE_MANIFEST.json) binds the exact 17
  product-stage files without granting them semantic or evidence authority.
- [PUBLICATION_PROVENANCE.md](PUBLICATION_PROVENANCE.md) binds this filtered
  public carrier to the upstream candidate and promotion commits.
- [ARCHIVE_REPLAY.md](ARCHIVE_REPLAY.md) records the latest completed replay
  from a published Zenodo archive.
- [reference](reference) and [evidence](evidence) retain the original v0.1.0
  publication layout for compatibility.

## Publication provenance

The v0.11.0 carrier imports the exact promoted CGP-WORLD lineage:

```text
upstream_cgp_world_implementation_commit:
  307da4fc32c318ad7e5a8160ccfee1bee8496b2d

upstream_cgp_world_binding_commit:
  f2154c8bd6d6cb1682b3d76b3f20a44109a87287

upstream_cgp_world_promotion_commit:
  dd5025176cf9902d6028d11b2929baf0b19c8112

product_stage_manifest_sha256:
  56E1C83B8CD4F2D926ED8302ED3D870629BA7B096CDAD68598C155FCDE653153

software_predecessor_version_doi:
  10.5281/zenodo.22731115

software_v0_11_0_version_doi:
  PENDING_POST_DEPOSIT
```

The completed v0.10.0 publication binding remains:

```text
public_predecessor_commit:
  c567ab3a0e3a44e225b48861480e420d30e7de89

public_predecessor_version_doi:
  10.5281/zenodo.22729949

upstream_implementation_commit:
  7486bb05d1f12a98d5d2d3b05dd480314b178272

upstream_binding_commit:
  0b5958440ec679c514be804f7ead3c1bb967bb28

upstream_promotion_commit:
  42d4a18394f0fb2a455e233c40a02d47386344eb

binding_record_sha256:
  C6739D90E547032D296B8D17CA35B2D40427CDCBC43BE901E4270A233E05FE31

promotion_record_sha256:
  B9B054D217D04FE8F78CC1001DBE37522C1AB8F5B432B565A7B0AA934D225AAA

acceptance_summary_sha256:
  08156C95169BEC75E405C6EC0573B2A3B9D17616EB7B7CC5CD376B83970A4F8E

evidence_manifest_sha256:
  2B9F9331DD09546DFAB68B05427B32CCB1E2F9CA934CC300B203473C2D153F06

kernel_sha256:
  8B579BC20B1D8C4ACE4B6C406BAE68B770D1A9D032A5664DA703143F507C4ED2

physics_conformance:
  36/36

physics_evidence_replay:
  37/37 BYTE_IDENTICAL

O5:
  WITNESSED, NOT DISCHARGED

public_release_commit:
  7187cf0274dccba8a90e9fdcff49f07ae39e6d70

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.10.0

software_concept_doi:
  10.5281/zenodo.22678127

software_predecessor_version_doi:
  10.5281/zenodo.22729949

software_v0_10_0_version_doi:
  10.5281/zenodo.22731115

zenodo_archive_sha256:
  F93A1E493B96C1D64BD095E091C6443B93F458D949898A872F8C8F5A642B73BF

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

VIS-R&D-001 establishes that a static 3D Gaussian splat can replace a
conventional GAME-view asset without changing `FabricSpec`, `FabricState`,
`GameLoopState`, `EnemyAction`, logical tick, `GameRunIdentity`, or the
canonical semantic trace. The renderer remains a read-only consumer of the
committed snapshot, and fallback selection preserves semantics.

SHOWCASE-001 establishes the public product-evidence surface: a Gaussian
mountain environment and governed enemy behavior are shown through GAME and
CARRIER while the proof quartet preserves one run, logical tick,
`RenderSnapshot`, and `GameRunIdentity`. The mesh-derived asset and all pixels,
stills, and video remain noncanonical presentation evidence.

PHYSICS-R&D-001 establishes one bounded realization in which canonical
Contact-GR evolution and canonical Constructive-Substrate dynamics share one
governed joint tick. The entity is a self-reproducing substrate resonance;
the committed joint trace is invariant under admitted host traversal order;
and GAME and CARRIER project the same physical state. This constructively
witnesses O5 for the declared bounded realization without discharging the
general unified-law obligation.

## Scope boundary

Version 0.11.0 adds one bounded constitutive-world realization. It does not
claim a universal unified-law theorem, Born statistics, entanglement,
coarse-grain classical stability, production rendering quality, multiplayer
determinism, self-modifying geometry, or scheduler independence outside the
admitted host schedules. O5 remains witnessed and not discharged. The browser
beauty pass remains noncanonical, unpromoted product-stage material.

The predecessor visual boundaries remain unchanged: Gaussian assets, pixels,
camera state, and renderer behavior are presentation-only. The release does
not authorize self-modifying geometry, hot-swapping a committed fabric into
an active run, an unbounded external-stimulus API, a general-purpose physics
or network engine, or autonomous model authority.

Public disclosure may bear on prior art, but neither publication nor the
Apache-2.0 license guarantees a particular patent outcome. Apache-2.0 governs
the rights granted by contributors.

## License and citation

Licensed under the [Apache License 2.0](LICENSE). Citation metadata is in
[CITATION.cff](CITATION.cff).
