import type { WebdriverInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectWebdriver(): WebdriverInfo {
  try {
    if (typeof navigator === 'undefined') {
      return ScoringConstants.UNDEFINED;
    }

    const webdriver = (navigator as any).webdriver ?? (navigator as any).webDriver;
    
    if (typeof webdriver === 'boolean') {
      return webdriver ? 1 : 0;
    }
    
    if (webdriver === undefined) {
      return 0;
    }
    
    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}

