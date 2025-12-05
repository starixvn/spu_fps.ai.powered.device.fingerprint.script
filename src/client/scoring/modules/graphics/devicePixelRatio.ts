import type { DevicePixelRatioInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectDevicePixelRatio(): DevicePixelRatioInfo {
  try {
    if (typeof window !== 'undefined') {
      const dpr = window.devicePixelRatio ?? (window as any).webkitDevicePixelRatio;

      if (typeof dpr === 'number' && !isNaN(dpr) && isFinite(dpr)) {
        return dpr;
      }
    }
    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}
