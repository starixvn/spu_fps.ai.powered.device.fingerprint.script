import type { BrowserNameInfo } from "../../types";

export function collectBrowserName(): BrowserNameInfo {
  try {
    const browserName = getBrowserName();
    return { browserName };
  } catch (error) {
    return { browserName: "" };
  }
}

function getBrowserName(): string {
  try {
    // 1. User-Agent Client Hints (Chromium browsers)
    const brands = navigator.userAgentData?.brands || [];
    if (brands.length) {
      const fromBrands = parseFromBrands(brands);
      if (fromBrands !== "") return fromBrands;
    }

    // 2. Feature detection
    const fromFeatures = detectBrowserByFeatures();
    if (fromFeatures !== "") return fromFeatures;

    // 3. CSS property detection
    const fromCSS = detectBrowserByCSS();
    if (fromCSS !== "") return fromCSS;

    return "Unknown";
  } catch {
    return "Unknown";
  }
}

function detectBrowserByFeatures(): string {
  try {
    if ((navigator as any).brave && typeof (navigator as any).brave.isBrave === "function") {
      return "Brave";
    }

    if ((window as any).opr || (window as any).opera) {
      return "Opera";
    }

    if ((window as any).chrome && !(window as any).opr && !(navigator as any).brave) {
      return "Chrome";
    }

    if (typeof (window as any).InstallTrigger !== "undefined") {
      return "Firefox";
    }

    if ((window as any).safari && (window as any).safari.pushNotification) {
      return "Safari";
    }

    if ((window as any).StyleMedia || (navigator as any).msLaunchUri) {
      return "Edge (Legacy)";
    }

    return "";
  } catch {
    return "";
  }
}

function detectBrowserByCSS(): string {
  try {
    const style = document.createElement("div").style;

    if ("MozAppearance" in style) {
      return "Firefox";
    }

    if ("WebkitAppearance" in style && !(window as any).chrome) {
      return "Safari";
    }

    if ("msScrollLimit" in style || "msImeAlign" in style) {
      return "Edge";
    }

    return "";
  } catch {
    return "";
  }
}

function parseFromBrands(
  brands: ReadonlyArray<{ brand: string; version: string }>
): string {
  const names = brands.map((b) => b.brand.toLowerCase());

  if (names.some((n) => n.includes("edge"))) return "Edge";
  if (names.some((n) => n.includes("opera") || n.includes("opr"))) return "Opera";
  if (names.some((n) => n.includes("brave"))) return "Brave";
  if (names.some((n) => n.includes("chrome"))) return "Chrome";
  if (names.some((n) => n.includes("chromium"))) return "Chromium";

  return "";
}
