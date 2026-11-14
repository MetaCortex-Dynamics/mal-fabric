# Native CHECK_FORM -010 + W10: FPP v0.1.32

Reading only. No spec edit, device/world execution, status change, commit or push. 038 untouched.

## Custody and execution

- Spec: 29AEEED5D7FB74B43AA916F8D09C7417E6F381A19CBEC43A3AD1419AAB425A4A; 79,032 bytes. Standalone and extracted copies SAME.
- Package: B4FF0CE1618CE685A883FC5B0D6BDDFF40A0154A022891C25F0176EA688D6AB3; 144584 bytes. SAME.
- MANIFEST.sha256: C7E2DF9BA6C70AF05EE1645498408E8E532A6ED1663AA320FB51BBA2A7A9383F; all 42 listed files SAME.
- All 56 declared contacts held and hash-SAME: 40 packaged, 16 supplied from retained verified copies. Full paths, sizes, source copies and hashes: CONTACT_CUSTODY.json. The package bytes were not changed.
- CN0125: 917373749B15F3FA68D38E792297AE8A9090E65E5A27876F0144BAC7AAC5E62C.
- CEFF: E0AFE098DF5754B24096B76B1F9C55C2B44127EFCA5F66735FAE6ACAF2C9E873.
- Unchanged checker: B4865E92E5734CAC2F36D4D422E14CB28140C717B7D43F5DF3A46E21E8B7B48F.
- Unchanged W10: 22BA3B507C2CFFF75A3E6CE5569AB1B1F6DD2184DDC597CB08F48617B61EC927; adapter 929A952D62E39ABAD8EB1F0E59F5F1B03857605728D853CE34733BF1EDEF1E37.
- Interpreter uses the retained PE stack-reserve copy A1E0EEDB8978951744F2D58596FAA13C1F9AC64715F166E56E48EE9EC1095909. Only stack-reserve bytes differ from original F47EF6DE1734F27984BBC6B75D9574CFA171171099A662F7CD5C53DDAE42F604; interpreter code is unchanged. RUNTIME_BINDING.json and CHECK_FORM.json bind both. Native .mal checker evaluation, not a rewritten form recognizer.
- Post-read source/contact/checker hashes: SAME (POST_READ_CUSTODY.json).

## Native readings

| Check | Native reading |
|---|---|
| W1 | IF_THEN |
| W2 | IF_THEN |
| W3 | IF_THEN |
| W4 | IF_THEN |
| W5 | IF_THEN |
| W6 | IF_THEN |
| W7 | IF_THEN |
| W8 | IF_THEN |
| W9 | IF_THEN |
| W10 | MAYBE (W10.4) |
| Meet | MAYBE |

No native W is NO. Bare -010/W9 composite is IF_THEN; adding native W10 leaves the meet MAYBE.

W6: real EXPECTED TERMINAL is L644, O_exec L649 and O_next L650 are recognized. Counts are 36 seeds, 51 derived, 87 realized; O_exec empty and the three O_next identifiers are read. Checker L4903 requires both obligation fields and declared counts; L4912-L4918 checks the derived count against closure.

## Header recognition

| Header | Intended line | Native behavior |
|---|---:|---|
| EXPECTED TERMINAL | 644 | Opens here only; prefix through L643 has terminal state NONE. |
| VECTORS | 692 | Opens here only; prefix through L691 has vector state NONE. |
| CONTACTS | 346 | No named block recognizer; transport reads exact ID/path/hash declaration lines. |
| OBLIGATION WITNESSES | 536 | No named block recognizer; W10 adapter reads O_next and exact obligation ID declarations. |
| RESTRICTION READINGS | 581 | Contacted source block; no native block-opening recognizer. |
| RESTRICTION READINGS, RECOMBINATION | 609 | Contacted source block; no native block-opening recognizer. |

The continuation lines L44 (obligation already cites), L56 (restriction:) and L82 (vectors.) trigger no header. Uppercase RESTRICTION READINGS at L125 is also not a block opening. No unintended header opening was found.

Unchanged native prefix probes: through L83 and L643, terminal/vector both NONE; through L691, terminal DONE and vector NONE, both obligation fields recognized; full bytes, terminal/vector DONE and both fields recognized. Prefixes are diagnostic inputs, not successor specs. HEADER_AUDIT.json and header_probes.stdout.txt retain the results.

Source: -010 L3684-L3700 (terminal), L3504-L3525 and L4119-L4124 (uppercase first-token VECTORS). run-w10.mjs L20-L35 reads the obligation exports/declarations; it has no recognizer for the prose headings.

## W10.1, W10.2, and W10.4

W10.1 IF_THEN: all 24 clause occurrences resolve against 56 held contacts. The second obligation at L562 resolves all three FPP ranges: L131-L138, L138-L138, L58-L58. W10_RESULT.json records each occurrence and the bound clause registry.

