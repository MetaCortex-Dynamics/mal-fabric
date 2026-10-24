# Genesis Anchor Protocol v0.1.0

**Genesis Anchor Protocol v0.1.0 — archived JTP capture only. Live-event profiles and application to non-ground predecessors are not included.**

Six source-backed API contacts; 19 integration checks and 35 boundary regressions. The extracted distribution also passed the documented 19-call adapter check. The ZIP contains 410 manifested payload files plus RELEASE_MANIFEST.json, verified SAME after extraction.

GPU execution evidence is reused from the recorded run. The API integration checks are newly executed evidence; they do not constitute another genesis run, live hardware capture or cross-backend verification. The original specification and verification kit are unchanged.

## Exact release asset

`genesis_anchor_protocol_001_v0.1.0_archived_jtp.zip` — 9,469,801 bytes.

SHA-256:
```text
3D868F8E394AD08D46755EC2FBD66F95E314937CE3C72FE3AF187B916E6D96A9
```

Manifest SHA-256: `6A84FBFD5E12C16D1FA3405DAEEB3C0598C3B92EA84C9272926BD87C0325C90A`.

## Commands

Requires Node.js (qualified version 22.20.0). Extract the ZIP and use its root as the working directory. No GPU or CUDA compilation is needed for these archived-output API checks.

```text
node flag_world_001_first_tick/genesis_anchor_protocol_001/verify_release.mjs .
node flag_world_001_first_tick/genesis_anchor_protocol_001/test_archived_adapters.mjs <fresh-absolute-output-directory> <absolute-extracted-root>/recorded_genesis
```

The first command checks packaged byte custody; the second runs the 19 API integration checks against the included receipt-bound produced outputs. Neither creates a new genesis. The packaged RELEASE.md includes the separate boundary-regression command and its Windows junction-permission requirement.

## Authority and discharge

The promotion receipt and discharge record are included in the ZIP and supplied as separate release assets:

- `RECEIPT_PROMOTE_GENESIS_ANCHOR_PROTOCOL_001.md`: `4D0C23A8B75631BB964C94035EB673B65A1B3BC65ED8CA9152704B312AF9BE1D`.
- `O_API_REALIZATION_DISCHARGE_001.md`: `2C2122C3FEF25DB0645FC999FB7DB891EDD246FBE906DFD41A55D02F6C782FA4`.
- Promoted specification identity: `70D374000A4A8E17E3C481F4B7C46415C01871813A4A70FF0634F57FC5057C3C`.

This publication does not promote the specification again. The discharge is limited to the archived profile; live-event profiles and later-event application remain open.

## Related publications

- [Published whitepaper v1.1.0](https://doi.org/10.5281/zenodo.23584296).
- [Verification kit v1.0.0](https://github.com/MetaCortex-Dynamics/mal-fabric/releases/tag/verification-kit-001-v1.0.0), original ZIP SHA-256 `701279395704DAA51AA4C0909F90B1C19959558943AA93096E850C5AC89114B8`.

Independent reproduction of the archived API checks is invited. Please report the release identity, device/OS, Node version, command, output receipt and any NOT-SAME finding. Reproduction does not inherit a claim of another GPU backend or live-event admission.
