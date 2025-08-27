import { collectPlatform } from "./platform";
import { collectCpuClass } from "./cpu_class";
import { collectArchitecture } from "./architecture";
import { collectOSCpu } from "./os_cpu";
import { collectHardwareConcurrency } from "./hardware_concurrency";
import { collectDeviceMemory } from "./device_memory";
import type { HardwareGroupResult } from "../../types";

export class HardwareFingerprint {
  public static async collect(): Promise<HardwareGroupResult> {
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
      hardwareConcurrencyResult = collectHardwareConcurrency();
    } catch (error) {
      hardwareConcurrencyResult = { hardwareConcurrency: "" };
    }

    try {
      deviceMemoryResult = collectDeviceMemory();
    } catch (error) {
      deviceMemoryResult = { deviceMemory: "" };
    }

    const hardwareGroup: HardwareGroupResult = {
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
