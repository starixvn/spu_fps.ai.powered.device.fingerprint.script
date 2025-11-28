import type { PlatformInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectPlatform(): PlatformInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.platform) {
      return navigator.platform;
    }
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

