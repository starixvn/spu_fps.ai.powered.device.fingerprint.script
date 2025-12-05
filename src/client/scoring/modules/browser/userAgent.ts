import type { UserAgentInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectUserAgent(): UserAgentInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}

