import type { PlatformInfo } from "../../types";

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

function countTruthy(array: any[]): number {
  return array.filter(Boolean).length;
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

function isWebKit(): boolean {
  const w = window;
  const n = navigator;

  return (
    countTruthy([
      'ApplePayError' in w,
      'CSSPrimitiveValue' in w,
      'Counter' in w,
      n.vendor.indexOf('Apple') === 0,
      'RGBColor' in w,
      'WebKitMediaKeys' in w,
    ]) >= 4
  );
}
