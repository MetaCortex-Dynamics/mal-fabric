# MaL Fabric v0.2.0 Publication Provenance

This public carrier is a filtered successor to the v0.1.0 publication. It
preserves public Git history while binding the V3.2 contents to Devon's exact
promoted authority point in the governance workspace.

```text
public_repository:
  MetaCortex-Dynamics/mal-fabric

public_base_commit:
  1c1a495406be76ba6d00861fbe2c1044b557c686

upstream_repository:
  MetaCortex-Dynamics/mal_kernel_lab_foundation

upstream_candidate_commit:
  ba8428607a5a0291a4a6c0eea275e6d76afbfb5e

upstream_promotion_commit:
  a593b595f674746a532bcd3e2de52bdf1cef9e68

queuegate:
  Q-SWFPGA-ADMISSIBILITY-001

discharged_obligation:
  O-SWFPGA-ADMISSIBILITY-1
```

## Filtered import

The following promoted trees were materialized through a filtered copy and
retained as sibling directories so the V3.2 kernel imports the exact sealed
V3.1 implementation by identity. Each bound file was verified against its
promoted SHA-256 identity before admission replay:

```text
v3/software_fpga/static_fabric_v0_1_0
  -> static_fabric_v0_1_0

v3/software_fpga/admissibility_v0_2_0
  -> admissibility_v0_2_0
```

The normative V3.2 specification was copied byte-for-byte from its bound source
document to `FABRIC_ADMISSION_PIPELINE_SPEC.md`.

## Bound identities

```text
normative_spec_sha256:
  DF253688DA9DED75D59793BC88C13F33365ECD6EE2D24F090E0DFED43AADDABC

admission_kernel_sha256:
  89105692EEE04580DB1C98556B51D0644292B7FB7B42FA4F41EBD381CDE256DC

conformance_runner_sha256:
  BD56F24CA16485421931F8965909F8D54BE3F29E3FED604DAFB1D67A00780E47

proof_adm_3_nonexp_sha256:
  2EA1F1453B5051A2E6B117AD784DE3637245F4CCD802C6522BCEE98591FB38B0

v3_1_import_manifest_sha256:
  4E50FBFD1D0EA6EEBF8A46DA095D35AC8C6AC01D36C60C6D03DAFC5C2D77B505

queuegate_evidence_summary_sha256:
  19EE5B395B44E016A24C259674A35EA055A6DF4D33D32657A223AFCD2CF05C8B

receipt_set_sha256:
  D2F4626FCE5F9D57A9A6BDB6C9AD881419B778F09C0AA6DA3623C584474F68C2

receipt_set_encoding:
  UTF-8 concatenation of sorted "filename<TAB>lowercase-file-sha256<LF>"
```

No unrelated upstream tree or history is included. The public carrier records
cryptographic provenance rather than Git ancestry to the private governance
repository.
