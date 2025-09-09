/**
 * Counts truthy values in an array
 */
function countTruthy(values: unknown[]): number {
  return values.filter(Boolean).length;
}

/**
 * Detects if browser is WebKit-based
 */
export function isWebKit(): boolean {
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
