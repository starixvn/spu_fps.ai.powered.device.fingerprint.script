export interface UserAgentResult {
  userAgent: string;
}

export async function collectUserAgent(): Promise<UserAgentResult> {
  try {
    const { userAgent } = await getUserAgent();
    return { userAgent };
  } catch {
    return { userAgent: "" };
  }
}

async function getUserAgent(): Promise<UserAgentResult> {
  const userAgent = navigator.userAgent || "";
  return { userAgent };
}
