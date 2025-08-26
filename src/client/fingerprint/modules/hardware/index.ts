import { collectPlatform } from "./platform";
import { collectCpuClass } from "./cpu_class";
import { collectArchitecture } from "./architecture";
import { collectOSCpu } from "./os_cpu";
import { collectHardwareConcurrency } from "./hardware_concurrency";
import { collectDeviceMemory } from "./device_memory";
import type { HardwareGroupResult } from "../../types";

export class HardwareFingerprint {
  public static async collect(): Promise<HardwareGroupResult> {
    try {
      console.log("Starting hardware fingerprint collection...");

      const platformResult = collectPlatform();
      const cpuClassResult = collectCpuClass();
      const architectureResult = await collectArchitecture();
      const osCpuResult = collectOSCpu();
      const hardwareConcurrencyResult = collectHardwareConcurrency();
      const deviceMemoryResult = collectDeviceMemory();

      const hardwareGroup: HardwareGroupResult = {
        platform: platformResult.platform,
        cpuClass: cpuClassResult.cpuClass || "",
        architecture: architectureResult.architecture,
        oscpu: osCpuResult.oscpu,
        hardwareConcurrency: hardwareConcurrencyResult.hardwareConcurrency,
        deviceMemory: deviceMemoryResult.deviceMemory,
      };

      console.log("Hardware fingerprint collected:", hardwareGroup);
      return hardwareGroup;
    } catch (error) {
      console.error("Error collecting hardware fingerprint:", error);

      return {
        platform: "",
        cpuClass: "",
        architecture: "",
        oscpu: "",
        hardwareConcurrency: 0,
        deviceMemory: 0,
      };
    }
  }
}

export {
  collectPlatform,
  collectCpuClass,
  collectArchitecture,
  collectOSCpu,
  collectHardwareConcurrency,
  collectDeviceMemory,
};
