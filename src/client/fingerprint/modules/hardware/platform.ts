import type { PlatformInfo, Bit } from "../../types";
import { countTruthy, isWebKit } from "../../utils/browser";
import { boolToBit } from "../../utils/data";

export function collectPlatform(): PlatformInfo {
  try {
    const platform = getPlatform();
    return { platform };
  } catch {
    return { platform: "" };
  }
}

function getPlatform(): string {
  try {
    const platform = navigator.platform;
   
    if (platform === 'MacIntel') {
      if (isWebKit() === 1 && isDesktopWebKit() === 0) {
        return isIPad() === 1 ? 'iPad' : 'iPhone';
      }
    }

    return platform || "";
  } catch {
    return "";
  }
}

function isDesktopWebKit(): Bit {
  const w = window;
  const { HTMLElement, Document } = w;

  return boolToBit(
    countTruthy([
      'safari' in w, 
      !('ongestureend' in w),
      !('TouchEvent' in w),
      !('orientation' in w),
      HTMLElement && !('autocapitalize' in HTMLElement.prototype),
      Document && 'pointerLockElement' in Document.prototype,
    ]) >= 4
  );
}

function isIPad(): Bit {
  if (navigator.platform === 'iPad') {
    return 1;
  }

  const s = screen;
  const screenRatio = s.width / s.height;

  return boolToBit(
    countTruthy([
      'MediaSource' in window,
      !!(Element.prototype as any).webkitRequestFullscreen,
      screenRatio > 0.65 && screenRatio < 1.53,
    ]) >= 2
  );
}

