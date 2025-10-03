import { MurmurHash128 } from "../../utils/hash";
import type { CanvasInfo } from "../../types";
import type { Bit } from '../../types';
import { FingerprintSpecialValue } from "../../utils/consts";
import { isWebKit, isWebKit616OrNewer, isSafariWebKit, isSafari17OrNewer } from "../../utils/browser";

const CANVAS_CACHE_KEY = "canvasCache";
const CANVAS_SNAPSHOTS = 5;

type CanvasProtectionResult = {
  isProtected: boolean;
  isStrong: boolean; // baseline mismatch 
};

function doesBrowserPerformAntifingerprinting(): boolean {
  // Safari 17+ has enhanced anti-fingerprinting for canvas
  if (isSafari17OrNewer()) return true;
  return false;
}

export async function collectCanvas(): Promise<CanvasInfo> {
  try {
    let cachedValue: string | null = null;
    try {
      const rawCache = localStorage.getItem(CANVAS_CACHE_KEY);

      if (rawCache && rawCache.length > 0) {
        cachedValue = rawCache;
      }
    } catch (e) {
    }

    // Detect canvas protection
    const canvasProtection = await detectCanvasProtection();
    
    // Handle canvas protection detection
    if (canvasProtection.isStrong || canvasProtection.isProtected) {
      return [FingerprintSpecialValue.ANTI_FINGERPRINTED, 1];
    }

    const snapshotPromises = Array.from({ length: CANVAS_SNAPSHOTS }, () => getCanvasFeatures());
    const samples = (await Promise.all(snapshotPromises)).filter(Boolean) as any[];

    if (samples.length === 0) {
      return [FingerprintSpecialValue.TIMEOUT, 0];
    }

    const stableFeatures = computeFeatureMedian(samples);
    const value = MurmurHash128.hash128(JSON.stringify(stableFeatures));
     
    if (cachedValue && cachedValue === value) {
      return [cachedValue, 0];
    }

    try {
      localStorage.setItem(CANVAS_CACHE_KEY, value);
    } catch (e) {
    }

    return [value, 0];
  } catch (error) {
    return [FingerprintSpecialValue.ERROR, 0];
  }
}

async function detectCanvasProtection(): Promise<CanvasProtectionResult> {
  try {
    // Check for Safari 17 anti-fingerprinting first
    if (doesBrowserPerformAntifingerprinting()) {
      return { isProtected: true, isStrong: true };
    }

    const testCanvas = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 50;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      
      // Draw simple test pattern
      ctx.textBaseline = "top";
      ctx.font = "14px Arial, sans-serif";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Canvas Test 🎨", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Canvas Test 🎨", 4, 17);
      
      return canvas.toDataURL();
    };

    // Test current session consistency  
    const dataUrl1 = testCanvas();
    const dataUrl2 = testCanvas();
    
    if (!dataUrl1 || !dataUrl2) {
      return { isProtected: true, isStrong: false }; 
    }

    // Test in-session randomization 
    const isConsistent = dataUrl1 === dataUrl2;
    if (!isConsistent) {
      return { isProtected: true, isStrong: false }; 
    }

    // Compare with previous sessions 
    const CANVAS_BASELINE_KEY = "canvasBaseline";
    let storedBaseline: string | null = null;
    
    try {
      storedBaseline = localStorage.getItem(CANVAS_BASELINE_KEY);
    } catch (e) {
      return { isProtected: true, isStrong: false };
    }

    if (storedBaseline) {
      const baselineMatches = dataUrl1 === storedBaseline;
      if (!baselineMatches) {
        // Baseline mismatch is a strong indicator of Canvas Blocker extension
        return { isProtected: true, isStrong: true };
      }
    } else {
      try {
        localStorage.setItem(CANVAS_BASELINE_KEY, dataUrl1);
      } catch (e) {
        return { isProtected: true, isStrong: false };
      }
    }

    // Check for suspicious canvas API modifications
    const isToDataURLFunction = typeof HTMLCanvasElement.prototype.toDataURL === 'function';
    if (!isToDataURLFunction) {
      return { isProtected: true, isStrong: false };
    }

    // Check for extension-specific markers
    const extensionDetected = detectCanvasBlockerExtension();
    if (extensionDetected === 1) {
      return { isProtected: true, isStrong: false };
    }

    return { isProtected: false, isStrong: false }; 
  } catch (error) {
    return { isProtected: true, isStrong: false }; 
  }
}

