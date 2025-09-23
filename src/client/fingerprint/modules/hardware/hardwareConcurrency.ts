import type { HardwareConcurrencyInfo } from "../../types";
import { FINGERPRINT_SPECIAL_VALUES, FingerprintSpecialValue } from "../../utils/consts";

const HARDWARE_CONCURRENCY_RUNS = 5;
const MIN_VALID_CORES = 1;
const MAX_VALID_CORES = 128;
const HARDWARE_CONCURRENCY_MIN_BENCHMARK_SCORE = 180000;

export async function collectHardwareConcurrency(): Promise<HardwareConcurrencyInfo> {
  try {
    if (!("hardwareConcurrency" in navigator))
      return { hardwareConcurrency: FINGERPRINT_SPECIAL_VALUES.UNDEFINED };

    const values: number[] = [];

    for (let i = 0; i < HARDWARE_CONCURRENCY_RUNS; i++) {
      const v = getHardwareConcurrencyOnce();

      if (v !== FINGERPRINT_SPECIAL_VALUES.UNDEFINED) values.push(v as number);
      await delay(1);
    }

    if (!values.length) return { hardwareConcurrency: FINGERPRINT_SPECIAL_VALUES.TIMEOUT };

    const stableValue = mostFrequent(values);

    if (hasNoise(values, stableValue)) return { hardwareConcurrency: FINGERPRINT_SPECIAL_VALUES.KNOWN_FOR_ANTI_FINGERPRINTING };

    const benchmark = await runCompositeBenchmark();

    if (stableValue < MIN_VALID_CORES || stableValue > MAX_VALID_CORES)
      return { hardwareConcurrency: FINGERPRINT_SPECIAL_VALUES.KNOWN_FOR_ANTI_FINGERPRINTING };

    const expectedMinCores = Math.max(
      MIN_VALID_CORES,
      (benchmark / HARDWARE_CONCURRENCY_MIN_BENCHMARK_SCORE) * stableValue
    );

    if (stableValue < expectedMinCores) return { hardwareConcurrency: FINGERPRINT_SPECIAL_VALUES.KNOWN_FOR_ANTI_FINGERPRINTING };

    return { hardwareConcurrency: stableValue };
  } catch {
    return { hardwareConcurrency: FINGERPRINT_SPECIAL_VALUES.ERROR };
  }
}

function getHardwareConcurrencyOnce(): number | FingerprintSpecialValue {
  try {
    const val = navigator.hardwareConcurrency;
    return typeof val === "number" && val > 0 ? val : FINGERPRINT_SPECIAL_VALUES.UNDEFINED;
  } catch {
    return FINGERPRINT_SPECIAL_VALUES.ERROR;
  }
}

function mostFrequent(arr: number[]): number {
  const counts: Record<number, number> = {};

  for (const v of arr) counts[v] = (counts[v] || 0) + 1;

  return Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
}

function hasNoise(arr: number[], stable: number): boolean {
  return arr.some((v) => v !== stable);
}

async function runCompositeBenchmark(): Promise<number> {
  const ITER = 3;
  const scores: number[] = [];

  for (let t = 0; t < ITER; t++) {
    const score = await new Promise<number>((resolve) => {
      const start = performance.now();
      let x = 0;

      for (let i = 0; i < 3e5; i++) {
        x += Math.sqrt(i) % 3;
        if (i % 1000 === 0) x += Math.sin(i) * Math.cos(i);
      }

      resolve(Math.floor(3e5 / (performance.now() - start)));
    });

    scores.push(score);
    await delay(1);
  }

  scores.sort((a, b) => a - b);

  const median = scores[1];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const harmonic = scores.length / scores.reduce((sum, s) => sum + 1 / s, 0);

  return median * 0.5 + mean * 0.3 + harmonic * 0.2;
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
