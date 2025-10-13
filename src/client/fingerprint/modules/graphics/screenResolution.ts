import { 
  isSafariWebKit, 
  isWebKit, 
  isWebKit616OrNewer,
  isSamsungInternetV17OrNewer
} from '../../utils/browser';
import { FingerprintSpecialValue } from '../../utils/consts';
import { replaceNaN, toInt } from '../../utils/data';

export type ScreenResolutionValue = number | FingerprintSpecialValue
export type ScreenResolution = [ScreenResolutionValue, ScreenResolutionValue]

export function collectScreenResolution(): ScreenResolution {
  return getScreenResolution();
}

function getScreenResolution(): ScreenResolution {
  try {
    const antiFingerprintingResolution = getScreenResolutionAntifingerprinting();
    if (antiFingerprintingResolution) return antiFingerprintingResolution;

    // Get raw resolution and validate
    const resolution = getRawScreenResolution();
    
    // Check for anti-fingerprinting spoofing
    const suspiciousResolution = handleSuspiciousResolution(resolution);
    if (suspiciousResolution) return suspiciousResolution;

    return resolution;
  } catch (error) {
    return [
      FingerprintSpecialValue.ERROR,
      FingerprintSpecialValue.ERROR,
    ];
  }
}

function getScreenResolutionAntifingerprinting(): ScreenResolution | null {
  // Safari WebKit anti-fingerprinting
  if (isWebKit() && isWebKit616OrNewer() && isSafariWebKit()) {
    return [
      FingerprintSpecialValue.UNDEFINED,
      FingerprintSpecialValue.UNDEFINED,
    ];
  }

  // Samsung Internet Smart Anti-Tracking (v17+)
  if (isSamsungInternetV17OrNewer()) {
    return [
      FingerprintSpecialValue.ANTI_FINGERPRINTED,
      FingerprintSpecialValue.ANTI_FINGERPRINTED,
    ];
  }

  return null;
}

function handleSuspiciousResolution(resolution: ScreenResolution): ScreenResolution | null {
  if (isSuspiciousResolution(resolution)) {
    return [
      FingerprintSpecialValue.ANTI_FINGERPRINTED,
      FingerprintSpecialValue.ANTI_FINGERPRINTED,
    ];
  }

  return null;
}

export function getRawScreenResolution(): ScreenResolution {
  const s = screen;
  const parseDimension = (value: unknown) => replaceNaN(toInt(value), FingerprintSpecialValue.UNDEFINED);
  const width = parseDimension(s.width);
  const height = parseDimension(s.height);
  
  const normalizedResolution: ScreenResolution = 
    typeof width === 'number' && typeof height === 'number'
      ? [Math.max(width, height), Math.min(width, height)]
      : [width, height];
  
  return normalizedResolution;
}

// Combined mobile detection approach - reliable and hard to spoof
function isLikelyMobile(): boolean {
  // Multiple detection methods for reliability
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const screenSize = Math.min(screen.width, screen.height);
  const viewportSize = Math.min(
    Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  );
  const hasHover = window.matchMedia('(hover: hover)').matches;
  const dpr = window.devicePixelRatio || 1;
  
  // Mobile indicators
  const indicators = [
    touchSupport,                    // Touch support
    screenSize < 1024,              // Small screen
    viewportSize < 768,             // Small viewport
    !hasHover,                      // No hover capability
    dpr >= 2                        // High pixel density
  ];
  
  // Count positive indicators
  const positiveIndicators = indicators.filter(Boolean).length;
  
  // Mobile if 3+ indicators are positive
  return positiveIndicators >= 3;
}

// Detect suspicious screen resolutions that might be spoofed
function isSuspiciousResolution(resolution: ScreenResolution): boolean {
  const [width, height] = resolution;
  
  if (typeof width !== 'number' || typeof height !== 'number') return false;
  
  // Detect device type using combined approach
  const isMobile = isLikelyMobile();
  
  // Very conservative suspicious resolutions - only flag obvious spoofs
  const suspiciousResolutions = isMobile ? [
    [320, 240],    // Too small for mobile
    [480, 320],    // Too small for mobile
  ] : [
    // Only flag very old/obvious spoofs - removed common resolutions
    [640, 480],    // VGA - too old
    [800, 600],    // SVGA - too old
    [320, 240],    // QVGA - too small
  ];
  
  // Check if resolution matches obvious spoofed values
  const isCommonSpoofed = suspiciousResolutions.some(([w, h]) => 
    width === w && height === h
  );
  
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  
  // Very conservative pattern detection
  const isSuspiciousPattern = 
    // Only flag extreme cases
    (width < 320 || height < 240) ||  // Too small for any device
    (width > 7680 || height > 4320) || // Too large (8K+)
    (aspectRatio > 3.0) || // Extreme aspect ratios (e.g., 3:1 or more extreme)
    // Very strict even numbers check
    (width % 2 === 0 && height % 2 === 0 && width < 800 && height < 600);
  
  return isCommonSpoofed || isSuspiciousPattern;
}