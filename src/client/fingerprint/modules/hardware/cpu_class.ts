interface CpuClassResult {
  cpuClass?: string;
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

function getCpuClass(): string | undefined {
  try {
    const rawCpuClass = (navigator as any).cpuClass as string | undefined;
    return rawCpuClass?.trim() ?? "";
  } catch {
    return "";
  }
}
