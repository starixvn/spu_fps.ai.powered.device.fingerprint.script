import { collectPlatform } from "./platform";
import { collectCpuClass } from "./cpuClass";
import { collectArchitecture } from "./architecture";
import { collectOSCpu } from "./osCpu";
import { collectHardwareConcurrency } from "./hardwareConcurrency";
import { collectDeviceMemory } from "./deviceMemory";
import type { HardwareGroupInfo } from "../../types";

export class HardwareFingerprint {
  public static async collect(): Promise<HardwareGroupInfo> {
    try {
      const platformResult = collectPlatform();
      const cpuClassResult = collectCpuClass();
      const architectureResult = collectArchitecture();
      const osCpuResult = await collectOSCpu();
      const hardwareConcurrencyResult = await collectHardwareConcurrency();
      const deviceMemoryResult = await collectDeviceMemory();

      const hardwareGroup: HardwareGroupInfo = {
        platform: platformResult.platform || "",
        cpuClass: cpuClassResult.cpuClass || "",
        architecture: architectureResult.architecture || 0,
        oscpu: osCpuResult.oscpu || "",
        hardwareConcurrency: hardwareConcurrencyResult.hardwareConcurrency || "",
        deviceMemory: deviceMemoryResult.deviceMemory || "",
      };

      return hardwareGroup;
    } catch (error) {
      const platformResult = { platform: "" };
      const cpuClassResult = { cpuClass: "" };
      const architectureResult = { architecture: 0 };

      const fallbackResult = {
        platform: platformResult.platform,
        cpuClass: cpuClassResult.cpuClass,
        architecture: architectureResult.architecture,
        oscpu: "",
        hardwareConcurrency: "",
        deviceMemory: "",
      };
      return fallbackResult;
    }
  }
}
