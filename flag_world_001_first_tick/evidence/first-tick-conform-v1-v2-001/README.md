# First-tick V1/V2 promoted execution — local custody seal

Devon promoted the V1/V2 conformance result and authorized a local commit only.
No push is authorized. The promotion receipt is retained byte-exact under
`files/corpus/Markdowns/RECEIPT_PROMOTE_FIRST_TICK_CONFORM_V1_V2_001.md`.

## Bound result

- Combined run record: `6089FDC4E2B8673BBEA80925AC80BD0BB787857932723564DDA7F9D2499A8F99`.
- Ordered CONFORM record: `DBD4F2A387B66E751604A14ED27C46E2BE594C7D9949BFB9310C058AD1EB0942`.
- V1: EXECUTED / SAME, 33,563 bytes, `69786966E9B5D66A2078D29C43E1F1511545786AB07BF562E37D91205085B588`.
- V2: EXECUTED / SAME, 33,548 bytes, `BD0492B4CAC427432CC3251EB27FC997C0D5EFF2862ECBC10A89B9AC19F1AD0F`.
- CONFORM: IF_THEN. The original records' `promotion: NONE` and `repository_commit: NONE`
  describe their execution-time state; their bytes have not been amended. The separate
  receipt records Devon's later act.

The receipt names v0.1.1. The execution records bind v0.1.3's promoted contacts and the
same unchanged V1/V2 input and expected bytes. Both spec versions are retained; this
package changes neither version nor their acceptance scope.

## Contents and byte custody

The package includes both complete successful fourteen-stage execution chains, original
V1 stage-one execution and exact replay evidence, source `.mal`, generic host helpers,
CUDA source and runtime, carrier-only prefill, clean/prefilled qualification, capacity
refusal evidence, independent reference comparison, frozen vectors and the receipt.
Reference Python is preserved as comparison genealogy only; it is not a runtime input.
No Python cache files are included.

`CUSTODY_MANIFEST.json` maps every original absolute path to its archived member and
binds its original SHA-256 and byte length. Small members are copied without conversion.
Large members are losslessly gzip-compressed under `blobs/<original-sha256>.gz`.
Identical raw hashes share storage while retaining every original logical path.
The manifest also records each compressed member's own hash and size. Decompression
must reproduce the original hash and length. Original binaries were not overwritten.

`BOUND_REFERENCES.json` records the checked file identities from execution custody.
Two historical assembler versions are separately retained: stage00 `70EA9F0F…B4FF63`
and stage01 `10C036B4…EA5F972`. The current assembler is `FCB74032…4655497`.
Seven historical references to the reused absolute path resolve to the exact old
hash-bound objects, not the current file. The recovery record states the byte reversal;
the recovered helper was not executed. Original build records remain unchanged.

`SHA256SUMS` covers every package member except itself, including this README, the
manifest, binding index, receipt, verifier and byte-preserving `.gitattributes`.
It hashes compressed storage as stored; the manifest separately hashes original bytes.
There are no LFS pointers or references to uncommitted large-file payloads in place of
the archived evidence. Historical absolute paths inside original records are retained,
not rewritten; use the manifest to resolve their archived bytes.

## Verification

Run the included generic custody verifier from this package directory:

```text
node verify.mjs --files .
node verify.mjs --index .
node verify.mjs --commit . <commit>
```

The verifier compares the exact subtree to `SHA256SUMS`, hashes every stored member,
decompresses every distinct large payload, checks original hashes and sizes, and checks
the bound-reference resolutions. The latter two modes read Git blobs directly rather
than trusting the working-tree copies. These are custody checks, not GPU reruns.

## Scope retained

This seals the promoted first-tick V1/V2 conformance result only. It does not promote
the J17 world's own second step, placement beyond J17, or marker-route geometry.
The serial attempt without a readback is not a witness. No frozen expected bytes were
edited, no board action occurred, and no remote operation is part of this seal.
