# Runs 021–023 — byte custody

Local repository seal authorized by Devon. This records execution evidence; it does not promote a result or change a spec.

`MANIFEST.json` binds all 353 original files in `j17_step_021/`, `j17_step_022/`, `j17_step_023/`, and their required `runtime_021/`. Failed attempts and diagnostics remain included. The 901 previously frozen files are unchanged.

Files at most 100 MiB are committed at their original paths. Seventeen larger readbacks are committed as lossless `blobs/<original-sha256>.gz` archives; the manifest binds both archive and recovered bytes. The raw files remain locally, unmodified and ignored. No LFS pointer substitutes for the evidence.

`SOURCE_SHA256SUMS` binds original paths and bytes. `SHA256SUMS` binds the repository storage files and seal documents. All paths are relative to the repository root.

`FROZEN_REHOME_MANIFEST_001.json` is the unchanged prior manifest, carried here by hash so verification of all 901 frozen files also works from this checkout.

From the repository root:

```text
node flag_world_001_first_tick/j17_runs_021_023_seal/seal.mjs verify
node flag_world_001_first_tick/j17_runs_021_023_seal/seal.mjs restore
```

`restore` verifies every archive before recovering absent raw files. It refuses to overwrite any existing file whose hash differs. It performs no world execution.

Run 023 is a world-field FIXED_POINT with a new chain link and changed fabric custody. It exercised twelve routes. It does not retroactively alter V1/V2's empty-route scope, discharge retained JTP construction, or establish tick-3 admission.
