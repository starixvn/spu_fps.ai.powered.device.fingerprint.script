interface HardwareConcurrencyResult {
  hardwareConcurrency: number | string;
}

export function collectHardwareConcurrency(): HardwareConcurrencyResult {
  try {
    const hardwareConcurrency = getHardwareConcurrency();
    console.log("HardwareConcurrency fingerprint collected:", {
      hardwareConcurrency,
    });

    return { hardwareConcurrency };
  } catch (error) {
    console.error("Error collecting hardware concurrency:", error);
    return { hardwareConcurrency: "unknown" };
  }
}

function getHardwareConcurrency(): number | string {
  try {
    if (navigator.hardwareConcurrency) return navigator.hardwareConcurrency;
    return "unknown";
  } catch {
    return "unknown";
  }
}
