import type { SessionStorageInfo } from "../../types";

export function collectSessionStorage(): SessionStorageInfo {
  try {
    const supported = getSessionStorage();
    return { sessionStorage: supported };
  } catch (error) {
    return { sessionStorage: false };
  }
}

function getSessionStorage(): boolean {
  if (typeof window === "undefined" || !window.sessionStorage) return false;

  const testKey = `sessionstorage_test_${Math.random().toString(36).slice(2)}`;
  const testValue = "test_value";

  try {
    window.sessionStorage.setItem(testKey, testValue);

    const readValue = window.sessionStorage.getItem(testKey);
    const isValid = readValue === testValue;

    window.sessionStorage.removeItem(testKey);

    return isValid;
  } catch (error) {
    return false;
  }
}
