# V3.2 Fabric Admissibility Promotion Record

```text
record_id: Q-SWFPGA-ADMISSIBILITY-001-PROMOTION-001
authority: Devon Generally
decision_date: 2026-09-11
decision: ALLOW
promotion: PERFORMED

Q-SWFPGA-ADMISSIBILITY-001: PROMOTED
O-SWFPGA-ADMISSIBILITY-1:   DISCHARGED
O-ADM-7:                     EVIDENCED
```

## Promoted identity

```text
candidate_commit:
  ba8428607a5a0291a4a6c0eea275e6d76afbfb5e

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

conformance:          62/62
evidence_determinism: 63/63 byte-identical
v3_1_import:          UNCHANGED
v3_3_leakage:         NONE
```

The evidence summary remains the immutable execution-time receipt and therefore
records `promotion := NOT_PERFORMED`. This promotion record is the subsequent
authority transition; it does not rewrite the evidence it relies upon.

## Claim boundary

Promotion closes the V3.2 static-admissibility obligation only. It does not
modify V3.1, authorize V3.3 execution semantics, or promote any successor
obligation.
