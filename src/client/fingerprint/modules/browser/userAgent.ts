import type { UserAgentInfo } from "../../types";

export async function collectUserAgent(): Promise<UserAgentInfo> {
  const userAgent = await getUserAgent();
  return userAgent;
}

async function getUserAgent(): Promise<UserAgentInfo> {
  try {
    let userAgent = "";

    if (navigator.userAgentData) {
      const uaData = navigator.userAgentData;
      const brands = uaData.brands.map(b => `${b.brand}/${b.version}`).join(" ");
      const platform = uaData.platform;
      const mobile = uaData.mobile;
      const cores = navigator.hardwareConcurrency || 0;
      const memory = (navigator as any).deviceMemory || 0; 

      userAgent = `${brands}|${platform}|${mobile}|${cores}|${memory}`;
    }

    return { userAgent };
  } catch {
    return { userAgent: "" };
  }
}
