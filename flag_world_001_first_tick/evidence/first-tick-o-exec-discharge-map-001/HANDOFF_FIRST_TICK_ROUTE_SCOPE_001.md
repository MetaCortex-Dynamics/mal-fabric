# First-tick handoff — route coverage and independent-witness custody

```text
RECORD := HANDOFF_FIRST_TICK_ROUTE_SCOPE_001 v0.1.0
DATE := 2026-10-22
STATUS := OBSERVED SCOPE / REPORTED REVIEW; no new law
AUTHORITY := Codex records evidence; Devon holds DECIDE / PROMOTE
CHANGE := handoff only; no realization, spec, expected-byte or map change
```

## Reviewed map retained

The reviewed [discharge map](DISCHARGE_MAP_001_PROPOSED.md) remains PROPOSED, byte-for-byte:

| File | Bytes | SHA-256 |
|---|---:|---|
| `DISCHARGE_MAP_001_PROPOSED.md` | 14790 | `B3DF7A97852FCE3DB07A9B3F5503194CDA6C88578C722EA4B2A8EB544D0313A6` |
| `DISCHARGE_MAP_001_PROPOSED.json` | 20481 | `150F1FA95B7488CE671835AB48517ED4D92C02D7506FB38B381C45141E884A0F` |

Its dispositions remain four bounded V1/V2 discharge entries and `O_JTP_OBLIGATION_CONSTRUCTION = MAYBE`. `O_exec = {}` is not declared. The review supplied in this conversation supports those dispositions; its conditional language is not recorded as a DECIDE or PROMOTE act. The reported project review file is not locally hash-bound here.

The already promoted V1/V2 CONFORM result remains IF_THEN. The GPU self-witness record changes the game-world commit boundary, not the entire JTP construction obligation. Retained JTP source and hashes remain custody, not evidence that the retained construction executed in the successful vector source.

## Scope to carry into the next J17 run

**V1/V2 exercised the empty-route case. They did not exercise non-empty route propagation or route-endpoint DRC (iv).** The 720 cell-DRC results must not be reported as 720 route-endpoint checks. Likewise, the 1440 ingress bindings/route identities must not be reported as a non-empty internal-route inventory.

BECAUSE the bound source expressly emits a canonical program with `routes = ARRAY(NIL)`, its propagation law requires that empty list and returns `I20_ROUTE_RESULTS(..., NIL)`. This is the executed source condition, not an inferred bypass or a proposed repair.

Evidence paths below are relative to repository root:

```text
R := review/first-tick-conform-v1-v2-001/files/realization020/
```

| Evidence | Bound clause / observed result |
|---|---|
| `R/source/program_core.mal:27` | `THIS(P20_DECLARED_ROUTES,NIL)` |
| `R/source/program_core.mal:85-86` | `P20_CELL_DRC` produces `STATIC_CELL_CHECK(def,place,motif,CONTAINMENT_PATH(m,b,p))`; no route endpoint is an operand of this construction. |
| `R/source/program_core.mal:109-112` | Normalization requires the declared empty route list; the serialized canonical program includes `MEMBER("routes",ARRAY(NIL))`. |
| `R/source/program_core.mal:117-124` | Exports `SF_PROGRAM(p,cs,NIL)` and `P20_NO_INTERNAL_ROUTES(p)`. |
| `R/source/ingress_core.mal:143-150` | Stage 3 requires `SF_PROGRAM(p,cells,NIL)` and `P20_NO_INTERNAL_ROUTES`; propagation yields NIL. Stage 4 carries the corresponding auxiliary collections. |
| `R/source/ingress_core.mal:152-162` | Stage 5 records completion and simultaneous `STEP_FABRIC_RETURN`; the empty completion-evidence set is explicitly sourced from the empty program route list. |

Both final vector status records report:

| Predicate | V1 | V2 | Scope |
|---|---:|---:|---|
| `P20_TYPED_CELL` | 720 | 720 | Materialized comparator occurrences |
| `P20_CELL_DRC` | 720 | 720 | Cell/schema/placement/motif/containment evidence, not route-endpoint evidence |
| `P20_NO_INTERNAL_ROUTES` | 1 | 1 | Empty canonical internal-route inventory |
| `I20_INGRESS_BINDING` | 1440 | 1440 | Ingress associations, not internal propagation |
| `I20_ROUTE_ID` | 1440 | 1440 | Ingress identity construction, not evidence of propagated routes |
| `I20_FRAME` | 720 | 720 | Input frames |
| `I20_CELL_RESULT` | 720 | 720 | Evaluated cell results |
| `I20_RUNTIME_RECEIPT` | 1440 | 1440 | Runtime receipts, not route-endpoint checks |
| `STEP_FABRIC_RETURN` | 1 | 1 | Simultaneous returned successor |
| `I20_COMMITTED_AGREEMENT` | 720 | 720 | Agreement readings from that successor |

