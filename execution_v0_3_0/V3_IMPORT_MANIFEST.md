# V3.1 and V3.2 Import Manifest for V3.3 Execution

```text
manifest_id: V3.3-V3.1-V3.2-IMPORT-001
obligation: O-SWFPGA-EXECUTION-1
status: BOUND
bound_by: Devon Generally
bound_date: 2026-09-11
```

## 1. Purpose

This manifest fixes the static V3.1 fabric substrate and the promoted V3.2
admissibility substrate imported by V3.3. The execution layer adds synchronous
runtime state around a fixed canonical `FabricSpec`; it does not fork,
reinterpret, weaken, or redefine either predecessor.

## 2. Immutable artifact identities

```text
v3_2_authority_commit:
  a593b595f674746a532bcd3e2de52bdf1cef9e68

v3_1_reference_kernel_sha256:
  8B983301DAD795DD9C3F020970BAD76017EF648AC0C71E3FB6FDEF3D0E4347C0

v3_1_queuegate_evidence_summary_sha256:
  16CE384323538A69627B1CFDCDDB677A3056AB5E9B3CD28E3F9B371DE82E04BB

v3_2_admission_kernel_sha256:
  89105692EEE04580DB1C98556B51D0644292B7FB7B42FA4F41EBD381CDE256DC

v3_2_queuegate_evidence_summary_sha256:
  19EE5B395B44E016A24C259674A35EA055A6DF4D33D32657A223AFCD2CF05C8B

v3_2_promotion_record_sha256:
  12B1E6C73D74B4FDF2C6FA30C4B1AF201FE8DAACC2C2E3F94AACECC9CD93460A

v3_3_normative_spec_sha256:
  5BB1497AA3D791150F0416FEDA4E393695A9302B42030ADD0A7D22C08CCBEAC0

v3_3_vector_corpus_sha256:
  846DBF4BE822C6816E788D4BCCE98F34D815D1AB870E62BDC5DEA67636E9C055

v3_3_handoff_sha256:
  7C2806E441785CE98B49476E84A311F8134BDE76AEDB39A6723826D73D94A36D
```

The reference execution kernel verifies the five predecessor file identities
at import time and fails closed on any mismatch.

## 3. Imported V3.1 surface

V3.3 imports the canonical `FabricSpec`, cell and route definitions,
`ROLE_SCHEMA`, `JOIN_SIGNATURE`, symbolic payload types, route identity,
semantic placement, `APPLY`, `NORMALIZE`, V3.1 DRC, and endpoint-derived
`TRIAD_transition`. The program component is invariant:

```text
for every t:
  Sigma_t.program = Sigma_0.program
```

V3.3 never stores a second authoritative geometry, edits a `FabricSpec`,
shadows canonicalization, or weakens V3.1 DRC.

## 4. Imported V3.2 surface

V3.3 imports the promoted V3.2 admission authority, including crossing
governance, lifecycle, diagonal and tolerance nonlaundering, repair-fiber, and
extended-DRC boundaries. Runtime governance consumes an authority decision
bound to the promoted V3.2 kernel identity. It does not submit payloads as
`FabricEdit` candidates and does not reinterpret V3.2 edit admission as
runtime payload admission.

## 5. Import law

```text
V3.3 MUST NOT modify or redefine a V3.1 object or law.
V3.3 MUST NOT modify, weaken, or bypass V3.2 authority.
V3.3 MUST NOT treat runtime payload data as a FabricEdit.
V3.3 MAY add runtime state whose program component is immutable.
V3.3 MAY record immutable V3.2-bound runtime dispositions.
```

## 6. Scope exclusions

This import grants no authority for self-modifying geometry, an external
stimulus interface, or promotion. Closed-run fixtures are seeded as initial
state and introduce no injection API.
