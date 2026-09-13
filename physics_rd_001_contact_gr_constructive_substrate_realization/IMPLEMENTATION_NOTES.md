# Implementation Notes

## Canonical arithmetic

The governed realization accepts integers, strings, booleans, nulls, lists,
and maps only. A floating-point value at the canonical boundary raises
`FLOAT_FORBIDDEN_ON_GOVERNANCE_PATH`. Contact quantities use signed Q32.32.

## Contact realization

The Contact object binds the physical form and horizontal constraint to
`CGR-HA`, Reeb/tick semantics to `CGR-IMP` and `CGR-CSRHS`, the
negative-entropy Bregman Hamiltonian identification to `CGR-MEAS`, and the
declared position-dependent lambda field to `CGR-7R`.

The bounded evidence fixture is a flat horizontal chart. CSRHS path consistency
is therefore realized as `Exp_x(v) = x + v` on that chart. The implementation
does not claim a general curved-manifold exponential solver or a general closed
form for projection Hamiltonians.

The lambda values are content-addressed fixture data indexed by constructive
cell identity. They are not inferred from Gaussian terrain or renderer state.

## Constructive domains

The dodecahedral carrier uses the canonical generalized-Petersen `G(10,2)`
labeling: 20 vertices and 30 edges. Its 12 chordless pentagonal faces induce the
12-node, 30-edge icosahedral face-adjacency graph used by `F`.

```text
F : (Z6)^12 -> (Z6)^12
K : (Z6)^20 -> (Z6)^20
```

`F` is synchronous local cyclic-distance argmin with current-state tie
retention. The selected distance-one hemisphere witness is non-ground,
coherent, and fixed.

The six carrier axes are the six opposite-face pairs. Each gives four orbits
of five vertices. Projection minimizes within-orbit cyclic mismatch; quotient
descent searches the one-step neighborhood; lift assigns the quotient value to
all five vertices in an orbit. Where the imported theory identifies tied
choices as structurally equivalent, CDEE selects the least canonical
representative so evidence bytes remain deterministic.

The exhaustive quotient evidence covers all `6^4 = 1296` states. Every state
reaches quotient ground within three quotient steps; including projection gives
the imported full-carrier bound of at most four.

## Resonance and O5

The entity is the fixed `F` resonance, not a point particle. Its presentation
center may advance, while its support/orientation/boundary identity stays fixed.

`U_R1` operates on a bounded common icosidodecahedral witness with typed
triangle (`K`) and pentagon (`F`) projections. It reads one snapshot, computes
both reference candidates, verifies their exact recovery and dual
admissibility, and commits one joint successor. Reversing F/K host evaluation
order produces byte-identical evidence.

This earns:

```text
O5_REALIZATION_STATUS := WITNESSED
O5_GENERAL_STATUS     := INHERITED_OPEN
```

## Nonauthority

Known Newtonian, Euler, Cartesian-lattice, Gaussian-cell, and approximate-lift
substitutions return `BLOCKED(THEORY_SUBSTITUTION_ATTEMPT)`. GAME and CARRIER
are read-only projections of one committed `JointPhysicsState`.
