# J17 link 3 — repository evidence seal

Devon authorized commit and push on 2026-10-25. This seal publishes recorded execution evidence on the existing review branch; it performs no world execution, corpus promotion, board action, or merge to main.

Test P (`RUN_RECORD_TEST_P_020.json`, SHA256 `DE8052E6A1DB6F4B47D377D88622202E810D5FF3756BFB85CA17F31490DE1D70`) commits link 3, J17 section to NO: twelve walls discharged, none opened, terminal MOVED. Its renewed PROPOSE consumes that committed RETURN and evaluates all 1,924 incidence-fibre assignments with K empty. Replay is byte-SAME; reversed declaration closure is SAME; negative controls are retained. This is the bounded returned-state re-entry witness, not an unbounded running process.

The original two-link g2 and the 901 frozen evidence files remain unchanged. Intermediate findings, withdrawals, attempted constructions, diagnostics and controls remain in their own scopes; inclusion in this repository commit does not promote them or substitute them for the final run. The earlier ground-admission preflight is historical NOT_RUN evidence, not a renewed admission gate. The verification kit and its publication receipt are a separate promoted deliverable retained locally, outside this commit's scope. `DEPENDENCY_PATHS.json` locates its referenced first-tick contract at byte-identical already-frozen evidence. Erratum promotion is not performed.

`MANIFEST.json` binds each original path, SHA256 and size to its repository representation. Files smaller than 16 MiB remain at their original paths. Larger files use content-addressed lossless gzip; archives larger than 40 MiB are split into ordered chunks. The manifest binds each chunk and the concatenated gzip stream. Every decoded original is checked against its original SHA256 and size. All raw originals remain locally untouched; no pointer to unavailable storage replaces evidence.

`SOURCE_SHA256SUMS` binds original bytes. `SHA256SUMS` binds repository storage and seal metadata. The trace snapshot is custody material, not a new authority. Its conditional uniform-field consequence is distinct from the bounded execution recorded by Test P.

Large publication may use consecutive addition-only commits on the same review branch. `verify-head` checks the complete cumulative path set and every stored byte against this seal, with a linear parent chain from the recorded source commit and no modifications on any publication edge. Batching changes transport only.

`dependencies/` retains the backup-located 010/011 execution records and their full run evidence, plus separately bound carrier inputs needed by diagnostic T. Its manifests preserve historical source paths and original identities. No historical run record is edited to relocate a path.

From the repository root, with Node.js:

```text
node flag_world_001_first_tick/j17_link3_publication_seal_001/seal.mjs verify
node flag_world_001_first_tick/j17_link3_publication_seal_001/seal.mjs restore
node flag_world_001_first_tick/j17_link3_publication_seal_001/dependencies/custody.mjs verify
node flag_world_001_first_tick/j17_link3_publication_seal_001/dependencies/custody.mjs restore
node flag_world_001_first_tick/j17_link3_publication_seal_001/dependencies/t_contacts.mjs verify
node flag_world_001_first_tick/j17_link3_publication_seal_001/dependencies/t_contacts.mjs restore
```

`restore` verifies archives before recovering missing raw files and refuses to overwrite any differing file. The dependency helper restores only beneath its own `restored/` directory, never over historical backup paths. These commands perform byte-custody work only, with no GPU run or Python execution.
