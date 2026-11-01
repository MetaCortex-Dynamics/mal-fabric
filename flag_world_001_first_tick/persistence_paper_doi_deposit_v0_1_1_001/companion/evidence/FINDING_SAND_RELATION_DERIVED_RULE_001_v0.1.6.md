# FINDING_SAND_RELATION_DERIVED_RULE_001 — how geometry becomes SAND

STATUS      := PROPOSED (execution-ledger revision, Codex). DECIDE/PROMOTE: Devon. Scoped native receipts are cited in §8; no law change or world transition.
REVISION    := 0.1.6 PROPOSED, 2026-10-30. Targeted (4,0) receipts closed before this revision; the §7 prediction is retained as genealogy.
PREDECESSOR_HASH := 806032474DA721A8FE58E914EB0DB70A08D9211FD8617252B411744367B6B13F, 16,770 bytes; exact 0.1.5 bytes retained alongside this file.
PREDECESSOR := 0.1.5 PROPOSED, 2026-10-28 (Codex 20:47 / 13:18: refinement-transport mechanism added to §4 as a recorded
               route, vertical-world reading marked READING; "three routes only" → "routes recorded here"; Rule D (8,0)
               derived prediction added to §7). 0.1.4 (Codex 19:23 / 20:20: Rule D contextual retention added; Rule C scope unchanged;
               persistence law along strict transitions; §7 transport subject). 0.1.3 (Codex 10:37: (1,0) pair count in Rule B; domain images 10 flags; §4 grinding no longer
               presupposes batch execution). 0.1.2 (Codex 10:14: containment stated on the whole changed set D, not on a class; native
               invariance scoped to the adjacent-pair family; level-specific flag counts; "original (1,0)" faces named as
               such). 0.1.1 (Codex 08:57: Rule C scoped to pairs; k-range; Rule B hypotheses). Corrections replace text;
               0.1.0 (43f371dc…), 0.1.1 (DDD64ECE…), 0.1.2 (39F39196…), 0.1.3 (9DFB3BB3…) and 0.1.4 (6346E3CF…) bytes are superseded.
DATE        := 2026-10-26
ORIGIN      := Devon: "we need the derived rule for how geometry becomes a grain of sand";
               "'Grain of Sand' ... We are referring to the relationship that We call 'Sand'";
               "how we get from the inverted triangle to a tessellation that makes the sand relationship admissible".
GROUND      := Genesis on the GPU v0.5 (sealed 65D2DB5E…8998DF; DOI 10.5281/zenodo.23673872);
               ERRATUM_E_FIRST_SHAPE_NO_PIECES_001 v0.1.3 (E93318BC…337BCC): one primitive shape, the inverted triangle;
               rectangle := two triangles on a shared edge; circle := closed fan of six triads around G;
               first shape := (D,I) @ (2,0); admissible tessellations := ProjectionShell(m,n) refinements;
               configuration := (arrangement, admissibility witness); membership = admissibility, not composition.
WITNESS     := authoring-support scripts (Claude, python3 -I; not engine, not canon), hashes in §6;
               Codex read-only reproduction over the bound GPU incidence at (4,0), readback 5D697DB8…928500.

## 1. Definitions (terms fixed for this record)

STRICT(U→b)   := for offered assignment U→b with changed-flag set D and boundary ∂D (overlaps with exactly one end in D):
                 ∅ ≠ ∂D ⊆ W(x).   [Codex form. Equivalent: D is a union of whole agreement classes AND ∂D ≠ ∅.]
                 BECAUSE an overlap changes agreement precisely when one endpoint changes:
                 opened = ∂D \ W(x); discharged = ∂D ∩ W(x).
SAND(q)       := a relation, not an object: q has walls (W(q) ≠ ∅) and K(q) = ∅ under its offered supports.
                 Every wall is retained by every offer that opens nothing. Equivalently: no offer has ∅ ≠ ∂D ⊆ W(q).
                 Sufficient condition (not equivalent outside the two-class case): every agreement class reaches
                 OUTSIDE every offered support that contains any of its flags.
"grain"       := one connected component of the retained-wall relation. Not a region; not a piece.
Correspondence labels ("sand", "element", "compound") are MENTIONED only; none occupies a law position (W9).

## 2. Derived rule: where SAND becomes admissible on the registry chain

