import { downloadJson } from "./download.js";
import type { BenchRunResult, BenchRunState, BenchSample } from "./types.js";

export interface BenchmarkOverlayOptions {
  title?: string;
  parent?: HTMLElement;
  getDownloadFileName?: (result: BenchRunResult) => string;
}

export interface BenchmarkOverlay {
  element: HTMLDivElement;
  mount(parent?: HTMLElement): void;
  unmount(): void;
  onStart(handler: () => void): void;
  setState(state: BenchRunState | "idle"): void;
  setLiveSample(sample: BenchSample | undefined): void;
  setResult(result: BenchRunResult | undefined): void;
}

function formatNumber(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  return value.toFixed(fractionDigits);
}

function defaultFileName(result: BenchRunResult): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${result.app.id}-${timestamp}.json`;
}

export function createBenchmarkOverlay(options: BenchmarkOverlayOptions = {}): BenchmarkOverlay {
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.top = "12px";
  root.style.left = "12px";
  root.style.zIndex = "9999";
  root.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  root.style.background = "rgba(8, 12, 20, 0.86)";
  root.style.color = "#e6edf6";
  root.style.padding = "10px 12px";
  root.style.borderRadius = "8px";
  root.style.border = "1px solid rgba(148, 163, 184, 0.45)";
  root.style.minWidth = "230px";

  const title = document.createElement("div");
  title.textContent = options.title ?? "Benchmark";
  title.style.fontSize = "12px";
  title.style.fontWeight = "700";
  title.style.letterSpacing = "0.04em";
  title.style.marginBottom = "8px";

  const stateLabel = document.createElement("div");
  stateLabel.textContent = "State: idle";
  stateLabel.style.fontSize = "12px";
  stateLabel.style.marginBottom = "8px";

  const stats = document.createElement("pre");
  stats.textContent = "FPS: n/a\nFrame: n/a\nMemory: n/a";
  stats.style.margin = "0 0 8px 0";
  stats.style.fontSize = "11px";
  stats.style.lineHeight = "1.35";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "8px";

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.textContent = "Start Benchmark";
  startButton.style.cursor = "pointer";

  const downloadButton = document.createElement("button");
  downloadButton.type = "button";
  downloadButton.textContent = "Download JSON";
  downloadButton.disabled = true;
  downloadButton.style.cursor = "pointer";

  actions.append(startButton, downloadButton);
  root.append(title, stateLabel, stats, actions);

  let startHandler: (() => void) | undefined;
  let currentResult: BenchRunResult | undefined;

  startButton.addEventListener("click", () => {
    startHandler?.();
  });

  downloadButton.addEventListener("click", () => {
    if (!currentResult) {
      return;
    }

    const fileName = options.getDownloadFileName?.(currentResult) ?? defaultFileName(currentResult);
    downloadJson(fileName, currentResult);
  });

  return {
    element: root,

    mount(parent) {
      const target = parent ?? options.parent ?? document.body;
      if (!root.isConnected) {
        target.appendChild(root);
      }
    },

    unmount() {
      root.remove();
    },

    onStart(handler) {
      startHandler = handler;
    },

    setState(state) {
      stateLabel.textContent = `State: ${state}`;
      const isBusy = state === "warmup" || state === "measuring";
      startButton.disabled = isBusy;
      if (isBusy) {
        downloadButton.disabled = true;
      }
    },

    setLiveSample(sample) {
      if (!sample) {
        stats.textContent = "FPS: n/a\nFrame: n/a\nMemory: n/a";
        return;
      }

      const memoryText =
        typeof sample.memUsedBytes === "number"
          ? `${formatNumber(sample.memUsedBytes / (1024 * 1024))} MB`
          : "n/a";

      const rendererBits =
        typeof sample.drawCalls === "number"
          ? `\nDraws: ${formatNumber(sample.drawCalls, 0)} Tri: ${formatNumber(sample.triangles ?? 0, 0)}`
          : "";

      stats.textContent =
        `FPS: ${formatNumber(sample.fps)}\n` +
        `Frame: ${formatNumber(sample.dtMs)} ms\n` +
        `Memory: ${memoryText}` +
        rendererBits;
    },

    setResult(result) {
      currentResult = result;
      downloadButton.disabled = !result;
    }
  };
}
