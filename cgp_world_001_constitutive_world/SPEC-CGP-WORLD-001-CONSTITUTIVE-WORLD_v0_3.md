# SPEC-CGP-WORLD-001-CONSTITUTIVE-WORLD

**Version:** v0.3
**Status:** PROPOSED (repair successor to v0.2)

---

## 1. Purpose

CGP-WORLD-001 defines the canonical world model for a playable MaLCog world in which entities are constituted by governed activity and presentation surfaces only disclose what already exists.

v0.3 preserves the v0.2 multiplayer-perception model while repairing the authority, replay, rate-governance, and sheaf semantics required to keep ontic, epistemic, and presentation state distinct and implementable.

```text
CGP
  ↓ realization
CONTACT-GR + CONSTRUCTIVE SUBSTRATE + FABRIC
  ↓ constitution
CONSTITUTIVE ENTITY E(w)
  ↓ measurement (per observer)
GAP LEMMA + SHEAF SECTIONS
  ↓ projection (per observer)
Π1 carrier | Π2 ASCII | Π3 Gaussian
```

---

## 2. Upstream authorities

CGP-WORLD-001 is downstream of:

```text
CGP:
  entities exist iff one constitutive activity simultaneously satisfies
  genealogical, structural, and functional projection.

PHYSICS-R&D-001:
  Contact-GR + Constructive Substrate + Fabric provide the machine
  realization of constitutive activity.

ASCII-GEN0:
  governed player agency, entity interaction, and worldline advancement.

ASCII-ENV-001:
  presentation projection is nonauthoritative and removable.

OBF Production Closure v4:
  oracle-backed facts, sheaf wrapper, locale-indexed sections,
  gluing conditions, LiftClaim admissibility, worldline audit chain.

Governed Biological Repair:
  Gap Lemma (Formulation v2, Lemma 4.2), repair fiber theory,
  therapeutic window (1/β), boundary probabilism.

The Virus Is Not Your Enemy:
  immune system as rate governor of MAYBE injection,
  critical regime between settlement and divergence.

Fragility Topology:
  Theorem 2 (no face sees all 7 witnesses),
  24-cell anomaly (μ = 0, self-dual, governance margin zero).
```

This specification MUST NOT reopen those predecessors.

---

## 3. Two projection regimes

### 3.1 Constitutive projections

```text
□G := genealogical projection
□S := structural projection
□F := functional projection
```

These determine whether there IS an entity.

They are simultaneous readings of one irreducible constitutive structure.

### 3.2 Presentation projections

```text
Π1 := carrier presentation
Π2 := ASCII presentation
Π3 := Gaussian presentation
```

These determine how an already-constituted entity is disclosed to a specific observer.

Presentation projections have zero constitutive authority.

### 3.3 Measurement projections

```text
M_obs(E,w) := observer-specific measurement of entity E at worldline w
```

Measurement is intermediate between constitution and presentation.

```text
CONSTITUTION (□G ∧ □S ∧ □F)
  determines whether E exists

MEASUREMENT (M_obs)
  determines what observer obs has committed about E
  observer-specific
  coupling-dependent
  governed by Gap Lemma

PRESENTATION (Πk)
  determines how M_obs(E,w) is visually disclosed
  surface-specific
  zero constitutive authority
  zero measurement authority
```

The three regimes MUST NOT be conflated.

---

## 4. Worldline

```text
w_origin := 0
w_(t+1)  := w_t + 1
w        := logical_tick_index
```

w is worldline / governed unfolding.

It is NOT a spatial coordinate.

The canonical spatial coordinates remain (x, y, z).

No player action, renderer action, camera action, asset transform,
presentation toggle, or observer measurement may directly address or mutate w.

---

## 5. State architecture: ontic, epistemic, presentation

CGP-WORLD-001 maintains three distinct state containers with three distinct authority levels.

### 5.1 Ontic world state

The world is the governed substrate state at worldline point w.

```text
OnticWorldState(w) := (
  world_ref,
  worldline_prefix(w),
  constructive_substrate_state(w),
  contact_physics_state(w),
  fabric_state(w),
  governed_spatial_state(w),
  admitted_world_fixture
)
```

