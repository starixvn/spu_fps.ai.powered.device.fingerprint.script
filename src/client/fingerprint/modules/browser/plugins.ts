import type { PluginsInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

export function collectPlugins(): PluginsInfo {
   try {
    const rawPlugins = navigator.plugins;

    if (!rawPlugins) {
      return FingerprintSpecialValue.UNDEFINED;
    }

    const plugins: string[] = [];

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
