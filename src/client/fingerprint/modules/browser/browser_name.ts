interface BrowserNameResult {
  browserName: string;
}

export function collectBrowserName(): BrowserNameResult {
  try {
    const browserName = getBrowserName();
    return { browserName };
  } catch (error) {
    console.error("Error collecting browser name:", error);
    return { browserName: "" };
  }
}

function getBrowserName(): string {
  try {
    const brands = navigator.userAgentData?.brands;

    if (brands?.length) {
      const fromBrands = parseFromBrands(brands);
      if (fromBrands !== "") return fromBrands;
    }

    const userAgent = (navigator.userAgent || "").toLowerCase();
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
