import { 
  isSafariWebKit, 
  isWebKit, 
  isWebKit616OrNewer,
  isSamsungInternetV17OrNewer,
  isBrave
} from '../../utils/browser';
import { FingerprintSpecialValue } from '../../utils/consts';
import { replaceNaN, toInt } from '../../utils/data';
import type { ScreenResolutionInfo } from '../../types';

// Screen size thresholds
const SCREEN_SIZE_THRESHOLDS = {
  MIN_VALID_WIDTH: 320,
  MIN_VALID_HEIGHT: 240,
  MAX_VALID_WIDTH: 7680,   // 8K width
  MAX_VALID_HEIGHT: 4320,  // 8K height
  MOBILE_MAX_SCREEN: 1024,
  MOBILE_MAX_VIEWPORT: 768,
} as const;

// Device detection thresholds
const DEVICE_DETECTION = {
  MIN_HIGH_DPR: 2,
  MIN_MOBILE_INDICATORS: 3,
  MAX_ASPECT_RATIO: 3.0,
} as const;

// Known suspicious/spoofed resolutions
const SUSPICIOUS_RESOLUTIONS = {
  MOBILE: [
    [320, 240] as [number, number],  // Too small for mobile
    [480, 320] as [number, number],  // Too small for mobile
  ],
  DESKTOP: [
    [640, 480] as [number, number],  // VGA - too old
    [800, 600] as [number, number],  // SVGA - too old
    [320, 240] as [number, number],  // QVGA - too small
  ],
} as const;

// Default values
const DEFAULT_VALUES = {
  INITIAL_SIZE: 0,
  DEFAULT_DPR: 1,
} as const;

export function collectScreenResolution(): ScreenResolutionInfo {
  return getScreenResolution();
}

function getScreenResolution(): ScreenResolutionInfo {
  try {
    const antiFingerprintingResolution = getScreenResolutionAntiFp();
    if (antiFingerprintingResolution !== null) return antiFingerprintingResolution;

    // Get raw resolution and validate
    const resolution = getRawScreenResolution();
    if (!Array.isArray(resolution)) return resolution;
    
    // Check for anti-fingerprinting spoofing
    const suspiciousResolution = handleSuspiciousResolution(resolution);
    if (suspiciousResolution !== null) return suspiciousResolution;

    return resolution;
  } catch (error) {
    return FingerprintSpecialValue.ERROR;
  }
}

function getScreenResolutionAntiFp(): ScreenResolutionInfo | null {
  // Safari 17+ has enhanced anti-fingerprinting for canvas
  if (isWebKit() && isWebKit616OrNewer() && isSafariWebKit()) {
    return FingerprintSpecialValue.UNDEFINED;
  }

  // Samsung Internet Smart Anti-Tracking (v17+)
  if (isSamsungInternetV17OrNewer()) {
    return FingerprintSpecialValue.ANTI_FINGERPRINTED;
  }

  if (isBrave()) {
    return FingerprintSpecialValue.ANTI_FINGERPRINTED;
  }

  return null;
}

function handleSuspiciousResolution(resolution: [number, number]): ScreenResolutionInfo | null {
  if (isSuspiciousResolution(resolution)) {
    return FingerprintSpecialValue.ANTI_FINGERPRINTED;
  }
  return null;
}

export function getRawScreenResolution(): ScreenResolutionInfo {
  const s = screen;
  const parseDimension = (value: unknown) => replaceNaN(toInt(value), FingerprintSpecialValue.UNDEFINED);
  const width = parseDimension(s.width);
  const height = parseDimension(s.height);
  
  const normalizedResolution: ScreenResolutionInfo = 
    typeof width === 'number' && typeof height === 'number'
      ? [Math.max(width, height), Math.min(width, height)]
      : [width, height];
  
  return normalizedResolution;
}

// Combined mobile detection approach - reliable and hard to spoof
function isLikelyMobile(): boolean {
  // Multiple detection methods for reliability
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > DEFAULT_VALUES.INITIAL_SIZE;
  const screenSize = Math.min(screen.width, screen.height);
  const viewportSize = Math.min(
    Math.max(document.documentElement.clientWidth || DEFAULT_VALUES.INITIAL_SIZE, window.innerWidth || DEFAULT_VALUES.INITIAL_SIZE),
    Math.max(document.documentElement.clientHeight || DEFAULT_VALUES.INITIAL_SIZE, window.innerHeight || DEFAULT_VALUES.INITIAL_SIZE)
  );
  const hasHover = window.matchMedia('(hover: hover)').matches;
  const dpr = window.devicePixelRatio || DEFAULT_VALUES.DEFAULT_DPR;
  
  // Mobile indicators
  const indicators = [
    touchSupport,                                        // Touch support
    screenSize < SCREEN_SIZE_THRESHOLDS.MOBILE_MAX_SCREEN,     // Small screen
    viewportSize < SCREEN_SIZE_THRESHOLDS.MOBILE_MAX_VIEWPORT, // Small viewport
    !hasHover,                                          // No hover capability
    dpr >= DEVICE_DETECTION.MIN_HIGH_DPR                // High pixel density
  ];
  
  // Count positive indicators
  const positiveIndicators = indicators.filter(Boolean).length;
  
  // Mobile if minimum indicators threshold met
  return positiveIndicators >= DEVICE_DETECTION.MIN_MOBILE_INDICATORS;
}

// Detect suspicious screen resolutions that might be spoofed
function isSuspiciousResolution(resolution: [number, number]): boolean {
  const [width, height] = resolution;
  
  if (typeof width !== 'number' || typeof height !== 'number') return false;
  
  const isMobile = isLikelyMobile();
  
  // Very conservative suspicious resolutions - only flag obvious spoofs
  const suspiciousResolutions = isMobile 
    ? SUSPICIOUS_RESOLUTIONS.MOBILE 
    : SUSPICIOUS_RESOLUTIONS.DESKTOP;
  
  // Check if resolution matches obvious spoofed values
  const isCommonSpoofed = suspiciousResolutions.some(([w, h]) => 
    width === w && height === h
  );
  
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  
  // Very conservative pattern detection - only flag extreme cases
  const isSuspiciousPattern = 
    (width < SCREEN_SIZE_THRESHOLDS.MIN_VALID_WIDTH || height < SCREEN_SIZE_THRESHOLDS.MIN_VALID_HEIGHT) ||  // Too small for any device
    (width > SCREEN_SIZE_THRESHOLDS.MAX_VALID_WIDTH || height > SCREEN_SIZE_THRESHOLDS.MAX_VALID_HEIGHT) || // Too large (8K+)
    (aspectRatio > DEVICE_DETECTION.MAX_ASPECT_RATIO); // Extreme aspect ratios (e.g., 3:1 or more extreme)
  
  return isCommonSpoofed || isSuspiciousPattern;
}