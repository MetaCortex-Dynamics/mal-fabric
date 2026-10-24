# Published v1.1.0 — LaTeX transcription

This is a content-preserving transcription, not the original authoring source and not a new manuscript version. The authoritative published document remains [Zenodo v1.1.0](https://doi.org/10.5281/zenodo.23584296). Pagination, fonts and figure placement differ. The historical claims (including the kit's then-unreleased status) are intentionally unchanged.

Source: `Genesis_on_the_GPU_Whitepaper_v1.1.0.docx`, downloaded directly from that deposit. SHA-256: `D894D75945DC94E819BA5EB5F6ECF6300D6596CF43F94444990D4DD4AA7A9A6C`; deposited MD5: `438df40255598af8f995326272f7502b`. Both figure files are extracted unchanged from the source archive.

## Build

Run twice from this directory:

```
xelatex -interaction=nonstopmode -halt-on-error Genesis_on_the_GPU_v1.1.0.tex
```

The checked build uses XeLaTeX (MiKTeX 25.12), Segoe UI and Consolas on Windows. Other platforms must supply these fonts or explicitly record typography substitutions; no cross-platform rendering identity is claimed. The two `media/` images are required. No GPU run is involved.

The compiler exits successfully and emits eleven pages. It retains an `Infinite glue shrinkage found in box being split` diagnostic at the page-7 longtable split. The split table was visually inspected on both pages; its text is included in the SAME comparison. This is a remaining typesetting warning, not a claim of warning-free compilation.

## Content comparison

With Node.js and Pandoc installed, run `node verify-transcription.mjs`. `TRANSCRIPTION_CHECK.json` records equality of ordered body text, table cells and captions, title and subtitle after whitespace/typographic-quote normalization. The checker explicitly compensates for the LaTeX reader's handling of `textbar`, leading table numbers, and subtitle metadata. This is a transcription check, not conformance of the world realization. Page images were inspected for figures, tables and evidence identifiers.

`transcribe.lua` and `layout.tex` retain the presentation-only conversion adjustments. To regenerate:

```
pandoc Genesis_on_the_GPU_Whitepaper_v1.1.0.docx --standalone --to=latex --extract-media=. --pdf-engine=xelatex -V "mainfont=Segoe UI" -V monofont=Consolas -V geometry:margin=1in --lua-filter=transcribe.lua --include-in-header=layout.tex -o Genesis_on_the_GPU_v1.1.0.tex
```

## Verification kit (separate artifact)

[Published kit release](https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/verification-kit-001-v1.0.0). ZIP SHA-256 `701279395704DAA51AA4C0909F90B1C19959558943AA93096E850C5AC89114B8`. This transcription does not change that release, its receipts or promoted V1/V2 CONFORM. A code-archive DOI is a separate publication action, not supplied by the paper DOI.
