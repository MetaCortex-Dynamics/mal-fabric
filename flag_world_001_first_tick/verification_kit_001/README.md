# NVIDIA verification kit — candidate

This kit is local review work, not a promotion or a portability receipt. Frozen evidence is unchanged.

## Implemented command

From a checkout containing this directory, run:

```powershell
node flag_world_001_first_tick/verification_kit_001/replay.mjs --target genesis --output ../genesis-replay-001
```

The output directory must not exist. The command rebuilds both retained CUDA evaluators and the GPU SHA-256 primitive, decodes the captured frame, lowers the sealed sources, executes four GPU closures, regenerates field/witness/hash-response bytes, and compares the complete committed genesis record. Expected outputs are comparison-only; generated field, witness and hash responses feed subsequent stages. No archived closure is used as a runtime checkpoint for this target.

Requirements: Git checkout, Node.js 22, an NVIDIA CUDA-capable device, CUDA `nvcc`, and a supported C++ compiler. The recorded execution target is Windows x64 / RTX 3070 / `sm_86`. The launcher discovers CUDA 13.2 at its standard Windows installation path, otherwise `CUDA_PATH` or `nvcc` on PATH. On Windows it uses the standard Visual Studio 2022 Build Tools `vcvars64.bat`; other installations can supply `--nvcc PATH --vcvars PATH`. Toolchain, driver, GPU identity, commands, source/binary identities and comparison results go into `REPLAY_RECEIPT.json`. A different toolchain or device produces a new execution receipt, not an inherited one. Linux support is not yet witnessed.

The implementation retains generic JavaScript parsing, observation and orchestration. No Python is executed. No private corpus, original drive layout, board connection, network service, package registry or prebuilt executable is required at runtime. The original absolute paths in historical records are provenance data, not paths the replay opens.

An input-custody check without GPU execution is:

```powershell
node flag_world_001_first_tick/verification_kit_001/replay.mjs --target audit --output ../genesis-audit-001
```

## Separate targets and limits

| Target | Comparison contract | Current kit status |
|---|---|---|
| Genesis | Captured frame `4472CFC5…`; Ground₀ `B263644E…`; complete field, overlap witness, receipt, all four readbacks and committed record `FDA61487…` | Replay command implemented; consult execution receipts for results |
| Frozen V1/V2 | Exact frozen inputs and outputs `69786966…` / `BD0492B4…`; empty routes | Existing promoted CONFORM IF_THEN, bound to this kit; fresh kit V1 replay SAME; V2 evidence reused without rerun |
| J17 link 2 | Six comparators, twelve admitted routes; complete program, fabric successor, unchanged world field and new link `173e0fa1…` | Primary and separate-builder replays IF_THEN; thirteen full readbacks and three complete canonical outputs SAME |

Genesis does not establish V1/V2 conformance. V1/V2 do not exercise route propagation. J17 link 2 is a world-field fixed point with changed fabric custody; it does not establish tick-3 admission.

## Follow-on commands

Each command regenerates genesis first, builds the retained target evaluator, then derives its continuation inputs from the preceding GPU readback. It never resumes from an archived reference readback.

```powershell
node flag_world_001_first_tick/verification_kit_001/followon.mjs --target j17 --output ../j17-replay-001
node flag_world_001_first_tick/verification_kit_001/followon.mjs --target V1 --output ../V1-replay-001
node flag_world_001_first_tick/verification_kit_001/followon.mjs --target V2 --output ../V2-replay-001
```

Windows/toolchain requirements are the same as genesis. An existing generated genesis may be reused with `--genesis ../genesis-replay-001`: the launcher requires its executed IF_THEN receipt and checks the committed predecessor and every consumed input against the frozen bindings. This option does not accept a historical expected-output directory in place of execution.

V1/V2 are long runs. A target receipt is written only when the command ends. While it runs, `stage01/readback.bin.epochs.jsonl` and `stage01/readback.bin.progress.jsonl` are runtime telemetry, not a verdict. The vector evaluator retains the recorded fixed allocation and stops on exhaustion; the J17 runtime records its per-stage capacity. A missing readback or nonzero runtime error cannot advance a stage. Do not infer V2 capacity from V1.

