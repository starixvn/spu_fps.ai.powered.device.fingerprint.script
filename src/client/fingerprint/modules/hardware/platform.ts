import type { PlatformInfo } from "../../types";

export function collectPlatform(): PlatformInfo {
  try {
    const platform = getPlatform();
    return { platform };
  } catch {
    return { platform: "" };
  }
}

function getPlatform(): string {
  try {
    const raw =
      navigator.platform ||
      navigator.userAgentData?.platform ||
      "";

    return normalizePlatform(raw);
  } catch {
    return "";
  }
}

function normalizePlatform(platform: string): string {
  switch (platform) {
    case "Windows":
    case "Win32":
    case "Win64":
      return "Win32"; 

    case "macOS":
    case "MacIntel":
      return "MacIntel";

    case "Linux":
    case "Linux x86_64":
    case "Linux i686":
      return "Linux x86_64";

    case "Chrome OS":
    case "CrOS":
      return "CrOS";

    case "Android":
      return "Android"; 

    case "iPhone":
    case "iPad":
    case "iPod":
    case "iOS":
      return "iPhone"; 

    default:
      return platform || "";
  }
}
