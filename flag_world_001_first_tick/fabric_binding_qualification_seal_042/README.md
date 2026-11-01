# Fabric binding qualification seal 042

This package preserves the exact source and evidence bytes listed in
`SOURCE_INVENTORY.json`. Its publication authority is recorded separately in
`PUBLICATION_AUTHORITY_042.json` and included in the stored checksum inventory.

The qualification covers the canonical fabric/runtime correspondence for
`W38_SITE_READING_JOIN` only. Effect comparison and write assembly remain OPEN.
This seal does not close all of realization 038, promote law, transition a
world, or rerun a GPU computation. Interrupted, failed and uncounted artifacts
listed in the inventory remain genealogy; storing them does not count them as
closed qualification evidence.

Publication base: `ce3e73b60e49dd217621bac274c77e17a88df59e`.
Publication branch: `review/fabric-binding-042`.

## Result and source

The recorded qualification has eight DRC conditions IF_THEN, 438 baseline
parent outputs, and byte-SAME replay for all five cases. Its scope is the
component correspondence stated above.

- [Qualification run record](files/CEF156E945D0A966358E3C63B7338AE133A88344BCED2247A01E7101C2BE3F1A)
- [Native runtime and join source](files/5FE9CF62CE6EE2DF631A37F643B21B85DCFE609AE2672D349A7E6F09860628D1)
- [Native DRC source](files/2283451FEA712F0CC0DFAB0ACD4D021221F5F352381340B18F9FD9DDEDEF5CE2)

The helper performs byte custody only. It does not invoke Git, the GPU runtime,
or QueueGate. `.gitattributes` disables text conversion throughout this package
so that repository checkout preserves the recorded byte identities.

## Build

Place the authority record and `SOURCE_INVENTORY.json` beside `seal.mjs`, then:

```text
node seal.mjs build
```

The inventory is an array, or an object with an `entries` array (`files` is also
accepted). Each entry is:

```json
{"source_path":"D:/absolute/source/file","role":"evidence role","expected":{"sha256":"FULL_UPPERCASE_SHA256","bytes":123}}
```

`expected` is optional. Every original is hashed. A supplied identity must
match. Inventory header metadata and complete entry metadata are retained in
the manifest, beside the exact input inventory hash. Files smaller than 16 MiB
are stored without transformation under
`files/`; larger files are compressed losslessly and split into chunks no
larger than 40 MiB under `blobs/`. Identical SHA256 content shares one storage
object while each inventory entry retains its own path and role.

All decoded originals are verified before the manifest closes. Every original
is also rechecked before publication of the manifest. No source is written.
An interrupted build retains its artifacts and `BUILD_OPEN.json`; an observed
error also writes `BUILD_FAILED.json`. Neither state counts as a completed
seal. Builds do not resume or overwrite a partial package automatically.

## Portable verification

```text
node seal.mjs verify
```

Verification requires only the package. It checks the stored checksum inventory,
metadata, compressed chunks and streams, decoded original identities, census,
and closure record. It rejects unexpected package files or escaping paths.
`SOURCE_SHA256SUMS` records original identities and paths; those paths are never
opened by portable verification. `SHA256SUMS` covers the helper, this README,
attributes, input inventory, publication authority, manifest, closure records,
source checksums and every stored payload. The checksum file cannot hash itself.

To additionally compare the original paths on their originating host:

```text
node seal.mjs verify-originals
```

## Optional restore

```text
node seal.mjs restore fresh-directory-name
```

After portable verification, restore writes only to a new directory under
`restored/`. It never writes to the original paths or overwrites an existing
restore. `RESTORE_MAP.json` records the restored name for every original entry.
Partial restores retain their own open/error records. Restored material is
outside the sealed storage checksum census.
