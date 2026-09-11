# MaL Fabric v0.3.0 Publication Provenance

This public carrier is a filtered successor to the v0.2.0 publication. It
preserves public Git history while binding the V3.3 contents to Devon's exact
promoted authority point in the governance workspace.

```text
public_repository:
  MetaCortex-Dynamics/mal-fabric

public_predecessor_commit:
  754de07ce37cdafb2eff39c048182f479f4629d7

public_predecessor_tag:
  v0.2.0

public_predecessor_version_doi:
  10.5281/zenodo.22711890

upstream_repository:
  MetaCortex-Dynamics/mal_kernel_lab_foundation

upstream_candidate_commit:
  d2802a99861301793ec035e9e674b3fcda9bf919

upstream_promotion_commit:
  98289c348421943ab0e440d45ec1d7e7cbbbc2b2

queuegate:
  Q-SWFPGA-EXECUTION-001

discharged_obligation:
  O-SWFPGA-EXECUTION-1

software_concept_doi:
  10.5281/zenodo.22678127

public_release_commit:
  dfe4f37dc9e90ea0141422c27f69d8d8a1c5d363

public_release_tag:
  v0.3.0

github_release:
  https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/v0.3.0

software_version_doi:
  10.5281/zenodo.22713736

zenodo_record:
  https://zenodo.org/records/22713736

zenodo_archive_file:
  MetaCortex-Dynamics/mal-fabric-v0.3.0.zip

zenodo_archive_size_bytes:
  258835

zenodo_archive_md5:
  EA6F9B38EF02574253212B4091273853

paper_b_doi:
  10.5281/zenodo.22715312

paper_b_concept_doi:
  10.5281/zenodo.22715311

paper_b_record:
  https://zenodo.org/records/22715312

paper_b_docx_sha256:
  1A749C9F20B423222D7E51A9F617837F8B749DC7805E258150C520320E208E86

paper_b_pdf_sha256:
  02FE9D8DA9D06F011AEC96E72F3ED96694B7E1305558EE3D54EA1432108124B9
```

## Filtered import

The three promoted trees were materialized through a filtered copy and remain
sibling directories so each successor imports its exact sealed predecessor by
identity:

```text
v3/software_fpga/static_fabric_v0_1_0
  -> static_fabric_v0_1_0

v3/software_fpga/admissibility_v0_2_0
  -> admissibility_v0_2_0

v3/software_fpga/execution_v0_3_0
  -> execution_v0_3_0
```

The normative V3.3 specification and conformance corpus were copied
byte-for-byte from their bound source documents to
`FABRIC_EXECUTION_SPEC.md` and
`FABRIC_EXECUTION_CONFORMANCE_VECTORS.md`.

## Bound identities

```text
normative_spec_sha256:
  5BB1497AA3D791150F0416FEDA4E393695A9302B42030ADD0A7D22C08CCBEAC0

vector_corpus_sha256:
  846DBF4BE822C6816E788D4BCCE98F34D815D1AB870E62BDC5DEA67636E9C055

implementation_handoff_sha256:
  7C2806E441785CE98B49476E84A311F8134BDE76AEDB39A6723826D73D94A36D

execution_kernel_sha256:
  96C6F849F3AD64D6B9D8C2469A252E5A813354C1E2C0B7CD47FCDE7B518B4FE2

conformance_runner_sha256:
  A8141D1387AB2E0C7D6F033DBFA4B27F7C00DE9B03F055CBC714891069F8B4AB

proof_exec_4_sha256:
  F29F5AB4B554B875A3C10D2D901F062E98994E934C2A46740B093940D46C1629

v3_import_manifest_sha256:
  1436CC7DB20459C7B3CFE0D3F1DA171A485A48F89513BC6DB49B4F049B041A5A

queuegate_evidence_summary_sha256:
  B7FD885ADA3E14845336E547D3A35C5A81418F82998221CE189B1FE100A78E0F

receipt_set_sha256:
  79ABEA24FCED44A921543CC280ABBA8B14028DB08E87EE35BD26E545148D436A

receipt_set_encoding:
  UTF-8 concatenation of sorted "filename<TAB>lowercase-file-sha256<LF>"
```

The execution subtree includes the subsequent promotion record but preserves
the immutable candidate implementation and evidence identities named there.
No unrelated upstream tree or history is included. The public carrier records
cryptographic provenance rather than Git ancestry to the private governance
repository.
