export function collectPlatform(): {
  platform: string;
} {
  const platform = getPlatform();
  console.log("Platform fingerprint collected:", { platform });
  return {
    platform,
  };
}

function getPlatform(): string {
  try {
    if (navigator.platform) {
      return navigator.platform;
    }

    if (navigator.userAgentData?.platform) {
      return navigator.userAgentData.platform;
    }

    return "unknown";
  } catch (e) {
    return "unknown";
  }
}
