export interface NumericSummary {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
}

function sortedCopy(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

export function mean(values: number[]): number {
  if (values.length === 0) {
    return Number.NaN;
  }

  let total = 0;
  for (const value of values) {
    total += value;
  }

  return total / values.length;
}

export function quantile(values: number[], q: number): number {
  if (values.length === 0) {
    return Number.NaN;
  }

  const sorted = sortedCopy(values);
  if (q <= 0) {
    return sorted[0];
  }

  if (q >= 1) {
    return sorted[sorted.length - 1];
  }

  const idx = (sorted.length - 1) * q;
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  const weight = idx - lower;

  if (upper === lower) {
    return sorted[lower];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function summarizeSeries(values: number[]): NumericSummary {
  if (values.length === 0) {
    return {
      count: 0,
      min: Number.NaN,
      max: Number.NaN,
      mean: Number.NaN,
      p50: Number.NaN,
      p95: Number.NaN
    };
  }

  const sorted = sortedCopy(values);
  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: mean(sorted),
    p50: quantile(sorted, 0.5),
    p95: quantile(sorted, 0.95)
  };
}
