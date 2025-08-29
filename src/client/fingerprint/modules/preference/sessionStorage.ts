import type { SessionStorageInfo } from "../../types";

export function collectSessionStorage(): SessionStorageInfo {
  try {
    const sessionStorage = getSessionStorage();
    return { sessionStorage };
  } catch (error) {
    return { sessionStorage: false };
  }
}

function getSessionStorage(): boolean {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const testKey = "sessionstorage_test";
      const testValue = "test_value";

      window.sessionStorage.setItem(testKey, testValue);

      const hasValue = window.sessionStorage.getItem(testKey) === testValue;

      window.sessionStorage.removeItem(testKey);

      return hasValue;
    }

    return false;
  } catch {
    return false;
  }
}
