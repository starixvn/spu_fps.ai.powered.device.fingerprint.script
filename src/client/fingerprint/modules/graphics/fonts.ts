import type { FontsInfo } from "../../types";
import { withNaturalFonts } from "../../utils/dom";
import { FingerprintSpecialValue } from "../../utils/consts";

const testString = "mmMwWLliI0O&1";
const textSize = "48px";
const baseFonts = ["monospace", "sans-serif", "serif"] as const;

const fontsToTest = [
  // Android-specific font from "Roboto" family
  "sans-serif-thin",
  // Specialized and less common fonts for better fingerprinting
  "ARNO PRO", "Agency FB", "Arabic Typesetting", "Arial Unicode MS",
  "AvantGarde Bk BT", "BankGothic Md BT", "Batang", "Bitstream Vera Sans Mono",
  "Calibri", "Century", "Century Gothic", "Clarendon", "EUROSTILE",
  "Franklin Gothic", "Futura Bk BT", "Futura Md BT", "GOTHAM", "Gill Sans",
  "HELV", "Haettenschweiler", "Helvetica Neue", "Humanst521 BT",
  "Leelawadee", "Letter Gothic", "Levenim MT", "Lucida Bright", "Lucida Sans",
  "Menlo", "MS Mincho", "MS Outlook", "MS Reference Specialty", "MS UI Gothic", "MT Extra",
  "MYRIAD PRO", "Marlett", "Meiryo UI", "Microsoft Uighur", "Minion Pro",
  "Monotype Corsiva", "PMingLiU", "Pristina", "SCRIPTINA", "Segoe UI Light",
  "Serifa", "SimHei", "Small Fonts", "Staccato222 BT", "TRAJAN PRO",
  "Ubuntu", "Univers CE 55 Medium", "Vrinda", "ZWAdobeF"
] as const;

export async function collectFonts(): Promise<FontsInfo | FingerprintSpecialValue> {
  return await getFontsInfo();
}

function getFontsInfo(): Promise<FontsInfo | FingerprintSpecialValue> {
  return withNaturalFonts(async (document, holder) => {
      holder.style.fontSize = textSize;

      // div to load spans for the default fonts and the fonts to detect
      const spansContainer = document.createElement('div');
      spansContainer.style.setProperty('visibility', 'hidden', 'important');

      const defaultWidth: Partial<Record<string, number>> = {};
      const defaultHeight: Partial<Record<string, number>> = {};

      // creates a span where the fonts will be loaded
      const createSpan = (fontFamily: string) => {
        const span = document.createElement('span');
        const { style } = span;
        style.position = 'absolute';
        style.top = '0';
        style.left = '0';
        style.fontFamily = fontFamily;
        span.textContent = testString;
        spansContainer.appendChild(span);
        return span;
      };

      // load the font to detect and a base font for fallback
      const createSpanWithFonts = (fontToDetect: string, baseFont: string) => {
        return createSpan(`'${fontToDetect}',${baseFont}`);
      };

      // creates spans for the base fonts
      const initializeBaseFontsSpans = () => {
        return baseFonts.map(createSpan);
      };

      // creates spans for the fonts to detect
      const initializeFontsSpans = () => {
        const spans: Record<string, HTMLSpanElement[]> = {};

        for (const font of fontsToTest) {
          spans[font] = baseFonts.map((baseFont) => createSpanWithFonts(font, baseFont));
        }

        return spans;
      };

      const isFontAvailable = (fontSpans: HTMLElement[]) => {
        return baseFonts.some(
          (baseFont, baseFontIndex) =>
            fontSpans[baseFontIndex].offsetWidth !== defaultWidth[baseFont] ||
            fontSpans[baseFontIndex].offsetHeight !== defaultHeight[baseFont],
        );
      };

      const baseFontsSpans = initializeBaseFontsSpans();
      const fontsSpans = initializeFontsSpans();

      // add all the spans to the DOM
      holder.appendChild(spansContainer);

      // get the default width for the three base fonts
      for (let index = 0; index < baseFonts.length; index++) {
        defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth; // width for the default font
        defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight; // height for the default font
      }

      // check available fonts
      const availableFonts = fontsToTest.filter((font) => isFontAvailable(fontsSpans[font]));
      
      return availableFonts as FontsInfo;
      
  }).catch(() => {
    return FingerprintSpecialValue.ERROR;
  });
}
