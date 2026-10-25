# J17 authority contact 012 — partial implementation

Scope: candidate connection logic, not J17 admission, not a new law, not a selector.

## Parents

- PROMOTION_RECORD_A1-A10.md, lines 18–19: A7 stage order; A8 corridor-end authority allocation. SHA256 27C995BDB06B1AE6F87D727FFD0853AD3DF0ADEA13428D1EBF0B9A06FB0BB805.
- SPEC-JUNCTION-001-GOVERNED-COREALIZATION-PROTOCOL_v0.3.md, sections 5.1–5.4, 6.2, 10.8: topology, participating sections, scoped grants, overlap agreement, composite-state admission and transition admission. SHA256 9A82BC60519DBA3793C66ED51A31501C953D4B2016F5F96D02710C6BEEB6BAB3.
- SPEC_FLAG_WORLD_ENGINE_V3_001_v0.2.0.md, sections 7.2–7.4: proposed-member DECIDE, source/WHENCE/receipt/head/successor PROMOTE, exact promoted successor EXECUTE. SHA256 B2A3CE4E4639B53EDC10573F54DF8F8CBD0351D67670790F28F1313190ED924C.

## Implemented

`source/contact.mal` joins an evidenced corridor allocation, separately granted PROPOSE and DECIDE local sections, a member of a source-bound proposal, and three separately supplied witnesses: overlap, state and transition. The consequent retains the corridor, sections, grants, seating evidence and witnesses as DECIDE operands. It does not construct a native GameTickInput record, PROMOTE, or EXECUTE. AUTHORITY_EVIDENCE is an implementation constructor, not a replacement definition of WHENCE.

These rules require trusted, source-bound input facts. They do not authenticate grant bytes, evaluate the transition predicate, resolve contradictory receipts, or derive the local sections. Consequently this is not a complete authority boundary and must not be attached to live world execution yet.

The existing junction.mal transition placeholder is not imported. State admission alone cannot yield a determination here.

## Executed qualification

Command from repository root:

    node flag_world_001_first_tick/j17_authority_contact_012/qualify.mjs qualification_003

Existing qualified NVIDIA runtime; 18 synthetic checks SAME; 239 facts; 6 epochs; replay byte-identical.
Readback SHA256 D03741DA7BF9D92B8BAE01CDE95CAA4A34782366D31417C35B6A90822657CCCD.

Checks remove each required operand, alter source/corridor/lift, supply NO or MAYBE transition evidence, reverse incidence presentation without reversing grants, and retain two witnessed contacts without selecting between them.

Fixture grants and sections are test operands only. They are not J17 evidence. Qualification does not discharge O_FOLD_REALIZE.

## Actual J17 boundary

The 228 offered members remain in execution_002/OFFERED_SET.json under j17_propose_008, SHA256 C962288C1729F04214355BC72AB3E09F678113A2E71969559FE70BA5056EC0F3.
Committed g2 remains j17_step_023/outputs/committed.world.json, SHA256 E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059.

Inspected run 023 program: twelve THIS markers, six SAME comparators, twelve routes. Its runtime_step.mal lines 80–86 admit same-region route arrivals, not lift decisions. Inspected run 008 probe.mal enumerates contexts and snapshot operands only. The native D2_FIELD_CONFORMANCE_060 D2_PDPE_TICK_V1.mal lines 545–566 consume an already supplied governed input; they do not produce the local DECIDE section.

Unfilled in this implementation: the actual corridor-to-offer correspondence with evidenced end allocation; actual participating local sections and their scoped grants; the executed overlap/state/transition witnesses over those sections; native governed-input construction and invocation of DECIDE. A8 supplies stage seats, but this packet does not claim that it has materialized those operands. No new selector, Devon per-case decision, or new law is requested.

PROPOSE -> DECIDE -> PROMOTE -> EXECUTE remains the order. No link 3, commit, push, promotion or board action was performed.

## Attempt custody

qualification_001 retained the initial 17-check run. Its source used WHENCE as an implementation constructor; qualification_003 replaces that name with AUTHORITY_EVIDENCE to avoid redefining the witness.
qualification_002 stopped with executor `output custody` while C: had approximately 81 MB free. Its 4096-byte partial output is not a readback witness.
The qualification_001 run/replay and qualification_002 partial output were losslessly gzip-compressed and byte-compared after decompression before removing their uncompressed copies. Their `.gz` files retain the bytes; COMMANDS.json and prior run records remain unchanged.
