interface OSCpuResult {
  oscpu: string;
}

export function collectOSCpu(): OSCpuResult {
  try {
    const oscpu = getOSCpu();
    return { oscpu };
  } catch (error) {
    console.error("Error collecting OSCPU:", error);
    return { oscpu: "" };
  }
}

function getOSCpu(): string {
  try {
    if (navigator.oscpu) return navigator.oscpu;

    const userAgent = navigator.userAgent;
    let oscpu = "";

    if (userAgent.includes("Windows NT 10.0")) oscpu = "Windows NT 10.0";
    else if (userAgent.includes("Windows NT 6.3")) oscpu = "Windows NT 6.3";
    else if (userAgent.includes("Windows NT 6.2")) oscpu = "Windows NT 6.2";
    else if (userAgent.includes("Windows NT 6.1")) oscpu = "Windows NT 6.1";
    else if (userAgent.includes("Mac OS X")) oscpu = "Mac OS X";
    else if (userAgent.includes("Linux")) oscpu = "Linux";
    else if (userAgent.includes("Android")) oscpu = "Android";
    else if (userAgent.includes("iOS")) oscpu = "iOS";

    if (oscpu.startsWith("Windows")) {
      if (userAgent.includes("Win64") || userAgent.includes("x64"))
        oscpu += "; Win64; x64";
      else if (userAgent.includes("Win32") || userAgent.includes("i686"))
        oscpu += "; Win32; x86";
    }

    if (oscpu === "Mac OS X") {
      if (userAgent.includes("Intel")) oscpu += "; Intel";
      else if (userAgent.includes("PPC")) oscpu += "; PPC";
    }

    if (oscpu === "Linux") {
      if (userAgent.includes("x86_64")) oscpu += "; x86_64";
      else if (userAgent.includes("i686")) oscpu += "; i686";
      else if (userAgent.includes("armv7l")) oscpu += "; armv7l";
      else if (userAgent.includes("aarch64")) oscpu += "; aarch64";
    }

    return oscpu || "";
  } catch {
    return "";
  }
}