`world_ref` is a technical handle. It does not constitute world identity.

`OnticWorldState(w)` is observer-independent and presentation-independent.

```text
ONTIC_TRACE := trace(OnticWorldState)
```

The ontic trace is the canonical entity/world trace used for headless invariance.

### 5.2 Epistemic state

Observer measurements and shared-perception state are NOT part of OnticWorldState.

```text
EpistemicState(w) := (
  observer_registry(w),
  perception_sheaf(w),
  measurement_records(w),
  lift_records(w),
  shared_fact_state(w)
)
```

`observer_registry(w)` tracks admitted observers and their governed measurement apparatus.

`perception_sheaf(w)` tracks locale-indexed committed measurements and gluing state.

```text
MEASUREMENT_TRACE := trace(EpistemicState)
```

The epistemic trace is observer-dependent and may differ when the observer set, admitted measurement events, or replay inputs differ.

### 5.3 Presentation state

Presentation state is noncanonical.

```text
PresentationState(obs) := (
  active_surface,
  camera_state,
  visual_parameters,
  surface_local_state
)
```

PresentationState has zero authority over OnticWorldState and EpistemicState.

### 5.4 Authority direction

```text
ONTOLOGY
  ↓ may generate measurement opportunity

EPISTEMIC
  ↓ may be presented

PRESENTATION
```

Reverse authority is forbidden unless separately authorized by an upstream semantic rule.

Presentation-specific data MUST NOT appear in OnticWorldState.

Forbidden ontic fields include:

```text
ASCII glyph, ANSI color, Gaussian splat asset, mesh identifier,
animation clip, camera state, screen coordinate, render-layer identifier,
presentation-only transform, sheaf section, Certificate, LiftClaim, OBF
```

---
## 6. World fixture contract

```text
WorldFixtureV1 := (
  fixture_id,
  fixture_version,
  fixture_digest,
  spatial_domain,
  traversability_domain,
  obstruction_domain,
  substrate_support_domain,
  spawn_admission_regions,
  fixture_serialization_contract
)
```

The fixture MUST be immutable during one governed run.

A presentation surface MUST NOT add, remove, or reinterpret canonical topology.

---

## 7. Constitutive activity

For a technical entity reference e at worldline point w:

```text
A(e,w) := the constitutive activity supported by WorldState(w)
          and tracked through the governed realization.
```

For this machine realization, A(e,w) is the activity realized by:

```text
resonance on the constructive substrate
following the admitted Contact-GR trajectory
under the joint governed fabric tick
with worldline-linked causal history
```

No presentation surface is part of A(e,w).

No observer measurement is part of A(e,w).

---

## 8. Constitutive entity predicate

```text
ENTITY(e,w) iff
  □G(A(e,w))
  ∧
  □S(A(e,w))
  ∧
  □F(A(e,w))
```

No partial entity is admitted.

---

## 9. Machine realization binding

### 9.1 Genealogical realization

```text
□G(A(e,w)) :=
  the governed worldline prefix and causal trace identify the activity's
  actual causal genealogy through committed transitions.
```

### 9.2 Structural realization

```text
□S(A(e,w)) :=
  the resonance / integrated constitutive pattern persists as one governed
  activity across the required transition interval.
```

### 9.3 Functional realization

```text
□F(A(e,w)) :=
  the governed constitutive activity is what the entity is being,
  rather than an optional behavior attached to an independently existing object.
```

---

## 10. Technical entity reference

```text
entity_ref / GenesisRef / activity_ref
  := technical carriers

NOT:
  source of metaphysical identity
```

---

## 11. Digests

```text
state_digest(e,w)     := evidence, NOT constitutive authority
world_state_digest(w)  := evidence, NOT constitutive authority
```

For one entity at one worldline point:

```text
canonical_state_digest  := SAME across all observers and presentation surfaces
measurement_digest_obs  := observer-specific (may differ across observers)
projection_digest_k     := surface-specific (may differ across surfaces)
```

---

