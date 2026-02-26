# Web 3D Benchmark Monorepo

## Phase 1 Scaffold Status
This repository is scaffolded as a pnpm workspace for a multi-app 3D benchmark shootout.
Implementation of shared benchmark logic and app runtime code is scheduled for later phases.

## Planned Apps (ports)
- three-cube (5173)
- three-html-ui (5174)
- three-pixi-ui (5175)
- three-rapier-bounce (5176)
- three-ecs-rapier (5177)
- three-gltf-viewer (5178)
- three-solar-system (5179)

## Workspace Commands
- Install: `pnpm i`
- Dev all: `pnpm dev`
- Build all: `pnpm build`
- Preview all: `pnpm preview`
- Aggregate results (after Phase 2+): `pnpm bench:aggregate -- ./results/*.json`

## Benchmark Guidance (Target)
- Keep default benchmark resolution at 1280x720.
- Use `dpr=1` for comparability unless intentionally testing higher DPR.
- Run multiple trials per app and aggregate JSON logs.
