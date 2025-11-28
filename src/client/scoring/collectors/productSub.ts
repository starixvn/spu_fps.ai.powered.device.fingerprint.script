import type { ProductSubInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectProductSub(): ProductSubInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.productSub) {
      return navigator.productSub;
    }
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

