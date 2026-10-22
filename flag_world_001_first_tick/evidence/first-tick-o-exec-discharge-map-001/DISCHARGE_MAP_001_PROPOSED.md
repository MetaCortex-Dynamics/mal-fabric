# First tick O_exec discharge map — PROPOSED

```text
RECORD    := FIRST_TICK_O_EXEC_DISCHARGE_MAP_001 v0.1.0
STATUS    := PROPOSED; no DECIDE or PROMOTE performed
DATE      := 2026-10-22
AUTHOR    := Codex (PROPOSE)
DECIDE    := Devon
SPEC      := SPEC-FLAG-WORLD-FIRST-TICK-001 v0.1.3
SHA256    := 2ECF2EEF9A8901DA9C802922BEBE1F74C367D7A74E5B773528504B73854C1A01
COMMIT    := bccd23f4047647fc9e20fd1c00e1843480f8aba5
```

This proposes four bounded V1/V2 discharge entries and one partial/MAYBE entry. It does not declare `O_exec = {}`. The already promoted V1/V2 CONFORM result remains IF_THEN. No promoted source, vector, receipt or spec bytes are amended.

Each evidence ID below resolves to the exact file and full SHA-256 in the evidence index and the adjacent [machine-readable map](DISCHARGE_MAP_001_PROPOSED.json). Line spans refer to those bound bytes. The map's status is PROPOSED even where the underlying result is already promoted.

## Five named O_exec entries

| Obligation | Proposed disposition | Direct witnesses and reading | Limit |
|---|---|---|---|
| `O_SOURCE_DERIVED_LOWERING` (SPEC:137–139,181–189) | IF_THEN — discharge for frozen V1/V2 | BECAUSE CARRIER_SOURCE:99–169 and PREFILL bind native hardware incidence/refinement; CORRESPONDENCE:551–566 closes transport; DISPLACEMENT:69–172,331–362 constructs E0 genesis, offered completions and selected-member support. FIXTURE:27–35,60–68 carries actual readout placement and checked fixture custody into PROGRAM:50–124. V1_STATUS / V2_STATUS witness 42 sites, 120 edges, 80 triads, 480 flags, 720 overlaps, 720 typed cells and 720 cell-DRC results. Primary record V1_STATUS SHA-256 `413D72B169CF4A9522EAF51394822F3541038E1A3FD79F39356C064BA4BBEC19`; V2_STATUS `F7677E5BF74FFB8B3676D6B272C93F748669BA605867B11AC86EFF85F170602F`. | Bounded source lowering, not general placement beyond J17 or marker routes. Observer correspondences do not select a new actual-world κ. |
| `O_JTP_OBLIGATION_CONSTRUCTION` (SPEC:140–143,191–198) | MAYBE — partial support, remaining construction not discharged | Typed ingress, snapshot comparison, walls, receipts and game-world chain have SOURCE / RUN witnesses. GPU_DECISION `2CBBA4AD971D11AC2B2B4867ECCC4D58917A16602C096FE64308D0B8F487BCE7` removes the hardware append as a game-world gate, not the entire construction row. JTP_WORK `BAFB8BFB6027A5A6A22F1152BB6B4E7190F71BB4A6542AA7F91905CB0FC312BE` retains CHILD/work construction; JTP_PROJECTION and JTP_PUT retain byte/persistence constructions. No execution of those retained modules is identified in the bound successful vector source. | Keep source-work identities and authority/geometry/persistence projection production MAYBE. The hardware append remains hardware-lane O_next. No wholesale supersession or automatic replacement by fabric addresses. |
| `O_GPU_STEP_EXECUTION` (SPEC:144–145,200–207) | IF_THEN — discharge for frozen V1/V2 | BECAUSE V1_EXECUTION `88E6A87BD15225E5DCD667E1E3F289A356AFB4F658150049B4D4F05D2751399B` and V2_EXECUTION `72110EA10E2858EF6FD590781B8B19566BBCF8981FD15C2CAD2926C9BB9FE04F` bind source, images, proof custody, RTX 3070 execution with error=0, and exact readbacks. SOURCE:2894–2957 implements immutable snapshot, evaluation, propagation, runtime governance and simultaneous return. Both STATUS records contain 720 results, 1,440 runtime receipts and one STEP_FABRIC_RETURN. | The program's internal route list is empty and propagation returns NIL under its source-owned condition. This is not evidence for marker routes. Lowering epochs and additive stages are not extra world ticks. |
| `O_COMMIT` (SPEC:146–147,209–215) | IF_THEN — discharge for frozen V1/V2 under the GPU-worldline binding | BECAUSE SOURCE `3D4F086BB6F14A4FA21B90CC877E6AB3BF704CBA08E89647FFFFC727B1410C28`:3034–3047,3053–3104,3128–3158 requires the returned successor, every committed comparison, the supplied decision and predecessor-chain match; it constructs the receipt, hashes and one new TICK link before COMMITTED_VECTOR_OUTPUT. RUN and CONFORM bind VCOM_COMMIT facts 1943315 / 1506900, VCOM_RETURN and complete-results support; both actual outputs retain genesis and append one TICK. | This is the GPU game-world commit, not external Tang/VF2 acknowledgment or an AVR board receipt. It is not the J17 world's own second link. Source predicate VCOM_PROMOTION is not a corpus PROMOTE act. |
| `O_VECTOR_CONFORMANCE` (SPEC:148–149,217–222) | IF_THEN — already discharged and promoted | BECAUSE CONFORM `DBD4F2A387B66E751604A14ED27C46E2BE594C7D9949BFB9310C058AD1EB0942` records V1 EXECUTED/SAME, V2 EXECUTED/SAME and one verdict IF_THEN; RUN `6089FDC4E2B8673BBEA80925AC80BD0BB787857932723564DDA7F9D2499A8F99` binds execution; PROMOTION `162397CBFAB7FC543D80601882A7E071B0D4387D0895C341F588DAF5B831470E` records Devon's act. V1_ACTUAL / V1_EXPECTED and V2_ACTUAL / V2_EXPECTED match byte identity and length. | CONFORM remains V1/V2 only. No candidate STATIC/EXEC/GAME IDs are accepted by this map. No J17 or independent-builder promotion is inferred. |

