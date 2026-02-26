export interface SetupBenchmarkCanvasOptions {
  parent?: HTMLElement;
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  dpr?: number;
  className?: string;
}

export interface SetupBenchmarkCanvasResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  dpr: number;
}

function toPositiveNumber(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

export function setupBenchmarkCanvas(options: SetupBenchmarkCanvasOptions = {}): SetupBenchmarkCanvasResult {
  const width = toPositiveNumber(options.width, 1280);
  const height = toPositiveNumber(options.height, 720);
  const dpr = toPositiveNumber(options.dpr, 1);
  const canvas = options.canvas ?? document.createElement("canvas");

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.display = "block";

  if (options.className) {
    canvas.className = options.className;
  }

  if (!canvas.isConnected) {
    (options.parent ?? document.body).appendChild(canvas);
  }

  return { canvas, width, height, dpr };
}
