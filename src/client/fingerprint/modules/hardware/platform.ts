interface PlatformResult {
  platform: string;
}

export function collectPlatform(): PlatformResult {
  try {
    const platform = getPlatform();
    return { platform };
  } catch (error) {
    console.error("Error collecting platform:", error);
    return { platform: "" };
  }
}

function getPlatform(): string {
  try {
    if (navigator.userAgentData?.platform)
      return navigator.userAgentData.platform;

    if (navigator.platform) return navigator.platform;

    return "";
  } catch {
    return "";
  }
}
