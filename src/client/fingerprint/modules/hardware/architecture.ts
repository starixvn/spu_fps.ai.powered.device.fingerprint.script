import type { ArchitectureInfo } from "../../types";
import { FINGERPRINT_SPECIAL_VALUES, FingerprintSpecialValue } from "../../utils/consts";

export function collectArchitecture(): ArchitectureInfo {
  const architecture = getArchitecture();
  return { architecture };
}

function getArchitecture(): number | FingerprintSpecialValue {
  try {
    const f = new Float32Array(1);
    const u8 = new Uint8Array(f.buffer);

    f[0] = Infinity;
    f[0] = f[0] - f[0];

    return u8[3];
  } catch {
    return FINGERPRINT_SPECIAL_VALUES.ERROR;
  }
}
