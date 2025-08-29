import type { UserAgentInfo } from "../../types";

export async function collectUserAgent(): Promise<UserAgentInfo> {
  try {
    const { userAgent } = await getUserAgent();
    return { userAgent };
  } catch {
    return { userAgent: "" };
  }
}

async function getUserAgent(): Promise<UserAgentInfo> {
  const userAgent = navigator.userAgent || "";
  return { userAgent };
}
