interface SessionStorageResult {
  sessionStorage: boolean;
}

export function collectSessionStorage(): SessionStorageResult {
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
      const testKey = "fps_sessionstorage_test";
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
