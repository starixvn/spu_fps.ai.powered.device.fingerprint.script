import type { TouchPointsInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectTouchPoints(): TouchPointsInfo {
  try {
    if (typeof navigator !== 'undefined') {
      const maxTouchPoints = navigator.maxTouchPoints;

      if (typeof maxTouchPoints === 'number' && !isNaN(maxTouchPoints) && isFinite(maxTouchPoints)) {
        return maxTouchPoints;
      }
    }
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

