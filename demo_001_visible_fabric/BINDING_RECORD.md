# DEMO-001 implementation binding record

```text
binding_status:
  IMMUTABLE

implementation_commit:
  5ba5909b612a2e9e96d5e4d8aecdb69ade23a665

README_sha256:
  5FF016909CE92D2C7F2FD41D9E334CF8836B914908587F6AD02BA6794D7823EF

demo_adapter_sha256:
  D2C87C24701C1B940178506531687245A37E3254EBBF0C50F588C2F7FDBEBC87

acceptance_summary_sha256:
  C634F5E58D6A27D8D53576B0FA62DAD30AF1D28C69A561A0B4797D4FED620E74

implementation_notes_sha256:
  55948CDE33122FB2A3D55EED0C5EF880BFF4E3677FE082EFE10907518C1C3D3D
```

The file digests above are SHA-256 over the exact blobs in `implementation_commit`.

Post-commit verification from that tree:

```text
D01-D18:
  18/18

acceptance_summary_replay:
  BYTE_IDENTICAL

HTTP_smoke:
  PASS

HTTP_path:
  state → NL proposal → explicit accept → V3.3 start → one tick

scoped_diff:
  CLEAN

V3_1_IMPORT:
  UNCHANGED

V3_2_IMPORT:
  UNCHANGED

V3_3_IMPORT:
  UNCHANGED
```

This record binds implementation identity and evidence only.

```text
DEMO_001_VISIBLE_FABRIC := EVIDENCED + COMMIT_BOUND
PROMOTION               := NOT PERFORMED
```
