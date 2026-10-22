# ref012 — independent indexed reference for carrier 012 (authoring support / independent witness; not a runtime)
Source: motif_junction_table_v1.h 25AF837405F450986FBD24A425D2197BD5E5D9D4BF952F74BE43CFB992B10F64 only.
ref012.py sha256 8E350EDC5AE8EB364229E1E786943299FC9B92AADB174A924E64FB7A19A07BBF
ref012_index.json sha256 1FA1397F50DF1869CA3F31A595E0A9DB0B33C4E0257912F18F9CEB228E03FD79 (42558 bytes; sorted-key compact JSON)

Construction (pure index lookups, no serial matching; runs in well under one second):
- triads: 20 CCC (three junctions of a face) + 60 CCD (domain + two corridors adjacent around it) = 80
- flags: (vertex, edge, triad) with vertex ∈ edge ⊂ triad; 6 per triad = 480
- overlaps: flag pairs equal in two coordinates, differing in one; found by hashing (v,e), (v,t), (e,t) = 720
- incidence[j]: flags whose vertex, edge or triad contains junction j; site[j]: flags whose vertex is j

Reproduced independently from Codex RUN_RECORD_018/019 (SAME):
- site flags of J17: 12
- d_G over Ground₀ → g₁: face (4,5,9) J15 4 · J17 12 · J18 4;  face (4,8,9) J16 4 · J17 12 · J25 4
- overlaps on g₁: 708 SAME · 12 walls

Use: CONFORM Codex's indexed matcher against ref012_index.json (overlap list, incidence lists). Any NOT_SAME is a
finding about one of the two constructions, not a tie-break. Flag naming here is motif numbering: ('J',n), ('D',n).
