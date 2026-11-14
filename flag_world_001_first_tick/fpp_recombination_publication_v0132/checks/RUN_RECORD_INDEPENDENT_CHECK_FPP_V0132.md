# RUN RECORD — independent check of SPEC-FPP-GRL-CORRESPONDENCE-001 v0.1.32 (PROPOSED, unpromoted draft)

```text
OBJECT      := SPEC-FPP-GRL-CORRESPONDENCE-001 v0.1.32, package/SPEC_FPP_GRL_CORRESPONDENCE_001_v0.1.32_PROPOSED.mal
SHA256      := 29AEEED5D7FB74B43AA916F8D09C7417E6F381A19CBEC43A3AD1419AAB425A4A (SAME the expected value)
BYTES       := 79032 (SAME the expected value); 727 lines, LF, terminal LF, no CR, no tab, no trailing whitespace
DATE        := 2026-11-14
CHECKER     := independent subagent; PROPOSE-side check; no authority to promote. Did not draft the object.
              Authors nothing, corrects nothing. Wrote this file only.
METHOD      := 002 v0.3.1 110D3C5E…5EFE (14202 bytes); promotion receipt 16ACC1C9…6B4E; W10 delta 01105ECC…29C2;
              W9 erratum E93318BC…7BCC; wave erratum 70C2D093…8735 (all five read and hashed in this run).
PRIOR       := package/contacts/PRIOR_v0.1.31.mal A4C92426…15B7, 78448 bytes, 720 lines; its independent check
              PRIOR_RUN_RECORD_0131.md 8742454C…7FE9 (23930 bytes; read in full).
ENVIRONMENT := Linux; sha256sum, diff; python3 -I with the script kept outside the package. No v3 engine, no native
              checker, no native W10 recognizer. No network.
LINE NUMBERS:= "L" alone = the v0.1.32 file; other files are prefixed (PRIOR L419 …).
              PRIOR L1–L3 = L1–L3; PRIOR L5–L6 = L5–L6; PRIOR L8–L418 = L15–L425; PRIOR L420–L720 = L427–L727 (all +7).
```

Verdict words: IF_THEN / NOT_SAME / NO / MAYBE, precedence NO > NOT_SAME > MAYBE > IF_THEN; SAME for byte comparisons.
A test that was evaluated and did not come out as the bytes claim is NOT_SAME; a test that could not be evaluated is
MAYBE with its operand.

## 1. Custody

- Spec sha256 and byte count: SAME the expected values.
- `sha256sum -c MANIFEST.sha256`: 42 entries, 42 OK (the spec, 40 files under contacts/, inputs/seed_36.mal).
- CONTACTS L347–L402: 56 bindings, byte-SAME PRIOR L340–L395.
  - Held, hash SAME the CONTACTS line (37): V015, D202, RV015, R098, DSUB, R155, R162, R195, R198, R199, R201, V0111,
    RV0111, R238, R243, R244, R210, R239, R240, V0119, RV0119, DR345, R258, R259, CRJA, C1725, C1727, CPLR, ROOTS, TRH,
    TRHP, RDISCH, RV018S, SWS, R292, CN0125, CEFF.
  - Named, bytes not in the package (19): FPP, SKEL, FRAME, JUNCTIONS, INV, PROOF, TICK, TRACE, BIND, GROUND, CGRL_TEXT,
    SAY, THERMAL_V014, HAND, N6, W10D, CARRIER, CERT, JOINT_APP. W10D's digest (L362) is SAME method/DELTA_…W10….md
    (bytes held under method/); 18 remain unheld. Named-not-held: reported as such, not failures.
  - Held in contacts/ and bound by no CONTACTS line: PRIOR_v0.1.31.mal and PRIOR_RUN_RECORD_0131.md (named at L7 by
    shortened digest), CODEX_V0116_010.txt. Not a failure.
- V4 argument hashes (L717–L724): all eight SAME their CONTACTS lines; seven SAME the held files (CRJA, C1725, C1727,
  ROOTS, TRH, RDISCH, CEFF); argument_5 CARRIER is SAME its CONTACTS line (L379), bytes not held.
