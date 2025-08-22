interface CpuClassResult {
  cpuClass: string;
}

export async function collectCpuClass(): Promise<CpuClassResult> {
  try {
    const cpuClass = await getCpuClass();
    console.log("CPU Class fingerprint collected:", { cpuClass });

    return { cpuClass };
  } catch (error) {
    console.error("Error collecting CPU class:", error);
    return { cpuClass: "unknown" };
  }
}

async function getCpuClass(): Promise<string> {
  try {
    if ((navigator as any).cpuClass) return (navigator as any).cpuClass;

    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("arm") || ua.includes("aarch64")) return "ARM";

    if (
      ua.includes("x86") ||
      ua.includes("i386") ||
      ua.includes("i686") ||
      ua.includes("amd64") ||
      ua.includes("x64") ||
      ua.includes("win64")
    )
      return "x86";

    if (ua.includes("mips")) return "MIPS";
    if (ua.includes("ppc")) return "PPC";
    if (ua.includes("sparc")) return "SPARC";

    return "unknown";
  } catch {
    return "unknown";
  }
}