W10.2 IF_THEN: FPP_FOLD_ON_TICK (L548) and FPP_RECOMBINATION_ON_LINK_2_3 (L561) are different SUBJECT bytes. Native w10_shared_clause L43-L56 requires equal subject bytes before testing shared clause ranges. The three shared ranges therefore do not trigger NO. All three obligation-pair native tests report no shared-clause violation. This is the checker's form reading, not a new decision adopting the proposed subject split.

Native W10.4 MAYBE: w10.mal L86-L98 requires its exact WHAT(NO) lexical pattern on one line. The alternate HOW(NO) wording at L448-L455 does not match that pattern.

Contacted W10.4 IF_THEN, beside native MAYBE: route (d), L449-L451, excludes term-by-term identification under the joint FPP account, with no refinement-only limitation; it reaches link 2 to 3. L550,L558-L559 read admission/MUST and shed/LET on one transition, including FPP L58's exhaustive activity. Route (g), L452-L455, reaches CGRL_TEXT L48's joint admission. Permission for this separate reading is w10.mal L87-L88.

Mapping bytes: CONTACTED_READER_MAPPING.json, SHA-256 446608B630C36720B7A5FB6D3320DB95105043068B23CAC6C51F962A60C58A77. Nothing replaces the native result. The native meet remains MAYBE.

## Vectors

V1: declared IF_THEN (L694), native meet MAYBE: NOT_SAME. Against bare -010/W9 alone it is SAME; the requested -010 + W10 result is MAYBE.

V2: SAME. New seed is 7,671 bytes, 7DBBE2590D45FF58A639AF7E99302CDFE6A728269A5BB1C5E90B55438DED932B. Actual/expected column: 105 bytes, 87 THIS and 18 NO; 679CCCE3E567C61F24D600FBBB0F826CDCA84F3A4172583CB0DE4E90B012E2F3. Expected column unchanged from the retained predecessor. E1 axis-major order and ABI 2a witness order are retained in BYTE_ORDER_BINDING.json.

V3: declaration included in W7; not executed in this request.

V4: eight inputs hash-SAME, including CEFF; CARRIER held. Carrier junction 17 has signature [0,3,4,9], faces [12,13]. Unique CCD lifts are (4,12)->48, (4,13)->52, (9,12)->50, (9,13)->54. No choice is introduced.

```text
R_REC_ROOTS IF_THEN
R_REC_MANY IF_THEN
R_REC_ONE IF_THEN
R_REC_Q1 IF_THEN
R_REC_Q2 IF_THEN
R_REC_DELTA IF_THEN
R_REC_NO_REMAINDER IF_THEN
R_REC_TRANSITION IF_THEN
JOINT IF_THEN
```

Output: 176 bytes, C2E97218EF487FEC447CD26883AB93BFE8F5CC9C1705EE3A7B091F65830EBEA9; expected SAME. V4_INPUTS.json and V4_RESTRICTION_READINGS.json bind each input and each reading to its locators. These are contacted joint readings under L677-L679, combined by unchanged native w10_meet; there is no claim of a standalone native JOINT_WITNESS evaluator. W7 separately admits the declaration.

## L558 against the 00:15 reading

SAME in reading, not a byte-for-byte quotation. The exact CEFF bytes and prior REPORT.md (E77B5F462DE7D4D705A17ED634C7057DFD7FEB324E33D771776AFC0540CD1F98) and ADMISSION_SUPPORT_READ.json (EB44F48B81BEF883E0BC2BA3C85185D7103AB5ABB50F015CA9FBE3E64F442A45) were rehashed.

| Native identity | Role preserved at L558 | CEFF locator |
|---|---|---|
| 623321 | admitted effect | L5,L22 |
| 623237 | admission premise P20_UNIQUE | L5,L22 |
| 582029 | strict move R1_STRICT | L15 |
| 580038 | ordered support 1: complete coupling read | L17 |
| 210262 | ordered support 2: same member extent's root | L18 |
| 579648 | ordered support 3: no opened disagreement over that extent | L19 |
| 561071 | ordered support 4: witnessed discharged disagreement | L20 |

The twelve DELTA NOT_SAME-to-SAME overlaps, six GAMMA and six TAU SAME-to-SAME overlaps, all three kinds per member, and no opened or remaining disagreement carry CEFF L7-L13. The strict move is carried into the admission premise; L558 does not claim it is that premise or its sole direct support. No selection, four-root stability test, refinement admission or numerical threshold is added. Neighbour junction references remain shared incidence under CRJA/C1725. Thus the enough-for-fold operand is carried from the reaction's own complete coupling operands, not inferred from effect occurrence alone.

No promotion or obligation status change is made by this read.
