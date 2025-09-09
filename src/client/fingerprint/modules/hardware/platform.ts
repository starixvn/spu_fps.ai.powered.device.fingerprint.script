import type { PlatformInfo } from "../../types";
import { countTruthy, isWebKit } from "../../utils/browser";

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
      if (isWebKit() && !isDesktopWebKit()) {
        return isIPad() ? 'iPad' : 'iPhone';
      }
    }

    return platform || "";
  } catch {
    return "";
  }
}

function isDesktopWebKit(): boolean {
  const w = window;
  const { HTMLElement, Document } = w;

  return (
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

function isIPad(): boolean {
  if (navigator.platform === 'iPad') {
    return true;
  }

  const s = screen;
  const screenRatio = s.width / s.height;

  return (
    countTruthy([
      'MediaSource' in window,
      !!(Element.prototype as any).webkitRequestFullscreen,
      screenRatio > 0.65 && screenRatio < 1.53,
    ]) >= 2
  );
}

