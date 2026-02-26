# Implementation Checklist (Spec-Aligned)

Status date: 2026-02-26

## Planning and Governance
- [x] Canonical spec captured in `docs/spec.md`.
- [x] Phase documents created in `docs/phases/` with detailed steps.
- [x] Parallelization/dependency map updated in `docs/phase-classification-parallel.md`.
- [x] CAN log created in `docs/can.md`.
- [x] Planning change log created in `docs/planning-change-log.md`.

## Phase 01: Monorepo Foundation
- [ ] Root workspace/tooling files aligned to spec.
- [ ] Required package and app skeletons exist.
- [ ] Root README reflects target stacks and workflow.
- [ ] Workspace install and listing validated.

## Phase 02: Shared + Bench Core
- [ ] `@bench/shared` implemented per required modules.
- [ ] `@bench/bench` implemented per required modules.
- [ ] Instrumentation and HUD integrated in bench package.
- [ ] Shared + bench typecheck clean.

## Phase 03: Stack A (`three-html`)
- [ ] App harness implemented.
- [ ] All scenes implemented.
- [ ] Benchmark recording flow verified.

## Phase 04: Stack B (`three-pixi`)
- [ ] Dual-canvas harness and Pixi overlay implemented.
- [ ] All scenes implemented.
- [ ] Benchmark recording flow verified.

## Phase 05: Stack C (`babylon-gui`)
- [ ] Babylon harness and GUI overlay implemented.
- [ ] All scenes implemented.
- [ ] Benchmark recording flow verified.

## Phase 06: Validation and Benchmark Runs
- [ ] Typecheck/build pass across workspace.
- [ ] Benchmark matrix executed (>=5 runs each tuple).
- [ ] summarize/compare CLI outputs verified.

## Phase 07: Repo Transition Gap Closure
- [ ] Current-to-target path mapping completed.
- [ ] Migration actions applied or queued.
- [ ] Remaining divergence captured in CAN log.