## 12. Repair fiber, Gap Lemma, and measurement replay (v0.3)

### 12.1 Perception repair fiber

For a constituted entity E(w), the perception repair fiber is the set of admissible measurements:

```text
R(E,w) := { m ∈ M : m is an admissible measurement of E at w }
```

When |R(E,w)| = 1, measurement is deterministic for any observer whose coupling admits commitment.

When |R(E,w)| > 1, multiple admissible measurements exist. This is where governed probabilism enters the measurement regime.

### 12.2 Gap Lemma application

When |R(E,w)| > 1, selection is governed by the Markov kernel:

```text
K(E,w,m) ∝ exp(−β_obs(E,w) [d_G(m, m_ref) + η V(m)]) · 𝟙{m ∈ R(E,w)}
```

where:

```text
β_obs(E,w)   := observer/entity/worldline-specific coupling parameter

d_G(m,m_ref) := genealogical distance from measurement m to reference state

V(m)         := Lyapunov cost of measurement m

R(E,w)       := perception repair fiber
```

High β:
  K concentrates → near-deterministic measurement.

Low β:
  K spreads → several admissible outcomes retain meaningful probability.

### 12.3 Boundary probabilism

```text
BOUNDARY_PROBABILISM :=
  probabilism enters from non-uniqueness of admissible measurement
  NOT from ontic-dynamics noise
  NOT from renderer randomness
  NOT from network jitter
```

The ontic entity state remains deterministic under the admitted semantic action sequence.

The measurement outcome is governed-probabilistic when |R(E,w)| > 1.

### 12.4 Regime separation

The Rayna/rendering L0–L4 hierarchy does NOT name the measurement boundary.

Measurement is its own regime.

```text
CONSTITUTION:
  deterministic
  ENTITY(E,w) iff □G ∧ □S ∧ □F of the SAME constitutive activity

ONTIC DYNAMICS:
  deterministic
  HOST_ORDER_ERASURE preserved
  same initial OnticWorldState
  + same admitted semantic actions
  + same admitted ontic-affecting measurement events
  → same ONTIC_TRACE

MEASUREMENT:
  governed-probabilistic when |R(E,w)| > 1
  deterministic GIVEN a complete MeasurementReplayContract
  observer-specific

PRESENTATION:
  deterministic GIVEN committed M_obs(E,w)
  + bound PresentationContract
  surface-specific
  zero ontic authority
  zero epistemic authority
```

### 12.5 Projector attachment versus measurement event

```text
ATTACH_PROJECTOR(Πk, obs):
  presentation operation
  no OnticWorldState transition
  no EpistemicState transition

MEASURE(obs,E,w):
  governed semantic event
  may update EpistemicState
  may update OnticWorldState ONLY where an upstream law explicitly
  authorizes measurement perturbation
```

A projector attachment MUST NOT be treated as a measurement action.

A measurement action MUST enter the admitted semantic event sequence whenever it can affect OnticWorldState.

### 12.6 Measurement replay contract

Byte-identical measurement replay requires one fully bound contract:

```text
MeasurementReplayContract := (
  kernel_version,
  normalization_rule,
  numeric_domain,
  repair_fiber_enumeration,
  repair_fiber_order,
  random_source_algorithm,
  random_source_seed,
  draw_index_consumption_rule,
  observer_id,
  entity_ref,
  w
)
```

The implementation MUST bind every field before claiming replay identity.

Given:

```text
same MeasurementReplayContract
+ same R(E,w)
+ same Gap Lemma kernel inputs
```

the selected measurement outcome MUST be deterministic.

`β_obs`, `σ_obs`, and apparatus state are kernel inputs/state. They are NOT, by themselves, a stochastic seed.

Different admitted random-source seeds MAY produce different admissible outcomes under the same kernel. Such outcomes are governed alternatives, not replay failures.

---
## 13. Observer model (v0.3)

### 13.1 Observer definition

An observer is any system possessing a governed measurement apparatus.

```text
Observer := (
  observer_id,
  locale_id,
  measurement_apparatus,
  coupling_function,
  committed_measurements
)

coupling_function:
  Entity × w → (β_obs(E,w), σ_obs(E,w))
```

