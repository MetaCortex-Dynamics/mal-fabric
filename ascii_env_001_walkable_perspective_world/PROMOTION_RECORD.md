# Promotion Record — ASCII-ENV-001 Walkable Perspective World

```text
ASCII_ENV_001 := PROMOTED

SPEC_COMMIT:
  e100efa1c3e143c1c531082da1c637022d5ded05

SPEC_PROMOTION_COMMIT:
  5f852eed331fe97dc542b4a8a4eb3eb3975202e5

IMPLEMENTATION_COMMIT:
  bf0b0204f0fb23f6b1565321b6d2bd49d447e57d

BINDING_COMMIT:
  ced6b96c305d1102d34a45e27e1fa00966fd4ac6

BINDING_RECORD_SHA256:
  F7D159E4E08EB176B5D9740913665FF10E8A179DC6968FE82E3573332B693D95
```

## Promotion basis

```text
NORMATIVE_CONFORMANCE := 15/15
DETERMINISTIC_REPLAY  := 16/16 BYTE_IDENTICAL

PRIOR_CONFORMANCE := 351/351 UNCHANGED
PRIOR_EVIDENCE    := 321/321 BYTE_IDENTICAL

HEADLESS_TRACE:
  7d57b085b085a87ff9be709a0a6df0fbcffd47047830f5e502c01e154e836a2e

ASCII_ATTACHED_TRACE:
  7d57b085b085a87ff9be709a0a6df0fbcffd47047830f5e502c01e154e836a2e

HEADLESS_EQ_ATTACHED := HOLDS
ASCII_AUTHORITY      := NONE
PREDECESSOR_MUTATION := NONE
BEAUTY_PASS_STAGE    := PRESERVED
BOUND_HASHES         := UNCHANGED
```

## Authority boundary

The promoted implementation projects only immutable committed state. It may
choose presentation layout, glyphs, palette entries, and camera orientation,
but it cannot advance the worldline, admit movement, calculate entity behavior,
or mutate the canonical trace.

`local_adapter.py` remains translation-only. The promoted ASCII-GEN0 kernel is
the sole authority for player movement, enemy behavior, obstruction decisions,
and logical-tick progression.

```text
PROJECTION_BYTES_NONCANONICAL := HOLDS
DUPLICATED_FIELD_EQUALITY     := HOLDS
PROJECTOR_ATTACHED_OR_ABSENT  := CANONICAL_TRACE_IDENTICAL
```

## Result

```text
TECHNICAL_EVIDENCE       := CLOSED
ARTIFACT_IDENTITY        := CLOSED
BINDING                  := CLOSED
IMPLEMENTATION_PROMOTION := CLOSED
PUBLICATION              := OPEN
```
