# O_API_REALIZATION — archived-profile adapter qualification

Date: 2026-10-23 America/New_York. Execution record, not a new promotion.

Governing specification: README.md SHA-256 `70D374000A4A8E17E3C481F4B7C46415C01871813A4A70FF0634F57FC5057C3C`, promoted by receipt `4D0C23A8B75631BB964C94035EB673B65A1B3BC65ED8CA9152704B312AF9BE1D`.

## Verdict and scope

O_API_REALIZATION: IF_THEN for JTP_ARCHIVED_J17_001, using receipt-bound archived execution. The six contacts now have source-backed adapters, and their requests, returned records and evidence have passed through the shared boundary in targeted integration tests. This supersedes the earlier implementation record's open adapter-qualification status; that record and its earlier test receipts are retained.

The adapters retrieve and verify the original archived genesis. They do not execute a new GPU world transition, append another link, accept a new event, or substitute expected files for produced data. In particular, commitInitial returns the source-observed, receipt-bound archived COMMITTED_GENESIS. It does not claim that this integration run committed genesis again. Live replay acquisition, other source profiles and later-event application remain outside this discharge.

## Source-backed connections

`archived_adapters.mjs` exports `createArchivedAPI({evidenceDirectory})`, returning the existing boundary's invoke(request, context) interface. The trusted artifact directory has two roots beneath it:

- `kit/`: the exact released contract and its dependencies, plus the bound primary genesis receipt.
- `archive/`: outputs from that recorded execution, not files copied from expected/. The qualification record names each original execution path, size and SHA-256. Every image/readback and output is checked against the actual comparison identity in the pinned receipt.

Reference receipt: PRIMARY_GENESIS_RECEIPT.json, SHA-256 `BDC284C1F43621EA69A6098AB4A0B7F9FA6095770A3439E9A19CBE2E5CF95212`. Original output directory: `C:/Users/devon/Documents/Codex/2026-10-04/new-chat/public_kit_genesis_trial_001/`.

| Contact | Request input | Actual connection and returned evidence |
|---|---|---|
| captureArchived | Capture record | Reads supplied event and capture-evidence BlobRefs through the containment boundary; compares them to the pinned archived identities; returns Capture. |
| validateArchived | Capture | Executes released transport_slices.mjs; checks decoded bytes against the archived frame; reads PERSISTENCE_REPLY_GRAMMAR and ARCHIVED_PHYSICAL_CLOSED_LOCUS from the bound GPU closure; returns Validation. |
| locate | Validation | Reads the closure's full event-locus tuple and its source-produced SITE_TEXT relation; returns Locus. No host incidence or marking rule. |
| seedInitial | `{locus, predecessor}` | Checks predecessor custody against Ground₀, then uses released extract_json_rows.mjs on the original genesis readback for complete field, witness and change arrays; returns Seed references to the matching archived outputs. |
| commitInitial | Seed | Uses released extract_json_value.mjs on the original commit2_gpu readback, selecting COMMITTED_GENESIS; returns Commit with its pinned execution receipt. |
| verifyInitial | Commit | Checks nested source-backed references, receipt identity and complete output bytes against the contract's expected comparison targets; returns the same Commit. |

All calls recheck the released dependency bytes and archived output/readback identities. The new generic fact reader decodes typed terms and selects named facts; it supplies no event, carrier incidence, field or world law. Source maps are regenerated with the released lowerers for genesis_gpu and commit2_gpu. Their images must match the receipt-bound images before either map interprets its archived readback. The other two commit stages and hash responses remain bound to the inherited receipt and are checked without re-executing their GPU work.

Newly executed lowerer, decoder and extractor invocations retain command arguments, exit status, stdout/stderr, source identities, maps, observed outputs and custody sidecars. Those files pass through retainEvidence, which rechecks containment, byte size and digest before including their BlobRefs in the API envelope. Successful source observations may be reused within a session only while all current archive/dependency bindings continue to match.

