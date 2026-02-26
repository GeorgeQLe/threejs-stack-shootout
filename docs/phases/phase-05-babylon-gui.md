# Phase 05: Stack C — `babylon-gui`

## Objective

Implement the Babylon.js + Babylon GUI benchmark app. Same benchmark pattern as Phases 03–04: a single parameterized scene with N rotating cubes and M Babylon GUI text widgets updated per frame. This provides the third data point comparing native engine GUI performance against HTML DOM and Pixi.js overlays.

## Architecture

Single-file entry (`src/main.ts`) following the same conventions as `three-html-ui` and `three-pixi-ui`. No scene switching; query-param-driven scaling.

### 3D Scene

Equivalent geometry to Phases 03–04, implemented with Babylon.js APIs:
- N `BoxBuilder` meshes, deterministic PRNG placement
- Configurable directional lights + hemisphere light
- Ground plane, orbit camera path

### Babylon GUI Overlay

- `AdvancedDynamicTexture.CreateFullscreenUI()` layered on the Babylon engine
- M `TextBlock` controls arranged in a grid
- Every frame, each text block's `.text` property is updated with a `sin()`-derived value
- Single WebGL context (Babylon GUI renders within the same engine pipeline)

### Benchmark Integration

Same pattern as Phases 03–04:
- `runBenchmark()` + `createBenchmarkOverlay()` from `@bench/shared`
- `rendererInfoProvider` captures Babylon engine draw calls and active meshes
- Result JSON with `schemaVersion: 1`

## Query Parameters

| Param | Default | Range | Description |
|---|---|---|---|
| `entities` | 50 | 1–100,000 | Number of rotating cubes |
| `uiWidgets` | 100 | 0–1,000 | Number of GUI text widgets |
| `lights` | 2 | 1–8 | Number of directional lights |
| `dpr` | device default | any | Device pixel ratio override |
| `warmupMs` | (runner default) | any | Warmup duration override |
| `measureMs` | (runner default) | any | Measurement duration override |

## Dependencies

- `@babylonjs/core` — 3D rendering
- `@babylonjs/gui` — in-engine GUI text widgets
- `@bench/shared` — benchmark runner, canvas setup, overlay UI, PRNG

## Dev Server

```
pnpm dev --filter app-babylon-gui   # port 5176
```

## Exit Criteria

1. `pnpm dev` serves the app and renders cubes + Babylon GUI text overlay.
2. Clicking Start runs the benchmark through warmup → measure → complete.
3. Download produces a valid `schemaVersion: 1` JSON artifact.
4. Same query params produce comparable workload to Phases 03–04.
