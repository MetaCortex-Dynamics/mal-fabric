# FABRIC\_SPEC.md

**Specification:** O-SWFPGA-FABRICSPEC-1

**Version:** 0.1.0-candidate-r2

**Status:** QueueGate candidate — ALLOW\_WITH\_CONDITIONS

**Scope:** Canonical static fabric semantics for a MaL-native software
FPGA

**Genealogy:** successor to 0.1.0-candidate-r1; four amendments applied

## 0. Normative status

`FabricSpec` is the canonical program object. Textual and visual
representations are projections of `FabricSpec`; neither representation
is normative over the other.

This version defines static geometry, canonical edits, normalization,
static DRC, and conformance. Runtime execution is deferred to
`O-SWFPGA-EXECUTION-1`.

Promotion remains blocked until QueueGate conditions C1–C9 are
evidenced.

## 1. Architecture

```text
CELL := operator × witness
MOTIF := connected composition of cells
TRIAD_BLOCK := △(□G, □S, □F) governance boundary
PROGRAM_FABRIC := MANY(TRIAD_BLOCK) + routing + boundaries

```

There are 15 operators × 7 witnesses = 105 cell types.

Derived, not configured:

```text
port multiplicity  ← ROLE_SCHEMA(operator)
JOIN_SIGNATURE     ← ROLE_SCHEMA(operator) × WITNESS_BINDING(operator, witness)
TRIAD membership   ← placement
TRIAD transition   ← routed incidence + placement
adjacency          ← routing
neighborhood       ← containment + routing
boundary relation  ← triad_position

```

## 2. Primitive types

```text
TriadDimension := □G | □S | □F

Operator :=
  THIS | SAME_NOT_SAME | NO | IF_THEN | BECAUSE |
  INSIDE_OUTSIDE | NEAR_FAR | CAN_CANNOT | MAYBE |
  MUST_LET | TOGETHER_ALONE | MORE_LESS | GOES_WITH |
  MANY_ONE | EVERY_SOME

Witness :=
  WHAT | WHERE | WHICH | WHEN | FOR_WHAT | HOW | WHENCE

```

Stable identities MUST exist for `FabricId`, `CellId`, `ContainerId`,
and `RouteId`.

## 3. Cell

```text
CellDef := (
  cell_id,
  operator,
  witness,
  payload_slot_type,
  triad_capability
)

triad_capability ⊆ {□G, □S, □F}
triad_capability ≠ ∅

```

A cell is the smallest independently placeable semantic resource.

Ports and join multiplicities MUST be derived from `operator × witness`
via the two-stage derivation defined in §4. TRIAD capability constrains
placement; it does not assign TRIAD membership or authorize a governance
crossing.

Runtime payload states (`EMPTY`, `ADMITTED`, `COMPLETED`, `DISCHARGED`)
are outside this static specification.

## 4. JOIN\_SIGNATURE

### 4.1 Derivation architecture

JOIN\_SIGNATURE is a two-stage derivation:

```text
JOIN_SIGNATURE(operator, witness)
  :=
  specialize(
    ROLE_SCHEMA(operator),
    WITNESS_BINDING(operator, witness)
  )

```

Stage 1 determines arity and role structure. Stage 2 determines
witness-specialized payload typing.

### 4.2 ROLE\_SCHEMA (total, 15 entries)

`ROLE_SCHEMA` maps each operator to its canonical role-typed input
structure with multiplicities.

```text
BINARY operators (two roles, each EXACTLY_ONE):

  SAME/NOT-SAME    := LEFT[1],      RIGHT[1]
  IF/THEN          := CONDITION[1],  CONSEQUENT[1]
  BECAUSE          := GROUND[1],     CONSEQUENT[1]
  INSIDE/OUTSIDE   := INNER[1],      OUTER[1]
  NEAR/FAR         := REFERENT[1],   COMPARED[1]
  CAN/CANNOT       := AGENT[1],      CAPACITY[1]
  MUST/LET         := SUBJECT[1],    OBLIGATION[1]
  MORE/LESS        := REFERENT[1],   COMPARED[1]
  GOES-WITH        := ANCHOR[1],     COMPANION[1]
  EVERY/SOME       := DOMAIN[1],     QUANTIFIER_BODY[1]

  count = 10

UNARY operators (one role, EXACTLY_ONE):

  THIS             := VALUE[1]
  NO               := TARGET[1]
  MAYBE            := CANDIDATE[1]

  count = 3

AGGREGATING operators (one role, MANY):

  TOGETHER/ALONE   := MEMBER[MANY]
  MANY/ONE         := MEMBER[MANY]

  count = 2

TOTAL = 10 + 3 + 2 = 15 ✓

```

