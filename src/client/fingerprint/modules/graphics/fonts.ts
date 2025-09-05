import type { FontsInfo } from "../../types";

const testString = 'mmMwWLliI0O&1';
const textSize = '48px';
const baseFonts = ['monospace', 'sans-serif', 'serif'] as const;

const fontsToTest = [
  // Android-specific
  'sans-serif-thin',
  // Professional fonts
  'ARNO PRO', 'Agency FB', 'Arabic Typesetting', 'Arial Unicode MS',
  'AvantGarde Bk BT', 'BankGothic Md BT', 'Batang', 'Bitstream Vera Sans Mono',
  // Common system fonts
  'Arial', 'Calibri', 'Cambria', 'Century', 'Century Gothic', 'Clarendon',
  'Consolas', 'Courier New', 'EUROSTILE', 'Franklin Gothic',
  'Futura Bk BT', 'Futura Md BT', 'GOTHAM', 'Georgia', 'Gill Sans',
  'HELV', 'Haettenschweiler', 'Helvetica', 'Helvetica Neue', 'Humanst521 BT',
  // International fonts
  'Leelawadee', 'Letter Gothic', 'Levenim MT', 'Lucida Bright', 'Lucida Sans',
  'MS Mincho', 'MS Outlook', 'MS Reference Specialty', 'MS UI Gothic', 'MT Extra',
  'MYRIAD PRO', 'Marlett', 'Meiryo UI', 'Menlo', 'Microsoft Uighur', 'Minion Pro',
  'Monotype Corsiva', 'Noto Sans', 'PMingLiU', 'Pristina', 'Roboto',
  'SCRIPTINA', 'SF Pro', 'Segoe UI', 'Segoe UI Light', 'Serifa', 'SimHei',
  'Small Fonts', 'Staccato222 BT', 'TRAJAN PRO', 'Times New Roman', 'Trebuchet MS',
  'Ubuntu', 'Univers CE 55 Medium', 'Verdana', 'Vrinda', 'ZWAdobeF'
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

  // Container for all spans (hidden)
  const spansContainer = document.createElement('div');

  spansContainer.style.setProperty('visibility', 'hidden', 'important');
  spansContainer.style.setProperty('position', 'absolute', 'important');
  spansContainer.style.setProperty('top', '0', 'important');
  spansContainer.style.setProperty('left', '0', 'important');

  const defaultWidth: Partial<Record<string, number>> = {};
  const defaultHeight: Partial<Record<string, number>> = {};

  // Create span element for font testing
  const createSpan = (fontFamily: string): HTMLSpanElement => {
    const span = document.createElement('span');
    const { style } = span;
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.fontFamily = fontFamily;
    style.fontSize = textSize;
    span.textContent = testString;
    spansContainer.appendChild(span);
    return span;
  };

  // Create span with font to detect + base font fallback
  const createSpanWithFonts = (fontToDetect: string, baseFont: string): HTMLSpanElement => {
    return createSpan(`'${fontToDetect}', ${baseFont}`);
  };

  try {
    // Create baseline spans for base fonts
    const baseFontsSpans = baseFonts.map(createSpan);
    
    // Create detection spans for each font
    const fontsSpans: Record<string, HTMLSpanElement[]> = {};
    for (const font of fontsToTest) {
      fontsSpans[font] = baseFonts.map((baseFont) => createSpanWithFonts(font, baseFont));
    }

    holder.appendChild(spansContainer);

    // Get baseline measurements  
    for (let index = 0; index < baseFonts.length; index++) {
      defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth;
      defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight;
    }

    // Check font availability using baseline comparison
    const isFontAvailable = (fontSpans: HTMLSpanElement[]): boolean => {
      return baseFonts.some(
        (baseFont, baseFontIndex) =>
          fontSpans[baseFontIndex].offsetWidth !== defaultWidth[baseFont] ||
          fontSpans[baseFontIndex].offsetHeight !== defaultHeight[baseFont]
      );
    };

    const availableFonts = fontsToTest.filter((font) => isFontAvailable(fontsSpans[font]));

    return availableFonts as string[];
  } finally {
    if (spansContainer.parentNode) {
      spansContainer.parentNode.removeChild(spansContainer);
    }
    holder.style.fontSize = originalFontSize;
  }
}