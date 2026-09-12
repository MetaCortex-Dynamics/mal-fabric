# DEMO-001 — Visible Fabric

A runnable vertical slice of the product thesis:

> A user can describe behavior, see its program geometry, change that geometry directly, and observe the behavior change without losing canonical program identity.

## Run the demo

From the repository root:

```powershell
python v3/software_fpga/demo_001_visible_fabric/demo_server.py
```

Open [http://127.0.0.1:8765](http://127.0.0.1:8765).

No package installation, build step, API key, network service, or LLM is required. Python 3.11 or later is sufficient.

## Demo path

1. Keep the supplied prompt and select **Propose fabric**.
2. Inspect the yellow candidate relations and the canonical text projection.
3. Select **Accept admitted edit**. The proposer itself never commits.
4. Select **Start V3.3**, then **Run wavefront** to see `WHEN` payload phases.
5. Select a route on the canvas and choose **Disconnect selected route**.
6. Inspect and accept the governed candidate, then run again.
7. Compare **Show BLOCKED** with **Show HALTED**.

The complete scripted fixture is in `fixture.json`.

## Run D01–D18

```powershell
python v3/software_fpga/demo_001_visible_fabric/run_acceptance.py
```

To write the deterministic result as JSON:

```powershell
python v3/software_fpga/demo_001_visible_fabric/run_acceptance.py --json v3/software_fpga/demo_001_visible_fabric/acceptance-summary.json
```

## Contract

```text
visual ─┐
text   ─┼→ one V3.1 FabricSpec
NL     ─┘

FabricEdit
→ V3.1 normalize / DRC
→ V3.2 governed admission
→ explicit acceptance
→ V3.3 execution
```

The frozen demo specification and handoff are included beside this README. See `IMPLEMENTATION_NOTES.md` for boundary details and `NORMATIVE_TARGET.md` for the exact imported kernel identities.
