interface DeviceMemoryResult {
  deviceMemory: number | string;
}

export function collectDeviceMemory(): DeviceMemoryResult {
  try {
    const deviceMemory = getDeviceMemory();
    console.log("DeviceMemory fingerprint collected:", { deviceMemory });

    return { deviceMemory };
  } catch (error) {
    console.error("Error collecting device memory:", error);
    return { deviceMemory: "unknown" };
  }
}

function getDeviceMemory(): number | string {
  try {
    if (navigator.deviceMemory) return navigator.deviceMemory;
    return "unknown";
  } catch {
    return "unknown";
  }
}
