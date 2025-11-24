import type { CpuClassInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

enum CpuClassEnum {
  X86 = "x86",
  X64 = "x64",
  ARM = "ARM",
}

const CPU_MAP: Record<string, CpuClassEnum> = {
  x86: CpuClassEnum.X86,
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
  arm64: CpuClassEnum.ARM,
  aarch64: CpuClassEnum.ARM,
  aarch: CpuClassEnum.ARM,
};

export async function collectCpuClass(): Promise<CpuClassInfo> {
  try {
    const navClass = getNavigatorCpuClass();
    if (navClass) return navClass;

    const highEntropy = await getHighEntropyArchitecture();
    if (highEntropy) return highEntropy;

    const osCpu = getCpuClassFromOsCpu();
    if (osCpu) return osCpu;

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getNavigatorCpuClass(): CpuClassEnum | undefined {
  if (!("cpuClass" in navigator)) return undefined;

  const cpuClass = navigator.cpuClass;
  if (typeof cpuClass !== "string") return undefined;
  
  return normalizeCpuClass(cpuClass);
}

async function getHighEntropyArchitecture(): Promise<CpuClassEnum | undefined> {
  if (!navigator.userAgentData?.getHighEntropyValues) return undefined;

  const data = await navigator.userAgentData.getHighEntropyValues(["architecture"]);
  if (typeof data.architecture !== "string") return undefined;

  return normalizeCpuClass(data.architecture);
}

function getCpuClassFromOsCpu(): CpuClassEnum | undefined {
  if (!("oscpu" in navigator)) return undefined;
  const oscpu = navigator.oscpu;
  if (typeof oscpu !== "string") return undefined;

  const key = oscpu.toLowerCase();

  for (const pattern of Object.keys(CPU_MAP)) {
    const regex = new RegExp(`\\b${pattern}\\b`);
    if (regex.test(key)) return CPU_MAP[pattern];
  }

  return undefined;
}

function normalizeCpuClass(value: string): CpuClassEnum | undefined {
  const key = value.trim().toLowerCase();
  return key ? CPU_MAP[key] : undefined;
}
