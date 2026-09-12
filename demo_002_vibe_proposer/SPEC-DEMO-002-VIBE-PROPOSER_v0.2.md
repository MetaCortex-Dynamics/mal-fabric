# SPEC-DEMO-002-VIBE-PROPOSER

**Version:** v0.2
**Status:** BUILD AUTHORIZED
**Depends on:** mal-fabric v0.4.0 / DEMO-001 Visible Fabric
**Scope:** `IntentRequest`, `IntentProposal`, `GeometricDiff`, `ProposalDisposition`, proposal history
**Hard invariant:** `NL_PROPOSER_DIRECT_COMMIT := FORBIDDEN`

---

## 0. Purpose

DEMO-002 extends the promoted DEMO-001 product surface with one new capability:

```text
natural-language intent
  → typed proposal
  → visible geometric + textual diff
  → user disposition
```

The proposer may construct a candidate. It may not grant authority to that candidate.

The demo succeeds iff natural-language intent can propose visible, canonical geometric change while the promoted fabric remains unchanged until the proposal passes explicit user disposition and the existing V3.1/V3.2 authority path.

---

## 1. Imported substrate

DEMO-002 imports mal-fabric v0.4.0 unchanged:

```text
V3.1      := canonical static fabric
V3.2      := governed admission
V3.3      := synchronous execution
DEMO-001  := visible fabric product surface
```

The following are immutable dependencies:

```text
V3.1 semantics
V3.2 semantics
V3.3 semantics
DEMO-001 D01–D18 evidence
DEMO-001 presentation/canonical separation
DEMO-001 text/visual confluence contract
```

DEMO-002 MUST NOT reopen, redefine, or patch those layers.

---

## 2. Product claim

```text
DEMO-002 CLAIM:

  A user may express supported behavior in natural language.

  The system converts that intent into a typed proposal over canonical
  FabricEdits.

  The proposal is rendered as visible geometric difference against the
  currently promoted FabricSpec.

  The text pane simultaneously shows the promoted and candidate forms.

  The user may ACCEPT, MODIFY, or REJECT the proposal.

  No proposal mutates executable/promoted fabric state merely because
  the proposer generated it.
```

The differentiator is:

```text
AI proposes visible geometry
before that geometry has authority
```

---

## 3. Core request and context types

### 3.1 IntentRequest

```text
IntentRequest := (
  natural_language_text,
  current_fabric_digest
)
```

`current_fabric_digest` binds the request to the promoted FabricSpec that existed when the user expressed the intent.

Law:

```text
IntentProposal.baseline_fabric_digest
  MUST equal
IntentRequest.current_fabric_digest
```

---

### 3.2 ProposalContext

The proposer MUST NOT receive mutable access to the canonical FabricSpec.

Instead it receives a bounded, read-only projection:

```text
ProposalContext := PROJECT(
  promoted FabricSpec,
  fields required by the supported proposal grammar
)
```

At minimum the projection may contain:

```text
cell ids
operator × witness types
semantic LOCATION
derived port signatures
route identities
TRIAD positions
supported edit affordances
```

Excluded from normative proposer context:

```text
mutable canonical object handles
runtime authority handles
presentation x/y as semantic input
private host implementation state
```

`ProposalContext` is derived and non-authoritative.

---

## 4. IntentProposal

```text
IntentProposal := (
  proposal_id,
  parent_proposal_id?,
  request_ref,
  baseline_fabric_digest,
  source_intent,
  normalized_intent,
  proposal_ast,
  proposed_edits,
  candidate_fabric_digest,
  proposer_explanation,
  genealogy,
  proposer_receipt
)
```

Requirements:

```text
proposal_id
  := content-addressed identity over canonical proposal content

parent_proposal_id
  := absent for root proposal
   | predecessor proposal for MODIFY lineage

request_ref
  := stable reference to IntentRequest

baseline_fabric_digest
  := digest of promoted/current FabricSpec against which proposal was derived

source_intent
  := original natural-language text

normalized_intent
  := canonical representation within supported intent grammar

proposal_ast
  := typed semantic representation

proposed_edits
  := finite canonical sequence/set of existing FabricEditAST values

candidate_fabric_digest
  := digest of NORMALIZE(APPLY_SEQUENCE(baseline, proposed_edits))

proposer_explanation
  := non-authoritative explanatory prose

genealogy
  := source intent → normalized intent → ProposalAST → FabricEditAST*

proposer_receipt
  := deterministic evidence of proposal derivation
```

