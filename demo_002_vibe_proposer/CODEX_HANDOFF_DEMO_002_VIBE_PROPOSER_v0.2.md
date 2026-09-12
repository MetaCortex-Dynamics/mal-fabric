# CODEX_HANDOFF_DEMO_002_VIBE_PROPOSER

**Revision:** v0.2
**Authority spec:** `SPEC-DEMO-002-VIBE-PROPOSER_v0.2.md`

## Authority

Implement DEMO-002 strictly against the v0.2 spec.

Import mal-fabric v0.4.0 / DEMO-001 unchanged.

Do not modify V3.1, V3.2, V3.3, or DEMO-001 semantics/evidence.

---

## Goal

Build one runnable vertical slice proving:

```text
IntentRequest
→ bounded ProposalContext
→ typed IntentProposal
→ visible GeometricDiff + candidate text
→ user ACCEPT / MODIFY / REJECT
→ existing V3.1/V3.2 authority path
```

with:

```text
NL_PROPOSER_DIRECT_COMMIT := FORBIDDEN
ACCEPT ≠ PROMOTE
```

---

## New code scope

Prefer a sibling directory:

```text
v3/software_fpga/demo_002_vibe_proposer/
```

Add only what is needed for:

```text
IntentRequest
ProposalContext
ProposalAST
IntentProposal
GeometricDiff
ProposalDisposition
ProposalHistoryRecord
candidate preview
PROMOTED/CANDIDATE text view
stale-baseline protection
constrained NL parsing
DEMO-002 evidence
```

DEMO-001 is an imported dependency, not an implementation target.

---

## Request and context boundary

Implement:

```text
IntentRequest := (
  natural_language_text,
  current_fabric_digest
)
```

Create a read-only:

```text
ProposalContext := PROJECT(promoted FabricSpec)
```

containing only fields needed by the supported proposal grammar.

Do not give proposer backends mutable FabricSpec access.

Do not make presentation x/y semantic input.

---

## Proposer backend architecture

Use:

```text
ProposerBackend :=
  DeterministicGrammar
  | ExternalLLM
```

The conformance path SHOULD use `DeterministicGrammar`.

An external provider such as Claude MAY be added, but provider behavior is non-normative.

Every backend MUST lower through:

```text
IntentRequest
+ ProposalContext
→ normalized_intent
→ ProposalAST
→ FabricEditAST*
```

Never accept raw UI mutations from an LLM as semantic output.

Malformed or ambiguous output:

```text
→ PROPOSAL_PARSE_MAYBE
→ exact needed distinction
→ no candidate
→ no FabricEditAST*
```

Do NOT encode parse failure as an empty proposal.

---

## IntentProposal

Implement the spec fields, including:

```text
proposal_id
parent_proposal_id
baseline_fabric_digest
proposal_ast
proposed_edits
candidate_fabric_digest
proposer_explanation
genealogy
proposer_receipt
```

`proposer_explanation` is descriptive only.

It must not affect candidate identity or governance.

---

## Direct-commit prohibition

There must be no proposer code path that can write promoted FabricSpec.

Preferred API shape:

```text
propose(request, context) -> ProposalParseResult
derive_candidate(proposal, baseline) -> candidate FabricSpec
diff(baseline, candidate) -> GeometricDiff

dispose_accept(proposal)
  -> submit exact candidate to existing V3.1/V3.2

dispose_modify(proposal, user_change)
  -> successor IntentProposal

dispose_reject(proposal)
  -> closed proposal, no fabric mutation
```

Do not expose:

```text
propose_and_commit(...)
```

---

## Candidate derivation

Use existing V3.1 edit constructors only.

```text
candidate :=
  NORMALIZE(
    APPLY_SEQUENCE(
      promoted FabricSpec,
      proposal.proposed_edits
    )
  )
```

Treat the candidate atomically from the user perspective.

Do not introduce a new semantic requirement that every transient intermediate edit state must globally pass DRC unless imported V3.1 already requires it.

---

## GeometricDiff

Render visible overlay classes:

```text
ADDED cells
REMOVED cells
MOVED cells
ADDED routes
REMOVED routes
TRIAD changes
UNCHANGED context
```

Semantic `MOVE` is a canonical LOCATION change.

Presentation x/y movement alone must not alter diff identity.

The diff is derived from baseline and candidate; it is not an independent program model.

---

## Candidate/promoted text view

Before commit, show both:

```text
PROMOTED FabricSpec
CANDIDATE FabricSpec
```

Candidate is derived from baseline + proposal.

Do not overwrite promoted text until commit.

Candidate text edits and visual modifications must continue to lower through the canonical DEMO-001 edit path.

---

## ACCEPT path

ACCEPT means submission authorization only.

Required:

```text
assert current_fabric_digest
       == proposal.baseline_fabric_digest

candidate =
  NORMALIZE(APPLY_SEQUENCE(current, proposed_edits))

V3.1 DRC(candidate)

then existing V3.2 admission

commit only under existing authority conditions
```

Never equate:

