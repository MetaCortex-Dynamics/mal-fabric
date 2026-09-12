# DEMO-002 — Vibe Proposer

DEMO-002 turns constrained natural-language intent into a typed, visible
proposal before that geometry receives authority.

```text
IntentRequest
→ bounded ProposalContext
→ typed IntentProposal
→ GeometricDiff + PROMOTED/CANDIDATE text
→ user ACCEPT / MODIFY / REJECT
→ existing V3.1 DRC + V3.2 admission
→ commit
→ existing V3.3 execution
```

The proposer cannot write the promoted `FabricSpec`. `ACCEPT` changes proposal
lifecycle state to `ACCEPTED_FOR_ADMISSION`; it does not commit. The separate
admission action recomputes the exact candidate from the bound baseline and
submits its canonical edits through the imported authority path.

## Run the demo

From the governance repository root:

```powershell
python -B v3/software_fpga/demo_002_vibe_proposer/demo_server.py
```

Open [http://127.0.0.1:8766](http://127.0.0.1:8766). No dependency install,
API key, network service, or external model is required.

## Run conformance

```powershell
python -B v3/software_fpga/demo_002_vibe_proposer/run_conformance.py `
  --output v3/software_fpga/demo_002_vibe_proposer/evidence
```

The frozen census is:

```text
P01–P06  6
G01–G05  5
D01–D06  6
A01–A05  5
N01–N02  2
TOTAL    24
```

The suite emits 24 vector receipts plus one canonical summary. Run it twice
into clean directories and compare the 25 files byte-for-byte.

## Supported deterministic grammar

- make the enemy flee when health is low;
- make the enemy approach when the player is near;
- disconnect the patrol consequence;
- move the health-low branch into the functional region.

Unsupported or ambiguous text yields `PROPOSAL_PARSE_MAYBE`, never an empty
candidate. The grammar makes no arbitrary-language completeness claim.

## G01 edit closure

The authorized G01 correction tests an added route traced to `CONNECT`.
Although the generic diff renderer can represent added cells, the proposer
cannot originate one because the imported V3.1 edit surface has no `ADD_CELL`.

## Imported authority

DEMO-002 imports mal-fabric v0.4.0 and DEMO-001 unchanged. See
`NORMATIVE_TARGET.md` and `IMPLEMENTATION_NOTES.md` for exact boundaries.
