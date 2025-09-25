import type { CpuClassInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

export function collectCpuClass(): CpuClassInfo {
  const cpuClass = getCpuClass();
  return cpuClass;
}

function getCpuClass(): string | FingerprintSpecialValue {
  try {
    if (!("cpuClass" in navigator)) return FingerprintSpecialValue.UNDEFINED;

    const rawCpuClass = (navigator as any).cpuClass;

    if (typeof rawCpuClass !== "string") return FingerprintSpecialValue.UNDEFINED;

    const trimmed = rawCpuClass.trim();
    return trimmed || FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}
