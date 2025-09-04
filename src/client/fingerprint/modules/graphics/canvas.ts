import type { CanvasInfo } from "../../types";
import { murmurhash3_32_gc } from "../../utils/hash";

export const enum CanvasStatus {
  CLEAN = "clean",
  BLOCK = "block",
  RANDOMIZE = "randomize",
  SPOOFED_LOW_ENTROPY = "spoofed-low-entropy",
}

export async function collectCanvas(): Promise<CanvasInfo> {
  try {
    return await getCanvasInfo();
  } catch {
    return getEmptyCanvasInfo(CanvasStatus.BLOCK);
  }
}

async function getCanvasInfo(): Promise<CanvasInfo> {
  const collectedData: Record<string, any> = {};
  let status: CanvasStatus = CanvasStatus.CLEAN;

  try {
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

      if (gl) {
        collectedData.webglVersion = gl.getParameter(gl.VERSION);
        collectedData.webglVendor = gl.getParameter(gl.VENDOR);
        collectedData.webglRenderer = gl.getParameter(gl.RENDERER);
        collectedData.webglShadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);

        const extensions = gl.getSupportedExtensions();
        collectedData.webglExtensions = extensions ? extensions.sort().join(",") : "";

        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info") as any;
        
        if (debugInfo) {
          try {
            collectedData.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            collectedData.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

            // If blocked or empty, mark as spoofed
            if (!collectedData.unmaskedVendor || !collectedData.unmaskedRenderer) {
              status = CanvasStatus.SPOOFED_LOW_ENTROPY;
            }
          } catch {
            collectedData.unmaskedVendor = "blocked";
            collectedData.unmaskedRenderer = "blocked";
            
            status = CanvasStatus.SPOOFED_LOW_ENTROPY;
          }
        }
      } else {
        collectedData.webglVersion = "webgl-unavailable";
        status = CanvasStatus.BLOCK;
      }
    } catch {
      collectedData.webglVersion = "webgl-error";
      status = CanvasStatus.BLOCK;
    }

    // 2D Canvas detection 
    const width = 400;
    const height = 100;
    const text = "FPS Fingerprint 💯 @123# 😊 Canvas/GPU Test";
    const canvas1 = document.createElement("canvas");

    canvas1.width = width;
    canvas1.height = height;

    const ctx1 = canvas1.getContext("2d");

    if (!ctx1) {
      status = CanvasStatus.BLOCK;
    } else {
      try {
        drawComplexCanvas(ctx1, text, width, height);
        const data1 = ctx1.getImageData(0, 0, width, height).data;
        const canvas2 = document.createElement("canvas");

        canvas2.width = width;
        canvas2.height = height;

        const ctx2 = canvas2.getContext("2d");

        if (!ctx2) {
          status = CanvasStatus.BLOCK;
        } else {
          drawComplexCanvas(ctx2, text, width, height);
          const data2 = ctx2.getImageData(0, 0, width, height).data;

          // Compare pixel arrays
          if (!comparePixelArrays(data1, data2)) {
            status = CanvasStatus.RANDOMIZE;
          }

          // Check entropy if still CLEAN
          if (status === CanvasStatus.CLEAN && isLowEntropy(data1)) {
            status = CanvasStatus.SPOOFED_LOW_ENTROPY;
          }

          collectedData.canvasPixelData = Array.from(data1).slice(0, 100); // store small sample
        }
      } catch (e) {
        status = CanvasStatus.BLOCK;
        collectedData.canvasPixelData = "blocked";
      }
    }

    // Hash final value 
    const finalString = JSON.stringify(collectedData);
    const value = murmurhash3_32_gc(finalString).toString(16);

    return { value, status };
  } catch {
    return getEmptyCanvasInfo(CanvasStatus.BLOCK);
  }
}

// Draw complex canvas
function drawComplexCanvas(ctx: CanvasRenderingContext2D, text: string, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  ctx.font = "20px Arial";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgb(255,0,255)";
  ctx.fillText(text, 10, height / 2);

  // Add semi-transparent shapes
  ctx.fillStyle = "rgba(0,100,255,0.7)";
  ctx.fillRect(50, 10, 120, 60);

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgb(255,255,0)";
  ctx.beginPath();
  ctx.arc(200, height / 2, 30, 0, Math.PI * 2);
  ctx.fill();

  // Gradient + shadow
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

// Compare pixel arrays 
function comparePixelArrays(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

// Entropy check on RGBA
function isLowEntropy(data: Uint8ClampedArray): boolean {
  try {
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);

    const total = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      histR[data[i]]++;
      histG[data[i + 1]]++;
      histB[data[i + 2]]++;
    }

    const entropy = [histR, histG, histB].reduce((sum, hist) => {
      let e = 0;

      for (let i = 0; i < 256; i++) {
        if (hist[i] > 0) {
          const p = hist[i] / total;
          e -= p * Math.log2(p);
        }
      }

      return sum + e / 3;
    }, 0);

    return entropy < 3; 
  } catch {
    return false;
  }
}

function getEmptyCanvasInfo(status: CanvasStatus): CanvasInfo {
  return { value: "", status };
}
