import type { PluginsInfo, PluginData, PluginMimeTypeData } from "../../types";

export function collectPlugins(): PluginsInfo {
  const plugins = getPlugins();
  return plugins.map(plugin => plugin.name);
}

function getPlugins(): PluginData[] {
  try {
    const rawPlugins = navigator.plugins;

    if (!rawPlugins) {
      return [];
    }

    const plugins: PluginData[] = [];

    // Safari 10 doesn't support iterating navigator.plugins with for...of
    for (let i = 0; i < rawPlugins.length; ++i) {
      const plugin = rawPlugins[i];
      
      if (!plugin) {
        continue;
      }

      const mimeTypes: PluginMimeTypeData[] = [];

      for (let j = 0; j < plugin.length; ++j) {
        const mimeType = plugin[j];

        if (mimeType) {
          mimeTypes.push({
            type: mimeType.type || "",
            suffixes: mimeType.suffixes || "",
          });
        }
      }

      plugins.push({
        name: plugin.name || "",
        description: plugin.description || "",
        mimeTypes,
      });
    }

    return plugins;
  } catch {
    return [];
  }
}
