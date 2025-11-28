import type { CpuClassInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

export enum CpuClassEnum {
  X64 = "x64",
  X86 = "x86",
  ARM64 = "arm64",
  ARMHF = "armhf",
  ARM = "arm",
  PPC = "ppc",
  SPARC = "sparc",
  ALPHA = "alpha",
  AVR32 = "avr32",
  IA64 = "ia64",
  IRIX = "irix",
  MIPS = "mips",
  PA_RISC = "pa-risc",
  M68K = "68k",
}

const CPU_OS_REGEX: Array<[RegExp, CpuClassEnum]> = [
  [/\b(x64|x86_64|amd64|win64|wow64|intel)\b/i, CpuClassEnum.X64], // x64 / AMD64
  [/\b(x86|i[3-6]86|i86pc|ia32|x32|win32)\b/i, CpuClassEnum.X86], // x86 32-bit

  [/\b(arm64|aarch64|armv8(\d+)?l?|armv9(\d+)?l?)\b/i, CpuClassEnum.ARM64], // ARM64
  [/\b(armv6|armv7|armhf|arm32|armeabi|armv7l?|aarch32|arm(?!(64|v8|v9)))\b/i, CpuClassEnum.ARM], // ARM 32-bit

  [/\b(ppc|powerpc)(64)?\b/i, CpuClassEnum.PPC], // PowerPC

  [/\b(sparc)(64)?\b/i, CpuClassEnum.SPARC], // SPARC

  [/\b(alpha|osf1|[freopnt]{3,4}bsd axp|winnt.+\[axp)\b/i, CpuClassEnum.ALPHA], // Alpha
  [/\bavr32\b/i, CpuClassEnum.AVR32], // AVR32
  [/\bia64\b/i, CpuClassEnum.IA64], // IA64
  [/\birix(64)?\b/i, CpuClassEnum.IRIX], // IRIX
  [/\bmips(64)?\b/i, CpuClassEnum.MIPS], // MIPS
  [/\bpa-risc\b/i, CpuClassEnum.PA_RISC], // PA-RISC
  [/\b(68k|mc680.0)\b/i, CpuClassEnum.M68K] // 68K
];

export async function collectCpuClass(): Promise<CpuClassInfo> {
  try {
    const cpuClass = getCpuClassFromNavigator();
    if (cpuClass) return cpuClass;

    const highEntropy = await getCpuClassFromHighEntropy();
    if (highEntropy) return highEntropy;

    const osCpu = getCpuClassFromOsCpu();
    if (osCpu) return osCpu;

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getCpuClassFromNavigator(): string | undefined {
  if (!("cpuClass" in navigator)) return undefined;
  const cpuClass = navigator.cpuClass;
  
  return (typeof cpuClass === "string" && cpuClass.length > 0) 
    ? cpuClass.trim()
    : undefined;
}

async function getCpuClassFromHighEntropy(): Promise<string | undefined> {
  if (!navigator.userAgentData?.getHighEntropyValues) return undefined;
  const data = await navigator.userAgentData.getHighEntropyValues(["architecture"]);

  return (typeof data.architecture === "string" && data.architecture.length > 0) 
    ? data.architecture.trim()
    : undefined;
}

function getCpuClassFromOsCpu(): CpuClassEnum | undefined {
  if (!("oscpu" in navigator)) return undefined;
  const oscpu = navigator.oscpu;
  if (typeof oscpu !== "string") return undefined;

  return parseCpuClass(oscpu.trim(), CPU_OS_REGEX);
}

function parseCpuClass<T extends CpuClassEnum>(
  str: string,
  rules: Array<[RegExp, T]>
): T | undefined {
  for (const [regex, key] of rules) {
    if (regex.test(str)) return key;
  }
  return undefined;
}