`IntentProposal` is not a `FabricSpec`.

`IntentProposal` is not a governance verdict.

`IntentProposal` is not authority.

---

## 5. Proposer explanation

Every valid proposal MAY carry a human-readable explanation of why the proposer selected those edits.

This field is:

```text
descriptive
non-authoritative
non-governance
not a BECAUSE witness
excluded from candidate identity
excluded from authority
```

Two proposals with the same canonical proposal content MUST NOT become different geometric candidates solely because explanatory prose differs.

Governance BECAUSE remains solely an output of existing DRC/admission semantics.

---

## 6. Proposal parser

Normative shape:

```text
F_parse^NL :
  IntentRequest × ProposalContext
  → ProposalParseResult
```

where:

```text
ProposalParseResult :=
  PROPOSAL_READY(IntentProposal)
  | PROPOSAL_PARSE_MAYBE(needed)
  | PROPOSAL_PARSE_NO(reason)
```

The implementation MAY use:

```text
DeterministicGrammar
ExternalLLM
HybridParser
```

but all backends MUST lower through the same typed path:

```text
source_intent
  → normalized_intent
  → ProposalAST
  → FabricEditAST*
```

No backend may emit raw imperative UI mutations as semantic output.

If an LLM is used, its output is untrusted proposal syntax and MUST pass typed parsing and validation before any candidate is constructed.

Malformed or ambiguous proposer output MUST NOT become an empty edit list.

Required behavior:

```text
malformed / ambiguous
  → PROPOSAL_PARSE_MAYBE(needed)
  → NO candidate
  → NO candidate_digest
  → NO authority path
```

This preserves the distinction between:

```text
valid no-op
parse failure
NOT_SAME
```

The conformance backend SHOULD be deterministic.

No arbitrary-language semantic-completeness claim is made.

---

## 7. GeometricDiff

```text
GeometricDiff := (
  proposal_id,
  baseline_fabric_digest,
  candidate_fabric_digest,
  added_cells,
  removed_cells,
  moved_cells,
  added_routes,
  removed_routes,
  triad_changes,
  unchanged_context
)
```

`GeometricDiff` is DERIVED from:

```text
baseline FabricSpec
candidate FabricSpec
```

It MUST NOT become a second program model.

Semantic delta classes:

```text
ADD
REMOVE
MOVE
CONNECT
DISCONNECT
TRIAD_CHANGE
UNCHANGED
```

`MOVE` means a canonical LOCATION change.

Pure presentation displacement in x/y is NOT a semantic MOVE.

The visible diff MUST be renderable as an overlay showing current and proposed geometry simultaneously.

Presentation style MAY use:

```text
color
opacity
line treatment
labels
layers
strikethrough/fade
```

and remains non-semantic.

Selecting a diff element SHOULD expose:

```text
originating FabricEditAST
proposal_id
genealogy
admission status if submitted
```

---

## 8. Candidate/promoted text contract

The text surface MUST distinguish:

```text
PROMOTED
  current canonical FabricSpec

CANDIDATE
  NORMALIZE(APPLY_SEQUENCE(promoted, proposed_edits))
```

Before commit:

```text
PROMOTED := unchanged
CANDIDATE := preview only
```

After successful authority and commit:

```text
PROMOTED := candidate
```

The candidate view MUST NOT overwrite the promoted textual object before commit.

Equivalent candidate text edits and visual modifications MUST still lower through the canonical edit path inherited from DEMO-001.

---

## 9. ProposalDisposition

```text
ProposalDisposition :=
  ACCEPT
  | MODIFY
  | REJECT
```

This is a user/product interaction disposition.

It is orthogonal to V3.2 governance verdicts:

```text
ProposalDisposition ≠ IF_THEN | MAYBE | NO | NOT_SAME
```

Semantics:

```text
ACCEPT:
  user authorizes submission of the SAME candidate
  into the existing V3.1 + V3.2 authority path

  ACCEPT does NOT itself commit the fabric

MODIFY:
  current proposal is closed as SUPERSEDED
  a successor IntentProposal is created
  parent_proposal_id := current proposal_id
  successor proposal identity := NOT-SAME predecessor proposal
  baseline promoted FabricSpec remains unchanged

REJECT:
  proposal is closed
  no canonical fabric mutation
  no execution authority
```

