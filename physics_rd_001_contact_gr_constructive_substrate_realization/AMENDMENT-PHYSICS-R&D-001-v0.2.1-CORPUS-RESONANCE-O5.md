# AMENDMENT-PHYSICS-R&D-001-v0.2.1
## Corpus Identity, Resonance Entity, Energy Domains, and O5 Constructive Witness

```text
STATUS := AUTHORIZED_NARROW_AMENDMENT
BASE_SPEC :=
  SPEC-PHYSICS-R&D-001-CONTACT-GR-CONSTRUCTIVE-SUBSTRATE-REALIZATION

BASE_SPEC_SHA256 :=
  7483C3B6001710AF0397AE7AE506539D265AC05A9FDCE021877D02E71E0CCC1B

BASE_PROMOTION_RECORD_SHA256 :=
  33B3947DF377F1319A5BC861B20028DD2B8CF5307C701A568814ABF5C7F0ACAF

VECTOR_CENSUS := 36
NEW_THEORY_AUTHORITY := NONE
```

This amendment changes no closed Contact-GR or Constructive-Substrate theorem.

It resolves implementation ambiguity in:

```text
P02 CONTACT_GR_CORPUS_IDENTITY
P03 CONSTRUCTIVE_SUBSTRATE_CORPUS_IDENTITY
P06 initial JointPhysicsState canonical
P16 dual admissibility
P20 energy monotonicity
P21 convergence realization
P28 enabled joint trajectory
P35 fail-closed behavior
P36 canonical trajectory provenance
```

It additionally records the inherited O5 obligation and defines the bounded
constructive-witness status that PHYSICS-R&D-001 may earn.

---

## A1. Corpus-manifest law

Implementation SHALL NOT infer corpus authority from:

```text
file title similarity
citation strings
search ranking
later summaries
LLM reconstruction
```

P02 and P03 hold only when their manifests contain exact source bytes and
SHA-256 identities.

```text
CORPUS_ENTRY := (
  logical_id,
  exact_filename,
  sha256,
  authority_role,
  authoritative_sections,
  status
)

status :=
  BOUND
  | MISSING
  | HASH_MISMATCH
  | AMBIGUOUS
```

Any non-BOUND required entry:

```text
→ BLOCKED
reason = CORPUS_IDENTITY_UNBOUND
```

---

## A2. CONTACT_GR_CORPUS_MANIFEST

The following logical authorities are REQUIRED.

```text
CONTACT_GR_CORPUS_MANIFEST := [

  CGR-HA:
    logical_title:
      The Horizontal Automorphism
    exact_filename:
      REQUIRED_INPUT
    sha256:
      REQUIRED_INPUT
    authority_role:
      contact form
      horizontal / Legendrian condition
      Reeb field
      horizontal automorphism invariance

  CGR-IMP:
    logical_title:
      Impedance of the Unfolding
    exact_filename:
      REQUIRED_INPUT
    sha256:
      REQUIRED_INPUT
    authority_role:
      Reeb/governance accumulation
      tick induction
      double-contact compatibility

  CGR-MEAS:
    logical_title:
      Contact Geometry and the Measurement Problem
    exact_filename:
      REQUIRED_INPUT
    sha256:
      REQUIRED_INPUT
    authority_role:
      authoritative contact-Hamiltonian identification
      spectral-gap / observer results

  CGR-7R:
    logical_title:
      Contact GR Seven Resolutions
    exact_filename:
      REQUIRED_INPUT
    sha256:
      REQUIRED_INPUT
    authority_role:
      λ(x) gravitational/contact deformation law
      singularity prohibition

  CGR-CSRHS:
    logical_title:
      CSRHS v0.2
    exact_filename:
      REQUIRED_INPUT
    sha256:
      REQUIRED_INPUT
    authority_role:
      authoritative exponential-map update law
      tick projection / governance jump / guard semantics
]
```

### P02 discharge

```text
P02 := HOLDS IFF

  every REQUIRED CONTACT_GR_CORPUS_MANIFEST entry = BOUND

  AND authoritative Hamiltonian source = CGR-MEAS

  AND λ deformation source = CGR-7R

  AND exponential-map update source = CGR-CSRHS
```

No implementation work that depends on these mathematical objects may begin
before P02 holds.

