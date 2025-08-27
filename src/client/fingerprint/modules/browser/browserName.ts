interface BrowserNameResult {
  browserName: string;
}

export function collectBrowserName(): BrowserNameResult {
  try {
    const browserName = getBrowserName();
    return { browserName };
  } catch (error) {
    return { browserName: "" };
  }
}

function getBrowserName(): string {
  try {
    const brands = navigator.userAgentData?.brands;
    const fromFeatures = detectBrowserByFeatures();
    const fromCSS = detectBrowserByCSS();
    const userAgent = (navigator.userAgent || "").toLowerCase();

    if (brands?.length) {
      const fromBrands = parseFromBrands(brands);

      if (fromBrands !== "") return fromBrands;
    }

    if (fromFeatures !== "") return fromFeatures;

    if (fromCSS !== "") return fromCSS;

    if (!userAgent) return "";

    if (/edgios/.test(userAgent)) return "Edge (iOS)";
    if (/crios/.test(userAgent)) return "Chrome (iOS)";
    if (/fxios/.test(userAgent)) return "Firefox (iOS)";

    if (/edga/.test(userAgent)) return "Edge (Android)";

    if (/edg\//.test(userAgent)) return "Edge";
    if (/opr|opera/.test(userAgent)) return "Opera";
    if (/brave/.test(userAgent)) return "Brave";
    if (/chrome/.test(userAgent)) return "Chrome";
    if (/chromium/.test(userAgent)) return "Chromium";
    if (/firefox/.test(userAgent)) return "Firefox";
    if (/safari(?!.*chrome)/.test(userAgent)) return "Safari";
    if (/msie|trident/.test(userAgent)) return "Internet Explorer";

    return "";
  } catch {
    return "";
  }
}

function detectBrowserByFeatures(): string {
  try {
    if (window.chrome && !window.opr && !navigator.brave) {
      return "Chrome";
    }

    if (window.opr || window.opera) {
      return "Opera";
    }

    if (navigator.brave && navigator.brave.isBrave) {
      return "Brave";
    }

    if (typeof window.InstallTrigger !== "undefined") {
      return "Firefox";
    }

    if (window.safari && window.safari.pushNotification) {
      return "Safari";
    }

    if (window.StyleMedia || window.navigator.msLaunchUri) {
      return "Edge";
    }

    return "";
  } catch {
    return "";
  }
}

function detectBrowserByCSS(): string {
  try {
    const style = document.createElement("div").style;

    // Firefox specific CSS properties
    if ("MozAppearance" in style) {
      return "Firefox";
    }

    // Safari/WebKit specific
    if ("WebkitAppearance" in style && !window.chrome) {
      return "Safari";
    }

    // Edge specific
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
  if (names.some((n) => n.includes("opera") || n.includes("opr")))
    return "Opera";
  if (names.some((n) => n.includes("brave"))) return "Brave";
  if (names.some((n) => n.includes("chrome"))) return "Chrome";
  if (names.some((n) => n.includes("chromium"))) return "Chromium";

  return "";
}
