# FABRIC_CONFORMANCE_VECTORS.md

**Target:** `FABRIC_SPEC.md` v0.1.0-candidate-r2
**Obligation:** C4 + C5 + C8 evidence corpus
**Status:** AUTHORING COMPLETE; EXECUTION OPEN

## 0. Common conventions

Canonical cells used below:

```text
C_THIS_WHAT:
  operator = THIS
  witness  = WHAT
  triad_capability = {□G,□S,□F}

C_SAME_WHAT:
  operator = SAME/NOT-SAME
  witness  = WHAT
  triad_capability = {□S}

C_INSIDE_WHERE:
  operator = INSIDE/OUTSIDE
  witness  = WHERE
  triad_capability = {□S,□F}

C_TOGETHER_WHAT:
  operator = TOGETHER/ALONE
  witness  = WHAT
  triad_capability = {□S}
```

Every cell has:

```text
OUTPUT_SCHEMA := RESULT[EXACTLY_ONE], direction OUT
```

Input roles are exactly those in `ROLE_SCHEMA`.

For v0.1.0:

```text
TYPE_COMPAT(a,b) iff a = b
```

Expected verdicts use:

```text
IF_THEN  := admitted / holds
NO       := statically rejected
NOT_SAME := canonical results differ
```

`MAYBE` is not required by the static corpus unless an implementation exposes an unresolved non-normative extension.

---

## P01 — permitted INTERIOR placement

**Given**

```text
cell = C_THIS_WHAT
location = (
  INTERIOR(□S),
  [motif_m1, triad_t1, fabric_root]
)
```

**When**

```text
APPLY(F0, PLACE(C_THIS_WHAT, location))
→ DRC
```

**Expect**

```text
IF_THEN
placement exists
TRIAD membership = □S
```

---

## P02 — permitted directed BOUNDARY placement

**Given**

```text
cell = C_INSIDE_WHERE
triad_capability = {□S,□F}

location = (
  BOUNDARY(□S,□F),
  [motif_gate, triad_t1, fabric_root]
)
```

**Expect**

```text
IF_THEN
```

Structural capability only. No claim is made that V3.2 governance obligations are discharged.

---

## P03 — canonical containment path, depth 3

**Given**

```text
cell
→ motif_m1
→ triad_t1
→ fabric_root
```

**Expect**

```text
containment_path(cell)
=
[motif_m1, triad_t1, fabric_root]
```

---

## P04 — valid role-typed binary join

**Target**

```text
C_SAME_WHAT
ROLE_SCHEMA =
  LEFT[1], RIGHT[1]
```

**Given**

two WHAT-witness source cells, each routed from `RESULT`:

```text
source_a.RESULT → target.LEFT
source_b.RESULT → target.RIGHT
```

**Expect**

```text
role_signature(incoming_routes)
=
{LEFT[1], RIGHT[1]}

TYPE_COMPAT = HOLDS for both routes

DRC = IF_THEN
```

---

## P05 — valid canonical MANY join

**Target**

```text
C_TOGETHER_WHAT
ROLE_SCHEMA =
  MEMBER[MANY]
```

**Given**

three WHAT-witness source `RESULT` ports routed to `MEMBER`.

**Expect**

```text
DRC = IF_THEN
incoming MEMBER representation is canonical
host enumeration order does not affect NORMALIZE(F)
```

---

## P06 — presentation variants normalize SAME

**Given**

two renderings with identical canonical `FabricSpec` primitive state but different:

```text
x/y
zoom
orientation
routing curvature
viewport
```

**Expect**

```text
NORMALIZE(A) = NORMALIZE(B)
```

---

## P07 — deep containment normalization

**Given**

```text
cell_c
→ motif_m3
→ motif_m2
→ motif_m1
→ triad_t1
→ fabric_root
```

with presentation enumeration of sibling containers permuted.

**Expect**

```text
containment_path(cell_c)
=
[motif_m3,motif_m2,motif_m1,triad_t1,fabric_root]

NORMALIZE(A) = NORMALIZE(B)
```

---


## P08 — TRIAD_transition derivation from cross-region route

**Given**

```text
cell_a:
  witness = WHAT
  placement = INTERIOR(□S)

cell_b:
  witness = WHAT
  placement = INTERIOR(□F)

CONNECT(cell_a, RESULT, cell_b, compatible_input_role)
```

where source and target symbolic payload types are compatible.

**Expect**

```text
DRC = IF_THEN

TRIAD_transition(route)
=
(□S, □F)

TRIAD_transition MUST be derived from endpoint placements
TRIAD_transition MUST NOT be independently authoritative state
```


# Negative vectors

## N01 — invalid TRIAD capability

**Given**

```text
cell.triad_capability = {□S}
PLACE(cell, INTERIOR(□F))
```

**Expect**

```text
NO
BECAUSE □F ∉ triad_capability
```

---

## N02 — invalid boundary placement

**Given**

```text
cell.triad_capability = {□S}
PLACE(cell, BOUNDARY(□S,□F))
```

**Expect**

```text
NO
BECAUSE {□S,□F} ⊄ triad_capability
```

---

## N03 — cyclic containment

**Given**

```text
motif_a INSIDE motif_b
motif_b INSIDE motif_a
```

**Expect**

```text
NO
BECAUSE containment MUST be acyclic
```

---

## N04 — malformed/non-root-terminated containment

**Given**