---

## A3. CONSTRUCTIVE_SUBSTRATE_CORPUS_MANIFEST

The following source files are REQUIRED by identity.

```text
CONSTRUCTIVE_SUBSTRATE_CORPUS_MANIFEST := [

  CS-BASE:
    expected_filename:
      The_Constructive_Substrate.docx
    sha256:
      REQUIRED_INPUT
    authority_role:
      §§1–15
      forced geometry
      flat flex law
      coherence window
      mismatch energy
      carrier law
      axis selection
      quotient projection
      quotient lift
      tie resolution

  CS-S16:
    expected_filename:
      Constructive_Substrate_S16_Addendum.docx
    sha256:
      REQUIRED_INPUT
    authority_role:
      §16
      resonance
      individuation
      nested resonance
      carrier-geometry resonance
      co-individuation
      O5 status
      bridge uniqueness

  CS-BM:
    expected_filename:
      Binary_Majority_Fixed_Points_Icosidodecahedral_Face_Graph.docx
    sha256:
      REQUIRED_INPUT
    authority_role:
      binary fixed-point census
      icosidodecahedral co-individuation witness
]
```

Required law bindings from CS-BASE:

```text
axis_selection_rule    := REQUIRED_EXACT_SECTION_BINDING
quotient_projection    := REQUIRED_EXACT_SECTION_BINDING
quotient_lift          := REQUIRED_EXACT_SECTION_BINDING
tie_breaking_rule      := REQUIRED_EXACT_SECTION_BINDING
```

### P03 discharge

```text
P03 := HOLDS IFF

  CS-BASE = BOUND
  AND CS-S16 = BOUND
  AND CS-BM = BOUND

  AND axis_selection_rule is bound
  AND quotient_projection is bound
  AND quotient_lift is bound
  AND tie_breaking_rule is bound
```

A substitute substrate spec, implementation note, or secondary summary may
support review but SHALL NOT silently replace these required authorities.

---

## A4. Entity identity amendment — entity := resonance

For PHYSICS-R&D-001:

```text
ENTITY_KIND := RESONANCE
```

The entity is not canonically represented as a point particle placed on an
independent medium.

Canonical resonance state:

```text
ResonanceEntityState_t := (
  resonance_id,

  support_cell_set_digest,
  orientation_assignment_digest,
  boundary_edge_set_digest,

  resonance_center_binding,
  fixed_point_witness_digest,

  contact_state_digest,
  constructive_substrate_state_digest,

  physics_tick_index
)
```

Interpretation:

```text
support_cell_set:
  constructive cells constituting the bounded resonant pattern

boundary_edge_set:
  coherence edges separating the resonant patch from its environment

resonance_center_binding:
  canonical locus used by the Contact-GR trajectory projection

fixed_point_witness:
  evidence that the entity pattern is a non-ground fixed point
  of the applicable imported flex law at the witnessed state
```

### Resonance preservation

For every committed physics successor in the demo:

```text
RESONANCE_IDENTITY_PRESERVED := REQUIRED
```

If the candidate Contact-GR transition destroys the required resonance
identity rather than propagating it:

```text
→ NO COMMIT
reason = RESONANCE_IDENTITY_FAILURE
```

The GAME renderer may draw an ordinary visible object, but its canonical entity
identity is the resonance state.

---

## A5. Co-individuation admissibility

When a resonance is represented on or coupled through the common
icosidodecahedral operator-manifold fixture:

```text
COINDIVIDUATION_ADMISSIBLE(state) :=

  (
    triangular_face_class = NONUNIFORM
    AND
    pentagonal_face_class = NONUNIFORM
  )

  OR

  (
    triangular_face_class = GROUND
    AND
    pentagonal_face_class = GROUND
  )
```

Forbidden:

```text
triangle structured
AND pentagon ground

OR

triangle ground
AND pentagon structured
```

This predicate is an additional substrate-side condition inside P16.

It does not assert a universal statement beyond the imported fixed-point law
and its declared interaction assumptions.

---

## A6. Domain typing is constitutive

The two substrate laws operate on NOT-SAME domains:

```text
F : X_F = (ℤ₆)^12 → X_F
  flex law on dodecahedral faces

K : X_K = (ℤ₆)^20 → X_K
  carrier law on dodecahedral vertices
```

