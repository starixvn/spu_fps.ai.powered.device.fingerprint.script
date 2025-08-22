export function collectDeviceMemory(): {
  deviceMemory: number | string;
} {
  const deviceMemory = getDeviceMemory();
  console.log("DeviceMemory fingerprint collected:", {
    deviceMemory,
  });
  return {
    deviceMemory,
  };
}

function getDeviceMemory(): number | string {
  try {
    if (navigator.deviceMemory) {
      return navigator.deviceMemory;
    }
    return "unknown";
  } catch (e) {
    return "unknown";
  }
}
