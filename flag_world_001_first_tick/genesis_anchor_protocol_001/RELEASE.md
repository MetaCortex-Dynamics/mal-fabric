# Genesis Anchor Protocol — archived JTP capture only

Prepared release package v0.1.0. Publication is not performed by this preparation.

This package supplies the promoted archived-JTP API specification, implementation, source bindings, promotion receipt, content review and discharge evidence. O_API_REALIZATION is discharged for this archived profile: six connected contacts, 19 integration checks and 35 boundary regressions. The execution/provenance limits in O_API_REALIZATION_DISCHARGE_001.md travel with the result.

## Scope

- One exact archived JTP capture; no new hardware capture or arbitrary source admission.
- Ground₀ is the complete all-NO field. A non-ground predecessor is refused by initial genesis.
- GPU execution evidence is reused from the recorded NVIDIA execution. API integration, source lowering/observation and boundary tests have their own newly executed records.
- commitInitial returns the bound archived committed output. It does not append another worldline link.
- Live-event profiles and later-event application remain open. HSM, sensor and timestamp interfaces are not supplied.
- This is not a new cross-backend, independent-executor or V1/V2 conformance claim.

## Contents and custody

The ZIP root contains:

```text
flag_world_001_first_tick/
  genesis_anchor_protocol_001/  specification, implementation, tests, receipts
  verification_kit_001/         released kit files, unchanged
recorded_genesis/              original produced outputs, images and readbacks
qualification/
  adapters/                    final integration responses, commands and evidence
  boundary/                    final boundary diagnostic files and record
RELEASE_MANIFEST.json          relative paths, byte counts, SHA-256
```

The original released kit ZIP is not reconstructed or replaced. Its identity remains `701279395704DAA51AA4C0909F90B1C19959558943AA93096E850C5AC89114B8`, release `verification-kit-001-v1.0.0` at https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/verification-kit-001-v1.0.0 . The kit files included here are copied byte-exact; their internal historical records are not edited.

The paper is https://doi.org/10.5281/zenodo.23584296 . This API package is software supporting the archived execution boundary; it does not revise that manuscript or create a software DOI.

Historical evidence retains original absolute paths and device/toolchain metadata. Those paths describe the recorded execution; they are not dependencies on the author's machine. The included recorded_genesis directory supplies the exact bytes the integration test needs.

## Commands from an extracted ZIP

Required for these checks: Node.js 22.20.0 (the qualified version), an ordinary filesystem, and enough free disk for a fresh test copy and retained source-observation evidence. No GPU, CUDA compilation, Python or board access is needed for API qualification against the included archive. Source lowering and observation tools are already included in the kit.

Set the shell working directory to the extracted ZIP root. Verify byte custody first:

```text
node flag_world_001_first_tick/genesis_anchor_protocol_001/verify_release.mjs .
```

Then qualify the actual adapters using absolute paths for both arguments:

```text
node flag_world_001_first_tick/genesis_anchor_protocol_001/test_archived_adapters.mjs <fresh-absolute-output-directory> <absolute-extracted-root>/recorded_genesis
```

Expected: 19 checked calls IF_THEN. Six positive contacts; the remaining calls exercise specified refusals and tamper controls. The script copies input files before its negative mutations. It does not execute the GPU or modify the packaged archive.

Run the boundary regression separately:

```text
node flag_world_001_first_tick/genesis_anchor_protocol_001/test_api_boundary.mjs <another-fresh-absolute-output-directory>
```

Expected: 35 cases IF_THEN. The Windows junction-containment test requires permission to create a junction inside its test directory. If that operation is denied, the test stops; do not interpret a partial run as IF_THEN. Existing output directories are refused. Evidence files remain at the output directory printed by each command.

The two test run records may have different overall hashes on another machine, BECAUSE host metadata and evidence paths are recorded. The bound source identities and canonical world-output hashes must remain SAME. No additional genesis run is needed to run these archived-profile tests.

## Source API

```javascript
import { createArchivedAPI } from './archived_adapters.mjs';
const api = createArchivedAPI({ evidenceDirectory });
const response = await api.invoke(
  { profile: 'JTP_ARCHIVED_J17_001', operation, input },
  { artifactDirectory }
);
```

The integration test constructs the documented artifact directory (`kit/` plus `archive/`), and demonstrates each exact request/result shape. Consult README.md for the promoted schemas, API_REALIZATION_ITEMS_1_3.md for reason/directory/evidence conventions, and O_API_REALIZATION_DISCHARGE_001.md for the source-backed contact mapping. Expected files are comparison targets only; recorded_genesis supplies produced data.

## Publication description

Genesis Anchor Protocol v0.1.0 — archived JTP capture only. Six source-backed API contacts qualified by 19 integration checks and 35 boundary regressions. The package preserves the promoted specification and released kit, reuses receipt-bound GPU evidence, and includes the recorded outputs needed for API qualification without a new genesis run. Live-event profiles and application to a non-ground predecessor remain open. No cross-backend or new hardware-event claim.
