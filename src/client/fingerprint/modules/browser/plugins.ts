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
    const rawPlugins = (navigator as any).plugins;

    if (!rawPlugins || rawPlugins.length === 0) {
      return [];
    }

    return Array.from(rawPlugins).map((plugin: any) => ({
      name: plugin.name || "Unknown",
      description: plugin.description || "Unknown",
      filename: plugin.filename || "Unknown",
    }));
  } catch {
    return [];
  }
}
