# Phase 03: Stack A Implementation (`three-html`)

## Objective
Implement the Three.js + HTML stack with all required scenes, benchmark integration, and recording flow.

## Detailed Steps
1. Scaffold Vite app entry:
   - `index.html`, `src/main.ts`, `src/app.ts`, scene files
2. Build renderer harness:
   - renderer/camera/scene lifecycle
   - resize + DPR handling
   - clear color and camera parity rules
3. Integrate benchmark runtime:
   - long task, memory, WebGL instrumentation
   - `BenchController`
   - `BenchHud` scene/preset apply + record actions
4. Implement scenes:
   - `rotatingCube`
   - `bouncingBallPhysics` (Rapier + fixed step)
   - `gltfViewer`
   - `solarSystem`
   - `atScale` (HTML widget stress path)
5. Implement scene switching and cleanup semantics.
6. Measure `cpuWorkMs` each frame and ingest samples.
7. Validate artifact download and schema fields.

## Deliverables
1. Fully runnable `three-html` app with all scenes/presets.
2. Downloadable benchmark artifacts.

## Exit Criteria
1. `pnpm dev --filter three-html` runs.
2. Recording completes and downloads a valid `schemaVersion: 1.0.0` artifact.
