interface PlatformResult {
  platform: string;
}

export function collectPlatform(): PlatformResult {
  try {
    const platform = getPlatform();
    console.log("Platform fingerprint collected:", { platform });

    return { platform };
  } catch (error) {
    console.error("Error collecting platform:", error);
    return { platform: "unknown" };
  }
}

function getPlatform(): string {
  try {
    if (navigator.platform) return navigator.platform;

    if (navigator.userAgentData?.platform)
      return navigator.userAgentData.platform;

    return "unknown";
  } catch {
    return "unknown";
  }
}
