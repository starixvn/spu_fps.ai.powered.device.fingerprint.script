import type { CanvasInfo } from "../../types";
import { murmurhash3_32_gc } from "../../utils/hash";

export enum CanvasStatus {
  OK = "ok",
  BLOCKED = "blocked",
  RANDOMIZED = "randomized",
  SPOOFED_LOW_ENTROPY = "spoofed-low-entropy",
}

export async function collectCanvas(): Promise<CanvasInfo> {
  try {
    return await getCanvasInfo();
  } catch {
    return getEmptyCanvasInfo(CanvasStatus.BLOCKED);
  }
}

async function getCanvasInfo(): Promise<CanvasInfo> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) throw new Error("Canvas not available");

  canvas.width = 200;
  canvas.height = 200;

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

  let status: CanvasStatus = CanvasStatus.OK;
  let fingerprint = "";

  try {
    const data1 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const data2 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const dataUrl = canvas.toDataURL("image/png");

    fingerprint = murmurhash3_32_gc(dataUrl).toString(16);

    if (!dataUrl || dataUrl === "data:,") {
      status = CanvasStatus.BLOCKED;
    } else if (!compareArrays(data1, data2)) {
      status = CanvasStatus.RANDOMIZED;
    } else if (isLowEntropy(data1)) {
      status = CanvasStatus.SPOOFED_LOW_ENTROPY;
    }
  } catch {
    status = CanvasStatus.BLOCKED;
  }

  return {
    fingerprint,
    status,
    width: canvas.width,
    height: canvas.height,
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

function compareArrays(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

function isLowEntropy(data: Uint8ClampedArray): boolean {
  try {
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

function getEmptyCanvasInfo(status: CanvasStatus): CanvasInfo {
  return {
    fingerprint: "",
    status,
    width: 0,
    height: 0,
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
