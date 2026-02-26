# Phase 06: Cross-Stack Validation and Benchmark Execution

## Objective
Validate parity, execute the benchmark matrix, and produce summary/compare outputs.

## Detailed Steps
1. Validate all builds and type checks:
   - `pnpm typecheck`
   - `pnpm build`
2. Validate parity assumptions per stack:
   - viewport + DPR handling
   - camera/light defaults
   - fixed-step behavior in physics scenes
3. Execute benchmark matrix:
   - 3 stacks x all scene presets
   - >=5 runs per `(stack, scene, preset)`
4. Store artifacts in a consistent folder layout (for example `results/<date>/<stack>/<scene>/<preset>/`).
5. Run CLI tools:
   - `pnpm bench:summarize <run.json>`
   - `pnpm bench:compare <runA> <runB> ...`
6. Produce a comparison table emphasizing:
   - `frameTimeMs.p95`
   - `frameTimeMs.p99`
   - `fpsAvg`
7. Record any anomalies/deviations in `docs/can.md` and planning updates in `docs/planning-change-log.md`.

## Deliverables
1. Reproducible benchmark run set.
2. Summary and comparison outputs.
3. Documented deviations and decisions.

## Exit Criteria
1. Matrix runs complete for all stacks/scenes/presets.
2. Results are comparable and traceable to documented run conditions.
