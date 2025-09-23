import type { OSCpuInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

export async function collectOSCpu(): Promise<OSCpuInfo> {
  const oscpu = await getOSCpu();
  return { oscpu };
}

async function getOSCpu(): Promise<string | FingerprintSpecialValue> {
  try {
    if (!("oscpu" in navigator)) return FingerprintSpecialValue.UNDEFINED;

    const rawOSCpu = (navigator as any).oscpu;
    
    if (typeof rawOSCpu !== "string") return FingerprintSpecialValue.UNDEFINED;

    const trimmed = rawOSCpu.trim();
    return trimmed || FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}
