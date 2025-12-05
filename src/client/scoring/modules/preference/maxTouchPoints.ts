import type { MaxTouchPointsInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectMaxTouchPoints(): MaxTouchPointsInfo {
  try {
    if (typeof navigator !== 'undefined') {
      const maxTouchPoints = navigator.maxTouchPoints;

      if (typeof maxTouchPoints === 'number' && !isNaN(maxTouchPoints) && isFinite(maxTouchPoints)) {
        return maxTouchPoints;
      }
    }
    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}

