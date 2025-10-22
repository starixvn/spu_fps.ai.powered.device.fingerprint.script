import type { PluginsInfo } from "../../types";
import { isBrave, isSamsungInternetV17OrNewer } from "../../utils/browser";
import { FingerprintSpecialValue } from "../../utils/consts";

export function collectPlugins(): PluginsInfo {
  try {
    const antiFingerprintingResult = getPluginsAntiFp();
    if (antiFingerprintingResult !== null) return antiFingerprintingResult;

    return getRawPlugins();
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function getPluginsAntiFp(): PluginsInfo | null {
  // Samsung Internet Smart Anti-Tracking (v17+)
  if (isSamsungInternetV17OrNewer()) {
    return FingerprintSpecialValue.ANTI_FINGERPRINTED;
  }

  if (isBrave()) {
    return FingerprintSpecialValue.ANTI_FINGERPRINTED;
  }

  return null;
}

function getRawPlugins(): PluginsInfo {
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

  plugins.sort();

  return plugins;
}