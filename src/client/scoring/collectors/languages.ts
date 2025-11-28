import type { LanguagesInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

export function collectLanguages(): LanguagesInfo {
  try {
    if (typeof navigator === 'undefined') {
      return ScoringSpecialValue.UNDEFINED;
    }

    const languages = navigator.languages || 
                      (navigator.language ? [navigator.language] : null) ||
                      ((navigator as any).userLanguage ? [(navigator as any).userLanguage] : null) ||
                      [];

    if (Array.isArray(languages) && languages.length > 0) {
      return languages.length;
    }

    return ScoringSpecialValue.UNDEFINED;
  } catch {
    return ScoringSpecialValue.ERROR;
  }
}

