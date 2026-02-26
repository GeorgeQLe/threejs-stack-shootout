import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface CliOptions {
  inputFiles: string[];
  outDir: string;
}

interface NormalizedRun {
  sourceFile: string;
  appId: string;
  appName: string;
  appVersion: string;
  fpsMean: number;
  fpsP50: number;
  fpsP95: number;
  frameMean: number;
  frameP95: number;
  frameWorst: number;
  longGt16_67: number;
  longGt33_33: number;
  longGt50: number;
  longTasksCount: number;
  longTasksTotalMs: number;
  memoryMean?: number;
}

interface AppAggregate {
  appId: string;
  appName: string;
  appVersion: string;
  runs: number;
  fpsMeanAvg: number;
  fpsP50Avg: number;
  fpsP95Avg: number;
  frameMeanAvg: number;
  frameP95Avg: number;
  frameWorstMax: number;
  longGt16_67Total: number;
  longGt33_33Total: number;
  longGt50Total: number;
  longTasksCountTotal: number;
  longTasksDurationTotalMs: number;
  memoryMeanAvg?: number;
}

const USAGE = [
  "Usage:",
  "  pnpm bench:aggregate -- <run-a.json> <run-b.json> ... [--out-dir <dir>]",
  "",
  "Examples:",
  "  pnpm bench:aggregate -- ./results/*.json",
  "  pnpm bench:aggregate -- run1.json run2.json --out-dir ./results"
].join("\n");

