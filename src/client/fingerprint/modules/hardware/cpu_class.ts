interface CpuClassResult {
  cpuClass: string;
}

export function collectCpuClass(): CpuClassResult {
  try {
    const cpuClass = getCpuClass();
    return { cpuClass };
  } catch (error) {
    console.error("Error collecting CPU class:", error);
    return { cpuClass: "" };
  }
}

function getCpuClass(): string {
  try {
    const rawCpuClass = (navigator as any)?.cpuClass;

    if (typeof rawCpuClass === "string") {
      return rawCpuClass.trim();
    }

    return "";
  } catch {
    return "";
  }
}
