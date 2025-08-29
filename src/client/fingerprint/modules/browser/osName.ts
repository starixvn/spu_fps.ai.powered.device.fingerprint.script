import type { OSNameInfo } from "../../types";

export function collectOSName(): OSNameInfo {
  try {
    const osName = getOSName();
    return { osName };
  } catch (error) {
    return { osName: "" };
  }
}

function getOSName(): string {
  try {
    if (navigator.userAgentData?.platform) {
      return normalizePlatform(navigator.userAgentData.platform);
    }

    const fromPlatform = detectOSByPlatform();
    const fromFeatures = detectOSByFeatures();
    const fromHardware = detectOSByHardware();
    const fromInput = detectOSByInput();
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

    if (fromPlatform !== "") return fromPlatform;

    if (fromFeatures !== "") return fromFeatures;

    if (fromHardware !== "") return fromHardware;

    if (fromInput !== "") return fromInput;

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

function detectOSByPlatform(): string {
  try {
    const platform = navigator.platform?.toLowerCase() || "";

    if (platform.includes("win")) return "Windows";
    if (platform.includes("mac")) return "macOS";
    if (
      platform.includes("iphone") ||
      platform.includes("ipad") ||
      platform.includes("ipod")
    )
      return "iOS";
    if (platform.includes("linux")) return "Linux";
    if (platform.includes("android")) return "Android";

    return "";
  } catch {
    return "";
  }
}

function detectOSByFeatures(): string {
  try {
    if (
      (navigator as any).msMaxTouchPoints !== undefined ||
      (navigator as any).msSaveBlob !== undefined ||
      "MSInputMethodContext" in window
    ) {
      return "Windows";
    }

    if (
      (window as any).safari &&
      (window as any).safari.pushNotification &&
      !navigator.userAgent.includes("iPhone") &&
      !navigator.userAgent.includes("iPad")
    ) {
      return "macOS";
    }

    if (
      (window as any).DeviceMotionEvent &&
      typeof (window as any).DeviceMotionEvent.requestPermission === "function"
    ) {
      return "iOS";
    }

    if (
      (window as any).orientation !== undefined &&
      "ontouchstart" in window &&
      navigator.userAgent.includes("Mobile")
    ) {
      return "Android";
    }

    return "";
  } catch {
    return "";
  }
}

function detectOSByHardware(): string {
  try {
    const screen = window.screen;
    const ratio = window.devicePixelRatio || 1;

    const width = screen.width * ratio;
    const height = screen.height * ratio;

    const iosResolutions = [
      [320, 568],
      [375, 667],
      [375, 812],
      [390, 844],
      [393, 852],
      [414, 736],
      [414, 896],
      [428, 926],
      [768, 1024],
      [820, 1180],
      [834, 1194],
      [1024, 1366],
    ];

    if (
      iosResolutions.some(
        ([w, h]) =>
          (width === w && height === h) || (width === h && height === w)
      )
    ) {
      return "iOS";
    }

    if (ratio > 2 && "ontouchstart" in window) {
      if (navigator.maxTouchPoints > 0) {
        return navigator.userAgent.includes("iPhone") ||
          navigator.userAgent.includes("iPad")
          ? "iOS"
          : "Android";
      }
    }

    return "";
  } catch {
    return "";
  }
}

function detectOSByInput(): string {
  try {
    const hasTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    if (hasTouch) {
      if ((window as any).orientation !== undefined) {
        if (navigator.standalone !== undefined) {
          return "iOS";
        }
        return "Android";
      }

      if (navigator.userAgent.includes("Windows")) {
        return "Windows";
      }
    }

    if (!hasTouch) {
      if ((navigator as any).keyboard) {
        return "";
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