function detectCanvasBlockerExtension(): Bit {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return 0;
    }
    
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL.toString();
    const isLongString = originalToDataURL.length > 100;

    if (isLongString) {
      return 1; 
    }

    // Check for CanvasBlocker specific properties
    const cbNameInCanvas = 'cbName' in canvas;
    const cbInjectInCanvas = 'cbInject' in canvas;
    const canvasBlockerNameInWindow = 'canvasBlockerName' in window;
    const canvasBlockerInWindow = 'canvasBlocker' in window;
    
    if (cbNameInCanvas || cbInjectInCanvas || canvasBlockerNameInWindow || canvasBlockerInWindow) {
      return 1;
    }

    return 0;
  } catch (error) {
    return 1; 
  }
}

async function getCanvasFeatures(): Promise<Record<string, any> | null> {
  try {
    const canvas = document.createElement("canvas");
    
    canvas.width = 400;
    canvas.height = 100;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    drawComplexCanvas(ctx, "Canvas Test", canvas.width, canvas.height);

    const features: Record<string, any> = {
      font: ctx.font,
      shadowBlur: ctx.shadowBlur,
      shadowColor: ctx.shadowColor,
      globalCompositeOperation: ctx.globalCompositeOperation,
      fillStyle: ctx.fillStyle?.toString() || "gradient", 
      width: canvas.width,
      height: canvas.height,
      pixelSample: Array.from(ctx.getImageData(0, 0, 10, 10).data),
    };

    // WebGL features
    try {
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      
      if (gl) {
        features.webglVersion = gl.getParameter(gl.VERSION);
        features.webglVendor = gl.getParameter(gl.VENDOR);
        features.webglRenderer = gl.getParameter(gl.RENDERER);
        features.webglShadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        const extensions = gl.getSupportedExtensions();
        features.webglExtensions = extensions ? extensions.sort().join(",") : "";

        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info") as any;
        if (debugInfo) {
          try {
            features.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            features.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          } catch {
            features.unmaskedVendor = "blocked";
            features.unmaskedRenderer = "blocked";
          }
        }
      } else {
        features.webglVersion = "webgl-unavailable";
      }
    } catch {
      features.webglVersion = "webgl-error";
    }

    return features;
   } catch (error) {
     return null;
   }
}

function computeFeatureMedian(samples: any[]): any {
  const validSamples = samples.filter((s): s is Record<string, any> => s && typeof s === 'object');
  if (validSamples.length === 0) return {};

  if (validSamples.length === 1) return validSamples[0];

  const median: Record<string, any> = {};
  const keys = Object.keys(validSamples[0]);

  for (const key of keys) {
    const vals = validSamples.map(s => JSON.stringify(s[key]));
    const counts = new Map<string, number>();

    vals.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));

    let maxCount = 0;
    let mostCommon = vals[0];

    counts.forEach((c, v) => { 
      if(c > maxCount){
        maxCount=c;mostCommon=v;
      } 
    });

    median[key] = JSON.parse(mostCommon);
  }

  return median;
}

// Draw canvas
function drawComplexCanvas(ctx: CanvasRenderingContext2D, text: string, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  ctx.font = "20px Arial";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgb(255,0,255)";
  ctx.fillText(text, 10, height / 2);

  ctx.fillStyle = "rgba(0,100,255,0.7)";
  ctx.fillRect(50, 10, 120, 60);

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgb(255,255,0)";
  ctx.beginPath();
  ctx.arc(200, height / 2, 30, 0, Math.PI * 2);
  ctx.fill();

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(255,0,0,0.3)");
  gradient.addColorStop(1, "rgba(0,0,255,0.3)");
  ctx.fillStyle = gradient;

  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillRect(0, 0, width, height);
}
