export function collectHardwareConcurrency(): {
  hardwareConcurrency: number | string;
} {
  const hardwareConcurrency = getHardwareConcurrency();
  console.log("HardwareConcurrency fingerprint collected:", {
    hardwareConcurrency,
  });
  return {
    hardwareConcurrency,
  };
}

function getHardwareConcurrency(): number | string {
  try {
    if (navigator.hardwareConcurrency) {
      return navigator.hardwareConcurrency;
    }
    return "unknown";
  } catch (e) {
    return "unknown";
  }
}