## JTP distinction requiring review

The promoted self-witness record names its scope at GPU_DECISION:7: `O_GENESIS_CAPTURE and O_COMMIT`. Its binding at :27–29 states:

> The Tang/VF2 JTPClosureV1 append (JTP :22) is the HARDWARE lane's commit. It is NOT a gate on the game world.

GPU_RECEIPT:49 explicitly records:

> none. First binding of the game world's worldline and commit.

Accordingly, the proposed map records a changed commit boundary, not a blanket supersession of `O_JTP_OBLIGATION_CONSTRUCTION`. The original source-work, identity, authority/geometry/persistence and successor/lift/receipt-support requirements remain named.

The retained construction is specific: JTP_WORK:187–203 produces CHILD preimages and seals the complete materialized set before exposing work IDs; :230–231 feeds the obligation identity to the PURE projection. JTP_PROJECTION:24–26 names obligation, authority, geometry and persistence byte outputs and explicitly does not emit a worldline or COMMITTED. JTP_PUT:1–3,20–31 is a supplied PURE80, virtual first-PUT construction, not a hardware acknowledgment.

These files are custody, not execution evidence for the promoted vectors. The common successful SOURCE bytes contain I20_EVALUATE, VCOM_RETURN and VCOM_COMMIT but no JW_, JO_ or JP_ construction. JTP_WORK:24–26 itself distinguishes retrospective construction/audit from the authority of an earlier execution, and :194–195 states: `Hash custody is not discharge.` Thus the remaining JTP construction stays MAYBE in this proposal. The bounded V1/V2 result is not reopened.

## Exact observed commit bindings

| Vector | Actual and expected SHA-256 | Bytes | Source commit / return facts | Final raw readback SHA-256 |
|---|---|---:|---|---|
| V1 | `69786966E9B5D66A2078D29C43E1F1511545786AB07BF562E37D91205085B588` | 33563 | VCOM_COMMIT 1943315; VCOM_RETURN 1935595; all-results 1935596 | `6D53361888B08DC56FEAB2D66032C0D633EDF51EEE03F1107D9F263DDFC6D0C3` |
| V2 | `BD0492B4CAC427432CC3251EB27FC997C0D5EFF2862ECBC10A89B9AC19F1AD0F` | 33548 | VCOM_COMMIT 1506900; VCOM_RETURN 1499178; all-results 1499179 | `2E621111C4A085CE8990D4D615AB20163550518021254A08998A7D0E55441244` |

Both outputs contain GENESIS plus one TICK, with 2 discharged overlaps, 2 opened overlaps, 3 walls after and receipt_reading THIS. CONFORM records checks of the retained predecessor entries, each complete-record link hash, predecessor link, receipt hash and state hashes. Expected output bytes are recorded as NOT_PRESENT_IN_BOUND_INPUTS.

The map rechecked the selected evidence files' SHA-256 and decompressed each archived final readback in memory: both raw hashes are SAME as their execution records and MANIFEST. This is byte custody, not a new execution or an independent replay of every proof chain.

