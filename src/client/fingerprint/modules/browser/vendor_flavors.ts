interface VendorFlavorsResult {
  vendorFlavors: string[];
}

export function collectVendorFlavors(): VendorFlavorsResult {
  try {
    const vendorFlavors = getVendorFlavors();
    console.log("VendorFlavors fingerprint collected:", { vendorFlavors });

    return { vendorFlavors };
  } catch (error) {
    console.error("Error collecting vendor flavors:", error);
    return { vendorFlavors: [] };
  }
}

function getVendorFlavors(): string[] {
  try {
    const flavors: string[] = [];
    const userAgent = navigator.userAgent.toLowerCase();

    const enginePatterns = [
      { pattern: /webkit/, name: "WebKit-based" },
      { pattern: /gecko/, name: "Gecko-based" },
      { pattern: /blink/, name: "Blink-based" },
      { pattern: /trident/, name: "Trident-based" },
      { pattern: /edgehtml/, name: "EdgeHTML-based" },
    ];

    for (const engine of enginePatterns) {
      if (engine.pattern.test(userAgent)) {
        flavors.push(engine.name);
        break;
      }
    }

    const variantPatterns = [
      { pattern: /chromium/, name: "Chromium-based" },
      { pattern: /brave/, name: "Brave" },
      { pattern: /vivaldi/, name: "Vivaldi" },
      { pattern: /waterfox/, name: "Waterfox" },
      { pattern: /pale moon/, name: "Pale Moon" },
      { pattern: /iceweasel/, name: "Iceweasel" },
      { pattern: /seamonkey/, name: "SeaMonkey" },
      { pattern: /maxthon/, name: "Maxthon" },
      { pattern: /360/, name: "360 Browser" },
      { pattern: /qq/, name: "QQ Browser" },
      { pattern: /ucbrowser/, name: "UC Browser" },
      { pattern: /sogou/, name: "Sogou Browser" },
    ];

    for (const variant of variantPatterns) {
      if (variant.pattern.test(userAgent)) {
        flavors.push(variant.name);
      }
    }

    const devicePatterns = [
      { pattern: /mobile/, name: "Mobile" },
      { pattern: /tablet/, name: "Tablet" },
      { pattern: /touch/, name: "Touch-enabled" },
    ];

    for (const device of devicePatterns) {
      if (device.pattern.test(userAgent)) {
        flavors.push(device.name);
      }
    }

    const customMatch = userAgent.match(/([a-z]+)(?:browser|browser\/[\d.]+)/i);

    if (
      customMatch &&
      customMatch[1] &&
      !flavors.some((f) => f.toLowerCase().includes(customMatch[1]))
    ) {
      flavors.push(
        `${
          customMatch[1].charAt(0).toUpperCase() + customMatch[1].slice(1)
        }-based`
      );
    }

    return flavors.length > 0 ? flavors : ["Standard"];
  } catch {
    return ["unknown"];
  }
}
