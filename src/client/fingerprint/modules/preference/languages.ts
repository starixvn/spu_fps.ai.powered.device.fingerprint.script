interface LanguagesResult {
  languages: string[];
}

export function collectLanguages(): LanguagesResult {
  try {
    const languages = getLanguages();
    return { languages };
  } catch (error) {
    return { languages: [""] };
  }
}

function getLanguages(): string[] {
  try {
    if (navigator.languages && navigator.languages.length > 0) {
      return navigator.languages
        .filter((lang): lang is string => Boolean(lang))
        .filter((lang) => lang.trim().length > 0);
    }

    if (navigator.language && navigator.language.trim()) {
      return [navigator.language];
    }

    return [""];
  } catch {
    return [""];
  }
}