Coupling is not one scalar stored globally per observer.

It is observer/entity/worldline-specific.

In single-player, there is one observer (the player).
In multiplayer, there are multiple observers with independent epistemic state.

### 13.2 Coupling and spectral gap

```text
σ_obs(E,w) := coupling strength between observer obs and entity E at worldline w

σ_crit     := measurement commitment threshold
```

```text
σ_obs(E,w) < σ_crit:
  spectral gap open
  measurement has not committed
  the observer has no committed Certificate for E at w
  the entity's OnticWorldState is unchanged unless another admitted
  semantic event changes it

σ_obs(E,w) ≥ σ_crit:
  spectral gap closed
  measurement may commit
  observer may obtain a Certificate for E at w
```

Measurement commitment is epistemic unless an upstream law separately authorizes ontic perturbation.

### 13.3 Witness coverage

Fragility Topology Theorem 2: no single face of the dodecahedral carrier sees all 7 witnesses.

```text
Observer at face F:
  sees 5 witnesses (the 5 vertices of F)
  misses 2 witnesses (from the remaining 5 antipodal pairs)

Two observers at adjacent faces:
  combined coverage > 5
  approaching but not reaching 7

Full witness coverage:
  requires at minimum 3 non-antipodal faces
  cooperation is geometrically rewarded
```

---
## 14. Sheaf structure (v0.3)

### 14.1 Locale-indexed perception

Each observer defines a locale — their perceptual domain.

```text
PerceptionSheaf(w) := (
  sheaf_cover,
  sections,
  gluing_state
)

SheafCover := {
  locale_A: Observer A's perceptual domain,
  locale_B: Observer B's perceptual domain,
  ...,
  overlap_AB: domain where both A and B have committed measurements,
  ...
}

SheafSection_obs := {
  entity E → committed measurement M_obs(E,w)
  for each entity with a locally valid committed Certificate
}
```

### 14.2 Compatibility predicate

Gluing is not byte equality.

The implementation MUST bind an explicit compatibility predicate:

```text
CONSISTENT(M_A, M_B, E, w) → {true,false}
```

`CONSISTENT` determines whether two locally valid promoted measurement propositions can coexist in one shared epistemic section.

Distinct measurements MAY be consistent.

### 14.3 Gluing condition

```text
GLUING(locale_A, locale_B) :=
  ∀ E in overlap_AB
  where A and B each possess locally admissible LiftClaims:

    CONSISTENT(M_A, M_B, E, w) = true
```

Where only one observer has a locally admissible LiftClaim, only that observer contributes a candidate shared fact.

Where neither observer has one, no shared fact is established for E in that overlap.

### 14.4 Gluing failure

```text
GLUING_FAILURE :=
  shared/global promotion BLOCKED
  reason = SHEAF_INCONSISTENCY
```

Gluing failure does NOT imply:

```text
Certificate invalidity
measurement did not occur
LiftClaim was necessarily locally inadmissible
network synchronization failure
```

Two Certificates may be locally valid.
Two LiftClaims may be locally admissible.
Their candidate shared facts may nevertheless be jointly incompatible.

Local Certificates survive a gluing failure.

Gluing failure is a structural diagnostic at the shared-epistemic boundary.

---
## 15. OBF integration (v0.3)

### 15.1 Measurement as Certificate

An observer's committed measurement of entity E produces a Certificate:

```text
Certificate_obs(E,w) := (
  observer_id,
  entity_ref,
  worldline_point,
  measurement_outcome,
  coupling_state,
  apparatus_state,
  replay_contract_ref,
  provenance_anchors
)
```

A Certificate is local epistemic evidence.

It is NOT a ■-fact.

Certificate validity answers:

```text
did this observer obtain a governed committed measurement?
```

It does NOT re-decide whether E exists.

### 15.2 LiftClaim for shared perception

`ENTITY(E,w)` is imported as upstream constitutive evidence.

The observer MUST NOT re-evaluate □G ∧ □S ∧ □F as part of a LiftClaim.

