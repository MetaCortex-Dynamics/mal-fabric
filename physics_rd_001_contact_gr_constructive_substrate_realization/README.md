# PHYSICS-R&D-001 — Contact GR on the Constructive Substrate

This directory contains the bounded v3 reference realization authorized by the
promoted PHYSICS-R&D-001 specification and its v0.2.1 corpus/resonance/O5
amendment.

The implementation realizes one resonance entity whose Contact state and
Constructive-Substrate state commit together. The flat flex law `F : (Z6)^12`
and carrier quotient law `K : (Z6)^20` remain type-distinct. A bounded unified
update `U_R1` reads one common snapshot, recovers both reference successors,
and commits once at the joint Reeb/governance/physics tick.

The theory direction is one-way:

```text
closed mathematical corpus
  -> content-addressed v3 realization
```

The historical `csrhs_v02.malcog` file is retained only as predecessor
realization evidence. It has no theory or v3 implementation authority.

## Run

```text
python run_prior_regression.py
python run_conformance.py
```

Expected result:

```text
P01-P36          := 36/36
EVIDENCE_REPLAY  := 37/37 BYTE_IDENTICAL
PRIOR_CONFORMANCE:= 299/299 UNCHANGED
PRIOR_EVIDENCE   := 267/267 BYTE_IDENTICAL
O5               := WITNESSED, NOT DISCHARGED
```

## Boundaries

- Q32.32/integer arithmetic only on the governed realization path.
- Renderer, Gaussian terrain, mesh, pixels, and host traversal are
  nonauthoritative.
- The carrier convergence theorem is not applied to the flat-flex resonance.
- The bounded O5 witness is existential realization evidence, not a universal
  unified-law theorem.
- No Born statistics, entanglement, coarse-grain classical stability,
  multi-body gravity, collisions, or dynamic Gaussian actors are claimed.

Implementation promotion and publication are not performed by this artifact.
