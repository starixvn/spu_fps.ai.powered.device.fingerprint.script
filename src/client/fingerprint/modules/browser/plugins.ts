interface Plugin {
  name: string;
  description: string;
  filename: string;
}

interface PluginsResult {
  plugins: Plugin[];
}

export function collectPlugins(): PluginsResult {
  try {
    const plugins = getPlugins();
    console.log("Plugins fingerprint collected:", { plugins });

    return { plugins };
  } catch (error) {
    console.error("Error collecting plugins:", error);
    return { plugins: [] };
  }
}

function getPlugins(): Plugin[] {
  try {
    const plugins: Plugin[] = [];

    if (!navigator.plugins || navigator.plugins.length === 0) {
      return [];
    }

    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i];

      if (plugin) {
        plugins.push({
          name: plugin.name || "Unknown",
          description: plugin.description || "Unknown",
          filename: plugin.filename || "Unknown",
        });
      }
    }

    return plugins;
  } catch {
    return [];
  }
}