## O_next remains separate

SPEC:333–339 retains the following forward obligations. None is made a gate on the promoted bounded first tick.

- `O_AVR_REPAIR_BOARD_RECEIPT`: hardware lane; open.
- `O_LATER_TICKS_AND_REENTRY`: open; the J17 world's second step belongs here.
- `O_R1_R3_GATE_READING_SELECTION`: parked by its record.
- `O_INDEPENDENT_BUILDER_COMPARISON`: new proposed discharge reported in the current user message; no promotion inferred.

### New independent-builder proposal

The user reports `claude/RECORD_INDEPENDENT_BUILDER_COMPARISON_001.md` and an independent Python realization with hash prefix E02C90DE…. Reported scope is the D2-labelled V1/V2 vectors: both output hashes and sizes match, all five malformed-input controls are rejected, and site/edge/triad completion counts are 2/1/2. The report states that overlaps, offered completions, genesis and tick were independently constructed without reading the realization bodies or Codex's implementation.

This is a proposed discharge of the full first-tick comparison, distinct from the earlier REF012 carrier-only witness. The exact new record/source/bundle bytes have not been located by this pass, so their full hashes and independence declaration are USER_REPORTED, not locally hash-bound. The Python code is not run or imported into the realization. No effect on J17 is claimed. O_next is not silently erased while the proposal awaits review and Devon's promotion.

PROMOTION:67–68 separately names the J17 world's second step as next O_exec and runtime-sized fact capacity as O_next. Its :43–44 excludes placement beyond J17 and marker-route geometry. Those follow-ups are unchanged and are not extra V1/V2 conformance gates.

## Evidence index

`P` = `C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/review/first-tick-conform-v1-v2-001/`

`R` = `C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/review/first-tick-conform-v1-v2-001/files/realization020/`

Files under P belong to the sealed commit named above. Desktop authority records and GENESIS_RUN are separately hash-bound local contacts; no claim is made that they were added to that commit.

