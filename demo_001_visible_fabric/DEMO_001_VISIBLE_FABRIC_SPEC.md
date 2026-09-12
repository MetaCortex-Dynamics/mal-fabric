# DEMO_001_VISIBLE_FABRIC_SPEC.md

**Demo:** DEMO-001 — Visible Fabric
**Status:** BUILD AUTHORIZED
**Purpose:** Demonstrate that a user can describe behavior, see canonical program geometry, manipulate it directly, and change behavior without editing generated source code.

## 0. Thesis

```text
NL intent
  → proposed FabricSpec
  → visible geometry
  → user manipulation
  → canonical FabricEdit
  → V3.1 normalize / DRC
  → V3.2 governed admission
  → V3.3 execution
  → visible WHEN overlay
```

The demo succeeds iff the user changes behavior geometrically while the text surface remains the SAME canonical program object.

## 1. Fixed imports

```text
V3.1 := canonical static fabric
V3.2 := governed admission
V3.3 := synchronous execution
```

MUST NOT redefine any of the three layers.

## 2. Demo behavior

```text
IF player_near
THEN enemy_approach

IF health_low
THEN enemy_flee

ELSE patrol
```

The game rendering is non-normative. The normative object is the FabricSpec implementing this behavior.

## 3. Required surfaces

### 3.1 Visual canvas

MUST render:
```text
cells
operator × witness type
derived ports
routes
semantic containers / TRIAD regions
selection
candidate edits
runtime payload phase
```

MUST support:
```text
PLACE
MOVE
CONNECT
DISCONNECT
```

A visual drag preserving canonical LOCATION is presentation-only.
A drag changing LOCATION lowers to canonical MOVE.

### 3.2 Text surface

MUST display a textual serialization of the SAME canonical FabricSpec.

Equivalent text and visual edits MUST lower to the SAME FabricEditAST.

### 3.3 Natural-language surface

For DEMO-001 the NL layer MAY be deterministic or template-driven.

```text
NL request
  → proposed FabricEdit*
  → candidate FabricSpec
```

The proposer MUST NOT directly mutate promoted state.

```text
NL layer := PROPOSER
NOT := AUTHORITY
```

Candidate geometry MUST be previewed before commit.

## 4. Canonical object law

```text
ONE FabricSpec
MANY surfaces
```

CANNOT implement:
```text
visual model + converter + text model
```

MUST implement:
```text
visual ─┐
text   ─┼→ SAME FabricSpec
NL     ─┘
```

## 5. Visual semantics

Presentation-only:
```text
x/y
zoom
viewport
route curvature
selection
camera position
```

Canonical:
```text
cell identity
operator
witness
ports
LOCATION
containment
routes
TRIAD position
```

Presentation state MUST NOT enter canonical equality or evidence digests.

## 6. Runtime overlay

Render:
```text
EMPTY
ADMITTED
COMPLETED
DISCHARGED
```

Also render:
```text
RUNNING
HALTED
BLOCKED
```

and canonical BlockedReason where applicable.

The overlay MUST NOT mutate semantic geometry.

## 7. Edit path

```text
surface action
  → FabricEditAST
  → APPLY
  → NORMALIZE
  → V3.1 DRC
  → V3.2 admission
  → commit iff authorized
```

V3.3 execution begins only after the fabric edit is admitted.

## 8. Candidate preview

Candidate edit states:
```text
PROPOSED
ADMITTED
REJECTED / MAYBE
```

For MAYBE:
```text
candidate remains visible
execution authority := NO
evidence obligation := visible
```

## 9. Minimal UI

```text
┌────────────────────────────────────────────────────┐
│ NL prompt / proposer                              │
├───────────────────────┬────────────────────────────┤
│   VISUAL FABRIC       │   TEXT / CANONICAL VIEW   │
│   cells + routes      │   SAME FabricSpec         │
│   TRIAD regions       │   SAME edits              │
│   WHEN overlay        │                            │
├───────────────────────┴────────────────────────────┤
│ DRC / admission / run status / evidence           │
└────────────────────────────────────────────────────┘
```

## 10. Demo script

1. User describes:
```text
Make the enemy approach when the player is near,
but flee when health is low.
```

2. System proposes a fabric.

3. Canvas renders candidate geometry; text pane renders the SAME candidate FabricSpec.

4. V3.1 + V3.2 evaluate the candidate.

5. If admitted, commit. If MAYBE/NO/NOT_SAME, show exact reason.

6. V3.3 executes and shows WHEN wavefront plus RunStatus.

7. User changes one semantic relation visually.

8. Visual action lowers to FabricEdit; text updates immediately.

9. Re-run and show changed behavior.

## 11. Acceptance tests

```text
D01 NL proposal produces valid candidate FabricSpec
D02 visual PLACE lowers to canonical PLACE
D03 semantic drag lowers to canonical MOVE
D04 cosmetic drag within SAME LOCATION → no semantic mutation
D05 visual CONNECT lowers to canonical CONNECT
D06 visual DISCONNECT lowers to canonical DISCONNECT
D07 equivalent text + visual edit → SAME normalized FabricSpec
D08 invalid visual route → V3.1 DRC rejection visible
D09 V3.2 MAYBE → candidate visible, execution blocked
D10 V3.2 NO → candidate rejected with BECAUSE
D11 admitted fabric executes under V3.3
D12 runtime overlay displays payload phases
D13 BLOCKED displays canonical reason
D14 HALTED distinguished from BLOCKED
D15 visual edit changes text serialization immediately
D16 text edit changes visual geometry immediately
D17 presentation-only x/y changes → SAME canonical digest
D18 repeated run from SAME initial state → SAME canonical result/evidence
```

## 12. Success criterion

```text
DEMO-001 := HOLDS IFF

  user can:
    describe behavior
    see behavior as geometry
    manipulate geometry
    execute changed behavior

  AND user never needs to edit generated source code

  AND text + visual remain confluent over one FabricSpec

  AND V3.1/V3.2/V3.3 boundaries remain intact
```

## 13. Non-goals

```text
NO production game-engine plugin
NO Unreal integration
NO Unity integration
NO multiplayer determinism claim
NO self-modifying geometry
NO general-purpose NL compiler
NO collaborative editing
NO persistence/cloud backend
NO performance optimization
```

## 14. Preferred implementation order

```text
1. canonical in-memory FabricSpec adapter
2. read-only visual renderer
3. visual PLACE/MOVE/CONNECT/DISCONNECT
4. text serialization + edit round-trip
5. V3.1 DRC feedback
6. V3.2 admission feedback
7. V3.3 execution + WHEN overlay
8. NL proposer
9. scripted demo fixture
10. acceptance tests D01–D18
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
