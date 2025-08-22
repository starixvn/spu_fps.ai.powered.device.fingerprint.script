interface HardwareConcurrencyResult {
  hardwareConcurrency: number | string;
}

export async function collectHardwareConcurrency(): Promise<HardwareConcurrencyResult> {
  try {
    const hardwareConcurrency = await getHardwareConcurrency();
    console.log("HardwareConcurrency fingerprint collected:", {
      hardwareConcurrency,
    });

    return { hardwareConcurrency };
  } catch (error) {
    console.error("Error collecting hardware concurrency:", error);
    return { hardwareConcurrency: "unknown" };
  }
}

async function getHardwareConcurrency(): Promise<number | string> {
  try {
    if (navigator.hardwareConcurrency) return navigator.hardwareConcurrency;
    return "unknown";
  } catch {
    return "unknown";
  }
}
