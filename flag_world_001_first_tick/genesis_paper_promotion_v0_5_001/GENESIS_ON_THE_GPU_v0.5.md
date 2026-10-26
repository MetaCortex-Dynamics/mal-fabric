# Genesis on the GPU A World That Proposes Its Own Next Step

Devon A. Generally · MetaCortex Dynamics LLC  
ORCID: 0009-0004-8164-2159  
Review draft 0.5 · 26 October 2026  
*Settlement, persistent structure and a world that proposes from its own returned state*

# Abstract

We built a geometric world on an RTX 3070 that commits its next state and then proposes again from the state it has become. The world carries 480 flags and 720 overlaps, with THIS or NO readings and a complete witness of their agreements and disagreements. A captured junction event seeds a twelve-flag THIS region bounded by twelve walls. Among 1,924 incidence-generated assignments, exactly one strictly discharges that boundary: the entire region becomes NO, removing all twelve walls and opening none. The world commits this successor as its third link and immediately proposes again on the returned state. The renewed receipts change; no strict successor remains. The same law produces a contrasting result in adjacent-pair diagnostics. All 120 pairs on the refined carrier remain bound, including after ancestor-level offers are added, as do all 30 pairs on the parent carrier. One region dissolves; adjacent pairs persist. These are two outcomes of the same geometric construction, witnessed by exhaustive receipts, replay and withholding controls. Together with renewed proposal on the returned state, they establish an executed world in which settlement and persistent structure arise under one transition law.

# 1. Introduction

A geometric world now carries its own continuation. On an RTX 3070, it takes a witnessed step, commits what it became, and uses that returned state to propose what can happen next. The successor is the next input. This paper reports that closed computational loop—and a striking contrast within it: a single seeded region dissolves, while adjacent pairs remain bound under the same receipt law.

The experiment begins with a captured hardware event at junction J17. Its incidence determines the twelve-flag region that reads THIS. From there, the GPU constructs the complete overlap witness, commits the field–witness pair, and carries the world's continuation. The committed history reaches three links, ending in uniform NO. Proposal then resumes on that returned uniform field without a predecessor reload or a new supplied move.

The world makes its transitions inspectable. THIS and NO are its carrier readings; SAME and NOT-SAME record agreement on overlaps. Each transition produces a receipt naming exactly which disagreements disappear and which appear, and each committed link preserves its predecessor. Change, persistence and history can therefore be examined separately BECAUSE the construction records each subject explicitly.

The central result is that persistence needs no separate exception in the tested pair fields. The criterion that admits the seeded region's dissolution admits no strict exit for any adjacent pair at either carrier level. The second result closes the execution loop: the proposer evaluates the state the world actually returned, and its new receipts reflect that change. Settlement does not end proposal. Together, these results give the world both a committed history and a demonstrated distinction between structures that dissolve and structures that persist.

# 2. Construction and receipt law

## 2.1 Incidence, field and witness

The realized carrier has 42 sites, 120 edges and 80 triads. A flag is an incident triple f = (site, edge, triad). There are 480 flags. An overlap joins two flags that agree in two coordinates and differ in the third. Each flag participates in three such overlaps, giving 720 unordered overlaps: 240 of each coordinate-changing kind.

Let F denote the flag set and Ω the overlap set. The field is a reading q on F:

```math
q:F\longrightarrow\{\mathrm{NO},\mathrm{THIS}\}.
```

The complete witness reads SAME on an overlap when its two flags carry the same reading, and NOT-SAME when they differ. Its wall set is

```math
W(q)=\{\{f,g\}\in\Omega\mid q(f)\ne q(g)\}.
```

A wall is a located disagreement. Its incidence identity remains in the witness; the numerical totals in the results summarize those sets. Successor admission depends on the sets themselves.

The uniform Ground₀ field assigns NO to all 480 flags. NO is a determined reading, not an absent or unread value. Hardware custody supplies the genesis event and its locus; the carrier's incidence determines which flags belong to that locus. The initial evidence package records this construction and the first-tick conformance work. [1](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/evidence/first-tick-conform-v1-v2-001/README.md)

## 2.2 Receipts and strict discharge

For a source field q and an offered successor q′, the receipt records discharged and opened walls:

