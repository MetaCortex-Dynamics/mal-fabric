# PROMOTION RECORD — Forced Flag System, A1–A10

**Decision:** DECIDE + PROMOTE by Devon A. Generally, 2026-09-24.
**Proposer:** Claude (PROPOSE authority only).
**Evidence bundle:** `forced_flag_system_clean.zip`, SHA-256 `ff0f1fa2493a6ea0a4caa2b5b28937fea25f4dc77141acea49ccf48c8b9a6fe4`.
All outputs reproduce byte-identically across runs and across Python hash seeds.

Caveats listed below are part of the promoted content. They keep their MAYBE status inside the promoted record.

| # | Promoted | Evidence (SHA-256) | Carried caveat |
|---|---|---|---|
| A1 | **Carrier derivation.** The witness basis {WHAT: the triangle is primitive; HOW: local triadic derivation; FOR-WHAT: 15 operators exactly fill two-ended loci} forces the dodecahedral carrier (120 flags; 12 domains, 20 triads, 30 corridors). Dropping any one witness loses something distinct. | triangle_derivation `cf271d63…ad26`; triangle_derivation_orders `ac3ff63c…9244`; operator_loci `17dcd67e…8a86`; p1_axes `7136e860…fc3b`; p5_torus `243d7d57…3bec`; p5_closure `9537bd42…9aa4`; triad_irreducibility `50119247…3d00`; carrier_forcing `88dd4854…30b2` | Order-independence of the 5-per-site completion: MAYBE (71/71 sampled). Non-closure at 6 per site: MAYBE (400-step cap). |
| A2 | **Coordinate-free incidence specification and flag system** (moves δ, γ, τ). | flag_rederive `ab884714…139b` | The written spec agrees with the object A1 derives. |
| A3 | **Flag completion law.** Domain and triad moves have two lifts; corridor moves have one. Every lift MAYBE originates at a corridor. | lift_relation `324a2cba…9cbb` | none |
| A4 | **Gate reading by gluing on the incidence's own site.** No gate admission rule. Walls are overlap disagreement; receipts record changes in agreement. The three pair kinds carry the full verdict. | site_witness `144bab3f…61a1`; parity_countermodel `8bb3aeed…f96e` | Gluing semantics from SPEC-JUNCTION-001 (PROPOSED). Mixed-overlap no-loss sets: MAYBE. |
| A5 | **Retirement of the R_f "undominated discharge" law.** | parity_countermodel `8bb3aeed…f96e` | none |
| A6 | **Ledger.** Receipt ≠ persistence; persistence is promoted continuity. Strict discharge ends at one of two distinct uniform states. | exchange_witness `4316e6d4…2eb5` | none |
| A7 | **PDPE inside the law, at two levels.** Law level (rule adoption) and tick level (PROPOSE completions and readings → DECIDE a lift and gate → PROMOTE the successor → EXECUTE). | corpus: ProjectionShell Law 8.3; Proto-Transitions §7.5 | none |
| A8 | **Governance on the carrier.** Face turns are EXECUTE in the anchored world. Separation is certified exactly at the 30 corridors. PROPOSE/PROMOTE sit on one domain end, DECIDE/EXECUTE on the other. Piece-derived readings are δ-constant. | megaminx_governance `f22e0040…363b6f`; piece_gate `24edffae…2ac8` | none |
| A9 | **Triadic refinement as the world-scaling law.** The label "Goldberg–Coxeter" is retired; the shape is unchanged. The 12 domains are the only degree-5 sites at every level. | triadic_refinement `16deb904…d622` | (m,0) only. Chiral (m,n), n ≠ 0: OPEN. |
| A10 | **κ = choosing a flag of one orientation class**, a torsor for the 60 orientation-preserving automorphisms. | kappa_from_flags `fbc4a621…d5e6` | none |

## Genesis choices for the game world

| # | Decision | Content |
|---|---|---|
| B1 | **PROMOTED** (2026-09-24) | κ is chosen at world genesis as one flag of one orientation class (A10) and recorded as the world's genesis □G. All 60 choices are equally valid; the specific flag is fixed when genesis is EXECUTED and is recorded then, with its WHENCE. |
| B2 | **PROMOTED** (2026-09-24) | The world's governance type is **anchored**: κ fixes the domains; face turns move pieces (A8). |
| B3 | **PROMOTED** (2026-09-24) | World resolution **m = 2** (triadic refinement level 2, A9): 42 sites — 12 domains (degree 5) and 30 degree-6 sites; 80 small triads. The smallest level with a hexagonal field. |

## Erratum retirements

| # | Decision | Retired or corrected |
|---|---|---|
| C1 | **PROMOTED** (2026-09-24) | The contact form as a derivation target: the 600-cell/Hopf results, "carried = holonomy of change," and mass and energy as contact quantities. |
| C2 | **PROMOTED** (2026-09-24) | The summed flex law (a scalar selection inside the constitutive law), the notion of a "tie," and the 1/2 residual-gap probability. |
| C3 | **PROMOTED** (2026-09-24) | G4, the Euler-based results, and the \|6 − p\| MAYBE bound outside its original fixed-resonance scope. |
| C4 | **PROMOTED** (2026-09-24) | The claims that the dodecahedron is forced as stated: FT's "natural substrate," CS §2.4 (classification plus a covering code computed on the dodecahedron), and RG/GMT citing FT. Replaced by A1. |
| C5 | **PROMOTED** (2026-09-24) | The session's queued erratum items E1–E23. |

## Engine

| # | Decision | Content |
|---|---|---|
| D1 | **PROMOTED** (2026-09-24) | Rebind PHYSICS-R&D-001 from Contact GR and the summed flex law ("entity = resonance of the flex law") to A1–A10 and B1–B3. |
| D2 | **PROMOTED** (2026-09-24) | Build the tick: PROPOSE from flag completions (A3) and gluing readings (A4) at m = 2 (B3), wired to GameTickInput (DECIDE), KernelCommitReceiptV1 (PROMOTE), and the synchronous commit (EXECUTE). First acceptance test: the exchange case (x and x̄ differ at PROMOTE with an empty receipt). |

## Not promoted by this record

- **E1–E3** (research authorizations: chiral refinements; completion order-independence proof; element correspondence, resonant propagation, and the Fold's recursive application): awaiting DECIDE.