```text
LiftClaim_obs(E,w) := (
  certificate_ref,
  entity_constitution_ref,
  measurement_proposition,
  covers_predicate:
    measurement_admissibility(
      measurement_proposition,
      M_obs,
      E,
      w
    ),
  margin: τ_obs,
  tier: observer-determined,
  evidence_bundle
)
```

The margin threshold `τ_obs` governs local eligibility for promotion into shared epistemic state.

```text
CERTIFICATE_VALIDITY:
  local measurement commitment

LIFTCLAIM_ADMISSIBILITY:
  local shared-promotion eligibility

GLUING_COMPATIBILITY:
  joint compatibility across overlapping locales
```

These are three distinct predicates.

### 15.3 OracleBackedFact

A locally admissible LiftClaim becomes a shared OracleBackedFact only when the applicable gluing conditions also hold.

```text
OBF_obs(E,w) := (
  certificate_ref,
  lift_claim_ref,
  modality: ■,
  locale: locale_obs,
  status: ACTIVE
)
```

The OBF is locale-scoped.

No OBF promotion may alter OnticWorldState merely because the epistemic fact became shared.

---
## 16. Immune governance (v0.3)

### 16.1 Typed variation signal

The immune analog governs a signed deviation from a nonnegative target, not a negative "variation rate."

```text
V_observed(w) ∈ ℝ≥0
V_target      ∈ ℝ≥0

V_observed(w) :=
  implementation-bound measure of cross-observer epistemic divergence
  on overlap locales

ΔV(w) := V_observed(w) − V_target
```

The implementation MUST bind the exact divergence metric used to compute `V_observed`.

```text
ΔV < 0:
  settling
  less epistemic variation than target

ΔV = 0:
  critical regime
  variation at target

ΔV > 0:
  diverging
  more epistemic variation than target
```

### 16.2 Distinct control channels

The following controls are not interchangeable:

```text
τ policy:
  governs which locally valid Certificates are eligible for shared
  promotion through LiftClaims

σ / coupling policy:
  governs whether measurements commit at all

measurement admissibility:
  governs which candidate measurements may become valid Certificates

gluing compatibility:
  governs whether locally admissible promoted propositions can coexist
  in shared epistemic state
```

### 16.3 Immune-analog mechanics

```text
TOLERANCE:
  modulates LiftClaim margin policy τ
  controls shared epistemic admission

DEFENSE:
  enforces measurement admissibility and gluing compatibility
  rejects inadmissible or jointly inconsistent shared promotion

RATE GOVERNANCE:
  modulates the authorized coupling regime and/or τ policy according to
  a bound controller whose objective is ΔV → 0
```

A conforming implementation MUST state which control variable or variables its rate governor changes.

The immune analogy is descriptive of this governed controller; it is not a substitute for the controller definition.

---
## 17. 24-cell anomaly in multiplayer (v0.3)

### 17.1 Governance margin and measurement stability

```text
μ(E,w) := governance margin of entity E at worldline w

μ > 0:
  entity can separate maintenance from action
  admitted measurement does not destabilize OnticWorldState merely by occurring
  multiple observers may measure independently
  Certificates can remain stable

μ = 0:
  entity cannot separate maintenance from action
  an admitted MEASURE event MAY be ontically perturbative
  only an upstream-authorized measurement rule may perform that perturbation
```

Attaching Π1, Π2, or Π3 is never such a perturbation.

### 17.2 Autoimmune mechanic

```text
AUTOIMMUNE_TRIGGER :=
  μ(E,w) = 0
  AND
  multiple admitted MEASURE(obs,E,w) events occur under the authorized
  zero-margin perturbation rule
```

Possible governed consequence:

```text
ontic perturbation may occur
→ observers may obtain contradictory local Certificates
→ both local Certificates remain valid if each measurement committed lawfully
→ each observer retains their local Certificate
→ locally admissible LiftClaims may still be jointly incompatible
→ gluing may fail
→ shared Lift/OBF promotion is BLOCKED
→ no glued shared fact is established
```

