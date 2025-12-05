import type { PlatformInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectPlatform(): PlatformInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.platform) {
      return navigator.platform;
    }
    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}