| stage (registry term)                      | sites/edges/triads | flags/overlaps | largest offered cell | SAND admissible            |
| inverted triangle (one triad)              | 3/3/1              | 6/6            | 6 (the triad)        | NO — 0 of 62 fields        |
| two triangles sharing only a site          | 5/6/2              | 12/12          | 6                    | NO — no overlap crosses    |
| rectangle (two triangles, shared edge)     | 4/5/2              | 12/14          | 6                    | YES — 34 of 4,094 fields   |
| circle (closed fan of six triads around G) | 7/12/6             | 36/48          | 12                   | YES — G + one rim site     |
| first shape (D,I) @ (2,0), closed          | 42/120/80          | 480/720        | 12                   | YES — 120/120 pairs sealed |

RULE A (the fold admits). SAND is inadmissible on the lone triangle BECAUSE its whole flag set is itself an offered
cell. It becomes admissible at exactly one event: a second triangle on a shared edge. The shared edge creates the
first triad-changing overlaps, so agreement can extend across triads beyond the reach of any single offer.
Sharing a site is not enough BECAUSE two flags differing in edge and triad are not an overlap: no wall can stand there.
Minimal rectangle witness: 4 THIS flags, 4 walls (exhaustive census). Site-generated witnesses: 6 THIS flags.
Closure (fan → first shape) makes every flag carry all three overlaps; it does not create the relation.

RULE B (native offers, every (m,n)). Native cell sizes are fixed (pair 2, edge 4, triad 6, site 10/12) and refinement
adds cells without enlarging them. Transport hypotheses for a field q at any (m,n): BOTH whole agreement classes of q —
the THIS class and its complementary NO class — exceed every native support. Under those hypotheses K(q) = ∅ by the
STRICT criterion. For adjacent-pair fields the hypotheses hold at every level (pair class 20 flags at (1,0), 22 or 24 at (k,0), k ≥ 2;
complement larger).
Witnessed instances: (1,0) 30/30, (2,0) 120/120 (sealed); (4,0) 480/480 (Codex, bound incidence). READING for other (m,n).

