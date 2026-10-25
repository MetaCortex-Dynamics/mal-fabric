# Section producer field trace — 2026-10-24

Scope: actual J17 producer inputs, not another incidence test. PDPE remains PROPOSE -> DECIDE -> PROMOTE -> EXECUTE. A8 separation is retained; no new authority is requested.

## Located implementation

Desktop/MaL/MaLv3/sheaf.mal SHA256 E4C25D91259A3C3E68414923552681B6C887A79F64260B957352D97485B9AE75:

- :26–30 LocaleId identifies a governance domain by content hash.
- :42–46 LocalSection contains locale, state_hash, witness_space and content_hash.
- :49–51 WitnessProjection contains witness_type and payload_hash.
- :54–65 defines canonical serialization of the supplied fields.
- :68–82 seal_local_section consumes locale, state_hash and witness_space; it computes content_hash. It is a sealer, not the g2-to-readings producer.
- :93–119 overlap_agrees restricts already supplied projections by shared witness types. It does not derive their payloads.

Desktop/MaL/MaLv3/20_sheaf.mal SHA256 63B1A7C0CB90EA841ED7B3CD07FB56414FF0BCA971433CD677F024AE767E0084:

- :5–8 names an IO/DOMAIN overlap WHAT/HOW/FOR_WHAT.
- :25–26 distinguishes syntactic co-presence from semantic payload agreement.
- endpoint_io_full.mal and endpoint_domain_full.mal seed endpoint readings. Neither reads g2 or derives a requested lift. Their hashes are 59A822133F730FDF7A9D7655C719065E7DE008B32CDC8BBEBA432217E2EA4AB2 and F752F28973414A37013718E580B528DA3BBF92D3C11BC5925CE38CFBD09400A6.

The older IO/DOMAIN interface is not silently identified with the two J17 authority participants. No seed from it is imported into the actual connection.

## Required field and supplying clause

| Field/contact | Bound clause | Actual J17 construction in inspected sources |
| --- | --- | --- |
| participant_roles; LocalSection.locale.id | A8 :19 seats stage pairs at opposite ends; JUNCTION v0.3 :417–426 declares participant roles and topology-derived typing | No inspected producer associates a particular J17 endpoint/locale identity with each stage pair. Serialized endpoint order supplies no such association. |
| LocalSection.state_hash | JUNCTION :437–442 projects committed state; sheaf :68–82 consumes its identity | g2 identity is retained, but using the whole-world artifact identity as each participant's own constitutive state identity needs the participant projection, not an automatic copy. |
| projection_typing; witness_space[*].witness_type and payload_hash | JUNCTION :426 says typing is derived from topology; :437–442 and :1005–1009 name project_local_section; sheaf :49–51 defines fields | No inspected J17 constructor maps participant, g2 and topology to these typed payloads. This is the exact content-producing operation not supplied by the sealer. |
| scoped authority grant | JUNCTION :759–761 restricts the participant to its grant | Clause requires the restriction; it does not instantiate a J17 participant/grant record. A8 stage separation is not relabeled as a fabricated grant. |
| overlap restriction | JUNCTION :420 declares overlap_specification; sheaf :93–119 restricts shared witness types | General restriction operation is located. J17's actual typed payloads and participant topology remain unconstructed. |
| section.content_hash | sheaf :54–82 | Fully specified once the above inputs are supplied. No hashing ambiguity is claimed. |

JUNCTION v0.3 SHA256 9A82BC60519DBA3793C66ED51A31501C953D4B2016F5F96D02710C6BEEB6BAB3. This trace follows the user's bound-contract direction; it does not independently promote that document or infer promotion from its filename. A8 SHA256 27C995BDB06B1AE6F87D727FFD0853AD3DF0ADEA13428D1EBF0B9A06FB0BB805.

## Search scope and result

Read sheaf.mal, 20_sheaf.mal, the endpoint seeds, 10_seat.mal and 30_admit.mal. Searched project_local_section, seal_local_section, participant_roles and AuthorityGrant in Desktop/MaL/MaLv3, software_fpga .mal sources (excluding evidence/predecessor duplicates), and mal-fabric HEAD outside the first-tick package. The located constructor is seal_local_section; junction.mal consumes the resulting section. This is a bounded finding about inspected sources, not a corpus-wide absence claim.

No complete actual section can be emitted from these inspected clauses without assigning unsupplied payload content. No generic empty section or identical copied fields are used to make overlap agree. No new GPU run was warranted for this field trace. Native DECIDE remains uninvoked; all 228 offers, g2 and prior receipts are unchanged.