Hard law:

```text
ACCEPT ≠ PROMOTE
```

---

## 10. Authority law

```text
NL_PROPOSER_DIRECT_COMMIT := FORBIDDEN
```

Allowed path:

```text
NL intent
  → IntentRequest
  → ProposalContext
  → IntentProposal
  → GeometricDiff
  → user ACCEPT
  → V3.1 APPLY / NORMALIZE / DRC
  → V3.2 admission
  → commit iff existing authority conditions permit
  → V3.3 execution
```

Forbidden:

```text
NL intent → direct mutation of promoted FabricSpec
NL intent → direct route/cell insertion into executable state
NL intent → bypass of V3.1 DRC
NL intent → bypass of V3.2 admission
user ACCEPT → unconditional commit
user ACCEPT = governance IF_THEN
user ACCEPT = PROMOTE
```

---

## 11. Baseline immutability and stale proposals

While a proposal is pending:

```text
promoted_fabric_digest_before
  =
promoted_fabric_digest_after
```

Preview state is separate from promoted state.

If the baseline changes before disposition:

```text
current_fabric_digest ≠ proposal.baseline_fabric_digest
  → proposal status := STALE
  → disposition cannot commit proposal
  → re-proposal required
```

No automatic rebase in DEMO-002.

STALE is a proposal-state condition, not a V3.2 verdict.

---

## 12. Proposal lifecycle

```text
DRAFT
  → PROPOSED
  → {
       ACCEPTED_FOR_ADMISSION
       SUPERSEDED
       REJECTED
       STALE
     }

ACCEPTED_FOR_ADMISSION
  → V3.1 / V3.2
  → {
       COMMITTED
       GOVERNANCE_MAYBE
       GOVERNANCE_NO
       GOVERNANCE_NOT_SAME
     }
```

Rules:

```text
PROPOSED is non-executable
SUPERSEDED is non-executable
REJECTED is terminal for that proposal
STALE is non-executable
GOVERNANCE_MAYBE remains non-executable
GOVERNANCE_NO remains non-executable
GOVERNANCE_NOT_SAME cannot silently substitute another candidate
COMMITTED requires existing V3.1/V3.2 authority
```

---

## 13. APPLY_SEQUENCE and candidate atomicity

Define candidate derivation:

```text
APPLY_SEQUENCE(F, [e1, e2, ..., en]) :=
  APPLY(
    ... APPLY(APPLY(F, e1), e2) ...,
    en
  )

candidate :=
  NORMALIZE(APPLY_SEQUENCE(F, proposed_edits))
```

The proposal is atomic from the user's perspective:

```text
ACCEPT submits the whole candidate
or nothing commits
```

Normative DRC is applied to the resulting candidate according to the existing V3.1 contract.

Intermediate edit states MAY be inspected diagnostically, but DEMO-002 MUST NOT introduce a new rule requiring every transient intermediate state to be globally admissible unless V3.1 already requires that behavior.

---

## 14. Advisory preview checks

The UI MAY show pre-disposition validation information.

Allowed only if it is side-effect free:

```text
PREVIEW_CHECK := pure / advisory
```

Preferred flow:

```text
proposal
  → derive candidate
  → optional PREVIEW_CHECK
  → GeometricDiff
  → user disposition
```

If the existing V3.2 implementation cannot be evaluated without lifecycle/authority effects, DEMO-002 MUST NOT pre-run authoritative V3.2 admission before ACCEPT.

Authoritative submission occurs only after ACCEPT.

---

## 15. MODIFY semantics

```text
MODIFY(P0, user_change)
  → P1
```

Required:

```text
P1.parent_proposal_id = P0.proposal_id
P1.proposal_id ≠ P0.proposal_id
P1.baseline_fabric_digest = P0.baseline_fabric_digest
P0.status = SUPERSEDED
promoted FabricSpec unchanged
```

The geometric diff updates to P1.

P0 remains available as genealogical evidence.

MODIFY is not in-place mutation of proposal identity.

---

## 16. ACCEPT semantics

User ACCEPT means:

