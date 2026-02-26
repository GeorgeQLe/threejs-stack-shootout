import * as THREE from "three";
import { setupBenchmarkCanvas } from "@bench/shared/three";
import { createOrbitCameraPath } from "@bench/shared/three";
import { createBenchmarkOverlay } from "@bench/shared/bench";
import { runBenchmark } from "@bench/shared/bench";
import type { BenchConfig } from "@bench/shared/bench";

// --- Query param parsing ---
const params = new URLSearchParams(window.location.search);
const dpr = params.has("dpr") ? Number(params.get("dpr")) : undefined;
const warmupMs = params.has("warmupMs") ? Number(params.get("warmupMs")) : undefined;
const measureMs = params.has("measureMs") ? Number(params.get("measureMs")) : undefined;

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
const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);

// --- Lights ---
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 8, 4);
scene.add(dirLight);

const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

// --- Floor ---
const floorGeometry = new THREE.PlaneGeometry(12, 12);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a4a });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1;
scene.add(floor);

// --- Cube ---
const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.y = 0.5;
scene.add(cube);

// --- Camera orbit ---
const orbitPath = createOrbitCameraPath({ radius: 6, height: 2.5, speedRadPerSec: 0.4 });

// --- Benchmark overlay ---
const overlay = createBenchmarkOverlay({ title: "Three.js Cube" });
overlay.mount();

// --- Benchmark wiring ---
overlay.onStart(() => {
  const config: BenchConfig = {
    appId: "three-cube",
    appName: "Three.js Cube",
    warmupMs,
    measureMs,
    dpr,
    width,
    height,
  };

  runBenchmark({
    config,
    frame: (ctx) => {
      // Rotate cube
      cube.rotation.x += 0.005 * ctx.dtMs;
      cube.rotation.y += 0.008 * ctx.dtMs;

      // Update camera from orbit path
      const pose = orbitPath(ctx.elapsedMs);
      camera.position.set(pose.position.x, pose.position.y, pose.position.z);
      camera.lookAt(pose.lookAt.x, pose.lookAt.y, pose.lookAt.z);

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
