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

    if (navigator.oscpu) return navigator.oscpu;

    const ua = navigator.userAgent;
    let oscpu = "";

    if (ua.includes("Android")) oscpu = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")) oscpu = "iOS";
    else if (ua.includes("Windows NT 10.0")) oscpu = "Windows NT 10.0";
    else if (ua.includes("Windows NT 6.3")) oscpu = "Windows NT 6.3";
    else if (ua.includes("Windows NT 6.2")) oscpu = "Windows NT 6.2";
    else if (ua.includes("Windows NT 6.1")) oscpu = "Windows NT 6.1";
    else if (ua.includes("Mac OS X")) oscpu = "Mac OS X";
    else if (ua.includes("Linux")) oscpu = "Linux";

    if (oscpu.startsWith("Windows")) {
      if (ua.includes("Win64") || ua.includes("x64")) oscpu += "; Win64; x64";
      else if (ua.includes("Win32") || ua.includes("i686")) oscpu += "; Win32; x86";
    }

    if (oscpu === "Mac OS X") {
      if (ua.includes("Intel")) oscpu += "; Intel";
      else if (ua.includes("PPC")) oscpu += "; PPC";
    }

    if (oscpu === "Linux") {
      if (ua.includes("x86_64")) oscpu += "; x86_64";
      else if (ua.includes("i686")) oscpu += "; i686";
      else if (ua.includes("armv7l")) oscpu += "; armv7l";
      else if (ua.includes("aarch64")) oscpu += "; aarch64";
    }

    return oscpu || "";
  } catch {
    return "";
  }
}
