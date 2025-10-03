import type { DeviceMemoryInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

const DEVICE_MEMORY_RUNS = 5;
const MIN_BENCHMARK_SCORE = 180000;
const MIN_VALID_MEMORY = 0.25;
const MAX_VALID_MEMORY = 128;
const KNOWN_POWER2_VALUES = [0.25, 0.5, 1, 2, 4, 8, 16, 32];

export async function collectDeviceMemory(): Promise<DeviceMemoryInfo> {
  try {
    if (!("deviceMemory" in navigator)) return FingerprintSpecialValue.UNDEFINED;

    const values: number[] = [];

    for (let i = 0; i < DEVICE_MEMORY_RUNS; i++) {
      const v = getDeviceMemoryOnce();

      if (v !== FingerprintSpecialValue.UNDEFINED) values.push(v as number);
      await deviceMemoryDelay(1);
    }

    if (!values.length) return FingerprintSpecialValue.TIMEOUT;

    const stableValue = deviceMemoryMostFrequent(values);

    if (deviceMemoryHasNoise(values, stableValue)) return FingerprintSpecialValue.ANTI_FINGERPRINTED;

    const benchmark = await runCompositeBenchmark();

    if (stableValue < MIN_VALID_MEMORY || stableValue > MAX_VALID_MEMORY)
      return FingerprintSpecialValue.ANTI_FINGERPRINTED;

    if (
      KNOWN_POWER2_VALUES.includes(stableValue) &&
      stableValue < Math.min(8, (benchmark / MIN_BENCHMARK_SCORE) * 8)
    ) {
      return FingerprintSpecialValue.ANTI_FINGERPRINTED;
    }

    return stableValue;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getDeviceMemoryOnce(): number | FingerprintSpecialValue {
  try {
    const val = (navigator as any).deviceMemory;
    const n = typeof val === "string" ? parseFloat(val) : val;

    return typeof n === "number" && n > 0 ? n : FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function deviceMemoryMostFrequent(arr: number[]): number {
  const counts: Record<number, number> = {};

  for (const v of arr) counts[v] = (counts[v] || 0) + 1;

  return Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
}

function deviceMemoryHasNoise(arr: number[], stable: number): boolean {
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
      const duration = performance.now() - start;
      resolve(Math.floor(3e5 / duration));
    });
    scores.push(score);
    await deviceMemoryDelay(1);
  }

  scores.sort((a, b) => a - b);
  const median = scores[1];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const harmonic = scores.length / scores.reduce((sum, s) => sum + 1 / s, 0);

  return median * 0.5 + mean * 0.3 + harmonic * 0.2;
}

function deviceMemoryDelay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
