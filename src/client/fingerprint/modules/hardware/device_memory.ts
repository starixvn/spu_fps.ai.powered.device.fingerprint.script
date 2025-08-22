interface DeviceMemoryResult {
  deviceMemory: number | string;
}

export async function collectDeviceMemory(): Promise<DeviceMemoryResult> {
  try {
    const deviceMemory = await getDeviceMemory();
    console.log("DeviceMemory fingerprint collected:", { deviceMemory });

    return { deviceMemory };
  } catch (error) {
    console.error("Error collecting device memory:", error);
    return { deviceMemory: "unknown" };
  }
}

async function getDeviceMemory(): Promise<number | string> {
  try {
    if (navigator.deviceMemory) return navigator.deviceMemory;
    return "unknown";
  } catch {
    return "unknown";
  }
}
