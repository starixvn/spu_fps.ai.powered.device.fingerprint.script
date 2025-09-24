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
    it('should initialize with correct endpoint', () => {
      expect((f5Fingerprint as any).endpoint).toBe('/logs_sync');
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
          canvas: ['canvas-fingerprint-123', 0],
          webglBasics: ['WebGL 1.0', 'Intel Inc.', 'Intel HD Graphics', 'renderer', 'unmasked-renderer', 'GLSL ES 1.0'],
          webglExtensions: 'extension-string',
          fonts: ['Arial', 'Times New Roman'],
          fontPreferences: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
          screenResolution: [1920, 1080],
          screenFrame: [0, 0, 1920, 1080],
          colorDepth: 24,
          colorGamut: 'srgb'
        }
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData);

      // Assert
      expect(result).toEqual({
        cnv: ['canvas-fingerprint-123', 0],
        wgb: ['WebGL 1.0', 'Intel Inc.', 'Intel HD Graphics', 'renderer', 'unmasked-renderer', 'GLSL ES 1.0'],
        wgx: 'extension-string',
        fnt: ['Arial', 'Times New Roman'],
        fpr: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
        scr: [1920, 1080],
        sfr: [0, 0, 1920, 1080],
        cld: 24,
        clg: 'srgb'
      });
    });

    it('should merge F4 attributes with F5 graphics attributes', () => {
      // Arrange
      const mockData = {
        graphics: {
          canvas: ['canvas-fingerprint-123', 0],
          webglBasics: ['WebGL 1.0', 'Intel Inc.', 'Intel HD Graphics', 'renderer', 'unmasked-renderer', 'GLSL ES 1.0'],
          webglExtensions: 'extension-string',
          fonts: ['Arial', 'Times New Roman'],
          fontPreferences: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
          screenResolution: [1920, 1080],
          screenFrame: [0, 0, 1920, 1080],
          colorDepth: 24,
          colorGamut: 'srgb'
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
        graphics: {
          cnv: ['canvas-fingerprint-123', 0],
          wgb: ['WebGL 1.0', 'Intel Inc.', 'Intel HD Graphics', 'renderer', 'unmasked-renderer', 'GLSL ES 1.0'],
          wgx: 'extension-string',
          fnt: ['Arial', 'Times New Roman'],
          fpr: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
          scr: [1920, 1080],
          sfr: [0, 0, 1920, 1080],
          cld: 24,
          clg: 'srgb'
        }
      });
    });

    it('should handle F5 attributes overriding F4 attributes', () => {
      // Arrange
      const mockData = {
        graphics: {
          canvas: ['f5-canvas-fingerprint', 1],
          webglBasics: ['WebGL 2.0', 'NVIDIA Corporation', 'NVIDIA GeForce RTX 3080', 'renderer', 'unmasked-renderer', 'GLSL ES 3.0'],
          webglExtensions: 'f5-extension-string',
          fonts: ['Arial', 'Helvetica'],
          fontPreferences: { default: 18, apple: 16, serif: 18, sans: 16, mono: 14, min: 10, system: 18 },
          screenResolution: [2560, 1440],
          screenFrame: [0, 0, 2560, 1440],
          colorDepth: 32,
          colorGamut: 'p3'
        }
      };

      const f4Attributes = {
        platform: 'F4-Platform',
        userAgent: 'Chrome/90.0',
        audioCodecs: ['mp3'],
        // Add some aliased keys that could conflict
        cnv: 'f4-canvas-value',
        scr: 'f4-screen-value'
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData, f4Attributes);

      // Assert
      expect(result).toEqual({
        platform: 'F4-Platform', // F4 should remain
        userAgent: 'Chrome/90.0',
        audioCodecs: ['mp3'],
        cnv: 'f4-canvas-value', // F4 values remain at top level
        scr: 'f4-screen-value', // F4 values remain at top level
        graphics: {
          cnv: ['f5-canvas-fingerprint', 1], // F5 graphics are nested
          wgb: ['WebGL 2.0', 'NVIDIA Corporation', 'NVIDIA GeForce RTX 3080', 'renderer', 'unmasked-renderer', 'GLSL ES 3.0'],
          wgx: 'f5-extension-string',
          fnt: ['Arial', 'Helvetica'],
          fpr: { default: 18, apple: 16, serif: 18, sans: 16, mono: 14, min: 10, system: 18 },
          scr: [2560, 1440],
          sfr: [0, 0, 2560, 1440],
          cld: 32,
          clg: 'p3'
        }
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
        platform: 'Win32',
        graphics: {
          cnv: undefined,
          wgb: undefined,
          wgx: undefined,
          fnt: undefined,
          fpr: undefined,
          scr: undefined,
          sfr: undefined,
          cld: undefined,
          clg: undefined
        }
      });
    });

    it('should handle undefined F4 attributes', () => {
      // Arrange
      const mockData = {
        graphics: {
          canvas: ['canvas-fingerprint-456', 0],
          webglBasics: ['WebGL 1.0', 'Intel Inc.', 'Intel HD Graphics', 'renderer', 'unmasked-renderer', 'GLSL ES 1.0'],
          webglExtensions: 'extension-string',
          fonts: ['Arial', 'Times New Roman'],
          fontPreferences: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
          screenResolution: [1920, 1080],
          screenFrame: [0, 0, 1920, 1080],
          colorDepth: 24,
          colorGamut: 'srgb'
        }
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(mockData, undefined);

      // Assert
      expect(result).toEqual({
        cnv: ['canvas-fingerprint-456', 0],
        wgb: ['WebGL 1.0', 'Intel Inc.', 'Intel HD Graphics', 'renderer', 'unmasked-renderer', 'GLSL ES 1.0'],
        wgx: 'extension-string',
        fnt: ['Arial', 'Times New Roman'],
        fpr: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
        scr: [1920, 1080],
        sfr: [0, 0, 1920, 1080],
        cld: 24,
        clg: 'srgb'
      });
    });
  });


  describe('start', () => {
    it('should process F5 data with F4 attributes', async () => {
      // Arrange
      const f4Attributes = {
        userAgent: 'Chrome/90.0',
        platform: 'Win32',
        audioCodecs: ['mp3']
      };

      const expectedResult = {
        attributes: {
          userAgent: 'Chrome/90.0',
          platform: 'Win32',
          audioCodecs: ['mp3'],
          graphics: {
            cnv: ['canvas-fingerprint-123', 0],
            wgb: ['WebGL 1.0', 'Intel Inc.', 'Intel HD Graphics', 'renderer', 'unmasked-renderer', 'GLSL ES 1.0']
          }
        },
        hashed: 'test-f5-hash'
      };

      // Mock the process method to return expected result
      jest.spyOn(f5Fingerprint as any, 'process').mockResolvedValue(expectedResult);

      // Act
      await f5Fingerprint.start(f4Attributes, mockInjectCallback);

      // Assert
      expect(mockInjectCallback).toHaveBeenCalledWith(expectedResult);
      expect((f5Fingerprint as any).process).toHaveBeenCalledWith(f4Attributes);
    });

    it('should handle F5 processing without F4 attributes', async () => {
      // Arrange
      const f4Attributes = {};

      const expectedResult = {
        attributes: {
          cnv: ['canvas-fingerprint-123', 0],
          wgb: ['WebGL 1.0', 'Intel Inc.', 'Intel HD Graphics', 'renderer', 'unmasked-renderer', 'GLSL ES 1.0']
        },
        hashed: 'test-hash'
      };

      jest.spyOn(f5Fingerprint as any, 'process').mockResolvedValue(expectedResult);

      // Act
      await f5Fingerprint.start(f4Attributes, mockInjectCallback);

      // Assert
      expect(mockInjectCallback).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle process errors gracefully', async () => {
      // Arrange
      const f4Attributes = { userAgent: 'Chrome' };
      const error = new Error('F5 Process failed');

      jest.spyOn(f5Fingerprint as any, 'process').mockRejectedValue(error);

      // Act & Assert
      await expect(f5Fingerprint.start(f4Attributes, mockInjectCallback))
        .rejects.toThrow('F5 Process failed');
    });
  });

  describe('Integration with AbstractFingerprint', () => {
    it('should pass F4 attributes correctly to extractAttributes', async () => {
      // Arrange
      const f4Attributes = {
        userAgent: 'Chrome/90.0',
        platform: 'Win32'
      };

      const extractAttributesSpy = jest.spyOn(f5Fingerprint as any, 'extractAttributes');
      jest.spyOn(f5Fingerprint as any, 'collectData').mockResolvedValue({ graphics: {} });
      jest.spyOn(f5Fingerprint as any, 'generateGroupHashes').mockReturnValue('hash');

      // Act
      await (f5Fingerprint as any).process(f4Attributes);

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
      expect(typeof fingerprint.start).toBe('function');
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
          canvas: ['f5-canvas-hash', 1],
          webglBasics: ['WebGL 2.0', 'NVIDIA Corporation', 'NVIDIA GeForce RTX 3080', 'renderer', 'unmasked-renderer', 'GLSL ES 3.0'],
          webglExtensions: 'f5-extensions',
          fonts: ['Arial', 'Times New Roman', 'Helvetica'],
          fontPreferences: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
          screenResolution: [3840, 2160],
          screenFrame: [0, 0, 3840, 2160],
          colorDepth: 32,
          colorGamut: 'rec2020'
        }
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(f5Data, largeF4Attributes);

      // Assert
      expect(result).toEqual({
        ...largeF4Attributes,
        graphics: {
          cnv: ['f5-canvas-hash', 1],
          wgb: ['WebGL 2.0', 'NVIDIA Corporation', 'NVIDIA GeForce RTX 3080', 'renderer', 'unmasked-renderer', 'GLSL ES 3.0'],
          wgx: 'f5-extensions',
          fnt: ['Arial', 'Times New Roman', 'Helvetica'],
          fpr: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
          scr: [3840, 2160],
          sfr: [0, 0, 3840, 2160],
          cld: 32,
          clg: 'rec2020'
        }
      });

      // F5 graphics should be nested under graphics key
      expect(Object.keys(result)).toContain('graphics');
      expect(Object.keys(result.graphics)).toContain('cnv');
      expect(Object.keys(result.graphics)).toContain('wgb');
      expect(Object.keys(result).length).toBe(
        Object.keys(largeF4Attributes).length + 1 // 1 additional graphics key
      );
    });

    it('should handle conflicting attribute names between F4 and F5', async () => {
      // Arrange
      const f4Attributes = {
        scr: 'f4-screen-value', // Conflicts with F5 alias for screenResolution
        platform: 'Win32',
        cnv: 'f4-canvas-value' // Conflicts with F5 alias for canvas
      };

      const f5Data = {
        graphics: {
          canvas: ['f5-canvas-hash', 1],
          webglBasics: ['WebGL 2.0', 'NVIDIA Corporation', 'NVIDIA GeForce RTX 3080', 'renderer', 'unmasked-renderer', 'GLSL ES 3.0'],
          webglExtensions: 'f5-extensions',
          fonts: ['Arial', 'Times New Roman'],
          fontPreferences: { default: 16, apple: 14, serif: 16, sans: 14, mono: 12, min: 8, system: 16 },
          screenResolution: [2560, 1440],
          screenFrame: [0, 0, 2560, 1440],
          colorDepth: 32,
          colorGamut: 'p3'
        }
      };

      // Act
      const result = (f5Fingerprint as any).extractAttributes(f5Data, f4Attributes);

      // Assert
      expect(result.scr).toBe('f4-screen-value'); // F4 top-level should remain
      expect(result.cnv).toBe('f4-canvas-value'); // F4 top-level should remain
      expect(result.graphics.scr).toEqual([2560, 1440]); // F5 graphics nested
      expect(result.graphics.cnv).toEqual(['f5-canvas-hash', 1]); // F5 graphics nested
      expect(result.platform).toBe('Win32'); // F4 should remain
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
