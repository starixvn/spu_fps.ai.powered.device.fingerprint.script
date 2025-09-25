import { collectDeviceMemory } from "../../../../../../src/client/fingerprint/modules/hardware/deviceMemory";
import { FingerprintSpecialValue } from "../../../../../../src/client/fingerprint/utils/consts";

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
    expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
  }, 30000); // Increase timeout

  it("should handle undefined navigator gracefully", async () => {
    Object.defineProperty(global, "navigator", {
      value: undefined,
      writable: true,
    });

    const result = await collectDeviceMemory();
    expect(result).toBe(FingerprintSpecialValue.ERROR);
  }, 30000);
});
