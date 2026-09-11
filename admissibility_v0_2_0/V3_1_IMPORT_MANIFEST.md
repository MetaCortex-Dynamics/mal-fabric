# V3.1 Import Manifest for V3.2 Admissibility

```text
manifest_id: V3.2-V3.1-IMPORT-001
obligation: O-SWFPGA-ADMISSIBILITY-1
status: BOUND
bound_by: Devon Generally
bound_date: 2026-09-10
```

## 1. Purpose

This manifest fixes the V3.1 surface imported by V3.2. V3.2 extends the
admission analysis applied after V3.1 static design-rule checking. It does not
fork, reinterpret, weaken, or redefine V3.1.

## 2. Immutable artifact identities

```text
upstream_implementation_commit:
  cb69ed7a38749a00084aa815a65e01bbfd88aee6

publication_commit:
  21b4e65e58600c45ef777fbf8394348018f83594

publication_tag:
  v0.1.0

publication_tag_object:
  364c1497b1f05c33dc931783c781ff8acb2b1979

source_spec_sha256:
  E328B574DE32635358AC488C4C5E20E80E86A845EB154401C8E1A7C0DD8D68F1

source_vector_corpus_sha256:
  1A9E6E33BCCB0A39AC8626CBBF65C112D80B9A7D5C550A83F9700545C8C5161F

reference_kernel_sha256:
  8B983301DAD795DD9C3F020970BAD76017EF648AC0C71E3FB6FDEF3D0E4347C0

queuegate_evidence_summary_sha256:
  16CE384323538A69627B1CFDCDDB677A3056AB5E9B3CD28E3F9B371DE82E04BB

software_version_doi:
  10.5281/zenodo.22678128

software_concept_doi:
  10.5281/zenodo.22678127

paper_version_doi:
  10.5281/zenodo.22677712

paper_concept_doi:
  10.5281/zenodo.22677711

v3_2_normative_spec:
  FABRIC_ADMISSION_PIPELINE_SPEC_v0.2.0-candidate-r2.md

v3_2_normative_spec_sha256:
  DF253688DA9DED75D59793BC88C13F33365ECD6EE2D24F090E0DFED43AADDABC
```

## 3. Imported canonical objects

V3.2 imports the following definitions exactly:

```text
FabricSpec := (
  fabric_id,
  cells,
  motifs,
  triad_blocks,
  placements,
  routes
)

CellDef := (
  cell_id,
  operator,
  witness,
  payload_slot_type,
  triad_capability
)

LOCATION := (
  triad_position,
  containment_path
)

triad_position :=
    INTERIOR(dimension)
  | BOUNDARY(source_dimension, target_dimension)

FabricEdit :=
    PLACE(cell_id, location)
  | MOVE(cell_id, from_location, to_location)
  | CONNECT(source_cell, source_role, target_cell, target_role)
  | DISCONNECT(route_id)
```

There is no separate canonical edit-AST type. Text and visual edit surfaces
lower directly to `FabricEdit`. A gesture that denotes no semantic change
produces no `FabricEdit`.

## 4. Imported functions and laws

```text
APPLY:
  FabricSpec x FabricEdit -> CandidateFabricSpec

NORMALIZE:
  FabricSpec -> CanonicalFabricSpec

DRC:
  CandidateFabricSpec -> Verdict

ROLE_SCHEMA:
  Operator -> RoleSchema
  total over all 15 operators

WITNESS_BINDING:
  Operator x Witness -> PayloadTyping
  total symbolically

OUTPUT_SCHEMA:
  Operator -> RESULT[EXACTLY_ONE]

route_id:
  H(source_cell, source_role, target_cell, target_role)

TRIAD_transition(route):
  derived from endpoint placements
```

V3.2 also imports the following V3.1 laws:

- `NORMALIZE` is idempotent.
- Presentation-only changes do not change canonical fabric identity.
- Semantic moves are exactly changes to canonical `LOCATION`.
- A DRC-admitted fabric has statically safe joins.
- Equivalent text and visual edits converge through the shared edit model.
- `CONNECT` is idempotent for an existing content-addressed route.
- `TRIAD_transition` is derived and is never independently authoritative
  route state.

## 5. Imported DRC floor

The eight V3.1 DRC condition classes remain mandatory:

1. identity integrity;
2. finite, acyclic, root-terminated containment;
3. placement capability;
4. valid route endpoints;
5. route-identity collision detection;
6. port-direction compatibility;
7. symbolic payload-type compatibility;
8. join role and multiplicity conformity.

V3.2 admission is reachable only after these conditions admit the normalized
candidate.

## 6. Import law

```text
V3.2 MUST NOT redefine an imported V3.1 object.
V3.2 MUST NOT weaken an imported V3.1 DRC condition.
V3.2 MUST NOT treat a V3.1 DRC rejection as an admission rejection.
V3.2 MAY add derived properties over (F, e, F').
V3.2 MAY add post-DRC admission conditions.
V3.2 MAY attach non-authoritative audit provenance.
```

## 7. Scope exclusions

The import does not authorize payload execution, synchronous ticks, `WHEN`
semantics, quiescence, or `HOST_ORDER_ERASURE` claims. Those remain outside
V3.2.
