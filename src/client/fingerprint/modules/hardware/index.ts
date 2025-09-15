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
        plf: platformResult.plf || "",
        ccl: cpuClassResult.ccl || "",
        arc: architectureResult.arc || 0,
        osc: osCpuResult.osc || "",
        hwc: hardwareConcurrencyResult.hwc || "",
        dvm: deviceMemoryResult.dvm || "",
      };

      return hardwareGroup;
    } catch (error) {
      const platformResult = { plf: "" };
      const cpuClassResult = { ccl: "" };
      const architectureResult = { arc: 0 };

      const fallbackResult = {
        plf: platformResult.plf,
        ccl: cpuClassResult.ccl,
        arc: architectureResult.arc,
        osc: "",
        hwc: "",
        dvm: "",
      };
      return fallbackResult;
    }
  }
}
