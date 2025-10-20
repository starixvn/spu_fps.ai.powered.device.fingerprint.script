import type { PluginsInfo } from "../../types";
import { isSamsungInternetV17OrNewer } from "../../utils/browser";
import { FingerprintSpecialValue } from "../../utils/consts";
import { collectBrowserName } from "./browserName";

export function collectPlugins(): PluginsInfo {
  try {
    const antiFingerprintingResult = getPluginsAntifingerprinting();
    if (antiFingerprintingResult !== null) return antiFingerprintingResult;

    const rawPlugins = navigator.plugins;
    const plugins: string[] = [];

    if (!rawPlugins) {
      return FingerprintSpecialValue.UNDEFINED;
    }

    // Safari 10 doesn't support iterating navigator.plugins with for...of
    for (let i = 0; i < rawPlugins.length; ++i) {
      const plugin = rawPlugins[i];
      
      if (!plugin) {
        continue;
      }

      plugins.push(plugin.name);
    }

    return plugins;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getPluginsAntifingerprinting(): PluginsInfo | null {
  const rawBrowserName = collectBrowserName();
  const browserName = typeof rawBrowserName === 'string'  ? rawBrowserName.toLowerCase() : '';  

  // Samsung Internet Smart Anti-Tracking (v17+)
  if (isSamsungInternetV17OrNewer()) {
    return FingerprintSpecialValue.ANTI_FINGERPRINTED;
  }

  // Brave Browser has built-in fingerprinting protection
  // if (browserName === 'brave') {
  //   return FingerprintSpecialValue.ANTI_FINGERPRINTED;
  // }

  return null;
}