```math
\begin{aligned}
D(q,q')&=W(q)\setminus W(q'),\\
O(q,q')&=W(q')\setminus W(q),\\
R_{\mathrm{retained}}(q,q')&=W(q)\cap W(q').
\end{aligned}
```

Strict discharge requires a nonempty discharged set and no opened wall. For an offered family A(q), define

```math
K_A(q)=\{a\in A(q)\mid D(q,a(q))\ne\varnothing\ \land\ O(q,a(q))=\varnothing\}.
```

The strict relation acts on sets, without a numerical score or an ordering preference. A singleton K supplies the one strict member to execute. Several members remain several; an empty K records no strict exit in the offered family.

Strictness preserves every source agreement BECAUSE opening no wall forbids a SAME overlap from becoming NOT-SAME. Following those overlaps through a connected agreement class forces the class to remain uniform in the successor. Discharging a boundary joins previously separated readings without splitting an agreement class.

Every strict transition makes the wall set a proper subset of its predecessor. A nontrivial strict cycle is excluded BECAUSE successive proper subsets cannot return to the starting set. Governed returns can instead use transitions that open walls; the return diagnostic in Section 4 records that distinction.

## 2.3 The incidence-generated offers

Each offered assignment reads one incidence fibre uniformly THIS or uniformly NO and leaves the other flags unchanged. The refined family contains the fibres generated by fixing one coordinate and those generated by fixing two. A fibre is precisely the flags satisfying those incidence coordinates.

| Carrier and support family | Supports | Assignments, two readings per support |
|---|---:|---:|
| Refined: fixed site | 42 | 84 |
| Refined: fixed edge | 120 | 240 |
| Refined: fixed triad | 80 | 160 |
| Refined: fixed incident coordinate pair | 720 | 1,440 |
| **Refined total** | **962** | **1,924** |
| Parent: fixed site, edge or triad | 62 | 124 |
| Parent: fixed incident coordinate pair | 180 | 360 |
| **Parent total** | **242** | **484** |

Refinement ancestry adds the images of the parent's 12 site fibres, 30 edge fibres and 20 triad fibres: 124 assignments on the refined carrier. Twenty-four coincide with refined assignments BECAUSE the twelve parent domains map to child pentagon sites, each in both readings. The combined family contains 2,024 distinct assignments.

These are the finite families exhausted in the experiments below. The cross-level extension includes every recorded parent-cell image; arbitrary connected unions are not added. The parent-carrier experiment also evaluates its own complete 484-member family.

# 3. From genesis to renewed proposal

## 3.1 Genesis and the field-preserving second link

The captured event identifies J17 between domains 4 and 9. The locus, rather than an index chosen from the event payload, determines the seeded section. Its twelve flags become THIS; the other 468 remain NO. The complete witness has 708 SAME overlaps and twelve walls.

Genesis opens twelve walls relative to uniform Ground₀. This captured initialization establishes the field on which strict discharge subsequently acts.

The second committed link executes an admitted program with twelve marker occurrences, six comparators and twelve routes. All eight program-admission conditions are witnessed. Its field and overlap witness remain unchanged: twelve walls retained, none discharged and none opened. [2](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_step_023/RUN_RECORD_023.json)

| History position | THIS flags | Walls after | Discharged / opened | Recorded effect |
|---|---:|---:|---:|---|
| Ground₀, predecessor | 0 | 0 | — | Uniform NO |
| Link 1, genesis | 12 | 12 | 0 / 12 | Captured locus enacted |
| Link 2 | 12 | 12 | 0 / 0 | Field and overlap witness preserved |
| Link 3 | 0 | 0 | 12 / 0 | J17 section settles to NO |

Ground₀ supplies the predecessor; the three subsequent rows are the committed links.

## 3.2 One region has one strict exit

At g₂, the field at link 2, the proposal operation evaluates all 1,924 refined assignments and their complete overlap receipts. Exactly one is strict: reading the entire J17 site fibre as NO. It changes twelve flags, discharges twelve walls, opens none and retains none. The resulting field is uniformly NO and all 720 overlaps read SAME.

The successor is forced within the offered family BECAUSE every one of its 1,924 members has a recorded receipt and exactly one satisfies strict discharge. This is an exhaustive uniqueness witness, not a ranking of alternatives.

