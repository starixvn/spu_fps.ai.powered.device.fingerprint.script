import type { PluginsInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectPlugins(): PluginsInfo {
  try {
    if (typeof navigator !== 'undefined' && navigator.plugins) {
      return navigator.plugins.length;
    }
    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

