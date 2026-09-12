# DEMO-004 — Dual-Surface Render Binding

DEMO-004 projects one coherent, committed game/fabric snapshot through two presentation surfaces:

- `GAME` is a playable arena projection with a player, two enemies, committed behavior animations, and a deliberately structure-free `BLOCKED` stall.
- `CARRIER` is a structural projection of operator × witness cells, typed ports, directed routes, TRIAD regions, payload phases, partial frames, obligations, and canonical blocked reasons.

Both projections bind the same `RenderSnapshot`. Toggling is presentation-only: it cannot tick the game, step the fabric, admit an edit, disposition a proposal, or mutate semantic state.

## Run

```text
python demo_server.py
```

Open `http://127.0.0.1:8768`.

Use **Advance logical tick** to execute one imported DEMO-003 game/fabric step. Switch between **GAME** and **CARRIER** at any time; the snapshot identity remains fixed until a logical tick commits.

## Verify

```text
python run_conformance.py
python run_full_regression.py
```

The DEMO-004 acceptance target is `26/26` (`DT01–DT06`, `DG01–DG06`, `DC01–DC06`, `DP01–DP04`, `DR01–DR04`). Its evidence corpus is 26 receipts plus one summary. The inherited floor is `227/227`.

## Authority boundary

```text
renderer := observer / projector
NOT := proposer
NOT := decider
NOT := promoter
NOT := executor
```

`RenderBindingSpec` is content-addressed presentation metadata and never enters canonical program identity. `RenderSnapshot` contains serialized committed values rather than mutation-capable engine handles. Semantic-looking cues require a declared `PresentationDerivation`; missing sources produce `SOURCE_UNAVAILABLE`, not invented state.

## Import

This implementation imports published `mal-fabric v0.6.0` unchanged:

- DOI: `10.5281/zenodo.22726846`
- DEMO-003 kernel, acceptance evidence, and promotion record are checked by exact SHA-256 before import.

Optional Gaussian assets, stellation, and the 3-6-9 perception pipeline remain outside the DEMO-004 acceptance boundary.
