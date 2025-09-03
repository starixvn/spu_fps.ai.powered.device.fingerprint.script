import type { TouchSupportInfo } from "../../types";

export function collectTouchSupport(): TouchSupportInfo {
  try {
    const touchSupport = getTouchSupport();
    return { touchSupport };
  } catch (error) {
    return { touchSupport: false };
  }
}

function getTouchSupport(): boolean {
  try {
    if (typeof navigator !== "undefined") {
      if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) return true;

      if (
        (navigator as any).msMaxTouchPoints &&
        (navigator as any).msMaxTouchPoints > 0
      )
        return true;
    }

    if (typeof window !== "undefined" && "ontouchstart" in window) return true;

    if (typeof document !== "undefined") {
      if ("ontouchstart" in document) return true;

      if (
        document.documentElement &&
        "ontouchstart" in document.documentElement
      )
        return true;

      if (document.body && "ontouchstart" in document.body) return true;
    }

    return false;
  } catch {
    return false;
  }
}
