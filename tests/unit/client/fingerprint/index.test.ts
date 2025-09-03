import { FingerprintClass } from "../../../../src/client/fingerprint";

// Mock all fingerprint modules
jest.mock("../../../../src/client/fingerprint/modules/hardware");
jest.mock("../../../../src/client/fingerprint/modules/graphics");
jest.mock("../../../../src/client/fingerprint/modules/audio");
jest.mock("../../../../src/client/fingerprint/modules/browser");
jest.mock("../../../../src/client/fingerprint/modules/preference");
jest.mock("../../../../src/client/fingerprint/modules/webrtc");

// Mock CONFIG from index
jest.mock("../../../../src/client/index", () => ({
  CONFIG: {
    ENCODING_KEY: "__ENCODE_KEY__",
    GATEWAY_URL: "__GATEWAY_URL__",
    ENDPOINTS: {
      F4: "/CheckFP4",
      F5: "/CheckFP5"
    },
    FIELD_NAMES: {
      DEVICE_INFO: "__di"
    }
  },
  FingerprintStep: jest.fn()
}));

const mockHardwareFingerprint = jest.mocked(
  require("../../../../src/client/fingerprint/modules/hardware").HardwareFingerprint
);
const mockGraphicsFingerprint = jest.mocked(
  require("../../../../src/client/fingerprint/modules/graphics").GraphicsFingerprint
);
const mockAudioFingerprint = jest.mocked(
  require("../../../../src/client/fingerprint/modules/audio").AudioFingerprint
);
const mockBrowserFingerprint = jest.mocked(
  require("../../../../src/client/fingerprint/modules/browser").BrowserFingerprint
);
const mockPreferencesFingerprint = jest.mocked(
  require("../../../../src/client/fingerprint/modules/preference").PreferencesFingerprint
);
const mockWebRTCFingerprint = jest.mocked(
  require("../../../../src/client/fingerprint/modules/webrtc").WebRTCFingerprint
);

