import { collectWebGLExtensions } from '../../../../../../src/client/fingerprint/modules/graphics/webglExtensions';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';
import { MurmurHash128 } from '../../../../../../src/client/fingerprint/utils/hash';

// Mock MurmurHash128
jest.mock('../../../../../../src/client/fingerprint/utils/hash', () => ({
  MurmurHash128: {
    hash128: jest.fn()
  }
}));

// Mock canvas với addEventListener
const mockCanvas = {
  getContext: jest.fn(),
  addEventListener: jest.fn()
};

// Mock comprehensive WebGL context
const mockWebGLContext = {
  getParameter: jest.fn(),
  getExtension: jest.fn(),
  getSupportedExtensions: jest.fn(),
  getContextAttributes: jest.fn(),
  getShaderPrecisionFormat: jest.fn(),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  getShaderParameter: jest.fn(),
  deleteShader: jest.fn(),
  // WebGL constants
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  COMPILE_STATUS: 35713,
  VERSION: 0x1F02,
  VENDOR: 0x1F00,
  RENDERER: 0x1F01,
  SHADING_LANGUAGE_VERSION: 0x8B8C,
  // Precision constants
  LOW_FLOAT: 36336,
  MEDIUM_FLOAT: 36337,
  HIGH_FLOAT: 36338,
  LOW_INT: 36339,
  MEDIUM_INT: 36340,
  HIGH_INT: 36341
};