`FOLLOWON_CONTRACT.json` binds sealed stage sources, input identities, image identities, complete readbacks, helpers and canonical expected outputs. Historical absolute paths are descriptive metadata only. The two relocated JavaScript imports are recorded in that manifest; the application sources and CUDA were not changed. `telemetry.inc` is a byte-exact include shared by both original executors, SHA-256 `E7033E77BB0F27343AF16277536D7441D26775A2475745BF890B5C7F59ECE81D`, pinned separately by the launcher.

J17's source-generated occurrence inventory is regenerated and checked before the stage containing its facts is lowered. Vector cell-identity facts are treated the same way. Hash and sorting responses are generated from source requests; frozen responses are never supplied as replacements.

The original ordered V1/V2 comparison tool is retained as `followon/tools/compare_vectors.mjs`; the individual replay targets also compare the whole committed output. Neither target alone declares combined V1/V2 CONFORM.

### Promoted V2 evidence binding

`verification/v2_binding/BINDING.json` binds receipt `162397CB…31470E` and combined run record `6089FDC4…9A8F99` to all fourteen kit V2 sources, input identities, evaluator source/include, historical executor binary, predecessor/readback identities and recorded invocation arguments. Supporting records and all referenced stage-input snapshots are included byte-exact in that directory. Archived snapshots are evidence only; the portable runner regenerates continuation inputs.

Run `node flag_world_001_first_tick/verification_kit_001/verify-v2-binding.mjs` to check this binding without a GPU run. This does not reopen promoted CONFORM. The CUDA source and guard are unchanged; the lowerer's only changes relocate its helper import, recorded in `FOLLOWON_CONTRACT.json`. The new portable launcher is separately identified; the historical receipt is not relabelled as an execution of that launcher. Existing V2 execution evidence is reused, not made pending by the absence of a duplicate replay.

All application dependencies are included. External prerequisites are publicly distributed: [Node.js](https://nodejs.org/en/download), [CUDA toolkit and driver archive](https://developer.nvidia.com/cuda-toolkit-archive), and [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/downloads/). These official pages were checked on 2026-10-23. Installers are not bundled or claimed byte-identical to the historical installations. The NVIDIA device and Windows platform remain prerequisites, not private dependencies.

No missing application dependency or source/executor/input mismatch was found. The remaining distribution action is publication of this locally sealed kit; no commit or push has been performed. No GPU rerun was made for this evidence-binding update.

## Negative controls

The command executes the actual capture decoder against a missing file, a one-byte-altered capture and a displaced input (capture-classification JSON in place of the captured frame). Each must refuse without emitting a frame. These are frozen identity/transport controls, not claims about all malformed world states. An error or byte mismatch preserves the output and logs, returns a nonzero process status and withholds a successful replay verdict.

## Custody

`GENESIS_CONTRACT.json` binds copied bytes, expected identities and historical origins. The launcher pins its SHA-256. Original `.mal`, CUDA, helpers and records are copied without newline conversion. Historical assembly members whose original paths were subsequently changed are recovered only from exact hash-matching byte spans of the bound assembled source; their origin, offset and historical path are listed. The sealed originals remain untouched.

During development, a clean base checkout plus the exact uncommitted candidate-kit overlay is an isolated candidate test, not a claim that the public repository already contains this kit. Publication and a commit are separate actions.

`verification/REPRODUCTION.md` and its receipts record the two genesis executions and two J17 executions. Verify the distributed candidate's complete membership and bytes with `node flag_world_001_first_tick/verification_kit_001/seal.mjs verify`. This is custody, not promotion.

## Independent reproduction and backends

A separate builder should run the same command from an isolated checkout, retaining its own command, software/device identities, complete outputs and receipt. That witnesses reproduction of this implementation. A separately implemented backend is a different qualification: it must consume the same frozen contract and produce byte-identical canonical outputs and the specified negative outcomes. Neither a second invocation nor a second agent running this CUDA implementation establishes an independent backend.

“Zero drift” means byte-identical canonical outputs for named vectors on recorded devices and software versions. AMD, Apple Silicon and WGSL have no execution receipt from this kit. They do not inherit the RTX 3070 result.