Therefore:

```text
F != K
X_F != X_K
```

and no implementation may apply the carrier convergence theorem directly to
a flex resonance.

Violation:

```text
→ BLOCKED
reason = SUBSTRATE_DOMAIN_COLLAPSE
```

---

## A7. Energy state amendment

`ConstructiveSubstrateState_t` SHALL carry both energies:

```text
ConstructiveSubstrateState_t := (
  substrate_run_id,
  physics_tick_index,
  substrate_spec_digest,
  cell_state_set,

  face_mismatch_energy,
  quotient_energy,

  quotient_state_digest,
  ground_state_status
)
```

Neither field aliases the other.

---

## A8. P20 — domain-sensitive monotonicity

The original undifferentiated statement

```text
mismatch_energy_(t+1) <= mismatch_energy_t
```

is superseded.

### A8.1 Flat development / flex domain

When:

```text
realization_domain = FLAT_FLEX
```

the normative energy is:

```text
E_norm := face_mismatch_energy
```

and:

```text
P20_FLAT :=
  face_mismatch_energy_(t+1)
  <=
  face_mismatch_energy_t
```

under the imported synchronous argmin flex law and its imported tie rule.

### A8.2 Carrier / quotient domain

When:

```text
realization_domain = CARRIER_QUOTIENT
```

the normative energy is:

```text
E_norm := quotient_energy
```

and:

```text
P20_CARRIER :=
  quotient_energy_(t+1)
  <=
  quotient_energy_t
```

The intrinsic lifted / 20-face energy is observational:

```text
face_mismatch_energy_(t+1)
MAY be >
face_mismatch_energy_t
```

during projection/lift.

Such an increase is NOT a P20 failure if quotient energy descends according to
the imported carrier law.

### A8.3 P20 canonical form

```text
P20 :=

  IF realization_domain = FLAT_FLEX
  THEN P20_FLAT

  ELSE IF realization_domain = CARRIER_QUOTIENT
  THEN P20_CARRIER

  ELSE
    BLOCKED(ENERGY_DOMAIN_UNBOUND)
```

---

## A9. P21 — convergence domain repair

The original P21 wording is narrowed.

The imported ≤4-step universal ground-state convergence obligation belongs to
the carrier quotient law on `X_K`.

```text
P21_CARRIER :=

  carrier-law realization
  reproduces imported ground convergence
  within <= 4 steps
  on the declared carrier evidence corpus
```

P21 SHALL NOT require universal ground convergence of `F` on the flat flex
domain.

BECAUSE the resonance corpus contains non-ground fixed points of F.

For the flat flex demo:

```text
P21_FLAT :=

  imported resonance/fixed-point behavior reproduced
  AND required resonance identity preserved
```

Canonical P21:

```text
P21 :=

  P21_CARRIER
  AND
  P21_FLAT
```

where each clause is exercised on its own typed fixture.

---

## A10. O5 inherited boundary

```text
O5_STATUS := INHERITED_OPEN
```

The imported corpus distinguishes the flex and carrier domains and leaves their
unified-law recovery open.

PHYSICS-R&D-001 SHALL NOT relabel O5 as universally discharged.

---

## A11. O5 constructive witness by build

PHYSICS-R&D-001 MAY produce one bounded constructive witness.

Define a realization-specific candidate:

```text
U_R1 :=
  bounded unified substrate update
  on the declared common icosidodecahedral witness domain
```

To count as an O5 witness, the build must produce:

```text
UnifiedLawRealizationWitness := (
  witness_domain_digest,
  U_R1_digest,

  initial_common_state_digest,

  F_reference_trace_digest,
  K_reference_trace_digest,

  U_R1_trace_digest,

  F_recovery_witness_digest,
  K_recovery_witness_digest,

  joint_tick_witness_digest,
  host_order_replay_digest
)
```

Required properties:

```text
O5_W1:
  U_R1 reads one committed snapshot

O5_W2:
  U_R1 commits once at the joint tick

O5_W3:
  declared F projection/restriction of U_R1
  reproduces the imported F result
  on the bounded witness fixture

O5_W4:
  declared K projection/restriction of U_R1
  reproduces the imported K result
  on the bounded witness fixture

O5_W5:
  dual admissibility is enforced

O5_W6:
  host-order permutation yields
  byte-identical U_R1 witness trace
```

