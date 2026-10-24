# O_API_REALIZATION — review items 1–3

Implementation record, 2026-10-23 America/New_York. This records execution of the user's instruction to implement items 1–3. It is not a new promotion and does not change README.md (`70D374000A4A8E17E3C481F4B7C46415C01871813A4A70FF0634F57FC5057C3C`).

## Interface

```javascript
const api = createBoundary({ evidenceDirectory, handlers });
const response = await api.invoke(
  { profile: 'JTP_ARCHIVED_J17_001', operation, input },
  { artifactDirectory }
);
```

`api_boundary.mjs` is a shared custody/error boundary for the six named contacts. It imports no carrier or world rules, launches no executor, constructs no field and appends no link. `handlers` are trusted, source-backed adapters; absent adapters return MAYBE/CONTACT_NOT_IMPLEMENTED. The tests use read-only synthetic adapters and do not establish source-adapter conformance. Adapters must not publish candidates, mutate input directories, or treat expected output files as execution. This is a programming interface for trusted adapters, not a sandbox for hostile JavaScript.

The entire O_API_REALIZATION obligation is NOT declared discharged by these tests. Closure below is against its numbered review items only. Source-backed adapter implementation/qualification remains separate work.

## Item 1: refusal representation

No promoted response member is added. `Result<T>.obligations` carries:

```text
REASON:<stable code>
DIAGNOSTIC:<JSON object>
```

The response `profile` always identifies the sole supported profile. An unsupported request's original profile is retained in the diagnostic's `requested_profile`, never admitted as the response profile. Unsupported profiles and operations return NO, null result, and do not dispatch a handler. `applyLaterEvent` is unsupported.

The diagnostic schema is `GAP_DIAGNOSTIC_V1`: invocation, requested_profile, operation, artifact_directory, resolved_artifact_directory, evidence_directory, reading, code, detail, retention, retention_error. A random invocation identifier distinguishes diagnostic files only; it never selects a carrier locus or changes world bytes. Request payloads and candidate payloads are not copied into diagnostics.

Refusal codes used by the boundary:

| Reading | Codes |
|---|---|
| NO | REQUEST_SCHEMA, UNSUPPORTED_PROFILE, UNSUPPORTED_OPERATION, DIRECTORY_CONTEXT_SCHEMA, ARTIFACT_DIRECTORY_REQUIRED, PATH_OUTSIDE_ARTIFACT_DIRECTORY, LINK_PATH_NOT_ADMITTED, ARTIFACT_NOT_FILE, BLOB_REF_SCHEMA, EVIDENCE_DIRECTORY_OVERLAP |
| NOT-SAME | BLOB_BINDING_MISMATCH |
| MAYBE | ARTIFACT_DIRECTORY_UNAVAILABLE, MISSING_ARTIFACT, CONTACT_NOT_IMPLEMENTED, MISSING_CONTACT_WITNESS, CONTACT_FAILURE, EVIDENCE_RETENTION_FAILED |

An adapter may throw `Refusal(reading, code, detail)` to carry its source-bound refusal. The boundary does not manufacture world admission from that facility. A handler exception maps to MAYBE with no result, not to a field of NO.

## Item 2: directory context

Each invocation requires exactly `{artifactDirectory}` as its separate context parameter. The root must be absolute and name an accessible directory. Its resolved identity is retained in the diagnostic. Input BlobRef paths are relative to that root. The shared read operation checks exact BlobRef members, length and SHA-256.

Absolute paths, traversal, empty path components, alternate data streams and trailing-dot/space aliases are refused. Every component is checked for a symbolic link or Windows junction; such paths are refused even if their target happens to be inside the root. File identity/containment is checked again after reading. Input directories must remain immutable during an invocation. This implementation does not claim OS-level protection from a concurrent hostile filesystem administrator.

`evidenceDirectory` is a separate, preconfigured absolute directory. It cannot contain the artifact root or be contained by it. Result `evidence` BlobRefs are relative to this evidence directory; input and contact-result BlobRefs retain their operation artifact context. This gives the existing BlobRef schema explicit context without altering frozen bytes.

## Item 3: failure evidence

Every completed refusal returns result null and includes the complete diagnostic inline. If the evidence directory is available, a uniquely named diagnostic file is created exclusively and flushed before returning; its hash/size/path is included in `evidence`. The caller can distinguish `FILE_AND_INLINE` from `INLINE` retention.

If evidence storage itself fails, no candidate is returned. The diagnostic is retained in the returned envelope with the storage error and no claimed file receipt. A previously successful candidate becomes MAYBE/EVIDENCE_RETENTION_FAILED. An earlier refusal retains its original reading/reason alongside the storage failure. Partial diagnostic files, if any, are not called complete evidence and are not deleted.

This covers returned API failures, including setup errors. No process can promise a durable write during total storage failure or evidence after forced process termination; neither is claimed. Callers must retain returned envelopes. Inline retention is explicit, not a silent assertion of disk persistence. The boundary itself publishes no downstream files or commits.

## Targeted execution

Command from the repository root:

```text
node flag_world_001_first_tick/genesis_anchor_protocol_001/test_api_boundary.mjs <fresh-absolute-output-directory>
```

Completed run: `C:/Users/devon/Documents/Codex/2026-10-04/new-chat/gap_api_boundary_tests_002/RUN_RECORD.json`.

Record SHA-256: `6459E96C74C61A18303D8D563FBFCE6E7896C55A2ACD5EF7C96C711B9B2512F8`.

35 targeted tests: IF_THEN. These include all six operation names through the shared boundary, unsupported profile and later-event refusal without dispatch, missing/extra request fields, missing/relative directories, traversal and absolute paths, Windows junction escape, missing/altered BlobRefs, absent adapters, all six adapter exception paths, explicit adapter refusal, null/nonserializable results, evidence overlap, unavailable evidence storage and storage failure after candidate computation. Fixture input bytes remained SAME. All 21 retained bindings and the promoted spec hash remained SAME.

The first attempt stopped at Windows EPERM while creating its test junction; it did not complete and is not counted as IF_THEN. Its partial diagnostics remain at `gap_api_boundary_tests_001/`. The completed retry used permission to create a test junction within the dedicated fixture directory. No production junction or board was touched.

| Obligation / review item | Bounded closure |
|---|---|
| O_API_REALIZATION / item 1 | IF_THEN: structured refusal representation and unsupported-profile routing tested. |
| O_API_REALIZATION / item 2 | IF_THEN: explicit directory context and tested path containment. |
| O_API_REALIZATION / item 3 | IF_THEN: null payload plus retained diagnostic for tested returned failure paths; storage-unavailable fallback is inline, not durable-file evidence. |

GAP-JTP-01–04 keep their inherited execution classifications. GAP-JTP-05–08 remain NOT EXECUTED as complete contact vectors; synthetic boundary tests are not renamed as those vectors. No new genesis, V1/V2 rerun or promotion occurred. Live-source profiles and later-event application remain outside the implementation.
