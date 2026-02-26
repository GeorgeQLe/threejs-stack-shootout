# Phase 05: Stack C Implementation (`babylon-gui`)

## Objective
Implement the Babylon.js + Babylon GUI stack with equivalent benchmark interface and scenes.

## Detailed Steps
1. Scaffold Babylon app entry and engine lifecycle.
2. Create shared scene manager interface matching the cross-stack contract.
3. Implement benchmark integration:
   - instrumentation adapters
   - controller/HUD wiring
   - per-frame cpuWork measurement and ingestion
4. Implement scenes with parity guidance:
   - `rotatingCube`
   - `bouncingBallPhysics` (direct Rapier stepping + transform sync)
   - `gltfViewer`
   - `solarSystem`
   - `atScale` (Babylon GUI widget stress path)
5. Capture stats and notes for non-identical instrumentation counters.
6. Validate artifact generation and schema compatibility with CLI.

## Deliverables
1. Fully runnable `babylon-gui` app with all required scenes.
2. Comparable benchmark artifacts for all presets.

## Exit Criteria
1. `pnpm dev --filter babylon-gui` runs.
2. Artifact files are parseable by `@bench/cli` schema.
