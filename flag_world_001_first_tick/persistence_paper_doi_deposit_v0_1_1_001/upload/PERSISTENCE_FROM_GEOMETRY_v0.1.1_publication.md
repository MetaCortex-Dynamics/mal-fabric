# Persistence from Geometry: Context, Refinement and Deterministic Change

*Context can protect a region. Refinement can remove its only exit.*

Devon A. Generally · MetaCortex Dynamics LLC  
ORCID: 0009-0004-8164-2159  
Paper two · Version 0.1.1 · 1 November 2026 · Publication edition

## Abstract

Persistent structure can arise from the relationship between a field and the changes its geometry admits. We study two-valued readings on triangular incidence, with a transition receipt that identifies every disagreement removed or introduced. A strict transition removes at least one disagreement and introduces none. This gives an exact criterion on the entire changed set: its nonempty boundary must lie inside the source wall set. The criterion explains several distinct forms of persistence. Computation over the bound refined incidence classifies 60 of 480 adjacent pairs as dissolving through ancestral face assignments and 420 as held under the recorded family; GPU receipts witness all 60 exits. More strongly, the same enclosed region dissolves in one surrounding field and persists in another: the containing assignment removes 30 walls but opens 10 in the nested field, whereas it removes 20 and opens none in the contrast. Refinement provides another route. A single-site field with one strict exit pulls back to a field with no strict exit, even though each child inherits its parent's reading. A separate nested configuration preserves retention through refinement, with its predicted 64 walls and 30/20 diagnostic receipt reproduced on an RTX 3070. Exhaustive GPU sweeps cover the stated configuration families at two coarser levels; 89 targeted GPU receipts establish the decisive finer-level cases. Finally, within the bound whole-site domain, enabled effects commute or absorb one another. Their joint application determines one successor from one snapshot without selecting an offer. These results make persistence, contextual protection and deterministic change consequences of the same receipt construction.

## 1. From a world that changes to structure that persists

The first experiment produced a world that could take its own next step. A twelve-flag region dissolved, the successor was committed, and proposal resumed on the state returned by execution. Adjacent pairs, evaluated under the same transition law, remained bound. One region disappeared; two adjacent regions retained their boundary. [1]

That contrast raises a deeper question: what makes a configuration hold? This paper answers it through a sequence of constructions and witnessed receipts. A shared edge first permits a field that no offered assignment can strictly discharge. On closed refinements, ancestry determines which larger supports are available. Context then changes what those supports do: an assignment that would fill a hole can be excluded BECAUSE it also cuts the surrounding field. Refinement changes the relationship again, carrying readings into a larger configuration without necessarily carrying the offer that previously dissolved them.

The decisive result is a controlled contrast. Hold the hole, its location and its ancestry fixed; change only the rest of the field. The hole dissolves in one case and remains protected in the other. Persistence therefore cannot be read from the region's shape or ancestral footprint alone. It belongs to the region's relations with the whole field and its offered assignments.

We call the non-uniform, no-strict-exit relation **SAND**. The name denotes the retention relation defined below. No material classification or physical scale enters the construction. Its coordinates are incidence, readings, ancestry and receipts.

The account also resolves how several enabled changes can belong to one step. On the closed carriers and whole-site fields studied here, effects either commute or are absorbed by another enabled effect. A successor can therefore be determined from the complete snapshot effect set. The construction requires neither a preferred member nor an ordering of independent changes.

## 2. The exact condition for change

### 2.1 Incidence, readings and offers

A flag is an incident triple `(site, edge, triad)`. Two flags overlap when they agree in two coordinates and differ in the third. Let F be the flag set and Ω the overlap set. A field assigns each flag one of two readings:

```math
q : F → {NO, THIS}.
```

An overlap reads SAME when its endpoint readings agree and NOT-SAME when they differ. The latter overlaps form the wall set:

```math
W(q) = {{f,g} ∈ Ω : q(f) ≠ q(g)}.
```

An offered assignment `a = (U,b)` reads every flag of support U uniformly as b and preserves the readings outside U. The native supports are incidence fibres obtained by fixing one coordinate or an incident pair of coordinates. The recorded ancestral family adds the specified site, corridor and face images from earlier levels. Ancestral images are taken from the refinement records; they are not arbitrary connected unions. Raw offer identities remain distinct even when two offers produce the same field.

