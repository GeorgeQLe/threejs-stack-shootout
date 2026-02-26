# Phase 04: Stack B — `three-pixi-ui`

## Objective

Implement the Three.js + Pixi.js overlay benchmark app. Identical 3D scene to Phase 03, but the UI overlay uses a transparent Pixi.js `Application` canvas with `Text` objects instead of HTML DOM elements. This isolates the performance difference between DOM text mutation and Pixi GPU text rendering.

## Architecture

Single-file entry (`src/main.ts`) with no scene switching. Same query-param-driven benchmark pattern as `three-html-ui`.

### 3D Scene

Identical to Phase 03:
- N `BoxGeometry` meshes, `mulberry32(42)` PRNG placement
- Configurable directional lights + ambient
- Floor plane, deterministic orbit camera

### Pixi.js Overlay

- `Application` initialized with `backgroundAlpha: 0`, `autoStart: false`, `preference: "webgl"`
- Canvas positioned `fixed` with `pointer-events: none` and `z-index: 1` above the Three.js canvas
- M `Text` objects in a grid layout using monospace `TextStyle`
- Every frame, each text object's `.text` property is set to a `sin()`-derived number — this is the Pixi text mutation being measured
- `pixiApp.render()` called manually each frame after `renderer.render()`

### Dual WebGL Context

The app runs two WebGL contexts simultaneously: one for Three.js and one for Pixi.js. This reflects the real-world cost of layering a Pixi HUD over a Three.js scene.

### Benchmark Integration

Same as Phase 03:
- `runBenchmark()` + `createBenchmarkOverlay()` from `@bench/shared`
- `rendererInfoProvider` captures Three.js renderer stats (Pixi stats not separately captured)
- Result JSON with `schemaVersion: 1`

## Query Parameters

| Param | Default | Range | Description |
|---|---|---|---|
| `entities` | 50 | 1–100,000 | Number of rotating cubes |
| `uiWidgets` | 100 | 0–1,000 | Number of Pixi text widgets |
| `lights` | 2 | 1–8 | Number of directional lights |
| `dpr` | device default | any | Device pixel ratio override |
| `warmupMs` | (runner default) | any | Warmup duration override |
| `measureMs` | (runner default) | any | Measurement duration override |

## Dependencies

- `three` — 3D rendering
- `pixi.js` (v8) — overlay text rendering
- `@bench/shared` — benchmark runner, canvas setup, orbit camera, overlay UI, PRNG

## Dev Server

```
pnpm dev --filter app-three-pixi-ui   # port 5175
```

## Exit Criteria

1. `pnpm dev` serves the app and renders cubes + Pixi text overlay.
2. Clicking Start runs the benchmark through warmup → measure → complete.
3. Download produces a valid `schemaVersion: 1` JSON artifact.
