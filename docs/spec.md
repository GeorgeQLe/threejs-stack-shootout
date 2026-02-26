# web-3d-tech-stack-bench Spec

Date captured: 2026-02-26
Status: Draft baseline spec for implementation planning

## 1) Goal
Build a pnpm workspace monorepo that implements equivalent 3D tutorial apps and an at-scale stress test across multiple web 3D stacks, then benchmark all stacks with a shared in-browser HUD + recorder and a shared CLI summarizer/comparator.

## 2) Canonical Repo Layout
```text
web-3d-tech-stack-bench/
  README.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
  .gitignore

  packages/
    shared/
      src/
        ecs/{World.ts,Components.ts,Systems.ts}
        time/fixedStep.ts
        math/rng.ts
        scene/sceneConfig.ts
        ui/params.ts
    bench/
      src/
        core/{BenchController.ts,BenchMetrics.ts,BenchRecorder.ts,BenchSampler.ts,BenchReport.ts,BenchSuite.ts}
        hud/{BenchHud.ts,hud.css}
        instrumentation/{webglStats.ts,longTasks.ts,memory.ts}
        export/download.ts
    cli/
      src/{index.ts,summarize.ts,compare.ts,schema.ts}

  apps/
    three-html/
      src/{main.ts,app.ts,scenes/*}
    three-pixi/
      src/{main.ts,app.ts,scenes/*,ui/pixiOverlay.ts}
    babylon-gui/
      src/{main.ts,app.ts,scenes/*}

  docs/
    00-benchmarking-protocol.md
    01-metrics-and-data-format.md
    02-tech-stacks-specs.md
    03-scene-specs.md
    04-at-scale-stress-test-spec.md
```

## 3) Root Tooling Requirements
1. Package manager: `pnpm@9`
2. Workspace: `packages/*`, `apps/*`
3. Task runner: Turborepo with `dev`, `build`, `lint`, `typecheck`
4. Base TypeScript: ES2022, DOM libs, strict mode, no emit
5. Root scripts:
   - `pnpm dev`
   - `pnpm build`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm bench:summarize path/to/run.json`
   - `pnpm bench:compare path/to/runA.json path/to/runB.json ...`

## 4) Shared Package Requirements (`@bench/shared`)
1. Deterministic RNG (`xorshift32`) for fair reproducibility.
2. Fixed timestep helper:
   - `fixedDtMs = 16.6667`
   - `maxSubSteps = 4`
3. Minimal ECS APIs:
   - Numeric entity ids
   - Sparse component maps
   - Query intersection and ordered systems
4. Scene contract + presets via `SCENES` with ids:
   - `rotatingCube`
   - `bouncingBallPhysics`
   - `gltfViewer`
   - `solarSystem`
   - `atScale`
5. UI param type definitions for shared knobs.

## 5) Bench Package Requirements (`@bench/bench`)
1. Stable metrics schema (`schemaVersion: 1.0.0`) with:
   - Per-frame samples (frame dt, cpu work, long tasks, heap, renderer stats, entities, notes)
   - Run metadata (stack, scene, preset, knobs, viewport, device info)
   - Summary percentiles and totals
2. Recorder state machine:
   - `idle -> warming -> recording -> done`
3. Frame sampler hooks:
   - entities
   - draw calls
   - triangles
   - notes
4. Instrumentation adapters:
   - Long task observer
   - Heap snapshot (`performance.memory` when available)
   - WebGL vendor/renderer/version
5. HUD overlay:
   - Scene/preset controls
   - Start recording action
   - Live readouts (fps, frame ms, entities, draws, triangles, heap, long tasks, notes)
6. JSON exporter for automatic run artifact downloads.

## 6) CLI Package Requirements (`@bench/cli`)
1. Validate input artifacts using `zod` schema.
2. `summarize` command:
   - Reads one artifact
   - Prints normalized JSON summary fields
3. `compare` command:
   - Reads >=2 artifacts
   - Prints CSV rows for easy spreadsheet comparison
4. Entry command form:
   - `bench-cli summarize <run.json>`
   - `bench-cli compare <runA.json> <runB.json> ...`

## 7) App Stack Requirements

### 7.1 `apps/three-html`
1. Renderer: Three.js (`WebGLRenderer`)
2. UI: Bench HUD + HTML widgets for at-scale UI load
3. Physics: Rapier for physics scenes
4. Stats: `renderer.info.render.calls`, `renderer.info.render.triangles`

### 7.2 `apps/three-pixi`
1. Renderer: Three.js base canvas
2. UI: Pixi overlay canvas (dual-canvas mode)
3. At-scale UI load: Pixi widgets updated every frame
4. Stats: Three renderer info as primary; Pixi-specific notes optional

### 7.3 `apps/babylon-gui`
1. Renderer: Babylon Engine + Scene
2. UI: Babylon GUI overlay
3. Physics: Prefer direct Rapier stepping + transform sync for parity
4. Stats: Babylon instrumentation where possible; document non-comparable counters in notes

## 8) Shared Scene Contract
Each stack supports the same scene API surface:
1. `load(sceneId, presetName)`
2. `update(dt, time, alpha)`
3. `render(alpha)`
4. `getStats(): { drawCalls?: number; triangles?: number }`
5. `getEntityCount(): number`
6. `getNotes(): string | undefined`

## 9) Scene and Preset Matrix

### 9.1 Rotating Cube
- Preset: `baseline`
- Knobs: `cubeCount`, `lights`

### 9.2 Bouncing Ball (Physics)
- Presets: `baseline`, `many-balls`
- Knobs: `balls`, `restitution`

### 9.3 GLTF Viewer
- Presets: `baseline`, `instanced`
- Knobs: `model`, `instances`

### 9.4 Solar System
- Presets: `baseline`, `dense`
- Knobs: `planets`, `moons`

### 9.5 At-Scale Stress Test
- Presets: `scale-small`, `scale-medium`, `scale-large`, `scale-physics`
- Required knobs: `entities`, `instanced`, `physics`, `physicsBodies`, `uiWidgets`, `lights`
- Required safety caps:
  - entities <= 100k
  - physicsBodies <= 10k
  - uiWidgets <= 1000

## 10) Benchmark Protocol (Fairness Rules)
1. Keep browser version, viewport, and DPR consistent.
2. Avoid interactions during warmup+record windows.
3. Run each `(stack, scene, preset)` at least 5 times.
4. Validate parity across runs:
   - same GPU path (vendor/renderer)
   - same knobs and preset
   - same warmup and record durations

## 11) Primary Comparison Metrics
1. `frameTimeMs.p95` and `frameTimeMs.p99` (primary smoothness)
2. `fpsAvg`
3. Diagnostics:
   - `cpuWorkMs` percentiles
   - `longTasksTotal`
   - `heapUsedBytes` percentiles
   - draw calls / triangles (interpret carefully across engines)

## 12) Implementation Checklist
1. Scaffold workspace and all packages/apps.
2. Implement shared + bench + cli packages.
3. Implement all three app harnesses.
4. Implement all five scenes per app.
5. Wire Bench HUD, recording flow, artifact export.
6. Execute benchmark matrix with repetitions.
7. Summarize and compare artifacts with CLI.

## 13) Canon and Change Control
1. This file is the baseline canonical spec for this repository iteration.
2. Any divergence must be logged in `docs/can.md`.
3. Phase-level planning updates must also be logged in `docs/planning-change-log.md`.
