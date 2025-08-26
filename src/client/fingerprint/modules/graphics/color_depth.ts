import type { ColorDepthInfo } from "../../types";

export function collectColorDepth(): ColorDepthInfo {
  try {
    return getColorDepthInfo();
  } catch (error) {
    console.error("Error collecting color depth fingerprint:", error);
    return getFallbackColorDepthInfo();
  }
}

function getColorDepthInfo(): ColorDepthInfo {
  const screen = window.screen;

  const colorDepth = screen.colorDepth || 0;
  const pixelDepth = screen.pixelDepth || 0;

  const bitsPerChannel = calculateBitsPerChannel(colorDepth);
  const totalBits = colorDepth || pixelDepth || 24;

  return {
    colorDepth,
    pixelDepth,
    bitsPerChannel,
    totalBits,
    hasAlpha: checkAlphaChannelSupport(),
    hasTransparency: checkTransparencySupport(),
  };
}

function calculateBitsPerChannel(colorDepth: number): number {
  if (!colorDepth || colorDepth <= 0) return 8;

  switch (colorDepth) {
    case 8:
      return 8; // 256 colors
    case 16:
      return 5; // 5-6-5 RGB
    case 24:
      return 8; // 8-8-8 RGB
    case 32:
      return 8; // 8-8-8-8 RGBA
    case 48:
      return 16; // 16-16-16 RGB
    case 64:
      return 16; // 16-16-16-16 RGBA
    default:
      return Math.floor(colorDepth / (colorDepth > 32 ? 4 : 3));
  }
}

function checkAlphaChannelSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const imageData = ctx.createImageData(1, 1);
    return imageData.data.length === 4; // RGBA
  } catch {
    return true;
  }
}

function checkTransparencySupport(): boolean {
  try {
    const testElement = document.createElement("div");
    testElement.style.position = "absolute";
    testElement.style.visibility = "hidden";
    testElement.style.backgroundColor = "rgba(255, 0, 0, 0.5)";

    document.body.appendChild(testElement);
    const computedStyle = window.getComputedStyle(testElement).backgroundColor;
    document.body.removeChild(testElement);

    return computedStyle.includes("rgba") || computedStyle.includes("hsla");
  } catch {
    return true;
  }
}

function getFallbackColorDepthInfo(): ColorDepthInfo {
  return {
    colorDepth: 24,
    pixelDepth: 24,
    bitsPerChannel: 8,
    totalBits: 24,
    hasAlpha: true,
    hasTransparency: true,
  };
}
