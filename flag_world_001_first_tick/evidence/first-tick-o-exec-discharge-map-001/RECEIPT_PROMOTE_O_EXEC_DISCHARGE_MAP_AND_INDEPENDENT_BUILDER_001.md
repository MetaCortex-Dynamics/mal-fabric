# Receipt — DECIDE + PROMOTE: FIRST_TICK_O_EXEC_DISCHARGE_MAP_001 v0.1.0 and RECORD_INDEPENDENT_BUILDER_COMPARISON_001

```text
ACT        := DECIDE + PROMOTE (two objects, one statement)
BY         := Devon Generally (DECIDE / PROMOTE)
WHEN       := 2026-10-22 17:53 America/New_York
STATEMENT  := "promote both"
RECORDER   := Claude (PROPOSE; records the act, does not perform it)
```

## Object 1 — FIRST_TICK_O_EXEC_DISCHARGE_MAP_001 v0.1.0 (Codex, PROPOSED → PROMOTED)

```text
SPEC       := SPEC-FLAG-WORLD-FIRST-TICK-001 v0.1.3, sha256 2ECF2EEF9A8901DA9C802922BEBE1F74C367D7A74E5B773528504B73854C1A01
COMMIT     := bccd23f4047647fc9e20fd1c00e1843480f8aba5 (review/flag-world-route-contact-014, pushed)
BYTES/SHA  := Codex states the map's own SHA-256 (markdown + DISCHARGE_MAP_001_PROPOSED.json) in its acknowledgement; that becomes the binding.
REVIEW     := REVIEW_FIRST_TICK_O_EXEC_DISCHARGE_MAP_001.md, 3274 bytes, sha256 8F949B1A…6578ED (Codex-hashed), verdict IF_THEN as proposed.
```

Decided, per the map:

```text
O_SOURCE_DERIVED_LOWERING      IF_THEN   (frozen V1/V2)
O_JTP_OBLIGATION_CONSTRUCTION  MAYBE     (commit boundary moved by 2CBBA4AD…; construction row retained; custody ≠ discharge)
O_GPU_STEP_EXECUTION           IF_THEN   (frozen V1/V2) — SCOPE: route list empty, propagation NIL; route propagation
                                          and DRC (iv) are NOT exercised by V1/V2 (review §Finding)
O_COMMIT                       IF_THEN   (GPU-worldline commit; not Tang/VF2, not the J17 world's second link)
O_VECTOR_CONFORMANCE           IF_THEN   (already promoted, 162397CB…)
O_exec                         NONEMPTY  (JTP row MAYBE)
```

## Object 2 — RECORD_INDEPENDENT_BUILDER_COMPARISON_001 (Claude, PROPOSED → PROMOTED)

```text
RECORD     := RECORD_INDEPENDENT_BUILDER_COMPARISON_001.md  sha256 99CC21072668831BAD611396CCEB2C820C40FAB839C5ABF4EB69B384379EAE10
REALIZATION:= first_tick_ib.py                              sha256 E02C90DE0F22D6F736FB4C00C64B37D588F70CF01E38BF1C4532300581606E0B
BUNDLE     := ib_bundle.zip                                  sha256 99561FDE0F256512A35A950785D31A10F084E2D04E45CCCB861E15085072A8D0
WITNESS    := Codex 17:52: all three bindings SAME; stored V1 (33,563) and V2 (33,548) outputs SAME to frozen expected
              (69786966…, BD0492B4…) and SAME to the promoted GPU outputs.
```

Decided: O_INDEPENDENT_BUILDER_COMPARISON is DISCHARGED for the first-tick realization on the frozen D2-labelled vectors.
Three routes agree byte for byte: hand derivation (authoring pass), GPU realization (Codex), independent realization (Claude).
Independence of construction is the builder's attestation, recorded in the RECORD (what was read: FT :159–199, D2 README,
tick.py :29, :36–38, :40–60, :94, :95–110; what was not: tick.py :61–93, PAIR_OVERLAPS, flag_rederive.py, author_vectors.mjs,
any Codex realization). Output equality is locally witnessed by Codex.

## Bytes before the authority
Both objects were in Devon's hands and hash-bound by Codex before the statement. No promoted byte is edited by this act.

## Supersedes
```text
none. First discharge map for FT O_exec; first discharge of O_INDEPENDENT_BUILDER_COMPARISON.
Codex's "USER_REPORTED / UNLOCATED" status for the independent-builder entry is superseded by its 17:52 witness.
```

## Recorded, not performed
- Repository seal of the map, the review, and the independent-builder bundle into the review branch: Devon's go (local commit, no push, same limits as 162397CB…).
- O_next unchanged: O_AVR_REPAIR_BOARD_RECEIPT (hardware lane), O_LATER_TICKS_AND_REENTRY (the J17 world's second step — first run to exercise route propagation), O_R1_R3_GATE_READING_SELECTION (parked), runtime-sized fact table.
- O_JTP_OBLIGATION_CONSTRUCTION stays MAYBE until the retained JTP constructions are executed or superseded by promoted law.
