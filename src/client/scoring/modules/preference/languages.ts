import type { LanguagesInfo } from '../../types';
import { ScoringConstants } from '../../config';

export function collectLanguages(): LanguagesInfo {
  try {
    if (typeof navigator === 'undefined') {
      return ScoringConstants.UNDEFINED;
    }

    const languages = navigator.languages || 
                      (navigator.language ? [navigator.language] : null) ||
                      ((navigator as any).userLanguage ? [(navigator as any).userLanguage] : null) ||
                      [];

    if (Array.isArray(languages) && languages.length > 0) {
      return languages.length;
    }

    return ScoringConstants.UNDEFINED;
  } catch {
    return ScoringConstants.ERROR;
  }
}

