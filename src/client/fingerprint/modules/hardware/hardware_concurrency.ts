interface HardwareConcurrencyResult {
  hardwareConcurrency: number | string;
}

export function collectHardwareConcurrency(): HardwareConcurrencyResult {
  try {
    const hardwareConcurrency = getHardwareConcurrency();
    return { hardwareConcurrency };
  } catch (error) {
    console.error("Error collecting hardware concurrency:", error);
    return { hardwareConcurrency: "" };
  }
}

function getHardwareConcurrency(): number | string {
  try {
    if (navigator.hardwareConcurrency) return navigator.hardwareConcurrency;
    return "";
  } catch {
    return "";
  }
}
