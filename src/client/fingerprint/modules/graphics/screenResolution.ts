import { FingerprintSpecialValue } from '../../utils/consts';
import { replaceNaN, toInt } from '../../utils/data';

export type ScreenResolutionValue = number | FingerprintSpecialValue
export type ScreenResolution = [ScreenResolutionValue, ScreenResolutionValue]

export function collectScreenResolution(): ScreenResolution {
  return getScreenResolution();
}

function getScreenResolution(): ScreenResolution {
  try {
    return getUnstableScreenResolution();
  } catch {
    return [
      FingerprintSpecialValue.UNDEFINED,
      FingerprintSpecialValue.UNDEFINED,
    ];
  }
}

export function getUnstableScreenResolution(): ScreenResolution {
  const s = screen;
  const parseDimension = (value: unknown) => replaceNaN(toInt(value), FingerprintSpecialValue.UNDEFINED);
  const width = parseDimension(s.width);
  const height = parseDimension(s.height);
  
  return [width, height];
}