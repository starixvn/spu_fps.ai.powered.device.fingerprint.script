import type { ScreenInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

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
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

