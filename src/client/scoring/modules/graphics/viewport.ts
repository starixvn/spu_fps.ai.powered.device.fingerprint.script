import type { ViewportInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectViewport(): ViewportInfo {
  try {
    if (typeof window !== 'undefined') {
      const width = window.outerWidth;
      const height = window.outerHeight;

      if (typeof width === 'number' && typeof height === 'number' && 
          !isNaN(width) && !isNaN(height) && 
          isFinite(width) && isFinite(height)) {
        return [width, height];
      }
    }
    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}

