import type { OSCpuInfo } from "../../types";
import { FINGERPRINT_SPECIAL_VALUES, FingerprintSpecialValue } from "../../utils/consts";

export async function collectOSCpu(): Promise<OSCpuInfo> {
  const oscpu = await getOSCpu();
  return { oscpu };
}

async function getOSCpu(): Promise<string | FingerprintSpecialValue> {
  try {
    if (!("oscpu" in navigator)) return FINGERPRINT_SPECIAL_VALUES.UNDEFINED;

    const rawOSCpu = (navigator as any).oscpu;
    
    if (typeof rawOSCpu !== "string") return FINGERPRINT_SPECIAL_VALUES.UNDEFINED;

    const trimmed = rawOSCpu.trim();
    return trimmed || FINGERPRINT_SPECIAL_VALUES.UNDEFINED;
  } catch {
    return FINGERPRINT_SPECIAL_VALUES.ERROR;
  }
}
