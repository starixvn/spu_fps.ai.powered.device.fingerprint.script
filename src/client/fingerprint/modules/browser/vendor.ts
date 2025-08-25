interface VendorResult {
  vendor: string;
}

export function collectVendor(): VendorResult {
  try {
    const vendor = getVendor();
    return { vendor };
  } catch (error) {
    console.error("Error collecting vendor:", error);
    return { vendor: "" };
  }
}

function getVendor(): string {
  try {
    const userAgent = navigator.userAgent.toLowerCase();

    if (navigator.vendor && navigator.vendor.trim() !== "") {
      return navigator.vendor;
    }

    if (navigator.userAgentData?.brands) {
      for (const brand of navigator.userAgentData.brands) {
        const b = brand.brand.toLowerCase();
        if (b.includes("google")) return "Google Inc.";
        if (b.includes("edge")) return "Microsoft Corporation";
        if (b.includes("opera")) return "Opera Software ASA";
        if (b.includes("brave")) return "Brave Software Inc.";
        if (b.includes("samsung")) return "Samsung Electronics";
      }
    }

    if (
      userAgent.includes("applewebkit") &&
      userAgent.includes("safari") &&
      !userAgent.includes("chrome")
    ) {
      return "Apple Inc.";
    }
    if (userAgent.includes("firefox")) {
      return "Mozilla Foundation";
    }
    if (userAgent.includes("edg/")) {
      return "Microsoft Corporation";
    }
    if (userAgent.includes("opr") || userAgent.includes("opera")) {
      return "Opera Software ASA";
    }

    return "";
  } catch {
    return "";
  }
}
