import type { WebdriverInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectWebdriver(): WebdriverInfo {
  try {
    if (typeof navigator !== 'undefined') {
      const webdriver = (navigator as any).webDriver;
      
      if (typeof webdriver === 'boolean') {
        return webdriver;
      }
      
      // Some browsers may return undefined instead of false
      if (webdriver === undefined) {
        return false;
      }
    }
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

