# Proof Note — CGP-WORLD-001 Separation and Replay

## Claim 1: presentation nonauthority

`project` and `attach_projector` receive immutable committed values and return
only `PresentationOutput`, `ProjectorFailure`, or successor
`PresentationState`. None receives a transition capability for
`OnticWorldState` or `EpistemicState`.

Therefore attaching, removing, failing, or toggling a projector cannot alter
entity constitution, topology, measurement state, or worldline progression.
CW11–CW28 and CW35 witness this closure.

## Claim 2: ontic/epistemic separation

The two canonical containers are disjoint frozen dataclasses. Ontic state holds
the imported joint substrate/contact/fabric state, spatial state, fixture
identity, worldline prefix, and constitutions. Epistemic state holds observers,
Certificates, LiftClaims, shared facts, gluing failures, draw position, and tau.

A measurement below the commitment threshold changes neither container. A
committed measurement ordinarily changes EpistemicState only. The sole realized
ontic measurement transition requires both zero governance margin and an
explicit perturbation authorization. CW29–CW38 witness this closure.

## Claim 3: deterministic measurement replay

For a complete `MeasurementReplayContract`, the repair fiber is sorted by its
bound measurement identifiers. Each Gap-kernel weight is computed in Q32.32 by
the bound deterministic exponential realization. One SHA-256 counter draw is
derived from the seed, draw index, observer, entity, and worldline. The draw is
mapped through the canonical cumulative weights.

Consequently identical contract, fiber, kernel inputs, and draw index produce
the identical measurement and Certificate bytes. An absent seed, wrong order,
wrong subject, wrong numeric domain, or wrong algorithm fails closed. CW32–CW34
witness this closure.

## Claim 4: local evidence survives failed gluing

Certificate validity, LiftClaim admissibility, and cross-locale compatibility
are separate predicates. `glue` first retains locally admissible claims, then
evaluates every overlap pair with the explicit compatibility predicate. An
incompatible pair appends `SHEAF_INCONSISTENCY` while preserving Certificates
and producing no shared fact.

Therefore gluing failure does not retroactively erase a lawful local
measurement. CW39–CW41 witness this closure, including the authorized zero-margin
two-observer sequence.

## Claim 5: rate-governor typing

`V_observed` is a nonnegative Q32.32 mean of incompatible overlap-pair
indicators. `V_target` is required to be nonnegative. Their signed difference
is `delta_v`. The realized controller changes only tau by a fixed Q32.32
quantum; it does not silently modify coupling, measurement admissibility, or
the gluing predicate. CW42–CW43 witness this closure.

## Result

```text
ONTIC_EPISTEMIC_PRESENTATION_SEPARATION := HOLDS
MEASUREMENT_REPLAY                      := HOLDS
PROJECTOR_NONAUTHORITY                  := HOLDS
LOCAL_CERTIFICATE_SURVIVAL              := HOLDS
RATE_GOVERNOR_CHANNEL_BINDING           := HOLDS
```