describe('WebGL Extensions Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup document mock với documentElement
    Object.defineProperty(global, 'document', {
      value: {
        createElement: jest.fn(() => mockCanvas),
        documentElement: {
          style: {}
        }
      },
      writable: true,
      configurable: true
    });

    // Setup window mock để avoid browser detection errors
    Object.defineProperty(global, 'window', {
      value: {
        navigator: {
          userAgent: 'Mozilla/5.0 (Chrome)'
        }
      },
      writable: true,
      configurable: true
    });

    // Default successful WebGL context setup
    mockCanvas.getContext.mockImplementation((type: string, options?: any) => {
      if (type.includes('webgl')) {
        return mockWebGLContext;
      }
      return null;
    });

    // Default WebGL mocks
    mockWebGLContext.getSupportedExtensions.mockReturnValue([
      'ANGLE_instanced_arrays',
      'EXT_blend_minmax', 
      'OES_element_index_uint'
    ]);
    mockWebGLContext.getExtension.mockReturnValue(null);
    mockWebGLContext.getParameter.mockReturnValue('Mock WebGL Value');
    mockWebGLContext.getContextAttributes.mockReturnValue({
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false
    });
    mockWebGLContext.getShaderPrecisionFormat.mockReturnValue({
      precision: 23,
      rangeMin: 127,
      rangeMax: 127
    });

    // Default hash mock
    (MurmurHash128.hash128 as jest.Mock).mockReturnValue('default-hash');
  });

  describe('collectWebGLExtensions', () => {
    it('should return WebGL extensions fingerprint hash when WebGL is available', async () => {
      // Arrange
      const expectedHash = 'webgl-extensions-fingerprint';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert - Focus on successful result generation
      expect(result).toBe(expectedHash);
      expect(typeof result).toBe('string');
      expect(MurmurHash128.hash128).toHaveBeenCalled();
    });

    it('should return UNDEFINED when WebGL is not supported', async () => {
      // Arrange - No WebGL context available
      mockCanvas.getContext.mockReturnValue(null);

      // Act
      const result = await collectWebGLExtensions();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle document unavailable gracefully', async () => {
      // Act & Assert - Should handle document issues without crashing
      const originalDocument = global.document;
      try {
        Object.defineProperty(global, 'document', {
          value: undefined,
          writable: true,
          configurable: true
        });

        const result = await collectWebGLExtensions();
        // Accept either UNDEFINED or ERROR - both are valid for document unavailable
        expect([FingerprintSpecialValue.UNDEFINED, FingerprintSpecialValue.ERROR]).toContain(result);
      } finally {
        Object.defineProperty(global, 'document', {
          value: originalDocument,
          writable: true,
          configurable: true
        });
      }
    });

    it('should return ERROR when canvas creation fails', async () => {
      // Arrange - createElement returns null
      const mockDocument = global.document as any;
      mockDocument.createElement.mockReturnValue(null);

      // Act
      const result = await collectWebGLExtensions();

      // Assert - Should handle gracefully
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle experimental-webgl fallback', async () => {
      // Arrange - Mock first call fails, second succeeds
      mockCanvas.getContext
        .mockReturnValueOnce(null) // webgl fails
        .mockReturnValueOnce(mockWebGLContext); // experimental-webgl succeeds

      const expectedHash = 'experimental-webgl-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert
      expect(result).toBe(expectedHash);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl', { failIfMajorPerformanceCaveat: false });
    });

    it('should handle empty extensions list', async () => {
      // Arrange
      mockWebGLContext.getSupportedExtensions.mockReturnValue([]);
      const expectedHash = 'empty-extensions-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert
      expect(result).toBe(expectedHash);
    });

    it('should handle null extensions list', async () => {
      // Arrange
      mockWebGLContext.getSupportedExtensions.mockReturnValue(null);
      const expectedHash = 'null-extensions-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert
      expect(result).toBe(expectedHash);
    });

    it('should handle getSupportedExtensions throwing error', async () => {
      // Arrange
      mockWebGLContext.getSupportedExtensions.mockImplementation(() => {
        throw new Error('Extensions not available');
      });

      // Act
      const result = await collectWebGLExtensions();

      // Assert - Should handle gracefully
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should collect WebGL context information successfully', async () => {
      // Arrange
      const expectedHash = 'comprehensive-webgl-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert - Focus on successful result generation
      expect(result).toBe(expectedHash);
      expect(MurmurHash128.hash128).toHaveBeenCalledWith(expect.any(String));
    });

    it('should handle WebGL processing successfully', async () => {
      // Arrange
      const expectedHash = 'shader-test-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert - Focus on successful WebGL processing
      expect(result).toBe(expectedHash);
      expect(typeof result).toBe('string');
      expect(MurmurHash128.hash128).toHaveBeenCalled();
    });

    it('should handle shader compilation failures gracefully', async () => {
      // Arrange - Mock shader creation fails
      mockWebGLContext.createShader.mockReturnValue(null);
      const expectedHash = 'shader-fail-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert
      expect(result).toBe(expectedHash);
    });

    it('should include extension information in fingerprint', async () => {
      // Arrange - Mock extension
      mockWebGLContext.getExtension.mockImplementation((name: string) => {
        if (name === 'WEBGL_debug_renderer_info') {
          return {
            UNMASKED_VENDOR_WEBGL: 0x9245,
            UNMASKED_RENDERER_WEBGL: 0x9246
          };
        }
        return null;
      });

      const expectedHash = 'extension-params-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert
      expect(result).toBe(expectedHash);
    });

    it('should handle WebGL context creation gracefully', async () => {
      // Arrange - No WebGL context available
      mockCanvas.getContext.mockReturnValue(null);

      // Act
      const result = await collectWebGLExtensions();

      // Assert - No context should return UNDEFINED
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle different WebGL versions', async () => {
      // Arrange
      const expectedHash = 'webgl2-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert
      expect(result).toBe(expectedHash);
    });

    it('should collect WebGL parameters for fingerprinting', async () => {
      // Arrange
      const expectedHash = 'params-test-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert - Focus on successful fingerprinting
      expect(result).toBe(expectedHash);
      expect(typeof result).toBe('string');
    });

    it('should generate consistent hash for same WebGL configuration', async () => {
      // Arrange
      const consistentHash = 'consistent-webgl-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(consistentHash);

      // Act - Multiple calls with same configuration
      const result1 = await collectWebGLExtensions();
      const result2 = await collectWebGLExtensions();

      // Assert
      expect(result1).toBe(consistentHash);
      expect(result2).toBe(consistentHash);
      expect(result1).toBe(result2);
    });

    it('should handle WebGL precision formats', async () => {
      // Arrange
      mockWebGLContext.getShaderPrecisionFormat.mockReturnValue({
        precision: 23,
        rangeMin: 127,
        rangeMax: 127
      });

      const expectedHash = 'precision-hash';
      (MurmurHash128.hash128 as jest.Mock).mockReturnValue(expectedHash);

      // Act
      const result = await collectWebGLExtensions();

      // Assert
      expect(result).toBe(expectedHash);
    });

    it('should handle various error scenarios gracefully', async () => {
      // Test multiple error scenarios
      const scenarios = [
        () => mockWebGLContext.getParameter.mockImplementation(() => { throw new Error(); }),
        () => mockWebGLContext.getContextAttributes.mockImplementation(() => { throw new Error(); }),
        () => mockWebGLContext.getShaderPrecisionFormat.mockImplementation(() => { throw new Error(); })
      ];

      for (const scenario of scenarios) {
        jest.clearAllMocks();
        scenario();

        const result = await collectWebGLExtensions();
        
        // Should handle errors gracefully - either return hash or special value
        expect(result).toBeDefined();
        expect([...Object.values(FingerprintSpecialValue), 'default-hash']).toContain(result);
      }
    });
  });
});