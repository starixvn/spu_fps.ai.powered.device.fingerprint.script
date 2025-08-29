import { collectPlatform } from "./platform";
import { collectCpuClass } from "./cpuClass";
import { collectArchitecture } from "./architecture";
import { collectOSCpu } from "./osCpu";
import { collectHardwareConcurrency } from "./hardwareConcurrency";
import { collectDeviceMemory } from "./deviceMemory";
import type { HardwareGroupInfo } from "../../types";

export class HardwareFingerprint {
  public static async collect(): Promise<HardwareGroupInfo> {
    let platformResult, cpuClassResult, architectureResult, osCpuResult, hardwareConcurrencyResult, deviceMemoryResult;

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
      architectureResult = await collectArchitecture();
    } catch (error) {
      architectureResult = { architecture: "" };
    }

    try {
      osCpuResult = collectOSCpu();
    } catch (error) {
      osCpuResult = { oscpu: "" };
    }

    try {
      hardwareConcurrencyResult = await collectHardwareConcurrency();
    } catch (error) {
      hardwareConcurrencyResult = { hardwareConcurrency: "" };
    }

    try {
      deviceMemoryResult = await collectDeviceMemory();
    } catch (error) {
      deviceMemoryResult = { deviceMemory: "" };
    }

    const hardwareGroup: HardwareGroupInfo = {
      platform: platformResult.platform || "",
      cpuClass: cpuClassResult.cpuClass || "",
      architecture: architectureResult.architecture || "",
      oscpu: osCpuResult.oscpu || "",
      hardwareConcurrency: hardwareConcurrencyResult.hardwareConcurrency || "",
      deviceMemory: deviceMemoryResult.deviceMemory || "",
    };

    return hardwareGroup;
  }
}
