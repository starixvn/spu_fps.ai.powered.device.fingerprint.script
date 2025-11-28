import type { DevicePixelRatioInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectDevicePixelRatio(): DevicePixelRatioInfo {
  try {
    if (typeof window !== 'undefined') {
      const dpr = window.devicePixelRatio ?? (window as any).webkitDevicePixelRatio;

      if (typeof dpr === 'number' && !isNaN(dpr) && isFinite(dpr)) {
        return dpr;
      }
    }
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

