import type { CpuClassInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

enum CpuClassEnum {
  X86 = "x86",
  X64 = "x64",
  ARM = "ARM",
  M68K = "68K",
  ALPHA = "Alpha",
  PPC = "PPC"
}

const CPU_MAP: Record<string, CpuClassEnum> = {
  x86: CpuClassEnum.X86,
  i286: CpuClassEnum.X86,
  i386: CpuClassEnum.X86,
  i486: CpuClassEnum.X86,
  i586: CpuClassEnum.X86,
  i686: CpuClassEnum.X86,
  ia32: CpuClassEnum.X86,
  i86pc: CpuClassEnum.X86,
  x32: CpuClassEnum.X86,
  win32: CpuClassEnum.X86, 

  x64: CpuClassEnum.X64,
  x86_64: CpuClassEnum.X64,
  amd64: CpuClassEnum.X64,
  win64: CpuClassEnum.X64,
  wow64: CpuClassEnum.X64,
  intel: CpuClassEnum.X64,
  
  arm: CpuClassEnum.ARM, 
  arm32: CpuClassEnum.ARM, // ARM 32-bit 
  armv6: CpuClassEnum.ARM, // ARM 32-bit 
  armv7: CpuClassEnum.ARM, // ARM 32-bit
  armv7l: CpuClassEnum.ARM, // ARM 32-bit
  armhf: CpuClassEnum.ARM, // ARM 32-bit hard float (Linux)
  armeabi: CpuClassEnum.ARM, // Android legacy 32-bit
  arm64: CpuClassEnum.ARM, // ARM 64-bit
  armv8: CpuClassEnum.ARM, // 64-bit ISA
  aarch64: CpuClassEnum.ARM, // ARM 64-bit (Linux/Android)
  aarch: CpuClassEnum.ARM,

  "68k": CpuClassEnum.M68K, 
  alpha: CpuClassEnum.ALPHA,
  ppc: CpuClassEnum.PPC,
  powerpc: CpuClassEnum.PPC
};

export async function collectCpuClass(): Promise<CpuClassInfo> {
  try {
    const cpuClass = getCpuClassFromNavigator();
    if (cpuClass) return cpuClass;

    const highEntropy = await getCpuClassFromHighEntropy();
    if (highEntropy) return highEntropy;

    const osCpu = getCpuClassFromOsCpu();
    if (osCpu) return osCpu;

    const ua = getCpuClassFromUa();
    if (ua) return ua;

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getCpuClassFromNavigator(): CpuClassEnum | undefined {
  if (!("cpuClass" in navigator)) return undefined;
  const cpuClass = navigator.cpuClass;
  
  return (typeof cpuClass === "string") 
    ? matchCpuMap(cpuClass) 
    : undefined;
}

async function getCpuClassFromHighEntropy(): Promise<CpuClassEnum | undefined> {
  if (!navigator.userAgentData?.getHighEntropyValues) return undefined;
  const data = await navigator.userAgentData.getHighEntropyValues(["architecture"]);

  return (typeof data.architecture === "string") 
    ? matchCpuMap(data.architecture) 
    : undefined;
}

function getCpuClassFromOsCpu(): CpuClassEnum | undefined {
  if (!("oscpu" in navigator)) return undefined;
  const oscpu = navigator.oscpu;
  if (typeof oscpu !== "string") return undefined;
  const key = oscpu.toLowerCase();
  
  return parseCpuClass(key);
}

function getCpuClassFromUa(): CpuClassEnum | undefined {
  const ua = navigator.userAgent.toLowerCase();
  return parseCpuClass(ua);
}

function matchCpuMap(value: string): CpuClassEnum | undefined {
  const key = value.trim().toLowerCase();
  return CPU_MAP[key];
}

function parseCpuClass(str: string) : CpuClassEnum | undefined {
  for (const key of Object.keys(CPU_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`);
    if (regex.test(str)) return CPU_MAP[key];
  }

  return undefined;
}