Execution binds the source, the sole strict member, its receipt and link 2's continuity head, then appends link 3. Its terminal is MOVED BECAUSE the committed field–witness pair is NOT-SAME the predecessor pair. The carrier incidence persists unchanged, as do the source g₂ and all 901 frozen evidence files. [3](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_proposer_reentry_020/RUN_RECORD_TEST_P_020.json)

The seeded section dissolves; the carrier persists. All twelve boundary disagreements disappear in one witnessed transition.

## 3.3 The world proposes from the state it became

Execution returns the uniform successor directly to the same proposal operation. That operation produces 1,924 offers again, now evaluated on the state returned by link 3. No reloaded predecessor supplies this second pass.

The assignment domain is SAME across the two passes. Their contents and receipts are NOT-SAME BECAUSE the source field changed. The first pass has one strict member; the second has none. Assignments to NO leave the uniform field unchanged. Assignments to THIS on the proper fibres in this family open a boundary rather than strictly discharging one.

The distinction between re-entry and replay is tested directly. Reloading g₂ restores the earlier offered content and its single strict member; it does not reproduce the second pass on the returned state. Missing-return and missing-root controls withhold the required continuation. Altered-member and wrong-predecessor controls withhold the commit. Corresponding replay readbacks are byte-identical; reversed enumeration preserves the decoded result. [3](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_proposer_reentry_020/RUN_RECORD_TEST_P_020.json)

The loop closes at this point: source → proposal → strict member → execution → returned state → renewed proposal. The world has changed, and that change becomes the source of its next computation. Uniform settlement leaves no strict member, but proposal has already resumed on the settled state.

# 4. Adjacent pairs persist across two levels

Dissolution is not the only outcome of this construction. Every adjacent pair tested remains bound under the same strict relation that dissolves the single seeded region. The contrast holds across all 120 pairs on the refined carrier and all 30 on its parent.

For this experiment, each pair is a separately constructed diagnostic field: two adjacent site sections read THIS and all remaining flags read NO. The refined carrier has 120 such pairs, one per edge.

The refined sweep evaluates 1,924 assignments for each of the 120 pairs: 230,880 receipts. Every pair has K empty. Sixty degree-five/degree-six pairs retain eighteen walls; sixty degree-six/degree-six pairs retain twenty. [4](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_t_r2_r1_diagnostics_019/R1/run_003/RUN_RECORD_R1.json)

The ancestry extension evaluates another 124 assignments on each of the same 120 fields, plus the uniform link-3 field. All 15,004 additional receipts yield no strict member. Together with the child-level sweep, this covers 2,024 distinct assignments per refined field. All fifteen pair batches finish with readbacks. The maximum retained fact population is 611,136 within a capacity of 2,097,152. [5](library-file:fde1_bGliZmlsZV8taU5WT3ZLd0hNN0FZZjMtSmtTWXpR_FileDrive_7e2f37d49b2481918c9dca3022dab5bd)

A separate diagnostic applies the test directly to the 120-flag parent carrier. It evaluates all thirty adjacent-site-pair fields against 484 assignments per field: 14,520 pair receipts. Every pair retains sixteen walls and has K empty. A single-site control has one strict shed, and the uniform control has none. Six pair batches finish with readbacks; the peak fact population is 645,512 within the same capacity. [6](library-file:fde1_bGliZmlsZV9kZWN3dVZLRzRQMzdrd1ZjcTVJS2ZR_FileDrive_7e2f37d49b2481918c9dca3022dab5bd)

| Diagnostic field population | Distinct assignments per field | Walls at source | Strict members |
|---|---:|---|---:|
| Seeded J17 field, refined level | 1,924 | 12 | 1 |
| Link-3 uniform field, refined plus ancestor levels | 2,024 | 0 | 0 |
| 120 refined adjacent pairs, refined level | 1,924 | 60 × 18; 60 × 20 | 0 in every field |
| Same 120 pairs, refined plus ancestor levels | 2,024 | Same source fields | 0 in every field |
| 30 parent adjacent pairs, parent level | 484 | 16 each | 0 in every field |

A **bound configuration** is a non-uniform field with no strict successor in its offered family. Every adjacent pair in these experiments is bound. Adding the parent-cell images leaves that result unchanged, and the parent's own pair fields exhibit the same persistence.

No separate persistence rule is added for the pairs. Their boundaries remain BECAUSE none of the incidence-generated assignments discharges a wall without opening another. The same test that forces the single region to dissolve leaves the paired regions intact.

