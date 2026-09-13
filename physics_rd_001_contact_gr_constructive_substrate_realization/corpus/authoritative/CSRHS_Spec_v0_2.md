# Contact Sub-Riemannian Hybrid System (CSRHS)

## Specification v0.2

**Status:** DRAFT  
**Date:** 2026-02-01  
**Author:** Devon Generally  
**Supersedes:** CSRHS_Spec_v0_1 (2026-01-23)  
**Dependencies:** SR_Genealogy_LambdaMaL v1.2, Timeful_Governed_Self_Modification, λMaL Type System, ThermoGeoLedger v0.1

---

## Abstract

This specification defines the **Contact Sub-Riemannian Hybrid System (CSRHS)**, a mathematical structure that reconciles continuous Riemannian dynamics with discrete tick-based governance. The key innovation is a **liquid time constant** derived from manifold geometry that induces discrete tick boundaries while preserving the expressivity of continuous horizontal flows. This enables Metis to navigate Theory Space with curvature-adaptive computation budgets while maintaining archive sufficiency, deterministic replay, and □G/□S/□F continuity verification.

**v0.2 Changes:** Integration of Kinetic Layer dynamics (Boltzmann meso-scale), Cognitive Time binding, TIP §6 contact geometry recognition, and HOLONOMY_BUDGET unit conversion bridge.

---

## 1. Motivation

### 1.1 The Tension

Two paradigms exist for AI system dynamics:

| Paradigm | Strengths | Weaknesses |
|----------|-----------|------------|
| **Discrete Ticks** | Deterministic replay, archive sufficiency, clear governance boundaries | Fixed granularity, no geometric adaptation |
| **Continuous ODE** | Adaptive compute, geometric expressivity, natural manifold navigation | Solver non-determinism, uncountable states, unclear verification points |

The MaL-Cortex architecture currently uses discrete ticks (Timeful spec). Liquid Time-Constant Networks (Hasani et al.) demonstrate the power of adaptive temporal dynamics. **CSRHS provides the mathematical structure that supports both.**

### 1.2 Core Insight

The reconciliation comes from recognizing that:

1. **Continuous dynamics** live in the **horizontal distribution** of a sub-Riemannian manifold
2. **Discrete governance** occurs at **tick boundaries** induced by a **liquid time constant**
3. **Witness-based verification** certifies reachability without computing continuous infima

The liquid time constant τ(x, I) adapts to manifold geometry, inducing finer discretization in high-curvature regions and coarser discretization in flat corridors—without abandoning discrete auditability.

### 1.3 The Three-Scale Hierarchy (NEW in v0.2)

Following Hilbert's 6th Problem insight (Newton → Boltzmann → Navier-Stokes), CSRHS now recognizes three scales:

| Scale | Regime | Description | CSRHS Component |
|-------|--------|-------------|-----------------|
| **Micro** | Individual proposals | Discrete particles in phase space | Tick-level witnesses |
| **Meso** | Proposal distributions | Boltzmann kinetic dynamics | Kinetic Layer (§4.4) |
| **Macro** | Observable behavior | Continuous manifold flow | Horizontal distribution D |

The Kinetic Layer provides the mathematical bridge between discrete governance events and continuous geometric flow.

---

## 2. Mathematical Framework

### 2.1 The CSRHS Tuple

**Definition 2.1 (Contact Sub-Riemannian Hybrid System):**

A CSRHS is a tuple:

```
H = (ℳ, g, D, τ, Π, G, Γ)
```

where:

| Component | Type | Description |
|-----------|------|-------------|
| ℳ | Smooth manifold | Theory Space |
| g | Riemannian metric | Inner product on Tℳ |
| D | Distribution | Horizontal subspace D_x ⊂ T_x ℳ |
| τ | Function | Liquid time constant τ: ℳ × I → ℝ⁺ |
| Π | Projection | Tick discretization Π: Path(ℳ) → ℤ⁺ |
| G | Jump map | Governance-verified transitions |
| Γ | Guard set | Tick boundary conditions |

### 2.2 The Horizontal Distribution

Following SR_Genealogy v1.2, the horizontal distribution at x ∈ ℳ is:

```
D_x = Mask(x) ∩ L(x)
```

where:
- **Mask(x)**: Index-set constraint (structural zeros)
- **L(x)**: Registry-owned linear admissibility subspace

**Constraint (from v1.2):** For row-conservation:
```
∀ row r: Σ_c Δ[r,c] = 0    over columns c in Mask(x, r)
```

