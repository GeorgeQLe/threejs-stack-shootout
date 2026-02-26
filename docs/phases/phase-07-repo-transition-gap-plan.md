# Phase 07: Repository Transition and Gap Closure

## Objective
Bridge this existing repository from its current structure to the target `web-3d-tech-stack-bench` structure with explicit migration steps.

## Detailed Steps
1. Inventory current repo assets and map them to target layout.
2. Classify each current app/package:
   - directly reusable
   - partially reusable with refactor
   - deprecated in target spec
3. Define migration actions per path:
   - move/rename
   - rewrite
   - archive/remove (only with explicit approval)
4. Resolve naming mismatches (existing app ids vs target stack ids).
5. Update package graph and scripts to match target root workflow.
6. Validate no broken imports after transition.
7. Log every deliberate divergence from the canonical spec in `docs/can.md`.

## Deliverables
1. Path-by-path migration map.
2. Executable transition plan with tracked deviations.

## Exit Criteria
1. Repository structure and workspace graph align with target spec.
2. Any remaining divergence is explicitly documented and justified.
