import type { CpuClassInfo } from "../../types";

export function collectCpuClass(): CpuClassInfo {
  try {
    const ccl = getCpuClass();
    return { ccl };
  } catch (error) {
    return { ccl: "" };
  }
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
