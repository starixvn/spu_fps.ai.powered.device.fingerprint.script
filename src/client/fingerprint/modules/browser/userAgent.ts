import type { UserAgentInfo } from "../../types";

export function collectUserAgent(): UserAgentInfo {
  return getUserAgent();
}

function getUserAgent(): UserAgentInfo {
  try {
    const userAgent = navigator.userAgent || "";
    
    return { userAgent };
  } catch {
    return { userAgent: "" };
  }
}
