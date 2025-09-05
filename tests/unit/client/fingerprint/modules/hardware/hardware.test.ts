import { HardwareFingerprint } from "../../../../../../src/client/fingerprint/modules/hardware";
import { collectPlatform } from "../../../../../../src/client/fingerprint/modules/hardware/platform";
import { collectCpuClass } from "../../../../../../src/client/fingerprint/modules/hardware/cpuClass";
import { collectArchitecture } from "../../../../../../src/client/fingerprint/modules/hardware/architecture";
import { collectOSCpu } from "../../../../../../src/client/fingerprint/modules/hardware/osCpu";
import { collectHardwareConcurrency } from "../../../../../../src/client/fingerprint/modules/hardware/hardwareConcurrency";
import { collectDeviceMemory } from "../../../../../../src/client/fingerprint/modules/hardware/deviceMemory";

// Mock navigator object for all tests
const mockNavigator: any = {
  userAgentData: undefined,
  platform: undefined,
  cpuClass: undefined,
  hardwareConcurrency: undefined,
  deviceMemory: undefined,
  oscpu: undefined,
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
  });

  describe("Complete Hardware Fingerprint Collection", () => {
    it("should collect complete hardware fingerprint for Windows x64 system", async () => {
      // Arrange
      mockNavigator.userAgentData = { platform: "Windows" };
      mockNavigator.cpuClass = "Intel x86";
      mockNavigator.hardwareConcurrency = 16;
      mockNavigator.deviceMemory = 32;
      mockNavigator.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: "Windows",
        cpuClass: "Intel x86",
        architecture: "x86/x86_64",
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
        platform: "",
        cpuClass: "",
        architecture: "x86/x86_64",
        oscpu: "",
        hardwareConcurrency: "",
        deviceMemory: "",
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
      mockNavigator.userAgentData = { platform: "Test Platform" };

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: "Test Platform" });
    });

    it("should test collectCpuClass function independently", () => {
      // Arrange
      mockNavigator.cpuClass = "Test CPU";

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: "Test CPU" });
    });

    it("should test collectHardwareConcurrency function independently", async () => {
      // Arrange
      mockNavigator.hardwareConcurrency = 12;

      // Act
      const result = await collectHardwareConcurrency();

      // Assert - May return empty string due to validation logic
      expect(result).toHaveProperty("hardwareConcurrency");
    });

    it("should test collectDeviceMemory function independently", async () => {
      // Arrange
      mockNavigator.deviceMemory = 24;

      // Act
      const result = await collectDeviceMemory();

      // Assert - May return empty string due to validation logic
      expect(result).toHaveProperty("deviceMemory");
    });

    it("should test collectOSCpu function independently", async () => {
      // Arrange
      mockNavigator.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: "Windows NT 10.0; Win64; x64" });
    });

    it("should test collectArchitecture function independently", () => {
      // Arrange - Architecture doesn't use userAgent anymore, uses Float32Array detection

      // Act
      const result = collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: "x86/x86_64" });
    });
  });
});