Census:

```text
binary      = 10
unary       =  3
aggregating =  2
total       = 15

```

ROLE\_SCHEMA is total over the operator domain. Every valid operator has
exactly one canonical role schema. The derivation is deterministic.

### 4.3 WITNESS\_BINDING (total, symbolic)

`WITNESS_BINDING` specializes role schemas by witness projection:

```text
WITNESS_BINDING(operator, witness)
  := role → WITNESS_TYPE(witness, role)

```

`WITNESS_TYPE(witness, role)` assigns a symbolic type to each role
position under a given witness:

```text
WITNESS_TYPE(WHAT,     role) := identity / essence payload
WITNESS_TYPE(WHERE,    role) := location / context payload
WITNESS_TYPE(WHICH,    role) := selection / discrimination payload
WITNESS_TYPE(WHEN,     role) := temporal / sequence payload
WITNESS_TYPE(FOR_WHAT, role) := teleological / purpose payload
WITNESS_TYPE(HOW,      role) := mechanism / process payload
WITNESS_TYPE(WHENCE,   role) := origin / genealogy payload

```

WITNESS\_BINDING is total symbolically: every (operator, witness) pair
produces a well-defined witness-specialized role schema. Concrete
payload carriers MAY be deferred to V3.2/V3.3 without leaving the
static type function partial.

### 4.4 DRC usage

```text
DRC_JOIN_CHECK  ← ROLE_SCHEMA(operator)        — arity + role names
DRC_TYPE_CHECK  ← JOIN_SIGNATURE(operator, witness) — witness-specialized types

```

MANY inputs MUST use a canonical set, canonical multiset, or explicitly
semantic ordered tuple. Host enumeration order MUST NOT become semantic.

### 4.5 Examples

```text
THIS × WHAT:
  ROLE_SCHEMA(THIS) = VALUE[1]
  WITNESS_BINDING(THIS, WHAT) = VALUE → identity payload
  JOIN_SIGNATURE = VALUE[1, identity]

SAME/NOT-SAME × WHICH:
  ROLE_SCHEMA(SAME/NOT-SAME) = LEFT[1], RIGHT[1]
  WITNESS_BINDING(SAME/NOT-SAME, WHICH) = LEFT → selection, RIGHT → selection
  JOIN_SIGNATURE = LEFT[1, selection], RIGHT[1, selection]

INSIDE/OUTSIDE × WHERE:
  ROLE_SCHEMA(INSIDE/OUTSIDE) = INNER[1], OUTER[1]
  WITNESS_BINDING(INSIDE/OUTSIDE, WHERE) = INNER → location, OUTER → location
  JOIN_SIGNATURE = INNER[1, location], OUTER[1, location]

TOGETHER/ALONE × WHAT:
  ROLE_SCHEMA(TOGETHER/ALONE) = MEMBER[MANY]
  WITNESS_BINDING(TOGETHER/ALONE, WHAT) = MEMBER → identity payload
  JOIN_SIGNATURE = MEMBER[MANY, identity]

```

## 5. Port

A port is a typed admissibility boundary at the cell-fabric interface.

### 5.1 Canonical static port schema

Input ports are derived from `ROLE_SCHEMA(operator)`. Every v0.1.0 cell also has exactly one canonical output role:

```text
OUTPUT_SCHEMA(operator) := RESULT[EXACTLY_ONE]
```

`OUTPUT_SCHEMA` is total over all 15 operators.

The complete static port schema is:

