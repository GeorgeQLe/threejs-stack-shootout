# Implementation Checklist

Status date: 2026-02-26

## Planning Artifacts
- [x] Create `docs/` directory.
- [x] Write full spec document in `docs/spec.md`.
- [x] Split execution plan into phase documents under `docs/phases/`.
- [x] Add phase classification + parallelization map (`docs/phase-classification-parallel.md`).
- [x] Create `checklist.md` for implementation tracking.
- [x] Create `changelog.md` for issues/deviations/change notes.

## Phase 01: Monorepo Scaffold
- [x] Add root workspace files (`pnpm-workspace.yaml`, root `package.json`, `tsconfig.base.json`).
- [x] Create package directories and baseline manifests.
- [x] Create app directories and baseline manifests.
- [x] Add root README.
- [x] Install dependencies and verify workspace detection.

## Phase 02: Shared Benchmark Core + Aggregator
- [x] Implement shared package exports and tsconfig.
- [x] Implement math utilities (`prng`, `stats`).
- [x] Implement benchmark core (`types`, `monitor`, `benchRunner`, `overlay`, `download`).
- [x] Implement Three utilities (`canvas`, `cameraPath`, `fixedTimestep`).
- [x] Implement minimal ECS utilities.
- [x] Implement bench CLI aggregator.
- [x] Build/verify shared and CLI packages.

## Phase 03: Apps - Cube / HTML UI / Pixi UI
- [ ] Implement `three-cube`.
- [ ] Implement `three-html-ui`.
- [ ] Implement `three-pixi-ui`.
- [ ] Verify benchmark controls + JSON output for all three.

## Phase 04: Apps - Rapier / ECS Rapier
- [ ] Implement `three-rapier-bounce`.
- [ ] Implement `three-ecs-rapier`.
- [ ] Verify fixed-step behavior and benchmark export.

## Phase 05: Apps - GLTF Viewer / Solar System
- [ ] Implement `three-gltf-viewer`.
- [ ] Implement `three-solar-system`.
- [ ] Verify camera path/scene graph behavior and benchmark export.

## Phase 06: Validation / Aggregation
- [ ] Run root build successfully.
- [ ] Collect benchmark JSON outputs in `results/`.
- [ ] Run aggregation command.
- [ ] Verify generated `bench-summary.csv` and `bench-summary.md`.
- [ ] Final README/doc updates.
