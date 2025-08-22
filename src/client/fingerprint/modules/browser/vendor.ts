interface VendorResult {
  vendor: string;
}

export function collectVendor(): VendorResult {
  try {
    const vendor = getVendor();
    console.log("Vendor fingerprint collected:", { vendor });

    return { vendor };
  } catch (error) {
    console.error("Error collecting vendor:", error);
    return { vendor: "unknown" };
  }
}

function getVendor(): string {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    const vendor = (navigator as any).vendor as string | undefined;

    if (vendor && vendor.trim() !== "") return vendor;

    if (userAgent.includes("google")) return "Google Inc.";
    if (userAgent.includes("mozilla")) return "Mozilla Foundation";
    if (userAgent.includes("apple")) return "Apple Inc.";
    if (userAgent.includes("microsoft")) return "Microsoft Corporation";
    if (userAgent.includes("opera")) return "Opera Software ASA";

    return "unknown";
  } catch {
    return "unknown";
  }
}
