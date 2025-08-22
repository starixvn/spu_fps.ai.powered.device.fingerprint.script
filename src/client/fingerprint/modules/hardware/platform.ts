interface PlatformResult {
  platform: string;
}

export async function collectPlatform(): Promise<PlatformResult> {
  try {
    const platform = await getPlatform();
    console.log("Platform fingerprint collected:", { platform });

    return { platform };
  } catch (error) {
    console.error("Error collecting platform:", error);
    return { platform: "unknown" };
  }
}

async function getPlatform(): Promise<string> {
  try {
    if (navigator.platform) return navigator.platform;

    if (navigator.userAgentData?.platform)
      return navigator.userAgentData.platform;

    return "unknown";
  } catch {
    return "unknown";
  }
}
