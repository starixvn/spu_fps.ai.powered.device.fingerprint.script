import type { FontPreferencesInfo } from "../../types";

export function collectFontPreferences(): FontPreferencesInfo {
  try {
    return getFontPreferences();
  } catch (error) {
    return getDefaultFontPreferences();
  }
}

function getFontPreferences(): FontPreferencesInfo {
  const testElement = document.createElement("div");

  testElement.style.position = "absolute";
  testElement.style.visibility = "hidden";
  testElement.style.fontSize = "16px";
  testElement.textContent = "FPS Device Fingerprint Test";

  document.body.appendChild(testElement);

  const computedStyle = window.getComputedStyle(testElement);
  const fontFamily = computedStyle.fontFamily || "";
  const fontSize = computedStyle.fontSize || "";
  const fontWeight = computedStyle.fontWeight || "";
  const fontStyle = computedStyle.fontStyle || "";
  const fontVariant = computedStyle.fontVariant || "";
  const lineHeight = computedStyle.lineHeight || "";
  const letterSpacing = computedStyle.letterSpacing || "";
  const textAlign = computedStyle.textAlign || "";
  const textDecoration = computedStyle.textDecoration || "";
  const textTransform = computedStyle.textTransform || "";

  document.body.removeChild(testElement);

  const preferences = testFontPreferences();

  return {
    fontFamily: preferences.fontFamily || fontFamily,
    fontSize: preferences.fontSize || fontSize,
    fontWeight: preferences.fontWeight || fontWeight,
    fontStyle: preferences.fontStyle || fontStyle,
    fontVariant: preferences.fontVariant || fontVariant,
    lineHeight: preferences.lineHeight || lineHeight,
    letterSpacing: preferences.letterSpacing || letterSpacing,
    textAlign: preferences.textAlign || textAlign,
    textDecoration: preferences.textDecoration || textDecoration,
    textTransform: preferences.textTransform || textTransform,
  };
}

function testFontPreferences(): Partial<FontPreferencesInfo> {
  const preferences: Partial<FontPreferencesInfo> = {};
  const testElement = document.createElement("div");

  const computedSize = window.getComputedStyle(testElement).fontSize;
  const computedWeight = window.getComputedStyle(testElement).fontWeight;
  const computedStyle = window.getComputedStyle(testElement).fontStyle;
  const computedAlign = window.getComputedStyle(testElement).textAlign;

  const testSizes = ["12px", "14px", "16px", "18px", "20px"];
  const testWeights = ["normal", "bold", "100", "300", "700"];
  const testStyles = ["normal", "italic", "oblique"];
  const testAligns = ["left", "center", "right", "justify"];

  testElement.style.position = "absolute";
  testElement.style.visibility = "hidden";
  testElement.textContent = "Test";

  document.body.appendChild(testElement);

  for (const size of testSizes) {
    testElement.style.fontSize = size;

    if (computedSize && computedSize !== "16px") {
      preferences.fontSize = computedSize;
      break;
    }
  }

  for (const weight of testWeights) {
    testElement.style.fontWeight = weight;

    if (computedWeight && computedWeight !== "400") {
      preferences.fontWeight = computedWeight;
      break;
    }
  }

  for (const style of testStyles) {
    testElement.style.fontStyle = style;

    if (computedStyle && computedStyle !== "normal") {
      preferences.fontStyle = computedStyle;
      break;
    }
  }

  for (const align of testAligns) {
    testElement.style.textAlign = align;

    if (computedAlign && computedAlign !== "start") {
      preferences.textAlign = computedAlign;
      break;
    }
  }

  document.body.removeChild(testElement);

  return preferences;
}

function getDefaultFontPreferences(): FontPreferencesInfo {
  return {
    fontFamily: "",
    fontSize: "",
    fontWeight: "",
    fontStyle: "",
    fontVariant: "",
    lineHeight: "",
    letterSpacing: "",
    textAlign: "",
    textDecoration: "",
    textTransform: "",
  };
}