The closed carriers in this study have levels `(k,0)`. Their counts provide a scale internal to the construction:

| Level | Sites | Flags | Overlaps |
|---|---:|---:|---:|
| (1,0) | 12 | 120 | 180 |
| (2,0) | 42 | 480 | 720 |
| (4,0) | 162 | 1,920 | 2,880 |
| (8,0) | 642 | 7,680 | 11,520 |

These are counts of incidence, not a conversion to external lengths. At the closed native level, site supports contain 10 or 12 flags, edge supports four, triad supports six, and fixed incident-pair supports two. An original face image contains 6k² flags. Refinement can therefore enlarge an ancestral support while leaving the maximum native cell size unchanged. [2]

### 2.2 The whole changed set determines the receipt

Let D be every flag whose reading changes under an offer, and let ∂D contain the overlaps with exactly one endpoint in D. With two readings, an overlap changes its agreement reading exactly when one endpoint changes. Consequently:

```math
discharged(q,a) = ∂D ∩ W(q)
opened(q,a)     = ∂D ∖ W(q).
```

The strict criterion follows directly:

```math
STRICT(q,a) ⇔ ∅ ≠ ∂D ⊆ W(q).
```

This is an identity on the receipt, not a score. A large number of discharges cannot compensate for one opening. The boundary must be nonempty and every boundary overlap must already be a wall.

An agreement class consists of flags connected through SAME overlaps. The same criterion says that D is a union of whole agreement classes with nonempty boundary. BECAUSE cutting any class changes a source SAME overlap into a wall, a uniform offer is strict only when it changes at least one opposite-reading class whole and cuts none.

The word *whole* applies to the entire changed set. A support can contain one class completely while intersecting part of another. Such an offer changes the first class whole but cuts the second, and its receipt opens walls. That distinction is the mechanism of contextual retention.

### 2.3 Retention and the direction of strict evolution

For the recorded offered family A, define the strict offer set and retention relation:

```math
K_A(q) = {a ∈ A : STRICT(q,a)}
SAND_A(q) ⇔ W(q) ≠ ∅ and K_A(q) = ∅.
```

The family is part of the subject. Adding an ancestral support can change K without changing the field. Changing the field can change K without changing its incidence or supports.

Every strict transition preserves every source agreement. Agreement classes can merge, but cannot split, BECAUSE a split would open a wall. The wall set strictly descends. A sequence of strict transitions on finite fixed incidence must end, but its terminal need not be uniform: a field may retain walls while no offered support can remove any without opening others.

Uniform settlement and non-uniform retention are therefore distinct outcomes of the same criterion. This result concerns strict evolution at fixed incidence. A governed transition that opens walls, or a change of incidence through refinement, has a different subject.

## 3. How composition first permits retention

The inverted triangle supplies the primitive incidence. On a lone triangle, the triad support is the entire six-flag field. Every non-uniform field can be assigned uniformly, discharging its walls. Retention is excluded BECAUSE the whole field is itself an offer.

Attach a second triangle along an edge. The resulting rectangle has twelve flags and fourteen overlaps, including two overlaps across the shared edge that change the triad coordinate. Agreement can now extend between triads, beyond the reach of an individual offered cell. A retained field becomes possible.

An exhaustive authoring-support census finds 34 retained fields among the rectangle's 4,094 non-uniform fields, including four whole-site fields. A smallest witness has four THIS flags and four walls; the whole-site witnesses have six THIS flags. The lone triangle has no retained field among its 62 non-uniform fields. Sharing only a site introduces no crossing overlap between the triangles, BECAUSE the flags on opposite sides differ in both edge and triad. These are finite incidence computations recorded in the finding, not GPU execution receipts. [2]

The shared edge is the first admitting composition on this construction chain. Closure into a fan and then a closed carrier extends the incidence; it does not supply a separate persistence law. The relation is already present when agreement can cross a boundary that no one offered cell can erase strictly.

## 4. Ancestry separates configurations that otherwise look alike