function parseCliArgs(argv: string[]): CliOptions {
  const inputFiles: string[] = [];
  let outDir = process.cwd();

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--out-dir") {
      const candidate = argv[i + 1];
      if (!candidate) {
        throw new Error("Missing value for --out-dir.\n\n" + USAGE);
      }

      outDir = path.resolve(candidate);
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}\n\n${USAGE}`);
    }

    inputFiles.push(path.resolve(arg));
  }

  if (inputFiles.length === 0) {
    throw new Error("At least one benchmark JSON file is required.\n\n" + USAGE);
  }

  return { inputFiles, outDir };
}

function numberOrDefault(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return fallback;
}

function stringOrDefault(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return fallback;
}

function normalizeRun(raw: unknown, sourceFile: string): NormalizedRun | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const app = (candidate.app ?? {}) as Record<string, unknown>;
  const summary = (candidate.summary ?? {}) as Record<string, unknown>;
  const fps = (summary.fps ?? {}) as Record<string, unknown>;
  const frameTime = (summary.frameTimeMs ?? {}) as Record<string, unknown>;
  const longFrames = (summary.longFrames ?? {}) as Record<string, unknown>;
  const longTasks = (summary.longTasks ?? {}) as Record<string, unknown>;
  const memory = (summary.memoryBytes ?? {}) as Record<string, unknown>;

  const appId = stringOrDefault(app.id ?? candidate.appId, "unknown-app");
  const appName = stringOrDefault(app.name ?? candidate.appName, appId);
  const appVersion = stringOrDefault(app.version ?? candidate.appVersion, "0.0.0");

  const fpsMean = numberOrDefault(fps.mean, Number.NaN);
  const frameMean = numberOrDefault(frameTime.mean, Number.NaN);

  if (!Number.isFinite(fpsMean) || !Number.isFinite(frameMean)) {
    return null;
  }

  return {
    sourceFile,
    appId,
    appName,
    appVersion,
    fpsMean,
    fpsP50: numberOrDefault(fps.p50),
    fpsP95: numberOrDefault(fps.p95),
    frameMean,
    frameP95: numberOrDefault(frameTime.p95),
    frameWorst: numberOrDefault(frameTime.worst, numberOrDefault(frameTime.max)),
    longGt16_67: numberOrDefault(longFrames.gt16_67),
    longGt33_33: numberOrDefault(longFrames.gt33_33),
    longGt50: numberOrDefault(longFrames.gt50),
    longTasksCount: numberOrDefault(longTasks.count),
    longTasksTotalMs: numberOrDefault(longTasks.totalDurationMs),
    memoryMean: Number.isFinite(numberOrDefault(memory.mean, Number.NaN))
      ? numberOrDefault(memory.mean)
      : undefined
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

function sum(values: number[]): number {
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total;
}

function aggregateRuns(runs: NormalizedRun[]): AppAggregate[] {
  const byApp = new Map<string, NormalizedRun[]>();

  for (const run of runs) {
    const existing = byApp.get(run.appId);
    if (existing) {
      existing.push(run);
    } else {
      byApp.set(run.appId, [run]);
    }
  }

  const aggregates: AppAggregate[] = [];
  for (const [appId, appRuns] of byApp.entries()) {
    const memoryMeans = appRuns
      .map((run) => run.memoryMean)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

    aggregates.push({
      appId,
      appName: appRuns[0].appName,
      appVersion: appRuns[0].appVersion,
      runs: appRuns.length,
      fpsMeanAvg: average(appRuns.map((run) => run.fpsMean)),
      fpsP50Avg: average(appRuns.map((run) => run.fpsP50)),
      fpsP95Avg: average(appRuns.map((run) => run.fpsP95)),
      frameMeanAvg: average(appRuns.map((run) => run.frameMean)),
      frameP95Avg: average(appRuns.map((run) => run.frameP95)),
      frameWorstMax: Math.max(...appRuns.map((run) => run.frameWorst)),
      longGt16_67Total: sum(appRuns.map((run) => run.longGt16_67)),
      longGt33_33Total: sum(appRuns.map((run) => run.longGt33_33)),
      longGt50Total: sum(appRuns.map((run) => run.longGt50)),
      longTasksCountTotal: sum(appRuns.map((run) => run.longTasksCount)),
      longTasksDurationTotalMs: sum(appRuns.map((run) => run.longTasksTotalMs)),
      memoryMeanAvg: memoryMeans.length > 0 ? average(memoryMeans) : undefined
    });
  }

  return aggregates.sort((a, b) => a.appId.localeCompare(b.appId));
}

function formatNum(value: number | undefined, digits = 3): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }
  return value.toFixed(digits);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }
  return value;
}

function renderCsv(aggregates: AppAggregate[]): string {
  const header = [
    "appId",
    "appName",
    "appVersion",
    "runs",
    "fpsMeanAvg",
    "fpsP50Avg",
    "fpsP95Avg",
    "frameMeanAvgMs",
    "frameP95AvgMs",
    "frameWorstMaxMs",
    "longGt16_67Total",
    "longGt33_33Total",
    "longGt50Total",
    "longTasksCountTotal",
    "longTasksDurationTotalMs",
    "memoryMeanAvgBytes"
  ];

  const rows = aggregates.map((aggregate) => [
    csvEscape(aggregate.appId),
    csvEscape(aggregate.appName),
    csvEscape(aggregate.appVersion),
    String(aggregate.runs),
    formatNum(aggregate.fpsMeanAvg),
    formatNum(aggregate.fpsP50Avg),
    formatNum(aggregate.fpsP95Avg),
    formatNum(aggregate.frameMeanAvg),
    formatNum(aggregate.frameP95Avg),
    formatNum(aggregate.frameWorstMax),
    String(aggregate.longGt16_67Total),
    String(aggregate.longGt33_33Total),
    String(aggregate.longGt50Total),
    String(aggregate.longTasksCountTotal),
    formatNum(aggregate.longTasksDurationTotalMs),
    formatNum(aggregate.memoryMeanAvg)
  ]);

  return [header.join(","), ...rows.map((row) => row.join(","))].join("\n") + "\n";
}

function renderMarkdown(aggregates: AppAggregate[]): string {
  const lines: string[] = [];
  lines.push("# Benchmark Summary");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("| App | Version | Runs | FPS mean | FPS p50 | FPS p95 | FT mean ms | FT p95 ms | Worst FT ms | >16.67ms | >33.33ms | >50ms | Long tasks | Long task ms | Mem mean bytes |");
  lines.push("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");

  for (const aggregate of aggregates) {
    lines.push(
      `| ${aggregate.appId} | ${aggregate.appVersion} | ${aggregate.runs} | ${formatNum(aggregate.fpsMeanAvg)} | ${formatNum(aggregate.fpsP50Avg)} | ${formatNum(aggregate.fpsP95Avg)} | ${formatNum(aggregate.frameMeanAvg)} | ${formatNum(aggregate.frameP95Avg)} | ${formatNum(aggregate.frameWorstMax)} | ${aggregate.longGt16_67Total} | ${aggregate.longGt33_33Total} | ${aggregate.longGt50Total} | ${aggregate.longTasksCountTotal} | ${formatNum(aggregate.longTasksDurationTotalMs)} | ${formatNum(aggregate.memoryMeanAvg)} |`
    );
  }

  lines.push("");
  return lines.join("\n");
}

async function loadRuns(inputFiles: string[]): Promise<NormalizedRun[]> {
  const runs: NormalizedRun[] = [];

  for (const file of inputFiles) {
    try {
      const rawText = await readFile(file, "utf8");
      const rawJson = JSON.parse(rawText) as unknown;
      const run = normalizeRun(rawJson, file);
      if (!run) {
        console.warn(`[warn] Skipping invalid benchmark JSON: ${file}`);
        continue;
      }

      runs.push(run);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`[warn] Failed to read ${file}: ${reason}`);
    }
  }

  return runs;
}

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));
  const runs = await loadRuns(options.inputFiles);

  if (runs.length === 0) {
    throw new Error("No valid benchmark runs were loaded from the provided paths.");
  }

  const aggregates = aggregateRuns(runs);
  const csvOutput = renderCsv(aggregates);
  const markdownOutput = renderMarkdown(aggregates);

  await mkdir(options.outDir, { recursive: true });

  const csvPath = path.join(options.outDir, "bench-summary.csv");
  const markdownPath = path.join(options.outDir, "bench-summary.md");

  await writeFile(csvPath, csvOutput, "utf8");
  await writeFile(markdownPath, markdownOutput, "utf8");

  console.log(`[bench-cli] Aggregated ${runs.length} run(s) across ${aggregates.length} app(s).`);
  console.log(`[bench-cli] Wrote ${csvPath}`);
  console.log(`[bench-cli] Wrote ${markdownPath}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[bench-cli] ${message}`);
  process.exitCode = 1;
});
