# Changelog

## 2026-02-26
### Added
- Initial planning documentation set:
  - `docs/spec.md`
  - `docs/phases/phase-01-monorepo-scaffold.md`
  - `docs/phases/phase-02-shared-benchmark-core.md`
  - `docs/phases/phase-03-apps-cube-html-pixi.md`
  - `docs/phases/phase-04-apps-physics-ecs.md`
  - `docs/phases/phase-05-apps-gltf-solar.md`
  - `docs/phases/phase-06-validation-results-docs.md`
  - `docs/phase-classification-parallel.md`
- `checklist.md` for implementation progress tracking.
- Phase 01 scaffold implementation:
  - Root workspace/config files: `pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json`, `README.md`
  - Package skeletons: `packages/shared/*`, `packages/bench-cli/*`
  - App skeletons + manifests/tsconfig:
    - `apps/three-cube/*`
    - `apps/three-html-ui/*`
    - `apps/three-pixi-ui/*`
    - `apps/three-rapier-bounce/*`
    - `apps/three-ecs-rapier/*`
    - `apps/three-gltf-viewer/*`
    - `apps/three-solar-system/*`
  - Workspace install artifacts (`pnpm-lock.yaml`, `node_modules/`)
  - Validation run completed: `pnpm i`, `pnpm -r list`
- Phase 02 implementation:
  - `@bench/shared` buildable package configuration and subpath exports:
    - `@bench/shared/bench`
    - `@bench/shared/math`
    - `@bench/shared/three`
    - `@bench/shared/ecs`
  - Shared math utilities:
    - deterministic PRNG (`mulberry32`)
    - stats helpers (`mean`, `quantile`, `summarizeSeries`)
  - Shared benchmark runtime modules:
    - benchmark types and result schema
    - frame monitor (frame/memory/long-task capture)
    - warmup/measure benchmark runner
    - in-browser benchmark overlay
    - JSON download utility
  - Shared Three helpers:
    - benchmark canvas setup
    - deterministic camera orbit path
    - fixed timestep stepper with substep cap
  - Shared minimal ECS utilities:
    - world/entity/component storage helpers
    - priority scheduler with stable insertion ordering
  - `@bench/bench-cli` aggregator implementation:
    - parses multiple benchmark JSON files
    - aggregates run metrics by app
    - outputs `bench-summary.csv` and `bench-summary.md`
    - supports `--out-dir` with default output in current working directory
  - Bench CLI package updates for Node typings and declarations.
  - Validation runs completed:
    - `pnpm i`
    - `pnpm --filter @bench/shared build`
    - `pnpm --filter @bench/bench-cli build`
    - CLI smoke test against temporary JSON fixtures

### Notes
- App implementations remain pending for Phases 03-06.

## Issue / Deviation Log Template

Use entries below when execution differs from spec or issues are found.

### Entry Format
- Date:
- Phase/Step:
- Issue:
- Impact:
- Resolution:
- Spec/Plan Update Required: Yes/No
- Follow-up Actions:
