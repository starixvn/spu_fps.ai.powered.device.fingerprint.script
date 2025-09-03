import type { LanguagesInfo } from "../../types";

export function collectLanguages(): LanguagesInfo {
  try {
    const languages = getLanguages();

    return {
      languages:
        Array.isArray(languages) && languages.length > 0 ? languages : [""],
    };
  } catch (error) {
    console.warn("collectLanguages error:", error);
    return { languages: [""] };
  }
}

function getLanguages(): string[] {
  try {
    let langs: string[] = [];

    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      langs = navigator.languages
        .filter(
          (lang): lang is string =>
            typeof lang === "string" && lang.trim().length > 0
        )
        .map((lang) => lang.trim());
    }

    if (
      langs.length === 0 &&
      typeof navigator.language === "string" &&
      navigator.language.trim()
    ) {
      langs = [navigator.language.trim()];
    }

    if (langs.length === 0) langs = [""];

    return langs;
  } catch {
    return [""];
  }
}
