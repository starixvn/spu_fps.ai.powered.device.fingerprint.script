import type { FontsInfo, FontMetrics, FontDetectionResult } from "../../types";

export async function collectFonts(): Promise<FontsInfo> {
  try {
    return getFontsInfo();
  } catch {
    return {
      availableFonts: [],
      fontList: [],
      fontMetrics: {},
      fontDetection: { detectedFonts: [], fallbackFonts: [], systemFonts: [] },
    };
  }
}

function getFontsInfo(): FontsInfo {
  const fontsToTest = [
    "Arial",
    "Calibri",
    "Cambria",
    "Consolas",
    "Courier New",
    "Georgia",
    "Helvetica",
    "Times New Roman",
    "Trebuchet MS",
    "Verdana",
    "Roboto",
    "Noto Sans",
    "Segoe UI",
    "SF Pro",
    "Ubuntu",
  ];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const availableFonts: string[] = [];
  const fontMetrics: Record<string, FontMetrics> = {};

  if (!ctx) throw new Error("Canvas not supported");

  for (const font of fontsToTest) {
    ctx.font = `16px "${font}"`;

    const text = "Fingerprint Font Test";
    const m = ctx.measureText(text);

    if (m.width > 0) {
      availableFonts.push(font);

      fontMetrics[font] = {
        width: m.width,
        ascent: m.actualBoundingBoxAscent ?? 0,
        descent: m.actualBoundingBoxDescent ?? 0,
        baseline: m.actualBoundingBoxAscent ?? 0,
        height:
          (m.actualBoundingBoxAscent ?? 0) + (m.actualBoundingBoxDescent ?? 0),
      };
    }
  }

  return {
    availableFonts,
    fontList: availableFonts,
    fontMetrics,
    fontDetection: detectFontsUsingCSS(),
  };
}

function detectFontsUsingCSS(): FontDetectionResult {
  const systemStacks = [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "Noto Sans",
    "Liberation Sans",
  ];

  const el = document.createElement("span");
  const systemFonts: string[] = [];

  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.fontSize = "16px";
  el.textContent = "FontTest";

  document.body.appendChild(el);

  for (const font of systemStacks) {
    el.style.fontFamily = font;

    const computed = window.getComputedStyle(el).fontFamily;

    if (computed && !["serif", "sans-serif", "monospace"].includes(computed)) {
      systemFonts.push(font);
    }
  }

  document.body.removeChild(el);

  return { detectedFonts: [], fallbackFonts: [], systemFonts };
}
