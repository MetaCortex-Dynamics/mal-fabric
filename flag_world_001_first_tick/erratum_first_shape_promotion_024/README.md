# W9 at the promotion boundary

Devon's receipt `19AD057BD1C3F3EF27480F8D292A54EC6E5FAE518BBFF0AAB17BE0E4C8D17B65` promotes erratum v0.1.3 `E93318BCB508733174FB5D4D7622BF8F1ABFD80A8D6F6CC79FF4DA0C6E337BCC` (7,906 bytes). Both input files are byte-exact copies; the original PROPOSED header remains unchanged.

## Entry point

From the mal-fabric checkout:

```powershell
pwsh -NoProfile -File ./flag_world_001_first_tick/CHECK_FORM_PROMOTE.ps1 -InputFile <spec.mal> -RecordKind specification -OutputDirectory <fresh-directory>
```

This is the additive mal-fabric promotion-check entry point, not a modification to the historical MaL-Cog regression harness. The historical Run-Conform namespace gate and CHECK_FORM W1–W8 source remain unchanged.

Both native readers consume the same captured input bytes. `source/check_form_promote.mal` returns the original W1–W8 observation separately from W9 and their combined reading. NO from either remains NO; a remaining MAYBE is reported. Exit codes encode the reading only: 0 IF_THEN, 1 NO, 2 MAYBE, 3 custody/execution error or NOT_SAME. No exit code supplies Devon's attestation. This does not change SPEC002's `CHECK_FORM != NO` promotion clause or require CONFORM at promotion.

`-RecordKind erratum` checks this exact promoted erratum with W9. W1–W8 is recorded as NOT_A_SPECIFICATION, never IF_THEN or an exemption. The command refuses another input hash in that mode; arbitrary specifications cannot bypass W1–W8 by relabelling themselves.

## Witnessed scope

[qualification_001/RUN_RECORD_PROMOTION_CHECK_024.json](qualification_001/RUN_RECORD_PROMOTION_CHECK_024.json): 44 native evaluations, 46 comparisons SAME, including the five frozen W9 vectors and 32 controls. A retired domain name yields W9 NO while W1–W8 stays IF_THEN. Mention-only use stays IF_THEN; W1–W8 NO stays NO; a malformed relevant W9 production reports MAYBE. Replay readings are SAME.

W9 is the existing qualified parsed-position reader, not a raw word scan or a claim of coverage for every possible syntax. Unsupported relevant productions retain their named parser MAYBE. The JavaScript code transports bytes and records outputs; the checks execute in native .mal. No Python or GPU world execution is involved.

The source identities are pinned in `check_form_promote.mjs`: W1–W8 `B4865E92E5734CAC2F36D4D422E14CB28140C717B7D43F5DF3A46E21E8B7B48F`; W9 `45B3FCC3E310D92ACB130AD37BC4A64E0CE0ED4D9225C9D5E6D64BD2791F9ECF`. Dependencies already in `../erratum_first_shape_w9_021` are reused by identity; the SHA library and known baseline were recovered from pinned historical Git objects, not recomputed.

## Session bindings and limits

The Desktop handoff header, [contact packet](../world_transition_contacts_007/README.md), and mal-compliance drift list carry both full hashes. Pre-edit copies of the two external entry points are retained in `entrypoint_preimages/`.

The receipt's promotion is recorded, not performed again. This work does not promote the realization as new law. Repository seal, Git staging, commit, push and any worldline change are NOT_PERFORMED and remain outside this turn's authority. The 901 frozen files and older packet/qualification records are not edit targets.
