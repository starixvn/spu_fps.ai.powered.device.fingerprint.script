interface OSNameResult {
  osName: string;
}

export function collectOSName(): OSNameResult {
  try {
    const osName = getOSName();
    console.log("OSName fingerprint collected:", { osName });

    return { osName };
  } catch (error) {
    console.error("Error collecting OS name:", error);
    return { osName: "unknown" };
  }
}

function getOSName(): string {
  try {
    const userAgent = navigator.userAgent;

    const osPatterns = [
      {
        pattern: /Windows NT (\d+\.\d+)/,
        name: "Windows",
        extractVersion: true,
      },
      { pattern: /Windows/, name: "Windows" },

      { pattern: /Mac OS X (\d+_\d+)/, name: "macOS", extractVersion: true },
      { pattern: /Mac OS X/, name: "macOS" },

      { pattern: /Linux/, name: "Linux" },

      { pattern: /Android (\d+)/, name: "Android", extractVersion: true },
      { pattern: /Android/, name: "Android" },

      { pattern: /iPhone OS (\d+)/, name: "iOS", extractVersion: true },
      { pattern: /iPhone OS/, name: "iOS" },

      { pattern: /BlackBerry/, name: "BlackBerry" },
      { pattern: /Symbian/, name: "Symbian" },
      { pattern: /webOS/, name: "webOS" },
      { pattern: /Windows Phone/, name: "Windows Phone" },
    ];

    for (const os of osPatterns) {
      const match = userAgent.match(os.pattern);

      if (match) {
        if (os.extractVersion && match[1]) {
          return `${os.name} ${match[1]}`;
        }

        return os.name;
      }
    }

    const osMatch = userAgent.match(/([A-Za-z]+)(?:\s|$)/);

    if (osMatch && osMatch[1]) {
      return osMatch[1];
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}
