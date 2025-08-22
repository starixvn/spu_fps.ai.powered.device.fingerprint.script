interface BrowserNameResult {
  browserName: string;
}

export function collectBrowserName(): BrowserNameResult {
  try {
    const browserName = getBrowserName();
    console.log("BrowserName fingerprint collected:", { browserName });

    return { browserName };
  } catch (error) {
    console.error("Error collecting browser name:", error);
    return { browserName: "unknown" };
  }
}

function getBrowserName(): string {
  try {
    const userAgent = navigator.userAgent.toLowerCase();

    const browserPatterns = [
      { pattern: /edg\//i, name: "Edge" },
      { pattern: /edgios/i, name: "Edge (iOS)" },
      { pattern: /edga/i, name: "Edge (Android)" },

      { pattern: /opr|opera/i, name: "Opera" },
      { pattern: /brave/i, name: "Brave" },
      { pattern: /chromium/i, name: "Chromium" },
      { pattern: /chrome/i, name: "Chrome" },

      { pattern: /firefox/i, name: "Firefox" },
      { pattern: /safari(?!.*chrome)/i, name: "Safari" },
      { pattern: /ie|trident/i, name: "Internet Explorer" },
      { pattern: /maxthon/i, name: "Maxthon" },
      { pattern: /seamonkey/i, name: "SeaMonkey" },
      { pattern: /waterfox/i, name: "Waterfox" },
      { pattern: /pale moon/i, name: "Pale Moon" },
    ];

    for (const browser of browserPatterns) {
      if (browser.pattern.test(userAgent)) {
        return browser.name;
      }
    }

    const browserMatch = userAgent.match(/([a-z]+)(?:\/[\d.]+)/);

    if (browserMatch && browserMatch[1]) {
      return browserMatch[1].charAt(0).toUpperCase() + browserMatch[1].slice(1);
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}