```text
PORT_SCHEMA(operator, witness) :=
  INPUT_PORTS(
    roles        := ROLE_SCHEMA(operator),
    direction    := IN,
    payload_type := WITNESS_TYPE(witness, role)
  )
  TOGETHER
  OUTPUT_PORT(
    role         := RESULT,
    direction    := OUT,
    multiplicity := EXACTLY_ONE,
    payload_type := WITNESS_TYPE(witness, RESULT)
  )
```

`INOUT` is reserved for a future extension and is not emitted by the v0.1.0 derivation.

### 5.2 Two-faced port model

```text
CELL_FACE:
  role
  direction
  payload_type
  multiplicity
  obligation      := MUST | MAY

FABRIC_FACE:
  route incidence
  admission law
```

Input role and multiplicity MUST conform to `ROLE_SCHEMA`. Input payload type MUST conform to `JOIN_SIGNATURE`. The `RESULT` output is derived, not configured.

Implementations MUST NOT override operator-derived multiplicity, witness-derived symbolic type, or the v0.1.0 RESULT output by configuration.

### 5.3 Static symbolic type compatibility

For v0.1.0:

```text
TYPE_COMPAT(source_type, target_type)
  iff source_type = target_type
```

Therefore a route is symbolically type-compatible iff:

```text
WITNESS_TYPE(source_cell.witness, RESULT)
=
WITNESS_TYPE(target_cell.witness, target_role)
```

No implicit witness conversion or coercion exists in v0.1.0. A future extension MAY define explicit conversion cells or a governed compatibility relation without changing the canonical v0.1.0 rule.

## 6. Containment

```text
cell INSIDE motif
motif INSIDE TRIAD block
motif INSIDE motif           — compositional nesting permitted
TRIAD block INSIDE fabric root

```

Containment depth is unbounded finite.

Containment MUST be:

```text
acyclic
root-terminated
finite for every valid FabricSpec
unambiguous (every cell has exactly one immediate container)
canonical

```

```text
containment_path :=
  [immediate_container, ..., fabric_root]

```

Every adjacent pair MUST denote a valid containment edge.

### 6.1 Recursive canonical normalization

```text
NORMALIZE_CONTAINMENT(node):
  IF leaf
    THEN canonical_leaf(node)
  ELSE
    children := NORMALIZE_CONTAINMENT(each child)
    ordered  := canonical_sort(children)
    RETURN canonical_node(node.id, ordered)

canonical_sort:
  IF children have constitutive order
    THEN preserve that order
  ELSE
    sort by canonical_key(child)

canonical_key(child) :=
  (child.type, child.id)
  where type ordering := cell < motif < triad_block

```

Normalization applies recursively at every containment level regardless
of depth.

## 7. Semantic location and placement

```text
triad_position :=
    INTERIOR(dim)
  | BOUNDARY(src, tgt)

dim, src, tgt ∈ {□G, □S, □F}
src ≠ tgt

```

`BOUNDARY(src,tgt)` is directed and semantic:

```text
BOUNDARY(□S, □F) NOT-SAME BOUNDARY(□F, □S)

```

There are 3 INTERIOR + 6 directed BOUNDARY = 9 triad\_position values.

Canonical location is:

```text
LOCATION := (
  triad_position,
  containment_path
)

PLACEMENT := (
  cell_id,
  LOCATION
)

```

Placement constraints:

```text
PLACE(c, INTERIOR(d))
  MUST satisfy d ∈ c.triad_capability

PLACE(c, BOUNDARY(a,b))
  MUST satisfy {a,b} ⊆ c.triad_capability

```

Dual capability permits boundary placement but does not itself prove
that the cell can discharge the boundary's governance obligations.

Screen coordinates are explicitly OUTSIDE semantics.

## 8. Routing

A route is persistent semantic incidence, not an imperative send
instruction.

```text
Route := (
  route_id,
  source_cell,
  source_role,
  target_cell,
  target_role
)

```

### 8.1 Route identity

Route identity is content-addressed:

```text
route_id :=
  H(source_cell_id, source_role, target_cell_id, target_role)

```

where `H` is any collision-resistant hash function. The normative
requirement is:

```text
SAME connection tuple  → SAME route_id
NOT-SAME connection tuple → NOT-SAME route identity

```