### 4.1 Exhaustive family receipts at two levels

The GPU sweeps evaluate singles, adjacent pairs, connected triples, rings and discs. A ring is the neighbours of a site read THIS, with its centre NO; a disc also reads the centre THIS. Each field is a separately constructed diagnostic. These experiments do not append to the committed history reported in paper one.

| Family | (1,0) fields | (2,0) fields | Outcome at both levels |
|---|---:|---:|---|
| Singles | 12 | 42 | Dissolve |
| Adjacent pairs | 30 | 120 | K empty |
| Connected triples | 80 | 410 | K empty |
| Rings | 12 | 42 | Fill to their discs |
| Discs | 12 | 42 | K empty |
| Total | 146 | 656 | All listed placements evaluated |

The (1,0) sweep evaluates 484 assignments per field, or 70,664 assignments. The (2,0) sweep evaluates 2,048 raw assignments per field, or 1,343,488 assignments. Its family comprises 1,924 native assignments and 124 inherited assignments. The closures include final readbacks. [3]

Singles and rings each have one distinct strict effect. At (2,0), twelve fields in each family have two raw offer identities for that effect, while thirty have one. The twelve are centred on the pentagonal sites: their native site supports and original-domain images coincide on the same ten flags. Both identities remain in the evidence. Counting effects and counting offers answer different questions; neither is substituted for the other.

The ring result supplies a direct route from change to retention: filling the hole produces a disc, and every disc in these sweeps has K empty. Strict discharge can end with persistent structure.

### 4.2 The finer carrier exposes a placement dependence

At (2,0), every adjacent pair extends beyond any ancestral face support that might absorb it. At (4,0), each original face contains three interior sites. Pairs among those sites can fit wholly inside that face's image. The same kind of local pair now has a different relationship to its ancestry.

Read-only computation over the bound GPU-produced (4,0) incidence gives the full split: 60 of 480 adjacent pairs have a strict face exit, and 420 have none under the recorded family. The split was independently reproduced. Native supports cannot contain the pair class; the decisive added supports are original-face images. This placement rule is scoped to the isolated adjacent-pair family, where the changed set of an absorbing offer is exactly that class. [2]

Targeted GPU execution witnesses all sixty shedding-pair face offers. Each changes 24 flags, discharges 20 walls and opens none. It also witnesses the twenty interior-triple face offers: each changes 36 flags, discharges 24 and opens none. [4]

The 420 held-pair result remains an exhaustive read-only incidence computation; the targeted package does not turn it into an exhaustive GPU receipt census. The two forms of evidence establish complementary subjects: the complete classification, and native receipts for every predicted pair and triple exit.

![A horizontal count bar divides 480 adjacent-pair fields into 60 with a strict face exit and 420 with no strict exit. The full classification is read-only; GPU receipts cover all 60 exits.](figures/figure_1_pair_classification.png)

Figure 1. Adjacent-pair placement at (4,0). Read-only evaluation over the bound incidence classifies all 480 isolated adjacent-pair fields under the recorded native and ancestral offered family: 60 have a strict face exit and 420 have none. Targeted GPU receipts witness all 60 predicted exits, each at 20 walls discharged and none opened. The 420 held cases are a complete read-only classification, not an exhaustive GPU receipt census.

## 5. Context can protect the same enclosed region

Placement is not the general rule. The decisive counterexample is a nested field at (4,0): two adjacent interior sites form a NO hole inside one original face, their eight neighbouring sites read THIS, and the exterior reads NO.

| Agreement class | Flags | Original-face footprint |
|---|---:|---|
| Enclosed NO hole | 24 | Inside one face |
| Surrounding THIS region | 96 | Four faces |
| NO exterior | 1,800 | All twenty faces |

The field has 64 walls and no strict exit in the complete family checked over the bound incidence. An offered face contains the entire hole. Containment nevertheless does not let that face fill the hole strictly, BECAUSE the same assignment also changes eighteen flags belonging to the exterior NO class.

The native receipt exposes the interaction directly. The face-to-THIS assignment changes 42 flags: the 24 hole flags and 18 exterior flags. It discharges 30 walls but opens 10, retaining 34. The whole changed set fails strict discharge.

