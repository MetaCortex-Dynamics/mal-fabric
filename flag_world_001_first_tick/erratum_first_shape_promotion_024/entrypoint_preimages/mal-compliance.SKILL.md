---
name: mal-compliance
description: |
  Monitor and report MaL (Mathematics-as-Language) framework compliance throughout conversations. Use when: (1) user asks about framework status, (2) user requests compliance check, (3) conversation exceeds 5 turns and verification is due, (4) detecting potential drift from established constraints. Provides self-verification, drift detection, and compliance reporting for MaL-structured sessions.
---

# MaL Compliance Monitoring

## Compliance Reporting Protocol

### Response Header (when MaL active)

Begin substantive responses with status block:

```
---
MaL: [ACTIVE | PARTIAL | DRIFT]
□G: [OK | WARN: reason]
□S: [OK | WARN: reason]
□F: [OK | WARN: reason]
---
```

### Status Definitions

| Status | Meaning |
|--------|---------|
| `ACTIVE` | Full framework compliance, all constraints satisfied |
| `PARTIAL` | Framework engaged but one or more constraints relaxed |
| `DRIFT` | Framework deviation detected, explanation required |

### Constraint Status

| Constraint | OK when | WARN when |
|------------|---------|-----------|
| □G (Genealogical) | Origin/lineage preserved, commitments tracked | Prior decisions orphaned, provenance lost |
| □S (Structural) | Terms stable, format preserved, dependencies maintained | Silent redefinition, structure violated |
| □F (Functional) | Behavioral floor satisfied, invariants hold | Output violates established constraints |

### Response Footer

End with single-character compliance marker:

- `◇` — Full compliance (MaL: ACTIVE, all □ OK)
- `◆` — Partial compliance (MaL: PARTIAL or any □ WARN)
- `✗` — Not applied (casual mode, simple queries)

## Self-Verification Procedure

Before responding, execute:

```
VERIFY □G:
  - Is response consistent with conversation origin?
  - Are prior commitments honored or explicitly revised?
  - Is provenance maintained for claims?

VERIFY □S:
  - Have any terms changed meaning? If so, declared?
  - Is structural format consistent with established pattern?
  - Are dependencies preserved?

VERIFY □F:
  - Does output satisfy declared constraints?
  - Would this response violate any established rules?
  - Is behavioral floor maintained?

IF any verification fails:
  → Declare explicitly before proceeding
  → Set status to PARTIAL or DRIFT
  → Explain in WARN field
```

## Drift Detection

### Red Flags (auto-trigger DRIFT status)

- Terms redefined without declaration
- Prior constraints ignored without acknowledgment
- Format changes without explanation
- "I don't have access to previous conversation" in MaL session
- Generic boilerplate replacing structured output
- Hedging increase without cause

### Recovery Procedure

When DRIFT detected:

1. Declare: `[MaL:DRIFT] — [specific issue]`
2. State last known good state
3. Propose re-anchoring or request clarification
4. Do not proceed as if framework intact

## Compliance Check Injection

User can verify framework status at any time:

> `[MaL status?]` or `[Framework check]`

Response must include:
- Current MaL status
- Each constraint's state with evidence
- Turn count since last full verification
- Any accumulated drift warnings

## Suppression Rules

Suppress compliance header/footer when:

- Conversation explicitly marked casual
- User requests minimal formatting
- Response is single factual answer
- User says "skip compliance" or equivalent

Resume compliance reporting on:

- Any structured request
- User asks for status
- Conversation returns to substantive MaL work

## Integration

Works with:
- **mal-prompting**: Structures requests, this skill monitors compliance
- **User preferences**: Inherits base MaL protocol settings
- **Memory**: Compliance state persists via memory edits if needed
