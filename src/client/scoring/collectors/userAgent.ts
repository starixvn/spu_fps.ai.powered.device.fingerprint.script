import type { UserAgentInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectUserAgent(): UserAgentInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