Now leave the hole's flags, reading and ancestry unchanged, but read everything else THIS. The same face assignment changes only the 24 hole flags. Its receipt discharges 20 walls, opens none and retains none. The hole dissolves. Both receipts are included in the targeted GPU package. [4]

| Same hole and same containing face | Changed | Discharged | Opened | Retained |
|---|---:|---:|---:|---:|
| Nested field | 42 | 30 | 10 | 34 |
| Everything outside the hole THIS | 24 | 20 | 0 | 0 |

The exterior protects the hole through a support they share. No additional protective operation is introduced. Protection is the opening that would accompany the attempted filling. The strict criterion excludes that assignment BECAUSE its effect on the exterior is part of the same receipt.

This establishes held structure inside held structure for the checked configuration. It also identifies the limit of a footprint-only account: the same region meets the same ancestral cells in both fields. What changes is the surrounding agreement-class structure encountered by the containing offer. Persistence is contextual.

The composite receipts show the same mechanism. In a pair-plus-separated-single field, an ancestral face offer discharges eighteen walls but opens four, while the single's native exit discharges twelve and opens none. Protection of one region can coexist with an enabled change elsewhere. SAND remains a property of the whole field; a locally protected class need not imply that the whole field has K empty. [4]

![Grouped bars compare two GPU receipts. Nested field: 30 discharged, 10 opened, 34 retained; contrast: 20 discharged, zero opened, zero retained. The same 24-flag hole is used in both. The respective changed sets contain 42 and 24 flags.](figures/figure_2_context_receipts.png)

Figure 2. Context changes the receipt for the same hole and containing face. In the nested (4,0) field, the face-to-THIS assignment changes 42 flags, discharges 30 walls, opens 10 and retains 34. With every flag outside the same 24-flag hole read THIS, it changes 24 flags, discharges 20 walls, opens none and retains none. Both are targeted GPU receipts. Strictness fails in the nested case BECAUSE ten new walls open; receipt categories are shown separately and are not an additive score.

## 6. Refinement can change what the field is able to keep

### 6.1 Preserving readings does not preserve exits

A recorded refinement map π sends each child flag to its parent flag. Pulling back a field assigns each child its parent's reading:

```math
q_child = q_parent ∘ π.
```

The bound doubling has four children per parent flag, with each fibre connected. Non-contracted child overlaps occur with multiplicity one, three and two for site-, edge- and triad-changing parent overlaps respectively. Contracting overlaps connect identical inherited readings and open no wall. For genuine pullbacks of supports, receipt counts transform by coordinate:

```math
r_child = r_site + 3 r_edge + 2 r_triad.
```

Every multiplicity is positive, so strictness transports in both directions for a genuine pulled-back support. But the recorded ancestral offered family does not consist entirely of those preimages. Face images commute with the recorded map; site and corridor images need not. An ancestral site remains a 10- or 12-flag support, while its full flag preimage has 40 or 48 flags. [2]

A diagnostic single-site field makes the consequence visible. At (2,0), its THIS class contains twelve flags, its exterior 468, and its twelve walls have one strict exit: site-to-NO, with receipt 12/0. After pullback to (4,0), the classes contain 48 and 1,872 flags. The field still has twelve walls, but K is empty under the recorded child and ancestral offers.

The readings carry through the map; retention changes. The former site's own ancestral support no longer covers its entire inherited class. The complete read-only check finds no alternative strict offer. Refinement has removed the exit without adding a new persistence rule.

This is a carrier-to-carrier computation over bound readbacks. It is not an executed refinement of the committed world. Its significance is the correspondence itself: preserving local readings is insufficient to preserve the relation between a field and its available changes.

### 6.2 A prediction checked at the next refinement

The nested configuration supplies a contrasting transport. Its (4,0) classes of 24, 96 and 1,800 flags pull back to 96, 384 and 7,200 at (8,0). The pre-execution derivation predicted 64 walls, no strict exit, and a 30-discharge/20-opening receipt for the inherited containing-face assignment.