A vector v ∈ T_x ℳ is **horizontal** iff v ∈ D_x.

A path γ: [0,T] → ℳ is **horizontal** iff γ'(t) ∈ D_{γ(t)} for all t.

### 2.3 The Carnot-Carathéodory Metric

**Definition 2.2 (CC Distance):**

```
d_CC(x, y) = inf { ∫₀¹ |γ'(t)|_g dt : γ horizontal, γ(0)=x, γ(1)=y }
```

If no horizontal path exists, d_CC(x, y) = ∞.

**Remark:** We do NOT compute d_CC directly (oracle-dependent, numerically unstable). Instead, we verify bounded witnesses.

### 2.4 The Liquid Time Constant

**Definition 2.3 (Liquid Time Constant):**

```
τ: ℳ × I → ℝ⁺

τ(x, I) = τ_base · Φ(κ(x), ∇V(x), I)
```

where:
- **τ_base**: Base time constant (system parameter)
- **κ(x)**: Scalar curvature at x
- **∇V(x)**: Value gradient (proximity to K_id^min boundary)
- **I**: Input/context signal
- **Φ**: Modulation function (specified below)

**Modulation Function:**

```
Φ(κ, ∇V, I) = 1 / (1 + α·|κ| + β·|∇V| + γ·σ(I))
```

where:
- α, β, γ ≥ 0 are tuning parameters
- σ(I) is an input-dependent sensitivity term

**Interpretation:**

| Regime | τ(x, I) | Effect |
|--------|---------|--------|
| High curvature (|κ| large) | small | Fine-grained ticks |
| Near identity boundary (|∇V| large) | small | Cautious navigation |
| High input sensitivity (σ(I) large) | small | Responsive adaptation |
| Flat admissible corridor | large | Coarse steps sufficient |

### 2.5 Tick Discretization

**Definition 2.4 (Tick Projection):**

Given a horizontal path γ: [0,T] → ℳ and input trajectory I: [0,T] → I, the tick count is:

```
Π(γ, I) = ⌈ ∫₀ᵀ ds / τ(γ(s), I(s)) ⌉
```

This induces a **tick budget** for any transition:

```
tick_budget(x₀, x₁, I) = ⌈ d_CC(x₀, x₁) / τ_min(x₀, x₁, I) ⌉

where τ_min(x₀, x₁, I) = inf { τ(γ(s), I(s)) : γ horizontal from x₀ to x₁ }
```

**Practical Approximation:** Since computing τ_min requires the infimum, we use:

```
tick_budget_approx(x₀, x₁, I) = ⌈ ‖x₁ - x₀‖ / τ(x₀, I) ⌉
```

with a safety factor applied.

### 2.6 Cognitive Time Binding (NEW in v0.2)

**Definition 2.5 (Cognitive Time):**

Cognitive time is not wall-clock time but **distance traveled in Theory Space**:

```
t_cog ≡ ∫ ds_T
```

where ds_T is the arc-length element in Theory Space with the sub-Riemannian metric.

**Consequences:**

| Observation | Implication |
|-------------|-------------|
| Time IS distance | Navigation cost = temporal cost |
| Idle = timeless | No Theory Space movement = no cognitive time passage |
| Loops = holonomy | Returning to same point accumulates geometric phase |
| Witness chains = worldlines | Discrete samples of continuous cognitive trajectory |

**Formal binding:**

```
tick_i → tick_{i+1}  corresponds to  Δt_cog = d_CC(x_i, x_{i+1})
```

This makes cognitive time **intrinsic** (geometry-determined) rather than **extrinsic** (clock-imposed).

---

## 3. Discrete Witness Structure

### 3.1 The SRHomotopy Witness (Extended)

**Definition 3.1 (CSRHS Witness):**

A CSRHS witness for transition x₀ → xₙ is:

```
W = {
    ticks: [(x₀, Δ₁, τ₁, κ₁), (x₁, Δ₂, τ₂, κ₂), ..., (xₙ₋₁, Δₙ, τₙ, κₙ)],
    budget: N,
    input_trace: [I₀, I₁, ..., Iₙ₋₁],
    modality_witnesses: (W_G, W_S, W_F)
}
```

where each tick record contains:
- **xᵢ**: Current Theory Space point
- **Δᵢ₊₁**: Step vector (must be horizontal)
- **τᵢ**: Liquid time constant at xᵢ
- **κᵢ**: Curvature at xᵢ