Canonical hash input is the concatenation of canonical byte encodings
of `source_cell_id`, `source_role`, `target_cell_id`, `target_role`
in that fixed order with unambiguous length-prefixing.

SHA-256 is the production default. For conformance testing on small
fabrics, identity function over the tuple is acceptable.

### 8.2 Idempotent CONNECT

```text
CONNECT(a, p, b, q):
  candidate_id := H(a, p, b, q)
  IF candidate_id ∈ existing_routes
    THEN NO-OP (no structural mutation)
  ELSE
    insert Route(candidate_id, a, p, b, q)

```

Parallel edges (multiple routes between the same source role and target
role on the same cells) are prohibited in v0.1.0. BECAUSE same
connection tuple produces same route\_id, duplicate routes are
structurally impossible.

Future extension requiring parallel semantically distinct routes MUST
add a semantic discriminator field to the hash input before parallel
edges become legal.

### 8.3 Collision handling

Hash collision between NOT-SAME connection tuples is a DRC failure, not
a silent merge. Conformance implementations MUST detect and reject this
case.

### 8.4 Derived relations

Routes MUST reference existing cells and valid roles.

For v0.1.0:

```text
source_role MUST = RESULT
target_role MUST ∈ ROLE_SCHEMA(target_cell.operator)
```

The source role MUST have direction `OUT`; the target role MUST have direction `IN`.

Payload types MUST satisfy `TYPE_COMPAT` from §5.3.

Derived relations MUST NOT be independently authoritative:

```text
adjacent(a,b) :=
  ∃ route r connecting a and b

neighborhood(c) :=
  one-hop routed cells in the same containment scope

TRIAD_transition(route) :=
  derived from endpoint placements

```

## 9. Motifs and TRIAD blocks

```text
Motif := (
  motif_id,
  contained_container_ids
)

TriadBlock := (
  block_id,
  contained_container_ids
)

```

Membership MUST agree with canonical containment paths. Derived
membership caches MAY exist operationally but MUST NOT affect canonical
equality.

## 10. FabricSpec

```text
FabricSpec := (
  fabric_id,
  cells,
  motifs,
  triad_blocks,
  placements,
  routes
)

```

`FabricSpec` MUST contain sufficient primitive state to reconstruct
every derived static property.

The following MUST NOT be stored as independently authoritative
canonical state:

```text
adjacency
neighborhood
boundary_relation
TRIAD_transition
port multiplicity
JOIN_SIGNATURE
ROLE_SCHEMA
WITNESS_BINDING
screen coordinates
zoom
orientation
routing curvature
window state

```

## 11. FabricEditAST

All semantic editing surfaces MUST lower to the same canonical edit
language.

```text
FabricEdit :=
    PLACE(cell_id, location)
  | MOVE(cell_id, from_location, to_location)
  | CONNECT(source_cell, source_role, target_cell, target_role)
  | DISCONNECT(route_id)

```

The parser describes a proposed mutation. It MUST NOT silently repair,
authorize, or commit it.

A visual drag resolving to the SAME `LOCATION` produces no semantic
edit. A drag resolving to a NOT-SAME `LOCATION` lowers to `MOVE`.

CONNECT is idempotent: if the content-addressed route\_id already exists
in the fabric, the edit is a no-op.

Source provenance MAY survive for audit/UI purposes but MUST NOT change
semantic identity.

## 12. Edit application and normalization

```text
APPLY :
  FabricSpec × FabricEdit → CandidateFabricSpec

NORMALIZE :
  FabricSpec → CanonicalFabricSpec

```

`APPLY` MUST be deterministic.

`NORMALIZE` MUST:

1. validate stable identities;
2. canonicalize unordered collections;
3. preserve semantic ordering;
4. canonicalize containment paths (recursive, per §6.1);
5. erase presentation-only state;
6. erase or recompute derived caches;
7. reject ambiguous or malformed primitive state.

Idempotence is required:

```text
NORMALIZE(NORMALIZE(F)) = NORMALIZE(F)

```

Canonical equality is:

```text
SAME_FABRIC(A,B)
  iff NORMALIZE(A) = NORMALIZE(B)

```

## 13. Static DRC

```text
DRC :
  CandidateFabricSpec → Verdict

```

