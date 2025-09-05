// Mock all dependencies BEFORE importing
jest.mock('../../../../src/client/fingerprint/modules/graphics', () => ({
  GraphicsFingerprint: {
    collect: jest.fn()
  }
}));

jest.mock('../../../../src/client/fingerprint/utils/hash', () => ({
  MurmurHash128: {
    hash128: jest.fn()
  },
  Base64Encoder: {
    encodeBase64: jest.fn()
  }
}));

// Mock CONFIG before any imports
jest.mock('../../../../src/client/index', () => ({
  CONFIG: {
    ENCODING_KEY: "__ENCODE_KEY__",
    GATEWAY_URL: "__GATEWAY_URL__",
    ENDPOINTS: {
      F4: "/meta_data",
      F5: "/logs_sync"
    },
    FIELD_NAMES: {
      DEVICE_INFO: "__di"
    }
  },
  FingerprintStep: 'F5'
}));

import { F5Fingerprint } from '../../../../src/client/fingerprint/f5Fingerprint';

// Import the mocked modules
import { GraphicsFingerprint } from '../../../../src/client/fingerprint/modules/graphics';
import { MurmurHash128, Base64Encoder } from '../../../../src/client/fingerprint/utils/hash';
import { CONFIG } from '../../../../src/client/index';

// Get mocked instances with any type to avoid strict typing issues
const mockGraphicsFingerprint = GraphicsFingerprint as any;
const mockMurmurHash = MurmurHash128 as any;
const mockBase64Encoder = Base64Encoder as any;

// Mock CONFIG
const mockCONFIG = {
  ENCODING_KEY: "__ENCODE_KEY__",
  GATEWAY_URL: "__GATEWAY_URL__",
  ENDPOINTS: {
    F4: "/meta_data",
    F5: "/logs_sync"
  }
};

// Mock global window object
Object.defineProperty(global, 'window', {
  value: {
    navigator: {
      sendBeacon: jest.fn()
    },
    fetch: jest.fn()
  },
  writable: true,
  configurable: true
});

// Mock global navigator and fetch
global.navigator = {
  sendBeacon: jest.fn()
} as any;

global.fetch = jest.fn();

