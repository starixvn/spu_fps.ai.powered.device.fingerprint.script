import { collectDeviceMemory } from "../../../../../../src/client/fingerprint/modules/hardware/deviceMemory";
import { FINGERPRINT_SPECIAL_VALUES } from "../../../../../../src/client/fingerprint/utils/consts";

describe("Hardware Device Memory Module", () => {
  let originalNavigator: any;

  beforeAll(() => {
    originalNavigator = Object.getOwnPropertyDescriptor(global, "navigator");
  });

  afterAll(() => {
    if (originalNavigator) {
      Object.defineProperty(global, "navigator", originalNavigator);
    }
  });

  beforeEach(() => {
    Object.defineProperty(global, "navigator", {
      value: { dvm: undefined },
      writable: true,
    });
  });

  it("should return empty string when deviceMemory property is missing", async () => {
    const result = await collectDeviceMemory();
    expect(result).toHaveProperty("deviceMemory", FINGERPRINT_SPECIAL_VALUES.UNDEFINED);
  }, 30000); // Increase timeout

  it("should handle undefined navigator gracefully", async () => {
    Object.defineProperty(global, "navigator", {
      value: undefined,
      writable: true,
    });

    const result = await collectDeviceMemory();
    expect(result.deviceMemory).toBe(FINGERPRINT_SPECIAL_VALUES.ERROR);
  }, 30000);
});
