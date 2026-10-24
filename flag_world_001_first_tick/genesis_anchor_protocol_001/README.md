# Genesis Anchor Protocol v0.1.0

STATUS: PROPOSED. Codex records the existing-contract trace and proposes API contacts; no promotion or new execution claim.

The reference is verification kit `verification-kit-001-v1.0.0`, commit `e244924d1f79600015c40260ecc505884aea29f0`, ZIP SHA-256 `701279395704DAA51AA4C0909F90B1C19959558943AA93096E850C5AC89114B8`.

This directory does not modify that kit. `bindings.json` supplies full file hashes and source line ranges for the trace below. All paths in that file are relative to the released kit. The API names and response envelope below are proposed packaging, not an assertion that the released runner already exports six callable functions.

## Authority and scope

Ground₀ is the complete 480-flag field with every reading NO, not absent or unread input. Initial genesis consumes that exact predecessor. This profile is `JTP_ARCHIVED_J17_001`: replay of the bound capture, not a live capture service or general JTP admission implementation.

The promoted `DECISION_RECORD_GPU_SELF_WITNESS_001` binds the captured reply to the GPU world's genesis. Its receipt binds the decision to `2CBBA4AD971D11AC2B2B4867ECCC4D58917A16602C096FE64308D0B8F487BCE7`. The hardware lane's append is not the GPU world's commit. The capture metadata records physical closure; it is not relabeled as a retained worldline-appended JTPClosureV1.

The whitepaper DOI and any later software DOI identify publications. Neither supplies event authority or changes this contract. HSM, sensor and timestamp profiles remain unspecified: authenticity or time alone supplies no carrier locus.

## Proposed API types

These are language-neutral record schemas. Every listed member is required; no additional members are admitted in v0.1.0. Arrays preserve their stated ordering. Identifiers are opaque strings, compared by equality, not magnitude. Integer byte sizes and offsets describe transport only.

```text
Digest := uppercase hexadecimal string of exactly 64 characters
BlobRef := { path: string, bytes: nonnegative integer, sha256: Digest }
Profile := "JTP_ARCHIVED_J17_001"
Reading := "IF_THEN" | "NOT-SAME" | "NO" | "MAYBE"
Capture := { profile: Profile, event: BlobRef, evidence: BlobRef }
Validation := { capture: Capture, descriptor: BlobRef, frame: BlobRef,
                contract: BlobRef, authority: BlobRef, authority_receipt: BlobRef }
Locus := { validation: Validation, carrier_source: BlobRef,
           signature_hex: "1100030409", junction: "J_17",
           site: "C:HW_04|HW_09" }
Seed := { locus: Locus, predecessor: BlobRef, field: BlobRef,
          witness: BlobRef, agreement_changes: BlobRef }
Commit := { seed: Seed, committed: BlobRef, execution_receipt: BlobRef }
Result<T> := { profile: Profile, operation: string, reading: Reading,
               result: T | null, evidence: BlobRef[], obligations: string[] }
```

`BlobRef` always binds raw bytes. Resolve paths relative to the operation's declared artifact directory; prohibit escaping that directory. SHA-256 is a byte-custody check, not source authentication. The API envelope is not hashed into the existing world link. Existing JSON output spelling and lowercase internal hash strings remain unchanged.

IF_THEN requires a complete stage witness and non-null result. Every other reading returns null, retains diagnostic evidence, and publishes no downstream candidate or commit. Missing premises yield MAYBE, never a field of NO. A supplied byte-binding mismatch yields NOT-SAME. An unsupported operation/profile or non-ground predecessor passed to initial genesis yields NO under this proposed wrapper. These wrapper responses are not fabricated historical runtime verdicts.

## Contacts and extraction

