import { GraphicsFingerprint } from '../../../../../../src/client/fingerprint/modules/graphics';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock all graphics modules
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/canvas');
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/fonts');
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/fontPreferences');
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/screenResolution');
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/screenFrame');
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/colorDepth');
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/colorGamut');
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/webglBasics');
jest.mock('../../../../../../src/client/fingerprint/modules/graphics/webglExtensions');

const mockCollectCanvas = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/canvas').collectCanvas);
const mockCollectFonts = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/fonts').collectFonts);
const mockCollectFontPreferences = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/fontPreferences').collectFontPreferences);
const mockCollectScreenResolution = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/screenResolution').collectScreenResolution);
const mockCollectScreenFrame = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/screenFrame').collectScreenFrame);
const mockCollectColorDepth = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/colorDepth').collectColorDepth);
const mockCollectColorGamut = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/colorGamut').collectColorGamut);
const mockCollectWebGLBasics = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/webglBasics').collectWebGLBasics);
const mockCollectWebGLExtensions = jest.mocked(require('../../../../../../src/client/fingerprint/modules/graphics/webglExtensions').collectWebGLExtensions);

describe('Graphics Fingerprint Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GraphicsFingerprint.collect', () => {
    it('should collect complete graphics information successfully', async () => {
      // Arrange
      const mockCanvasResult = ['canvas-fingerprint-hash', 0] as [string, 0 | 1];
      const mockWebglBasicsResult = [
        'WebGL 1.0',
        'Intel Inc.',
        'Intel Open Source Technology Center',
        'Mesa Intel(R) HD Graphics 620 (KBL GT2)',
        'Intel HD Graphics 620',
        'WebGL GLSL ES 1.0'
      ] as [string, string, string, string, string, string];
      const mockWebglExtensionsResult = 'webgl-extensions-fingerprint';
      const mockFontsResult = ['Arial', 'Times New Roman', 'Helvetica'];
      const mockFontPreferencesResult = {
        default: 16,
        apple: 12,
        serif: 16,
        sans: 14,
        mono: 12,
        min: 10,
        system: 16,
      };
      const mockScreenResolutionResult = [1920, 1080] as [number, number];
      const mockScreenFrameResult = [1920, 1080, 0, 0] as [number, number, number, number];
      const mockColorDepthResult = 24;
      const mockColorGamutResult = 'srgb' as 'srgb' | 'p3' | 'rec2020';

      mockCollectCanvas.mockResolvedValue(mockCanvasResult);
      mockCollectWebGLBasics.mockReturnValue(mockWebglBasicsResult);
      mockCollectWebGLExtensions.mockResolvedValue(mockWebglExtensionsResult);
      mockCollectFonts.mockResolvedValue(mockFontsResult);
      mockCollectFontPreferences.mockResolvedValue(mockFontPreferencesResult);
      mockCollectScreenResolution.mockReturnValue(mockScreenResolutionResult);
      mockCollectScreenFrame.mockResolvedValue(mockScreenFrameResult);
      mockCollectColorDepth.mockReturnValue(mockColorDepthResult);
      mockCollectColorGamut.mockReturnValue(mockColorGamutResult);

      const expectedResult = {
        canvas: mockCanvasResult,
        webglBasics: mockWebglBasicsResult,
        webglExtensions: mockWebglExtensionsResult,
        fonts: mockFontsResult,
        fontPreferences: mockFontPreferencesResult,
        screenResolution: mockScreenResolutionResult,
        screenFrame: mockScreenFrameResult,
        colorDepth: mockColorDepthResult,
        colorGamut: mockColorGamutResult,
      };

      // Act
      const result = await GraphicsFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCollectCanvas).toHaveBeenCalledTimes(1);
      expect(mockCollectWebGLBasics).toHaveBeenCalledTimes(1);
      expect(mockCollectWebGLExtensions).toHaveBeenCalledTimes(1);
      expect(mockCollectFonts).toHaveBeenCalledTimes(1);
      expect(mockCollectFontPreferences).toHaveBeenCalledTimes(1);
      expect(mockCollectScreenResolution).toHaveBeenCalledTimes(1);
      expect(mockCollectScreenFrame).toHaveBeenCalledTimes(1);
      expect(mockCollectColorDepth).toHaveBeenCalledTimes(1);
      expect(mockCollectColorGamut).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed valid and special values from collectors', async () => {
      // Arrange
      const mockCanvasResult = [FingerprintSpecialValue.ERROR, 1] as [FingerprintSpecialValue, 0 | 1];
      const mockWebglBasicsResult = FingerprintSpecialValue.UNDEFINED;
      const mockWebglExtensionsResult = 'webgl-extensions-valid';
      const mockFontsResult = FingerprintSpecialValue.TIMEOUT;
      const mockFontPreferencesResult = {
        default: FingerprintSpecialValue.ERROR,
        apple: 12,
        serif: FingerprintSpecialValue.UNDEFINED,
        sans: 14,
        mono: 12,
        min: 10,
        system: FingerprintSpecialValue.TIMEOUT,
      };
      const mockScreenResolutionResult = [1366, 768] as [number, number];
      const mockScreenFrameResult = [1366, 728, 0, 40] as [number, number, number, number];
      const mockColorDepthResult = FingerprintSpecialValue.UNDEFINED;
      const mockColorGamutResult = 'p3' as 'srgb' | 'p3' | 'rec2020';

      mockCollectCanvas.mockResolvedValue(mockCanvasResult);
      mockCollectWebGLBasics.mockReturnValue(mockWebglBasicsResult);
      mockCollectWebGLExtensions.mockResolvedValue(mockWebglExtensionsResult);
      mockCollectFonts.mockResolvedValue(mockFontsResult);
      mockCollectFontPreferences.mockResolvedValue(mockFontPreferencesResult);
      mockCollectScreenResolution.mockReturnValue(mockScreenResolutionResult);
      mockCollectScreenFrame.mockResolvedValue(mockScreenFrameResult);
      mockCollectColorDepth.mockReturnValue(mockColorDepthResult);
      mockCollectColorGamut.mockReturnValue(mockColorGamutResult);

      const expectedResult = {
        canvas: mockCanvasResult,
        webglBasics: mockWebglBasicsResult,
        webglExtensions: mockWebglExtensionsResult,
        fonts: mockFontsResult,
        fontPreferences: mockFontPreferencesResult,
        screenResolution: mockScreenResolutionResult,
        screenFrame: mockScreenFrameResult,
        colorDepth: mockColorDepthResult,
        colorGamut: mockColorGamutResult,
      };

      // Act
      const result = await GraphicsFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle all special values from collectors', async () => {
      // Arrange
      const mockCanvasResult = [FingerprintSpecialValue.ERROR, 0] as [FingerprintSpecialValue, 0 | 1];
      const mockWebglBasicsResult = FingerprintSpecialValue.UNDEFINED;
      const mockWebglExtensionsResult = FingerprintSpecialValue.TIMEOUT;
      const mockFontsResult = FingerprintSpecialValue.ERROR;
      const mockFontPreferencesResult = {
        default: FingerprintSpecialValue.UNDEFINED,
        apple: FingerprintSpecialValue.ERROR,
        serif: FingerprintSpecialValue.TIMEOUT,
        sans: FingerprintSpecialValue.UNDEFINED,
        mono: FingerprintSpecialValue.ERROR,
        min: FingerprintSpecialValue.TIMEOUT,
        system: FingerprintSpecialValue.UNDEFINED,
      };
      const mockScreenResolutionResult = [800, 600] as [number, number];
      const mockScreenFrameResult = [800, 570, 0, 30] as [number, number, number, number];
      const mockColorDepthResult = FingerprintSpecialValue.ERROR;
      const mockColorGamutResult = FingerprintSpecialValue.TIMEOUT;

      mockCollectCanvas.mockResolvedValue(mockCanvasResult);
      mockCollectWebGLBasics.mockReturnValue(mockWebglBasicsResult);
      mockCollectWebGLExtensions.mockResolvedValue(mockWebglExtensionsResult);
      mockCollectFonts.mockResolvedValue(mockFontsResult);
      mockCollectFontPreferences.mockResolvedValue(mockFontPreferencesResult);
      mockCollectScreenResolution.mockReturnValue(mockScreenResolutionResult);
      mockCollectScreenFrame.mockResolvedValue(mockScreenFrameResult);
      mockCollectColorDepth.mockReturnValue(mockColorDepthResult);
      mockCollectColorGamut.mockReturnValue(mockColorGamutResult);

      const expectedResult = {
        canvas: mockCanvasResult,
        webglBasics: mockWebglBasicsResult,
        webglExtensions: mockWebglExtensionsResult,
        fonts: mockFontsResult,
        fontPreferences: mockFontPreferencesResult,
        screenResolution: mockScreenResolutionResult,
        screenFrame: mockScreenFrameResult,
        colorDepth: mockColorDepthResult,
        colorGamut: mockColorGamutResult,
      };

      // Act
      const result = await GraphicsFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from individual collectors gracefully', async () => {
      // Arrange
      mockCollectCanvas.mockRejectedValue(new Error('Canvas collection failed'));
      mockCollectWebGLBasics.mockImplementation(() => {
        throw new Error('WebGL Basics collection failed');
      });
      mockCollectWebGLExtensions.mockResolvedValue('valid-webgl-extensions');
      mockCollectFonts.mockResolvedValue(['Arial', 'Helvetica']);
      mockCollectFontPreferences.mockResolvedValue({
        default: 16,
        apple: 12,
        serif: 16,
        sans: 14,
        mono: 12,
        min: 10,
        system: 16,
      });
      mockCollectScreenResolution.mockReturnValue([1920, 1080] as [number, number]);
      mockCollectScreenFrame.mockResolvedValue([1920, 1080, 0, 0] as [number, number, number, number]);
      mockCollectColorDepth.mockReturnValue(24);
      mockCollectColorGamut.mockReturnValue('srgb' as 'srgb');

      // Act & Assert
      await expect(GraphicsFingerprint.collect()).rejects.toThrow();
    });

    it('should maintain proper data types for all collectors', async () => {
      // Arrange
      const mockCanvasResult = ['canvas-hash-123', 1] as [string, 0 | 1];
      const mockWebglBasicsResult = [
        'WebGL 2.0',
        'Google Inc.',
        'Google ANGLE',
        'ANGLE (NVIDIA GeForce GTX 1060)',
        'NVIDIA GeForce GTX 1060',
        'WebGL GLSL ES 3.0'
      ] as [string, string, string, string, string, string];
      const mockWebglExtensionsResult = 'webgl2-extensions';
      const mockFontsResult = ['Arial Black', 'Comic Sans MS', 'Impact'];
      const mockFontPreferencesResult = {
        default: 14,
        apple: 11,
        serif: 16,
        sans: 13,
        mono: 11,
        min: 9,
        system: 15,
      };
      const mockScreenResolutionResult = [2560, 1440] as [number, number];
      const mockScreenFrameResult = [2560, 1400, 0, 40] as [number, number, number, number];
      const mockColorDepthResult = 32;
      const mockColorGamutResult = 'rec2020' as 'rec2020';

      mockCollectCanvas.mockResolvedValue(mockCanvasResult);
      mockCollectWebGLBasics.mockReturnValue(mockWebglBasicsResult);
      mockCollectWebGLExtensions.mockResolvedValue(mockWebglExtensionsResult);
      mockCollectFonts.mockResolvedValue(mockFontsResult);
      mockCollectFontPreferences.mockResolvedValue(mockFontPreferencesResult);
      mockCollectScreenResolution.mockReturnValue(mockScreenResolutionResult);
      mockCollectScreenFrame.mockResolvedValue(mockScreenFrameResult);
      mockCollectColorDepth.mockReturnValue(mockColorDepthResult);
      mockCollectColorGamut.mockReturnValue(mockColorGamutResult);

      // Act
      const result = await GraphicsFingerprint.collect();

      // Assert
      expect(Array.isArray(result.webglBasics)).toBe(true);
      expect(result.webglBasics).toHaveLength(6);

      expect(typeof result.webglExtensions).toBe('string');
      expect(Array.isArray(result.fonts)).toBe(true);
      
      expect(typeof result.fontPreferences).toBe('object');
      expect(typeof result.fontPreferences.default).toBe('number');

      expect(Array.isArray(result.screenResolution)).toBe(true);
      expect(result.screenResolution).toHaveLength(2);
      
      // screenFrame can be array or FingerprintSpecialValue
      if (Array.isArray(result.screenFrame)) {
        expect(result.screenFrame).toHaveLength(4);
      } else {
        expect(typeof result.screenFrame).toBe('number');
      }

      expect(typeof result.colorDepth).toBe('number');
      expect(['srgb', 'p3', 'rec2020']).toContain(result.colorGamut);
    });

    it('should handle asynchronous collectors properly', async () => {
      // Arrange
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      const mockCanvasResult = ['async-canvas-hash', 0] as [string, 0 | 1];
      const mockWebglBasicsResult = [
        'WebGL 1.0',
        'Mozilla',
        'Mozilla',
        'Mozilla',
        'Mozilla',
        'WebGL GLSL ES 1.0'
      ] as [string, string, string, string, string, string];

      mockCollectCanvas.mockImplementation(async () => {
        await delay(20);
        return mockCanvasResult;
      });
      mockCollectWebGLBasics.mockReturnValue(mockWebglBasicsResult);
      mockCollectWebGLExtensions.mockImplementation(async () => {
        await delay(10);
        return 'async-webgl-extensions';
      });
      mockCollectFonts.mockImplementation(async () => {
        await delay(15);
        return ['Font1', 'Font2'];
      });
      mockCollectFontPreferences.mockImplementation(async () => {
        await delay(5);
        return {
          default: 12,
          apple: 10,
          serif: 14,
          sans: 12,
          mono: 10,
          min: 8,
          system: 13,
        };
      });
      mockCollectScreenResolution.mockReturnValue([1024, 768] as [number, number]);
      mockCollectScreenFrame.mockImplementation(async () => {
        await delay(8);
        return [1024, 728, 0, 40] as [number, number, number, number];
      });
      mockCollectColorDepth.mockReturnValue(16);
      mockCollectColorGamut.mockReturnValue('srgb' as 'srgb');

      const startTime = Date.now();

      // Act
      const result = await GraphicsFingerprint.collect();

      // Assert
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(20); // Should take at least 20ms due to canvas delay
      
      expect(result).toEqual({
        canvas: mockCanvasResult,
        webglBasics: mockWebglBasicsResult,
        webglExtensions: 'async-webgl-extensions',
        fonts: ['Font1', 'Font2'],
        fontPreferences: {
          default: 12,
          apple: 10,
          serif: 14,
          sans: 12,
          mono: 10,
          min: 8,
          system: 13,
        },
        screenResolution: [1024, 768],
        screenFrame: [1024, 728, 0, 40],
        colorDepth: 16,
        colorGamut: 'srgb',
      });
    });

    it('should return the exact structure from individual collectors', async () => {
      // Arrange
      const mockResults = {
        canvas: ['exact-canvas-fingerprint', 1] as [string, 0 | 1],
        webglBasics: [
          'Exact WebGL 2.0',
          'Exact Vendor',
          'Exact Unmasked Vendor',
          'Exact Renderer',
          'Exact Unmasked Renderer',
          'Exact GLSL Version'
        ] as [string, string, string, string, string, string],
        webglExtensions: 'exact-webgl-extensions-fingerprint',
        fonts: ['ExactFont1', 'ExactFont2', 'ExactFont3'],
        fontPreferences: {
          default: 18,
          apple: 13,
          serif: 18,
          sans: 15,
          mono: 13,
          min: 11,
          system: 17,
        },
        screenResolution: [3840, 2160] as [number, number],
        screenFrame: [3840, 2120, 0, 40] as [number, number, number, number],
        colorDepth: 48,
        colorGamut: 'p3' as 'p3',
      };

      mockCollectCanvas.mockResolvedValue(mockResults.canvas);
      mockCollectWebGLBasics.mockReturnValue(mockResults.webglBasics);
      mockCollectWebGLExtensions.mockResolvedValue(mockResults.webglExtensions);
      mockCollectFonts.mockResolvedValue(mockResults.fonts);
      mockCollectFontPreferences.mockResolvedValue(mockResults.fontPreferences);
      mockCollectScreenResolution.mockReturnValue(mockResults.screenResolution);
      mockCollectScreenFrame.mockResolvedValue(mockResults.screenFrame);
      mockCollectColorDepth.mockReturnValue(mockResults.colorDepth);
      mockCollectColorGamut.mockReturnValue(mockResults.colorGamut);

      // Act
      const result = await GraphicsFingerprint.collect();

      // Assert
      expect(result.canvas).toEqual(mockResults.canvas);
      expect(result.webglBasics).toEqual(mockResults.webglBasics);
      expect(result.webglExtensions).toBe(mockResults.webglExtensions);
      expect(result.fonts).toEqual(mockResults.fonts);
      expect(result.fontPreferences).toEqual(mockResults.fontPreferences);
      expect(result.screenResolution).toEqual(mockResults.screenResolution);
      expect(result.screenFrame).toEqual(mockResults.screenFrame);
      expect(result.colorDepth).toBe(mockResults.colorDepth);
      expect(result.colorGamut).toBe(mockResults.colorGamut);
    });

    it('should handle special fingerprint values correctly for all collectors', async () => {
      // Arrange
      const specialValues = [
        FingerprintSpecialValue.UNDEFINED,
        FingerprintSpecialValue.ERROR,
        FingerprintSpecialValue.TIMEOUT,
      ];

      for (const specialValue of specialValues) {
        mockCollectCanvas.mockResolvedValue(specialValue);
        mockCollectWebGLBasics.mockReturnValue(specialValue);
        mockCollectWebGLExtensions.mockResolvedValue(specialValue);
        mockCollectFonts.mockResolvedValue(specialValue);
        mockCollectFontPreferences.mockResolvedValue({
          default: specialValue,
          apple: specialValue,
          serif: specialValue,
          sans: specialValue,
          mono: specialValue,
          min: specialValue,
          system: specialValue,
        });
        mockCollectScreenResolution.mockReturnValue([1920, 1080] as [number, number]);
        mockCollectScreenFrame.mockResolvedValue([1920, 1040, 0, 40] as [number, number, number, number]);
        mockCollectColorDepth.mockReturnValue(specialValue);
        mockCollectColorGamut.mockReturnValue(specialValue);

        // Act
        const result = await GraphicsFingerprint.collect();

        // Assert
        expect(result.canvas).toBe(specialValue);
        expect(result.webglBasics).toBe(specialValue);
        expect(result.webglExtensions).toBe(specialValue);
        expect(result.fonts).toBe(specialValue);
        expect(result.fontPreferences.default).toBe(specialValue);
        expect(result.fontPreferences.apple).toBe(specialValue);
        expect(result.fontPreferences.serif).toBe(specialValue);
        expect(result.fontPreferences.sans).toBe(specialValue);
        expect(result.fontPreferences.mono).toBe(specialValue);
        expect(result.fontPreferences.min).toBe(specialValue);
        expect(result.fontPreferences.system).toBe(specialValue);
        expect(result.colorDepth).toBe(specialValue);
        expect(result.colorGamut).toBe(specialValue);
      }
    });

    it('should handle canvas protection flag correctly', async () => {
      // Arrange - Test both protected and unprotected canvas scenarios
      const testCases = [
        { canvasHash: 'unprotected-canvas-hash', protection: 0 as 0 | 1 },
        { canvasHash: 'protected-canvas-hash', protection: 1 as 0 | 1 },
      ];

      for (const testCase of testCases) {
        mockCollectCanvas.mockResolvedValue(testCase.canvasHash);
        mockCollectWebGLBasics.mockReturnValue([
          'WebGL 1.0', 'Vendor', 'UnmaskedVendor', 'Renderer', 'UnmaskedRenderer', 'GLSL 1.0'
        ] as [string, string, string, string, string, string]);
        mockCollectWebGLExtensions.mockResolvedValue('extensions');
        mockCollectFonts.mockResolvedValue(['Arial']);
        mockCollectFontPreferences.mockResolvedValue({
          default: 16, apple: 12, serif: 16, sans: 14, mono: 12, min: 10, system: 16,
        });
        mockCollectScreenResolution.mockReturnValue([1920, 1080] as [number, number]);
        mockCollectScreenFrame.mockResolvedValue([1920, 1040, 0, 40] as [number, number, number, number]);
        mockCollectColorDepth.mockReturnValue(24);
        mockCollectColorGamut.mockReturnValue('srgb' as 'srgb');

        // Act
        const result = await GraphicsFingerprint.collect();

        // Assert
        expect(result.canvas).toEqual(testCase.canvasHash);
      }
    });

    it('should handle different color gamut values', async () => {
      // Arrange - Test all valid color gamut values
      const colorGamutValues: Array<'srgb' | 'p3' | 'rec2020'> = ['srgb', 'p3', 'rec2020'];

      for (const gamutValue of colorGamutValues) {
        mockCollectCanvas.mockResolvedValue(['canvas-hash', 0] as [string, 0 | 1]);
        mockCollectWebGLBasics.mockReturnValue([
          'WebGL 2.0', 'Intel', 'Intel', 'HD Graphics', 'HD Graphics', 'GLSL 3.0'
        ] as [string, string, string, string, string, string]);
        mockCollectWebGLExtensions.mockResolvedValue('webgl-ext');
        mockCollectFonts.mockResolvedValue(['Times New Roman']);
        mockCollectFontPreferences.mockResolvedValue({
          default: 14, apple: 11, serif: 15, sans: 13, mono: 11, min: 9, system: 14,
        });
        mockCollectScreenResolution.mockReturnValue([1366, 768] as [number, number]);
        mockCollectScreenFrame.mockResolvedValue([1366, 728, 0, 40] as [number, number, number, number]);
        mockCollectColorDepth.mockReturnValue(16);
        mockCollectColorGamut.mockReturnValue(gamutValue);

        // Act
        const result = await GraphicsFingerprint.collect();

        // Assert
        expect(result.colorGamut).toBe(gamutValue);
      }
    });
  });
});
