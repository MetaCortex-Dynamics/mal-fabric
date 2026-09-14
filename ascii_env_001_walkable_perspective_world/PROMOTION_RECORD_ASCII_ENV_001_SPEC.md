# Promotion Record — ASCII-ENV-001 Walkable Perspective World Specification

```text
SPEC_ASCII_ENV_001 := PROMOTED

DECISION_AUTHORITY := Devon Generally
DECISION            := ALLOW
PROMOTION           := GRANTED
BUILD               := AUTHORIZED
```

## Bound normative artifact

```text
SPEC:
  SPEC-ASCII-ENV-001-WALKABLE-PERSPECTIVE-WORLD.md

SPEC_COMMIT:
  e100efa1c3e143c1c531082da1c637022d5ded05

SPEC_SHA256:
  C2C37A530B9589FE87D0EA5897826337B6719A15A98FEF5C8828C0E48F59B9A8

FINAL_REVIEW:
  PASS
```

The specification retains its reviewed `Status: PROPOSED` source text. This
record carries Devon's separate decision and promotion authority.

## Imported authority

```text
ASCII_GEN0_PROMOTION_COMMIT:
  210a4af0adde21c8ab5ff81d2f417619d1600d91

ASCII_GEN0:
  PROMOTED + IMMUTABLE IMPORT

ArenaSpecV1:
  x := -10..10
  y :=  -6..6
  z :=  -2..2

GEN0_MOVEMENT_PLANE:
  z0 := 0

obstructions := {
  (2, -1, 0),
  (2,  0, 0),
  (2,  1, 0)
}

ADMISSIBILITY_SCOPE := ALL_ENTITY_MOVEMENT
```

## Normative burden

```text
VECTOR_CENSUS := 15
VECTORS       := AE01-AE15

PROJECTION_BYTES_NONCANONICAL := REQUIRED
BYTE_IDENTITY_SCOPE_CLOSED     := REQUIRED
DUPLICATED_FIELD_EQUALITY      := REQUIRED
PRODUCT_EVIDENCE_NONNORMATIVE  := REQUIRED
ASCII_AUTHORITY                := NONE
```

Byte identity is licensed only under one fully bound
`AsciiProjectorContractV1`. A contract mismatch or an unbound required field
must fail closed and forbids the byte-identity claim.

## Exploratory-work exclusion

```text
EXPLORATORY_COMMIT:
  a104950e6afb882107bbc20fd4f431f2965bacbf

STATUS:
  CANDIDATE_ONLY
  NON_AUTHORITATIVE
  NOT_PROMOTED
  NOT_ELIGIBLE_FOR_LOCAL_INTEGRATION
```

This specification promotion does not retroactively authorize the exploratory
implementation, preview, or conformance harness associated with that commit.
A fresh implementation must descend from this promoted specification boundary.

## Promotion scope

This promotion authorizes implementation of ASCII-ENV-001 only.

It does not promote:

```text
any implementation
any implementation evidence
any binding record
any richer renderer
Gaussian or mesh registration
new gameplay mechanics
new movement semantics
renderer-owned physics or line-of-sight semantics
```

## Next lifecycle

```text
SPEC_ASCII_ENV_001 := PROMOTED
IMPLEMENTATION     := NOT_IMPLEMENTED
EVIDENCE           := OPEN
BINDING             := OPEN
IMPLEMENTATION_PROMOTION := NOT_PERFORMED

NEXT := IMPLEMENT
     → VERIFY AE01-AE15
     → REPLAY
     → REGRESSION
     → BIND
     → SEPARATE IMPLEMENTATION PROMOTION DECISION
```
