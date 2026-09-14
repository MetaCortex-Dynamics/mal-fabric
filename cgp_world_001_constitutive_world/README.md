# CGP-WORLD-001 Constitutive World

Deterministic reference realization of the promoted CGP-WORLD-001 v0.3
specification.

## Authority

```text
SPEC_COMMIT:
  1fff98bd542c92c1b04adde5e5990fd7a7be4ab8

SPEC_PROMOTION_COMMIT:
  99034064a8c733933192923c0704868ec701cd46

SPEC_SHA256:
  7F3F784F0BACED1F0D6521B78123DE9FCE88242466B19B73E47AD1B01B2B0788

IMPLEMENTATION_PROMOTION:
  NOT_PERFORMED
```

The reference kernel imports the promoted bounded Contact-GR / Constructive
Substrate realization for joint-state evolution. It does not redefine that
physics or treat a predecessor implementation as mathematical authority.

## State separation

```text
OnticWorldState
  canonical, observer-independent, presentation-independent

EpistemicState
  observer-specific Certificates, LiftClaims, gluing, shared facts

PresentationState
  camera/surface-local, noncanonical, zero semantic authority
```

Projector attachment is not a measurement event. Measurement is a governed
semantic event and may perturb ontology only at zero governance margin under
explicit authorization.

## Bound deterministic measurement realization

```text
numeric domain:
  Q32.32

normalization:
  EXP_NEG_Q32_TAYLOR18_LN2_REDUCTION_V1

repair-fiber enumeration:
  measurement_id ascending

random source:
  SHA256_COUNTER_V1

draw consumption:
  one draw per committed measurement

gluing compatibility:
  OUTCOME_DISTANCE_LE_ONE_V1

divergence metric:
  Q32.32 mean of incompatible overlap-pair indicators

rate-governor channel:
  TAU_POLICY_ONLY

tau adjustment quantum:
  1/16 in Q32.32
```

Different measurements may glue when compatible; gluing is not byte equality.
Gluing failure preserves locally valid Certificates and blocks only shared-fact
promotion.

## Run

```powershell
python run_conformance.py
```

The runner executes CW01–CW44 twice, emits 44 receipts plus one summary, checks
the promoted upstream identities, and replays the full promoted predecessor
floor.

```text
CGP-WORLD-001       44/44
evidence            45/45 BYTE_IDENTICAL
prior conformance   366/366 UNCHANGED
prior evidence      337/337 BYTE_IDENTICAL
```

## Lifecycle

```text
TECHNICAL_EVIDENCE       := CLOSED
ARTIFACT_IDENTITY        := OPEN
BINDING                  := OPEN
IMPLEMENTATION_PROMOTION := NOT_AUTHORIZED
```
