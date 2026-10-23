# J17 second step 022 — admitted endpoint filtering and static join check

```text
AUTHORITY := Devon, TASK_CODEX_J17_SECOND_STEP_022
DATE := 2026-10-22
HOME := MetaCortex-Dynamics/mal-fabric
BRANCH := review/flag-world-j17-second-step-021
PARENT := 60340c61f1a29321a0b414b4d079b55a1bfd9fd6
ONE VERDICT := NOT_SAME — induced static route list violates join-role shape
WORLD_STEP_2 := NOT_RUN; no second link; no successor readout
```

## 0. L06, identity and scope

Document: `C:/Dev/mal_kernel_lab_repo/v3/software_fpga/gpu_carrier_001/flag_world_engine_v3_fold_bootstrap_001/candidate_successors/W040_SURFACE_FABRIC_LOWERING_116/SPEC.md`.

SHA-256: `FFF676FC92D57CB564A2045754939794CE4CB0BE71DA286E5B709A623E3F9513`.

Line 51, verbatim:

> [MUST] **L06:** Materialized cells have existing `CellDef` fields, with derived payload type and explicit source-bound capability evidence. Containment and location must come from the governing fabric/decomposition, not a default region, host allocator or node ordinal. Missing placement evidence withholds the candidate; this is not a request for Devon to pick a location. DRC checks all eight imported conditions.

L06 does not contradict occurrence-local classes A–D. This execution continues past the class-C finding recorded in 021; the withheld occurrences are not a global tick stop. The current task supplies the admitted-endpoint filter. The promoted readout, edit metric and S/F binding supply the observed own ranks. No rank, modality or genesis is selected.

The 116/117 Devon promotion record has SHA-256 `264794AC62E747F0339766FB7D55A93AB30AFACF0D5D5A19267B6D6333204DF9`, at `C:/Dev/mal_kernel_lab_repo/v3/software_fpga/gpu_carrier_001/flag_world_engine_v3_fold_bootstrap_001/evidence/w040_surface_fabric_lowering_116_117_promotion/DEVON_PROMOTION_RECORD_001.json`. Its manifest binds the SPEC bytes above. 117 retains the imported physical DRC.

## 1. GPU classification of the 480 occurrences

The new `.mal` source appends to the retained 021 source. All 239 prior rules, prior input seeds, and retained proof bytes are SAME under the generic continuation guard. The compiled CUDA and generic lowerer are unchanged. Host code performs byte custody, serialization, hashing and observation only; classification, route filtering and join witnesses are GPU-applied `.mal` laws.

| Class | Own-coordinate reading | Count | This-tick disposition |
|---|---|---:|---|
| A | CCC, unique own rank, G/S capability | 12 | ADMITTED occurrence; all twelve INTERIOR(S) |
| B | CCC, unique own rank F | 0 | Capability exclusion, no occurrence in this run |
| C | CCC, own-rank tie | 108 | Withheld this tick; no tie-break or boundary supplied |
| D | CCD | 360 | Not located by the promoted CCC readout this tick |

The four classes are disjoint and cover all 480 occurrences. Class B's count is an observation of the complete partition, not a conversion of missing evidence to NO.

The handoff estimate A=4/B=8 is NOT_SAME to the observed partition; it is not a promoted vector expectation. In addition to the four J17 flags on W12/W13, eight flags have unique own maxima on W03/J15, W10/J16, W14/J18 and W18/J25. Their own distance is four edits against zero/zero on the other vertices; rank three is S under the promoted binding. No distance, expected byte or law was changed to match the estimate.

| Face | Marker site | Own rank evidence | A markers |
|---|---|---|---:|
| W03 | Junction("15") | four edits versus zero/zero; rank S | 2 |
| W10 | Junction("16") | four edits versus zero/zero; rank S | 2 |
| W14 | Junction("18") | four edits versus zero/zero; rank S | 2 |
| W18 | Junction("25") | four edits versus zero/zero; rank S | 2 |
| W12 | Junction("17") | twelve edits versus four/four; rank S | 2 |
| W13 | Junction("17") | twelve edits versus four/four; rank S | 2 |

Identifiers name incidences; no identifier order is used for selection. Markers use their own flag coordinates, not the THIS/WHAT type seat at J6. The existing 720 comparator placements at J17 stand.

## 2. Requested route list and DRC witnesses

The GPU intersects the 1,440 source routes with the admitted endpoint set: twelve markers plus 720 comparators. It produces **36 routes**, three per class-A marker, reaching **30 comparator occurrences**. No route is added, redirected, or silently removed after this filter.

DRC (iii), placement-capability: IF_THEN for the admitted occurrences on each touched CCC face, W03, W10, W12, W13, W14, W18. There are 1,452 occurrence/face witnesses: twelve marker witnesses and two witnesses for each of 720 comparators. This does not grant roles to other vertices on those faces or to CCD triads.

DRC (iv), endpoint membership: IF_THEN on **all 36** retained routes. Port direction/type checks also give IF_THEN on all 36; both endpoint regions are S, so no modal crossing is supplied.

These are source-derived necessary static checks, not a claim that a complete normalized canonical FabricSpec has passed all eight conditions. `J22_CELL_ADMITTED` records occurrence placement eligibility. Canonical program admission also requires the remaining imported static relations.

## 3. New NOT_SAME — static join topology

The same GPU run witnesses:

| Connected target topology | Targets |
|---|---:|
| LEFT[1] and RIGHT[1] | 6 |
| LEFT[1] without RIGHT, or RIGHT[1] without LEFT | 24 |

The remaining 690 comparators have no incoming routes in this induced list. The retained reference kernel's incoming-target loop does not test those as partial joins. The failure already follows from the 24 singly connected targets.

