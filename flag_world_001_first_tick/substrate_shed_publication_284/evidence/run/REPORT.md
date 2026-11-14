# Structured capture 278: one authorized re-execution

Column comparison: **IF_THEN**. Capture complete. Authorization consumed by one J17 link 2 -> 3 re-execution: initial native launch and three bound continuations, no retry. No world append, status change, RTL change, commit or push. 038 untouched.

Run ID: 7a895b15-9271-4fcf-bd7c-17dad45597e0

RUN_RECORD.json SHA-256: 9939E9062F29C57E0E9232E9C4FFEEF89849DA469BA9B37A4AC28FA18CF280BB

Specification: 9F2A87E31C942FF6A3042D5D3EE061725238DF42959D2559FF1B02540D604DCA

CUDA binary: 3671B157F727C083083DA3EB84D0CE51BECD2B5CCAC7C31ACBFAC9C00E296A34

## Same-run custody

GPU UUID: GPU-ae8cdd6b-4a26-f2a9-bf2a-c3d4f7bcd86c; ordinal 0. PCI 0000:01:00.0; vendor/device 10DE:2488; subsystem 1043:8837; VBIOS 94.04.46.40.e9. Driver 596.49; CUDA driver/runtime version encoding 13020. Windows 10.0.26200 on CAPTAIN; boot 2026-11-11T07:33:59.5000000Z.

Windows CIM/PnP configuration fields and their raw identity read are bound in identity/WINDOWS_CONFIGURATION_BINDING.json. Full register block: NOT_READABLE_ON_THIS_OS, not null. Same-process CUDA/NVML UUID, context, PCI and VBIOS are bound separately for every segment. No offline placeholders in the run record. Allocation bases, transfer-plan comparisons, per-lane event order, progress/epoch records and completion markers are included by hash.

| Segment | PID | CUDA context | Start UTC | Completion UTC | Native bytes |
|---|---:|---:|---|---|---|
| initial | 8632 | 1748916674000 | 2026-11-13T20:20:02.405Z | 2026-11-13T20:26:49.077Z | SAME |
| normal_round_00 | 34152 | 2820317982672 | 2026-11-13T20:26:49.577Z | 2026-11-13T20:29:45.755Z | SAME |
| normal_round_01 | 13156 | 2243151474496 | 2026-11-13T20:29:46.242Z | 2026-11-13T20:30:03.999Z | SAME |
| normal_round_02 | 32772 | 2636957233040 | 2026-11-13T20:30:04.513Z | 2026-11-13T20:30:47.672Z | SAME |

## Capture

2531 chunks; 2531 SAME; 0 NOT_SAME. 2579941689 events represented; dropped 0. No differing chunk, so no deviation drain or differing offset to list. The actual and expected whole-chunk and per-event-kind digests are in CHUNK_COMPARISON.json.

| Event kind | Count |
|---|---:|
| CALL | 2266610248 |
| FACT_APPEND | 821959 |
| SUPPORT_COPY | 1712497 |
| DUPLICATE | 210949 |
| ERROR_EVENT | 0 |
| BARRIER | 284054080 |
| CONTEXT | 23063136 |
| INTERN_RESULT | 1499328 |
| RANK_STEP | 1969492 |

480 full field effects: 12 P20_EXEC_ASSIGN, facts 623402-623413, THIS -> NO; 468 P20_EXEC_RETAIN_SITE, NO -> NO. All 480 ordered-support references SAME FIELD_EFFECT_SUPPORTS.json and the captured native facts.

The 480 envelopes are identity projections from those actual captured events through the sealed carrier rows. Each envelope retains event offset, fact, ordered supports and all incident junctions. There are 1,080 junction references, 28 on assignments. They are host-derived envelopes, not a claim that the GPU emitted the envelope JSON or executed JTPClosureV1.

| Junction | ASSIGN references | RETAIN_SITE references | Total |
|---:|---:|---:|---:|
| 0 | 0 | 36 | 36 |
| 1 | 0 | 36 | 36 |
| 2 | 0 | 36 | 36 |
| 3 | 0 | 36 | 36 |
| 4 | 0 | 36 | 36 |
| 5 | 0 | 36 | 36 |
| 6 | 0 | 36 | 36 |
| 7 | 0 | 36 | 36 |
| 8 | 0 | 36 | 36 |
| 9 | 0 | 36 | 36 |
| 10 | 0 | 36 | 36 |
| 11 | 0 | 36 | 36 |
| 12 | 0 | 36 | 36 |
| 13 | 0 | 36 | 36 |
| 14 | 0 | 36 | 36 |
| 15 | 4 | 32 | 36 |
| 16 | 4 | 32 | 36 |
| 17 | 12 | 24 | 36 |
| 18 | 4 | 32 | 36 |
| 19 | 0 | 36 | 36 |
| 20 | 0 | 36 | 36 |
| 21 | 0 | 36 | 36 |
| 22 | 0 | 36 | 36 |
| 23 | 0 | 36 | 36 |
| 24 | 0 | 36 | 36 |
| 25 | 4 | 32 | 36 |
| 26 | 0 | 36 | 36 |
| 27 | 0 | 36 | 36 |
| 28 | 0 | 36 | 36 |
| 29 | 0 | 36 | 36 |

## Column and native result

SUBSTRATE column order 0..29: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 01 01 01 00 00 00 00 00 00 01 00 00 00 00

SUBSTRATE SHA-256: E872406E7D5E440FB866C0B8357913FC101C3C0A5507F8520B56AA413FA41179

RECORD SHA-256: E872406E7D5E440FB866C0B8357913FC101C3C0A5507F8520B56AA413FA41179

Columns SAME. Native CPU method comparison: IF_THEN. Not observed junctions: none. All 821,959 native facts and all four full readbacks SAME the retained observer-absent bytes; no second device execution without the observer was made. Final returned readback: 00BA1A2996D0B0D74BF5B1FCC3C32F5C4786CF9FF35B2CAB0D8AEEE41706DA90. Link 3: 501368508A256BE21091298B3A26B03726E41FC9E6C388925C0C8B8924DEBE8C, SAME through that byte-identical native construction and its bound returned-world projection; nothing appended.

## Recorder findings and boundary

The sealed executable writes its process completion to the same filename as its earlier structured footer. The original structured footer is not retained. EVENT_CAPTURE_COMPLETION.json is explicitly reconstructed from retained chunk logs and the native completion marker: StructuredCapture278::finish in structured_drain278.h checks every lane's attempts = used = drained count and dropped = 0, flushes every stream, and must return before native_completion is called. The final process markers and successful exits witness that path. No sealed executable was modified.

A legacy-PowerShell identity preflight failed on Get-FileHash before any CUDA invocation; its files remain in ../substrate_execution_278_authorized. The unchanged collector was invoked using the available PowerShell host. That read-only preflight consumed no execution authorization. The later CUDA execution above consumed it; no automatic retry occurred.

This IF_THEN is the spec's column-comparison verdict. It does not identify ASSIGN as shed or discharge R_SHED_CLASS, and makes no status or q2 claim.