```text
containment_path(cell) =
[motif_m1, motif_m2]
```

with no path to `fabric_root`.

**Expect**

```text
NO
BECAUSE containment MUST be root-terminated
```

---

## N05 — EXACTLY_ONE overconnection

**Target**

```text
THIS × WHAT
ROLE_SCHEMA = VALUE[1]
```

**Given**

```text
source_a.RESULT → target.VALUE
source_b.RESULT → target.VALUE
```

**Expect**

```text
NO
BECAUSE actual VALUE multiplicity = 2
AND expected VALUE multiplicity = EXACTLY_ONE
```

---

## N06 — binary role-shape violation

**Target**

```text
INSIDE/OUTSIDE × WHERE
ROLE_SCHEMA =
  INNER[1], OUTER[1]
```

**Given**

two incoming routes both target `INNER`; none target `OUTER`.

**Expect**

```text
NO
BECAUSE actual role shape
  INNER[2], OUTER[0]
NOT-SAME expected
  INNER[1], OUTER[1]
```

---

## N07 — incompatible direction

**Given**

attempted connection:

```text
target.LEFT → source.RESULT
```

where `target.LEFT` is `IN` and `source.RESULT` is `OUT`.

**Expect**

```text
NO
BECAUSE route source MUST be RESULT/OUT
AND route target MUST be an INPUT role
```

---

## N08 — incompatible symbolic payload type

**Given**

```text
source = THIS × WHAT
source.RESULT type = WITNESS_TYPE(WHAT, RESULT)

target = INSIDE/OUTSIDE × WHERE
target.INNER type = WITNESS_TYPE(WHERE, INNER)

CONNECT(source, RESULT, target, INNER)
```

**Expect**

```text
NO
BECAUSE TYPE_COMPAT requires exact symbolic type equality
AND
  WITNESS_TYPE(WHAT, RESULT)
  NOT-SAME
  WITNESS_TYPE(WHERE, INNER)
```

---

## N09 — nonexistent route endpoint

**Given**

a route references `cell_missing`.

**Expect**

```text
NO
BECAUSE every route endpoint MUST exist
```

---

## N10 — nonexistent input role

**Given**

```text
target = THIS × WHAT
CONNECT(source, RESULT, target, LEFT)
```

**Expect**

```text
NO
BECAUSE LEFT ∉ ROLE_SCHEMA(THIS)
```

---

## N11 — route identity collision

**Given**

a conformance hash stub intentionally returns the SAME `route_id` for:

```text
(a, RESULT, b, LEFT)
(c, RESULT, d, RIGHT)
```

where tuples are NOT-SAME.

**Expect**

```text
NO
BECAUSE NOT-SAME connection tuples CANNOT share semantic route identity
```

---

# Confluence vectors

Each vector runs two surface parsers against the SAME base fabric.

## C01 — PLACE confluence

```text
text:
  PLACE c1 AT INTERIOR(□S)
  INSIDE [m1,t1,root]

visual:
  drag c1 into region □S / container m1
```

**Expect**

```text
PARSE_TEXT → PLACE(c1,L)
PARSE_VISUAL → PLACE(c1,L)

NORMALIZE(APPLY(F,e_text))
=
NORMALIZE(APPLY(F,e_visual))
```

---

## C02 — MOVE confluence

```text
text:
  MOVE c1
  FROM INTERIOR(□S), [m1,t1,root]
  TO   INTERIOR(□F), [m2,t1,root]

visual:
  drag c1 from m1/□S to m2/□F
```

**Expect**

SAME canonical `MOVE` and SAME normalized candidate.

---

## C03 — CONNECT confluence

**Given**

source and target both use witness `WHAT`.

```text
text:
  CONNECT source.RESULT target.LEFT

visual:
  connect source RESULT port to target LEFT port
```

**Expect**

```text
same canonical connection tuple
same content-addressed route_id
same normalized FabricSpec
```

---

## C04 — DISCONNECT confluence

```text
text:
  DISCONNECT route_id

visual:
  delete the rendered route carrying route_id
```

**Expect**

same route removed; SAME normalized FabricSpec.

---

## C05 — presentation-only drag is semantic no-op

**Given**

visual drag changes screen coordinates but resolves to the SAME:

```text
triad_position
containment_path
```

**Expect**

```text
PARSE_VISUAL → NO semantic edit
NORMALIZE(before) = NORMALIZE(after)
```

---

## C06 — duplicate CONNECT is idempotent

**Given**

route `(a,RESULT,b,LEFT)` already exists.

**When**

the SAME connection is proposed again from either surface.

**Expect**

```text
same candidate route_id
NO structural mutation
NORMALIZE(before) = NORMALIZE(after)
```

---

# QueueGate evidence mapping

```text
C4 dual-surface confluence:
  C01–C06

C5 static DRC:
  P01–P08
  N01–N11

C8 conformance evidence:
  all vectors above require execution receipts
```

This document defines the vector obligations. It does not itself discharge them.

```text
VECTOR_AUTHORING := COMPLETE
VECTOR_CENSUS := 8 positive + 11 negative + 6 confluence = 25
VECTOR_EXECUTION := OPEN
C4 := EVIDENCE OPEN
C5 := IMPLEMENTATION EVIDENCE OPEN
C8 := EXECUTION OPEN
```

[MaL:ACTIVE | □G✓ □S✓ □F✓] ◇
