# Phase 01: Monorepo Foundation and Scaffold

## Objective
Create the root workspace, package skeletons, app skeletons, and baseline docs so implementation can proceed in parallel.

## Detailed Steps
1. Align root files with spec:
   - `package.json`
   - `pnpm-workspace.yaml`
   - `turbo.json`
   - `tsconfig.base.json`
   - `.gitignore`
2. Create package directories and baseline manifests:
   - `packages/shared`
   - `packages/bench`
   - `packages/cli`
3. Create app directories and baseline manifests:
   - `apps/three-html`
   - `apps/three-pixi`
   - `apps/babylon-gui`
4. Add/refresh root README with stack list, run commands, and benchmark workflow.
5. Validate workspace resolution:
   - `pnpm i`
   - `pnpm -r list`

## Deliverables
1. Full monorepo skeleton exists per canonical layout.
2. Package and app manifests resolve as workspace members.

## Exit Criteria
1. `pnpm i` succeeds.
2. Workspace lists all expected projects.
