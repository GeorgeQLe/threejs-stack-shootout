# Phase 02: Shared + Bench Core Packages

## Objective
Implement the reusable runtime contracts used by all stacks: shared scene/time/ECS utilities and browser benchmark instrumentation.

## Detailed Steps
1. Implement `@bench/shared` exports:
   - ECS (`World`, `Components`, `Systems`)
   - fixed-step time helper
   - deterministic RNG
   - scene config + presets
   - UI param schema
2. Implement `@bench/bench` metrics contracts:
   - `PerFrameSample`, `RunMetadata`, `SummaryStats`, `BenchRunArtifact`
3. Implement frame sampling + recorder lifecycle:
   - sampler hooks for entities/draws/triangles/notes
   - recorder warmup/record/done transitions
   - summary percentile calculations
4. Implement instrumentation adapters:
   - long task counter
   - heap snapshot helper
   - WebGL info collector + `setGLContext`
5. Implement HUD controls and live metric panel.
6. Implement JSON download utility.
7. Validate type safety:
   - `pnpm --filter @bench/shared typecheck`
   - `pnpm --filter @bench/bench typecheck`

## Deliverables
1. Shared deterministic runtime modules.
2. Shared bench runtime/HUD/recorder modules.

## Exit Criteria
1. Both packages typecheck.
2. Bench package can be consumed by app harnesses without local forks.