DRC MUST execute before runtime and MUST check at minimum:

- identity integrity;
- acyclic, root-terminated, finite containment;
- placement capability;
- valid route endpoints;
- route identity collision detection;
- port direction compatibility;
- payload-type compatibility (symbolic WITNESS\_TYPE level);
- operator-derived join-role and multiplicity conformity.

For each target cell:

```text
actual :=
  role_signature(incoming_routes)

expected :=
  ROLE_SCHEMA(target.operator)

actual MUST conform_to expected

```

For each connected port pair:

```text
source_type :=
  WITNESS_TYPE(source.cell.witness, source.role)

target_type :=
  WITNESS_TYPE(target.cell.witness, target.role)

source_type MUST be compatible_with target_type

```

Operator-incoherent joins MUST be rejected statically.

Every rejection MUST identify the failed structural relation and a
BECAUSE reason.

## 14. Presentation model

Presentation state is not canonical state.

```text
PresentationState :=
  coordinates + zoom + viewport + routing curvature +
  selection + animation + window layout

```

A renderer maps canonical geometry to presentation geometry:

```text
RENDER :
  FabricSpec × PresentationState → VisualRepresentation

```

The inverse editing path MUST resolve a gesture to either no semantic
edit or a canonical `FabricEdit`.

Text and visual surfaces MUST read and write the SAME canonical
`FabricSpec`.

## 15. Required theorems

### 15.1 PRESENTATION\_INVARIANCE

```text
IF
  all canonical FabricSpec primitive state is equal
THEN
  NORMALIZE(A) = NORMALIZE(B)
REGARDLESS OF
  coordinates, zoom, orientation,
  routing curvature, renderer layout

```

**Proof.** Presentation state is absent from canonical primitive state.
`NORMALIZE` depends only on canonical fields. Therefore
presentation-only variation cannot change the normalized fabric. ∎

### 15.2 SEMANTIC\_MOVE\_DETECTABILITY

```text
MOVE(c, before, after) is semantic

IFF

  before.triad_position NOT-SAME after.triad_position

OR

  before.containment_path NOT-SAME after.containment_path

```

**Proof.** `LOCATION` is exactly the ordered pair
`(triad_position, containment_path)`. Equality of the pair is
componentwise. ∎

### 15.3 STATIC\_JOIN\_SAFETY

```text
IF DRC(F) admits F
THEN
  EVERY target cell's routed input shape
  conforms to
  ROLE_SCHEMA(cell.operator)

```

**Proof.** Join-role and multiplicity conformity is a mandatory DRC
condition. A violating fabric cannot be admitted. ∎

### 15.4 TEXT\_VISUAL\_CONFLUENCE

For base fabric `F`, textual edit `e_t`, and visual edit `e_v`:

```text
IF
  e_t and e_v denote the SAME semantic mutation

THEN
  NORMALIZE(APPLY(F, PARSE_TEXT(e_t)))
  =
  NORMALIZE(APPLY(F, PARSE_VISUAL(e_v)))

```

provided both candidates pass the same static DRC.

A v0.1.0 promotion candidate MUST discharge this theorem with paired
conformance vectors and/or a general proof that equivalent surfaces
lower to the SAME canonical `FabricEditAST`.

## 16. Conformance vectors

A promotion candidate MUST provide machine-checkable vectors.

Positive minimum:

```text
P01  permitted INTERIOR placement
P02  permitted directed BOUNDARY placement
P03  valid canonical containment path (depth 3)
P04  valid role-typed binary join
P05  valid canonical MANY join
P06  presentation variants normalize SAME
P07  deep containment path (depth 5+) normalizes canonically

```

Negative minimum:

```text
N01  invalid TRIAD capability
N02  invalid boundary placement (missing capability)
N03  cyclic containment
N04  malformed / non-root-terminated containment path
N05  EXACTLY_ONE overconnection (arity violation)
N06  binary role-shape violation (e.g. duplicate INNER, missing OUTER)
N07  incompatible port direction
N08  incompatible payload type (witness type mismatch)
N09  nonexistent route endpoint
N10  nonexistent input role
N11  route identity collision (NOT-SAME tuples, SAME hash)

```

