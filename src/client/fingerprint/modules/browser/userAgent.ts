import type { UserAgentInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";
import { getPlatform } from "../hardware/platform";

export async function collectUserAgent(): Promise<UserAgentInfo> {
  try {
    let brands: string, platform: string | FingerprintSpecialValue, mobile: number;

    if (navigator.userAgentData?.getHighEntropyValues) {
      const uaData = await navigator.userAgentData.getHighEntropyValues(["platform"]);

      brands = navigator.userAgentData.brands
        .filter(b => b.brand.replace(/[^a-z]/gi, "").toLowerCase() !== "notabrand")
        .sort((a, b) => a.brand.localeCompare(b.brand))
        .map(b => `${b.brand}/${b.version}`)
        .join(" ");

      platform = getPlatform() || (uaData.platform ?? "");
      mobile   = Number(navigator.userAgentData.mobile);
      return `${brands}|${platform}|${mobile}`;
    }
    
    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}