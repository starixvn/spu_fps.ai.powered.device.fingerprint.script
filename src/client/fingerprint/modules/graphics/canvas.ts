import type { CanvasInfo } from "../../types";

const CANVAS_SESSION_CACHE_KEY = "__canvas_fingerprint_session__";
const CANVAS_LOCAL_CACHE_KEY = "__canvas_fingerprint_local__";

const KNOWN_SPOOFED_PREFIXES = [
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAY", 
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAY"
];

export async function collectCanvas(): Promise<CanvasInfo> {
  try {
    return await getCanvasInfo();
  } catch {
    return getEmptyCanvasInfo();
  }
}

async function getCanvasInfo(): Promise<CanvasInfo> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) throw new Error("Canvas not available");

  canvas.width = 200;
  canvas.height = 200;

  ctx.textRendering = "optimizeLegibility";
  ctx.textBaseline = "alphabetic";
  ctx.font = "14px Arial";
  ctx.fillStyle = "#f60";
  ctx.strokeStyle = "#069";
  ctx.lineWidth = 2;
  ctx.fillText("FPS Device Fingerprint", 10, 20);
  ctx.strokeText("Canvas Test", 10, 40);

  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, Math.PI * 2);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, 0, 200, 200);
  gradient.addColorStop(0, "rgba(255,0,0,0.5)");
  gradient.addColorStop(1, "rgba(0,0,255,0.5)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 200);

  let fingerprint1 = "";
  let fingerprint2 = "";
  let blobHash = "";
  let rawHash = "";
  let noiseType: "ok" | "blocked" | "spoofed" | "randomized" = "ok";

  try {
    fingerprint1 = canvas.toDataURL("image/png");
    fingerprint2 = canvas.toDataURL("image/png");

    blobHash = await hashCanvasBlob(canvas);

    rawHash = hashImageData(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data
    );

    if (!fingerprint1 || fingerprint1 === "data:,") {
      noiseType = "blocked";
    } else if (fingerprint1 !== fingerprint2) {
      noiseType = "randomized";
    } else if (KNOWN_SPOOFED_PREFIXES.some((spoof) => fingerprint1.startsWith(spoof))) {
      noiseType = "spoofed";
    } else if (isLowEntropy(ctx)) {
      noiseType = "spoofed";
    } else if (!(await checkConsistency(fingerprint1, blobHash, rawHash))) {
      noiseType = "spoofed";
    } else {
      const cachedSession = sessionStorage.getItem(CANVAS_SESSION_CACHE_KEY);

      if (cachedSession && cachedSession !== fingerprint1) {
        noiseType = "randomized";
      }
      sessionStorage.setItem(CANVAS_SESSION_CACHE_KEY, fingerprint1);

      const cachedLocal = localStorage.getItem(CANVAS_LOCAL_CACHE_KEY);
      if (cachedLocal && cachedLocal !== fingerprint1) {
        noiseType = "randomized";
      }
      localStorage.setItem(CANVAS_LOCAL_CACHE_KEY, fingerprint1);
    }
  } catch {
    noiseType = "blocked";
  }

  return {
    fingerprint: fingerprint1,
    noiseType,
    width: canvas.width,
    height: canvas.height,
    textRendering: ctx.textRendering || "",
    textBaseline: ctx.textBaseline,
    font: ctx.font,
    fillStyle: ctx.fillStyle.toString(),
    strokeStyle: ctx.strokeStyle.toString(),
    lineWidth: ctx.lineWidth,
    lineCap: ctx.lineCap,
    lineJoin: ctx.lineJoin,
    miterLimit: ctx.miterLimit,
    shadowOffsetX: ctx.shadowOffsetX,
    shadowOffsetY: ctx.shadowOffsetY,
    shadowBlur: ctx.shadowBlur,
    shadowColor: ctx.shadowColor,
    globalAlpha: ctx.globalAlpha,
    globalCompositeOperation: ctx.globalCompositeOperation,
  };
}

function isLowEntropy(ctx: CanvasRenderingContext2D): boolean {
  try {
    const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
    const hist = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      hist[data[i]]++;
    }
    const total = data.length / 4;
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (hist[i] > 0) {
        const p = hist[i] / total;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy < 2; 
  } catch {
    return false;
  }
}

async function checkConsistency(dataUrl: string, blobHash: string, rawHash: string): Promise<boolean> {
  const urlHash = await simpleHash(dataUrl);
  return (
    urlHash.substring(0, 8) === blobHash.substring(0, 8) ||
    urlHash.substring(0, 8) === rawHash.substring(0, 8)
  );
}

async function hashCanvasBlob(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve("");
      const buf = await blob.arrayBuffer();
      resolve(await simpleHash(buf));
    }, "image/png");
  });
}

function hashImageData(data: Uint8ClampedArray): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash * 31 + data[i]) >>> 0;
  }
  return hash.toString(16);
}

async function simpleHash(input: string | ArrayBuffer): Promise<string> {
  const data =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getEmptyCanvasInfo(): CanvasInfo {
  return {
    fingerprint: "",
    noiseType: "blocked",
    width: 0,
    height: 0,
    textRendering: "",
    textBaseline: "",
    font: "",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    lineCap: "",
    lineJoin: "",
    miterLimit: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: "",
    globalAlpha: 0,
    globalCompositeOperation: "",
  };
}
