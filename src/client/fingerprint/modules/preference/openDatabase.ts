import type { OpenDatabaseInfo } from "../../types";

export function collectOpenDatabase(): OpenDatabaseInfo {
  try {
    const openDatabaseSupported = getOpenDatabase();
    return { openDatabase: openDatabaseSupported };
  } catch (error) {
    return { openDatabase: false };
  }
}

function getOpenDatabase(): boolean {
  try {
    if (typeof window === "undefined") return false;

    const dbAPIs = [
      "openDatabase",
      "webkitOpenDatabase",
      "mozOpenDatabase",
      "msOpenDatabase",
    ] as const;

    for (const api of dbAPIs) {
      const fn = (window as any)[api];

      if (typeof fn === "function") {
        try {
          fn("test", "1.0", "test_db", 1);
          return true;
        } catch {
          continue;
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}
