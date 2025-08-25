interface OSNameResult {
  osName: string;
}

export function collectOSName(): OSNameResult {
  try {
    const osName = getOSName();
    return { osName };
  } catch (error) {
    console.error("Error collecting OS name:", error);
    return { osName: "" };
  }
}

function getOSName(): string {
  try {
    if (navigator.userAgentData?.platform) {
      return normalizePlatform(navigator.userAgentData.platform);
    }

    const userAgent = navigator.userAgent;

    const osPatterns = [
      { pattern: /Windows NT/, name: "Windows" },
      { pattern: /Windows/, name: "Windows" },

      { pattern: /Mac OS X/, name: "macOS" },
      { pattern: /Macintosh/, name: "macOS" },

      { pattern: /Linux/, name: "Linux" },

      { pattern: /Android/, name: "Android" },

      { pattern: /iPhone|iPad|iPod/, name: "iOS" },

      { pattern: /BlackBerry/, name: "BlackBerry" },
      { pattern: /Symbian/, name: "Symbian" },
      { pattern: /webOS/, name: "webOS" },
      { pattern: /Windows Phone/, name: "Windows Phone" },
    ];

    for (const os of osPatterns) {
      if (os.pattern.test(userAgent)) {
        return os.name;
      }
    }

    return "";
  } catch {
    return "";
  }
}

function normalizePlatform(platform: string): string {
  const p = platform.toLowerCase();

  if (p.includes("windows")) return "Windows";
  if (p.includes("mac")) return "macOS";
  if (p.includes("ios")) return "iOS";
  if (p.includes("ipados")) return "iPadOS";
  if (p.includes("android")) return "Android";
  if (p.includes("cros")) return "Chrome OS";
  if (p.includes("linux")) return "Linux";

  return platform;
}
