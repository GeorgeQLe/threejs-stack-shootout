import * as THREE from "three";
import { Application, Text, TextStyle } from "pixi.js";
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

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(width, height, false);
renderer.setPixelRatio(dpr ?? 1);

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);

// --- PRNG for deterministic layout ---
const rand = mulberry32(42);

// --- Entity cubes ---
const spreadRadius = Math.cbrt(entities) * 1.2;
const cubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff });
const cubes: THREE.Mesh[] = [];

for (let i = 0; i < entities; i++) {
  const mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  mesh.position.set(
    (rand() - 0.5) * spreadRadius * 2,
    (rand() - 0.5) * spreadRadius * 2,
    (rand() - 0.5) * spreadRadius * 2,
  );
  scene.add(mesh);
  cubes.push(mesh);
}

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

for (let i = 0; i < lights; i++) {
  const angle = (i / lights) * Math.PI * 2;
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2 / lights);
  dirLight.position.set(
    Math.cos(angle) * spreadRadius,
    spreadRadius * 0.8,
    Math.sin(angle) * spreadRadius,
  );
  scene.add(dirLight);
}

// --- Floor ---
const floorSize = spreadRadius * 3;
const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a4a });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -spreadRadius;
scene.add(floor);

// --- Pixi.js overlay layer ---
const pixiApp = new Application();
await pixiApp.init({
  width,
  height,
  resolution: dpr ?? 1,
  autoDensity: true,
  backgroundAlpha: 0,
  autoStart: false,
  preference: "webgl",
});

const pixiCanvas = pixiApp.canvas as HTMLCanvasElement;
pixiCanvas.style.cssText =
  "position:fixed;top:0;left:0;pointer-events:none;z-index:1;";
document.body.appendChild(pixiCanvas);

// --- Pixi widget grid ---
const cols = Math.ceil(Math.sqrt(uiWidgets));
const rows = Math.ceil(uiWidgets / cols);
const widgetStyle = new TextStyle({
  fontFamily: "monospace",
  fontSize: 10,
  fill: 0x00ff00,
});
const textObjects: Text[] = [];

for (let i = 0; i < uiWidgets; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = ((col + 0.5) / cols) * width;
  const y = ((row + 0.5) / rows) * height;

  const text = new Text({ text: `#${i} 0.0`, style: widgetStyle });
  text.anchor.set(0.5, 0.5);
  text.position.set(x, y);
  pixiApp.stage.addChild(text);
  textObjects.push(text);
}

// --- Camera orbit ---
const orbitPath = createOrbitCameraPath({
  radius: spreadRadius + 5,
  height: spreadRadius * 0.6,
  speedRadPerSec: 0.3,
});

// --- Benchmark overlay ---
const overlay = createBenchmarkOverlay({ title: "Three.js Pixi UI" });
overlay.mount();

// --- Benchmark wiring ---
overlay.onStart(() => {
  const config: BenchConfig = {
    appId: "three-pixi-ui",
    appName: "Three.js Pixi UI",
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
      camera.position.set(pose.position.x, pose.position.y, pose.position.z);
      camera.lookAt(pose.lookAt.x, pose.lookAt.y, pose.lookAt.z);

      // Update all Pixi text objects (the key GPU text mutation measurement)
      const t = ctx.elapsedMs / 1000;
      for (let i = 0; i < textObjects.length; i++) {
        textObjects[i].text = (Math.sin(t + i * 0.1) * 100).toFixed(1);
      }

      // Render Three.js scene
      renderer.render(scene, camera);

      // Render Pixi overlay
      pixiApp.render();
    },
    rendererInfoProvider: () => ({
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
    }),
    onStateChange: (state) => overlay.setState(state),
    onSample: (sample) => overlay.setLiveSample(sample),
  }).then((result) => {
    overlay.setResult(result);
  });
});