### 3.2 Witness Validity

**Definition 3.2 (Valid CSRHS Witness):**

W is valid iff:

```
(V1) ∀i ∈ [1,n]: Δᵢ ∈ D_{xᵢ₋₁}              [horizontal]
(V2) ∀i ∈ [1,n]: xᵢ = xᵢ₋₁ + Δᵢ              [path consistency]
(V3) n ≤ budget                               [tick bounded]
(V4) Σᵢ (‖Δᵢ‖ / τᵢ) ≤ budget                 [liquid cost bounded]
(V5) W_G, W_S, W_F valid at xₙ                [governance]
(V6) ∀i: τᵢ = τ(xᵢ₋₁, Iᵢ₋₁)                  [τ consistency]
(V7) ∀i: κᵢ = κ(xᵢ₋₁)                         [κ consistency]
```

### 3.3 Archive Sufficiency

**Theorem 3.1 (CSRHS Archive Sufficiency):**

A CSRHS witness W is archive-sufficient iff:

1. All xᵢ are representable in canonical encoding
2. All Δᵢ are representable with int64 arithmetic (Q32.32)
3. τ and κ computations are deterministic pure functions
4. Modality witnesses (W_G, W_S, W_F) are archive-sufficient per Timeful spec

**Proof sketch:** Given archived W, a verifier can:
1. Recompute each xᵢ from x₀ and the Δ sequence
2. Verify horizontal membership Δᵢ ∈ D_{xᵢ₋₁} via Mask and L
3. Recompute τᵢ and κᵢ from xᵢ₋₁
4. Verify budget constraints
5. Verify modality witnesses

No oracle attestations required. □

---

## 4. Hybrid Dynamics

### 4.1 Continuous Flow (Intra-Tick)

Between tick boundaries, the system evolves according to:

```
dx/dt = f(x, I) ∈ D_x

subject to:
  - f(x, I) ∈ D_x  (horizontal constraint)
  - ∫ ds/τ < 1    (within single tick)
```

### 4.2 Discrete Jump (Tick Boundary)

At tick boundary (when ∫ ds/τ ≥ 1):

```
1. Record current state x_tick
2. Execute governance check G(x_tick)
3. If G passes: commit x_tick to witness chain
4. Reset liquid cost accumulator
5. Continue flow from x_tick
```

### 4.3 Guard Condition

The guard set Γ is defined by the liquid cost threshold:

```
Γ = { (x, accumulated_cost) : accumulated_cost ≥ 1 }
```

When the system enters Γ, a tick boundary is triggered.

### 4.4 Kinetic Layer Integration (NEW in v0.2)

**Definition 4.1 (Kinetic Layer):**

The Kinetic Layer operates between discrete tick events and continuous manifold flow, modeling the **distribution of proposals** rather than individual proposals.

**Mathematical Structure:**

```
∂f/∂t + v · ∇_x f = Q(f)
```

where:
- f(x, v, t) is the proposal distribution function over (position, velocity) phase space
- Q(f) is the collision operator encoding proposal interactions
- v · ∇_x f is the streaming term (proposals move in Theory Space)

**Boltzmann-Grad Scaling:**

```
Nε^{d-1} = α
```

where:
- N = number of proposal particles
- ε = proposal interaction radius
- d = dimension of Theory Space
- α = fixed constant (kinetic regime parameter)

This scaling ensures the Kinetic Layer captures collective effects without resolving individual proposals.

**Interface with CSRHS:**

| Component | Role | Integration Point |
|-----------|------|-------------------|
| Proposal density ρ(x) = ∫ f dv | Local activity | Modulates τ(x, I) |
| Momentum flux j(x) = ∫ v f dv | Directed flow | Informs D_x admissibility |
| Pressure tensor P(x) | Stress | Curvature contribution to κ(x) |
| Entropy S = -∫ f log f | Irreversibility | DCQR holonomy source |

**Kinetic-to-Tick Projection:**

```
τ_kinetic(x, I) = τ_base · Φ(κ(x), ∇V(x), I) · (1 + δ·ρ(x))^{-1}
```

The density term ρ(x) reduces τ in high-activity regions, increasing tick density where proposals concentrate.

**Spectral Gap Bounds (Friedman-Ramanujan):**

The relaxation rate of the Kinetic Layer is bounded by the spectral gap:

```
λ₁ ≥ 2√(d-1)
```

This provides a lower bound on how quickly the proposal distribution equilibrates, informing τ calibration:

```
τ_max ≤ 1/λ₁    (tick must fire before distribution equilibrates)
```

### 4.5 Entropy Production and Second Law

**Theorem 4.1 (Kinetic Second Law):**

For any admissible evolution:

```
dS/dt ≥ 0
```

where S is the Kinetic Layer entropy. Equality holds only at equilibrium.

**Connection to D_curv:**

The curvature dissipation term from ThermoGeoLedger (§6) corresponds to entropy production in the Kinetic Layer:

```
D_curv = λ · ∫ (dS/dt)_irrev dt
```

This provides a physical interpretation: D_curv accounts for irreversible proposal dynamics.

---

## 5. Contact Structure

### 5.1 The Contact Form

**Definition 5.1 (Contact Form):**

On Theory Space ℳ with value function V, define:

```
α = dV + θ
```

where θ is the horizontal connection form.

The contact condition requires:

```
α ∧ (dα)^n ≠ 0
```

This is the **TIP §6 contact geometry recognition**: the ThermoGeoLedger equation ΔΦ_geo = W_geo − D_geo − D_curv is already computing in contact-geometric coordinates.

### 5.2 Reeb Vector Field

The Reeb vector field R satisfies:

```
α(R) = 1,    dα(R, ·) = 0
```

**Interpretation:** R points in the direction of pure value increase, orthogonal to the horizontal distribution D.

### 5.3 Holonomy Integration

**Definition 5.2 (Cognitive Holonomy):**

For a loop γ in Theory Space:

```
W_hol(γ) = ∮_γ α
```

This measures the **accumulated phase** from navigating a closed reasoning path.

**DCQR Integration:**

```
holonomy_residual_u = ⌊ W_hol(γ) / (2π) × HOLONOMY_UNITS_PER_CYCLE ⌋
```

See §12.3 for unit conversion details.

---

## 6. Integration with ThermoGeoLedger (NEW in v0.2)

### 6.1 TIP §6 = Contact Geometry

The ThermoGeoLedger spec (v0.1) implements TIP §6 "Geometric Governance Analogue". The equation:

```
ΔΦ_geo = W_geo − D_geo − D_curv
```

has the following contact-geometric interpretation:

| Term | Contact Geometry | Physical Meaning |
|------|------------------|------------------|
| Φ_geo | Contact Hamiltonian | Min-slack potential |
| W_geo | Horizontal work | Geometry move at fixed policy |
| D_geo | Policy dissipation | Constraint tightening loss |
| D_curv | Holonomy contribution | Path-dependent phase accumulation |

### 6.2 D_curv as Berry Phase

The curvature dissipation term D_curv corresponds to the **Berry phase** accumulated during cognitive navigation:

```
D_curv = λ · Δ(holonomy_residual_u)
```

where λ is the curvature-to-potential conversion factor.

**Geometric interpretation:** D_curv measures how much "cognitive work" is lost to path-dependence. A reasoning loop that returns to the same Theory Space point still accumulates holonomy—this is the geometric cost of the journey itself.

### 6.3 Constraint Propagation

CSRHS witnesses must satisfy ThermoGeoLedger constraints:

```
(T1) SECOND_LAW_OK: D_geo ≥ 0 when hardening declared
(T2) CURVATURE_BUDGET_OK: holonomy_residual_u ≤ max_budget
(T3) POTENTIAL_POSITIVE: Φ_geo_new > 0
```

These are verified at each tick boundary before witness commitment.

---

## 7. ThermoGeoLedger Wire-up

### 7.1 Per-Tick Thermo Records

At each CSRHS tick boundary, emit:

```rust
struct CSRHSThermoRecord {
    tick_id: u64,
    x_pre: TheorySpacePoint,
    x_post: TheorySpacePoint,
    
    // From CSRHS
    tau: Q32_32,
    kappa: Q32_32,
    delta_norm: Q32_32,
    liquid_cost: Q32_32,
    
    // From ThermoGeoLedger
    Phi_geo_pre: Q32_32,
    Phi_geo_post: Q32_32,
    W_geo: Q32_32,
    D_geo: Q32_32,
    D_curv: Q32_32,
    
    // Holonomy tracking
    accumulated_holonomy_u: u64,
    delta_holonomy_u: u64,
    
    // Archive binding
    content_hash: [u8; 32],
}
```

### 7.2 Homotopy Integration

When GMM triggers homotopy mode (kNN Jaccard < 0.90), CSRHS emits per-step thermo records:

```python
def csrhs_homotopy_thermo(path: List[CSRHSTick]) -> CSRHSHomotopyRecord:
    """
    Verify TRIAD trace law across homotopy path.
    """
    total_W = sum(tick.W_geo for tick in path)
    total_D_geo = sum(tick.D_geo for tick in path)
    total_D_curv = sum(tick.D_curv for tick in path)
    
    endpoint_Delta = path[-1].Phi_geo_post - path[0].Phi_geo_pre
    trace_residual = abs(endpoint_Delta - (total_W - total_D_geo - total_D_curv))
    
    return CSRHSHomotopyRecord(
        path_ticks=path,
        total_W_geo=total_W,
        total_D_geo=total_D_geo,
        total_D_curv=total_D_curv,
        endpoint_Delta_Phi_geo=endpoint_Delta,
        TRIAD_OK=(trace_residual < TRIAD_TOLERANCE),
    )
```

---

## 8. Reachability Theory

### 8.1 Horizontal Reachability

**Definition 8.1 (Horizontal Reachable Set):**

```
Reach_H(x₀, T) = { x ∈ ℳ : ∃ horizontal path γ with γ(0)=x₀, γ(T)=x, ∫₀ᵀ ds/τ ≤ T }
```

### 8.2 Chow's Theorem Application

**Theorem 8.1 (Bracket-Generating Reachability):**

If the horizontal distribution D together with its iterated Lie brackets spans Tℳ at every point:

```
span{D, [D,D], [D,[D,D]], ...} = Tℳ
```

then any two points in ℳ are horizontally connected.

**Implication for Metis:** Even under horizontal constraints, full Theory Space reachability is preserved—governance constrains **direction**, not **capability**.

### 8.3 Budget-Bounded Reachability

**Definition 8.2 (Budget-Bounded Reachable Set):**

```
Reach_B(x₀, N) = { x ∈ ℳ : ∃ valid CSRHS witness W from x₀ to x with ≤ N ticks }
```

**Theorem 8.2 (Budget-Reach Relationship):**

```
Reach_B(x₀, N) ⊆ Reach_H(x₀, N · τ_max)
```

Increasing tick budget expands reachable set monotonically.

---

## 9. Invariant Preservation

### 9.1 Modal Invariants

CSRHS preserves the continuity modalities:

| Modality | Verification Point | Content |
|----------|-------------------|---------|
| □G | Tick boundary | Genealogical witness chain |
| □S | Tick boundary | Structural term stability |
| □F | Tick boundary | Functional behavioral floor |

### 9.2 Geometric Invariants

| Invariant | Condition | Verification |
|-----------|-----------|--------------|
| Horizontal | Δᵢ ∈ D_{xᵢ₋₁} | Mask/L membership |
| Cost-bounded | Σ(‖Δ‖/τ) ≤ budget | Accumulator check |
| Archive-sufficient | All values in Q32.32 | Representation check |

### 9.3 Thermodynamic Invariants (NEW in v0.2)

| Invariant | Condition | Verification |
|-----------|-----------|--------------|
| Second Law | D_geo ≥ 0 (hardening) | Per-tick check |
| Curvature Budget | holonomy_u ≤ max_u | Accumulator check |
| Potential Positive | Φ_geo > 0 | Per-tick check |

---

## 10. Soundness and Completeness

### 10.1 Soundness Theorem

**Theorem 10.1 (CSRHS Soundness):**

Any valid CSRHS witness certifies the existence of a horizontal path within the declared tick budget, and all points along that path satisfy governance constraints.

**Proof:**

Let W be a valid CSRHS witness with ticks [(x₀, Δ₁, τ₁, κ₁), ..., (xₙ₋₁, Δₙ, τₙ, κₙ)].

Define γ: [0,n] → ℳ by linear interpolation:
```
γ(t) = xᵢ + (t - i)·Δᵢ₊₁   for t ∈ [i, i+1]
```

(1) Boundary conditions hold by construction.

(2) Each segment has derivative proportional to Δᵢ ∈ D_{xᵢ₋₁}. By continuity of D and the assumption that steps are small relative to D's variation, γ'(t) ∈ D_{γ(t)}.

(3) The liquid cost integral:
```
∫₀ᵀ ds/τ = Σᵢ ∫_{segment i} ds/τ(γ(s), I(s))
         ≤ Σᵢ ‖Δᵢ‖/τᵢ        (by τᵢ = min over segment)
         ≤ budget             (by V4)
```