describe("FPS Fingerprint Module Tests", () => {
  let fpsFingerprint: FingerprintClass;
  let mockInjectCallback: jest.Mock;

  // Mock fetch globally
  global.fetch = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock return values for all modules
    mockHardwareFingerprint.collect.mockResolvedValue({
      platform: "Windows",
      cpuClass: "Intel x86",
      architecture: "x86_64",
      oscpu: "Windows NT 10.0; Win64; x64",
      hardwareConcurrency: 8,
      deviceMemory: 16,
    });

    mockAudioFingerprint.collect.mockResolvedValue({
      audio: { audio: 0.12345, noiseType: "clean" },
      audioBaseLatency: 0.01
    });

    mockBrowserFingerprint.collect.mockResolvedValue({
      browserName: "Chrome",
      osName: "Windows",
      userAgent: "Mozilla/5.0...",
      vendor: "Google Inc.",
      vendorFlavors: ["chrome"],
      plugins: [],
      pdfViewerEnabled: true
    });

    mockPreferencesFingerprint.collect.mockResolvedValue({
      languages: ["en-US"],
      timezone: "America/New_York",
      touchSupport: false,
      cookiesEnabled: true,
      localStorage: true,
      sessionStorage: true,
      openDatabase: false,
      indexedDB: true
    });

    mockGraphicsFingerprint.collect.mockResolvedValue({
      canvas: { fingerprint: "canvas_hash", noiseType: "ok", width: 300, height: 150 },
      webglBasics: { vendor: "NVIDIA", renderer: "GTX 1080" },
      webglExtensions: { extensions: [], supportedExtensions: [] },
      fonts: { availableFonts: ["Arial", "Times"], fontList: [] },
      fontPreferences: { default: 16, apple: 16, serif: 16 },
      screenResolution: { width: 1920, height: 1080 },
      screenFrame: { frameWidth: 1920, frameHeight: 1080 },
      colorDepth: { colorDepth: 24, pixelDepth: 24 },
      colorGamut: { colorGamut: "srgb", supportedColorSpaces: ["srgb"] }
    });

    mockWebRTCFingerprint.collect.mockResolvedValue({
      localIPs: ["192.168.1.100"],
      publicIPs: [],
      relayIPs: [],
      flags: { isSupported: true, isBlocked: false, hasNoise: false, relayOnly: false },
      error: null,
      timestamp: new Date().toISOString()
    });

    // Mock fetch to return successful responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ success: true })
    });

    // Setup mock inject callback
    mockInjectCallback = jest.fn();

    // Create new instance for each test
    fpsFingerprint = new FingerprintClass();
  });

  afterEach(() => {
    // Clean up any global mocks
    jest.resetAllMocks();
  });

  afterAll(() => {
    // Restore global fetch if needed
    delete (global as any).fetch;
  });

  describe("FingerprintClass", () => {
    it("should have correct version", () => {
      expect(fpsFingerprint.version).toBe("1.9.0");
    });

    describe("processF4Data", () => {
      it("should process F4 data successfully", async () => {
        const sessionKey = "test-session-key";
        
        const result = await fpsFingerprint.processF4Data(sessionKey, mockInjectCallback);

        // Verify all F4 modules were called
        expect(mockAudioFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(mockBrowserFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(mockHardwareFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(mockPreferencesFingerprint.collect).toHaveBeenCalledTimes(1);

        // Verify callback was called with hash
        expect(mockInjectCallback).toHaveBeenCalledWith(
          expect.any(String),
          'F4'
        );

        // Verify fetch was called to send F4 payload
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/CheckFP4'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.any(String)
          })
        );

        // Result should contain combined attributes
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });

      it("should handle F4 collection errors gracefully", async () => {
        mockAudioFingerprint.collect.mockRejectedValue(new Error("Audio collection failed"));
        
        const sessionKey = "test-session-key";
        
        // Should not throw, but handle error gracefully
        const result = await fpsFingerprint.processF4Data(sessionKey, mockInjectCallback);
        expect(result).toBeUndefined();
      });
    });

    describe("processF5Data", () => {
      it("should process F5 data successfully", async () => {
        const sessionKey = "test-session-key";
        const f4Attributes = { platform: "Windows", browserName: "Chrome" };
        
        const result = await fpsFingerprint.processF5Data(sessionKey, f4Attributes, mockInjectCallback);

        // Verify graphics module was called
        expect(mockGraphicsFingerprint.collect).toHaveBeenCalledTimes(1);

        // Verify callback was called with hash
        expect(mockInjectCallback).toHaveBeenCalledWith(
          expect.any(String),
          'F5'
        );

        // Verify fetch was called to send F5 payload
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/CheckFP5'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.any(String)
          })
        );

        // Result should contain combined attributes (F4 + F5)
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });

      it("should handle F5 collection errors gracefully", async () => {
        mockGraphicsFingerprint.collect.mockRejectedValue(new Error("Graphics collection failed"));
        
        const sessionKey = "test-session-key";
        const f4Attributes = { platform: "Windows" };
        
        // Should not throw, but handle error gracefully
        const result = await fpsFingerprint.processF5Data(sessionKey, f4Attributes, mockInjectCallback);
        expect(result).toBeUndefined();
      });
    });

    describe("collectWebRTC", () => {
      it("should collect WebRTC data successfully", async () => {
        const result = await fpsFingerprint.collectWebRTC();

        expect(mockWebRTCFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          localIPs: ["192.168.1.100"],
          publicIPs: [],
          relayIPs: [],
          flags: { isSupported: true, isBlocked: false, hasNoise: false, relayOnly: false },
          error: null,
          timestamp: expect.any(String)
        });
      });

      it("should handle WebRTC collection errors gracefully", async () => {
        mockWebRTCFingerprint.collect.mockRejectedValue(new Error("WebRTC collection failed"));
        
        const result = await fpsFingerprint.collectWebRTC();
        
        // Should return fallback object
        expect(result).toEqual({ webrtc: {} });
      });
    });

    describe("start", () => {
      it("should execute complete fingerprint collection process", async () => {
        const sessionKey = "test-session-key";
        
        const result = await fpsFingerprint.start(sessionKey, mockInjectCallback);

        // Verify all collection methods were called
        expect(mockAudioFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(mockBrowserFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(mockHardwareFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(mockPreferencesFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(mockGraphicsFingerprint.collect).toHaveBeenCalledTimes(1);
        expect(mockWebRTCFingerprint.collect).toHaveBeenCalledTimes(1);

        // Verify callback was called for both F4 and F5
        expect(mockInjectCallback).toHaveBeenCalledTimes(2);
        expect(mockInjectCallback).toHaveBeenNthCalledWith(1, expect.any(String), 'F4');
        expect(mockInjectCallback).toHaveBeenNthCalledWith(2, expect.any(String), 'F5');

        // Verify both F4 and F5 endpoints were called
        expect(global.fetch).toHaveBeenCalledTimes(2);

        // Verify result structure
        expect(result).toEqual({
          f4: expect.any(Object),
          f5: expect.any(Object),
          webrtc: expect.any(Object),
          sessionKey: sessionKey
        });
      });

      // it("should handle errors in start process gracefully", async () => {
      //   mockAudioFingerprint.collect.mockRejectedValue(new Error("Collection failed"));
        
      //   const sessionKey = "test-session-key";
        
      //   await expect(fpsFingerprint.start(sessionKey, mockInjectCallback)).rejects.toThrow();
      // });

      it("should store data in window object when available", async () => {
        // Mock window object
        const mockWindow = {} as any;
        (global as any).window = mockWindow;
        
        const sessionKey = "test-session-key";
        
        await fpsFingerprint.start(sessionKey, mockInjectCallback);

        // Verify window storage
        expect(mockWindow.f4Attributes).toBeDefined();
        expect(mockWindow.f5Attributes).toBeDefined();
        expect(mockWindow.webrtcData).toBeDefined();
        
        // Clean up
        delete (global as any).window;
      });

      it("should not crash when window is undefined", async () => {
        // Ensure window is undefined
        delete (global as any).window;
        
        const sessionKey = "test-session-key";
        
        // Should not throw error
        await expect(fpsFingerprint.start(sessionKey, mockInjectCallback)).resolves.toBeDefined();
      });
    });

    describe("Network requests", () => {
      // it("should handle network failures gracefully", async () => {
      //   (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
        
      //   const sessionKey = "test-session-key";
        
      //   // Should not throw, network errors should be handled internally
      //   const result = await fpsFingerprint.processF4Data(sessionKey, mockInjectCallback);
      //   expect(result).toBeUndefined();
      // });

      // it("should handle non-ok response status", async () => {
      //   (global.fetch as jest.Mock).mockResolvedValue({
      //     ok: false,
      //     status: 500,
      //     statusText: "Internal Server Error"
      //   });
        
      //   const sessionKey = "test-session-key";
        
      //   // Should not throw, non-ok responses should be handled internally
      //   const result = await fpsFingerprint.processF4Data(sessionKey, mockInjectCallback);
      //   expect(result).toBeUndefined();
      // });
    });
  });
});
