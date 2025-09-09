import type { FontPreferencesInfo } from "../../types";
import { withNaturalFonts } from "../../utils/dom";

const defaultText = "mmMwWLliI0fiflO&1";

const presets: Record<keyof FontPreferencesInfo, [Partial<CSSStyleDeclaration>?, string?]> = {
  default: [],
  apple: [{ font: "-apple-system-body" }],
  serif: [{ fontFamily: "serif" }],
  sans: [{ fontFamily: "sans-serif" }],
  mono: [{ fontFamily: "monospace" }],
  min: [{ fontSize: "1px" }],
  system: [{ fontFamily: "system-ui" }],
};

export async function collectFontPreferences(): Promise<FontPreferencesInfo> {
  try {
    return await withNaturalFonts((doc, container) => {
      const elements: Record<string, HTMLElement> = {};
      const results: FontPreferencesInfo = {
        default: 0,
        apple: 0,
        serif: 0,
        sans: 0,
        mono: 0,
        min: 0,
        system: 0,
      };

      for (const key of Object.keys(presets) as (keyof FontPreferencesInfo)[]) {
        const [style = {}, text = defaultText] = presets[key];
        const el = doc.createElement("span");

        el.textContent = text;
        el.style.whiteSpace = "nowrap";

        for (const [name, value] of Object.entries(style)) {
          if (value !== undefined) {
            (el.style as any)[name] = value;
          }
        }

        elements[key] = el;
        container.appendChild(doc.createElement("br"));
        container.appendChild(el);
      }

      for (const key of Object.keys(elements) as (keyof FontPreferencesInfo)[]) {
        results[key] = elements[key].getBoundingClientRect().width;
      }

      return results;
    });
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