(4) Governance admissibility follows from V5 and the Timeful spec soundness theorem. □

### 10.2 Completeness Theorem

**Theorem 10.2 (CSRHS Completeness):**

Any governance-admissible horizontal path γ with finite liquid cost can be discretized into a valid CSRHS witness.

**Proof:**

Partition γ at points where accumulated liquid cost crosses integers:

```
tᵢ = inf { t : ∫₀ᵗ ds/τ(γ(s), I(s)) ≥ i }
```

Set xᵢ = γ(tᵢ) and Δᵢ = xᵢ - xᵢ₋₁.

By construction:
- Each Δᵢ is tangent to γ, hence horizontal
- Liquid cost per tick is exactly 1 (up to rounding at final tick)
- Total ticks = ⌈∫ ds/τ⌉ ≤ budget if path was within budget

Governance witnesses transfer from the continuous path evaluation. □

### 10.3 Archive Sufficiency Theorem

**Theorem 10.3 (Tier=Full Eliminability):**

When Full-tier CSRHS artifacts are present, certification is re-derivable from archives without trusted oracle attestations.

**Proof:**

The CSRHS witness contains:
1. All xᵢ in canonical Q32.32 encoding
2. All Δᵢ in canonical Q32.32 encoding  
3. τ and κ as pure functions of x (recomputable)
4. Input hashes (verifiable against archived inputs)
5. Modality witnesses (archive-sufficient per Timeful spec)

A verifier:
1. Recomputes x-sequence from x₀ and Δ-sequence
2. Recomputes τᵢ, κᵢ from xᵢ
3. Verifies horizontal membership via Mask and L
4. Verifies budget constraints
5. Verifies modality witnesses

No external oracle required. □

---

## 11. Safety Analysis

### 11.1 Failure Modes

| Failure Mode | Detection | Mitigation |
|--------------|-----------|------------|
| τ → 0 (infinite ticks) | T4 bound τ ≥ τ_min | Fail-closed, halt |
| κ → ∞ (singular curvature) | K2 bound |κ| < κ_max | Staged homotopy |
| Horizontal escape | H1-H4 verification | Witness rejection |
| Budget exhaustion | V3, V4 checks | Graceful degradation |
| Holonomy overflow | CURVATURE_BUDGET_OK | DCQR loop rejection |

### 11.2 Attack Vectors

| Attack | Defense |
|--------|---------|
| Forge witness with non-horizontal Δ | Mask/L membership verified |
| Manipulate τ to inflate budget | τ recomputed from x, not trusted |
| Exploit curvature computation | κ bounded and discretization-stable |
| Denial via infinite ticks | τ_min enforces finite tick density |
| Holonomy accumulation attack | DCQR max_holonomy_residual_u cap |

### 11.3 Invariant Preservation

**Claim:** CSRHS preserves □S, □F, □G continuity constraints.

**Argument:**
- □S: Structural continuity verified at tick boundaries (inherited from Timeful)
- □F: Functional continuity verified at tick boundaries (inherited from Timeful)
- □G: Genealogical continuity via witness chain (extended from SR_Genealogy)

The liquid time constant affects **tick density** but not **what is verified** at each tick.

---

## 12. Parameter Selection

### 12.1 Recommended Defaults

```
τ_base = 1.0          # Base time constant
α = 0.1               # Curvature sensitivity
β = 1.0               # Value gradient sensitivity (high = cautious near boundary)
γ = 0.05              # Input sensitivity
δ = 0.01              # Kinetic density sensitivity (NEW in v0.2)
τ_min = 0.01          # Minimum τ (prevents infinite ticks)
τ_max = 10.0          # Maximum τ (prevents coarse jumps)
κ_max = 100.0         # Curvature bound
δ_κ = 10.0            # Curvature smoothness threshold
```

### 12.2 Tuning Guidelines

| Goal | Adjustment |
|------|------------|
| More responsive near identity | Increase β |
| Smoother in high-curvature regions | Decrease α or increase τ_min |
| More input-adaptive | Increase γ |
| Coarser ticks (efficiency) | Increase τ_base |
| Finer ticks (safety) | Decrease τ_base or τ_max |
| React to proposal density | Increase δ (NEW in v0.2) |
| Faster equilibration bound | Reduce τ_max toward 1/λ₁ (NEW in v0.2) |

### 12.3 HOLONOMY_BUDGET Unit Conversion (NEW in v0.2)

