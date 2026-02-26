import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SceneInstrumentation } from "@babylonjs/core/Instrumentation/sceneInstrumentation";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { setupBenchmarkCanvas } from "@bench/shared/three";
import { createOrbitCameraPath } from "@bench/shared/three";
import { createBenchmarkOverlay } from "@bench/shared/bench";
import { runBenchmark } from "@bench/shared/bench";
import type { BenchConfig } from "@bench/shared/bench";
import { mulberry32 } from "@bench/shared/math";

// --- Query param parsing ---
const params = new URLSearchParams(window.location.search);
const dpr = params.has("dpr") ? Number(params.get("dpr")) : undefined;
const warmupMs = params.has("warmupMs") ? Number(params.get("warmupMs")) : undefined;
const measureMs = params.has("measureMs") ? Number(params.get("measureMs")) : undefined;
const entities = Math.min(Math.max(1, Number(params.get("entities")) || 50), 100000);
const uiWidgets = Math.min(Math.max(0, Number(params.get("uiWidgets")) || 100), 1000);
const lights = Math.min(Math.max(1, Number(params.get("lights")) || 2), 8);

// --- Canvas setup ---
const { canvas, width, height } = setupBenchmarkCanvas({ dpr });

// --- Babylon Engine ---
// adaptToDeviceRatio = false (4th arg) to avoid double-scaling since canvas is already DPR-scaled
const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false }, false);
engine.setHardwareScalingLevel(1);

// --- Scene ---
const scene = new Scene(engine);
scene.clearColor = new Color4(26 / 255, 26 / 255, 46 / 255, 1);

// --- Camera ---
const camera = new FreeCamera("camera", new Vector3(0, 0, 0), scene);
// Don't attach controls — benchmark runner controls the camera

// --- PRNG for deterministic layout ---
const rand = mulberry32(42);

// --- Entity cubes ---
const spreadRadius = Math.cbrt(entities) * 1.2;
const cubeMaterial = new StandardMaterial("cubeMat", scene);
cubeMaterial.diffuseColor = new Color3(0x44 / 255, 0x88 / 255, 0xff / 255);
const cubes: Mesh[] = [];

for (let i = 0; i < entities; i++) {
  const mesh = CreateBox(`cube${i}`, { size: 0.8 }, scene);
  mesh.position = new Vector3(
    (rand() - 0.5) * spreadRadius * 2,
    (rand() - 0.5) * spreadRadius * 2,
    (rand() - 0.5) * spreadRadius * 2,
  );
  mesh.material = cubeMaterial;
  cubes.push(mesh);
}

// --- Lights ---
const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
hemiLight.intensity = 0.6;

for (let i = 0; i < lights; i++) {
  const angle = (i / lights) * Math.PI * 2;
  const dirLight = new DirectionalLight(
    `dirLight${i}`,
    new Vector3(
      -Math.cos(angle) * spreadRadius,
      -spreadRadius * 0.8,
      -Math.sin(angle) * spreadRadius,
    ),
    scene,
  );
  dirLight.intensity = 1.2 / lights;
}

// --- Floor ---
const floorSize = spreadRadius * 3;
const floor = CreateGround("floor", { width: floorSize, height: floorSize }, scene);
floor.position.y = -spreadRadius;
const floorMaterial = new StandardMaterial("floorMat", scene);
floorMaterial.diffuseColor = new Color3(0x2a / 255, 0x2a / 255, 0x4a / 255);
floor.material = floorMaterial;

// --- Babylon GUI overlay ---
const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("ui");
const cols = Math.ceil(Math.sqrt(uiWidgets));
const rows = Math.ceil(uiWidgets / cols);
const textBlocks: TextBlock[] = [];

for (let i = 0; i < uiWidgets; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);

  const tb = new TextBlock(`text${i}`, `#${i} 0.0`);
  tb.color = "#00ff00";
  tb.fontSize = 10;
  tb.fontFamily = "monospace";
  // Position using center-based percentage offsets (-1 to 1 range, mapped to screen)
  tb.left = `${((col + 0.5) / cols - 0.5) * 100}%`;
  tb.top = `${((row + 0.5) / rows - 0.5) * 100}%`;
  guiTexture.addControl(tb);
  textBlocks.push(tb);
}

// --- Scene instrumentation for draw call counting ---
const instrumentation = new SceneInstrumentation(scene);
instrumentation.captureRenderTime = false;
instrumentation.captureFrameTime = false;

// --- Camera orbit ---
const orbitPath = createOrbitCameraPath({
  radius: spreadRadius + 5,
  height: spreadRadius * 0.6,
  speedRadPerSec: 0.3,
});

// --- Benchmark overlay ---
const overlay = createBenchmarkOverlay({ title: "Babylon.js GUI" });
overlay.mount();

// --- Benchmark wiring ---
overlay.onStart(() => {
  const config: BenchConfig = {
    appId: "babylon-gui",
    appName: "Babylon.js GUI",
    warmupMs,
    measureMs,
    dpr,
    width,
    height,
  };

  runBenchmark({
    config,
    frame: (ctx) => {
      // Rotate all entity cubes
      const rotSpeed = 0.003 * ctx.dtMs;
      for (let i = 0; i < cubes.length; i++) {
        cubes[i].rotation.x += rotSpeed;
        cubes[i].rotation.y += rotSpeed * 1.3;
      }

      // Update camera from orbit path
      const pose = orbitPath(ctx.elapsedMs);
      camera.position.copyFromFloats(pose.position.x, pose.position.y, pose.position.z);
      camera.setTarget(new Vector3(pose.lookAt.x, pose.lookAt.y, pose.lookAt.z));

      // Update all TextBlock controls (the key GPU text mutation measurement)
      const t = ctx.elapsedMs / 1000;
      for (let i = 0; i < textBlocks.length; i++) {
        textBlocks[i].text = (Math.sin(t + i * 0.1) * 100).toFixed(1);
      }

      // Render the scene (benchmark runner controls rAF, not engine.runRenderLoop)
      scene.render();
    },
    rendererInfoProvider: () => ({
      drawCalls: instrumentation.drawCallsCounter.current,
      triangles: scene.getTotalVertices() / 3,
      geometries: scene.geometries?.length ?? 0,
      textures: scene.textures?.length ?? 0,
    }),
    onStateChange: (state) => overlay.setState(state),
    onSample: (sample) => overlay.setLiveSample(sample),
  }).then((result) => {
    overlay.setResult(result);
  });
});