Every failing target has two positive source-status supports: one admitted class-A endpoint and one withheld counterpart. Twelve counterparts are class C; twelve are class D. The missing route is established from the complete original endpoint inventory plus the requested filter, not inferred from silence or lack of a runtime result.

Governing static source: `W040_SURFACE_FABRIC_LOWERING_116/parents/STATIC_FABRIC_SPEC.md`, SHA-256 `E328B574DE32635358AC488C4C5E20E80E86A845EB154401C8E1A7C0DD8D68F1`:

- Line 641: “DRC MUST execute before runtime”.
- Line 650: “operator-derived join-role and multiplicity conformity.”
- Lines 652–661 bind `actual := role_signature(incoming_routes)` against `expected := ROLE_SCHEMA(target.operator)` and require `actual MUST conform_to expected`.
- Line 678: “Operator-incoherent joins MUST be rejected statically.”

Its pinned `parents/static_reference_kernel.py`, SHA-256 `8B983301DAD795DD9C3F020970BAD76017EF648AC0C71E3FB6FDEF3D0E4347C0`, lines 603–619 emits `JOIN_ROLE_SHAPE_VIOLATION` for the observed one-role topology. The runtime path does not execute Python; this file is the imported definition.

This is **DRC (viii)**, not a second class-C placement stop. The 36-route list has endpoint membership but lacks complete SAME operator joins at 24 connected targets. BECAUSE L06 imports all eight DRC conditions, a nonempty route list alone does not admit the program.

Paper B explicitly distinguishes this from partial runtime arrivals: `parents/115/projections/Geometric_Programs_Papers_A_and_B.txt`, SHA-256 `408CCB359B8BFDF44C5E82C5D779D9A24EAC53EB75BCDB7FB105607D7A5FB982`, lines 524–528: “Static join safety is not temporal readiness”. Its example has both routes wired, with one value arriving later. V3.3 imports V3.1 unchanged. Runtime buffers do not supply missing static routes.

The GPU emits 24 `J22_PROGRAM_REFUSAL` witnesses. This is an executed necessary-condition rejection, not a fabricated result of the full canonical DRC procedure. No alternative route subset or restored withheld endpoint is chosen.

## 4. Execution boundary

| Operation | Disposition |
|---|---|
| A–D classification | EXECUTED on RTX 3070 |
| Induced route filter | EXECUTED; 36 |
| DRC (iii)/(iv), port/type and static join-shape checks | EXECUTED |
| Complete canonical-program admission | NOT_CLAIMED; required join-shape condition NOT_SAME |
| STEP_FABRIC five stages / RETURN | NOT_RUN; static failure precedes runtime |
| Link 2 over g1 | NOT_PRODUCED |
| Readout (g1, successor) / tick-3 tie changes | NOT_RUN; no successor manufactured |

The archived committed genesis remains byte-identical, SHA-256 `FDA614876C99126FCE2AFE6AC8E42A77863880485E02D4B4EDA4AA817446BD2C`, with one chain link. The class-A rank-change stop is not applied: no step-4 readout has occurred.

## 5. Byte bindings

GPU: NVIDIA GeForce RTX 3070; error 0; 91,523 facts; 110,404 terms; epoch 1,137, continuing from the retained epoch 1,131 closure. Fact capacity 2,097,152.

| Object | SHA-256 |
|---|---|
| `source/classify_routes.mal` | `D0AFF5AD827CE9EBC9E911C07F3BCD87171185CD777E85114A2EA0A9B0B03FF9` |
| Assembled source | `2F118A2FBE98B53EEE8F63DF0BAC723C846562C0442319F61238E66DC72720C1` |
| Image | `581021D30EBB25DE6A5D79EB6593A6FA6A6FAC65F7061B7837439AFB98367C7F` |
| Readback | `47BE6D935D0B5EFF30D3304FCA3FA0A9A866607F4896A589060C3A8458107B1B` |
| `classification/CONTINUATION_CUSTODY.json` | `E85F1DE42BE88C27BDB9478D366662D748ACC4EE58DAFED42B9A7AC9E1A5BDA7` |
| `classification/RESULT_022.json` | `B625D9D0D257466CEBE60C064A52D61962C5478CD98F6751AFD77C884E618EF7` |
| `classification/admitted_source_routes.json` | `DB7D3B38D7668292FB8F311C05C245D4AA84DF252189604FAA9637CC6CF95580` |
| `classification/join_shape_failures.json` | `BFCD1E5E33F869DEC7AF29999407E4DF157B079D73B29C4B6B7148FA8EC9D4C6` |
| Unchanged qualified runtime | `9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06` |

Full marker classes, all 36 route identities, per-face and per-route checks, each failed target and its proof supports are in `classification/`. The route hashes identify four structural source endpoint/role terms; they are not mislabeled as an admitted canonical program.

Independent read-only checks reproduced the classes from the prior committed field, then inspected the new raw GPU readback and all 24 positive-supported join counterexamples. No reference construction was fed into the realization.

## 6. Preservation

All 901 frozen evidence files were rehashed against `REHOME_MANIFEST_001.json` (`F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560`): SAME in size and SHA-256. No frozen expected bytes or original records were edited. No staging, repository commit, push, promotion, or board action. Prior 021 and runtime qualification remain intact. The MaL continuity/compliance checks preserved the J17 comparator admission and prevented a runtime-buffer substitution for static topology.

MOVED — candidate-local classification and admitted-endpoint route filtering executed; placement and endpoint checks witnessed.

BLOCKED — requested induced route list has 24 operator-incoherent static joins (DRC viii NOT_SAME); no link 2.