The next J17-world step/marker-route work must retain this coverage boundary. Its non-empty routing and endpoint evidence, if produced, will be new evidence; V1/V2 do not discharge it in advance. This handoff neither adds a vector to CONFORM nor implements or promotes any route. The promoted result's J17, marker-route and placement exclusions stand.

## Exact evidence identities

| File | SHA-256 |
|---|---|
| `R/source/program_core.mal` | `074C3E00794D6D3EFB9020CCE3A5600606851677AE25B7E1D6D65457ED663D82` |
| `R/source/ingress_core.mal` | `1711AFA95ED0FC5F09F5AD97B6841D57020EFDC2E7A9DB50472912CF21979E3C` |
| `R/parallel_prefill_002/vectors_repeat_008/V1/stage14/STATUS.json` | `413D72B169CF4A9522EAF51394822F3541038E1A3FD79F39356C064BA4BBEC19` |
| `R/parallel_prefill_002/vectors_v2_009/V2/stage14/STATUS.json` | `F7677E5BF74FFB8B3676D6B272C93F748669BA605867B11AC86EFF85F170602F` |
| `R/parallel_prefill_002/vectors_v2_009/V2/stage14/source.mal` | `3D4F086BB6F14A4FA21B90CC877E6AB3BF704CBA08E89647FFFFC727B1410C28` |
| `R/parallel_prefill_002/RUN_RECORD_V1_V2_CONFORM_009.json` | `6089FDC4E2B8673BBEA80925AC80BD0BB787857932723564DDA7F9D2499A8F99` |
| `review/first-tick-conform-v1-v2-001/files/corpus/Markdowns/RECEIPT_PROMOTE_FIRST_TICK_CONFORM_V1_V2_001.md` | `162397CBFAB7FC543D80601882A7E071B0D4387D0895C341F588DAF5B831470E` |

The combined source records the same empty-route propagation at lines 2934-2941 and simultaneous return at 2952-2953. Receipt lines 42-44 retain the bounded result and exclusions. Full evidence bindings for the GPU self-witness record and retained JTP modules remain in the unchanged discharge map.

## Independent-builder comparison — reported evidence, bytes still unlocated

The review reports a bundle sent at 17:36 and the following identities. These are prefixes supplied in conversation, not full locally witnessed hashes:

| Reported object | Reported SHA-256 prefix | Local custody |
|---|---|---|
| `claude/RECORD_INDEPENDENT_BUILDER_COMPARISON_001.md` | `99CC2107` | UNLOCATED |
| Independent Python realization | `E02C90DE` | UNLOCATED; not executed |
| Independent comparison bundle | `99561FDE` | UNLOCATED |
| `claude/REVIEW_FIRST_TICK_O_EXEC_DISCHARGE_MAP_001.md` | Not supplied | UNLOCATED |

The reported result remains: stored V1 and V2 outputs match the promoted expected bytes; the proposed discharge covers the D2-labelled vectors only, not the J17 world. Local byte comparison remains NOT_RUN BECAUSE those independent output bytes have not been located. This does not reopen promoted GPU CONFORM or constitute a NOT-SAME finding about the independent build.

Bounded searches covered Desktop/MaL, Codex attachments, Documents/Codex, Downloads, the named local MaL repositories and the exact reported `claude/` paths. Hidden/ignored-aware name scans were included. Downloads contained older v0.1.0/v0.1.1 first-tick review ZIPs; their archive member lists and hashes did not identify this bundle. Four unrelated `.pytest_cache` directories denied traversal; no claim of exhaustive machine-wide absence is made. No archive was extracted and no enclosed realization was executed.

When the bundle bytes become locally accessible, the remaining operation is custody-only: bind full hashes, inspect stored input/output members, and compare the output bytes directly to the frozen files. Do not run the Python realization and do not replace expected bytes.

| Frozen output | Bytes | SHA-256 |
|---|---:|---|
| V1 | 33563 | `69786966E9B5D66A2078D29C43E1F1511545786AB07BF562E37D91205085B588` |
| V2 | 33548 | `BD0492B4CAC427432CC3251EB27FC997C0D5EFF2862ECBC10A89B9AC19F1AD0F` |

## Changes in this pass

Only this handoff note is added. The reviewed map, promoted evidence, frozen vectors and realization sources remain unchanged. No build, execution, staging, commit, push, DECIDE or PROMOTE is performed. The continuity/compliance pass preserves the distinction between witnessed bytes, reported comparison evidence and authority.
