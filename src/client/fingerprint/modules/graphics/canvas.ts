import { MurmurHash128 } from "../../utils/hash";
import type { CanvasInfo } from "../../types";
import type { Bit } from '../../types';
import { FingerprintSpecialValue } from "../../utils/consts";
import { isSafari17OrNewer, isSamsungInternet, isChromium122OrNewer } from "../../utils/browser";

const CANVAS_SNAPSHOTS = 3; 
const CANVAS_FINGERPRINT_TEXT = `Sphinx ${String.fromCharCode(55357, 56848)} quartz ${String.fromCharCode(55357, 56849)} vow ${String.fromCharCode(55357, 56850)}`;

type CanvasProtectionResult = {
  isProtected: boolean;
  isStrong: boolean; // baseline mismatch 
};

function doesBrowserPerformCanvasAntifingerprinting(): boolean {
  // Safari 17+ has enhanced anti-fingerprinting for canvas
  if (isSafari17OrNewer()) return true;
  
  // Samsung Internet 26+ has Smart Anti-Tracking
  //if (isSamsungInternet() && isChromium122OrNewer()) return true;
  
  return false;
}

export async function collectCanvas(): Promise<CanvasInfo> {
  try {
    // Detect canvas protection
    const canvasProtection = await detectCanvasProtection();
    
    // Handle canvas protection detection
    if (canvasProtection.isStrong || canvasProtection.isProtected) {
      return [FingerprintSpecialValue.ANTI_FINGERPRINTED, 1];
    }

    // Enhanced performance with timeout handling
    const snapshotPromises = Array.from({ length: CANVAS_SNAPSHOTS }, () => getCanvasFeaturesWithTimeout());
    const results = await Promise.allSettled(snapshotPromises);
    
    const samples = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value)
      .filter(Boolean);

    if (samples.length === 0) {
      return [FingerprintSpecialValue.TIMEOUT, 0];
    }

    const stableFeatures = computeFeatureMedian(samples);
    const value = MurmurHash128.hash128(JSON.stringify(stableFeatures));
      
    return [value, 0];
  } catch (error) {
    return [FingerprintSpecialValue.ERROR, 0];
  }
}

async function detectCanvasProtection(): Promise<CanvasProtectionResult> {
  try {
    if (doesBrowserPerformCanvasAntifingerprinting()) {
      return { isProtected: true, isStrong: true };
    }

    const testCanvas = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; // Optimized size - balance between detection and performance
      canvas.height = 50;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      
      // Use unified function in test mode
      drawUnifiedCanvas(ctx, canvas.width, canvas.height, true);
      
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

// Enhanced function with timeout
async function getCanvasFeaturesWithTimeout(): Promise<Record<string, any> | null> {
  return Promise.race([
    getCanvasFeatures(),
    new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Canvas timeout')), 2000)
    )
  ]).catch(() => null);
}

async function getCanvasFeatures(): Promise<Record<string, any> | null> {
  try {
    const canvas = document.createElement("canvas");
    
    canvas.width = 400;
    canvas.height = 100;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    // Use new high-entropy text
    drawComplexCanvas(ctx, canvas.width, canvas.height);

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

    // WebGL features with caching
    try {
      const gl = getWebGLContext(canvas);
      
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
    } catch (error) {
      features.webglVersion = "webgl-error";
    }

    return features;
   } catch (error) {
     return null;
   }
}

// WebGL context caching for performance
let webglContextCache: WebGLRenderingContext | null = null;

function getWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  if (webglContextCache) return webglContextCache;
  
  const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  webglContextCache = context as WebGLRenderingContext | null;
  return webglContextCache;
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

// Unified canvas drawing function - eliminates code duplication
function drawUnifiedCanvas(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  isTestMode: boolean = false
) {
  ctx.clearRect(0, 0, width, height);
  
  // Use appropriate text based on mode
  const text = isTestMode 
    ? `Sphinx ${String.fromCharCode(55357, 56848)} quartz` // Shorter for test
    : CANVAS_FINGERPRINT_TEXT; // Full text for fingerprinting
  
  if (isTestMode) {
    // Test mode - optimized for performance
    ctx.textBaseline = "top";
    ctx.font = "14px Times New Roman, Times, serif";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    
    ctx.fillStyle = "#069";
    ctx.fillText(text, 2, 15);
    
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(text, 4, 30);
    
    // Minimal complex operation for detection
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(255, 0, 255, 0.5)";
    ctx.fillRect(180, 10, 15, 15);
  } else {
    // Full mode - maximum entropy for fingerprinting
    // Primary text with Times New Roman (high entropy serif font)
    ctx.font = "20px Times New Roman, Times, serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgb(255,0,255)";
    ctx.fillText(text, 10, height / 2);

    // Secondary text with Georgia (another high entropy serif)
    ctx.font = "18px Georgia, Times New Roman, serif";
    ctx.fillStyle = "rgba(0,100,255,0.7)";
    ctx.fillText(text, 10, height / 2 + 30);

    // Tertiary text with Palatino (complex serif font)
    ctx.font = "16px Palatino, Times New Roman, serif";
    ctx.fillStyle = "rgb(255,255,0)";
    ctx.fillText(text, 10, height / 2 - 30);

    // Background rectangle
    ctx.fillStyle = "rgba(0,100,255,0.7)";
    ctx.fillRect(50, 10, 120, 60);

    // Circle with blend mode
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgb(255,255,0)";
    ctx.beginPath();
    ctx.arc(200, height / 2, 30, 0, Math.PI * 2);
    ctx.fill();

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255,0,0,0.3)");
    gradient.addColorStop(1, "rgba(0,0,255,0.3)");
    ctx.fillStyle = gradient;

    // Shadow effects
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(0, 0, width, height);
  }
}

// Enhanced canvas drawing with new high-entropy text
function drawComplexCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Use unified function in full mode
  drawUnifiedCanvas(ctx, width, height, false);
}
