import type { CpuClassInfo } from "../../types";

export function collectCpuClass(): CpuClassInfo {
  const cpuClass = getCpuClass();
  return { cpuClass };
}

function getCpuClass(): string {
  try {
    if (!("cpuClass" in navigator)) return "";

    const rawCpuClass = (navigator as any).cpuClass;

    return typeof rawCpuClass === "string" ? rawCpuClass.trim() : "";
  } catch {
    return "";
  }
}
