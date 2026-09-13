# PHYSICS-R&D-001 Joint Realization Proof Record

The executable witnesses are carried by P07-P10, P13, P16, and P18-P22.

```text
P07 SAME ContactSubstrateBinding
P08 SAME initial JointPhysicsState
P09 SAME JointRealizationTrace under host-order permutations
P10 SAME JointPhysicsState across GAME/CARRIER
```

The three replay schedules are:

```text
CONTACT -> SUBSTRATE -> GOVERNANCE; F -> K
GOVERNANCE -> SUBSTRATE -> CONTACT; F -> K
CONTACT -> SUBSTRATE -> GOVERNANCE; K -> F
```

All emit the same content-addressed joint trace. Candidate branches read the
same committed state. The only commit object is the complete joint successor.

P13 binds Reeb threshold, governance tick, F/K substrate event, Contact step,
and joint-state index to one integer. P16 rejects either single-layer
admissibility failure. P20 uses face energy only on `FLAT_FLEX` and quotient
energy only on `CARRIER_QUOTIENT`. P21 keeps carrier convergence and flat
resonance preservation on their distinct domains. P22 supplies both the exact
quotient-lift witness and the bounded `U_R1` recovery witness.

Consequently:

```text
PHYSICS_PROOF_QUARTET   := HOLDS
JOINT_TICK_IDENTITY     := HOLDS
DUAL_ADMISSIBILITY      := HOLDS
HOST_ORDER_ERASURE      := HOLDS
QUOTIENT_LIFT_EXACTNESS := HOLDS
O5                      := WITNESSED, NOT DISCHARGED
```
