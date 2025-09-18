import type { LanguagesInfo } from "../../types";
import { isChromium, isChromium86OrNewer } from "../../utils/browser";

export function collectLanguages(): LanguagesInfo {
  const languages = getLanguages();

  return {
    languages: languages.length > 0 ? languages : [[""]],
  };
}

function getLanguages(): string[][] {
  try {
    const n = navigator as any;
    const result: string[][] = [];

    // Get primary language 
    const language = n.language || n.userLanguage || n.browserLanguage || n.systemLanguage;

    if (language !== undefined) {
      result.push([language]);
    }

    if (Array.isArray(n.languages)) {
      // Chromium 86+: `navigator.languages` is always a single value in Incognito → ignore it.
      if (!(isChromium() && isChromium86OrNewer())) {
        const validLanguages = n.languages.filter(
          (lang: any): lang is string =>
            typeof lang === "string" && lang.trim().length > 0
        );

        if (validLanguages.length > 0) {
          result.push(validLanguages);
        }
      }
    } else if (typeof n.languages === 'string') {
      const languages = n.languages as string;
      
      if (languages) {
        result.push(languages.split(',').map((lang: string) => lang.trim()).filter((lang: string) => lang.length > 0));
      }
    }

    return result;
  } catch {
    return [[""]];
  }
}