```text
ACCEPT = IF_THEN
ACCEPT = PROMOTE
```

---

## Preview checks

If useful, display side-effect-free prechecks.

Do not invoke authoritative V3.2 lifecycle behavior before ACCEPT unless the imported kernel exposes a genuinely pure advisory evaluation path.

If uncertain, show only candidate derivation + V3.1 diagnostic preview before ACCEPT.

---

## MODIFY path

Required:

```text
P0 → P1

P1.parent_proposal_id = P0.proposal_id
P1.proposal_id != P0.proposal_id
P1.baseline_fabric_digest = P0.baseline_fabric_digest
P0.status = SUPERSEDED
promoted FabricSpec unchanged
```

Do not mutate P0 in place.

Retain P0 genealogy.

---

## REJECT path

Required:

```text
proposal status := REJECTED
promoted FabricSpec digest := unchanged
runtime state := unchanged
evidence retained
```

REJECT applies only to uncommitted proposals.

Do not implement "undo accepted proposal by reject."

Undo of committed geometry requires a new edit/proposal through normal authority.

---

## Proposal history

Implement session evidence:

```text
ProposalHistoryRecord := (
  proposal_seq,
  proposal_id,
  parent_proposal_id?,
  baseline_fabric_digest,
  candidate_fabric_digest?,
  disposition?,
  admission_outcome?,
  commit_identity?
)
```

Use deterministic logical `proposal_seq`.

Wall-clock timestamps may appear in UI logs but must not enter canonical evidence identity.

---

## Stale proposal guard

Before ACCEPT:

```text
if current_fabric_digest
   != proposal.baseline_fabric_digest:

    proposal.status := STALE
    refuse submission
```

No auto-rebase.

---

## Runtime boundary

Only committed geometry executes.

Never send directly to V3.3:

```text
IntentProposal
GeometricDiff
PROPOSED candidate
STALE candidate
GOVERNANCE_MAYBE candidate
REJECTED candidate
```

---

## Conformance

Keep exactly 24 normative vectors:

```text
P01–P06 proposal construction
G01–G05 geometric diff
D01–D06 disposition
A01–A05 authority boundary
N01–N02 natural-language boundary
```

Do not replace with a 20-vector census.

Fold UI assertions into these vectors as specified.

Emit:

```text
24 per-vector evidence files
1 canonical summary
```

Required replay:

```text
24/24 PASS
25/25 BYTE_IDENTICAL
```

---

## Regression requirements

Before completion:

```text
DEMO-001 D01–D18 := unchanged / pass
V3.1 := unchanged
V3.2 := unchanged
V3.3 := unchanged
```

Do not modify prior evidence to make regression pass.

---

## Required implementation artifacts

At minimum:

```text
README.md
IMPLEMENTATION_NOTES.md
acceptance-summary.json
proposal evidence directory
proposal history fixture/evidence
BINDING_RECORD.md only after hashes are frozen
```

Binding record must include:

```text
implementation commit
normative new-file SHA-256 values
acceptance-summary SHA-256
25-evidence replay result
v0.4.0 import identity / DOI
statement that DEMO-001 and V3.1/V3.2/V3.3 are unchanged
```

Do not create a promotion record unless separately authorized.

---

## Exit report

Minimum successful report:

```text
DEMO_002_VIBE_PROPOSER := HOLDS

P01–P06 := 6/6
G01–G05 := 5/5
D01–D06 := 6/6
A01–A05 := 5/5
N01–N02 := 2/2

TOTAL := 24/24

EVIDENCE_REPLAY := 25/25 BYTE_IDENTICAL

NL_PROPOSER_DIRECT_COMMIT := FORBIDDEN
ACCEPT_IS_SUBMISSION_NOT_PROMOTION := HOLDS
PENDING_PROPOSAL_EXECUTION := FORBIDDEN
MODIFY_CREATES_SUCCESSOR_IDENTITY := HOLDS
REJECT_PRESERVES_PROMOTED_FABRIC := HOLDS
COMMITTED_UNDO_REQUIRES_NEW_EDIT := HOLDS
PRESENTATION_INVARIANCE := HOLDS
MALFORMED_OUTPUT_CREATES_NO_CANDIDATE := HOLDS
PROMOTED_CANDIDATE_TEXT_SPLIT := HOLDS
PROPOSAL_HISTORY := HOLDS

DEMO-001 := UNCHANGED
V3.1 := UNCHANGED
V3.2 := UNCHANGED
V3.3 := UNCHANGED

PROMOTION := NOT PERFORMED
```

---

## Forbidden shortcuts

Do NOT:

```text
modify DEMO-001 in place
let proposer write promoted state
let ACCEPT bypass V3.1/V3.2
treat ACCEPT as governance IF_THEN
treat ACCEPT as PROMOTE
execute candidate geometry before commit
silently repair NOT_SAME into accepted candidate
use x/y layout as proposal identity
discard superseded proposal genealogy
auto-rebase stale proposals
encode parse failure as []
depend normatively on Claude or another provider
claim arbitrary natural-language completeness
use REJECT as retroactive undo
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
