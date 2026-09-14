# v0.11.0 Archive Replay Preflight

The normative evidence corpus contains one inherited platform-newline boundary.
DEMO-004 was bound on Windows with CRLF JSON bytes, while Git stores the public
carrier's text files with LF normalization. Semantic JSON content is unchanged,
but byte replay must reconstruct the bound Windows representation in a
disposable replay workspace.

This preflight does not modify the release archive, promoted source, canonical
state, or evidence meaning.

## Windows replay procedure

After extracting the exact published archive into a fresh disposable directory,
materialize CRLF endings for exactly these 28 files:

```text
demo_004_dual_surface_render_binding/acceptance-summary.json
demo_004_dual_surface_render_binding/evidence/*.json
```

The evidence glob resolves to 27 JSON files: 26 vector receipts and one evidence
summary. The root acceptance summary is the twenty-eighth file.

Normalize each selected file by replacing every CRLF or LF line ending with
CRLF, preserving UTF-8 without a byte-order mark. Then require:

```text
demo_004_dual_surface_render_binding/acceptance-summary.json
SHA-256 := 50BB725920F17B5BA5565A8BC37F5E2A301B4BD8FE173F7C399AA5B2ECDDC275
```

Run the complete successor replay from that disposable tree:

```powershell
python .\cgp_world_001_constitutive_world\run_conformance.py
```

Expected closure:

```text
PRIOR_CONFORMANCE := 366/366 UNCHANGED
PRIOR_EVIDENCE    := 337/337 BYTE_IDENTICAL
CGP-WORLD-001     := 44/44
CGP EVIDENCE      := 45/45 BYTE_IDENTICAL

TOTAL_CONFORMANCE := 410/410
TOTAL_EVIDENCE    := 382/382 BYTE_IDENTICAL
```

The product-stage browser surface remains outside the normative census and is
verified separately against `PRODUCT_STAGE_MANIFEST.json`.