Native execution evaluates all 33,256 raw assignments on that transported field, including the transitive ancestry through (4,0), (2,0) and (1,0). They represent 32,824 distinct assignments. The result matches every predicted quantity. [5]

| Reading | Prior prediction | Closed GPU receipt |
|---|---|---|
| Hole / surrounding region / exterior | 96 / 384 / 7,200 | 96 / 384 / 7,200 |
| Source walls | 64 | 64 |
| Strict offer set | Empty | Empty |
| Containing face: discharged / opened | 30 / 20 | 30 / 20 |

Retention through refinement is thus witnessed for this configuration. The single-site counterexample prevents a general invariance claim. Both results follow the same principle: the readings, refinement map and recorded supports must be examined together.

![Two panels. A shows a THIS class increasing from 12 to 48 flags while its 12 walls remain; its single strict exit disappears. B compares containing-face receipts 30/10 and 30/20 at levels 4 and 8, with 64 walls and K empty at both levels. The (8,0) result has a closed GPU receipt matching its prediction.](figures/figure_3_refinement_contrasts.png)

Figure 3. Two refinement correspondences with different retention outcomes. A: a diagnostic single-site THIS class grows from 12 flags at (2,0) to 48 at (4,0) under the recorded pullback. Its 12 walls remain, but the strict offer set changes from one exit to empty. This is a read-only carrier-to-carrier computation, not a world refinement. B: the nested configuration retains an empty strict offer set and 64 walls at both (4,0) and (8,0); its class counts change from 24/96/1,800 to 96/384/7,200. The containing-face receipt changes from 30 discharged/10 opened to 30/20. The (8,0) full-family GPU run matches the prior prediction for this configuration. No general invariance claim is made.

## 7. Several enabled effects determine one snapshot successor

### 7.1 Closure of the whole-site domain

The preceding experiments also expose fields with several strict offers. Choosing one would add an ordering absent from the receipt law. The relevant construction instead begins with the geometry of their effects.

For a whole-site field, all flags at each site carry one reading. Those flags are SAME-connected through edge- and triad-changing overlaps. Every agreement class is consequently a union of whole sites. Strict transitions change whole agreement classes, so fixed-incidence strict evolution preserves the whole-site domain.

Within the bound (1,0), (2,0) and (4,0) carriers and their recorded families, current effects have two relations: concurrency or absorption, after equivalent effects have been identified. This is a scoped derivation from the incidence contacts. [6]

Two enabled isolated sites cannot be adjacent. BECAUSE an enabled site differs from every neighbour, adjacent enabled sites would require the third site of their common triad to differ from both opposite readings. Two readings cannot satisfy that contact. Flipping an isolated site also cannot newly enable a neighbour: after the flip, the site agrees with every neighbour.

At (4,0), original-face effects supply the additional cases. Distinct original faces have disjoint flag images, and their compatible effects commute. An enabled site inside an enabled face is absorbed when applying the face after the site gives the face's own prior-snapshot successor. Boundary contacts exclude an opposing strict site effect across that face boundary. Outside effects commute.

Finite descent through proper wall subsets, together with these local relations, yields one terminal field within the scoped whole-site evolution. Different histories remain different records. Agreement of terminal fields is also weaker than the required absorption witness: absorption names the absorbing effect's own successor, not merely an eventual common endpoint.

### 7.2 The next snapshot, rather than an arbitrary execution order

Let E(q) be the distinct strict effects enabled by the source snapshot, retaining every raw offer identity in its effect class. Equivalent effects are identified by the complete successor field, not by equal receipt counts. Among distinct effects, absorbable effects remain in provenance and the nonabsorbed concurrent effects determine the joint assignment.

```math
J(q) = JOINT_APPLICATION(E(q))
q_next(f) = J(q)(f) for f in the changed-flag assignment
q_next(f) = q(f) elsewhere
discharged = W(q) ∖ W(q_next)
opened     = W(q_next) ∖ W(q).
```

Here J(q) is the partial changed-flag assignment, and q_next is the complete successor field. The successor together with its receipt and required provenance forms the joint candidate; the committed transition is the link. The joint receipt is computed directly from source and successor. Per-offer counts are not summed, and duplicate offer identities are not discarded by selecting a representative as authority.

