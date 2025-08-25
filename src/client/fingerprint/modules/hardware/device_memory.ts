interface DeviceMemoryResult {
  deviceMemory: number | string;
}

export function collectDeviceMemory(): DeviceMemoryResult {
  try {
    const deviceMemory = getDeviceMemory();
    return { deviceMemory };
  } catch (error) {
    console.error("Error collecting device memory:", error);
    return { deviceMemory: "" };
  }
}

function getDeviceMemory(): number | string {
  try {
    if (navigator.deviceMemory) return navigator.deviceMemory;
    return "";
  } catch {
    return "";
  }
}
