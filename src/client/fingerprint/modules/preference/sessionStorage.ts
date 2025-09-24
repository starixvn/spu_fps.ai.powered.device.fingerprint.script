import type { SessionStorageInfo, Bit } from "../../types";
import { boolToBit } from "../../utils/data";

export function collectSessionStorage(): SessionStorageInfo {
  const supported = getSessionStorage();
  return { sessionStorage: supported };
}

function getSessionStorage(): Bit {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return 0;

    const testKey = `sessionstorage_test_${Math.random().toString(36).slice(2)}`;
    const testValue = "test_value";

    window.sessionStorage.setItem(testKey, testValue);

    const readValue = window.sessionStorage.getItem(testKey);
    const isValid = readValue === testValue;

    window.sessionStorage.removeItem(testKey);

    return boolToBit(isValid);
  } catch (error) {
    return 0;
  }
}