Uniform settlement and persistent structure are thus two distinct strict terminals. The link-3 field has no walls and no strict exit. The pair fields retain their walls and have no strict exit. The receipt law distinguishes them directly: rest can be uniform, or it can retain a non-uniform boundary.

The carrier also supports witnessed governed-input returns. Twelve out-and-back branches produce twenty-four distinct history links, SAME endpoint pairs and empty composite opened/discharged sets. Their outward steps open walls, placing these returns outside strict discharge. The endpoint can return while the history records that motion. [7](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_t_r2_r1_diagnostics_019/R2/execution_001/finish_001/RUN_RECORD_R2_019.json)

# 5. Reproducibility and experimental scope

## 5.1 Evidence identities

A result is identified by its source field, incidence, offered family, executable source, complete receipt output and final readback. The commit additionally binds its predecessor and successor pair. A digest of a stored file identifies that artifact's bytes; the pair's state digest identifies the subject defined by the commit. They are not interchangeable.

For link 3, the committed artifact has SHA-256 `946BADF27E6AA0EBDA090DB61DCE28BC93726BC0DB2153D927DC6F8AE9DB9A88`. Its pair-state digest is `37f5767d3054d094be169f4e9445a02adf57868db97087256776657ebb96c6a5`. Its predecessor link is `173e0fa1d318de52472e31e3acf064bf92d9b313bdb4e52d2f4593ddd3631386`, and the new link is `501368508a256be21091298b3a26b03726e41fc9e6c388925c0c8b8924debe8c`. These distinguish the changed pair from its custody record.

Full input and output identities remain in the run records and reference ledger. Frozen source evidence is preserved alongside the successors and diagnostics.

## 5.2 Replay, enumeration order and withholding controls

Replay and enumeration reversal test two distinct invariants: repeated execution reproduces byte-SAME readbacks, while reversed presentation order reproduces the same decoded closure.

The link-3/re-entry qualification includes replay, reversed enumeration, predecessor reload, missing-return controls and commit-withholding controls. The pair qualifications include replay and missing-input controls; the parent qualification also reports SAME decoded closure under reversed enumeration. These qualification replays are separate from the complete pair sweeps.

Only completed runs with final readbacks enter the results. The sealed ancestry rerun supplies every batch readback, replacing an incomplete attempt that supplied none. Peak fact populations remain below the recorded capacity in both the ancestry and parent sweeps.

The method is obligation discharge: every result is tied to the operation, inputs and witness that discharge its claim. Exhaustive receipts establish uniqueness or an empty K; replay establishes reproducibility; withholding controls test the required dependencies.

## 5.3 Scope and data availability

The experiment comprises one three-link committed history, one renewed-proposal pass on its returned state, exhaustive adjacent-pair diagnostics under the families in Section 2, and the separate governed-input return trials. Pair persistence is a result about those diagnostic fields and the strict transition relation. The pairs are supplied experimental configurations, not structures generated during the committed J17 history.

The renewed proposal pass is not a fourth committed link or a claim of indefinite execution. The field-preserving second-link program, the third-link field transition, and the pair and return diagnostics retain their separate evidence subjects.

