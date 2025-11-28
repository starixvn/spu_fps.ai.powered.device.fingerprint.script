import type { AppVersionInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectAppVersion(): AppVersionInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.appVersion) {
      return navigator.appVersion;
    }
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

