import type { LocalStorageInfo, Bit } from "../../types";
import { boolToBit } from "../../utils/data";

export function collectLocalStorage(): LocalStorageInfo {
  try {
    const localStorageSupported = getLocalStorage();
    return { localStorage: localStorageSupported };
  } catch (error) {
    console.warn("collectLocalStorage error:", error);
    return { localStorage: 0 };
  }
}

function getLocalStorage(): Bit {
  try {
    if (typeof window === "undefined" || !window.localStorage) return 0;

    const testKey = `localstorage_test_${Math.random().toString(36).slice(2)}`;
    const testValue = "test_value";

    window.localStorage.setItem(testKey, testValue);

    const storedValue = window.localStorage.getItem(testKey);

    window.localStorage.removeItem(testKey);

    if (storedValue !== testValue) return 0;

    return 1;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "SecurityError")
    ) {
      return 0;
    }
    return 0;
  }
}