| Proposed operation | Inputs → result | Existing source and boundary |
|---|---|---|
| `captureArchived` | event + evidence → Capture | `inputs/captured-frame.bin`, `inputs/capture.json`; byte custody only, no new acquisition |
| `validateArchived` | Capture + released contract → Validation | `transport_slices.mjs:7–29`; `genesis_run.mal:277–316`; exact binding, bounded grammar, CRC equality, recorded physical-closure evidence |
| `locate` | Validation + carrier source → Locus | `genesis_run.mal:245–276,306–311` and `:181–184`; full signature → junction → midpoint site → site-support flags |
| `seedInitial` | Locus + Ground₀ → Seed | `genesis_run.mal:231–236,327–376`; complete marking, gluing, agreement changes |
| `commitInitial` | Seed + source/executor bindings → Commit | `commit_run_v3.mal:444–537`; complete fields/witness, hash subjects, predecessor binding, one committed link |
| `verifyInitial` | Commit + released contract → Commit | `replay.mjs:71–94`; complete canonical outputs, not counts alone; existing execution receipt retained |

The reference implementation invokes these contacts as one recorded pipeline, not six independently mutable services. Intermediate objects are candidates; only the source-derived COMMITTED_GENESIS output is the world commit. A host-written Seed or Commit object is not an execution witness.

`applyLaterEvent` is a separate, unimplemented contact in this proposal. It must return NO/UNSUPPORTED_OPERATION here. It must not call `seedInitial` against a non-ground state, reset a field, or claim that the J17 link-2 replay authorizes arbitrary later events. Later-event admission, event sequencing, duplicate-event policy and transactional storage/concurrency require their own bound contract.

## JTP reference profile: exact retained wire contact

The retained event is 132 bytes, SHA-256 `4472CFC5B73C1BA745D3129E7111C0FA394C7C6CEE42D1E6E7E9691E5FF7228B`. It is the captured kind-3 persistence reply. Do not describe it as the deferred 180-byte composite capture.

The descriptor cites `runtime/common/jtp_v1.h:59–89` with parent SHA-256 `D1D745FE64F9422DD802E3E3A31EDD5BE81BE49505E02697F163F82D78AAF9CB`. The executable contact here is the included descriptor, not an assertion that the parent header is bundled or that the complete JTP grammar was re-audited.

| Field | Byte slices (offset, length) | Retained hex |
|---|---|---|
| magic | (0,4) | 4A545031 |
| version / kind / phase | (4,1) / (5,1) / (6,1) | 01 / 03 / 03 |
| header_bytes / payload_bytes | (8,2) / (10,2) | 0050 / 0030 |
| machine_id | (12,8) | 4D414348494E4531 |
| transition_id | (20,8) | 0000000000000001 |
| junction_signature | (28,1) concatenated with (30,4) | 1100030409 |
| opcode | (29,1) | 02 |
| predecessor_kind | (38,1) | 02 |
| predecessor_crc32 | (40,4) | 1BCB4198 |
| predecessor_frame_bytes | (44,2) | 00BA |
| crc32 | (128,4) | 6FD6BD94 |

CRC32/IEEE is computed over bytes [0,128). The released slicer returns uppercase hex without interpreting identifiers as numbers. The bounded source grammar checks magic/version/kind/phase/size/header length/payload length, then CRC equality. The full event SHA additionally fixes every unsliced byte. Opcode and predecessor header fields are retained but are not carrier-address selectors or the GPU predecessor hash.

The full signature `1100030409`, not its first byte alone, maps to J_17. The source's hardware edge binds J_17 to HW_04 and HW_09. Its midpoint site is `C:HW_04|HW_09`. Payload content, byte magnitude, name order, time, wire pin and opcode do not select that site.

The capture metadata must match the released bytes, including response digest, `CLOSED_LED_WITNESSED` and `FIRST_JTP_TRANSITION_CLOSED_OPERATOR_NATIVE_COMPOSITE_ADMITTED`. Its original Boolean diagnostic members remain untouched as frozen evidence; they are not the new API verdict space. This profile does not rerun Tang admission, prove signature-based authenticity, or accept user-authored metadata as a fresh physical receipt.

## Seed, witness and committed bytes

Source rules mark every flag at the bound site THIS and every other carrier flag NO. The event does not select a face or an individual flag. For the retained capture: 12 THIS, 468 NO; all 720 overlap readings retained, 708 SAME and 12 NOT_SAME walls. Walls are recorded, not a refusal of genesis. Against Ground₀, 12 walls open, none discharge, none are retained.