This does NOT mean the entity was "unmeasured."

The local measurements occurred.

The failure is at the shared epistemic promotion boundary.

### 17.3 Competitive strategy

```text
ATTACK:
  drive entity's μ toward 0
  induce authorized simultaneous measurement events
  exploit possible ontic perturbation and shared gluing failure

DEFENSE:
  maintain entity's μ > 0
  coordinate measurement events
  preserve stable Certificates and compatible shared facts

COOPERATION:
  share compatible sheaf sections with teammates
  combined witness coverage exceeds individual coverage
  geometrically rewarded cooperation
```

---
## 18. Presentation projections

For a constituted entity E at w, as measured by observer obs:

```text
Πk(M_obs(E,w)) := presentation projection of observer's committed measurement

Πk : CommittedMeasurement × PresentationContract_k
     → PresentationOutput_k
```

Presentation outputs are NONCANONICAL.

A projector MAY fail to render. Projector failure MUST NOT imply entity nonexistence.

In multiplayer, each observer's presentation shows THEIR measurement of the entity, not the entity's canonical state directly.

---

## 19. Presentation toggle

The toggle changes the active presentation projector for ONE observer.

```text
Toggle(Πi → Πj, obs, E(w)) :=
  active_projection_obs := Πj

The toggle MUST preserve:
  world_ref
  entity_ref
  w
  canonical world state
  constitutive activity
  □G / □S / □F witness state
  canonical_state_digest
  observer's committed measurements
  sheaf sections

Only presentation state may change.
```

---

## 20. Presentation strip law

```text
REMOVE Π1          → E(w) remains
REMOVE Π2          → E(w) remains
REMOVE Π3          → E(w) remains
REMOVE Π1,Π2,Π3    → E(w) remains

provided the constitutive activity still satisfies □G ∧ □S ∧ □F.
```

---

## 21. Constitutive strip law

```text
REMOVE □G → ENTITY := NO
REMOVE □S → ENTITY := NO
REMOVE □F → ENTITY := NO
```

The constitutive strip law and presentation strip law are distinct and MUST NOT be conflated.

---

## 22. Headless invariance

Headless invariance applies to the ontic trace under the SAME admitted semantic event sequence.

Projector attachment alone is observational.

```text
same initial OnticWorldState
+ same admitted semantic actions
+ same admitted measurement events
+ same ontic-affecting measurement replay inputs

→ same ONTIC_TRACE
```

Therefore:

```text
HEADLESS_ONTIC_TRACE
=
Π1_ATTACHED_ONTIC_TRACE
=
Π2_ATTACHED_ONTIC_TRACE
=
Π3_ATTACHED_ONTIC_TRACE
```

provided those runs receive the same admitted semantic actions and measurement events.

A headless run with no MEASURE event is NOT required to equal a run containing an authorized ontically perturbative measurement event.

Epistemic traces may differ when observer sets, measurement events, or MeasurementReplayContracts differ.

Presentation traces may differ by surface even when ontic and epistemic traces are identical.

---
## 23. World composition

```text
asset presence      ≠ entity existence
glyph presence      ≠ entity existence
carrier drawing     ≠ entity existence
renderer visibility ≠ entity existence
observer measurement ≠ entity existence
```

An entity does not exist because it is measured.
An entity is measured because it exists and the observer's coupling exceeds σ_crit.

---

## 24. Canonical topology authority

Canonical traversability, obstruction, spatial support, and world transitions belong to the governed world.

Presentation surfaces and observer measurements MUST NOT decide:

```text
canonical collision
canonical traversability
entity successor state
entity existence
worldline successor
governed topology mutation
constitutive witness satisfaction
```

---

## 25. Conformance vectors

### CW01–CW10: World and constitution (v0.1 intent preserved)

