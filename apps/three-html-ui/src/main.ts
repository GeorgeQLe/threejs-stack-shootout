import * as THREE from "three";
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

// --- HTML widget layer ---
const widgetContainer = document.createElement("div");
widgetContainer.style.cssText =
  "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:hidden;";
document.body.appendChild(widgetContainer);

const cols = Math.ceil(Math.sqrt(uiWidgets));
const rows = Math.ceil(uiWidgets / cols);
const valueSpans: HTMLSpanElement[] = [];

for (let i = 0; i < uiWidgets; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = ((col + 0.5) / cols) * 100;
  const y = ((row + 0.5) / rows) * 100;

  const widget = document.createElement("div");
  widget.style.cssText = `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);font:10px monospace;color:#0f0;background:rgba(0,0,0,0.5);padding:2px 4px;border-radius:2px;white-space:nowrap;`;

  const label = document.createElement("span");
  label.textContent = `#${i} `;
  widget.appendChild(label);

  const value = document.createElement("span");
  value.textContent = "0.0";
  widget.appendChild(value);
  valueSpans.push(value);

  widgetContainer.appendChild(widget);
}

// --- Camera orbit ---
const orbitPath = createOrbitCameraPath({
  radius: spreadRadius + 5,
  height: spreadRadius * 0.6,
  speedRadPerSec: 0.3,
});

// --- Benchmark overlay ---
const overlay = createBenchmarkOverlay({ title: "Three.js HTML UI" });
overlay.mount();

// --- Benchmark wiring ---
overlay.onStart(() => {
  const config: BenchConfig = {
    appId: "three-html-ui",
    appName: "Three.js HTML UI",
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

      // Update all widget text content (the key DOM mutation measurement)
      const t = ctx.elapsedMs / 1000;
      for (let i = 0; i < valueSpans.length; i++) {
        valueSpans[i].textContent = (Math.sin(t + i * 0.1) * 100).toFixed(1);
      }

      // Render
      renderer.render(scene, camera);
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
