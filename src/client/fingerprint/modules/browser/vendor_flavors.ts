interface VendorFlavorsResult {
  vendorFlavors: string[];
}

export function collectVendorFlavors(): VendorFlavorsResult {
  try {
    const vendorFlavors = getVendorFlavors();
    return { vendorFlavors };
  } catch (error) {
    console.error("Error collecting vendor flavors:", error);
    return { vendorFlavors: [] };
  }
}

function getVendorFlavors(): string[] {
  const flavors: string[] = [];

  const brands = navigator.userAgentData?.brands ?? [];
  const platform = navigator.userAgentData?.platform ?? "";
  const ua = navigator.userAgent;

  for (const brand of brands) {
    const name = brand.brand.trim();
    if (name && !isGreaseBrand(name) && !flavors.includes(`Brand:${name}`)) {
      flavors.push(`Brand:${name}`);
    }
  }

  if (platform) {
    flavors.push(`Platform:${platform}`);
  }

  if (navigator.vendor) {
    flavors.push(`Vendor:${navigator.vendor}`);
  }

  const engine = detectEngine(ua);
  if (engine) {
    flavors.push(`Engine:${engine}`);
  }

  if (ua) {
    flavors.push(`UA:${ua}`);
  }

  return flavors.length > 0 ? flavors : ["Standard"];
}

function isGreaseBrand(brand: string): boolean {
  return /;|Brand/i.test(brand) && brand !== "Chromium";
}

function detectEngine(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();

  if (ua.includes("applewebkit") && ua.includes("chrome")) {
    return "Blink";
  }
  if (ua.includes("applewebkit") && !ua.includes("chrome")) {
    return "WebKit";
  }
  if (ua.includes("gecko") && ua.includes("firefox")) {
    return "Gecko";
  }
  if (ua.includes("trident")) {
    return "Trident";
  }
  if (ua.includes("edge") && ua.includes("edgehtml")) {
    return "EdgeHTML";
  }
  return null;
}