```text
"I authorize this exact candidate to enter the existing admission path."
```

It does NOT mean:

```text
"This candidate is authoritative."
```

Required execution:

```text
assert current_fabric_digest
       = proposal.baseline_fabric_digest

candidate :=
  NORMALIZE(
    APPLY_SEQUENCE(
      promoted FabricSpec,
      proposal.proposed_edits
    )
  )

run V3.1 DRC(candidate)

if V3.1 rejects:
  proposal cannot commit

else:
  run existing V3.2 admission

if existing V3.2 authority permits commit:
  commit candidate

if V3.2 MAYBE:
  keep proposal non-executable and visibly pending

if V3.2 NO:
  reject admission; preserve proposal evidence

if V3.2 NOT_SAME:
  do not silently substitute repaired geometry
```

---

## 17. REJECT and undo boundary

```text
REJECT(P):
  P.status := REJECTED
  promoted FabricSpec := unchanged
  runtime state := unchanged
  proposal evidence := retained
```

REJECT acts only on an uncommitted proposal.

It MUST NOT be used to retroactively undo a previously committed proposal.

Undoing committed geometry requires:

```text
NEW FabricEdit proposal
→ normal authority path
```

---

## 18. Proposal history

DEMO-002 retains session proposal history for audit and comparison.

```text
ProposalHistoryRecord := (
  proposal_seq,
  proposal_id,
  parent_proposal_id?,
  request_ref,
  baseline_fabric_digest,
  candidate_fabric_digest?,
  disposition?,
  admission_outcome?,
  commit_identity?
)
```

Purpose:

```text
compare proposer output vs user-modified output
inspect proposal genealogy
audit which geometry originated from NL
audit which geometry came from direct manipulation
```

Canonical deterministic evidence MUST use logical ordering:

```text
proposal_seq := 0,1,2,...
```

Wall-clock timestamps MAY appear in noncanonical UI logs, but MUST be excluded from deterministic proposal identity and evidence digests.

Proposal history is evidence, not canonical FabricSpec state.

---

## 19. Supported intent domain

DEMO-002 is not a general natural-language compiler.

Acceptance domain:

```text
conditional behavior proposals over the DEMO-001 game fixture
```

Required supported intents include:

```text
"Make the enemy flee when health is low."

"When the player is near, make the enemy approach."

"Disconnect the patrol consequence."

"Move the health-low branch into the functional region."
```

Equivalent phrasings MAY normalize to the same ProposalAST where explicitly declared by the conformance corpus.

---

## 20. Canonical proposal determinism

Within the supported deterministic grammar:

```text
same baseline FabricSpec
+ same normalized intent
→ same ProposalAST
→ same FabricEditAST*
→ same candidate FabricSpec
→ same proposal_id
→ same GeometricDiff
```

Equivalent raw phrasings are required to produce the same proposal only when the conformance corpus explicitly declares them equivalent.

No global synonym-completeness claim is made.

---

## 21. V3.3 boundary

V3.3 remains unchanged.

Only committed/promoted FabricSpec may execute.

Forbidden:

```text
execute IntentProposal
execute GeometricDiff
execute PROPOSED candidate
execute STALE candidate
execute GOVERNANCE_MAYBE candidate
execute REJECTED candidate
```

Runtime overlays remain inherited DEMO-001 behavior.

---

## 22. Conformance corpus

The normative DEMO-002 census remains 24 vectors.

### P — proposal construction (P01–P06)

```text
P01 supported NL IntentRequest → IntentProposal
P02 proposal_id deterministic
P03 proposal baseline digest bound to IntentRequest correctly
P04 ProposalAST → canonical FabricEditAST*
P05 candidate digest equals APPLY_SEQUENCE+NORMALIZE result
P06 proposer receipt deterministic; proposer_explanation excluded from candidate identity
```

### G — geometric diff (G01–G05)

```text
G01 added route visible and traced to CONNECT
G02 removed/disconnected relation visible
G03 MOVE represented by semantic LOCATION change, not x/y alone
G04 unchanged context excluded from semantic delta
G05 presentation rearrangement leaves GeometricDiff identity unchanged
```

`G01-EDIT-CLOSURE` is the authorized correction to v0.2. The proposer grammar
remains closed over the imported V3.1 `PLACE / MOVE / CONNECT / DISCONNECT`
surface. `GeometricDiff` may render a generic added-cell difference, but
DEMO-002 cannot originate one because V3.1 defines no `ADD_CELL` edit.

