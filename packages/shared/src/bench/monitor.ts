import type { BenchSample, LongTaskSample, RendererCounters } from "./types.js";

interface PerformanceMemory {
  usedJSHeapSize: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

export interface FrameMonitorOptions {
  startTimeMs: number;
  captureMemory?: boolean;
  captureLongTasks?: boolean;
  rendererInfoProvider?: () => Partial<RendererCounters> | undefined;
}

export interface FrameMonitor {
  recordFrame(nowMs: number): BenchSample;
  getLongTasks(): LongTaskSample[];
  dispose(): void;
}

export function createFrameMonitor(options: FrameMonitorOptions): FrameMonitor {
  const captureMemory = options.captureMemory ?? true;
  const captureLongTasks = options.captureLongTasks ?? true;
  const longTasks: LongTaskSample[] = [];
  let lastFrameTimeMs = options.startTimeMs;
  let longTaskObserver: PerformanceObserver | undefined;

  if (captureLongTasks && typeof PerformanceObserver !== "undefined") {
    try {
      longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          longTasks.push({
            startMs: Math.max(0, entry.startTime - options.startTimeMs),
            durationMs: entry.duration
          });
        }
      });

      longTaskObserver.observe({ entryTypes: ["longtask"] });
    } catch {
      longTaskObserver = undefined;
    }
  }

  return {
    recordFrame(nowMs: number) {
      const dtMs = Math.max(0, nowMs - lastFrameTimeMs);
      lastFrameTimeMs = nowMs;

      const sample: BenchSample = {
        t: Math.max(0, nowMs - options.startTimeMs),
        dtMs,
        fps: dtMs > 0 ? 1000 / dtMs : 0
      };

      if (captureMemory && typeof performance !== "undefined") {
        const memory = (performance as ExtendedPerformance).memory;
        if (memory && Number.isFinite(memory.usedJSHeapSize)) {
          sample.memUsedBytes = memory.usedJSHeapSize;
        }
      }

      const renderer = options.rendererInfoProvider?.();
      if (renderer) {
        if (typeof renderer.drawCalls === "number") {
          sample.drawCalls = renderer.drawCalls;
        }
        if (typeof renderer.triangles === "number") {
          sample.triangles = renderer.triangles;
        }
        if (typeof renderer.geometries === "number") {
          sample.geometries = renderer.geometries;
        }
        if (typeof renderer.textures === "number") {
          sample.textures = renderer.textures;
        }
      }

      return sample;
    },

    getLongTasks() {
      return [...longTasks];
    },

    dispose() {
      longTaskObserver?.disconnect();
    }
  };
}
