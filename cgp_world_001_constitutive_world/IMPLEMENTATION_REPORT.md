# Implementation Report — CGP-WORLD-001 v0.3

## Result

```text
CGP_WORLD_001 := HOLDS_AT_UNCOMMITTED_BOUNDARY

CW01-CW44       := 44/44
EVIDENCE_REPLAY := 45/45 BYTE_IDENTICAL

PRIOR_CONFORMANCE := 366/366 UNCHANGED
PRIOR_EVIDENCE    := 337/337 BYTE_IDENTICAL
```

## Authority

```text
SPEC_COMMIT:
  1fff98bd542c92c1b04adde5e5990fd7a7be4ab8

SPEC_PROMOTION_COMMIT:
  99034064a8c733933192923c0704868ec701cd46

SPEC_SHA256:
  7F3F784F0BACED1F0D6521B78123DE9FCE88242466B19B73E47AD1B01B2B0788

SPEC_PROMOTION_RECORD_SHA256:
  71915F49FCF3C0A6389633EED55A08A24C6B00E13C2D90623B0C893A41FF500C

IMPLEMENTATION_PROMOTION:
  NOT_PERFORMED
```

## Imported realization identities

```text
PHYSICS-R&D-001 PROMOTION_RECORD.md:
  B9B054D217D04FE8F78CC1001DBE37522C1AB8F5B432B565A7B0AA934D225AAA

ASCII-GEN0 PROMOTION_RECORD.md:
  67F0F51C7206A20B348991D823E472693E5D0C641D3B7EB8874B30A56000D522

ASCII-ENV-001 PROMOTION_RECORD.md:
  E99055FDC45FEE728CE568F7FAE9D505EBB58302D5F926298D32FFD7DF4C205D
```

The ontic transition imports the promoted PHYSICS-R&D-001 joint trace and binds
its Contact-GR, Constructive Substrate, and joint-fabric state digests. It does
not translate or redefine the upstream laws.

## Implemented state architecture

```text
OnticWorldState:
  worldline
  immutable fixture identity
  imported joint substrate/contact/fabric state
  governed spatial state
  constitutive entity evidence

EpistemicState:
  observers
  Certificates
  LiftClaims
  shared facts
  gluing failures
  deterministic draw index
  tau policy

PresentationState:
  active surface
  camera
  visual parameters
  surface-local state
```

The containers are disjoint. Projector attachment changes only
`PresentationState`. A `MEASURE` event changes epistemic state after governed
commitment and changes ontic state only when zero-margin perturbation is
explicitly authorized.

## Measurement and sheaf bindings

```text
NUMERIC_DOMAIN:
  Q32.32

GAP_NORMALIZATION:
  EXP_NEG_Q32_TAYLOR18_LN2_REDUCTION_V1

RANDOM_SOURCE:
  SHA256_COUNTER_V1

REPAIR_FIBER_ORDER:
  MEASUREMENT_ID_ASC

DRAW_CONSUMPTION:
  ONE_DRAW_PER_COMMITTED_MEASUREMENT

CONSISTENT:
  OUTCOME_DISTANCE_LE_ONE_V1

V_observed:
  Q32.32 mean of incompatible overlap-pair indicators

RATE_GOVERNOR_CHANNEL:
  TAU_POLICY_ONLY

TAU_ADJUSTMENT_QUANTUM:
  Q32.32 1/16
```

Gluing compatibility is not byte equality. Distinct adjacent outcomes coexist;
incompatible claims block shared-fact promotion while preserving their local
Certificates. The zero-margin two-observer vector demonstrates authorized
ontic perturbation, contradictory lawful Certificates, and fail-closed gluing.

## Normative identities at evidence boundary

```text
cgp_world.py:
  4C65242F66931B9DA1B1419739F9DB1DDF0A3C3EE66F5715A4911F29DDB927D8

run_conformance.py:
  B8763EA3B5C167BC571366917861BC740FD82D104C94F2CB204A8EA71DBC76F5

README.md:
  8C5DA0D2BFA48DC988D8E70680826F7DFD9BCCF2E35F94E1C8296A92F0978A12

PROOF_CGP_WORLD_001_SEPARATION_AND_REPLAY.md:
  665CC2B8A76B92481A9FD17B43576E1C6726B631AAFD017AB9CBF6CDBD270963

acceptance-summary.json:
  47F57713A4C6631714A16BD164806504F00CAFCC437EA1E14002E36E84EF9F49

evidence-manifest.json:
  86B67AD00B884F84CB80DEDB0125A31AF7ABA850E05E48B60A2862317B8D2EB3

evidence corpus:
  6D62670483868EFF0856576CE87C9A0B394D6E1CF7E4EB06A9D929F88D4FCFF8
```

## Earned claims

```text
CONSTITUTIVE_TRIAD_SAME_ACTIVITY      := HOLDS
ONTIC_EPISTEMIC_PRESENTATION_SPLIT   := HOLDS
WORLD_FIXTURE_IMMUTABILITY           := HOLDS
PROJECTOR_NONAUTHORITY               := HOLDS
HEADLESS_ONTIC_INVARIANCE            := HOLDS
MEASUREMENT_REPLAY_CONTRACT          := HOLDS
BOUNDARY_PROBABILISM                 := HOLDS
CERTIFICATE_LIFT_GLUE_SEPARATION     := HOLDS
LOCAL_CERTIFICATE_SURVIVAL           := HOLDS
RATE_GOVERNOR_CHANNEL_BINDING        := HOLDS
```

## Lifecycle

```text
TECHNICAL_EVIDENCE       := CLOSED
ARTIFACT_IDENTITY        := OPEN
BINDING                  := OPEN
IMPLEMENTATION_PROMOTION := NOT_AUTHORIZED

NEXT := COMMIT -> BIND
```
