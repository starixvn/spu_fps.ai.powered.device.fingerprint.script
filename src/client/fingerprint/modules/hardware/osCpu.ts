import type { OSCpuInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

export async function collectOSCpu(): Promise<OSCpuInfo> {
  try {
    const osCpu = getOsCpuFromNavigator();
    if (osCpu) return osCpu;

    const highEntropy = await getOsCpuFromHighEntropy();  
    if (highEntropy) return highEntropy;

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getOsCpuFromNavigator(): string | undefined {
  if (!("oscpu" in navigator)) return undefined;
  const oscpu = navigator.oscpu;
  
  return (typeof oscpu === "string" && oscpu.length > 0) 
    ? oscpu.trim() 
    : undefined;
}

async function getOsCpuFromHighEntropy(): Promise<string | undefined> {
  if (!navigator.userAgentData?.getHighEntropyValues) return undefined;
  const data = await navigator.userAgentData.getHighEntropyValues(["platform", "architecture"]);

  if (typeof data.platform === "string" && typeof data.architecture === "string" 
    && data.platform.length > 0 && data.architecture.length > 0) {
      return `${data.platform} ${data.architecture}`.trim()
  }

  return undefined;
}
