import { ClientHints } from "../../types";

export interface UserAgentResult {
  userAgent: string;
  clientHints?: ClientHints;
}

export async function collectUserAgent(): Promise<UserAgentResult> {
  try {
    const { userAgent, clientHints } = await getUserAgent();
    return { userAgent, clientHints };
  } catch {
    return { userAgent: "" };
  }
}

async function getUserAgent(): Promise<UserAgentResult> {
  const userAgent = navigator.userAgent || "";

  if (navigator.userAgentData) {
    const basicHints = {
      brands: navigator.userAgentData.brands || [],
      mobile: navigator.userAgentData.mobile || false,
    };

    try {
      const highEntropyHints =
        await navigator.userAgentData.getHighEntropyValues([
          "platform",
          "platformVersion",
          "architecture",
          "model",
          "uaFullVersion",
        ]);

      return { userAgent, clientHints: { ...basicHints, ...highEntropyHints } };
    } catch {
      return { userAgent, clientHints: basicHints };
    }
  }

  return { userAgent };
}
