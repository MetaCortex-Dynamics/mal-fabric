# Implementation Report — ASCII-ENV-001 Walkable Perspective World

## Result

```text
ASCII_ENV_001 := HOLDS_AT_UNCOMMITTED_BOUNDARY

TECHNICAL_EVIDENCE := CLOSED
ARTIFACT_IDENTITY   := OPEN
BINDING             := OPEN
IMPLEMENTATION_PROMOTION := NOT_AUTHORIZED
```

## Authority

```text
SPEC_COMMIT:
  e100efa1c3e143c1c531082da1c637022d5ded05

SPEC_PROMOTION_COMMIT:
  5f852eed331fe97dc542b4a8a4eb3eb3975202e5

SPEC_SHA256:
  C2C37A530B9589FE87D0EA5897826337B6719A15A98FEF5C8828C0E48F59B9A8

CANDIDATE_ZIP_SHA256:
  ED37922309CFD6F84DC4DEF2A93B27AFDAB71A300800DF451051791A0EF7F56F

EXPLORATORY_COMMIT a104950e:
  NON_AUTHORITATIVE
  NOT_IMPORTED
```

The seven files from the candidate archive were reproduced byte-for-byte. The
local adapter and full evidence runner were added only after the archive passed
its identity and path-safety gates.

## Promoted-kernel binding

```text
ASCII_GEN0_PROMOTION_COMMIT:
  210a4af0adde21c8ab5ff81d2f417619d1600d91

agency_kernel.py SHA256:
  A69AB28712667BF4E0836488A33545115497D0216E9FAE5451C5893689C92A22

ASCII_GEN0 PROMOTION_RECORD.md SHA256:
  67F0F51C7206A20B348991D823E472693E5D0C641D3B7EB8874B30A56000D522
```

`local_adapter.py` verifies both imported byte identities before loading the
promoted kernel. It delegates reset, snapshot reads, player-action submission,
and trace digest retrieval. It contains no movement, collision, behavior, or
worldline transition implementation.

## Conformance

```text
PROJECTOR_LOCAL:
  AE01-AE12 := PASS
  AE15      := PASS

PROMOTED_KERNEL_INTEGRATION:
  AE13 := PASS
  AE14 := PASS

TOTAL := 15/15
```

The duplicated-field equality law also fails closed as required by §6.1.1.

```text
HEADLESS_TRACE_DIGEST:
  7d57b085b085a87ff9be709a0a6df0fbcffd47047830f5e502c01e154e836a2e

ATTACHED_TRACE_DIGEST:
  7d57b085b085a87ff9be709a0a6df0fbcffd47047830f5e502c01e154e836a2e

ATTACHED_EQ_HEADLESS := HOLDS
```

## Deterministic evidence

```text
RECEIPTS := 15
SUMMARY  := 1
EVIDENCE := 16/16 BYTE_IDENTICAL

acceptance-summary.json SHA256:
  68FF93E571697F934058C38AFFD06BFCB09061EB12E3832ACC3341760BD90AAB

evidence corpus SHA256:
  1FBC334FFA3FCD059B69913C5AEB70F1ECD7DC50CE2A1F58672100AFE5A124A6
```

Evidence-corpus hash domain:

```text
16 JSON files in evidence/
sorted by filename
each line := filename<TAB>uppercase-file-sha256<LF>
manifest encoding := UTF-8 without BOM
corpus identity := SHA-256(manifest bytes)
```

The duplicate top-level summary is byte-identical to
`evidence/acceptance-summary.json` and is not counted twice in the evidence
census.

## Regression closure

```text
mal-fabric v0.9.0 floor:
  299/299
  267/267 BYTE_IDENTICAL

PHYSICS-R&D-001:
  36/36
  37/37 BYTE_IDENTICAL

ASCII-GEN0 agency:
  16/16
  17/17 BYTE_IDENTICAL

PRIOR_CONFORMANCE := 351/351 UNCHANGED
PRIOR_EVIDENCE    := 321/321 BYTE_IDENTICAL
```

## Preserved boundary

```text
ASCII_AUTHORITY                  := NONE
PROJECTION_BYTES_NONCANONICAL   := HOLDS
BYTE_IDENTITY_SCOPE_CLOSED      := HOLDS
DUPLICATED_FIELD_EQUALITY       := HOLDS
PRODUCT_EVIDENCE_NONNORMATIVE   := HOLDS
PLAYER_MOVEMENT_AUTHORITY       := PROMOTED_KERNEL_ONLY
ENEMY_BEHAVIOR_AUTHORITY        := PROMOTED_KERNEL_ONLY
WORLDLINE_AUTHORITY             := PROMOTED_KERNEL_ONLY
```

## Next lifecycle

```text
NEXT := COMMIT IMPLEMENTATION
     → RECORD IMPLEMENTATION_COMMIT
     → CREATE BINDING_RECORD.md
     → COMMIT BINDING SEPARATELY
     → REPLAY FROM BINDING_COMMIT
     → REQUEST SEPARATE IMPLEMENTATION PROMOTION DECISION
```
