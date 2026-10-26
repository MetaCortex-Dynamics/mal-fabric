# DOI deposit package - Genesis on the GPU v0.5

Status: local preparation only. No archive draft, upload, reserved DOI or published DOI has been created.

## Prepared

- `upload/`: eight files for the archive record - the exact PDF, four exact supporting records/seals, Apache License 2.0, a scope README and a hash manifest.
- `ZENODO_DEPOSIT_METADATA.json`: preprint metadata using the documented deposition API shape; author, ORCID, affiliation, original release date, abstract, version, license and pinned repository reference.
- `CITATION.bib`: a citation using the public repository URL; no invented DOI.
- `DEPOSIT_PLAN.json`: field provenance, licensing attestation and action boundaries.
- `Genesis_on_the_GPU_v0.5_DOI_deposit.zip`: transport bundle of the upload files and metadata helpers. Extract it; upload the eight files inside `upload/` so the PDF is individually previewable.
- `PACKAGE_REVIEW.json`: package digest and entry-by-entry readback verification, generated after packaging.

Devon selected **Apache License 2.0** for the paper and four supporting records. This matches the committed repository license. The abstract is copied verbatim from the promoted publication edition. The public date is retained as 2026-10-26, BECAUSE this edition is already released on the repository.

## Archive form

Use the title and creator fields from the metadata file. Select **Publication / Preprint**, version **0.5**, publication date **2026-10-26**, language **English**, access **Open**, license **Apache License 2.0**. Paste the abstract from `metadata.description`; it contains only a surrounding HTML paragraph.

The metadata is prepared against [Zenodo's documented fields](https://developers.zenodo.org/#deposit-metadata); no live API submission or server-side validation has occurred. [Zenodo's form guidance](https://help.zenodo.org/docs/deposit/create-new-upload/) describes upload, preview and publication.

This is a separate paper deposit, not a new version of the software archive. Do not use software DOIs `10.5281/zenodo.22739341` or `10.5281/zenodo.22678127` as the paper's DOI. No paper DOI is supplied in the prepared metadata. When an authorized archive operation assigns one, bind the actual record ID and version DOI in a separate receipt; do not rewrite the sealed PDF to insert it.

No funding, journal or community claims have been supplied. Their omission does not change the paper or delay local preparation.

## Scope

This packet preserves the released bytes. It does not grant permission to upload, publish, submit to a journal, post to Substack, commit or push. Those operations have not been performed during preparation.