```text
CW01  w is explicit and non-spatial.
CW02  OnticWorldState contains no projector-specific or observer-epistemic fields.
CW03  one immutable WorldFixtureV1 is bound per governed run.
CW04  presentation cannot mutate WorldFixtureV1.
CW05  ENTITY(e,w) requires simultaneous □G, □S, □F of the SAME A(e,w).
CW06  failure of □G yields ENTITY := NO.
CW07  failure of □S yields ENTITY := NO.
CW08  failure of □F yields ENTITY := NO.
CW09  entity_ref alone cannot establish ENTITY.
CW10  canonical digest is evidence, not constitutive authority.
```

### CW11–CW21: Presentation (v0.1 intent preserved)

```text
CW11  Π1 reads committed state and has zero constitutive authority.
CW12  Π2 reads committed state and has zero constitutive authority.
CW13  Π3 reads committed state and has zero constitutive authority.
CW14  presentation toggle preserves E(w), OnticWorldState, and canonical-state digest.
CW15  removing Π1 preserves ontic execution.
CW16  removing Π2 preserves ontic execution.
CW17  removing Π3 preserves ontic execution.
CW18  removing all presentation projectors preserves ontic execution.
CW19  headless and attached ONTIC_TRACE are equal under identical admitted semantic events.
CW20  projection-output digests may differ without threatening canonical identity.
CW21  renderer failure does not imply entity nonexistence.
```

### CW22–CW28: Authority (v0.1 intent preserved)

```text
CW22  presentation output cannot become ontic or epistemic input without separate authority.
CW23  canonical topology is owned only by OnticWorldState.
CW24  projectors cannot decide constitutive witness satisfaction.
CW25  worldline advances only through governed transition.
CW26  same E(w) disclosed through Π1/Π2/Π3 binds the same canonical entity evidence.
CW27  constitutive strip law and presentation strip law remain distinct.
CW28  no presentation asset is required for headless entity existence.
```

### CW29–CW44: Multiplayer epistemic machinery (v0.3 repaired)

```text
CW29  EpistemicState is distinct from OnticWorldState and PresentationState.
CW30  observer measurement does not constitute entity existence.
CW31  two observers may hold different locally valid Certificates for the same E(w).
CW32  Gap Lemma selection uses a fully bound MeasurementReplayContract.
CW33  β_obs(E,w) and σ_obs(E,w) are observer/entity/worldline-specific, not scalar presentation fields.
CW34  same MeasurementReplayContract + same R(E,w) + same kernel inputs yields identical measurement outcome.
CW35  ATTACH_PROJECTOR causes no ontic or epistemic transition.
CW36  MEASURE is a governed semantic event and may alter OnticWorldState only under explicit upstream authority.
CW37  Certificate validity is local and does not imply OBF/shared-fact status.
CW38  LiftClaim admissibility imports ENTITY(E,w) and does not re-decide □G ∧ □S ∧ □F.
CW39  gluing uses an explicit CONSISTENT(M_A,M_B,E,w) predicate; consistency need not be byte equality.
CW40  gluing failure blocks shared promotion but preserves locally valid Certificates.
CW41  μ = 0 simultaneous authorized measurements may perturb ontology and yield contradictory local Certificates without erasing those measurements.
CW42  V_observed and V_target are nonnegative; ΔV = V_observed − V_target is the signed rate-governor signal.
CW43  the implementation binds which control channel(s) regulate ΔV: τ policy, coupling policy, admissibility, and/or gluing policy.
CW44  presentation is deterministic given committed M_obs(E,w) + bound PresentationContract and has zero ontic/epistemic authority.
```

```text
VECTOR_CENSUS := 44
```

---
## 26. Deterministic replay

### 26.1 Ontic replay

For an identical:

```text
initial OnticWorldState
WorldFixtureV1
kernel realization
admitted semantic action sequence
admitted measurement-event sequence
ontic-affecting measurement replay inputs
```

the ontic trace bytes MUST be byte-identical.

Projector attachment does not enter this semantic event sequence.

### 26.2 Epistemic replay

Measurement replay is deterministic only under a fully bound `MeasurementReplayContract`.

For the same:

```text
OnticWorldState at measurement
observer apparatus state
coupling state
R(E,w)
Gap Lemma kernel
MeasurementReplayContract
```

the measurement outcome and resulting epistemic transition MUST replay identically.

