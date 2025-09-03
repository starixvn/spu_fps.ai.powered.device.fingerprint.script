import type { LocalStorageInfo } from "../../types";

export function collectLocalStorage(): LocalStorageInfo {
  try {
    const localStorageSupported = getLocalStorage();
    return { localStorage: localStorageSupported };
  } catch (error) {
    console.warn("collectLocalStorage error:", error);
    return { localStorage: false };
  }
}

function getLocalStorage(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;

    const testKey = `localstorage_test_${Math.random().toString(36).slice(2)}`;
    const testValue = "test_value";

    window.localStorage.setItem(testKey, testValue);

    const storedValue = window.localStorage.getItem(testKey);

    window.localStorage.removeItem(testKey);

    if (storedValue !== testValue) return false;

    return true;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "SecurityError")
    ) {
      return false;
    }
    return false;
  }
}
