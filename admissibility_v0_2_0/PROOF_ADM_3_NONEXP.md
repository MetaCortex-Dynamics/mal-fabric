# PROOF-ADM-3-NONEXP

```text
theorem: post-parse d_joint nonexpansiveness
domain: canonical FabricEdit / post-parse transition state
raw_surface_nonexpansiveness: NOT CLAIMED
status: PROVED FOR THE REFERENCE FEATURE METRIC
```

## 1. Metric spaces

Let `Omega_tilde = {true,false,undefined}` with:

```text
d(true,false)      = 1
d(true,undefined)  = 1/2
d(false,undefined) = 1/2
```

Each active witness coordinate and structural coordinate is a probability
distribution on `Omega_tilde`. The reference kernel represents all masses and
distances exactly as Q32.32 integers.

For distributions `p` and `q`, Wasserstein-1 on this three-point path metric
is:

```text
W1(p,q) = 1/2 (|p_true-q_true| + |p_false-q_false|)
```

The missing mass is the `undefined` coordinate, so the expression gives cost
`1` between true and false and cost `1/2` between either endpoint and
undefined.

Define the sup-product feature metric:

```text
d_feature(x,y) := max(
  max_i W1(x.witness_i, y.witness_i),
  max_j W1(x.structural_j, y.structural_j),
  |x.residual_ratio - y.residual_ratio|
)
```

Inactive coordinates are omitted on both sides after canonical activation.
Comparison across different activation sets uses the absent coordinate as the
all-undefined distribution.

## 2. Post-parse domain

The theorem begins after a text or visual surface has lowered to canonical
`FabricEdit`. Let `T` be the set of V3.1-DRC-passing canonical transitions
`(F,e,F_prime)`. The transition metric is the pullback of `d_feature` through
the canonical structural feature map:

```text
d_T(x,y) := d_feature(F_obs(F_struct^FABRIC(x)),
                      F_obs(F_struct^FABRIC(y)))
```

This quotient identifies presentation variation and retains every coordinate
used by the reference admission metric. It makes no continuity assertion
about raw parsing.

## 3. Component bounds

`F_struct^FABRIC` is deterministic over canonical transitions. Under the
pullback metric, its observable feature image is nonexpansive by definition:

```text
d_feature(F_obs(F_struct(x)), F_obs(F_struct(y))) <= d_T(x,y)
```

with equality.

`F_obs` performs canonical coordinate projection, sorting, and hashing.
Sorting changes no coordinate values. Projection cannot increase a sup metric,
and hashes are audit identities rather than numeric metric coordinates.
Therefore the metric-bearing part of `F_obs` is 1-Lipschitz.

For any fixed reference distribution `delta_true`, the reverse triangle
inequality for Wasserstein-1 gives:

```text
|W1(p,delta_true) - W1(q,delta_true)| <= W1(p,q)
```

Taking a maximum over active coordinates preserves the bound, so both `d_WV`
and `d_SV_core` are 1-Lipschitz. The residual-ratio coordinate is included
directly in `d_feature`, hence it is also 1-Lipschitz.

The maximum of two scalar 1-Lipschitz functions is 1-Lipschitz under the sup
product metric. Therefore:

```text
d_SV    = max(d_SV_core, residual_ratio)
d_joint = max(d_WV, d_SV)
```

are 1-Lipschitz on `T`.

## 4. Conclusion

For all post-parse canonical transitions `x,y` in the reference domain:

```text
|d_joint(x) - d_joint(y)| <= d_T(x,y)
```

This result supports stability and deterministic repair ranking. It does not
replace pairwise admission:

```text
d_WV <= epsilon_W
AND d_SV <= epsilon_S
```

No `epsilon_joint` is defined or permitted.

## 5. Explicit exclusions

The proof does not claim:

- raw text/visual surface nonexpansiveness;
- continuity across parse failure, V3.1 DRC rejection, or extended-DRC
  rejection;
- global repair completeness or optimality;
- any dynamic-execution or host-order property.
