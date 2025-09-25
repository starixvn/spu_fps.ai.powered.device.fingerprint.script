import type { PlatformInfo } from "../../types";
import { isWebKit, isDesktopWebKit, isIPad } from "../../utils/browser";
import { FingerprintSpecialValue } from "../../utils/consts";

export function collectPlatform(): PlatformInfo {
  const platform = getPlatform();
  return platform;
}

export function getPlatform(): string | FingerprintSpecialValue {
  try {
    const platform = navigator.platform;
   
    if (platform === 'MacIntel') {
      if (isWebKit() === 1 && isDesktopWebKit() === 0) {
        return isIPad() === 1 ? 'iPad' : 'iPhone';
      }
    }

    return platform || FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}