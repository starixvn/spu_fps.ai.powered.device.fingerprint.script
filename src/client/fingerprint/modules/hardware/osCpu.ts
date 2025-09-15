import type { OSCpuInfo } from "../../types";

export async function collectOSCpu(): Promise<OSCpuInfo> {
  try {
    const oscpu = await getOSCpu();
    return { oscpu };
  } catch (error) {
    return { oscpu: "" };
  }
}

async function getOSCpu(): Promise<string> {
  try {
    if (!("oscpu" in navigator)) return "";

    const rawOSCpu = (navigator as any).oscpu;
    
    return typeof rawOSCpu === "string" ? rawOSCpu.trim() : "";
  } catch {
    return "";
  }
}
