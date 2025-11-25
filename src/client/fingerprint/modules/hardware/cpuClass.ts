import type { CpuClassInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

enum CpuClassEnum {
  X86 = "x86",
  X64 = "x64",
  ARM = "ARM",
  M68K = "68K",
  ALPHA = "Alpha",
  PPC = "PPC",
  SPARC = "sparc",
  AVR32 = "avr32",
  IA64 = "ia64",
  MIPS = "mips",
  IRIX = "irix",
  PA_RISC = "pa-risc"
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
  arm64: CpuClassEnum.ARM, // ARM 64-bit
  armv6: CpuClassEnum.ARM, // ARM 32-bit 
  armv7: CpuClassEnum.ARM, // ARM 32-bit
  armv8: CpuClassEnum.ARM, // 64-bit ISA
  armv9: CpuClassEnum.ARM, // 64-bit ISA
  armv7l: CpuClassEnum.ARM, // ARM 32-bit
  armhf: CpuClassEnum.ARM, // ARM 32-bit hard float (Linux)
  aarch: CpuClassEnum.ARM,
  aarch32: CpuClassEnum.ARM, // ARM 32-bit
  aarch64: CpuClassEnum.ARM, // ARM 64-bit (Linux/Android)
  armeabi: CpuClassEnum.ARM, // Android legacy 32-bit

  "68k": CpuClassEnum.M68K, 
  alpha: CpuClassEnum.ALPHA,
  ppc: CpuClassEnum.PPC,
  powerpc: CpuClassEnum.PPC,
  sparc: CpuClassEnum.SPARC,
  ia64: CpuClassEnum.IA64,
  mips: CpuClassEnum.MIPS,
  "pa-risc": CpuClassEnum.PA_RISC,
  avr32: CpuClassEnum.AVR32,
  irix: CpuClassEnum.IRIX
};

const CPU_REGEXES: Array<[RegExp, string]> = [
  [/\b((amd|x|x86[-_]?|wow|win)64)\b/i, "amd64"],
  [/(ia32(?=;))/i, "ia32"],
  [/\b((i[346]|x)86)(pc)?\b/i, "ia32"],
  [/\b(aarch64|arm(v?[89]e?l?|_?64))\b/i, "aarch64"],
  [/\b(arm(v[67])?ht?n?[fl]p?)\b/i, "armhf"],
  [/( (ce|mobile); ppc;|\/[\w\.]+arm\b)/i, "arm"],
  [/((ppc|powerpc)(64)?)( mac|;|\))/i, "ppc"],
  [/\ssun4\w[;\)]/i, "sparc"],
  [/\b(avr32)\b/i, "avr32"],
  [/\bia64(?=;)\b/i, "ia64"],
  [/\b68k(?=\))\b/i, "68k"],
  [/\barm(?=v([1-7]|[5-7]1)l?|;|eabi)\b/i, "arm"],
  [/\b(irix)(64)?\b/i, "irix"],
  [/\b(mips)(64)?\b/i, "mips"],
  [/\b(sparc)(64)?\b/i, "sparc"],
  [/\bpa-risc\b/i, "pa-risc"],
  [/(?:osf1|[freopnt]{3,4}bsd) (alpha)/i, "alpha"],
  [/mc680.0/i, "68k"],
  [/winnt.+\[axp/i, "alpha"]
];

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

function getCpuClassFromNavigator(): string | undefined {
  if (!("cpuClass" in navigator)) return undefined;
  const cpuClass = navigator.cpuClass;
  
  return (typeof cpuClass === "string" && cpuClass.length > 0) 
    ? cpuClass 
    : undefined;
}

async function getCpuClassFromHighEntropy(): Promise<string | undefined> {
  if (!navigator.userAgentData?.getHighEntropyValues) return undefined;
  const data = await navigator.userAgentData.getHighEntropyValues(["architecture"]);

  return (typeof data.architecture === "string" && data.architecture.length > 0) 
    ? data.architecture 
    : undefined;
}

function getCpuClassFromOsCpu(): CpuClassEnum | undefined {
  if (!("oscpu" in navigator)) return undefined;
  const oscpu = navigator.oscpu;
  if (typeof oscpu !== "string") return undefined;

  return matchCpuMap(oscpu.trim().toLowerCase());
}

function getCpuClassFromUa(): string | undefined {
  const ua = navigator.userAgent.trim().toLowerCase();;
  return parseWithRegexes(ua);
}

function matchCpuMap(str: string) : CpuClassEnum | undefined {
  for (const key of Object.keys(CPU_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`);
    if (regex.test(str)) return CPU_MAP[key];
  }

  return undefined;
}

function parseWithRegexes(str: string) : string | undefined {
  for (const [regex, key] of CPU_REGEXES) {
    if (regex.test(str)) return key;
  }

  return undefined;
}