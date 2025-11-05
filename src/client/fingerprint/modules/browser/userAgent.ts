import type { UserAgentInfo } from '../../types';
import { FingerprintSpecialValue } from '../../utils/consts';

export function collectUserAgent(): UserAgentInfo {
  try {
    if (navigator.userAgentData) {
      var brands = navigator.userAgentData.brands
        .filter(
          (b) => b.brand.replace(/[^a-z]/gi, '').toLowerCase() !== 'notabrand'
        )
        .sort((a, b) => a.brand.localeCompare(b.brand))
        .map((b) => `${b.brand}/${b.version}`)
        .join(' ');

      var platform = navigator.userAgentData.platform;
      return `${brands}|${platform}`;
    }

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}
