import type { CpuClassInfo } from "../../types";
import { FINGERPRINT_SPECIAL_VALUES, FingerprintSpecialValue } from "../../utils/consts";

export function collectCpuClass(): CpuClassInfo {
  const cpuClass = getCpuClass();
  return { cpuClass };
}

function getCpuClass(): string | FingerprintSpecialValue {
  try {
    if (!("cpuClass" in navigator)) return FINGERPRINT_SPECIAL_VALUES.UNDEFINED;

    const rawCpuClass = (navigator as any).cpuClass;

    if (typeof rawCpuClass !== "string") return FINGERPRINT_SPECIAL_VALUES.UNDEFINED;

    const trimmed = rawCpuClass.trim();
    return trimmed || FINGERPRINT_SPECIAL_VALUES.UNDEFINED;
  } catch {
    return FINGERPRINT_SPECIAL_VALUES.ERROR;
  }
}
