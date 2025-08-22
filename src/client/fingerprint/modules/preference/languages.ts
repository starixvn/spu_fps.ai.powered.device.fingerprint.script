interface LanguagesResult {
  languages: string[];
}

export function collectLanguages(): LanguagesResult {
  try {
    const languages = getLanguages();
    console.log("Languages fingerprint collected:", { languages });

    return { languages };
  } catch (error) {
    console.error("Error collecting languages:", error);
    return { languages: ["unknown"] };
  }
}

function getLanguages(): string[] {
  try {
    const languages: string[] = [];

    if (navigator.language) {
      languages.push(navigator.language);
    }

    if (navigator.languages && navigator.languages.length > 0) {
      languages.push(...navigator.languages);
    }

    return [...new Set(languages)].filter((lang) => lang && lang.trim() !== "");
  } catch {
    return ["unknown"];
  }
}