The exact field format is an ordered array of `[flag, reading]`; flag is `[site, [edge-site, edge-site], [triad-site, triad-site, triad-site]]` in the source's observation encoding. Witness rows are `[flag, flag, "SAME"|"NOT_SAME"]`. Agreement-change rows are `[flag, flag, "UNCHANGED"|"OPENED"|"DISCHARGED"|"RETAINED"]`. Existing expected files, full hashes and source-owned encoders are normative for bytes; this description does not permit reordering.

The committed object is `{chain,field,receipt,witness}`. `receipt` is `{discharged,opened}`, each an array of flag pairs. `chain` has one `{link,record}` member. The record has exactly `event_record,field,kind,pair_hash,prev,receipt,receipt_hash,receipt_reading,witness`; kind is GENESIS and receipt_reading is THIS for this capture. Pair hash covers `{field,witness}`, receipt hash covers receipt, and link covers the complete record. `prev` is the Ground₀ field hash, not the hardware header's predecessor CRC. Source and encoder bindings govern canonical serialization and hash subjects.

Ground₀ SHA-256: `B263644E59A696999C02DFD25386A5ABEFDB2D0FC4317A0FE2CCCD90502EBAD3`.

Committed genesis SHA-256: `FDA614876C99126FCE2AFE6AC8E42A77863880485E02D4B4EDA4AA817446BD2C` (382131 bytes).

## Conformance reference and proposed API cases

Existing execution evidence is reused; no GPU rerun is performed for this specification. Primary and separate-builder genesis receipts each record 16 SAME comparisons and three IF_THEN transport controls. They use one RTX 3070 and one executor implementation; neither cross-backend conformance nor a new live capture is claimed.

| ID | Input / expected observation | Evidence status |
|---|---|---|
| GAP-JTP-01 | Exact released capture, evidence and Ground₀ → every bound canonical output SAME | Existing two-run receipts; source execution, not counts alone |
| GAP-JTP-02 | Missing capture → process refusal ENOENT; no decoded output | Existing transport control; proposed API maps to MAYBE/MISSING_CAPTURE |
| GAP-JTP-03 | Last capture byte XOR 1 → NOT_SAME input binding; no decoded output | Existing transport control; API NOT-SAME |
| GAP-JTP-04 | Capture metadata JSON substituted for binary capture → NOT_SAME input binding | Existing displaced-file control; NOT a displaced carrier-locus test |
| GAP-JTP-05 | Change junction header byte at offset 28, retain original expected SHA → NOT-SAME; no seed | Proposed spatial-displacement custody case; not executed here |
| GAP-JTP-06 | Exact event but missing capture evidence → MAYBE/MISSING_SOURCE_EVIDENCE; no seed | Proposed API case; not an additional historical receipt |
| GAP-JTP-07 | Non-ground predecessor passed to seedInitial → NO/NON_GROUND_PREDECESSOR | Proposed API separation case; not executed |
| GAP-JTP-08 | applyLaterEvent → NO/UNSUPPORTED_OPERATION; no state mutation | Proposed API separation case; not executed |

A CRC-repaired, rehashed displaced capture is outside this frozen profile. It cannot be admitted by changing the expected hash, BECAUSE the promoted event and source evidence are bound to the original bytes. This profile makes no general claim about accepting another source-authorized locus.

Recorded reference invocation, from the released kit directory:

```text
node replay.mjs --target genesis --output <fresh-directory-outside-kit>
```

Toolchain/device details and exact invocations are retained in the two genesis receipts. The proposed six-contact API is not yet implemented. Reusing these receipts establishes the reference outputs, not conformance of a future wrapper. V1/V2 CONFORM remains promoted and unchanged.

## Remaining obligations

- O_API_REALIZATION: implement and qualify the proposed envelope against these retained outputs and the explicitly proposed cases; not done in this draft.
- O_LIVE_JTP_PROFILE: bind acquisition, fresh source-authority evidence, sequencing and replay policy before accepting new captures; the archived profile is not that interface.
- O_OTHER_SOURCE_PROFILES: sensor/HSM/timestamp authority and carrier correspondence are not specified.
- O_LATER_EVENT_APPLICATION: separate non-ground transition contract; no genesis-rule extension.

These obligations do not reopen the released genesis or V1/V2 results. No commit, push, promotion, board action or world execution is performed by this proposal.