- inputs/seed_36.mal: 7671 bytes, sha256 7DBBE259…932B, SAME V2's declaration (L697, L698). Its bytes occur verbatim in
  the spec exactly ONE time, L432 (`domain …`) through the last law (L534).

Section verdict: IF_THEN.

## 2. Diff PRIOR_v0.1.31 → v0.1.32, byte level

Three hunks; 79032 − 78448 = 584 bytes = 577 (seven new lines with their LFs) + 13 (label) − 6 (the CEFF line:
62 bytes replaced by 56). Every range outside the hunks is byte-SAME (mapping in the header). Applying exactly the
edits below to PRIOR's bytes reproduces the v0.1.32 file byte for byte (reconstructed and compared in this run).

| Hunk | Lines | Change (character diff) | Note item | Result |
|---|---|---|---|---|
| 4c4 | L4 | `0.1.31` → `0.1.32` | (1) "VERSION" | SAME |
| 7c7,14 | L7–L13 | seven new lines, the CHANGE 0.1.32 note | (1) "this note" | SAME |
| | L14 | PRIOR L7 with ` (unpromoted)` inserted after `// CHANGE 0.1.31`; rest of the line byte-SAME | (1) "the label of CHANGE 0.1.31" | SAME |
| 419c426 | L426 | `Rested on by: the CHANGE notes from 0.1.28 on, the last three` → `Rested on, outside the CHANGE notes, by: the last three`; the line's start (`// L28). `) and remainder (` sentences of R_REC_TRANSITION, its line of the recombination`) byte-SAME | (2) | SAME |

- Changed bytes the note does not enumerate: none.
- Enumerated changes not in the diff: none.
- Quotations in the note:
  - `"Rested on by: the CHANGE notes from 0.1.28 on, the last three"` (wraps L10→L11; joined with one space): exact
    against PRIOR L419; stood ONE time in PRIOR. SAME.
  - `"Rested on, outside the CHANGE notes, by: the last three"` (L11): exact against L426. In v0.1.32 the string
    stands twice: L426 and the note's own quotation (L11). SAME.
- "CONTACTS, in the lines on CEFF": L426 is the third of the four lines on CEFF (L424–L427), inside CONTACTS. SAME.
- "Unchanged, byte for byte: everything else": SAME. The diff contradicts nothing.
- The CHANGE 0.1.31 note (L14–L19): its only change is the label gaining ` (unpromoted)` (L14); L15–L19 = PRIOR
  L8–L12 byte for byte. SAME.
- DATE (L5) unchanged and not listed. SAME.

Section verdict: IF_THEN.

## 3. Markers

- The exact string (word EXPECTED, one space, word TERMINAL) occurs exactly ONE time, at L644, and that line is exactly
  `// ` + the string. A case-insensitive, any-whitespace search finds only L644. `// O_exec = empty` is L649 and
  `// O_next = { … }` is L650, both after it. IF_THEN.
- `// RESTRICTION READINGS, RECOMBINATION` at the start of a line occurs exactly ONE time, L609. (The words occur in
  five other places, L96, L122, L128, L145, L171, all mid-line inside retained change notes.) IF_THEN.
