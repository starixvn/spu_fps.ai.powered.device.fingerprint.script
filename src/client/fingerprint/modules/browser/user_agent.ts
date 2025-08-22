interface UserAgentResult {
  userAgent: string;
}

export function collectUserAgent(): UserAgentResult {
  try {
    const userAgent = getUserAgent();
    console.log("UserAgent fingerprint collected:", { userAgent });

    return { userAgent };
  } catch (error) {
    console.error("Error collecting user agent:", error);
    return { userAgent: "unknown" };
  }
}

function getUserAgent(): string {
  try {
    if (navigator.userAgent) return navigator.userAgent;
    return "unknown";
  } catch {
    return "unknown";
  }
}
