import type { ArchitectureInfo } from "../../types";

export function collectArchitecture(): ArchitectureInfo {
  try {
    const arc = getArchitecture();
    return { arc };
  } catch (error) {
    return { arc: 0 };
  }
}

function getArchitecture(): number {
  try {
    const f = new Float32Array(1)
    const u8 = new Uint8Array(f.buffer)

    f[0] = Infinity
    f[0] = f[0] - f[0]

    return u8[3]
  } catch {
    return 0;
  }
}
