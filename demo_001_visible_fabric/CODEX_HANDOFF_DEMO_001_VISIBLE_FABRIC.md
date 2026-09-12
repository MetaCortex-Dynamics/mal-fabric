# CODEX_HANDOFF_DEMO_001_VISIBLE_FABRIC.md

## Authority

Build DEMO-001 against `DEMO_001_VISIBLE_FABRIC_SPEC.md`.

Existing V3.1, V3.2, and V3.3 kernels are normative and MUST remain unchanged.

## Goal

```text
one NL request
→ visible FabricSpec
→ user manipulates geometry
→ canonical edit
→ governed admission
→ execution
→ visible runtime state
```

## Hard architecture rule

Exactly ONE canonical semantic object:

```text
visual ─┐
text   ─┼→ FabricSpec
NL     ─┘
```

Do not build separate visual and textual program models.

## Required UI

Minimum panes:
```text
1. prompt/proposal pane
2. visual fabric canvas
3. textual canonical FabricSpec pane
4. status/evidence pane
```

## Visual renderer

Render:
```text
CellDef
operator × witness label
derived ports
routes
TRIAD region / containment
candidate state
payload-state overlay
```

Screen coordinates are presentation-only.

## Editing

Implement:
```text
PLACE
MOVE
CONNECT
DISCONNECT
```

Every semantic gesture MUST lower to existing canonical FabricEdit.

Do not invent GUI-specific semantic edits.

## NL proposer

For the first demo, use the smallest reliable approach.

Acceptable:
```text
deterministic intent templates
or
LLM proposer if already available
```

Normative:
```text
proposal only
NO direct authority
```

The user must see candidate geometry and admission result before executable commit.

## Demo fixture

```text
player_near → enemy_approach
health_low  → enemy_flee
otherwise   → patrol
```

Keep game simulation minimal.

## Runtime

Use V3.3.

Show:
```text
EMPTY
ADMITTED
COMPLETED
DISCHARGED

RUNNING
HALTED
BLOCKED
```

Show canonical BlockedReason when applicable.

## Required invariants

```text
V3.1 unchanged
V3.2 unchanged
V3.3 unchanged

text/visual same canonical FabricSpec
presentation x/y excluded from canonical digest
candidate edits pass V3.1 + V3.2 before commit
runtime uses V3.3 only after admission
```

## Acceptance tests

Implement D01–D18 from the demo spec.

Minimum exit report:
```text
DEMO_001_VISIBLE_FABRIC := HOLDS

D01–D18 := 18/18

V3_1_IMPORT := UNCHANGED
V3_2_IMPORT := UNCHANGED
V3_3_IMPORT := UNCHANGED

TEXT_VISUAL_CONFLUENCE := HOLDS
PRESENTATION_INVARIANCE := HOLDS
NL_PROPOSER_AUTHORITY := NONE
RUNTIME_OVERLAY := HOLDS

DEMO_SCRIPT := RUNNABLE
```

## Forbidden shortcuts

Do NOT:
```text
store semantic x/y coordinates
generate text then separately regenerate visual graph
allow visual graph to diverge from text model
bypass V3.1 DRC
bypass V3.2 admission
rerun V3.2 FabricEdit admission on runtime payloads
invent V3.3 semantics
claim multiplayer determinism
```

## Deliverables

```text
demo source
README with exact run command
scripted demo fixture
D01–D18 test runner
implementation notes
```

If repository structure makes an import path ambiguous, preserve semantics and report the exact ambiguity rather than recreating V3.1–V3.3 logic.

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
