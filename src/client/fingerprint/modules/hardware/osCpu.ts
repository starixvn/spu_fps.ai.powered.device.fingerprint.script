import type { OSCpuInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";
import { CpuClassEnum, getCpuClassFromUserAgent } from "./cpuClass";

const BITNESS_MAP: Record<CpuClassEnum, string> = {
  x64: "64",
  x86: "32",
  arm64: "64",
  arm: "32",
  armhf: "32",
  ia64: "64",
  ppc: "32",      
  sparc: "64",    
  alpha: "64",    
  avr32: "32",
  irix: "64",
  mips: "64",
  "pa-risc": "64",
  "68k": "32",
};

export async function collectOSCpu(): Promise<OSCpuInfo> {
  try {
    const osCpu = getOsCpuFromNavigator();
    if (osCpu) return osCpu;

    const highEntropy = await getOsCpuFromHighEntropy();  
    if (highEntropy) return highEntropy;

    const ua = getOsCpuFromUserAgent();
    if (ua) return ua;

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

  const data = await navigator.userAgentData.getHighEntropyValues([
    "platform",
    "bitness",
    "architecture",
    "wow64",
  ]);

  const platform = trimIfString(data.platform);
  const bitness = trimIfString(data.bitness);
  const architecture = trimIfString(data.architecture);
  const wow64 = data.wow64 ? "WOW64" : undefined;

  const osCpu = [platform, bitness, architecture, wow64]
    .filter(v => v !== undefined)
    .join("; ");
    
  return osCpu.length > 0 ? osCpu : undefined;
}

function trimIfString(value: any): string | undefined {
  return typeof value === "string" && value.length > 0 ? value.trim() : undefined;
}

function getOsCpuFromUserAgent(): string | undefined {
  const ua = navigator.userAgent.trim();
  const architecture = getCpuClassFromUserAgent();
  if (!architecture) return undefined;

  const bitness = BITNESS_MAP[architecture as CpuClassEnum];
  let platform: string | undefined;
  let wow64: string | undefined;

  // Windows
  if (/Windows NT/i.test(ua)) {
    platform = "Windows";
    wow64 = /\bwow64\b/i.test(ua) ? "WOW64" : undefined;
  }
  // macOS
  else if (/Mac OS X/i.test(ua) || /Macintosh/i.test(ua)) {
    platform = "macOS";
  }
  // Android
  else if (/Android/i.test(ua)) {
    platform = "Android";
  }
  // Linux
  else if (/Linux/i.test(ua)) {
    platform = "Linux";
  }
  // iOS
  else if (/\((iPhone|iPad|iPod);.*OS/i.test(ua)) {
    platform = "iOS";
  }

  if (!platform) return undefined;

  return [platform, bitness, architecture, wow64].filter(Boolean).join("; ");
}
