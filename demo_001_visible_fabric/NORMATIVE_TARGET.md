# DEMO-001 normative target

DEMO-001 is an adapter and visual projection over the promoted kernels. It does not redefine them.

```text
V3.1 kernel SHA-256:
  8B983301DAD795DD9C3F020970BAD76017EF648AC0C71E3FB6FDEF3D0E4347C0

V3.2 kernel SHA-256:
  89105692EEE04580DB1C98556B51D0644292B7FB7B42FA4F41EBD381CDE256DC

V3.3 kernel SHA-256:
  96C6F849F3AD64D6B9D8C2469A252E5A813354C1E2C0B7CD47FCDE7B518B4FE2
```

The V3.3 import path verifies its sealed V3.1 and V3.2 dependencies before the demo can start. Any mismatch fails closed.

The single semantic authority held by `DemoSession` is `fabric: FabricSpec`. Candidate, runtime, and presentation state are separate projections or lifecycle state; none is a second semantic program model.
