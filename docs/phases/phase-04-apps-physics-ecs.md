# Phase 04: Stack B Implementation (`three-pixi`)

## Objective
Implement the Three.js + Pixi overlay stack with equivalent scenes and benchmark behavior.

## Detailed Steps
1. Scaffold dual-canvas app entry:
   - Three base canvas
   - Pixi overlay canvas (`pointer-events: none` by default)
2. Implement Pixi overlay utility:
   - create/resize/dispose lifecycle
   - widget spawning and per-frame updates
3. Reuse comparable Three scene/harness logic from Stack A where valid.
4. Implement scenes with parity constraints:
   - `rotatingCube`
   - `bouncingBallPhysics`
   - `gltfViewer`
   - `solarSystem`
   - `atScale` (Pixi widget stress path)
5. Integrate benchmark instrumentation/controller/HUD.
6. Ensure stats and notes include UI implementation details where relevant.
7. Validate recording completeness and artifact download.

## Deliverables
1. Fully runnable `three-pixi` app with parity scene set.
2. Pixi stress-path implementation for at-scale scenario.

## Exit Criteria
1. `pnpm dev --filter three-pixi` runs.
2. Recording outputs valid artifacts across baseline and at-scale presets.
