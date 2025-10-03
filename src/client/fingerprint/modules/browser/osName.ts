import type { OSNameInfo } from '../../types';
import { isAndroid, isDesktopWebKit } from '../../utils/browser';
import { FingerprintSpecialValue } from '../../utils/consts';

enum OSEnum {
  WINDOWS = 'Windows',
  MACOS = 'macOS',
  IOS = 'iOS',
  ANDROID = 'Android',
  LINUX = 'Linux',
  CHROME_OS = 'Chrome OS',
}

export function collectOSName(): OSNameInfo {
  try {
    if (isAndroid()) return OSEnum.ANDROID;

    const fromPlatform = detectOSByPlatform();
    if (fromPlatform) return fromPlatform;

    const fromFeatures = detectOSByFeatures();
    if (fromFeatures) return fromFeatures;

    const fromHardware = detectOSByHardware();
    if (fromHardware) return fromHardware;

    const fromInput = detectOSByInput();
    if (fromInput) return fromInput;

    if (navigator.userAgentData?.platform) {
      return normalizePlatform(navigator.userAgentData.platform);
    }

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function detectOSByPlatform(): string | null {
  try {
    const platform = navigator.platform?.toLowerCase() || '';

    if (platform.includes('win')) return OSEnum.WINDOWS;
    if (platform.includes('mac')) return OSEnum.MACOS;
    if (
      platform.includes('iphone') ||
      platform.includes('ipad') ||
      platform.includes('ipod')
    )
      return OSEnum.IOS;
    if (platform.includes('linux')) return OSEnum.LINUX;
    if (platform.includes('android')) return OSEnum.ANDROID;
  } catch {}
  return null;
}

function detectOSByFeatures(): string | null {
  try {
    if (
      (navigator as any).msMaxTouchPoints !== undefined ||
      (navigator as any).msSaveBlob !== undefined ||
      'MSInputMethodContext' in window
    ) {
      return OSEnum.WINDOWS;
    }

    if (
      (window as any).DeviceMotionEvent &&
      typeof (window as any).DeviceMotionEvent.requestPermission === 'function'
    ) {
      return OSEnum.IOS;
    }

    if ((window as any).safari && (window as any).safari.pushNotification) {
      return OSEnum.MACOS;
    }

    if (
      (window as any).orientation !== undefined &&
      'ontouchstart' in window &&
      navigator.userAgent.includes('Mobile')
    ) {
      return OSEnum.ANDROID;
    }
  } catch {}
  return null;
}

function detectOSByHardware(): string | null {
  try {
    const screen = window.screen;
    const ratio = window.devicePixelRatio || 1;

    const width = screen.width * ratio;
    const height = screen.height * ratio;

    const iosResolutions = [
      [320, 568],
      [375, 667],
      [375, 812],
      [390, 844],
      [393, 852],
      [414, 736],
      [414, 896],
      [428, 926],
      [768, 1024],
      [820, 1180],
      [834, 1194],
      [1024, 1366],
    ];

    if (
      iosResolutions.some(
        ([w, h]) =>
          (width === w && height === h) || (width === h && height === w)
      )
    ) {
      return OSEnum.IOS;
    }
  } catch {}
  return null;
}

function detectOSByInput(): string | null {
  try {
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    if (hasTouch) {
      if ((window as any).orientation !== undefined) {
        if (navigator.standalone !== undefined) {
          return OSEnum.IOS;
        }
        return OSEnum.ANDROID;
      }

      if (navigator.userAgent.includes('Windows')) {
        return OSEnum.WINDOWS;
      }
    }

    if (!hasTouch) {
      if ((navigator as any).keyboard) {
        return '';
      }
    }
  } catch {}
  return null;
}

function normalizePlatform(platform: string): string {
  const p = platform.toLowerCase();

  if (p.includes('windows')) return OSEnum.WINDOWS;
  if (p.includes('mac')) return OSEnum.MACOS;
  if (p.includes('ios') || p.includes('ipados')) return OSEnum.IOS;
  if (p.includes('android')) return OSEnum.ANDROID;
  if (p.includes('cros')) return OSEnum.CHROME_OS;
  if (p.includes('linux')) return OSEnum.LINUX;

  return platform;
}
