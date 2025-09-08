import type { FontsInfo } from "../../types";

const testString = "mmMwWLliI0O&1";
const textSize = "48px";
const baseFonts = ["monospace", "sans-serif", "serif"] as const;

const fontsToTest = [
  "sans-serif-thin",
  "ARNO PRO", "Agency FB", "Arabic Typesetting", "Arial Unicode MS",
  "AvantGarde Bk BT", "BankGothic Md BT", "Batang", "Bitstream Vera Sans Mono",
  "Arial", "Calibri", "Cambria", "Century", "Century Gothic", "Clarendon",
  "Consolas", "Courier New", "EUROSTILE",
  "Futura Bk BT", "Futura Md BT", "GOTHAM", "Georgia", "Gill Sans",
  "HELV", "Haettenschweiler", "Helvetica", "Helvetica Neue", "Humanst521 BT",
  "Leelawadee", "Letter Gothic", "Levenim MT", "Lucida Bright", "Lucida Sans",
  "MS Mincho", "MS Outlook", "MS Reference Specialty", "MS UI Gothic", "MT Extra",
  "MYRIAD PRO", "Marlett", "Meiryo UI", "Menlo", "Microsoft Uighur", "Minion Pro",
  "Monotype Corsiva", "Noto Sans", "PMingLiU", "Pristina", "Roboto",
  "SCRIPTINA", "SF Pro", "Segoe UI", "Segoe UI Light", "Serifa", "SimHei",
  "Small Fonts", "Staccato222 BT", "TRAJAN PRO", "Times New Roman", "Trebuchet MS",
  "Ubuntu", "Univers CE 55 Medium", "Verdana", "Vrinda", "ZWAdobeF"
] as const;

export async function collectFonts(): Promise<FontsInfo> {
  try {
    return getFontsInfo();
  } catch {
    return [];
  }
}

function getFontsInfo(): FontsInfo {
  const holder = document.body;
  const originalFontSize = holder.style.fontSize;
  holder.style.fontSize = textSize;

  const container = document.createElement("div");
  container.style.visibility = "hidden";
  container.style.position = "absolute";
  container.style.top = "0";
  container.style.left = "0";

  const defaultWidth: Partial<Record<string, number>> = {};
  const defaultHeight: Partial<Record<string, number>> = {};

  const createSpan = (fontFamily: string): HTMLSpanElement => {
    const span = document.createElement("span");
    span.style.position = "absolute";
    span.style.fontFamily = fontFamily;
    span.style.fontSize = textSize;
    span.textContent = testString;
    container.appendChild(span);
    return span;
  };

  const createSpanWithBase = (fontToDetect: string, baseFont: string) => {
    return createSpan(`'${fontToDetect}', ${baseFont}`);
  };

  try {
    const baseSpans = baseFonts.map(createSpan);
    
    const fontSpans: Record<string, HTMLSpanElement[]> = {};
    for (const font of fontsToTest) {
      fontSpans[font] = baseFonts.map((b) => createSpanWithBase(font, b));
    }

    holder.appendChild(container);

    baseFonts.forEach((b, i) => {
      defaultWidth[b] = baseSpans[i].offsetWidth;
      defaultHeight[b] = baseSpans[i].offsetHeight;
    });

    const isFontAvailable = (spans: HTMLSpanElement[]) => {
      return baseFonts.some(
        (b, i) =>
          spans[i].offsetWidth !== defaultWidth[b] ||
          spans[i].offsetHeight !== defaultHeight[b]
      );
    };

    const availableFonts = fontsToTest.filter((font) => {
      try {
        return isFontAvailable(fontSpans[font]);
      } catch {
        return false;
      }
    });

    return availableFonts as string[];
  } finally {
    if (container.parentNode) container.parentNode.removeChild(container);
    holder.style.fontSize = originalFontSize;
  }
}
