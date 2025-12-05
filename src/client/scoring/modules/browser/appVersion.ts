import type { AppVersionInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectAppVersion(): AppVersionInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.appVersion) {
      return navigator.appVersion;
    }
    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}