**Problem:** The geometric holonomy W_hol(γ) is measured in radians (with 2π = one full cycle), but DCQR holonomy_residual_u uses integer micro-units.

**Conversion Bridge:**

```
HOLONOMY_UNITS_PER_RADIAN = 159155      # ≈ 1,000,000 / (2π)
HOLONOMY_BUDGET_RADIANS = 2π            # One full cognitive cycle
HOLONOMY_BUDGET_U = 1_000_000           # ThermoGeoLedger max_holonomy_residual_u

# Conversion functions
def radians_to_u(rad: float) -> int:
    return int(rad * HOLONOMY_UNITS_PER_RADIAN)

def u_to_radians(u: int) -> float:
    return u / HOLONOMY_UNITS_PER_RADIAN
```

**Invariant:** 

```
HOLONOMY_BUDGET_U = HOLONOMY_UNITS_PER_RADIAN * HOLONOMY_BUDGET_RADIANS
1_000_000 = 159155 * 2π ≈ 999999.5  (rounding)
```

**PolicyProfile alignment:**

```yaml
curvature_budget:
  max_holonomy_residual_u: 1_000_000   # = 2π radians
  lambda_curv_to_potential: 1e-6       # D_curv = λ · Δholonomy_u
```

---

## 13. Relationship to External Work

### 13.1 Liquid Time-Constant Networks (Hasani et al.)

| LTC Networks | CSRHS |
|--------------|-------|
| Continuous ODE dynamics | Continuous in horizontal distribution |
| τ(x, I) modulates derivative | τ(x, I) induces tick boundaries |
| Solver-dependent | Witness-based (solver-free verification) |
| Bounded hidden states | Bounded by K_id^min containment |

CSRHS can be viewed as a **governance wrapper** around LTC-style dynamics.

### 13.2 Sub-Riemannian Geometry (Montgomery)

CSRHS instantiates sub-Riemannian geometry with:
- Horizontal distribution from safety constraints (not geometric bracket generation)
- Carnot-Carathéodory metric approximated via witnesses (not computed directly)
- Contact structure from value boundary (not standard contact form)

### 13.3 Hybrid Automata

CSRHS is a **contact hybrid automaton** with:
- Continuous dynamics: flow in D_x
- Discrete transitions: tick-boundary governance
- Guards: liquid cost accumulation
- Resets: none (state preserved across ticks)

### 13.4 Boltzmann Kinetic Theory (NEW in v0.2)

CSRHS Kinetic Layer follows Hilbert's 6th Problem structure:

| Hierarchy | Equation | CSRHS Role |
|-----------|----------|------------|
| Micro (Newton) | N-body dynamics | Individual proposal ticks |
| Meso (Boltzmann) | ∂f/∂t + v·∇f = Q(f) | Kinetic Layer |
| Macro (Navier-Stokes) | Hydrodynamic flow | Continuous horizontal flow |

The Boltzmann-Grad scaling Nε^{d-1} = α ensures rigorous derivation of macro from meso.

---

## 14. Open Questions

1. **Optimal τ calibration:** Can τ parameters be learned while maintaining safety?

2. **Higher-order curvature:** Should τ depend on Riemann tensor beyond scalar curvature?

3. **Anisotropic τ:** Should τ vary by direction in T_x ℳ, not just by position?

4. **Bracket-generating extensions:** Can CSRHS support non-bracket-generating distributions via virtual ticks?

5. **Quantum analogues:** Is there a coherent extension to quantum state spaces?

6. **(NEW) Friedman-Ramanujan bound integration:** Can spectral gap λ₁ ≥ 2√(d-1) be used to derive τ_max calibration from first principles?

7. **(NEW) Kinetic entropy monitoring:** Should S_kinetic = -∫ f log f be tracked alongside geometric entropy?

8. **(NEW) Kakeya extraction:** Can the Wolff axioms (from Kakeya set analysis) inform optimal horizontal path selection?

---

## 15. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-01-23 | Initial specification |
| 0.2 | 2026-02-01 | Kinetic Layer integration, Cognitive Time binding, TIP §6 contact recognition, HOLONOMY_BUDGET bridge, Friedman-Ramanujan bounds |

---

## 16. References

[1] Devon. "SR_Genealogy_LambdaMaL v1.2." Production bundle, January 2026.

[2] Devon. "Timeful Governed Self-Modification." Archive-sufficient report, January 2026.

[3] Devon. "λMaL Type System." Research paper, 2025.