| ID | File | SHA-256 |
|---|---|---|
| SPEC | `P/files/frozen013/SPEC_FLAG_WORLD_FIRST_TICK_001_v0.1.3_PROPOSED.mal` | `2ECF2EEF9A8901DA9C802922BEBE1F74C367D7A74E5B773528504B73854C1A01` |
| GPU_DECISION | `C:/Users/devon/Desktop/MaL/MaLv3/DECISION_RECORD_GPU_SELF_WITNESS_001.mal` | `2CBBA4AD971D11AC2B2B4867ECCC4D58917A16602C096FE64308D0B8F487BCE7` |
| GPU_RECEIPT | `C:/Users/devon/Desktop/MaL/Markdowns/RECEIPT_PROMOTE_DECISION_RECORD_GPU_SELF_WITNESS_001.md` | `C1BA60101C95E76C3D2F090B00E3B679A6B58851B8A235829214D2B6249BD072` |
| PROMOTION | `P/files/corpus/Markdowns/RECEIPT_PROMOTE_FIRST_TICK_CONFORM_V1_V2_001.md` | `162397CBFAB7FC543D80601882A7E071B0D4387D0895C341F588DAF5B831470E` |
| RUN | `R/parallel_prefill_002/RUN_RECORD_V1_V2_CONFORM_009.json` | `6089FDC4E2B8673BBEA80925AC80BD0BB787857932723564DDA7F9D2499A8F99` |
| CONFORM | `R/parallel_prefill_002/vectors_v2_009/V2/conform/CONFORM.json` | `DBD4F2A387B66E751604A14ED27C46E2BE594C7D9949BFB9310C058AD1EB0942` |
| SOURCE | `R/parallel_prefill_002/vectors_v2_009/V2/stage14/source.mal` | `3D4F086BB6F14A4FA21B90CC877E6AB3BF704CBA08E89647FFFFC727B1410C28` |
| PREFILL | `R/carrier_prefill_001/PREFILL_MANIFEST.json` | `D40F88D9CA521EDF95A4FC347A309D8B23F5605F47EC164F91BB2CAD80DF4AD7` |
| V1_BUILD | `R/parallel_prefill_002/vectors_repeat_008/V1/stage14/BUILD.json` | `23DA190F81468F9028ED4AC20D5F303EBD6825C008D5BB12057F81E6302BF139` |
| V2_BUILD | `R/parallel_prefill_002/vectors_v2_009/V2/stage14/BUILD.json` | `F0AB879244A530EA7389E57903FD99150E8525F0328DEF0531076E36FF95E3A9` |
| V1_EXECUTION | `R/parallel_prefill_002/vectors_repeat_008/V1/stage14/EXECUTION.json` | `88E6A87BD15225E5DCD667E1E3F289A356AFB4F658150049B4D4F05D2751399B` |
| V2_EXECUTION | `R/parallel_prefill_002/vectors_v2_009/V2/stage14/EXECUTION.json` | `72110EA10E2858EF6FD590781B8B19566BBCF8981FD15C2CAD2926C9BB9FE04F` |
| V1_STATUS | `R/parallel_prefill_002/vectors_repeat_008/V1/stage14/STATUS.json` | `413D72B169CF4A9522EAF51394822F3541038E1A3FD79F39356C064BA4BBEC19` |
| V2_STATUS | `R/parallel_prefill_002/vectors_v2_009/V2/stage14/STATUS.json` | `F7677E5BF74FFB8B3676D6B272C93F748669BA605867B11AC86EFF85F170602F` |
| V1_ACTUAL | `R/parallel_prefill_002/vectors_repeat_008/V1/conform/V1.actual.json` | `69786966E9B5D66A2078D29C43E1F1511545786AB07BF562E37D91205085B588` |
| V2_ACTUAL | `R/parallel_prefill_002/vectors_v2_009/V2/conform/V2.actual.json` | `BD0492B4CAC427432CC3251EB27FC997C0D5EFF2862ECBC10A89B9AC19F1AD0F` |
| MANIFEST | `P/CUSTODY_MANIFEST.json` | `D3B4603F7E466A7BC1779DC8F37CFB23528B44B46382D4E3A90C0CEE6C3AE051` |
| SUMS | `P/SHA256SUMS` | `EE7834B29990690493437EA032D5A5A5173548A118C4CB5F3AEAD8BCC056F167` |
| REF012 | `R/ref012_indexed_qualification/ReferenceComparison.json` | `51C13350CCCA5B14DCBBEFD1D8842824809E79F8B4230BEF0E6871850908CBF6` |
| JTP_WORK | `R/source/jtp_work_identity.mal` | `BAFB8BFB6027A5A6A22F1152BB6B4E7190F71BB4A6542AA7F91905CB0FC312BE` |
| JTP_PROJECTION | `R/source/jtp_obligation_projection.mal` | `1AE4FFFDC77BBB8B7C3643D24C7FA6B623FF70FA66E7C425E5FDA79BCF7018CC` |
| JTP_PUT | `R/source/jtp_first_put_memory.mal` | `088B6C4B88CC0FA68FA556BFFE073925433D9F3752687F9BC472C9556DECC2D0` |
| INGRESS | `R/source/ingress_core.mal` | `1711AFA95ED0FC5F09F5AD97B6841D57020EFDC2E7A9DB50472912CF21979E3C` |
| FIXTURE | `R/source/fixture_core_contacts.mal` | `7742D51A77BE1691356955773D41E2EF7FB73C36451956AED2ABB295624EE541` |
| DISPLACEMENT | `R/source/vector_displacement.mal` | `22192EBAEE1248B35B722C97924B0FF6DF577CCD024F0A9B9F75C9A6ECFB3F8F` |
| GENESIS_RUN | `C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/gpu_self_witness_018/RUN_RECORD_018.json` | `66E9573678D0F8F08A71E5146193BF9780C38E7F526E6C77F2709CC8D6AE1B12` |
| V1_EXPECTED | `P/files/frozen013/V1.expected.json` | `69786966E9B5D66A2078D29C43E1F1511545786AB07BF562E37D91205085B588` |
| V2_EXPECTED | `P/files/frozen013/V2.expected.json` | `BD0492B4CAC427432CC3251EB27FC997C0D5EFF2862ECBC10A89B9AC19F1AD0F` |
| CARRIER_SOURCE | `R/carrier_prefill_001/source.mal` | `A5729729A8636C16DA1AC84476C6B32E5CD443BE506BE7068CCB53FB57792A8F` |
| CORRESPONDENCE | `R/source/vector_correspondence.mal` | `0A78B3DD388875DAAF8CEC82B7A3EF23DBC4B114B132EC81969E6DA9B76250EF` |
| PROGRAM | `R/source/program_core.mal` | `074C3E00794D6D3EFB9020CCE3A5600606851677AE25B7E1D6D65457ED663D82` |

Raw final readbacks are losslessly stored as `P/blobs/<raw-sha256>.gz`; MANIFEST binds original paths and sizes. The adjacent JSON also binds each stored gzip hash and size.

No source, promoted spec, frozen vector, original receipt or sealed package member changed. No runtime/Python/board execution, staging, commit, push or promotion occurred in this mapping pass.

