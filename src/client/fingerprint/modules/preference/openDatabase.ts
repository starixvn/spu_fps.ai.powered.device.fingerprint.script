import type { OpenDatabaseInfo } from "../../types";

export function collectOpenDatabase(): OpenDatabaseInfo {
  try {
    const openDatabase = getOpenDatabase();
    return { openDatabase };
  } catch (error) {
    return { openDatabase: false };
  }
}

function getOpenDatabase(): boolean {
  try {
    if (typeof window !== "undefined" && (window as any).openDatabase) {
      return true;
    }

    if (typeof window !== "undefined" && (window as any).webkitOpenDatabase) {
      return true;
    }

    if (typeof window !== "undefined" && (window as any).mozOpenDatabase) {
      return true;
    }

    if (typeof window !== "undefined" && (window as any).msOpenDatabase) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
