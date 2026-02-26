export interface BenchConfig {
  appId: string;
  appName: string;
  appVersion?: string;
  warmupMs?: number;
  measureMs?: number;
  width?: number;
  height?: number;
  dpr?: number;
}

export interface BenchAppMetadata {
  id: string;
  name: string;
  version: string;
}

export interface BenchRuntimeMetadata {
  userAgent: string;
  startedAtISO: string;
  warmupMs: number;
  measureMs: number;
  width: number;
  height: number;
  dpr: number;
}

export interface RendererCounters {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

export interface BenchSample {
  t: number;
  dtMs: number;
  fps: number;
  memUsedBytes?: number;
  drawCalls?: number;
  triangles?: number;
  geometries?: number;
  textures?: number;
}

export interface LongTaskSample {
  startMs: number;
  durationMs: number;
}

export interface MetricSummary {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
}

export interface FrameTimeSummary extends MetricSummary {
  worst: number;
}

export interface BenchSummary {
  fps: MetricSummary;
  frameTimeMs: FrameTimeSummary;
  longFrames: {
    gt16_67: number;
    gt33_33: number;
    gt50: number;
  };
  longTasks?: {
    count: number;
    totalDurationMs: number;
  };
  memoryBytes?: {
    min: number;
    max: number;
    mean: number;
  };
  rendererInfo?: RendererCounters;
}

export interface BenchRunResult {
  schemaVersion: number;
  app: BenchAppMetadata;
  runtime: BenchRuntimeMetadata;
  samples: BenchSample[];
  longTasks?: LongTaskSample[];
  summary: BenchSummary;
}

export type BenchRunState = "idle" | "warmup" | "measuring" | "complete";
