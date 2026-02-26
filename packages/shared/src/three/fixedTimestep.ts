export interface FixedTimestepOptions {
  fixedDtMs?: number;
  maxSubsteps?: number;
  onStep: (fixedDtMs: number) => void;
}

export interface FixedTimestepStepResult {
  steps: number;
  accumulatorMs: number;
  droppedMs: number;
}

export interface FixedTimestepStepper {
  step(deltaMs: number): FixedTimestepStepResult;
  reset(): void;
  getAccumulatorMs(): number;
}

function toPositiveInteger(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.max(1, Math.floor(value));
}

function toPositiveNumber(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

export function createFixedTimestepStepper(options: FixedTimestepOptions): FixedTimestepStepper {
  const fixedDtMs = toPositiveNumber(options.fixedDtMs, 1000 / 60);
  const maxSubsteps = toPositiveInteger(options.maxSubsteps, 5);
  let accumulatorMs = 0;

  return {
    step(deltaMs: number): FixedTimestepStepResult {
      if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
        return {
          steps: 0,
          accumulatorMs,
          droppedMs: 0
        };
      }

      accumulatorMs += deltaMs;
      let steps = 0;

      while (accumulatorMs >= fixedDtMs && steps < maxSubsteps) {
        options.onStep(fixedDtMs);
        accumulatorMs -= fixedDtMs;
        steps += 1;
      }

      let droppedMs = 0;
      if (accumulatorMs >= fixedDtMs) {
        // Keep at most one substep worth of lag to avoid unbounded catch-up loops.
        droppedMs = accumulatorMs - fixedDtMs;
        accumulatorMs = fixedDtMs;
      }

      return {
        steps,
        accumulatorMs,
        droppedMs
      };
    },

    reset() {
      accumulatorMs = 0;
    },

    getAccumulatorMs() {
      return accumulatorMs;
    }
  };
}