The boundary's evidence-directory and inline-fallback conventions from review items 1–3 are unchanged. Handler access to the resolved artifact directory and retainEvidence is explicit; the handler remains trusted code, not a hostile-code sandbox. Concurrent mutation of source directories is outside the immutable-input execution contract.

## Qualification

Final integration record: RUN_RECORD_ARCHIVED_ADAPTERS_001.json, SHA-256 `FCDC753B9FE3FC53AE49AA9D197F9043D64E8CB308569A2C23AEE7747140FC37`.

19 integrated calls: IF_THEN against their expected results. The six positive contacts all return their specified record shapes. Negative calls cover missing, altered and displaced captures; missing capture evidence; non-ground predecessor; later-event refusal; substituted Validation, Locus, Seed and execution-receipt fields; changed capture content with its self-hash updated; and an altered archived commit after an earlier successful call. Refusals return null result with retained diagnostics. Source files, original execution outputs and frozen kit bytes remain unchanged.

Boundary regression record: RUN_RECORD_API_BOUNDARY_REGRESSION_001.json, SHA-256 `FAC3FD5AABA405EB410FAD71810FA34EF486030C17B022D1B0B0CABA47F372BF`. All 35 boundary cases remain IF_THEN after adding adapter evidence custody. The Windows junction fixture required the same bounded test permission as the earlier run.

The initial integration trial also completed, then a follow-up review moved pinned-file reads wholly behind the containment checker. The final 19-call run and 35-case regression bind the revised sources. Previous trial artifacts remain at gap_adapter_qualification_001; final artifacts are at gap_adapter_qualification_002 and gap_api_boundary_tests_003 beneath the workspace. No previous evidence is overwritten.

## Vector ledger

| Vector | Classification | Witness scope |
|---|---|---|
| GAP-JTP-01 | newly executed API integration; inherited GPU execution evidence | All six contacts connected; exact full archived outputs, source-derived maps and observers checked. No new GPU commit. |
| GAP-JTP-02 | newly executed | Absent event file → MAYBE/MISSING_CAPTURE; null result and diagnostic. |
| GAP-JTP-03 | newly executed | Altered final byte under original digest → NOT-SAME/BLOB_BINDING_MISMATCH. |
| GAP-JTP-04 | newly executed | Metadata substituted for event bytes → NOT-SAME/BLOB_BINDING_MISMATCH. |
| GAP-JTP-05 | newly executed | Header byte at offset 28 displaced under original digest → NOT-SAME/BLOB_BINDING_MISMATCH; no seed. |
| GAP-JTP-06 | newly executed | Missing capture evidence → MAYBE/MISSING_SOURCE_EVIDENCE. |
| GAP-JTP-07 | newly executed | Bound non-ground current field supplied as predecessor → NO/NON_GROUND_PREDECESSOR. |
| GAP-JTP-08 | newly executed | applyLaterEvent → NO/UNSUPPORTED_OPERATION; no dispatch. |

The inherited missing/altered/displaced transport controls remain inherited evidence, not relabeled as new hardware tests. New classifications above concern the actual API adapters. No general spatial-displacement law or new-event authority is inferred from rejecting a byte-modified frozen capture.

## Reproduction

From the repository root, using a fresh absolute output directory and the original receipt-matching execution directory:

```text
node flag_world_001_first_tick/genesis_anchor_protocol_001/test_archived_adapters.mjs <fresh-output> <recorded-genesis-output>
```

The test makes its own copies before negative mutations. Expected kit members are comparisons only. If recorded outputs are unavailable, receipt reuse cannot proceed: this adapter reports a refusal rather than manufacturing output from expected bytes. This qualification used the available original outputs, so no genesis rerun was needed.

No promotion, commit, push, board action, V1/V2 rerun, or change to the released ZIP accompanies this discharge. O_LIVE_JTP_PROFILE, O_OTHER_SOURCE_PROFILES and O_LATER_EVENT_APPLICATION remain open.
