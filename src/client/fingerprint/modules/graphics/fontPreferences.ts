import type { FontPreferencesInfo } from "../../types";

export function collectFontPreferences(): FontPreferencesInfo {
  try {
    return getFontPreferenceMetrics();
  } catch {
    return {
      default: 0,
      apple: 0,
      serif: 0,
      sans: 0,
      mono: 0,
      min: 0,
      system: 0,
    };
  }
}

function getFontPreferenceMetrics(): FontPreferencesInfo {
  const fonts = {
    default: "sans-serif",
    apple: "-apple-system",
    serif: "serif",
    sans: "sans-serif",
    mono: "monospace",
    min: "cursive",
    system: "system-ui",
  };

  const testString = "mmMwWLliI0fiflO&1";
  const testElement = document.createElement("span");

  testElement.style.position = "absolute";
  testElement.style.left = "-9999px";
  testElement.style.fontSize = "128px";
  testElement.style.whiteSpace = "nowrap";
  testElement.textContent = testString;

  document.body.appendChild(testElement);

  const results = {
    default: 0,
    apple: 0,
    serif: 0,
    sans: 0,
    mono: 0,
    min: 0,
    system: 0,
  };

  for (const key in fonts) {
    testElement.style.fontFamily = fonts[key as keyof typeof fonts];

    results[key as keyof typeof results] =
      testElement.getBoundingClientRect().width;
  }

  document.body.removeChild(testElement);

  return results;
}