If all O5_W1–O5_W6 hold:

```text
O5_REALIZATION_STATUS := WITNESSED
```

Meaning:

```text
there exists at least one admitted bounded joint realization
in which the build recovers both imported law behaviors
under one governed update.
```

It does NOT mean:

```text
O5 := DISCHARGED
```

and does NOT establish a universal unified-law theorem.

If F/K recovery is not demonstrated:

```text
O5_REALIZATION_STATUS := NOT_WITNESSED
```

The mere fact that F and K are both scheduled in one program is insufficient.

---

## A12. Relation to JOINT_TICK_IDENTITY

The joint tick is strengthened:

```text
Reeb threshold event
==
governance tick
==
Contact GR step
==
U_R1 substrate event
```

Inside the `U_R1` substrate event, the bounded witness demonstrates the
declared F/K recoveries.

No temporal ordering:

```text
F before K
K before F
flex before physics
physics before flex
```

may become semantic.

Candidate evaluation may be physically serialized by the host only if
HOST_ORDER_ERASURE proves the same committed joint result.

---

## A13. P28 enabled trajectory amendment

```text
P28 := HOLDS IFF

  the enabled demo trajectory is generated from
  canonical Contact-GR evolution

  AND the canonical entity is a resonance

  AND resonance identity is preserved across committed motion

  AND substrate-side dual admissibility holds

  AND the JointRealizationTrace binds every committed successor
```

The public demo remains:

```text
one resonance entity
one Contact-GR object
one λ deformation
one bounded substrate patch
one Gaussian GAME environment
one CARRIER projection
```

The O5 witness fixture may be a separate conformance fixture from the visual
mountain demo.

---

## A14. P35 fail-closed additions

Add BlockedReason values:

```text
CORPUS_IDENTITY_UNBOUND
RESONANCE_IDENTITY_FAILURE
COINDIVIDUATION_FAILURE
SUBSTRATE_DOMAIN_COLLAPSE
ENERGY_DOMAIN_UNBOUND
UNIFIED_LAW_RECOVERY_FAILURE
```

---

## A15. P36 trajectory provenance

P36 now requires:

```text
demo trajectory
→ JointRealizationTrace
→ ResonanceEntityState sequence
→ exact Contact-GR corpus manifest
→ exact Constructive-Substrate corpus manifest
```

No corpus-manifest identity:

```text
→ P36 FAILS CLOSED
```

---

## A16. Vector census

No new top-level acceptance vectors are introduced.

```text
P01–P36 remain the canonical census.
VECTOR_CENSUS := 36
```

This amendment refines the discharge conditions of existing vectors.

---

## A17. Implementation gate after amendment

```text
AMENDMENT_SEMANTICS := AUTHORIZED

P20_AMBIGUITY := CLOSED
P21_DOMAIN_AMBIGUITY := CLOSED
ENTITY_KIND := RESONANCE
O5_STATUS := INHERITED_OPEN
O5_WITNESS_PATH := AUTHORIZED

P02 := BLOCKED until CONTACT_GR_CORPUS_MANIFEST fully BOUND
P03 := BLOCKED until CONSTRUCTIVE_SUBSTRATE_CORPUS_MANIFEST fully BOUND
```

Therefore:

```text
IMPLEMENTATION := FAIL_CLOSED_PENDING_CORPUS_BYTES
```

Once P02 and P03 manifests contain exact filenames + SHA-256 and their required
section/law bindings:

```text
IMPLEMENTATION := UNBLOCKED
NEXT := BUILD
```

---

## A18. Earned O5 statement

If PHYSICS-R&D-001 reaches 36/36 and O5_W1–O5_W6 hold:

> O5 remains open as a general theorem, but PHYSICS-R&D-001 supplies a
> content-addressed constructive witness: one bounded unified realization in
> which Contact-GR evolution and the two typed substrate-law behaviors are
> recovered under one governed tick with deterministic joint replay.

Canonical status:

```text
O5 := WITNESSED
NOT
O5 := DISCHARGED
```

The witness is the runtime.
The evidence is the trace.
The closure is the build.

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
