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
    if (navigator.oscpu) return navigator.oscpu;

    if (navigator.userAgentData?.getHighEntropyValues) {
      try {
        const data = await navigator.userAgentData.getHighEntropyValues([
          "architecture",
          "platform",
        ]);
        
        if (data?.platform && data?.architecture) {
          return `${data.platform}; ${data.architecture}`;
        }
      } catch {}
    }

    return "";
  } catch {
    return "";
  }
}
