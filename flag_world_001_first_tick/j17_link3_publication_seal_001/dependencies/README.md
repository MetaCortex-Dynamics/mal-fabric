# Referenced diagnostic-run byte custody

This directory carries the complete 42-file `run_001` outputs of diagnostics 010 and 011, BECAUSE their final bindings, binding 013, and Test P refer to those bytes outside the repository. It retains their original paths, identities, run records, exports, sources, native readbacks, replay readbacks, images, maps, and logs. The original PDPE record is retained unchanged. This is transport custody, not law execution or promotion.

`DEPENDENCY_MANIFEST.json` binds each original path, byte count, and SHA256. Files below 16 MiB are copied under `raw/`; larger files are stored as lossless hash-deduplicated gzip streams split into parts of at most 40 MiB. Decoding is checked SAME against every original identity. `SOURCE_SHA256SUMS` names the original bytes; `SHA256SUMS` names this directory's storage and custody helpers.

The original source roots are `D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001` (22 files) and `D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001` (20 files). The manifest maps each backup-only path to storage here; historical run records and their original absolute locators are not rewritten. These two backup roots are read inputs only, never restoration destinations. Verification checks every stored part, their concatenated compressed stream, and the decompressed original identity independently.

`node custody.mjs verify` checks stored bytes and decoded identities without reading any backup drive. `verify-originals` also compares the unchanged original backup paths. `restore` creates copies only under this directory's `restored/`, never at an original path; an existing copy must be SAME or the command stops. No existing binary is overwritten. No GPU or Python is used by these transport operations.
