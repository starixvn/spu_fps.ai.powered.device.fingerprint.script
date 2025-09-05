import type { UserAgentInfo } from "../../types";

export async function collectUserAgent(): Promise<UserAgentInfo> {
  try {
    const userAgent = await getUserAgent();
    return userAgent;
  } catch {
    return { userAgent: "" };
  }
}

async function getUserAgent(): Promise<UserAgentInfo> {
  let userAgent = "";

  if (navigator.userAgentData) {
    const uaData = navigator.userAgentData;
    const brands = uaData.brands.map(b => `${b.brand}/${b.version}`).join(" ");
    const platform = uaData.platform;
    const mobile = uaData.mobile;
    const cores = navigator.hardwareConcurrency || 0;
    const memory = (navigator as any).deviceMemory || 0; 
    const lang = navigator.languages?.join(",") || "";

    userAgent = `${brands} (${platform}; mobile=${mobile}; cores=${cores}; memory=${memory}GB; lang=${lang})`;
  }

  return { userAgent };
}
