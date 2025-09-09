/**
 * Counts truthy values in an array
 */
export function countTruthy(values: unknown[]): number {
  return values.filter(Boolean).length;
}

/**
 * Detects if browser is based on Chromium without using user-agent
 */
export function isChromium(): boolean {
  const w = window;
  const n = navigator;

  return (
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
export function isChromium86OrNewer(): boolean {
  const w = window;

  return (
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
export function isWebKit(): boolean {
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
    
    return result;
  } catch (error) {
    return false;
  }
}

/**
 * Detects if browser is Safari WebKit (not other WebKit browsers like Chrome)
 */
export function isSafariWebKit(): boolean {
  try {
    const w = window;
    const n = navigator;
    const ua = n.userAgent;

    // Early returns for non-Safari browsers
    if ('chrome' in w) return false;
    if (ua.includes('Chrome')) return false;
    if (ua.includes('Chromium')) return false;
    if (ua.includes('Edge')) return false;

    // Must be WebKit and have Safari indicators
    return (
      isWebKit() &&
      countTruthy([
        'safari' in w,
        ua.includes('Safari'),
        ua.includes('Version/'), // Safari has Version/ in UA
        n.vendor.includes('Apple'),
        !ua.includes('Chrome'),
      ]) >= 4
    );
  } catch {
    return false;
  }
}

/**
 * Detects if WebKit version is 616 or newer (Safari 17+)
 * Based on WebKit version detection from user agent
 */
export function isWebKit616OrNewer(): boolean {
  try {
    const userAgent = navigator.userAgent;
    
    // Look for WebKit version in user agent
    const webkitMatch = userAgent.match(/WebKit\/(\d+)/);
    
    if (!webkitMatch) return false;
    
    const webkitVersion = parseInt(webkitMatch[1], 10);
    
    // WebKit 616+ corresponds to Safari 17+
    return webkitVersion >= 616;
  } catch {
    return false;
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
export function isGecko(): boolean {
  const w = window;

  return (
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
export function isAndroid(): boolean {
  try {
    const n = navigator;
    const w = window;
    const result = /android/i.test(n.userAgent) || 'ontouchstart' in w;
    return result;
  } catch (error) {
    return false;
  }
}
