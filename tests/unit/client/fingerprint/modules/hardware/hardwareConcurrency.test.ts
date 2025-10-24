import { collectHardwareConcurrency } from "../../../../../../src/client/fingerprint/modules/hardware/hardwareConcurrency";
import { isBrave } from "../../../../../../src/client/fingerprint/utils/browser";
import { FingerprintSpecialValue } from "../../../../../../src/client/fingerprint/utils/consts";

jest.mock('../../../../../../src/client/fingerprint/utils/browser', () => ({
  isBrave: jest.fn(() => false),
}));

// Mock navigator object
const mockNavigator: any = {
  hwc: undefined,
};

// Mock global navigator
Object.defineProperty(global, "navigator", {
  value: mockNavigator,
  writable: true,
});

describe("Hardware Concurrency Module", () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.hardwareConcurrency = undefined;

    (isBrave as jest.Mock).mockReturnValue(false);
  });

  describe("collectHardwareConcurrency", () => {
    it("should return empty string when hardwareConcurrency property is missing", async () => {
      // Arrange
      delete mockNavigator.hardwareConcurrency;

      // Act
      const result = await collectHardwareConcurrency();

      // Assert
      expect(result).toEqual(FingerprintSpecialValue.UNDEFINED);
    }, 30000); // Increase timeout

    it("should handle undefined navigator gracefully", async () => {
      // Arrange
      Object.defineProperty(global, "navigator", {
        value: undefined,
        writable: true,
      });

      // Act
      const result = await collectHardwareConcurrency();

      // Assert
      expect(result).toEqual(FingerprintSpecialValue.ERROR);

      // Restore navigator for other tests
      Object.defineProperty(global, "navigator", {
        value: mockNavigator,
        writable: true,
      });
    }, 30000);
  });
});
