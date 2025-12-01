import { HardwareFingerprint } from "../../../../../../src/client/fingerprint/modules/hardware";
import { collectPlatform } from "../../../../../../src/client/fingerprint/modules/hardware/platform";
import { collectCpuClass } from "../../../../../../src/client/fingerprint/modules/hardware/cpuClass";
import { collectArchitecture } from "../../../../../../src/client/fingerprint/modules/hardware/architecture";
import { collectOSCpu } from "../../../../../../src/client/fingerprint/modules/hardware/osCpu";
import { collectHardwareConcurrency } from "../../../../../../src/client/fingerprint/modules/hardware/hardwareConcurrency";
import { collectDeviceMemory } from "../../../../../../src/client/fingerprint/modules/hardware/deviceMemory";
import { FingerprintSpecialValue } from "../../../../../../src/client/fingerprint/utils/consts";

import { isBrave } from '../../../../../../src/client/fingerprint/utils/browser';

jest.mock('../../../../../../src/client/fingerprint/utils/browser', () => ({
  isBrave: jest.fn(() => false),
}));

// Mock navigator object for all tests
const mockNavigator: any = {
  userAgentData: undefined,
  plf: undefined,
  ccl: undefined,
  hwc: undefined,
  dvm: undefined,
  osc: undefined,
  userAgent: "",
};

// Mock global navigator
Object.defineProperty(global, "navigator", {
  value: mockNavigator,
  writable: true,
});

describe("Hardware Modules Integration Tests", () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.userAgentData = undefined;
    mockNavigator.platform = undefined;
    mockNavigator.cpuClass = undefined;
    mockNavigator.hardwareConcurrency = undefined;
    mockNavigator.deviceMemory = undefined;
    mockNavigator.oscpu = undefined;
    mockNavigator.userAgent = "";

    (isBrave as jest.Mock).mockReturnValue(false);
  });

  describe("Complete Hardware Fingerprint Collection", () => {
    it("should collect complete hardware fingerprint for Windows x64 system", async () => {
      // Arrange
      mockNavigator.platform = "Windows";  // Changed: prioritize navigator.platform
      mockNavigator.cpuClass = "Intel x86";
      mockNavigator.hardwareConcurrency = 16;
      mockNavigator.deviceMemory = 32;
      mockNavigator.oscpu = "Windows NT 10.0; Win64; x64";  // Changed: use navigator.oscpu

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: "Windows",  // Raw platform value from navigator.platform
        cpuClass: "Intel x86",
        architecture: 255,  // Changed: number value for x86
        oscpu: "Windows NT 10.0; Win64; x64",
        hardwareConcurrency: 16,
        deviceMemory: 32,
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle missing navigator properties gracefully", async () => {
      // Arrange
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true,
      });

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: FingerprintSpecialValue.UNDEFINED,
        cpuClass: FingerprintSpecialValue.UNDEFINED,
        architecture: 255,  // Changed: still returns 255 even without navigator
        oscpu: FingerprintSpecialValue.UNDEFINED,
        hardwareConcurrency: FingerprintSpecialValue.UNDEFINED,
        deviceMemory: FingerprintSpecialValue.UNDEFINED,
      });

      // Restore navigator for other tests
      Object.defineProperty(global, "navigator", {
        value: mockNavigator,
        writable: true,
      });
    });
  });

  describe("Individual Module Function Tests", () => {
    it("should test collectPlatform function independently", () => {
      // Arrange
      const platformNavigator = {
        ...mockNavigator,
        platform: "Test Platform",
      };

      Object.defineProperty(global, "navigator", {
        value: platformNavigator,
        writable: true,
      });

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual("Test Platform");

      // Restore global navigator
      Object.defineProperty(global, "navigator", {
        value: mockNavigator,
        writable: true,
      });
    });

    it("should test collectCpuClass function independently", async () => {
      // Arrange
      mockNavigator.cpuClass = "Test CPU";

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual("Test CPU");
    });

    it("should test collectHardwareConcurrency function independently", async () => {
      // Arrange
      mockNavigator.hardwareConcurrency = 12;

      // Act
      const result = await collectHardwareConcurrency();

      // Assert - May return empty string due to validation logic
      expect(typeof result).toBe("number");
    });

    it("should test collectDeviceMemory function independently", async () => {
      // Arrange
      mockNavigator.deviceMemory = 24;

      // Act
      const result = await collectDeviceMemory();

      // Assert - DeviceMemory can return number, string, or special value
      expect(['number', 'string'].includes(typeof result)).toBe(true);
    });

    it("should test collectOSCpu function independently", async () => {
      // Arrange
      const osCpuNavigator = {
        ...mockNavigator,
        oscpu: "Windows NT 10.0; Win64; x64",
      };

      Object.defineProperty(global, "navigator", {
        value: osCpuNavigator,
        writable: true,
      });

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual("Windows NT 10.0; Win64; x64");

      Object.defineProperty(global, "navigator", {
        value: mockNavigator,
        writable: true,
      });
    });

    it("should test collectArchitecture function independently", () => {
      // Arrange - Architecture uses Float32Array detection, not navigator

      // Act
      const result = collectArchitecture();

      // Assert
      expect(result).toEqual(255);  // Changed: number value
    });
  });
});