import type { HardwareConcurrencyInfo } from "../../types";
import { isBrave } from "../../utils/browser";
import { FingerprintSpecialValue } from "../../utils/consts";

const HARDWARE_CONCURRENCY_RUNS = 5;
const MIN_VALID_CORES = 1;
const MAX_VALID_CORES = 128;

export async function collectHardwareConcurrency(): Promise<HardwareConcurrencyInfo> {
  try {
    const antiFingerprintingResult = getHardwareConcurrencyAntiFp();
    if (antiFingerprintingResult !== null) return antiFingerprintingResult;

    if (!("hardwareConcurrency" in navigator))
      return FingerprintSpecialValue.UNDEFINED;

    const values: number[] = [];

    for (let i = 0; i < HARDWARE_CONCURRENCY_RUNS; i++) {
      const v = getHardwareConcurrencyOnce();

      if (v !== FingerprintSpecialValue.UNDEFINED) values.push(v as number);
      await delay(1);
    }

    if (!values.length) return FingerprintSpecialValue.TIMEOUT;

    const stableValue = mostFrequent(values);

    if (hasNoise(values, stableValue)) return FingerprintSpecialValue.ANTI_FINGERPRINTED;

    if (stableValue < MIN_VALID_CORES || stableValue > MAX_VALID_CORES)
      return FingerprintSpecialValue.ANTI_FINGERPRINTED;

    return stableValue;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getHardwareConcurrencyAntiFp(): HardwareConcurrencyInfo | null {
  if (isBrave()) {
    return FingerprintSpecialValue.ANTI_FINGERPRINTED;
  }

  return null;
}


function getHardwareConcurrencyOnce(): number | FingerprintSpecialValue {
  try {
    const val = navigator.hardwareConcurrency;
    return typeof val === "number" && val > 0 ? val : FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
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

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