describe('F5Fingerprint', () => {
  let f5Fingerprint: F5Fingerprint;
  let mockInjectCallback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    f5Fingerprint = new F5Fingerprint();
    mockInjectCallback = jest.fn();

    // Setup default mock return values
    mockGraphicsFingerprint.collect.mockResolvedValue({
      canvas: {
        basicTest: "test-canvas-fingerprint",
        textTest: "text-rendering-fingerprint", 
        geometryTest: "geometry-fingerprint"
      },
      webglBasics: {
        vendor: "Intel Inc.",
        renderer: "ANGLE (Intel, Mesa Intel(R) HD Graphics 620)",
        version: "WebGL 1.0",
        shadingLanguageVersion: "WebGL GLSL ES 1.0"
      },
      webglExtensions: [
        "ANGLE_instanced_arrays",
        "EXT_blend_minmax",
        "OES_element_index_uint"
      ],
      fonts: {
        availableFonts: ["Arial", "Times New Roman", "Helvetica"],
        fontRendering: "standard-rendering-fingerprint"
      },
      supportedFormats: {
        audio: ["mp3", "wav"],
        video: ["mp4", "webm"], 
        image: ["png", "jpeg", "webp"]
      }
    });

    mockMurmurHash.hash128.mockReturnValue('mocked-f5-hash-value');
    mockBase64Encoder.encodeBase64.mockReturnValue('mocked-f5-encoded-data');

    // Mock sendBeacon and fetch
    (global.navigator.sendBeacon as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  describe('Constructor', () => {
    it('should initialize with correct step and endpoint', () => {
      expect((f5Fingerprint as any).step).toBe('F5');
      expect((f5Fingerprint as any).endpoint).toBe('/logs_sync');
      expect(f5Fingerprint.version).toBe('1.9.0');
    });
  });

  describe('collectData', () => {
    it('should collect graphics data successfully', async () => {
      // Act
      const result = await (f5Fingerprint as any).collectData();

      // Assert
      expect(result).toEqual({
        graphics: {
          canvas: {
            basicTest: "test-canvas-fingerprint",
            textTest: "text-rendering-fingerprint", 
            geometryTest: "geometry-fingerprint"
          },
          webglBasics: {
            vendor: "Intel Inc.",
            renderer: "ANGLE (Intel, Mesa Intel(R) HD Graphics 620)",
            version: "WebGL 1.0",
            shadingLanguageVersion: "WebGL GLSL ES 1.0"
          },
          webglExtensions: [
            "ANGLE_instanced_arrays",
            "EXT_blend_minmax",
            "OES_element_index_uint"
          ],
          fonts: {
            availableFonts: ["Arial", "Times New Roman", "Helvetica"],
            fontRendering: "standard-rendering-fingerprint"
          },
          supportedFormats: {
            audio: ["mp3", "wav"],
            video: ["mp4", "webm"], 
            image: ["png", "jpeg", "webp"]
          }
        }
      });

      expect(mockGraphicsFingerprint.collect).toHaveBeenCalledTimes(1);
    });

    it('should handle graphics collection failure', async () => {
      // Arrange
      mockGraphicsFingerprint.collect.mockRejectedValue(new Error('Graphics collection failed'));

      // Act & Assert
      await expect((f5Fingerprint as any).collectData()).rejects.toThrow('Graphics collection failed');
    });

    it('should handle empty graphics data', async () => {
      // Arrange
      mockGraphicsFingerprint.collect.mockResolvedValue({});

      // Act
      const result = await (f5Fingerprint as any).collectData();

      // Assert
      expect(result).toEqual({
        graphics: {}
      });
    });

    it('should handle null graphics data', async () => {
      // Arrange
      mockGraphicsFingerprint.collect.mockResolvedValue(null);

      // Act
      const result = await (f5Fingerprint as any).collectData();

      // Assert
      expect(result).toEqual({
        graphics: null
      });
    });
  });

  describe('extractAttributes', () => {
    it('should extract graphics attributes without F4 attributes', () => {
      // Arrange
      const mockData = {
        graphics: {
          canvasFingerprint: 'canvas-123',
          webglRenderer: 'Intel HD',
          screenResolution: '1920x1080',
          colorDepth: 24
        }
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData);

      // Assert
      expect(result).toEqual({
        canvasFingerprint: 'canvas-123',
        webglRenderer: 'Intel HD',
        screenResolution: '1920x1080',
        colorDepth: 24
      });
    });

    it('should merge F4 attributes with F5 graphics attributes', () => {
      // Arrange
      const mockData = {
        graphics: {
          canvasFingerprint: 'canvas-123',
          webglRenderer: 'Intel HD',
          screenResolution: '1920x1080'
        }
      };

      const f4Attributes = {
        userAgent: 'Chrome/90.0',
        platform: 'Win32',
        audioCodecs: ['mp3', 'wav'],
        timezone: 'UTC'
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData, f4Attributes);

      // Assert
      expect(result).toEqual({
        userAgent: 'Chrome/90.0',
        platform: 'Win32',
        audioCodecs: ['mp3', 'wav'],
        timezone: 'UTC',
        canvasFingerprint: 'canvas-123',
        webglRenderer: 'Intel HD',
        screenResolution: '1920x1080'
      });
    });

    it('should handle F5 attributes overriding F4 attributes', () => {
      // Arrange
      const mockData = {
        graphics: {
          platform: 'Graphics-Platform', // Should override F4 platform
          canvasFingerprint: 'canvas-123',
          screenResolution: '1920x1080'
        }
      };

      const f4Attributes = {
        platform: 'F4-Platform',
        userAgent: 'Chrome/90.0',
        audioCodecs: ['mp3']
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData, f4Attributes);

      // Assert
      expect(result).toEqual({
        platform: 'Graphics-Platform', // F5 should override F4
        userAgent: 'Chrome/90.0',
        audioCodecs: ['mp3'],
        canvasFingerprint: 'canvas-123',
        screenResolution: '1920x1080'
      });
    });

    it('should handle empty graphics data with F4 attributes', () => {
      // Arrange
      const mockData = { graphics: {} };
      const f4Attributes = {
        userAgent: 'Chrome/90.0',
        platform: 'Win32'
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData, f4Attributes);

      // Assert
      expect(result).toEqual({
        userAgent: 'Chrome/90.0',
        platform: 'Win32'
      });
    });

    it('should handle null graphics data', () => {
      // Arrange
      const mockData = { graphics: null };
      const f4Attributes = { userAgent: 'Chrome' };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData, f4Attributes);

      // Assert
      expect(result).toEqual({
        userAgent: 'Chrome'
      });
    });

    it('should handle undefined F4 attributes', () => {
      // Arrange
      const mockData = {
        graphics: {
          canvasFingerprint: 'canvas-123',
          webglRenderer: 'Intel HD'
        }
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData, undefined);

      // Assert
      expect(result).toEqual({
        canvasFingerprint: 'canvas-123',
        webglRenderer: 'Intel HD'
      });
    });
  });

  describe('buildPayload', () => {
    it('should build correct F5 payload structure', () => {
      // Arrange
      const sessionKey = 'test-f5-session-key';
      const fingerprintData = {
        graphics: {
          canvasFingerprint: 'canvas-123',
          webglRenderer: 'Intel HD Graphics',
          screenResolution: '1920x1080',
          colorDepth: 24
        }
      };
      const hashed = 'test-f5-hash';

      mockBase64Encoder.encodeBase64.mockReturnValue('encoded-graphics-data');

      // Act
      const result = (f5Fingerprint as any).buildPayload(sessionKey, fingerprintData, hashed);

      // Assert
      expect(result).toBe('encoded-graphics-data');
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledTimes(1);
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledWith(
        JSON.stringify({sk: sessionKey, fp: {gp: JSON.stringify(fingerprintData.graphics)}, hs: hashed}),
        CONFIG.ENCODING_KEY
      );
    });

    it('should handle empty graphics data in payload', () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const fingerprintData = { graphics: {} };
      const hashed = 'test-hash';

      mockBase64Encoder.encodeBase64.mockReturnValue('encoded-empty-graphics');

      // Act
      const result = (f5Fingerprint as any).buildPayload(sessionKey, fingerprintData, hashed);

      // Assert
      expect(result).toBe('encoded-empty-graphics');
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledWith(
        JSON.stringify({sk: sessionKey, fp: {gp: JSON.stringify({})}, hs: hashed}),
        CONFIG.ENCODING_KEY
      );
    });

    it('should handle null graphics data in payload', () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const fingerprintData = { graphics: null };
      const hashed = 'test-hash';

      mockBase64Encoder.encodeBase64.mockReturnValue('encoded-null-graphics');

      // Act
      const result = (f5Fingerprint as any).buildPayload(sessionKey, fingerprintData, hashed);

      // Assert
      expect(result).toBe('encoded-null-graphics');
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledWith(
        JSON.stringify({sk: sessionKey, fp: {gp: JSON.stringify(null)}, hs: hashed}),
        CONFIG.ENCODING_KEY
      );
    });
  });

  describe('processF5Data', () => {
    it('should process F5 data with F4 attributes and return combined attributes', async () => {
      // Arrange
      const sessionKey = 'test-f5-session-key';
      const f4Attributes = {
        userAgent: 'Chrome/90.0',
        platform: 'Win32',
        audioCodecs: ['mp3']
      };

      const expectedCombinedAttributes = {
        userAgent: 'Chrome/90.0',
        platform: 'Win32',
        audioCodecs: ['mp3'],
        canvasFingerprint: 'canvas-123',
        webglRenderer: 'Intel HD',
        screenResolution: '1920x1080'
      };

      // Mock the process method to return expected result
      jest.spyOn(f5Fingerprint as any, 'process').mockResolvedValue({
        attributes: expectedCombinedAttributes,
        hashed: 'test-f5-hash',
        step: 'F5'
      });

      // Act
      const result = await f5Fingerprint.processF5Data(sessionKey, f4Attributes, mockInjectCallback);

      // Assert
      expect(result).toEqual(expectedCombinedAttributes);
      expect((f5Fingerprint as any).process).toHaveBeenCalledWith(
        sessionKey,
        mockInjectCallback,
        f4Attributes
      );
      expect((window as any).f5Attributes).toEqual(expectedCombinedAttributes);
    });

    it('should handle F5 processing without F4 attributes', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const f4Attributes = {};

      const expectedAttributes = {
        canvasFingerprint: 'canvas-123',
        webglRenderer: 'Intel HD'
      };

      jest.spyOn(f5Fingerprint as any, 'process').mockResolvedValue({
        attributes: expectedAttributes,
        hashed: 'test-hash',
        step: 'F5'
      });

      // Act
      const result = await f5Fingerprint.processF5Data(sessionKey, f4Attributes, mockInjectCallback);

      // Assert
      expect(result).toEqual(expectedAttributes);
      expect((window as any).f5Attributes).toEqual(expectedAttributes);
    });

    it('should handle process errors gracefully', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const f4Attributes = { userAgent: 'Chrome' };
      const error = new Error('F5 Process failed');

      jest.spyOn(f5Fingerprint as any, 'process').mockRejectedValue(error);

      // Act & Assert
      await expect(f5Fingerprint.processF5Data(sessionKey, f4Attributes, mockInjectCallback))
        .rejects.toThrow('F5 Process failed');
    });

    it('should not throw when window is undefined', async () => {
      // Arrange
      const originalWindow = global.window;
      (global as any).window = undefined;

      const sessionKey = 'test-session-key';
      const f4Attributes = { userAgent: 'Chrome' };
      const expectedAttributes = { graphics: 'data' };

      jest.spyOn(f5Fingerprint as any, 'process').mockResolvedValue({
        attributes: expectedAttributes,
        hashed: 'test-hash',
        step: 'F5'
      });

      // Act & Assert
      await expect(f5Fingerprint.processF5Data(sessionKey, f4Attributes, mockInjectCallback))
        .resolves.toEqual(expectedAttributes);

      // Cleanup
      global.window = originalWindow;
    });

    it('should set window.f5Attributes correctly', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const f4Attributes = { userAgent: 'Chrome' };
      const expectedAttributes = {
        userAgent: 'Chrome',
        canvasFingerprint: 'canvas-hash'
      };

      jest.spyOn(f5Fingerprint as any, 'process').mockResolvedValue({
        attributes: expectedAttributes,
        hashed: 'test-hash',
        step: 'F5'
      });

      // Act
      await f5Fingerprint.processF5Data(sessionKey, f4Attributes, mockInjectCallback);

      // Assert
      expect((window as any).f5Attributes).toEqual(expectedAttributes);
    });
  });

  describe('Integration with AbstractFingerprint', () => {
    it('should pass F4 attributes correctly to extractAttributes', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const f4Attributes = {
        userAgent: 'Chrome/90.0',
        platform: 'Win32'
      };

      const extractAttributesSpy = jest.spyOn(f5Fingerprint as any, 'extractAttributes');
      jest.spyOn(f5Fingerprint as any, 'collectData').mockResolvedValue({ graphics: {} });
      jest.spyOn(f5Fingerprint as any, 'generateGroupHashes').mockReturnValue('hash');
      jest.spyOn(f5Fingerprint as any, 'buildPayload').mockReturnValue({});
      jest.spyOn(f5Fingerprint as any, 'sendToServer').mockResolvedValue(true);

      // Act
      await (f5Fingerprint as any).process(sessionKey, mockInjectCallback, f4Attributes);

      // Assert
      expect(extractAttributesSpy).toHaveBeenCalledWith(
        { graphics: {} },
        f4Attributes
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate graphics collection errors', async () => {
      // Arrange
      const error = new Error('Graphics module not supported');
      mockGraphicsFingerprint.collect.mockRejectedValue(error);

      // Act & Assert
      await expect((f5Fingerprint as any).collectData()).rejects.toThrow('Graphics module not supported');
    });

    // it('should handle encoding errors in buildPayload', () => {
    //   // Arrange
    //   const sessionKey = 'test-session-key';
    //   const fingerprintData = { graphics: { circular: {} } };
    //   fingerprintData.graphics.circular = fingerprintData.graphics; // Create circular reference
    //   const hashed = 'test-hash';

    //   mockBase64Encoder.encodeBase64.mockImplementation(() => {
    //     throw new Error('JSON.stringify failed on circular reference');
    //   });

    //   // Act & Assert
    //   expect(() => {
    //     (f5Fingerprint as any).buildPayload(sessionKey, fingerprintData, hashed);
    //   }).toThrow('JSON.stringify failed on circular reference');
    // });
  });

  describe('Type Safety', () => {
    it('should maintain proper TypeScript types', () => {
      // Arrange & Act
      const fingerprint = new F5Fingerprint();

      // Assert
      expect(fingerprint).toBeInstanceOf(F5Fingerprint);
      expect(typeof fingerprint.processF5Data).toBe('function');
      expect(typeof fingerprint.version).toBe('string');
    });

    // it('should enforce readonly properties', () => {
    //   // Arrange
    //   const fingerprint = new F5Fingerprint();

    //   // Assert
    //   expect((fingerprint as any).step).toBe('F5');
    //   expect((fingerprint as any).endpoint).toBe('/logs_sync');
      
    //   // These should be readonly
    //   expect(() => {
    //     (fingerprint as any).step = 'F4';
    //   }).toThrow();
    // });
  });

  describe('F4-F5 Integration Scenarios', () => {
    it('should handle large F4 attributes dataset', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const largeF4Attributes = {
        // Audio attributes
        audioCodecs: ['mp3', 'wav', 'ogg', 'aac', 'flac'],
        audioContext: { sampleRate: 44100, maxChannelCount: 32 },
        // Browser attributes
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        language: 'en-US',
        languages: ['en-US', 'en', 'vi-VN'],
        cookieEnabled: true,
        doNotTrack: null,
        // Hardware attributes
        platform: 'Win32',
        hardwareConcurrency: 16,
        deviceMemory: 32,
        architecture: 'x86_64',
        // Preferences
        timezone: 'Asia/Ho_Chi_Minh',
        timezoneOffset: -420,
        colorDepth: 24,
        pixelDepth: 24,
        screenResolution: '3840x2160'
      };

      const f5Data = {
        graphics: {
          canvasFingerprint: 'f5-canvas-hash',
          webglRenderer: 'NVIDIA GeForce RTX 3080'
        }
      };

      jest.spyOn(f5Fingerprint as any, 'collectData').mockResolvedValue(f5Data);

      // Act
      const result = (f5Fingerprint as any).extractAttributes(f5Data, largeF4Attributes);

      // Assert
      expect(result).toEqual({
        ...largeF4Attributes,
        ...f5Data.graphics
      });

      // F5 graphics should override any conflicting F4 keys
      expect(Object.keys(result)).toContain('canvasFingerprint');
      expect(Object.keys(result)).toContain('webglRenderer');
      expect(Object.keys(result).length).toBe(
        Object.keys(largeF4Attributes).length + Object.keys(f5Data.graphics).length
      );
    });

    it('should handle conflicting attribute names between F4 and F5', async () => {
      // Arrange
      const f4Attributes = {
        screenResolution: '1920x1080', // From F4 preferences
        platform: 'Win32'
      };

      const f5Data = {
        graphics: {
          screenResolution: '2560x1440', // From F5 graphics (should override)
          displayScale: 1.25
        }
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(f5Data, f4Attributes);

      // Assert
      expect(result.screenResolution).toBe('2560x1440'); // F5 should win
      expect(result.platform).toBe('Win32'); // F4 should remain
      expect(result.displayScale).toBe(1.25); // F5 unique
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large graphics data efficiently', async () => {
      // Arrange
      const largeGraphicsData = {
        canvas: {
          canvasFingerprint: 'x'.repeat(10000), // Large canvas hash
          webglRenderer: 'Complex GPU Name',
          webglVendor: 'Vendor Name'
        },
        webgl: {
          webglParameters: Object.fromEntries(
            Array.from({ length: 100 }, (_, i) => [`PARAM_${i}`, i * 1000])
          )
        }
      };

      mockGraphicsFingerprint.collect.mockResolvedValue(largeGraphicsData);

      // Act
      const start = Date.now();
      await (f5Fingerprint as any).collectData();
      const end = Date.now();

      // Assert
      expect(end - start).toBeLessThan(1000); // Should complete quickly
      expect(mockGraphicsFingerprint.collect).toHaveBeenCalledTimes(1);
    });
  });
});
