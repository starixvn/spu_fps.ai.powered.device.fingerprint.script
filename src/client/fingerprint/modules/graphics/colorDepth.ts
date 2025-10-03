import { FingerprintSpecialValue } from "../../utils/consts";

export function collectColorDepth(): number | FingerprintSpecialValue {
  return getColorDepth();
}

function getColorDepth(): number | FingerprintSpecialValue {
  try {
    const colorDepth = window?.screen?.colorDepth;
    return typeof colorDepth === 'number' ? colorDepth : FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}