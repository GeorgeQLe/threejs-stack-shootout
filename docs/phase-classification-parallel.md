# Phase Classification and Parallelization Map

Date captured: 2026-02-26

## Phase Types
1. Phase 01 (`phase-01-monorepo-scaffold.md`): Full-stack
2. Phase 02 (`phase-02-shared-benchmark-core.md`): Full-stack
3. Phase 03 (`phase-03-three-html.md`): Frontend
4. Phase 04 (`phase-04-three-pixi.md`): Frontend
5. Phase 05 (`phase-05-babylon-gui.md`): Frontend
6. Phase 06 (`phase-06-validation-results-docs.md`): Full-stack
7. Phase 07 (`phase-07-repo-transition-gap-plan.md`): Full-stack

## Hard Dependencies
1. Phase 01 must complete before Phases 02-07.
2. Core contracts from Phase 02 should be stabilized before finalizing Phases 03-05.
3. Phase 06 depends on completed stack implementations (Phases 03-05).
4. Phase 07 can start early for inventory/mapping but should finalize after Phases 01-02 contract decisions.

## Parallelization Opportunities
1. After Phase 01, Phase 02 and Phase 07 discovery tasks can run in parallel.
2. After Phase 02 contract freeze, Phases 03-05 can execute in parallel by separate owners.
3. During Phase 06 run collection, CLI summarize/compare work can run in parallel with additional benchmark reruns.

## Suggested Work Lanes
1. Lane A (platform/core): Phases 01 -> 02
2. Lane B (stack impl): Phases 03 + 04 + 05
3. Lane C (migration/governance): Phase 07 + docs/logs
4. Lane D (verification): Phase 06