A different admitted random-source seed MAY produce a different admissible epistemic outcome.

### 26.3 Presentation replay

For the same committed measurement and the same bound PresentationContract:

```text
presentation output := deterministic
```

subject to the representation contract of that presentation surface.

### 26.4 Cross-surface invariant

Across headless, carrier-attached, ASCII-attached, and, when implemented, Gaussian-attached execution:

```text
same semantic events
→ same ONTIC_TRACE
```

Presentation bytes are not required to match across different projectors.
Epistemic traces are required to match only when observer sets and MeasurementReplayContracts are also identical.

---
## 27. Regression requirement

Implementation MUST preserve all previously promoted conformance and evidence suites.

---

## 28. Product evidence

```text
STATUS := PRODUCT_EVIDENCE
NORMATIVE_CONFORMANCE_AUTHORITY := NONE
```

Desired single-player experience:

```text
encounter entity through composed surface
change witness regime (toggle)
observe executable / legible disclosure
return to composed surface
entity continued to unfold
```

Desired multiplayer experience:

```text
two players encounter the same entity
one is NEAR (high β, sharp measurement)
one is FAR (low β, diffuse measurement)
they see different things about the same entity
NEAR player shares measurement through sheaf gluing
FAR player now has the NEAR player's committed fact
cooperation through governed perception sharing
```

---

## 29. Non-goals

```text
CGP-WORLD-001 does not authorize:

new constitutive physics
replacement of PHYSICS-R&D-001
new Contact-GR laws
new flex law
new operator/witness algebra
renderer-owned entity creation
renderer-owned collision
renderer-owned worldline mutation
presentation-derived canonical identity
network synchronization protocol
NAT traversal or matchmaking
anti-cheat enforcement
observer coupling as a purchasable stat
```

---

## 30. v0.2 → v0.3 repair changelog

```text
REPAIRED:

R1  ONTIC_EPISTEMIC_STATE_SPLIT
    OnticWorldState, EpistemicState, and PresentationState are now distinct.
    observer_registry and perception_sheaf no longer contaminate the ontic trace.

R2  MEASUREMENT_EVENT_VS_PROJECTOR_ATTACHMENT
    projector attachment is observational.
    MEASURE is a governed semantic event.
    μ = 0 perturbation requires explicit upstream authorization.

R3  MEASUREMENT_REPLAY_CONTRACT
    byte-identical measurement replay now binds normalization, numeric domain,
    repair-fiber order, PRNG algorithm/seed, draw consumption, observer, entity,
    worldline, and kernel version.

R4  REMOVE_L0_L4_MEASUREMENT_CONFLATION
    measurement is its own regime.
    Rayna/rendering L0–L4 hierarchy is not used as the stochastic boundary.

R5  TYPE_RATE_GOVERNOR
    V_observed,V_target ∈ ℝ≥0.
    ΔV := V_observed − V_target is the signed control signal.
    τ, coupling, admissibility, and gluing are distinct control channels.

R6  REPAIR_CERTIFICATE_LIFT_GLUE_SEMANTICS
    Certificate validity is local.
    LiftClaim admissibility is local promotion eligibility.
    gluing is joint compatibility.
    gluing failure blocks shared promotion without invalidating local Certificates.
    LiftClaim imports ENTITY(E,w) and does not re-decide □G ∧ □S ∧ □F.

UNCHANGED:

  CGP constitutive predicate
  □G / □S / □F machine-realization intent
  worldline semantics
  WorldFixtureV1
  presentation nonauthority
  constitutive strip law
  presentation strip law
  canonical topology authority
  v0.1 CW01–CW28 intent
  upstream PHYSICS-R&D-001 authority
  predecessor regression requirement

NEW GAMEPLAY:
  NONE

NEW CONSTITUTIVE PHYSICS:
  NONE

STATUS:

  SPEC_CGP_WORLD_001_v0_3 := PROPOSED
  REVIEW                   := REQUIRED
  DECIDE                   := NOT YET
  PROMOTE                  := FORBIDDEN
  IMPLEMENTATION           := BLOCKED
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇

---
