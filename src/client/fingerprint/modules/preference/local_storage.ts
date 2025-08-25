interface LocalStorageResult {
  localStorage: boolean;
}

export function collectLocalStorage(): LocalStorageResult {
  try {
    const localStorage = getLocalStorage();
    return { localStorage };
  } catch (error) {
    console.error("Error collecting localStorage status:", error);
    return { localStorage: false };
  }
}

function getLocalStorage(): boolean {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const testKey = "fps_localstorage_test";
      const testValue = "test_value";

      window.localStorage.setItem(testKey, testValue);

      const hasValue = window.localStorage.getItem(testKey) === testValue;

      window.localStorage.removeItem(testKey);

      return hasValue;
    }

    return false;
  } catch {
    return false;
  }
}
