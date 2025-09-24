import type { OpenDatabaseInfo, Bit } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

export function collectOpenDatabase(): OpenDatabaseInfo {
  const openDatabaseSupported = getOpenDatabase();
  return { openDatabase: openDatabaseSupported };
}

function getOpenDatabase(): Bit | FingerprintSpecialValue {
  try {
    if (typeof window === "undefined") 
      return FingerprintSpecialValue.UNDEFINED;

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
        }
        return 1;
      }
    }

    return 0;
  } catch (e) {
    return 0;
  }
}
