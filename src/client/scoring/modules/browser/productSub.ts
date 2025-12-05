import type { ProductSubInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectProductSub(): ProductSubInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.productSub) {
      return navigator.productSub;
    }
    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}

