export function collectArchitecture(): {
  architecture: string;
} {
  const architecture = getArchitecture();
  console.log("Architecture fingerprint collected:", { architecture });
  return {
    architecture,
  };
}

function getArchitecture(): string {
  try {
    if ((navigator.userAgentData as any)?.getHighEntropyValues) {
      const data = (navigator.userAgentData as any).getHighEntropyValues([
        "architecture",
      ]);
      if (data?.architecture) return data.architecture;
    }

    if (
      navigator.platform?.includes("Win64") ||
      navigator.userAgent.includes("Win64")
    ) {
      return "x86_64";
    }
    if (
      navigator.platform?.includes("Win32") ||
      navigator.userAgent.includes("i686")
    ) {
      return "x86";
    }
    if (
      navigator.userAgent.includes("aarch64") ||
      navigator.platform?.includes("arm64")
    ) {
      return "arm64";
    }
    if (navigator.userAgent.includes("armv7l")) {
      return "armv7l";
    }

    return "unknown";
  } catch (e) {
    return "unknown";
  }
}