One committed link applies the effects already enabled in that one snapshot. An effect newly enabled by the joint application belongs to the next proposal. BECAUSE a step cannot observe current-step results before commit, a link does not collapse the entire path to its terminal field.

The GPU diagnostics witness two separated singles discharging 22 walls together and two disjoint faces discharging 48, with no openings. Equivalent site and face offers give one effect while retaining their identities. A newly enabled effect appears only after the returned state is proposed again. The J17 singleton case reproduces the committed field, witness, receipt and pair bytes SAME; the diagnostic does not claim identical whole-link bytes across different executors. Reversing the flat seed-row enumeration preserves the decoded effects and raw offer identities; raw readback order is a separate subject. [7]

The distinction between equivalence and absorption matters experimentally. The bounded fixture search found coenabled site and face offers with the same effect, but no distinct proper-absorption fixture. Coalescence is therefore witnessed on the GPU; proper absorption remains part of the scoped mathematical construction, not an additional positive GPU case.

The excluded controls delimit the result. An arbitrary field splitting sites can present a conflict, and the lone open triangle can absorb in either direction. Neither belongs to this closed whole-site domain. The construction does not extend its deterministic successor claim to those fields, to governed steps that open walls, or to vertical refinement.

These are qualified native diagnostic results. The canonical program binding separately passes all eight admission conditions for the site-reading join. Effect comparison and write assembly still lack that complete application binding; those obligations are paused. This paper does not claim end-to-end canonical qualification of the whole joint-application implementation. [8]

## 8. Evidence and reproducibility

The evidence has four distinct scopes. Finite derivations identify the receipt condition and its consequences. Read-only computations evaluate complete families over bound incidence. Native GPU receipts witness the selected executions. Program-admission records establish the implementation scope they actually test.

| Subject | Coverage | Evidence |
|---|---|---|
| Triangle and rectangle census | All non-uniform fields on those finite incidences | Authoring-support enumeration |
| (1,0) families | 146 fields; 70,664 assignments | Exhaustive GPU receipts for listed families |
| (2,0) families | 656 fields; 1,343,488 assignments | Exhaustive GPU receipts for listed families |
| (4,0) classification and context | Complete recorded computations | Read-only bound-incidence evaluation; independent reproduction |
| Decisive (4,0) offers | 89 exact offer identities | Targeted GPU receipts |
| Nested (8,0) configuration | 33,256 raw assignments | Full-family GPU receipt for one field |
| Snapshot joint application | Positive, replay and withholding controls | Native diagnostics; canonical binding partial |

The targeted finer-level package contains 62 receipts reused by exact offer identity from closed batches and 27 newly executed receipts. Its total is 86 strict receipts and three receipts with openings. Reuse does not count the same offer twice. The retained exhaustive batches remain evidence for their own closed ranges; the remaining exhaustive sweep is not claimed complete. [4]

The sparse receipt adapter completed qualification within its four-hour bound. Qualification included byte-identical replay, reversed enumeration and missing-input controls. For the 27 new cases, the run record's `timing_ms` object reports `target_native` = 23,669.7122 ms and `target_queuegate` = 39,145 ms. Preparation through closed custody is `target_preparation_through_closed_wall` = 67,215 ms; `target_measured_stage_sum` = 48,861.0411 ms. The end-to-end value includes orchestration intervals and excludes prior implementation and qualification. These are separately scoped timings, not additive measurements or a comparative benchmark. [4]

Every cited record is identified in the companion evidence ledger by its original path, byte count and SHA-256. Byte-identical copies of the 22 compact records accompany this preprint in its companion evidence archive, together with the finding annotations, promotion receipt and predecessor-ledger locator. Their upstream manifests identify larger source and readback artifacts that are not duplicated in this paper package. Paper one has a public DOI; this preprint and its companion evidence are released together. No diagnostic described here adds a committed transition to the original world.

## 9. What persistence means in this construction

Three results change the account of a persistent configuration.

First, persistence is relational. A region's local outline alone does not determine retention. The nested-field contrast keeps that outline and its ancestry fixed while changing the outcome. The surrounding field participates in every attempted change whose support meets it.

