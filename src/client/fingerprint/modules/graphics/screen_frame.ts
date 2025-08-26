import type { ScreenFrameInfo } from "../../types";

export function collectScreenFrame(): ScreenFrameInfo {
  try {
    return getScreenFrame();
  } catch (error) {
    console.error("Error collecting screen frame fingerprint:", error);
    return getDefaultScreenFrame();
  }
}

function getScreenFrame(): ScreenFrameInfo {
  const screen = window.screen;

  const frameWidth = screen.width || 0;
  const frameHeight = screen.height || 0;

  const frameColorDepth = screen.colorDepth || 0;
  const framePixelDepth = screen.pixelDepth || 0;

  const frameDepth = frameColorDepth || framePixelDepth || 24;

  const orientation = getScreenOrientation();
  const orientationAngle = getOrientationAngle();

  return {
    frameWidth,
    frameHeight,
    frameDepth,
    frameColorDepth,
    framePixelDepth,
    orientation,
    orientationAngle,
  };
}

function getScreenOrientation(): string {
  try {
    if ("orientation" in screen && (screen as any).orientation?.type) {
      return (screen as any).orientation.type;
    }
    if ("webkitOrientation" in screen && (screen as any).webkitOrientation) {
      return String((screen as any).webkitOrientation);
    }
    if ("mozOrientation" in screen && (screen as any).mozOrientation) {
      return String((screen as any).mozOrientation);
    }
    if ("msOrientation" in screen && (screen as any).msOrientation) {
      return String((screen as any).msOrientation);
    }

    if (screen.width && screen.height) {
      return screen.width > screen.height ? "landscape" : "portrait";
    }

    if (window.matchMedia) {
      if (window.matchMedia("(orientation: portrait)").matches)
        return "portrait";
      if (window.matchMedia("(orientation: landscape)").matches)
        return "landscape";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

function getOrientationAngle(): number {
  try {
    if (
      "orientation" in screen &&
      typeof (screen as any).orientation?.angle === "number"
    ) {
      return (screen as any).orientation.angle;
    }

    if (
      "webkitOrientation" in screen &&
      typeof (screen as any).webkitOrientation?.angle === "number"
    ) {
      return (screen as any).webkitOrientation.angle;
    }
    if (
      "mozOrientation" in screen &&
      typeof (screen as any).mozOrientation?.angle === "number"
    ) {
      return (screen as any).mozOrientation.angle;
    }
    if (
      "msOrientation" in screen &&
      typeof (screen as any).msOrientation?.angle === "number"
    ) {
      return (screen as any).msOrientation.angle;
    }

    if (screen.width && screen.height) {
      return screen.width > screen.height ? 90 : 0;
    }

    return 0;
  } catch {
    return 0;
  }
}

function getDefaultScreenFrame(): ScreenFrameInfo {
  return {
    frameWidth: 0,
    frameHeight: 0,
    frameDepth: 24,
    frameColorDepth: 24,
    framePixelDepth: 24,
    orientation: "unknown",
    orientationAngle: 0,
  };
}
