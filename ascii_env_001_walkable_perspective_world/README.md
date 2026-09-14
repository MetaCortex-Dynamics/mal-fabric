# ASCII-ENV-001 implementation candidate

Fresh implementation from the promoted specification.

## Authority

```text
SPEC_COMMIT:
  e100efa1c3e143c1c531082da1c637022d5ded05

PROMOTION_COMMIT:
  5f852eed331fe97dc542b4a8a4eb3eb3975202e5

SPEC_SHA256:
  C2C37A530B9589FE87D0EA5897826337B6719A15A98FEF5C8828C0E48F59B9A8

EXPLORATORY a104950e:
  NOT IMPORTED
  NON_AUTHORITATIVE
```

## Projector contract v1

- `projector_id = ASCII_ENV_001_PROJECTOR`
- `projector_version = ASCII_ENV_001_PROJECTOR_V1`
- coordinates: signed int32 lattice
- angles: uint8 turn (`0..255`)
- ray distance: unsigned Q8.8 cell
- trigonometry: literal signed Q2.14 lookup table
- cell representation: exactly 3 bytes
  - glyph ASCII u8
  - foreground palette index u8
  - background palette index u8
- glyph encoding: US-ASCII only
- color encoding: fixed 16-entry palette index
- serialization: raw cell triples, row-major, top-to-bottom and left-to-right
- ANSI escape sequences: excluded from deterministic projection buffer

`w` is the committed `logical_tick_index`. It is never used as a ray axis.

## Current evidence boundary

`run_conformance.py` executes the projector-local vectors and the duplicated-field
fail-closed law.

AE13 and AE14 deliberately remain pending until the adapter is bound to the
promoted local ASCII-GEN0 kernel:

- AE13: governed ticks continue while CARRIER is shown and GAME returns at newer `w`
- AE14: attached vs headless canonical game trace is identical

Do not promote this implementation until those integration vectors, deterministic
replay, prior regression, binding, and a separate implementation promotion decision
are complete.


## Local integrated discharge

After binding `local_adapter_template.py` to the promoted ASCII-GEN0 kernel:

```powershell
$env:ASCII_GEN0_ADAPTER_MODULE = "your_adapter_module"
python run_conformance.py
python run_integrated_conformance.py
```

`run_integrated_conformance.py` discharges:

- AE13: worldline advances only through governed kernel ticks while CARRIER is shown
- AE14: attached projector vs headless execution yields the identical canonical game trace
- two-run integrated deterministic replay

`terminal_surface.py` is a minimal ANSI presentation runner. It is not a replacement
for the promoted CARRIER surface; the local integration should preserve the existing
GAME/CARRIER toggle and substitute this projector only for the GAME projection.