Second, refinement is consequential. It changes more than the number of flags. The inherited reading and the recorded ancestral offer can have different extents, so an exit can disappear even when every child reads exactly what its parent read. The nested example also shows that retention can survive that change. Neither outcome is imposed by a general refinement label.

Third, several enabled changes need not compete for a preferred position. On the scoped whole-site domain, incidence supplies concurrency and absorption. Their joint application gives the next snapshot; the commit boundary supplies the order between snapshots. Deterministic change and persistent structure occupy the same construction.

The result is a concrete account of organization. A field can dissolve, settle into a retained configuration, protect an internal region, or acquire retention under a change of refinement correspondence. Each statement names an offered family and a receipt. The same strict criterion supplies these different outcomes.

## 10. Conclusion

We have witnessed context protect a region that otherwise dissolves, and refinement preserve one retained configuration while removing the only exit from another. The exact receipt condition explains both: a strict offer must change whole agreement classes without cutting any, with a nonempty changed-set boundary. What persists depends on the whole field encountered by each offered support.

The same construction determines compatible simultaneous change on the bound whole-site domain. Enabled effects commute or absorb one another, so one source snapshot determines one joint successor without selecting an offer. The committed boundary separates that application from anything it newly enables.

Persistence is therefore an outcome the geometry can account for. Composition makes it possible; state and ancestry determine where it occurs; context can protect it; and the receipt records the consequence of every attempted change.

## References

Companion records named below are supplied in the evidence archive accompanying this preprint. Their complete identities and original locators are recorded in its evidence ledger; the frozen finding review is read with the included predecessor-ledger locator. Figure sources and rendering assets accompany the publication separately.

[1] Generally, D. A. (2026). *Genesis on the GPU: A World That Proposes Its Own Next Step*, version 0.5. MetaCortex Dynamics LLC. [doi:10.5281/zenodo.23673872](https://doi.org/10.5281/zenodo.23673872).

[2] *Finding: SAND Relation Derived Rule*, proposed revision 0.1.6, with predecessor 0.1.5 and source custody. Companion evidence: `FINDING_SAND_RELATION_DERIVED_RULE_001_v0.1.6.md`. The receipt-bearing revision preserves its earlier prediction and correction history. It is a synthesis of the separately identified evidence, not a new law attestation. Its historical multi-member discussion predates the later construction in Section 7; the companion review distinguishes its two-effect description from raw offer counts and records the subsequent promotion.

[3] Closed configuration-family sweeps: `FINAL_LEVEL_1_V20.json` and `FINAL_LEVEL_2_V20.json`. Companion records bind every listed field, assignment family and closure.

[4] Targeted finer-level receipts: `RUN_RECORD_036.json` and `TARGETED_RECEIPTS_CLOSED_036.json`. Exact identities, changed sets and receipt sets for 89 offers; qualification and custody locators retained.

[5] Nested-field refinement execution: `RUN_RECORD_RULE_D_026.json`. One transported (8,0) configuration, full native and transitive ancestral offered family, final readback and prior-prediction comparison.

[6] Promoted snapshot-effect amendment, its contact ledger and promotion receipt, read under the active snapshot-effect terminology erratum. Construction clauses N1-N7 and derivation contacts D1-D5. Full identities and frozen historical filenames are in the companion ledger.

[7] Native snapshot-effect diagnostic qualification record. Concurrent effects, equivalent offers, returned-state boundary, singleton continuity and excluded-domain controls. Companion ledger identifies the complete record and its partial-qualification scope.

[8] Canonical site-reading join qualification: `RUN_RECORD_FABRIC_BINDING_042.json`. Eight admission conditions, dependency controls and replay. Its subject is the join; effect comparison and write assembly are not discharged by this record.

*Publication scope.* This is the illustrated publication rendering of Paper Two v0.1.1, promoted by Devon A. Generally on 1 November 2026. The exact reviewed manuscript and PDF remain frozen under their promotion receipt. This rendering changes presentation and evidence-availability wording only. Findings and execution records retain their own statuses; no additional experiment, law promotion or world transition is introduced. The outstanding implementation obligations remain paused.
