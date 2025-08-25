interface ArchitectureResult {
  architecture: string;
}

export async function collectArchitecture(): Promise<ArchitectureResult> {
  try {
    const architecture = await getArchitecture();
    return { architecture };
  } catch (error) {
    console.error("Error collecting architecture:", error);
    return { architecture: "" };
  }
}

async function getArchitecture(): Promise<string> {
  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      try {
        const data = await navigator.userAgentData.getHighEntropyValues([
          "architecture",
        ]);

        if (data?.architecture) return data.architecture;
      } catch (err) {
        console.warn("High-entropy Client Hints not available:", err);
      }
    }

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("win64") || userAgent.includes("x64"))
      return "x86_64";
    if (userAgent.includes("win32") || userAgent.includes("i686")) return "x86";
    if (userAgent.includes("aarch64") || userAgent.includes("arm64"))
      return "arm64";
    if (userAgent.includes("armv7l")) return "armv7l";

    return "";
  } catch {
    return "";
  }
}
