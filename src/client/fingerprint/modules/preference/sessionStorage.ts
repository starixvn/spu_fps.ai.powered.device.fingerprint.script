import type { SessionStorageInfo, Bit } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";
import { boolToBit } from "../../utils/data";

export function collectSessionStorage(): SessionStorageInfo {
  const supported = getSessionStorage();
  return { sessionStorage: supported };
}

function getSessionStorage(): Bit | FingerprintSpecialValue {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) 
      return FingerprintSpecialValue.UNDEFINED;

    const testKey = `sessionstorage_test_${Math.random().toString(36).slice(2)}`;
    const testValue = "test_value";

    window.sessionStorage.setItem(testKey, testValue);

    const readValue = window.sessionStorage.getItem(testKey);
    const isValid = readValue === testValue;

    window.sessionStorage.removeItem(testKey);

    return boolToBit(isValid);
  } catch (e) {
    if (e instanceof DOMException && e.name === "SecurityError") {
      return 1;
    }
    
    return FingerprintSpecialValue.ERROR;  
  }
}
