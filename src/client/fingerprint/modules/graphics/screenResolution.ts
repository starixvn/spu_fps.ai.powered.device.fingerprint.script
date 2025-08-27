import type { ScreenResolutionInfo } from "../../types";

export function collectScreenResolution(): ScreenResolutionInfo {
  try {
    return getScreenResolution();
  } catch (error) {
    return getDefaultScreenResolution();
  }
}

function getScreenResolution(): ScreenResolutionInfo {
  const screen = window.screen;

  const width = screen.width || 0;
  const height = screen.height || 0;
  const availWidth = screen.availWidth || 0;
  const availHeight = screen.availHeight || 0;

  const devicePixelRatio = window.devicePixelRatio || 1;

  const logicalPixelRatio = devicePixelRatio;

  const pixelRatio = calculateEffectivePixelRatio();

  return {
    width,
    height,
    availWidth,
    availHeight,
    pixelRatio,
    devicePixelRatio,
    logicalPixelRatio,
  };
}

function calculateEffectivePixelRatio(): number {
  try {
    let pixelRatio = window.devicePixelRatio || 1;

    if ("webkitDevicePixelRatio" in window) {
      const webkitRatio = (window as any).webkitDevicePixelRatio;

      if (typeof webkitRatio === "number") {
        pixelRatio = Math.max(pixelRatio, webkitRatio);
      }
    }

    if (window.matchMedia) {
      if (window.matchMedia("(-webkit-min-device-pixel-ratio: 2)").matches) {
        pixelRatio = Math.max(pixelRatio, 2);
      }

      if (window.matchMedia("(-webkit-min-device-pixel-ratio: 3)").matches) {
        pixelRatio = Math.max(pixelRatio, 3);
      }
    }

    if (pixelRatio < 0.5 || pixelRatio > 8) {
      return 1;
    }

    return pixelRatio;
  } catch {
    return 1;
  }
}

function getDefaultScreenResolution(): ScreenResolutionInfo {
  return {
    width: 0,
    height: 0,
    availWidth: 0,
    availHeight: 0,
    pixelRatio: 1,
    devicePixelRatio: 1,
    logicalPixelRatio: 1,
  };
}
