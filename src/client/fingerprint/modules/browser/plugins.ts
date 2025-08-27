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
    return { plugins };
  } catch (error) {
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
      name: plugin.name || "",
      description: plugin.description || "",
      filename: plugin.filename || "",
    }));
  } catch {
    return [];
  }
}
