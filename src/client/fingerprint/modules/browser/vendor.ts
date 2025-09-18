import type { VendorInfo } from "../../types";

export function collectVendor(): VendorInfo {
  const vendor = getVendor();
  return { vendor };
}

function getVendor(): string {
  try {
    if (navigator.vendor && navigator.vendor.trim() !== "") {
      return navigator.vendor; 
    }

    const w = window as any;
    const n = navigator as any;

    if (w.safari?.pushNotification) return "Apple Inc.";
    if (typeof w.InstallTrigger !== "undefined") return "Mozilla Foundation";
    if (w.opr || w.oprt) return "Opera Software ASA";
    if (n.brave || w.chrome?.brave) return "Brave Software Inc.";
    if (w.samsungAr) return "Samsung Electronics";
    if (w.chrome) return "Google Inc.";

    return "";
  } catch {
    return "";
  }
}
