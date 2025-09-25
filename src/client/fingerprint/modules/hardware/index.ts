import { collectPlatform } from "./platform";
import { collectCpuClass } from "./cpuClass";
import { collectArchitecture } from "./architecture";
import { collectOSCpu } from "./osCpu";
import { collectHardwareConcurrency } from "./hardwareConcurrency";
import { collectDeviceMemory } from "./deviceMemory";
import type { HardwareGroupInfo } from "../../types";

export class HardwareFingerprint {
  public static async collect(): Promise<HardwareGroupInfo> {
    const platformResult = collectPlatform();
    const cpuClassResult = collectCpuClass();
    const architectureResult = collectArchitecture();
    const osCpuResult = await collectOSCpu();
    const hardwareConcurrencyResult = await collectHardwareConcurrency();
    const deviceMemoryResult = await collectDeviceMemory();

    const hardwareGroup: HardwareGroupInfo = {
      platform: platformResult,
      cpuClass: cpuClassResult,
      architecture: architectureResult,
      oscpu: osCpuResult,
      hardwareConcurrency: hardwareConcurrencyResult,
      deviceMemory: deviceMemoryResult,
    };

    return hardwareGroup;
  }
}
