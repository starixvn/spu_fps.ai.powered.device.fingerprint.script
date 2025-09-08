import { collectPlatform } from "./platform";
import { collectCpuClass } from "./cpuClass";
import { collectArchitecture } from "./architecture";
import { collectOSCpu } from "./osCpu";
import { collectHardwareConcurrency } from "./hardwareConcurrency";
import { collectDeviceMemory } from "./deviceMemory";
import type { HardwareGroupInfo } from "../../types";

export class HardwareFingerprint {
  public static collect(): Promise<HardwareGroupInfo> {
    let platformResult, cpuClassResult, architectureResult;

    try {
      platformResult = collectPlatform();
    } catch (error) {
      platformResult = { platform: "" };
    }

    try {
      cpuClassResult = collectCpuClass();
    } catch (error) {
      cpuClassResult = { cpuClass: "" };
    }

    try {
      architectureResult = collectArchitecture();
    } catch (error) {
      architectureResult = { architecture: 0 };
    }

    return collectOSCpu().then(function(osCpuResult) {
      return collectHardwareConcurrency().then(function(hardwareConcurrencyResult) {
        return collectDeviceMemory().then(function(deviceMemoryResult) {
          const hardwareGroup: HardwareGroupInfo = {
            platform: platformResult.platform || "",
            cpuClass: cpuClassResult.cpuClass || "",
            architecture: architectureResult.architecture || 0,
            oscpu: osCpuResult.oscpu || "",
            hardwareConcurrency: hardwareConcurrencyResult.hardwareConcurrency || "",
            deviceMemory: deviceMemoryResult.deviceMemory || "",
          };
          return hardwareGroup;
        });
      });
    }).catch(function(error) {
      const hardwareGroup: HardwareGroupInfo = {
        platform: platformResult.platform || "",
        cpuClass: cpuClassResult.cpuClass || "",
        architecture: architectureResult.architecture || 0,
        oscpu: "",
        hardwareConcurrency: "",
        deviceMemory: "",
      };
      return hardwareGroup;
    });
  }
}