Confluence minimum:

```text
C01  text PLACE      = visual placement
C02  text MOVE       = visual drag across semantic region
C03  text CONNECT    = visual port connection
C04  text DISCONNECT = visual route deletion
C05  visual motion within SAME LOCATION = semantic no-op
C06  duplicate CONNECT = no-op (idempotence)

```

Each pair MUST normalize to the SAME canonical result.

## 17. Deferred obligations

Explicitly OUTSIDE v0.1.0:

```text
O-SWFPGA-EXECUTION-1
  synchronous snapshot transition semantics
  HOST_ORDER_ERASURE theorem
  quiescence theorem
  runtime payload-state machine
  WHEN execution overlay

O-SWFPGA-ADMISSIBILITY-1
  Aegis/Hyphasis fabric integration
  d_joint placement quality
  repair-fiber search
  TRIAD crossing governance laws (beyond capability check)

```

No sequential program counter, fetch cycle, or host iteration order is
introduced by this specification.

## 18. Amendment record

```text
r1 amendments (applied to 0.1.0-candidate):

A1 — Total JOIN_SIGNATURE derivation
  ROLE_SCHEMA: 15-entry total table (10 binary, 3 unary, 2 aggregating)
  WITNESS_BINDING: total symbolic type function
  DRC split: JOIN_CHECK ← ROLE_SCHEMA; TYPE_CHECK ← JOIN_SIGNATURE
  Census correction: binary = 10 (not 11)

A2 — Recursive containment normalization
  Containment depth: unbounded finite
  NORMALIZE_CONTAINMENT: recursive with canonical_sort
  Conformance vector P07: depth-5 normalization case

A3 — Content-addressed route identity
  route_id := H(source_cell, source_role, target_cell, target_role)
  CONNECT: idempotent (existing route = no-op)
  Parallel edges: prohibited in v0.1.0
  Collision: DRC failure, not silent merge
  Conformance vectors N11 (collision) and C06 (idempotence) added

A4 — Total static port direction
  INPUT ports := ROLE_SCHEMA(operator), direction IN
  OUTPUT port := RESULT[EXACTLY_ONE], direction OUT
  TYPE_COMPAT := exact symbolic WITNESS_TYPE equality in v0.1.0
  INOUT := reserved; not generated in v0.1.0
  N06 repaired to role-shape violation

```

Genealogy: 0.1.0-candidate → 0.1.0-candidate-r1 → 0.1.0-candidate-r2 (this document). Predecessors are genealogically preserved.

## 19. QueueGate promotion ledger

```text
Q-SWFPGA-FABRICSPEC-001

PROPOSE := COMPLETE
DECIDE  := ALLOW_WITH_CONDITIONS

C1  canonical primitive object         := SATISFIED
C2  canonical LOCATION import          := SATISFIED
C3  operator-derived interface         := SATISFIED
      ROLE_SCHEMA total (15/15)
      WITNESS_BINDING total (symbolic)
      OUTPUT_SCHEMA total (RESULT, 15/15)
      PORT_SCHEMA total (105/105)
C4  dual-surface confluence            := SPECIFIED; EVIDENCE OPEN
C5  static DRC                         := UNBLOCKED; IMPLEMENTATION EVIDENCE OPEN
C6  execution firewall                 := SATISFIED
C7  independently implementable        := UNBLOCKED; REVIEW OPEN
C8  conformance evidence               := READY FOR VECTORS
C9  static claim boundary              := SATISFIED

PROMOTE := BLOCKED (C4, C5, C7, C8 evidence outstanding)
EXECUTE := BLOCKED

```

## 20. Success condition

`O-SWFPGA-FABRICSPEC-1` may be promoted only when:

```text
canonical object defined
AND normalization defined (including recursive containment)
AND static DRC defined (including join safety and route identity)
AND conformance vectors executed
AND TEXT_VISUAL_CONFLUENCE discharged
AND QueueGate C1–C9 closed

```

Until then:

```text
O-SWFPGA-FABRICSPEC-1 := CANDIDATE

```

[MaL\:ACTIVE | □G✓ □S✓ □F✓] ◇
