import { FingerprintSpecialValue } from "../../utils/consts";

export type ColorGamut = 'srgb' | 'p3' | 'rec2020';

export function collectColorGamut(): ColorGamut | FingerprintSpecialValue {
  return getColorGamut();
}

function getColorGamut(): ColorGamut | FingerprintSpecialValue {
  try {
    // rec2020 includes p3 and p3 includes srgb
    for (const gamut of ['rec2020', 'p3', 'srgb'] as const) {
      if (matchMedia(`(color-gamut: ${gamut})`).matches) {
        return gamut;
      }
    }
    
    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}