RULE C (the genealogy restricts) — SCOPE: adjacent-pair fields only, not arbitrary agreement classes.
General criterion (all fields): an offer U→b is strict iff ∅ ≠ ∂D ⊆ W(x) for its WHOLE changed set D. Containment of one
class is not enough, BECAUSE a support can contain that class while cutting another same-reading class (Codex 10:14).
Skeleton contact alone establishes nothing either: a single original-domain site touches the skeleton and its native
site→NO assignment discharges it (Codex 08:57).
For adjacent-pair fields the changed set of any pair-absorbing offer is exactly the pair's class, so the criterion
reduces to containment. Pair class sizes by level: 20 flags at (1,0) (two pentagonal sites); 22 or 24 at (k,0), k ≥ 2.
Native supports hold ≤ 12 flags; original-domain images 10 (pentagonal sites); original-corridor images 4k flags (8 at (2,0), 16 at (4,0)),
excluded not by size but BECAUSE a site star includes off-corridor edges, so no corridor image contains a complete star.
The only supports that can absorb a pair are therefore original-FACE images. Those nest, so the binding supports are the
20 faces of the original (1,0) shell (the first shape is (2,0); these are its ancestor's faces): an adjacent pair sheds
iff both sites lie strictly INSIDE one original (1,0) face image, and is held iff it touches the original (1,0) skeleton
(12 domains, 30 corridors).
  (4,0): 60/480 pairs have exactly one strict exit (grandparent face → NO: 20 discharged, 0 opened); 20 interior
  triples shed (24/0); 420 pairs bound.  [Codex, bound incidence; Claude, incidence model: SAME]
  Closed form at (k,0), k ≥ 2: absorbable pairs = 30(k−2)(k−3); bound = 30k² − 30(k−2)(k−3).
  k = 1 recorded separately: 0 / 30 (the expression would report 60; the (1,0) shell has no ancestor).
  (2,0): 0 / 120.  (3,0): 0 / 270.  (5,0): 180 / 750.  (6,0): 360 / 1,080.   READING above (4,0) until executed.
Consequence: for the adjacent-pair family under Rule B's hypotheses, retention is T-invariant under native offers and
NOT under full ancestry. "Cells never enlarge" was the
wrong invariant; the containment condition (no transported class wholly inside any offered support, ancestral images
included) is the transport lemma. Earlier reading "threshold invariant at every admissible tessellation" is WITHDRAWN.

RULE D (contextual retention) — an interior relation can persist through its relation to the surrounding field, without
touching an original seam itself. Rule C's isolated-pair scope is unchanged.
General rule unchanged: STRICT ⇔ ∅ ≠ ∂D ⊆ W, on the whole changed set D. On this connected carrier, for a uniform offer
it reads: at least one opposite-reading agreement class is changed whole, and no opposite-reading class is cut. The
nonempty-boundary condition is retained so the general statement stays intact.
Witnessed configuration at (4,0) (two adjacent interior sites of original face W_00 read NO; their eight neighbouring
sites read THIS; everything else NO):
  | agreement class   | flags | ancestral footprint      |
  | enclosed NO hole  |    24 | entirely inside W_00     |
  | surrounding THIS  |    96 | four original faces      |
  | NO exterior       | 1,800 | all twenty original faces|
  64 walls; K = ∅.
  Decisive receipt, W_00 → THIS: D = 24 hole flags + 18 exterior flags; 30 discharged, 10 opened. The offer contains the
  whole hole but cannot fill it strictly, BECAUSE it also cuts the exterior NO class.
Contrast, same hole (same flags, reading, ancestry), everything else THIS: 20 walls; K = {W_00 → THIS}; 20 discharged,
0 opened. Same placement, different retention: the surrounding configuration supplies the difference.
Consequences:
  - Ancestral footprint alone does not determine persistence. The original seams constrain which supports exist; what a
    support does depends on every class it meets. The earlier reading "a hole persists only if no offered support
    contains it" is WITHDRAWN: containment can accompany retention when the containing offer cuts another class.
  - Held-inside-held is realized at (4,0).
Definition vs mechanism: SAND remains defined for the whole field (W ≠ ∅ and K = ∅). "Classes hold one another through
shared supports" names the mechanism witnessed here, not an equivalent definition. A protected class can also persist
while another class sheds (pair + separated single, §4).
Witness scope: Codex, bound (4,0) readback 5D697DB8…928500, reproduced twice: 7,884 assignments (native, original faces,
immediate-parent faces). Claude, independent incidence model: 7,724 assignments (native + original faces), SAME on every
row above. Ancestor site/corridor assignments excluded by the whole-class size bound (≤ 16 flags vs smallest class 24).
Neither computation is a GPU execution receipt.

PERSISTENCE ALONG STRICT TRANSITIONS. At fixed incidence, agreement classes only merge along admitted strict transitions,
whichever strict member is taken sequentially, BECAUSE every such transition preserves every existing SAME overlap
(opening none). The agreement partition coarsens and never splits. This needs no selection among exits. Refinement and
simultaneous combined effects are NOT covered: each requires its own transport or receipt.

## 3. The derived statement (Codex 23:26, accepted)

Names such as "element" or "compound" must refer to admitted organizations of ∇, not additional primitives.
A tessellation is distinct from its realized configuration: the same 012 incidence carries a single-region field that
sheds and pair fields that hold. So any such name is a relationship realized by a tessellated configuration — its
readings, genealogy and admitted transitions — not a classification determined by tessellation alone.
ONE configuration carries MANY genealogical roles without ceasing to be ONE: composition has geometric meaning
without pre-existing pieces (erratum v0.1.3 RETAINED clause).
For SAND the relationship is persistence: a wall-bearing configuration with no strict exit under its offered supports.
Its tessellation makes that possible (Rule A); its realized state and ancestry determine whether it holds (Rules B, C).

## 4. How geometry becomes SAND (the law never creates)

From uniform NO, K = ∅: no grain forms from nothing. Routes recorded here (four examples; exhaustion is not claimed):
  seeding — a hardware event names a locus whose walls are retained from birth (J17 named one site: it dissolved);
  grinding — strict steps: when K is a singleton the world takes it (pair + separated single → pair; ring → disc,
             both witnessed); what survives is a field on which no offer meets ∅ ≠ ∂D ⊆ W(x). How a multi-member K
             is taken is the unselected operand of §5, not settled here;
  governed input — R2-type steps that open walls, driven by an input seat;
  refinement transport — readings carried through the recorded refinement map π (s′ = s ∘ π) while the offered family
             changes. Witnessed (Codex 20:47, read-only over bound (2,0) and (4,0) readbacks): a DIAGNOSTIC single-site
             field at (2,0), THIS on one site, NO elsewhere — classes 12 / 468, 12 walls, K = {site → NO}, receipt (12,0).
             Its pullback at (4,0): classes 48 / 1,872, 12 walls, K = ∅ under the recorded child and ancestral families.
             The readings are preserved through π; retention changes, from a singleton exit to K = ∅, BECAUSE the
             recorded ancestral site offer (10–12 flags) is not the full flag preimage (40–48). Faces pull back under π;
             recorded site and corridor images need not.
             Transport facts (bound (2,0) → (4,0) refinement): 1,920 / 1,920 child flags mapped; 480 / 480 parent flags
             recovered; 4 children per parent flag, each fibre connected by 3 distinct contracting overlaps; non-
             contracted child overlaps per parent overlap: site-changing 1, edge-changing 3, triad-changing 2. For
             genuine pullback supports STRICT transports both ways; counts obey r′ = r_site + 3 r_edge + 2 r_triad.
             No general theorem that every strict exit transports under the recorded offer family is claimed: this
             example shows one that does not.
             READING: interpreting this as a vertical step of a world (refinement under GRL §7, which requires K) is not
             witnessed. The diagnostic field is not J17's committed worldline; J17 was not refined.

## 5. Unselected operand (owed stop, named)

Two separated single sites: K has two members, both strict, commuting, with disjoint supports; their union is not an
offered cell. Whether the law executes both in one tick or reports the branch is for the geometry to settle.
It is the one stop in this record that names an operand not yet computed.

## 6. Witness custody (authoring support, not evidence of record)

tess_witness.py            c5c2512fbcf1dc3d84584a3ad0d54b3a4c9382b825f017228877d58f6b8b6cee  (configurations at (1,0),(2,0))
out.json                   17122007f8a46cb0d6d8518dc9b66f3db44d39ad986a9d2e17464f2bd5be2e00
grain_rule_witness_v2.py   05b85e21184be409006dbc13e87050d24bd0724265740d10eb19ec23ddad3a4c  (rule vs receipts: 460/460)
chain_witness.py           c33d03f70e92ced505e8d914b2e21d7ee4f4c34f5d1d0ab3f3458d3969c13d8d  (registry chain, §2)
ancestor_containment.py    88c707db930cdb29d4eb29c17430de995b4c1b1131cdee4a0235d1c46a1d9d14  (Rule C, (2,0)–(6,0))
nested_witness.py          f151f2149eac7eee193ade12903175a4ae221515e237721982d8978058c50605  (Rule D, (4,0))
Codex (4,0) readback       5D697DB8…928500 (bound GPU incidence; read-only).

## 7. Pre-execution proposal and prediction (retained genealogy from 0.1.5)

Sweep at (1,0), (2,0), (4,0) under the promoted family with ancestry carried transitively into PROPOSE:
all connected triples; all rings and discs; pair + separated-single composites; the two-singles branch as a witnessed
operand. Expected: Rules A–C exact; (4,0) split 60/480 as a GPU receipt; branch operand surfaced for the geometry.

Transport computation (persistence through refinement, distinct from persistence along strict transitions): carry the
Rule D configuration (24 / 96 / 1,800 at (4,0)) through ancestry to (8,0), then evaluate its entire offered family.
Derived prediction (Codex 20:47, from the transport facts above; not executed):
  hole / ring / exterior   96 / 384 / 7,200 flags
  walls                    64 (all 64 Rule D walls change the site coordinate, multiplicity 1)
  W_00 → THIS receipt      30 discharged / 20 opened (10 opened triad-changing overlaps, multiplicity 2)
  K                        ∅ under the stated transport: ancestor-face offers transport their strict verdicts; other
                           supports at (8,0) contain at most 32 flags, below the smallest transported class (96).
Owed before it counts: the (8,0) carrier, s₈ = s₄ ∘ π with π derived from the next refinement's contacts, recovery of
the parent readings, then the entire offered family as a receipt.

## 8. Execution ledger added in 0.1.6

AUTHORITY := Devon's DECIDE: reuse exact sealed offer identities first; qualify the sparse adapter within four hours;
             execute the remainder with full custody. No successor and no K member taken.
CURRENT   := targeted receipt obligation DISCHARGED; the exhaustive (4,0) recovery remains STOPPED.
             The previous mathematical scopes remain unchanged except for the explicit witness upgrades below.
             No general refinement-transport theorem is restored. J17's committed worldline is unchanged.

### 8.1 Subjects and coverage

| Subject | Closed native coverage | Scope |
| --- | --- | --- |
| (1,0) configuration families | 146 fields × 484 assignments = 70,664 assignments | All 12 singles, 30 pairs, 80 connected triples, 12 rings and 12 discs; four compact batches |
| (2,0) configuration families | 656 fields × 2,048 assignments = 1,343,488 assignments | All 42 singles, 120 pairs, 410 connected triples, 42 rings and 42 discs; 36 compact batches |
| (4,0) targeted package | 89 exact offer identities: 62 reused + 27 newly executed | Decisive cases listed below, not the exhaustive offer sweep |
| Rule D pullback at (8,0) | 33,256 assignments on this one transported configuration | Full recorded native and transitive ancestral family for this configuration |

At (1,0), each single dissolves and each ring fills to its disc through one raw strict offer; pairs, connected triples
and discs have K = ∅. At (2,0), singles and rings each have one distinct strict effect. Within each family, twelve
fields carry two distinct raw offer identities for that effect and thirty carry one. Pairs, connected triples and
discs have K = ∅. Offer identity is not effect identity; duplicate effects remain separate records.

The 112 retained (4,0) compact batches cover 6,390,672 raw assignments. The 62 reused receipts are located within them,
specifically recovery batches 65, 70, 75, 80, 85, 90, 95 and 98. They are not added to that batch count a second time.
The new 27-case package credits no recovery batch and resumes no recovery. The remaining 556 exhaustive batches are
not claimed complete.

The exhaustive (4,0) incidence computations and their independent reproduction retain their read-only scope. In
particular, the 420 held-pair cases and complete-family K statements for configurations outside the native coverage
are not upgraded by this targeted package. The package witnesses the named receipts, not an unrun exhaustive census.

### 8.2 Exact targeted receipt groups

Every row reports changed / discharged / opened / retained sets by cardinality; full memberships, raw identities,
source bindings and sealed citations are carried by RUN_RECORD_036 and its referenced receipt records.

| Diagnostic family / offer | Raw offers | Origin | Changed | Discharged | Opened | Retained | STRICT |
| --- | ---: | --- | ---: | ---: | ---: | ---: | --- |
| Interior-pair face offers | 60 | reused | 24 | 20 | 0 | 0 | IF_THEN |
| Interior-triple face offers | 20 | new | 36 | 24 | 0 | 0 | IF_THEN |
| Rule D, W_00 → THIS | 1 | new | 42 | 30 | 10 | 34 | NO |
| Same hole, exterior THIS, W_00 → THIS | 1 | new | 24 | 20 | 0 | 0 | IF_THEN |
| Separated singles, three distinct aliases of one effect | 3 | new | 10 | 10 | 0 | 12 | IF_THEN |
| Separated singles, ancestral face offer | 1 | new | 14 | 14 | 2 | 8 | NO |
| Separated singles, other native exit | 1 | new | 12 | 12 | 0 | 10 | IF_THEN |
| Pair + separated single, ancestral face offer | 1 | reused | 20 | 18 | 4 | 12 | NO |
| Pair + separated single, native exit | 1 | reused | 12 | 12 | 0 | 18 | IF_THEN |

Totals: 89 receipts, 86 strict readings and three receipts with openings. These totals concern the requested offers,
not a complete K computation for every field. No strict member was taken. The multi-member operand in §5 remains
unselected, and no simultaneous combined effect is licensed by these diagnostic counts.

Rule D now has a native receipt for the contextual contrast at (4,0): the same containing face opens ten walls in
the nested field and opens none in the contrast. This witnesses the mechanism BECAUSE the entire changed set
includes exterior flags in the former field, as the native changed/AFTER/discharged/opened sets record.

### 8.3 Prediction beside its (8,0) witness

The prediction in §7 was recorded before the run and remains above as genealogy. The closed native receipt records:

| Reading | Prediction in 0.1.5 | Closed (8,0) receipt |
| --- | --- | --- |
| Hole / ring / exterior flags | 96 / 384 / 7,200 | 96 / 384 / 7,200 |
| Walls | 64 | 64 |
| K on the full recorded family | ∅ | ∅ |
| W_00 → THIS: discharged / opened | 30 / 20 | 30 / 20 |
| Retained walls for that offer | not separately tabulated | 34 |

Prediction / witness: SAME for the stated configuration. This does not restore a general transport theorem:
the single-site pullback in §4 still witnesses a strict exit that does not transport under the recorded offer family.

### 8.4 Qualification and measured execution

The adapter applies the unchanged native V9 full-receipt clauses to explicitly named raw cases; it does not replace
opening receipts with a strict-only filter. Native provenance is carried through closed proof slices.

- Qualification closed 24 minutes 17.122 seconds after the recorded implementation start, within the four-hour limit.
- Eight native qualification invocations: normal, byte-identical replay, reversed enumeration with SAME receipts,
  and five missing-input controls. Forty-three adapter host controls and 48 operational-guard controls also closed.
- The first preparation was retained with zero native invocations and zero credited receipts. Its encoded-reading
  mismatch was repaired against the existing native TEXT codec. The qualification clock was not restarted.
- New target native time: 23.6697122 seconds. Preparation: 9.1339955 seconds. Package binding: 0.5820456 seconds.
- Target QueueGate execution and closure: 39.145 seconds, including the native step and custody.
- Preparation start through closed target custody: 67.215 seconds, including orchestration intervals; measured stage
  sum: 48.8610411 seconds. These timings exclude prior implementation and qualification.
- Target peak recorded facts: 577,810 of 2,097,152; terms: 722,886 of 4,194,304.
- QueueGate closed with the shared lane EMPTY. No world transition, successor, K selection, law promotion or repository
  commit occurred.

### 8.5 Record identities

Paths below are relative to this finding's directory. All SHA256 identities are complete.

| Record | SHA256 |
| --- | --- |
| ../RUN_RECORD_036.json | FE41196D8008620488CF9A6CC4A89379F4D273A431D9EB4EA83091F4EC6B3F34 |
| ../REUSE_AUDIT_036.json | 3908B95B68AC4747F200360EB0973E6217465C37BDAA919971F44694F5355539 |
| ../SPARSE_QUALIFICATION_036.json | 142EC7FE23F9FA1CB0E00DA8AE676D1FEB084EBBC3C8C66154DA93826155EBA5 |
| ../execution_qualification/queuegate_attempt/CLOSED.json | B2713A008D12F8967FECED48C82FF08F16FF61006B4359E9EDB2F865ED156D74 |
| ../TARGETED_RECEIPTS_CLOSED_036.json | 2AACCC0C2DC73D45B92029E49C25ADDF43CA2BE342C1081AC53FEFCB8986F0A9 |
| ../execution_target/queuegate_attempt/CLOSED.json | 03BF1543EB7BA56A9DE1872FA1D7ECE66F51634282C1A4FAFBDD56D4438481DB |
| ../../FINAL_LEVEL_1_V20.json | 2D30083D7DDAD80295A96E80E88FFE80223F616CC6FA6369D2F6F26D0C2D3406 |
| ../../FINAL_LEVEL_2_V20.json | C3400445F4BBB2BBFD96E27A0CAF9739B9124B272230CCA614FB507887175E82 |
| ../../../../receipt8_retained_001/RUN_RECORD_RULE_D_026.json | 02234D0482842067C8140A4DCF91ED9CC7FC3AC72F522E65D7B869699ACCCAFB |
| ../../native_exclusion_execution_032/audit_001/DISPOSITION.json | 73CBBED4CC4CC1F81A0496CCAF388F6DB57C99D1F09D885F9C6D8504A2FA071A |
| ../../targeted_receipt_proposal_035/reconciliation_001/DISPOSITION_035.json | 354F22588630487A7CF5D25D2A06463F789BCBBF6EAD70A2D6C292DA66F11F1E |

The record is PROPOSED, not promoted. The original 0.1.5 file remains byte-SAME; this additive 0.1.6 is the
receipt-bearing continuation in the mal-fabric packet.