The repository reference snapshot is `c6191b322411b9ff24c9813d41bf518ceccb5332` in [mal-fabric](https://github.com/MetaCortex-Dynamics/mal-fabric/tree/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick). It contains the second-link record, the third-link/re-entry package and the original refined-pair diagnostics. The ancestry-extension and parent-pair packages are not tracked in that snapshot. References 5 and 6 link to byte-identical copies of their run records and seals attached to this review draft, with full SHA-256 identities preserved. These attachments make the cited records accessible within the draft; they do not constitute a repository release of the complete diagnostic packages.

# 6. Conclusion

We have built and executed a geometric world that carries a committed successor into its own next proposal. J17 begins as a twelve-flag region bounded by twelve disagreements. Exactly one incidence-generated assignment strictly discharges it. The world takes that step, records link 3, and proposes again from the uniform state it returned.

The same construction also supports persistent structure. Every adjacent pair on the refined carrier remains bound, including with ancestor-level offers, and every adjacent pair on the parent carrier does so as well. The contrast comes from the configurations and their receipts: one region dissolves; paired regions retain their boundaries under the same law.

This gives the next experiments a concrete starting point: triples, rings and larger configurations, and strict paths that end in bound structure rather than uniform settlement. The present result already joins three achievements in one construction—witnessed change, persistent structure and proposal renewed from the world's own state.

# References and evidence ledger

**Author and project.** Devon A. Generally, MetaCortex Dynamics LLC. *Genesis on the GPU*, review draft 0.3, 22 October 2026, is the antecedent manuscript. The present draft replaces its pending-continuation account with the witnessed results below.

The numbered references identify evidence subjects rather than treating differently scoped runs as one experiment. Full artifact hashes are SHA-256.

**1. Genesis and initial conformance.** [Frozen evidence package](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/evidence/first-tick-conform-v1-v2-001/README.md). Genesis run record `RUN_RECORD_018_GPU_SELF_WITNESS_AND_G_READOUT`, locally bound copy in the verification kit: `66E9573678D0F8F08A71E5146193BF9780C38E7F526E6C77F2709CC8D6AE1B12`. Carrier geometry: `26A8627176262C7493568AB1DF4C2FB216A0809F445C17DFF37ABA6D0BD03460`.

**2. Second committed link.** [Run record 023](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_step_023/RUN_RECORD_023.json), program admission and field-preserving continuation: `6A07ACE68BD15DA5F084269FA7FDD57021EC89B30EAE44ED4BF9F9B697B79B0D`.

**3. Link 3 and renewed proposal.** [Test P, run 020](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_proposer_reentry_020/RUN_RECORD_TEST_P_020.json): `DE8052E6A1DB6F4B47D377D88622202E810D5FF3756BFB85CA17F31490DE1D70`. Qualification: `1B126165B3A05833FE6379623BB0618981462A649839C051C56133795A97BAE6`.

**4. Refined adjacent-pair sweep.** [R1, run 019](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_t_r2_r1_diagnostics_019/R1/run_003/RUN_RECORD_R1.json): `8D00AEF6B6BF61050CA4951098F3691F83BF75CE54CC56832B91C80868A50004`.

**5. Ancestor-fibre extension.** [Diagnostic 022, attached sealed run record](library-file:fde1_bGliZmlsZV8taU5WT3ZLd0hNN0FZZjMtSmtTWXpR_FileDrive_7e2f37d49b2481918c9dca3022dab5bd): `BE07194B30BE2788E2AC90FC06A97C8720209C65DF39B7C2EC1E287BEF5C5942`. [Seal](library-file:fde1_bGliZmlsZV8xY1VOWmxCTDE5d0dVOEpVdXhjdEhR_FileDrive_7e2f37d49b2481918c9dca3022dab5bd): `EF1D5AA50EAE720DF0BAA8E6702EFB3AEB43C7EAA52455DE5CD24535DBB6D587`. This diagnostic is distinct from the earlier second-step run numbered 022.

**6. Parent adjacent-pair sweep.** [Parent diagnostic 023, attached sealed run record](library-file:fde1_bGliZmlsZV9kZWN3dVZLRzRQMzdrd1ZjcTVJS2ZR_FileDrive_7e2f37d49b2481918c9dca3022dab5bd): `04E81447AF274D88F04F0EDCD1C088BD200CCF40F8EC82D8002FDC1873B63A87`. [Seal](library-file:fde1_bGliZmlsZV96ekdRbFBrMndMMnItS0Z2dmNHX0pB_FileDrive_7e2f37d49b2481918c9dca3022dab5bd): `64F81B3B770AC085C46B30649E0A660FFFD7D6288F9BB9B9D6FA7E1C01AA3F52`. This diagnostic is distinct from the committed second-step run cited as reference 2.

**7. Governed-input return diagnostic.** [R2, run 019](https://github.com/MetaCortex-Dynamics/mal-fabric/blob/c6191b322411b9ff24c9813d41bf518ceccb5332/flag_world_001_first_tick/j17_t_r2_r1_diagnostics_019/R2/execution_001/finish_001/RUN_RECORD_R2_019.json): `2E1736651A889D225DA12E1F9613AFF9581F94F709413FDCE92962DE22599336`.

**Source custody.** The synthesis also follows the shared fold-product trace, 95,039 bytes, SHA-256 `B81586C40C1D58AB94E3967E76CB75B46A6B56E71E10A1AAE70348104C4A7880`. The trace is a locator and correction record; the numerical claims above are bound to the run records, not inferred from the trace's prose.