[4] Hasani, R. et al. "Liquid Time-constant Networks." AAAI 2021.

[5] Montgomery, R. "A Tour of Subriemannian Geometries, Their Geodesics and Applications." AMS, 2002.

[6] Devon. "MaL-Cortex Safety Architecture." Research paper, December 2025.

[7] Devon. "Non-Forward-Closed Theory Spaces." Research report, 2025.

[8] Devon. "ThermoGeoLedger Spec v0.1." MaL-Cortex specification, January 2026.

[9] Saint-Raymond, L. "Hydrodynamic Limits of the Boltzmann Equation." Springer, 2009. (Hilbert 6th Problem)

[10] Friedman, J. "A Proof of Alon's Second Eigenvalue Conjecture and Related Problems." Memoirs AMS, 2008. (Spectral gaps)

---

## Appendix A: Notation Summary

| Symbol | Meaning |
|--------|---------|
| ℳ | Theory Space manifold |
| g | Riemannian metric |
| D_x | Horizontal distribution at x |
| τ(x, I) | Liquid time constant |
| κ(x) | Scalar curvature |
| ∇V(x) | Value gradient |
| Π(γ) | Tick projection of path γ |
| d_CC | Carnot-Carathéodory distance |
| W | CSRHS witness |
| □G, □S, □F | Genealogical, structural, functional modalities |
| K_id^min | Identity floor (immutable axioms) |
| t_cog | Cognitive time (= ∫ ds_T) |
| f(x,v,t) | Kinetic proposal distribution |
| ρ(x) | Proposal density (∫ f dv) |
| λ₁ | Spectral gap (Friedman-Ramanujan bound) |
| α | Contact form |
| R | Reeb vector field |
| W_hol | Holonomy (∮ α) |
| Φ_geo | Geometric potential (min slack) |
| D_curv | Curvature dissipation (Berry phase) |

---

## Appendix B: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    CSRHS v0.2 QUICK REFERENCE                   │
├─────────────────────────────────────────────────────────────────┤
│ STRUCTURE:   H = (ℳ, g, D, τ, Π, G, Γ)                          │
│                                                                 │
│ LIQUID τ:    τ(x,I) = τ_base / (1 + α|κ| + β|∇V| + γσ(I) + δρ) │
│                                                                 │
│ TICK FIRES:  when ∫ ds/τ ≥ 1                                    │
│                                                                 │
│ COG TIME:    t_cog = ∫ ds_T  (time IS distance)                 │
│                                                                 │
│ KINETIC:     ∂f/∂t + v·∇f = Q(f)   (proposal distribution)      │
│                                                                 │
│ WITNESS:     W = {ticks: [(x,Δ,τ,κ)...], budget, □G□S□F}        │
│                                                                 │
│ VALID IFF:   Δ∈D, path consistent, cost≤budget, □ hold          │
│                                                                 │
│ THERMO:      ΔΦ_geo = W_geo − D_geo − D_curv (contact geometry) │
│                                                                 │
│ HOLONOMY:    2π radians = 1,000,000 μ-units                     │
│                                                                 │
│ ARCHIVE:     Full-tier eliminable, Q32.32 canonical             │
├─────────────────────────────────────────────────────────────────┤
│ DEFAULTS:    τ_base=1, α=0.1, β=1.0, γ=0.05, δ=0.01            │
│              τ_min=0.01, τ_max=10, κ_max=100                    │
│              HOLONOMY_BUDGET_U=1,000,000                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Appendix C: Kinetic Layer Constants (NEW in v0.2)

```
# Boltzmann-Grad scaling
KINETIC_ALPHA = 1.0               # Nε^{d-1} = α

# Spectral gap (Friedman-Ramanujan)
SPECTRAL_GAP_MIN = 2 * sqrt(d-1)  # λ₁ lower bound
TAU_MAX_FROM_GAP = 1.0 / SPECTRAL_GAP_MIN

# Entropy tracking
KINETIC_ENTROPY_FLOOR = 0.0       # S ≥ 0 (convention)
ENTROPY_PRODUCTION_CAP = 100.0    # dS/dt_max for stability

# Holonomy unit bridge
HOLONOMY_UNITS_PER_RADIAN = 159155
HOLONOMY_BUDGET_RADIANS = 2 * PI
HOLONOMY_BUDGET_U = 1_000_000
LAMBDA_CURV_TO_POTENTIAL = 1e-6
```

---

*End of Specification*
