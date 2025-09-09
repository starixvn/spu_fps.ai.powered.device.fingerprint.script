export type ColorGamut = 'srgb' | 'p3' | 'rec2020';

export function collectColorGamut(): ColorGamut | undefined {
  try {
    return getColorGamut();
  } catch {
    return undefined;
  }
}

function getColorGamut(): ColorGamut | undefined {
  // rec2020 includes p3 and p3 includes srgb
  for (const gamut of ['rec2020', 'p3', 'srgb'] as const) {
    if (matchMedia(`(color-gamut: ${gamut})`).matches) {
      return gamut;
    }
  }
  
  return undefined;
}