- Lines new (L7–L13) or changed (L4, L14, L426), first words after `// ` and any indentation:
  L4 `VERSION:` (the header line it should be); L7 `CHANGE 0.1.32:`; L8 `corrected in (2).`; L9 `(1) VERSION;`;
  L10 `(2) CONTACTS, in`; L11 `three" becomes`; L12 `the CHANGE notes.`; L13 `Unchanged, byte`;
  L14 `CHANGE 0.1.31 (unpromoted):`; L426 `L28). Rested on,` (start unchanged from PRIOR L419).
  - No new or changed line begins, flush or indented, in any case, with the words of a later section header
    (TARGET, METHOD, SUBJECT, SCOPE, ORIGIN, CONTACTS, OBLIGATION WITNESSES, an obligation name, REQUIRED, STATUS,
    LAW_CLAUSE, DISCHARGE, SOURCE USE, RESTRICTION READINGS, RECORDED READINGS, the terminal header, PENDING, O_exec,
    O_next, NOTES FOR VECTOR, VECTORS) or with a vector-declaration prefix (V1–V4, `argument_`, `expected`, `sha256`,
    `input_path`).
  - Behind an item number only: L9 `(1) VERSION;` and L10 `(2) CONTACTS, in`. Same shape as retained lines (L28
    `(4) CONTACTS, the CEFF line`, L38 `(3) CONTACTS, the last two`, L53 `(2) CONTACTS: CEFF is added`), which were
    in the bytes of earlier checks and which CN0125 does not report as a hit. No hit; reported because asked.
  - L12 begins `the CHANGE notes.`: the first word is `the`, not `CHANGE`; L13 `Unchanged` is one token. No hit.
- Carried, byte-unchanged (each PRIOR line +7): L44 `obligation already cites …` (MAYBE, still open); L56
  `restriction:" to …`; the other parser-risk lines of the prior records.

Section verdict: IF_THEN on the two required markers and on the new and changed lines; the L44 MAYBE is carried.

## 4. CHECK_FORM W1–W10 on the v0.1.32 bytes

