interface ArchitectureResult {
  architecture: string;
}

export async function collectArchitecture(): Promise<ArchitectureResult> {
  try {
    const architecture = await getArchitecture();
    console.log("Architecture fingerprint collected:", { architecture });

    return { architecture };
  } catch (error) {
    console.error("Error collecting architecture:", error);
    return { architecture: "unknown" };
  }
}

async function getArchitecture(): Promise<string> {
  try {
    if ((navigator.userAgentData as any)?.getHighEntropyValues) {
      const data = await (navigator.userAgentData as any).getHighEntropyValues([
        "architecture",
      ]);

      if (data?.architecture) return data.architecture;
    }

    const userAgent = navigator.userAgent;
    if (userAgent.includes("Win64") || userAgent.includes("x64"))
      return "x86_64";

    if (userAgent.includes("Win32") || userAgent.includes("i686")) return "x86";

    if (userAgent.includes("aarch64") || userAgent.includes("arm64"))
      return "arm64";

    if (userAgent.includes("armv7l")) return "armv7l";

    return "unknown";
  } catch {
    return "unknown";
  }
}
