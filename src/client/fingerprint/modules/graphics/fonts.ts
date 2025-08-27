import type { FontsInfo, FontMetrics, FontDetectionResult } from "../../types";

const FONT_SESSION_CACHE_KEY = "__font_fp_session__";
const FONT_LOCAL_CACHE_KEY = "__font_fp_local__";

export async function collectFonts(): Promise<FontsInfo> {
  try {
    return getFontsInfo();
  } catch {
    return {
      availableFonts: [],
      fontList: [],
      fontMetrics: {},
      fontDetection: { detectedFonts: [], fallbackFonts: [], systemFonts: [] },
      noiseType: "blocked",
      entropy: 0,
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

  const fontDetection = detectFontsUsingCSS();

  let noiseType: "ok" | "blocked" | "spoofed" | "randomized" = "ok";

  if (availableFonts.length === 0) {
    noiseType = "blocked";
  } else {
    const raw = JSON.stringify(availableFonts);
    const sessionCache = sessionStorage.getItem(FONT_SESSION_CACHE_KEY);
    const localCache = localStorage.getItem(FONT_LOCAL_CACHE_KEY);

    if (sessionCache && sessionCache !== raw) {
      noiseType = "randomized";
    }

    sessionStorage.setItem(FONT_SESSION_CACHE_KEY, raw);

    if (localCache && localCache !== raw) {
      noiseType = "randomized";
    }

    localStorage.setItem(FONT_LOCAL_CACHE_KEY, raw);

    if (availableFonts.length < 3) {
      noiseType = "spoofed";
    }
  }

  return {
    availableFonts,
    fontList: availableFonts,
    fontMetrics,
    fontDetection,
    noiseType,
    entropy: calcEntropy(availableFonts),
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

function calcEntropy(fonts: string[]): number {
  if (fonts.length === 0) return 0;
  const p = 1 / fonts.length;
  return -fonts.length * p * Math.log2(p); // Shannon entropy
}
