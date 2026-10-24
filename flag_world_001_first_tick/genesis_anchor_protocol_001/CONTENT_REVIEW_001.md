# Genesis Anchor Protocol — content review 001

Date: 2026-10-23 America/New_York. Authority: Codex PROPOSE; Devon retains DECIDE/PROMOTE.

Reviewed object: README.md, SHA-256 `70D374000A4A8E17E3C481F4B7C46415C01871813A4A70FF0634F57FC5057C3C`. Bytes unchanged.

Source index: bindings.json, SHA-256 `EFF11C5B65222162D7495CA06A6B74D4AD2643C397617A671EE14673BDABBDF5`. All 21 file size/hash bindings checked SAME in this review. This is custody checking, not API conformance.

## Reading

The archived-capture construction is supported by the bound parents. The proposed API wrapper has not executed. Its refusal envelope and retention obligations must not inherit a conformance claim from the underlying pipeline. No new vector, hardware capture or GPU run was executed for this review. No promotion is recorded here.

All source paths below are relative to `../verification_kit_001/`. Their full identities are in bindings.json. G denotes sources/genesis_run.mal; C denotes sources/commit_run_v3.mal; R denotes replay.mjs; T denotes tools/transport_slices.mjs.

## Six-contact review

### Capture: captureArchived

- Inputs: exact 132-byte inputs/captured-frame.bin and exact inputs/capture.json, under the pinned GENESIS_CONTRACT.json. R:11–14,24,66 checks contract and members; the source identity is the retained capture evidence, not a caller-selected authority.
- Output: proposed Capture wraps those two BlobRefs; no acquisition or world output occurs here.
- Authority: DECISION_RECORD_GPU_SELF_WITNESS_001 and its promotion receipt bind this captured event. The receipt is not replaceable by a self-authored capture.json.
- Refusal: missing-file refusal and mismatched-byte refusal are inherited transport observations. MAYBE/MISSING_CAPTURE and the Result<Capture> envelope are NOT EXECUTED.
- Retention: original kit remains read-only; R:19 requires a fresh output directory. R:36–42 retains altered test bytes and subprocess diagnostics. No generic live-source custody service is demonstrated.

### Validate: validateArchived

- Inputs: Capture, contract and descriptor; outputs frame.json plus the proposed Validation references, including authority and authority_receipt. T:6–24 binds input SHA, bounds slices and calculates CRC; G:277–305 checks the bounded grammar and CRC equality. G:315–316 binds physical-closure metadata to the same event digest.
- Authority: the hash-bound archived receipt; CRC/SHA checks do not establish fresh physical authenticity. G:300–301 explicitly excludes rerunning Tang admission.
- Refusal: exact tests demonstrate nonzero exit, expected diagnostic and absent decoded output for the three retained negative cases (R:35–43). A missing .mal premise withholds its derived fact; it does not itself emit the proposed JSON MAYBE response.
- Retention: T:25–29 writes the original bytes, decoded output and custody sidecar on success. R:28 retains command stdout/stderr. Exception safety for every proposed API failure path remains unexecuted.

### Locate: locate

- Inputs: archived frame digest, full signature, machine/transition identifiers, and carrier incidence. G:263 binds signature 1100030409 to J_17; G:182 and :306–311 bind that junction to site C:HW_04|HW_09 and its site-support flags.
- Output: proposed Locus names the exact signature, junction and site. These are not a payload index, selected face or numeric ordering.
- Authority: source-owned header correspondence and retained hardware incidence, under the event-specific decision. Opcode is not an address selector.
- Refusal: an unmatched full signature has no HEADER_TO_JUNCTION witness. The exact frozen profile also rejects any changed capture SHA before lowering. A general new-locus admission path is not exercised.
- Retention: frame custody and complete genesis readback retain the derivation inputs/output. The proposed standalone Locus envelope is NOT EXECUTED.

### Seed: seedInitial

- Inputs: the located event and Ground₀. G:231–236 constructs every archived flag as NO; G:327–339 derives the complete current field from site support. In the released pipeline Ground₀ is source-produced, not arbitrary caller state.
- Outputs: current.field.json, current.witness.json and current.receipt.json (the latter is the full pair-status array, not the committed receipt object). G:347–376 supplies gluing and changes.
- Authority: promoted decision binds exactly 12 site flags THIS and all others NO, over the bound Ground₀. Walls remain witnessed data, not failed admission.
- Refusal: no event witness means no genesis field derivation. Explicit NO/NON_GROUND_PREDECESSOR at the proposed Seed API is NOT EXECUTED. The later commit also requires the exact Ground₀ hash (C:516–520).
- Retention: R:80–83 extracts all four complete arrays and compares full bytes, with stage readback and logs retained. It does not substitute counts for arrays.

### Commit: commitInitial

