# RECEIPT — DECIDE: O_FPP_RECOMBINATION_ACCOUNTING discharged for J17 link 2 → 3

```text
ACT        := DECIDE (discharge of one obligation, for one fold)
BY         := Devon A. Generally (holds DECIDE / PROMOTE)
STATEMENT  := "discharge it" (verbatim, 2026-11-14 00:59 America/New_York), in reply to Claude's message of 00:58 naming the
              decision: "whether O_FPP_RECOMBINATION_ACCOUNTING on link 2 → 3 is discharged by the offered record".
RECORDED BY:= Claude (PROPOSE; records the act, does not perform it)

OBLIGATION := O_FPP_RECOMBINATION_ACCOUNTING of SPEC-FPP-GRL-CORRESPONDENCE-001 v0.1.32 (PROMOTED 2026-11-14 00:57;
              sha256 29AEEED5D7FB74B43AA916F8D09C7417E6F381A19CBEC43A3AD1419AAB425A4A; receipt 1B35DEC8…3B14).
              SUBJECT FPP_RECOMBINATION_ON_LINK_2_3. LAW_CLAUSE FPP#L131-L138; FPP#L138-L138; FPP#L58-L58.
FOLD       := J17 link 2 → 3.
```

## The record offered and accepted (the object's REQUIRED line)
| Contact | What it is | sha256 |
|---|---|---|
| CRJA | Codex's joint recombination account, "IF_THEN on link 2 → 3" | 776E31CD3ED277D628EEC3C62F9DA3002A2F2EDEEEEA5618F4833AF5AE06BD60 |
| C1725 | Codex's joint absorption account (2026-11-13 17:25) | 1BB0B4E9886AC4D9B8BD4C2170DC40E566C8431757328B3E812053D06C7B2FA1 |
| C1727 | Codex's derivation by exhaustion (17:27) | 485A9D31B75205461D61C58B8881C5C72287D3B7862A0395E69F03545D586C4B |
| ROOTS | Codex's root ledger | AC145E161E92133193589F185D8147EC6F318A81F00109D4BD10609AA33A8F37 |
| CEFF | Codex's reading of enough-for-fold on this fold (2026-11-14 00:15) | E0AFE098DF5754B24096B76B1F9C55C2B44127EFCA5F66735FAE6ACAF2C9E873 |
| RDISCH | Devon's discharge of the shed witness for this fold | 29D3CA259E25AE37B8A473CD7D5CEEEE6AC53E75189DBEBFE8B206D0BE92B724 |

Read with CARRIER (82E388FD…5BDB) and the recombination trace TRH (204D9EF8…5150) as the fourth vector's arguments.

## The restrictions, as read at the decision
Codex native, 2026-11-14 00:57 (local copy CODEX_FPP_V0132_NATIVE_2026-11-14_0057.txt, 3ADF001F…9616): the fourth vector SAME
with eight inputs verified and CARRIER held; output 176 bytes, C2E97218…BEA9:

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

"The restriction readings are contacted readings under L677–L679; unchanged native `w10_meet` computes JOINT." (Codex.)
R_REC_TRANSITION carries the 00:15 reading SAME: strict move 582029 with ordered supports 580038, 210262, 579648, 561071;
admission premise 623237; admitted effect 623321; no selection, numerical threshold, refinement-admission requirement or
four-root stability test.

## Scope
- Discharges O_FPP_RECOMBINATION_ACCOUNTING for J17 link 2 → 3 only. It is ONE fold and ONE subject.
- O_FPP_FOLD_ACCOUNTING (SUBJECT FPP_FOLD_ON_TICK; the refinement on links 6 → 7 and 7 → 8) stays PENDING; this receipt reads
  none of its eight restrictions.
- Bytes not held by Claude and carried as stated: Codex's reports (E77B5F46…1F98 and the native-form report), the native facts
  named above, CARRIER, the run record 9939E906…80BB and the envelopes B46F9F82…59F6.
- No device or world execution, world append, status change in any world, RTL change, commit or push follows from this
  receipt. J17 and Metis stay separate. 038 untouched.

## Obligations this discharge opens (a discharged obligation creates new ones)
1. O_FPP_RECOMBINATION_ON_OTHER_FIXED_CARRIER_FOLDS: the joint recombination account on any other fold of J17 that preserves
   its carrier configuration. This discharge says nothing of them.
2. O_FPP_FOLD_ACCOUNTING may now stand beside a discharged recombination account; its own joint account on the refinement
   stays PENDING, with the shed on folds that form new parts (opened by RDISCH) still open under it.
3. O_NATIVE_JOINT_WITNESS: the fourth vector's restriction lines are contacted readings; there is no native JOINT_WITNESS
   evaluator, only the native meet.
4. O_NATIVE_W10_4_RECOGNIZER: the native W10.4 recognizer does not match the object's HOW(NO) formulation, so the first
   vector declares IF_THEN while the native meet is MAYBE (the state of v0.1.19 and of v0.1.32 at promotion).
5. q₂ on this fold has two grounds side by side, the bound account's (CRJA L26) and the member-by-identity reading (record
   198, PROPOSE standing); how they stand together is not stated in any held record.
