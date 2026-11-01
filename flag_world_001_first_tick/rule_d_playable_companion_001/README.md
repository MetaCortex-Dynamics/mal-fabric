# Contextual persistence — playable companion

Two recorded Rule D fields and the same containing-face offer, presented as an interactive replay of Paper Two’s evidence.

## Source skeleton

WHAT: the same 24-flag region in two recorded fields.
HOW: recorded source → same 96-flag face offer → recorded receipt → recorded disposition.
FOR-WHAT: expose the effect of the surrounding field on retention.

The nested source has 64 walls. Its face-to-THIS candidate changes 42 flags and has receipt (30 discharged, 10 opened, 34 retained). It is withheld BECAUSE 10 walls open. The held source remains at 64 walls. A separately labelled preview displays the candidate’s 44 walls.

The contrast source has the same hole and 20 walls. The offer changes 24 flags with receipt (20 discharged, 0 opened, 0 retained). Its recorded effect is replayed as uniform THIS.

## Evidence and scope

`extract-rule-d.mjs` reads pinned source records, compares exact receipt sets and hashes, and emits the display data. `prepare-display.mjs` removes local source paths from served metadata. `DATA_BINDING.json` records input identities. The chart follows recorded site identities for display; positions never decide a receipt. Targeted GPU receipts are distinguished from the separately published complete-family computation.

`dist/model.mjs` is a viewer state machine over recorded outcomes. It is not a replacement for the native realization and generates no offers or new transitions. No world link is written. No GPU invocation is made. O_DRC_FABRIC_REALIZATION_038 remains PAUSED.

## Run and check

Run `node prepare-display.mjs`, `node check.mjs`, then `node server.mjs` for local preview at http://127.0.0.1:4317. The buildless Site serves `dist/`.

Paper: https://doi.org/10.5281/zenodo.23855122

Published source: https://github.com/MetaCortex-Dynamics/mal-fabric/commit/315a920e165c17a232896addf179e0ac0e4a240d

The new demonstration is a companion; the published paper and sealed evidence are unchanged.
