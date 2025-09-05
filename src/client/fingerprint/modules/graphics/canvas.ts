import { murmurhash3_32_gc } from "../../utils/hash";

const CANVAS_CACHE_KEY = "canvasCache";
const CANVAS_SNAPSHOTS = 5;

export async function collectCanvas(): Promise<string> {
  try {
    let cachedValue: string | null = null;
    try {
      const rawCache = localStorage.getItem(CANVAS_CACHE_KEY);

      if (rawCache && rawCache.length > 0) {
        cachedValue = rawCache;
      }
    } catch (e) {
    }

    const snapshotPromises = Array.from({ length: CANVAS_SNAPSHOTS }, () => getCanvasFeatures());
    const samples = (await Promise.all(snapshotPromises)).filter(Boolean) as any[];

    if (samples.length === 0) {
      return "";
    }

    const stableFeatures = computeFeatureMedian(samples);
    const value = murmurhash3_32_gc(JSON.stringify(stableFeatures)).toString(16);
     
    if (cachedValue && cachedValue === value) {
      return cachedValue;
    }

    try {
      localStorage.setItem(CANVAS_CACHE_KEY, value);
    } catch (e) {
    }

    return value;
  } catch {
    return "";
  }
}

async function getCanvasFeatures(): Promise<Record<string, any> | null> {
  try {
    const canvas = document.createElement("canvas");
    
    canvas.width = 400;
    canvas.height = 100;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    drawComplexCanvas(ctx, "FPS Fingerprint 💯 @123# 😊 Canvas/GPU Test", canvas.width, canvas.height);

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
  if (samples.length === 1) return samples[0];
  
  const median: any = {};
  const keys = Object.keys(samples[0]);
  
  for (const key of keys) {
    const vals = samples.map(s => JSON.stringify(s[key]));
    const counts = new Map<string, number>();
    vals.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    let maxCount = 0, mostCommon = vals[0];
    counts.forEach((c, v) => { if(c > maxCount){maxCount=c;mostCommon=v;} });
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
