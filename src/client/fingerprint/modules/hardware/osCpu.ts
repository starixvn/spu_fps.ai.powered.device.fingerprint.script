import type { OSCpuInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";
import { getPlatformFromNavigator } from "./platform";
import { collectCpuClass } from "./cpuClass";

export async function collectOSCpu(): Promise<OSCpuInfo> {
  try {
    const osCpu = getOsCpuFromNavigator();
    if (osCpu) return osCpu;

    const highEntropy = await getOsCpuFromHighEntropy();  
    if (highEntropy) return highEntropy;

    const platformCpuClass = await getOsCpuFromPlatform();
    if (platformCpuClass) return platformCpuClass;

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getOsCpuFromNavigator(): string | undefined {
  if (!("oscpu" in navigator)) return undefined;
  const oscpu = navigator.oscpu;
  
  return (typeof oscpu === "string" && oscpu.length > 0) 
    ? oscpu
    : undefined;
}

async function getOsCpuFromHighEntropy(): Promise<string | undefined> {
  if (!navigator.userAgentData?.getHighEntropyValues) return undefined;

  const data = await navigator.userAgentData.getHighEntropyValues([
    "platform",
    "bitness",
    "architecture",
    "wow64",
  ]);

  const platform = data.platform;
  const bitness = data.bitness;
  const architecture = data.architecture;
  const wow64 = data.wow64 ? "WOW64" : undefined;

  const osCpu = [platform, bitness, architecture, wow64]
    .filter(v => v !== undefined)
    .join("; ");
    
  return osCpu.length > 0 ? osCpu : undefined;
}

async function getOsCpuFromPlatform(): Promise<string | undefined> {
  const platform = getPlatformFromNavigator();
  if (!platform) return undefined;

  const cpuClass = await collectCpuClass();
  if (typeof cpuClass !== "string" || cpuClass.length === 0) return undefined;

  return `${platform}; ${cpuClass}`;
}