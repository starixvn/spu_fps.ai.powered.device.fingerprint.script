import type { ScreenInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectScreen(): ScreenInfo {
  try {
    if (typeof screen !== 'undefined') {
      const width = screen.width;
      const height = screen.height;

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

