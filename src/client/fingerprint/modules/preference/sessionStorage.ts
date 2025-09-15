import type { SessionStorageInfo, Bit } from "../../types";
import { boolToBit } from "../../utils/data";

export function collectSessionStorage(): SessionStorageInfo {
  try {
    const supported = getSessionStorage();
    return { sessionStorage: supported };
  } catch (error) {
    return { sessionStorage: 0 };
  }
}

function getSessionStorage(): Bit {
  if (typeof window === "undefined" || !window.sessionStorage) return 0;

  const testKey = `sessionstorage_test_${Math.random().toString(36).slice(2)}`;
  const testValue = "test_value";

  try {
    window.sessionStorage.setItem(testKey, testValue);

    const readValue = window.sessionStorage.getItem(testKey);
    const isValid = readValue === testValue;

    window.sessionStorage.removeItem(testKey);

    return boolToBit(isValid);
  } catch (error) {
    return 0;
  }
}