### D — disposition (D01–D06)

```text
D01 ACCEPT submits exact candidate to V3.1/V3.2
D02 ACCEPT alone does not commit
D03 MODIFY creates NOT-SAME successor proposal
D04 MODIFY preserves predecessor genealogy
D05 REJECT leaves promoted FabricSpec unchanged
D06 stale baseline prevents disposition from committing
```

### A — authority boundary (A01–A05)

```text
A01 direct proposer commit is impossible
A02 V3.1 rejection blocks commit
A03 V3.2 MAYBE remains visible and non-executable
A04 V3.2 NO leaves promoted fabric unchanged
A05 only committed candidate may enter V3.3 execution
```

### N — natural-language boundary (N01–N02)

```text
N01 declared-equivalent phrasings normalize to SAME proposal
N02 unsupported/ambiguous/malformed intent → parser MAYBE with no candidate
```

Total:

```text
6 + 5 + 6 + 5 + 2 = 24
```

UI/product assertions folded into the above vectors include:

```text
PROMOTED vs CANDIDATE text view
visible before/after diff
proposal explanation display
proposal history lineage
presentation-invariant diff identity
```

No competing 20-vector census is introduced.

---

## 23. Deterministic evidence

Each vector emits one canonical evidence artifact.

Suite emits one canonical summary.

```text
24 vectors
+ 1 summary
= 25 evidence artifacts
```

Repeated clean-process runs MUST reproduce all 25 artifacts byte-identically.

Evidence MUST include enough identity to verify:

```text
IntentRequest digest/reference
baseline digest
proposal_id
candidate digest where present
parent proposal where present
FabricEditAST identities
ProposalDisposition where present
V3.1 result where invoked
V3.2 result where invoked
commit/no-commit result
proposal_seq where applicable
```

`proposer_explanation` MAY be persisted, but must not influence candidate identity.

---

## 24. Acceptance criteria

```text
DEMO_002_VIBE_PROPOSER := HOLDS IFF

  24/24 vectors pass

  AND 25/25 evidence artifacts are byte-identical
      across repeated clean-process runs

  AND DEMO-001 imported behavior remains unchanged

  AND V3.1 / V3.2 / V3.3 remain unchanged

  AND NL_PROPOSER_DIRECT_COMMIT = FORBIDDEN

  AND pending proposals cannot execute

  AND user ACCEPT is submission authority, not commit authority

  AND MODIFY creates a new proposal identity

  AND REJECT leaves canonical fabric unchanged

  AND committed change cannot be undone by REJECT

  AND presentation layout is absent from proposal/diff identity

  AND malformed/ambiguous proposer output produces no candidate

  AND promoted/candidate text distinction is visible before commit
```

---

## 25. Non-goals

```text
NO arbitrary-language semantic completeness
NO autonomous direct commit
NO self-modifying runtime geometry
NO multiplayer determinism claim
NO game-engine integration
NO cloud collaboration
NO prompt-history authority
NO hidden repair substitution
NO training/fine-tuning requirement
NO change to DEMO-001 evidence
NO provider-specific normative dependency
NO automatic stale-proposal rebase
```

---

## 26. Implementation order

```text
1. import v0.4.0 / DEMO-001 unchanged
2. define IntentRequest
3. define ProposalContext projection
4. define ProposalAST
5. define IntentProposal
6. derive candidate FabricSpec without commit
7. define GeometricDiff
8. add candidate overlay
9. add PROMOTED/CANDIDATE text view
10. implement ACCEPT / MODIFY / REJECT
11. wire ACCEPT to existing V3.1/V3.2 path
12. enforce stale-baseline guard
13. add proposal history
14. add deterministic proposal parser
15. optionally add ExternalLLM backend behind typed parser
16. implement P/G/D/A/N vectors
17. deterministic evidence replay
18. seal binding record
```

---

## 27. Promotion boundary

Implementation success does not itself promote DEMO-002.

Required sequence:

```text
IMPLEMENT
→ VERIFY 24/24
→ REPLAY 25/25 byte-identical
→ BIND implementation/evidence hashes
→ PROMOTE by separate authority action
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
