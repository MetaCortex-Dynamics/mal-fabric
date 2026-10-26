# Receipt -- PROMOTE CHECK_FORM W1-W8 -010

```text
ACT       := PROMOTE
BY        := Devon Generally (DECIDE / PROMOTE)
STATEMENT := "promote"  (in reply to: "Yours: PROMOTE the two by receipt, or send them back.")
WHEN      := 2026-10-16 22:28 America/New_York (UTC-04:00; recording time)
RECORDER  := Claude (records Devon's act)
STATUS    := PROMOTED by Devon Generally's attestation above
OBJECT    := REALIZATION_CHECK_FORM_W1_W8_010.mal
PATH      := v3/spec_system/002_vectors/v0.3.0/
BYTES     := 240853
SHA256    := B4865E92E5734CAC2F36D4D422E14CB28140C717B7D43F5DF3A46E21E8B7B48F
SUPERSEDES:= -009, FDF53B6654C807B13540F087AC515FF9D5FD0C5F8EE54C30FAC6C9ABDA48E4A6
             (PROMOTED 2026-10-15; now SUPERSEDED; bytes, gate and evidence stay in history)
WRAPPER   := CHECK_FORM_010_002_v0.3.0.mal, FA1BE15120670D1BE9BE29A4765EA4F831F756B9AD3CD26A8942B1188AA04D2F
GATE      := scripts/ci/Test-CheckForm010Gate.ps1 (Test-CheckForm009Gate.ps1 retained until Devon retires it)
DECIDE    := Devon, 2026-10-16 22:16, "go": the vocabulary of SPEC-MAL-TIG-DISPOSITION-001 v0.3.0
EVIDENCE  := 2cc42e840 on q-spec-tig-disposition-001; RUN_RECORD_TIG_CORPUS_FIRST_001.md
```

## Scope of the act

Devon promotes CHECK_FORM -010. It is -009 with ONE mechanical change: the 53 status atoms spelled
with the retired passing label are the operator "IF_THEN". That corrects two columns -009 carried
under one name: the W1..W8 and declaration / argument statuses (column R per test, which meet into
the reading byte) and the W8 route table dispositions copied from the engine (column D). The
reading bytes it emits are unchanged. The namespace is realization_check_form_w1_w8_010.

Consequences: SPEC-MAL-TIG-DISPOSITION-001 site V15 (-009, expected NO) is discharged by a
successor vector naming these bytes with expected IF_THEN. CONFORM runs name -010 as the
CHECK_FORM realization from this receipt on. The frame's TIG block label (CONFORM_001.mal, TIG
site V11) is not changed by this act.

## Evidence present before the act

| Evidence | Result |
|---|---|
| Regression, 12 inputs, EXECUTED byte -009 vs -010 | 12 / 12 SAME (REGRESSION_009_vs_010.txt) |
| Independent corpus 4315CC97... (M3 / M5) through -010 | P0 SAME; M1 UNEXECUTED; M2 SAME; M3 SAME; M4 UNEXECUTED; M5 SAME |
| Public CONFORM frame on that corpus | exit 1 (THIS); STATUS 0; READING MAYBE; VERDICT 21; 6/4/2/0 -- byte-identical to the -009 gate expectation |
| Test-CheckForm010Gate.ps1 | CHECK_FORM_010_GATE: SAME, exit 0 |
| -010 diagnostic on 002 v0.3.0 bytes | EXECUTED 19; W1..W8 IF_THEN |
| Match blocks mixing the operator atom and the status atom | none |
