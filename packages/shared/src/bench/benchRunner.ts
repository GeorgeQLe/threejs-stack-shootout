import { summarizeSeries } from "../math/stats.js";
import { createFrameMonitor } from "./monitor.js";
import type {
  BenchConfig,
  BenchRunResult,
  BenchRunState,
  BenchSample,
  BenchSummary,
  LongTaskSample,
  MetricSummary,
  RendererCounters
} from "./types.js";

export interface BenchFrameContext {
  dtMs: number;
  elapsedMs: number;
  state: BenchRunState;
}

export interface BenchRunnerOptions {
  config: BenchConfig;
  frame?: (context: BenchFrameContext) => void;
  rendererInfoProvider?: () => Partial<RendererCounters> | undefined;
  captureMemory?: boolean;
  captureLongTasks?: boolean;
  onStateChange?: (state: BenchRunState) => void;
  onSample?: (sample: BenchSample) => void;
}

export interface ResolvedBenchConfig {
  appId: string;
  appName: string;
  appVersion: string;
  warmupMs: number;
  measureMs: number;
  width: number;
  height: number;
  dpr: number;
}

const DEFAULT_WARMUP_MS = 3000;
const DEFAULT_MEASURE_MS = 20000;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const DEFAULT_DPR = 1;

function coercePositive(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

export function resolveBenchConfig(config: BenchConfig): ResolvedBenchConfig {
  return {
    appId: config.appId,
    appName: config.appName,
    appVersion: config.appVersion ?? "0.0.0",
    warmupMs: coercePositive(config.warmupMs, DEFAULT_WARMUP_MS),
    measureMs: coercePositive(config.measureMs, DEFAULT_MEASURE_MS),
    width: coercePositive(config.width, DEFAULT_WIDTH),
    height: coercePositive(config.height, DEFAULT_HEIGHT),
    dpr: coercePositive(config.dpr, DEFAULT_DPR)
  };
}

function toMetricSummary(values: number[]): MetricSummary {
  if (values.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      p50: 0,
      p95: 0
    };
  }

  const summary = summarizeSeries(values);
  return {
    count: summary.count,
    min: summary.min,
    max: summary.max,
    mean: summary.mean,
    p50: summary.p50,
    p95: summary.p95
  };
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
}

function summarizeRun(
  samples: BenchSample[],
  longTasks: LongTaskSample[],
  longTaskCaptureEnabled: boolean
): BenchSummary {
  const frameTimes = samples.map((sample) => sample.dtMs);
  const fpsValues = samples.map((sample) => sample.fps);
  const frameSummary = toMetricSummary(frameTimes);
  const fpsSummary = toMetricSummary(fpsValues);

  let gt16_67 = 0;
  let gt33_33 = 0;
  let gt50 = 0;

  for (const frameTime of frameTimes) {
    if (frameTime > 16.67) {
      gt16_67 += 1;
    }
    if (frameTime > 33.33) {
      gt33_33 += 1;
    }
    if (frameTime > 50) {
      gt50 += 1;
    }
  }

  const memoryValues = samples
    .map((sample) => sample.memUsedBytes)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const drawCalls = samples
    .map((sample) => sample.drawCalls)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const triangles = samples
    .map((sample) => sample.triangles)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const geometries = samples
    .map((sample) => sample.geometries)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const textures = samples
    .map((sample) => sample.textures)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const summary: BenchSummary = {
    fps: fpsSummary,
    frameTimeMs: {
      ...frameSummary,
      worst: frameSummary.max
    },
    longFrames: {
      gt16_67,
      gt33_33,
      gt50
    }
  };

  if (longTaskCaptureEnabled) {
    summary.longTasks = {
      count: longTasks.length,
      totalDurationMs: longTasks.reduce((total, task) => total + task.durationMs, 0)
    };
  }

  if (memoryValues.length > 0) {
    summary.memoryBytes = {
      min: Math.min(...memoryValues),
      max: Math.max(...memoryValues),
      mean: average(memoryValues)
    };
  }

  if (drawCalls.length > 0 || triangles.length > 0 || geometries.length > 0 || textures.length > 0) {
    summary.rendererInfo = {
      drawCalls: average(drawCalls),
      triangles: average(triangles),
      geometries: average(geometries),
      textures: average(textures)
    };
  }

  return summary;
}

export async function runBenchmark(options: BenchRunnerOptions): Promise<BenchRunResult> {
  if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
    throw new Error("runBenchmark must be executed in a browser environment.");
  }

  const config = resolveBenchConfig(options.config);
  const longTaskCaptureEnabled = options.captureLongTasks ?? true;
  const startTimeMs = performance.now();
  const startedAtISO = new Date().toISOString();
  const measureStartMs = config.warmupMs;
  const measureEndMs = config.warmupMs + config.measureMs;

  const monitor = createFrameMonitor({
    startTimeMs,
    captureMemory: options.captureMemory,
    captureLongTasks: longTaskCaptureEnabled,
    rendererInfoProvider: options.rendererInfoProvider
  });

  const measuredSamples: BenchSample[] = [];
  let currentState: BenchRunState = "warmup";
  let previousFrameTimeMs = startTimeMs;

  options.onStateChange?.(currentState);

  return new Promise<BenchRunResult>((resolve) => {
    const finalize = () => {
      monitor.dispose();

      const measuredLongTasks = monitor
        .getLongTasks()
        .filter((task) => task.startMs >= measureStartMs && task.startMs <= measureEndMs);

      currentState = "complete";
      options.onStateChange?.(currentState);

      resolve({
        schemaVersion: 1,
        app: {
          id: config.appId,
          name: config.appName,
          version: config.appVersion
        },
        runtime: {
          userAgent: navigator.userAgent,
          startedAtISO,
          warmupMs: config.warmupMs,
          measureMs: config.measureMs,
          width: config.width,
          height: config.height,
          dpr: config.dpr
        },
        samples: measuredSamples,
        longTasks: longTaskCaptureEnabled ? measuredLongTasks : undefined,
        summary: summarizeRun(measuredSamples, measuredLongTasks, longTaskCaptureEnabled)
      });
    };

    const step = (nowMs: number) => {
      const dtMs = Math.max(0, nowMs - previousFrameTimeMs);
      previousFrameTimeMs = nowMs;

      const elapsedMs = nowMs - startTimeMs;
      if (elapsedMs >= measureEndMs) {
        finalize();
        return;
      }

      const nextState: BenchRunState = elapsedMs >= measureStartMs ? "measuring" : "warmup";
      if (nextState !== currentState) {
        currentState = nextState;
        options.onStateChange?.(currentState);
      }

      options.frame?.({
        dtMs,
        elapsedMs,
        state: currentState
      });

      const sample = monitor.recordFrame(nowMs);
      if (currentState === "measuring") {
        measuredSamples.push(sample);
        options.onSample?.(sample);
      }

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  });
}
