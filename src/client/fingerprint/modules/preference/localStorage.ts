import type { LocalStorageInfo, Bit } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";
import { boolToBit } from "../../utils/data";

export function collectLocalStorage(): LocalStorageInfo {
  const localStorageSupported = getLocalStorage();
  return { localStorage: localStorageSupported };
}

function getLocalStorage(): Bit | FingerprintSpecialValue {
  try {
    if (typeof window === "undefined" || !window.localStorage) 
      return FingerprintSpecialValue.UNDEFINED;

    const testKey = `localstorage_test_${Math.random().toString(36).slice(2)}`;
    const testValue = "test_value";

    window.localStorage.setItem(testKey, testValue);

    const storedValue = window.localStorage.getItem(testKey);
    const isValid = storedValue === testValue;

    window.localStorage.removeItem(testKey);

    return boolToBit(isValid);
  } catch (e) {
    if (e instanceof DOMException && e.name === "SecurityError") {
      return 1;
    }

    return FingerprintSpecialValue.ERROR;
  }
}
