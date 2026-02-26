# Phase 03: Stack A — `three-html-ui`

## Objective

Implement the Three.js + HTML DOM overlay benchmark app. This app renders a 3D scene with N rotating cubes and layers M HTML `<div>` widget overlays on top, updating their `textContent` every frame. The HTML DOM mutation cost is the primary metric under test.

## Architecture

Single-file entry (`src/main.ts`) with no scene switching. The benchmark runs one parameterized scene driven entirely by query params.

### 3D Scene

- **Entities**: N `BoxGeometry` meshes placed deterministically via `mulberry32(42)` PRNG
- **Lights**: Configurable directional lights evenly distributed around the scene, plus ambient
- **Floor**: `PlaneGeometry` ground plane scaled to entity spread
- **Camera**: Deterministic orbit path via `createOrbitCameraPath()` from `@bench/shared`

### HTML Widget Overlay

- Fixed-position container `<div>` with `pointer-events: none`, layered above the canvas
- M widget `<div>` elements arranged in a grid, each containing a label `<span>` and a value `<span>`
- Every frame, each value span's `.textContent` is set to a `sin()`-derived number — this is the DOM mutation being measured

### Benchmark Integration

- Uses `runBenchmark()` from `@bench/shared` with warmup → measure → complete state machine
- `createBenchmarkOverlay()` provides Start / Download controls
- `rendererInfoProvider` captures Three.js draw calls, triangles, geometries, textures
- Result JSON downloaded as `schemaVersion: 1` artifact

## Query Parameters

| Param | Default | Range | Description |
|---|---|---|---|
| `entities` | 50 | 1–100,000 | Number of rotating cubes |
| `uiWidgets` | 100 | 0–1,000 | Number of HTML overlay widgets |
| `lights` | 2 | 1–8 | Number of directional lights |
| `dpr` | device default | any | Device pixel ratio override |
| `warmupMs` | (runner default) | any | Warmup duration override |
| `measureMs` | (runner default) | any | Measurement duration override |

## Dependencies

- `three` — 3D rendering
- `@bench/shared` — benchmark runner, canvas setup, orbit camera, overlay UI, PRNG

## Dev Server

```
pnpm dev --filter app-three-html-ui   # port 5174
```

## Exit Criteria

1. `pnpm dev` serves the app and renders cubes + HTML widgets.
2. Clicking Start runs the benchmark through warmup → measure → complete.
3. Download produces a valid `schemaVersion: 1` JSON artifact.
