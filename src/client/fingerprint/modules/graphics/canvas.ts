import type { CanvasInfo } from "../../types";

export async function collectCanvas(): Promise<CanvasInfo> {
  try {
    return getCanvasInfo();
  } catch (error) {
    return getEmptyCanvasInfo();
  }
}

function getCanvasInfo(): CanvasInfo {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas 2D context not available");

  canvas.width = 200;
  canvas.height = 200;

  ctx.textRendering = "optimizeLegibility";
  ctx.textBaseline = "alphabetic";
  ctx.font = "14px Arial";
  ctx.fillStyle = "#f60";
  ctx.strokeStyle = "#069";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.miterLimit = 10;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 2;
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.globalAlpha = 0.8;
  ctx.globalCompositeOperation = "source-over";

  ctx.fillText("FPS Device Fingerprint", 10, 20);
  ctx.strokeText("Canvas Test", 10, 40);

  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(150, 150, 30, 30);
  ctx.fill();

  const gradient = ctx.createLinearGradient(0, 0, 200, 200);
  gradient.addColorStop(0, "rgba(255,0,0,0.5)");
  gradient.addColorStop(1, "rgba(0,0,255,0.5)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 200);

  const fingerprint = canvas.toDataURL();

  return {
    fingerprint,
    width: canvas.width,
    height: canvas.height,
    textRendering: ctx.textRendering || "auto",
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

function getEmptyCanvasInfo(): CanvasInfo {
  return {
    fingerprint: "",
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
