import { FPSFingerprintClass } from "../../../../src/client/fingerprint";

// Mock only hardware module
jest.mock("../../../../src/client/fingerprint/modules/hardware");

const mockHardwareFingerprint = jest.mocked(
  require("../../../../src/client/fingerprint/modules/hardware")
    .HardwareFingerprint
);

describe("FPS Fingerprint Module - Hardware Tests", () => {
  let fpsFingerprint: FPSFingerprintClass;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup hardware mock return value
    mockHardwareFingerprint.collect.mockResolvedValue({
      platform: "Windows",
      cpuClass: "Intel x86",
      architecture: "x86_64",
      oscpu: "Windows NT 10.0; Win64; x64",
      hardwareConcurrency: 8,
      deviceMemory: 16,
    });

    // Create new instance for each test
    fpsFingerprint = new FPSFingerprintClass();
  });

  describe("FPSFingerprintClass - Hardware Collection", () => {
    it("should have correct version", () => {
      // Assert
      expect(fpsFingerprint.version).toBe("1.9.0");
    });

    describe("collect - Hardware Only", () => {
      it("should collect hardware fingerprint data successfully", async () => {
        // Act
        const result = await fpsFingerprint.collect();

        // Assert - Only check hardware part
        expect(result.HardwareFingerprint).toEqual({
          platform: "Windows",
          cpuClass: "Intel x86",
          architecture: "x86_64",
          oscpu: "Windows NT 10.0; Win64; x64",
          hardwareConcurrency: 8,
          deviceMemory: 16,
        });

        // Verify hardware collector was called
        expect(mockHardwareFingerprint.collect).toHaveBeenCalledTimes(1);
      });

      it("should call callback when provided", async () => {
        // Arrange
        const mockCallback = jest.fn();

        // Act
        await fpsFingerprint.collect(mockCallback);

        // Assert
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            HardwareFingerprint: expect.any(Object),
            timestamp: expect.any(String),
          })
        );
      });

      it("should not call callback when not provided", async () => {
        // Act
        await fpsFingerprint.collect();

        // Assert
        // No callback should be called
        expect(mockHardwareFingerprint.collect).toHaveBeenCalledTimes(1);
      });

      it("should handle hardware collection errors gracefully", async () => {
        // Arrange
        mockHardwareFingerprint.collect.mockRejectedValue(
          new Error("Hardware collection failed")
        );

        // Act & Assert
        await expect(fpsFingerprint.collect()).rejects.toThrow(
          "Hardware collection failed"
        );
      });
    });
  });
});