- Inputs: source-produced field and witness, frame/capture, complete predecessor and hash responses, plus bound lowering/executor. R:85–92 executes commit_run_v2 followed by commit_run_v3 with GPU hash responses. C:444–458 checks completeness and reconstructs Ground₀; C:503–531 binds the hash subjects and record.
- Output: exactly one chain entry in committed.genesis.json, alongside field, witness and receipt; C:534–537. prev is the Ground₀ field hash; hardware predecessor CRC is not substituted.
- Authority: the promoted self-witness decision distinguishes GPU commit from the hardware append. A host-authored Commit envelope cannot stand in for COMMITTED_GENESIS.
- Refusal: missing complete/hash-bound premises do not produce the commit fact. R:29,34 stops on command refusal or readback mismatch; the proposed contact-specific refusal envelope is NOT EXECUTED.
- Retention: intermediate stage readbacks, hash responses, extracted outputs and command logs remain in the fresh run directory. No rollback/deletion of those files occurs in R. Atomic persistent publication and concurrency semantics are not established by this archived runner.

### Verify: verifyInitial

- Inputs: complete produced outputs, pinned expected bytes, source/executor identities and execution receipt. R:33–34,71–94 compares the decoded header, four images/readbacks, four arrays, two hash-response outputs and committed object.
- Output: proposed Commit passthrough after comparison; the existing output is PUBLIC_REPLAY_RECEIPT_V1, not Result<Commit>.
- Authority: exact released contract and promoted decision. Both retained genesis receipts report EXECUTED / IF_THEN with sixteen SAME comparisons. One device and one executor remain the evidence scope.
- Refusal: comparison NOT_SAME stops continuation and is retained in the report (R:33–34,95–96). This is not proof that every API failure emits a receipt: setup checks at R:11–19 precede the try/catch.
- Retention: output files are not removed after mismatch; comparisons and command diagnostics are retained. The proposed requirement for diagnostic evidence on every non-IF_THEN API response exceeds the demonstrated wrapper behavior and remains O_API_REALIZATION.

## Vector classifications

Inherited receipts:

- verification/PRIMARY_GENESIS_RECEIPT.json: `BDC284C1F43621EA69A6098AB4A0B7F9FA6095770A3439E9A19CBE2E5CF95212`.
- verification/SEPARATE_GENESIS_RECEIPT.json: `6CF2D973061A0973593A3CF2590549A847A68CE8360A753A9D26823ACD29EEBF`.

Both were read and hash-checked. Each contains sixteen SAME comparisons and missing/altered/displaced controls with IF_THEN, scoped to frozen capture identity/transport only.

| Vector | Classification | Exact inherited correspondence / boundary |
|---|---|---|
| GAP-JTP-01 | inherited execution evidence | Exact archived pipeline and canonical outputs. Six-contact API envelopes themselves: not executed. |
| GAP-JTP-02 | inherited execution evidence | Missing binary, ENOENT, nonzero exit, decoded destination absent. Structured MAYBE/MISSING_CAPTURE: not executed. |
| GAP-JTP-03 | inherited execution evidence | Last byte XOR 1, original expected SHA, NOT_SAME input binding, destination absent. Structured API response: not executed. |
| GAP-JTP-04 | inherited execution evidence | Metadata JSON substituted for binary; exact recorded displaced-file test. No spatial displacement claim. Structured API response: not executed. |
| GAP-JTP-05 | not executed | Changed header locus, original SHA retained. Source inspection supports the stated refusal but is not execution evidence. |
| GAP-JTP-06 | not executed | Missing source evidence at proposed API boundary. |
| GAP-JTP-07 | not executed | Explicit non-ground predecessor rejection at proposed API boundary. |
| GAP-JTP-08 | not executed | Explicit later-event operation rejection at proposed API boundary. |

Newly executed vectors: none. Hash checks in this review are not added to vector execution counts.

## Review findings carried without changing the spec

1. **Refusal representation needs completion before API implementation conformance.** README's Result schema has no reason-code field, while vectors use MAYBE/MISSING_CAPTURE and NO/UNSUPPORTED_OPERATION. It does not say whether the suffix goes into obligations or another location. Also Profile admits only JTP_ARCHIVED_J17_001, while the prose promises a response for unsupported profiles. Representation of that response is not specified. These are API-envelope details, not gaps in the inherited genesis law.
2. **Artifact-root context is not in the request schema.** README requires paths relative to the operation's declared artifact directory, but does not specify how that directory is supplied. The released runner supplies it via --output (R:16–19). A future wrapper must bind an equivalent context without silently changing the hashed specification.
3. **Evidence retention is a requirement, not a universally inherited witness.** Success sidecars and three refusal controls are witnessed. Early runner setup errors precede receipt creation, and T writes its three output files sequentially. Therefore the spec's general retention promise cannot be claimed discharged by those tests.

The document already leaves O_API_REALIZATION open. These findings refine its scope; they do not reopen promoted V1/V2 CONFORM, require a new capture, or require a kit rerun. The exact reviewed hash may be considered for promotion as an archived-profile proposal with these open API details; this review does not represent it as an implementation-complete API or record Devon's promotion.

No original specification, kit member or receipt was edited. No commit, push, board action or promotion occurred.
