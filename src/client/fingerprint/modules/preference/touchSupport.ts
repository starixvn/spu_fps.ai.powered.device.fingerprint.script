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
    if ("ontouchstart" in window) {
      return true;
    }

    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) {
      return true;
    }

    if (document && "ontouchstart" in document) {
      return true;
    }

    if (
      document.documentElement &&
      "ontouchstart" in document.documentElement
    ) {
      return true;
    }

    if (document.body && "ontouchstart" in document.body) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
