import type { ArchitectureInfo } from "../../types";

export function collectArchitecture(): ArchitectureInfo {
  try {
    const architecture = getArchitecture();
    return { architecture };
  } catch (error) {
    return { architecture: "" };
  }
}

function getArchitecture(): string {
  try {
    const f = new Float32Array(1);
    const u8 = new Uint8Array(f.buffer);

    f[0] = Infinity;
    f[0] = f[0] - f[0]; // NaN

    if (u8[3] === 255) return "x86/x86_64";

    return "non-x86";
  } catch {
    return "";
  }
}
