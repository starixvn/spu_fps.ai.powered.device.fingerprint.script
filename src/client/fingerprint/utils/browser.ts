import type { Bit } from '../types';
import { boolToBit } from './data';

/**
 * Counts truthy values in an array
 */
export function countTruthy(values: unknown[]): number {
  return values.filter(Boolean).length;
}

/**
 * Detects if browser is based on Chromium without using user-agent
 */
export function isChromium(): Bit {
  const w = window;
  const n = navigator;

  return boolToBit(
    countTruthy([
      'webkitPersistentStorage' in n,
      'webkitTemporaryStorage' in n,
      (n.vendor || '').indexOf('Google') === 0,
      'webkitResolveLocalFileSystemURL' in w,
      'BatteryManager' in w,
      'webkitMediaStream' in w,
      'webkitSpeechGrammar' in w,
    ]) >= 5
  );
}

/**
 * Detects if browser is based on Chromium version ≥86 without using user-agent
 */
export function isChromium86OrNewer(): Bit {
  const w = window;

  return boolToBit(
    countTruthy([
      !('MediaSettingsRange' in w),
      'RTCEncodedAudioFrame' in w,
      '' + (w as any).Intl === '[object Intl]',
      '' + (w as any).Reflect === '[object Reflect]',
    ]) >= 3
  );
}

/**
 * Detects if browser is WebKit-based
 */
export function isWebKit(): Bit {
  try {
    const w = window;
    const n = navigator;

    const checks = [
      'ApplePayError' in w,
      'CSSPrimitiveValue' in w,
      'Counter' in w,
      n.vendor.indexOf('Apple') === 0,
      'RGBColor' in w,
      'WebKitMediaKeys' in w,
    ];
    
    const truthyCount = countTruthy(checks);
    const result = truthyCount >= 4;
    
    return boolToBit(result);
  } catch (error) {
    return 0;
  }
}

/**
 * Detects if browser is Safari WebKit (not other WebKit browsers like Chrome)
 */
export function isSafariWebKit(): Bit {
  try {
    const w = window;
    const n = navigator;
    const ua = n.userAgent;

    // Early returns for non-Safari browsers
    if ('chrome' in w) return 0;
    if (ua.includes('Chrome')) return 0;
    if (ua.includes('Chromium')) return 0;
    if (ua.includes('Edge')) return 0;

    // Must be WebKit and have Safari indicators
    return boolToBit(
      isWebKit() === 1 &&
      countTruthy([
        'safari' in w,
        ua.includes('Safari'),
        ua.includes('Version/'), // Safari has Version/ in UA
        n.vendor.includes('Apple'),
        !ua.includes('Chrome'),
      ]) >= 4
    );
  } catch {
    return 0;
  }
}

/**
 * Detects if WebKit version is 616 or newer (Safari 17+)
 * Based on WebKit version detection from user agent
 */
export function isWebKit616OrNewer(): Bit {
  try {
    const userAgent = navigator.userAgent;
    
    // Look for WebKit version in user agent
    const webkitMatch = userAgent.match(/WebKit\/(\d+)/);
    
    if (!webkitMatch) return 0;
    
    const webkitVersion = parseInt(webkitMatch[1], 10);
    
    // WebKit 616+ corresponds to Safari 17+
    return boolToBit(webkitVersion >= 616);
  } catch {
    return 0;
  }
}

/**
 * Gets the current fullscreen element
 */
export function getFullscreenElement(): Element | null {
  const d = document;
  return d.fullscreenElement || 
         (d as any).msFullscreenElement || 
         (d as any).mozFullScreenElement || 
         (d as any).webkitFullscreenElement || 
         null;
}

/**
 * Exits fullscreen mode
 */
export function exitFullscreen(): Promise<void> {
  const d = document;
  const exitFn = d.exitFullscreen || 
                 (d as any).msExitFullscreen || 
                 (d as any).mozCancelFullScreen || 
                 (d as any).webkitExitFullscreen;
  
  return exitFn.call(d);
}

/**
 * Detects if browser is Gecko-based (Firefox)
 */
export function isGecko(): Bit {
  const w = window;

  return boolToBit(
    countTruthy([
      'buildID' in navigator,
      'MozAppearance' in (document.documentElement?.style ?? {}),
      'onmozfullscreenchange' in w,
      'mozInnerScreenX' in w,
      'CSSMozDocumentRule' in w,
      'CanvasCaptureMediaStream' in w,
    ]) >= 4
  );
}

/**
 * Checks whether the device runs on Android without using user-agent
 */
export function isAndroid(): Bit {
  try {
    const n = navigator;
    const w = window;
    const result = /android/i.test(n.userAgent) || 'ontouchstart' in w;
    return boolToBit(result);
  } catch (error) {
    return 0;
  }
}

/**
 * Detects if the device is mobile
 */
export function isMobile(): Bit {
  try {
    const ua = navigator.userAgent.toLowerCase();
    return boolToBit(ua.includes("mobi") || ua.includes("android"));
  } catch {
    return 0;
  }
}

/**
 * Detects if browser is desktop WebKit (not mobile WebKit)
 */
export function isDesktopWebKit(): Bit {
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

/**
 * Detects if device is iPad
 */
export function isIPad(): Bit {
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