| Test | Verdict | BECAUSE |
|---|---|---|
| W1 | IF_THEN | L1 identifier, L2 STATUS, L3 AUTHORITY, L4 VERSION |
| W2 | IF_THEN | ONE seed block (L434 to `};` L518); 36 cells, each WHAT, HOW or FOR_WHAT of one of the 15 operators; 15 carrier atoms; no entry repeats (recomputed). Byte-SAME PRIOR |
| W3 | IF_THEN | each of the 36 cells carries a `//` reading on its line (recomputed) |
| W4 | IF_THEN | the four laws occur ONE time (L520–L534), byte-SAME the method's four law declarations |
| W5 | IF_THEN | four `law` declarations, no other; no non-comment line outside L432–L534 |
| W6 | IF_THEN (my reading) | terminal L644–L651: seed 36, derived 51 (41 layer-1 + 10 WHENCE), total 87; PENDING list of 18 (L646–L648); O_exec L649; O_next L650. Recomputed by closure from the seed set: 41 layer-1, 10 WHENCE, 18 PENDING, SAME the declared list as a set. The marker stands once (§3). A native rerun is not held |
| W7 | IF_THEN | four vectors inside the bytes (L692–L727), byte-SAME PRIOR L685–L720; each with exact input and exact expected output |
| W8 | MAYBE | no v3 engine here; operand: HARD_P5 and structural-fail counts on these bytes. Domain line, seed and laws are byte-unchanged since the bytes CN0125 L14 reports on (another party's report on other bytes) |
| W9 | IF_THEN | law positions (domain L432, seed name, cells, atoms, law bodies) byte-unchanged; no retired token (atom, hydrogen, particle, element, singularity, entropy, tie, wave; whole token, any case; wave also as identifier component) in any non-comment position; all new and changed lines are comments |
| W10 | MAYBE | see below |

W10 in detail (the delta's bytes). No obligation line changed in this version; SUBJECT, LAW_CLAUSE, REQUIRED, STATUS
and the restriction texts of all three obligations are byte-SAME PRIOR (L537–L569 = PRIOR L530–L562).

- **W10.1.** The three O_next obligations carry LAW_CLAUSE (L549, L562, L567); every contact id is bound in CONTACTS
  with a hash. Not missing. Whether each locator resolves: MAYBE (operand: FPP 897AB3D7…A344, CGRL_TEXT and the other
  unheld contacts' bytes). Carried.
- **W10.2.** First and second obligations share FPP#L131-L138, FPP#L138-L138, FPP#L58-L58 on differing SUBJECT bytes
  (`FPP_FOLD_ON_TICK` L548, `FPP_RECOMBINATION_ON_LINK_2_3` L561). By the delta's bytes ("on the same subject") no NO.
  Whether the two subjects are NOT_SAME or one subject split is the draft's proposal and Devon's decide: MAYBE, carried.
- **W10.3.** No DEPENDENCY declared. IF_THEN.
- **W10.4.** My own reading: IF_THEN for FPP :131–138 (HOW(NO), in the seed block, names the term-by-term route
  against the joint accounting clause; byte-unchanged). Whether FPP L58 is "recursive or joint" is in unheld bytes:
  MAYBE. The native lexical recognizer is not available to me; I cannot evaluate it. Carried.

**CHECK_FORM meet: MAYBE** (W1–W7, W9 IF_THEN; W8 MAYBE; W10 MAYBE). No NO and no NOT_SAME among the ten form tests.

V1 (L693–L694) declares IF_THEN; against this computed meet it is MAYBE; a native rerun is not held (carried).

## 5. The changed CEFF line (L426–L427) and the CHANGE 0.1.32 note (L7–L13)

The sentence as it now stands (L426–L427): "Rested on, outside the CHANGE notes, by: the last three sentences of
R_REC_TRANSITION, its line of the recombination readings, the second obligation's REQUIRED, the notes for the fourth
vector and that vector."

**Line range used for "the CHANGE notes".** By the instruction's definition: L7 (first `// CHANGE` line) through
L345 (the line before `// CONTACTS` at L346). Strictly the notes themselves are L7–L335 (the CHANGE 0.1.4 note ends at
L335; L336–L345 are TARGET, METHOD, SUBJECT, SCOPE, ORIGIN). L336–L345 contain no occurrence of CEFF, so both
boundaries give the same partition.

**Every occurrence of the string CEFF** (34 lines; PRIOR had 33, each +7, plus the new L10):

| Where | Lines | Inside the CHANGE notes? |
|---|---|---|
| CHANGE 0.1.32 note | L10 | inside |
| CHANGE 0.1.30 note | L24, L27, L28, L29 | inside |
| CHANGE 0.1.29 note | L38, L40, L41, L42, L44 | inside |
| CHANGE 0.1.28 note | L49, L50, L53, L56, L57, L58, L59, L61, L62, L64, L65 | inside |
| CONTACTS, hash binding | L402 | outside |
| CONTACTS, the lines on CEFF | L424, L425 (sentence under check continues L426–L427) | outside |
| R_REC_TRANSITION (second obligation) | L558 (three citations) | outside |
| second obligation's REQUIRED | L559 | outside |
| recombination readings, header list | L610 | outside |
| recombination readings, R_REC_TRANSITION line | L630, L631, L632 (the line begins L629) | outside |
| NOTES FOR VECTOR 4 | L676, L679 | outside |
| the fourth vector | L716, L724 | outside |

**Direction A (every listed place rests on CEFF).**

| Listed place | Bytes | Result |
|---|---|---|
| "the last three sentences of R_REC_TRANSITION" | L558 has five sentences. 3rd "Enough-for-fold, … (CEFF L7–L13, L24)."; 4th "The strict move R1_STRICT 582029 … (CEFF L5, L15–L22)."; 5th "The reading imports no … (CEFF L26; CRJA L42); … (CN0125 L47)." Sentences 1 and 2 cite CRJA and C1725 only | IF_THEN |
| "its line of the recombination readings" | L629–L632, the R_REC_TRANSITION line of the block headed L609: quotes CEFF L1 and CEFF L24 (twice) for the verdict word | IF_THEN |
| "the second obligation's REQUIRED" | L559: "Offered: CRJA with C1725, C1727, ROOTS, CEFF and the discharged shed witness" | IF_THEN |
| "the notes for the fourth vector" | L676 (inputs: "CEFF = Codex's reading of enough-for-fold on this fold"); L679 ("(CRJA L27, L31; CEFF L1)") | IF_THEN |
| "that vector" | L716 (eighth argument in the header line); L724 (argument_8 with CEFF's sha256, SAME the held file) | IF_THEN |

**Direction B (every place outside the CHANGE notes that rests on CEFF is listed).** The outside occurrences not
covered by the five listed places are three:

- L402, the hash binding `CEFF: contacts/CEFF.md; sha256 …`. It defines the id. It names CEFF; it rests nothing on
  CEFF's bytes. **Merely names. IF_THEN.**
- L424–L425, the description of CEFF in the very lines that carry the list. L425 cites "(CEFF L3, L28)" as locators
  for what the contact names (the report link at CEFF L3, the report digest at CEFF L28; both verified against the
  held bytes). This is the file's statement about CEFF, not a reading of the subject carried on CEFF; a list of where
  the file rests on a contact, written inside that contact's own description, is not expected to list itself, and the
  parallel CN0125 lines (L421–L423) are treated the same way. **Defines / describes; not a place that "rests on" it.
  IF_THEN.** Remark only: it is the one outside place that cites CEFF line numbers and is not in the list.
- L610, the header of the recombination readings: "records and contacts cited below: …, CN0125, CEFF". It is an index
  of ids the lines below cite; the place that rests on CEFF is the R_REC_TRANSITION line under it (L629–L632), which
  is listed. The CN0125 list (L422–L423) likewise omits this header although the header names CN0125. **Merely names.
  IF_THEN.**

No other place outside the CHANGE notes cites CEFF. (Places that depend on it only through a listed place, without
naming it: the JOINT line of the recombination readings L633 as the meet; the verdict table L681–L689, which is
inside "the notes for the fourth vector"; the vector's expected bytes L726, inside "that vector". Covered or
indirect; not a finding.)

Direction B: IF_THEN.

"No obligation's LAW_CLAUSE cites it." (L427, byte-unchanged): L549, L562, L567 contain no CEFF. SAME.

**The CHANGE 0.1.32 note against held bytes.**

- "the unpromoted v0.1.31 draft (A4C92426…15B7": PRIOR sha256 A4C92426CE4809ADAEEF20CCF0A945E9C9BB9E726852B1B45D65CA87992D15B7.
  SAME prefix and suffix. PRIOR's L2 is `STATUS: PROPOSED`; no receipt for it is held. "unpromoted": nothing held
  contradicts it.
- "RUN_RECORD 8742454C…7FE9": PRIOR_RUN_RECORD_0131.md sha256 recomputed
  8742454C777405F3A9596A7ADF5EFFC38E8AA4FFAA0A69F5BD184F98EC097FE9. SAME prefix and suffix. That record's header names
  v0.1.31 and the digest A4C92426…15B7 as its object. SAME.
- "no NO; ONE NOT_SAME": PRIOR_RUN_RECORD_0131 L239 "NOT_SAME: one (finding 1). NO: none.", L250 "No NO was found.",
  L280. SAME.
- "corrected in (2)": that record's finding 1 (its L169–L180, L223, L243–L248) is PRIOR L419 "Rested on by: the CHANGE
  notes from 0.1.28 on" against the CHANGE 0.1.31 note. Item (2) replaces exactly those words. The record said "A
  closed list … or an equivalent bound removes the finding"; scoping the list to places outside the CHANGE notes is
  such a bound: the sentence no longer asserts anything about any CHANGE note, so the CHANGE 0.1.31 note (and this
  note, and any later one) cannot falsify it. The prior NOT_SAME is closed. SAME.
- "Every change of this version: (1) … (2) …": §2. SAME.
- "The list no longer speaks of the CHANGE notes.": the enumerated members after "by:" are five places, none a CHANGE
  note; in PRIOR the first member was "the CHANGE notes from 0.1.28 on". IF_THEN on the reading "the list" := the
  members after "by:". Remark: the sentence's lead-in still contains the words "the CHANGE notes" (to exclude them),
  and the note quotes that lead-in beside the claim, so a reader has both in view; a stricter wording would be "no
  longer lists". Not a finding.

Section verdict: IF_THEN.

## 6. Consistency across the file

- Retained CHANGE notes that describe the CEFF line:
  - L28–L29 (CHANGE 0.1.30, item (4)): `CONTACTS, the CEFF line "Rested on by:": "the CHANGE 0.1.28 and 0.1.29
    notes," becomes "the CHANGE notes from 0.1.28 on,", BECAUSE this note also cites CEFF.` A description of the edit
    v0.1.30 made, under the label "CHANGE 0.1.30 (unpromoted)"; "becomes" is the change-note form used throughout.
    History. Neither quoted wording is in the current line, and the exact string `Rested on by:` no longer stands
    at L426; the CHANGE 0.1.32 note (L10–L11) quotes the superseded words and gives their replacement, so the chain
    0.1.29 → 0.1.30 → 0.1.32 can be followed inside the header. No present-tense claim about v0.1.32's bytes.
  - L38–L39 (CHANGE 0.1.29, item (3)): `the list after "Rested on by:" now begins with the CHANGE 0.1.28 and 0.1.29
    notes; its other five members are the same places …`. "now" is the now of v0.1.29 under its own label; it was
    already superseded once (by L28–L29) in the bytes the two prior checks read and was treated as history there.
    History. Its "other five members" are SAME the five members of the present list.
  - L53–L54 (CHANGE 0.1.28, item (2)): "four lines stating what it is, what of it is not held and where this file
    rests on it are added". Description of the addition made in v0.1.28. History. There are still four lines on CEFF
    (L424–L427).
  - None of the three contradicts L426–L427 as a present-tense claim. IF_THEN.
- The CN0125 lines (L421–L423) keep "Cited by: the CHANGE 0.1.26 note, …" (a closed list naming one note); byte-
  unchanged; the CHANGE 0.1.32 note does not cite CN0125. No conflict. (Remark: the two parallel lists now differ in
  form, one naming a CHANGE note and one excluding the CHANGE notes; both are true of the bytes.)
- Nothing else in the file refers to the replaced words, to a count of CHANGE notes, or to "the latest" note.
- V1–V4 (L692–L727): byte-SAME PRIOR L685–L720.
- The fourth vector: L726's expected_bytes decode to 176 bytes, SAME the nine table lines of L681–L689 joined with LF
  and no terminal newline; recomputed sha256 C2E97218EF487FEC447CD26883AB93BFE8F5CC9C1705EE3A7B091F65830EBEA9, SAME
  L727. V2 expected_bytes: 105 bytes, 87 of 0x01, 18 of 0x00, sha256 SAME L700. V3 expected_bytes: 139 bytes, SAME the
  table L661–L669, sha256 SAME L715. Not executed with eight arguments; CARRIER not held: MAYBE (carried operand).

Section verdict: IF_THEN on consistency, on V1–V4 and on the fourth vector's bytes; MAYBE on execution of the fourth
vector (carried).

## 7. Anything else in the changed lines; prior operands

1. Nothing in L4, L7–L14, L426 is wrong or unsupported on my reading.
2. (remark) L12 "The list no longer speaks of the CHANGE notes": true of the list's members; the lead-in still
   names them to exclude them (§5).
3. (remark) L426 "Rested on, outside the CHANGE notes, by:" bounds the list and says nothing of which CHANGE notes
   rest on CEFF. Four do name it (0.1.28, 0.1.29, 0.1.30, and 0.1.32 at L10); the file no longer states this
   anywhere as a present claim. Nothing false results; information that the old wording carried (imprecisely) is no
   longer carried.
4. (remark) L425 "(CEFF L3, L28)" is an outside place citing CEFF's lines that the list does not name; judged
   description, not resting (§5).
5. (remark) L7–L13 carry no statement on a native check of v0.1.31 (none is held; no claim is made).
6. (remark) L10 begins, behind its item number, with `CONTACTS,`; precedent at L28, L38, L53 (§3).
7. Unchanged body: not re-reviewed.

Open operands of PRIOR_RUN_RECORD_0131.md (its lists, L241–L278), by its numbers:

| # | Subject | State in v0.1.32 |
|---|---|---|
| must-change 1 | "the CHANGE notes from 0.1.28 on" (PRIOR L419) | **CLOSED** (reworded, L426) |
| 1 | remarks on the CHANGE 0.1.31 note (no native-check statement; third consecutive edit of a retained note) | carried, byte-unchanged (now L14–L19); v0.1.32 edits no retained note beyond a label |
| 2 | "v0.1.28 and v0.1.29 have no native check", unscoped | open, carried (now L21) |
| 3 | L49 (two antecedents of "it"; short line); "the four CEFF L17–L20 names"; indented `obligation` line; `restriction:"` line; "CHECK_FORM no NO; two NOT_SAME"; "the recombination's MUST" | open, carried, byte-unchanged (now L49; L41; L44; L56; L31–L32; L48) |
| 4 | `FPP#L58-L58` and other locators; FPP L58 recursive or joint | open, carried (L562, L549) |
| 5 | W10.2, two subjects | open, carried (L548, L561, L550) |
| 6 | fourth vector not executed with eight arguments; native facts not held | open, carried (L716–L727) |
| 7 | carried lines of the 0128, 0129 and 0130 records | open, carried, byte-unchanged (each PRIOR line +7) |
| 8 | 18 named contacts and five named records not held | open, carried |
| 9 | W8 | open, carried |
| 10 | W10.4 native recognizer | open, carried |
| 11 | V1 declared IF_THEN against meet MAYBE; V2, V3 operands | open, carried |

## Findings

| # | Verdict | Location (v0.1.32) | Cause |
|---|---|---|---|
| 1 | MAYBE | W8 | no engine |
| 2 | MAYBE | W10.1 (L549, L562, L567) | locators resolve in bytes not held; carried |
| 3 | MAYBE | W10.2 (L548, L561, L550) | shared clauses on differing SUBJECT bytes; Devon's decide; carried |
| 4 | MAYBE | W10.4 | my reading IF_THEN for FPP :131–138; FPP L58 in unheld bytes; native lexical recognizer unavailable; carried |
| 5 | MAYBE | L716–L727 | fourth vector not executed with eight arguments; CARRIER and CEFF's native bytes not held; carried |
| 6 | MAYBE | L21; L41; L44, L56; L31–L32, L48 | prior record's operands 2 and 3, byte-unchanged |
| 7 | MAYBE | L347–L362, L379–L381; V1 L693–L694; V2; V3 | 18 named contacts not held; V1 declared IF_THEN against computed meet MAYBE; carried |
| 8 | IF_THEN | §1 | spec hash and size; 42 manifest entries; 37 held contact hashes; eight V4 argument hashes; seed hash, size, verbatim containment once |
| 9 | IF_THEN | §2 (L4, L7–L14, L426) | diff SAME the CHANGE 0.1.32 note item by item; both quotations exact (the first across the L10→L11 wrap); "Unchanged" holds; the CHANGE 0.1.31 note changed only by its label; file reconstructed from PRIOR by exactly those edits |
| 10 | IF_THEN | §3 L644, L649, L650; L609 | terminal marker ONE time as the exact header line with O_exec and O_next after it; second block header ONE time at line start; no new or changed line begins with a header's words or a vector prefix (L9, L10 behind item numbers only) |
| 11 | IF_THEN | W1–W7, W9 | as §4 |
| 12 | IF_THEN | L426–L427, direction A | all five listed places cite CEFF (L558 sentences 3–5; L629–L632; L559; L676, L679; L716, L724) |
| 13 | IF_THEN | L426–L427, direction B | the only unlisted outside occurrences are L402 (binding; names), L424–L425 (CEFF's own description; describes), L610 (header index; names); none rests a reading on CEFF |
| 14 | IF_THEN | L7–L13 | both shortened digests SAME; "no NO; ONE NOT_SAME, corrected in (2)" SAME the prior record, whose finding is closed by the reworded line; "The list no longer speaks of the CHANGE notes" holds of the list's members |
| 15 | IF_THEN | §6 | retained notes L28–L29, L38–L39, L53–L54 are history under their own labels, not present claims; V1–V4 byte-SAME PRIOR; V4 expected 176 bytes and sha256 recomputed SAME; V2, V3 expected bytes SAME their digests |

NOT_SAME: none. NO: none.

## For the drafter: must change before handover (NOT_SAME / NO)

None. No NOT_SAME and no NO was found. The NOT_SAME of the v0.1.31 check (PRIOR L419) is closed by L426.

## For the drafter: open operands (MAYBE)

1. L7–L13, L426 (remarks, not verdicts): (a) L12 "The list no longer speaks of the CHANGE notes" is true of the
   list's members; the lead-in at L426 still names the CHANGE notes in order to exclude them. (b) The file no longer
   states, as a present claim, which CHANGE notes rest on CEFF (0.1.28, 0.1.29, 0.1.30 and 0.1.32 name it). (c) L425
   "(CEFF L3, L28)" cites CEFF's lines outside the CHANGE notes and is not in the list; judged CEFF's own
   description, not a place that rests on it; L402 (binding) and L610 (header index) judged naming only. (d) The
   note makes no statement on a native check of v0.1.31 (none is held). (e) L10 begins, behind its item number, with
   `CONTACTS,` (precedent L28, L38, L53; not a marker hit).
2. L21: "v0.1.28 and v0.1.29 have no native check." Unscoped; nothing held contradicts it; existence outside the
   package not checkable here (carried, byte-unchanged).
3. Carried from the prior records, byte-unchanged: L49 (two antecedents of "it"; short unwrapped line); L41 "the four
   CEFF L17–L20 names"; L44 indented line beginning `obligation already cites …` against the header at L536, and the
   `restriction:" to …` line L56; L31–L32 "CHECK_FORM no NO; two NOT_SAME" and L48 "the recombination's MUST".
4. L562, L549: `FPP#L58-L58` and the other locators resolve in bytes not held (FPP, CGRL_TEXT); whether FPP L58 is a
   "recursive or joint" clause for W10.4 is in FPP's bytes (W10.1, W10.4; carried).
5. W10.2: first and second obligations share three clauses on differing SUBJECT bytes (L548, L561). Admissible by
   the delta's bytes; whether the subjects are NOT_SAME is the draft's proposal (L550) and Devon's decide (carried).
6. L716–L727: the fourth vector has not been executed with eight arguments; CARRIER not held; CEFF's report
   E77B5F46…1F98 and the native bytes it names not held (carried).
7. Carried from the 0128, 0129, 0130 and 0131 records, byte-unchanged (each PRIOR line +7): L424–L425 (CEFF's
   authorship, relay, 00:15); L587 and L459 (do not name their link); L82 (`vectors.`); L74–L75 ("all three places
   that cite CN0125"); L421–L422 (CN0125's relay); L84–L86 (recognizer rule inferred from CN0125 L19); L555 with
   L622–L626 (q₂, two grounds); the parser-risk lines of those records; the remarks on the CHANGE 0.1.31 note (L14–L19).
8. Custody: 18 named contacts not held (FPP, SKEL, FRAME, JUNCTIONS, INV, PROOF, TICK, TRACE, BIND, GROUND, CGRL_TEXT,
   SAY, THERMAL_V014, HAND, N6, CARRIER, CERT, JOINT_APP); the five named records of the 0130 record's operand 8
   (carried).
9. W8: no v3 engine.
10. W10.4: native lexical recognizer not available.
11. V1: declared IF_THEN against a computed meet of MAYBE. V2: engine and column placement. V3: CERT, JOINT_APP,
    CARRIER and the run bytes.

**Overall: NO NOT_SAME and no NO exists in v0.1.32; the NOT_SAME of the v0.1.31 check is closed, the diff is exactly what the CHANGE 0.1.32 note enumerates (two items), the reworded CEFF list holds in both directions, and CHECK_FORM meet is MAYBE (W8, W10; carried operands only).**
