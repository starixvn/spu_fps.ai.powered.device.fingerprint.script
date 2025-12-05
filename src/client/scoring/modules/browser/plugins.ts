import { ScoringConstants } from '../../config';
import type { PluginsInfo } from '../../types';

export function collectPlugins(): PluginsInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.plugins !== null) {
      return 1;
    }
    return 0;
  } catch {
    return ScoringConstants.ERROR;
  }
}

