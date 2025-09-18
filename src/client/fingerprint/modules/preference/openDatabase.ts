import type { OpenDatabaseInfo, Bit } from "../../types";

export function collectOpenDatabase(): OpenDatabaseInfo {
  const openDatabaseSupported = getOpenDatabase();
  return { openDatabase: openDatabaseSupported };
}

function getOpenDatabase(): Bit {
  try {
    if (typeof window === "undefined") return 0;

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
          return 1;
        } catch {
          continue;
        }
      }
    }

    return 0;
  } catch (error) {
    return 0;
  }
}
