import type { VendorInfo } from "../../types";

export function collectVendor(): VendorInfo {
  try {
    const vendor = getVendor();
    return { vendor };
  } catch {
    return { vendor: "" };
  }
}

function getVendor(): string {
  try {
    // 1. Native vendor field (quickest)
    if (navigator.vendor && navigator.vendor.trim() !== "") {
      return navigator.vendor; // e.g. "Google Inc."
    }

    // 2. Browser-specific globals (stable)
    if ((window as any).safari?.pushNotification) {
      return "Apple Inc.";
    }
    if (typeof (window as any).InstallTrigger !== "undefined") {
      return "Mozilla Foundation";
    }
    if ((window as any).opr || (window as any).oprt) {
      return "Opera Software ASA";
    }
    if ((navigator as any).brave || (window as any).chrome?.brave) {
      return "Brave Software Inc.";
    }
    if ((window as any).samsungAr) {
      return "Samsung Electronics";
    }
    if ((window as any).chrome) {
      return "Google Inc."; // generic Chrome-family fallback
    }

    // 3. Fallback: unknown
    return "Unknown";
  } catch {
    return "";
  }
}
