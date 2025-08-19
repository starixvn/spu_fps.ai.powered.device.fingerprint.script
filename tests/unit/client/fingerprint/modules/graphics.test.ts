import { GraphicsFingerprint } from '../../../../../src/client/fingerprint/modules/graphics';

// Mock WebGL context
const mockWebGLContext = {
  VENDOR: 0x1F00,
  RENDERER: 0x1F01,
  VERSION: 0x1F02,
  SHADING_LANGUAGE_VERSION: 0x8B8C,
  getParameter: jest.fn(),
  getExtension: jest.fn(),
};

// Mock WebGL debug extension
const mockDebugExtension = {
  UNMASKED_VENDOR_WEBGL: 0x9245,
  UNMASKED_RENDERER_WEBGL: 0x9246,
};

// Mock 2D context
const mockCanvasContext2D = {
  textBaseline: 'alphabetic',
  fillStyle: '#000000',
  font: '10px sans-serif',
  globalCompositeOperation: 'source-over',
  fillRect: jest.fn(),
  fillText: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  closePath: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(),
};

// Mock canvas element
const mockCanvas = {
  width: 300,
  height: 150,
  getContext: jest.fn(),
  toDataURL: jest.fn(),
};

// Mock document
const mockDocument = {
  createElement: jest.fn(),
};

describe('GraphicsFingerprint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup global document mock
    (global as any).document = mockDocument;
    
    // Setup canvas creation mock
    mockDocument.createElement.mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return { ...mockCanvas };
      }
      return {};
    });
    
    // Reset mock implementations
    mockWebGLContext.getParameter.mockClear();
    mockWebGLContext.getExtension.mockClear();
    mockCanvasContext2D.fillRect.mockClear();
    mockCanvasContext2D.fillText.mockClear();
    mockCanvasContext2D.beginPath.mockClear();
    mockCanvasContext2D.arc.mockClear();
    mockCanvasContext2D.closePath.mockClear();
    mockCanvasContext2D.fill.mockClear();
    mockCanvasContext2D.measureText.mockClear();
    mockCanvas.getContext.mockClear();
    mockCanvas.toDataURL.mockClear();
  });

  afterEach(() => {
    delete (global as any).document;
  });

  describe('collect', () => {
    it('should return graphics fingerprint data structure', () => {
      // Mock WebGL context
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl' || type === 'experimental-webgl') {
          return mockWebGLContext;
        }
        if (type === '2d') {
          return mockCanvasContext2D;
        }
        return null;
      });

      // Mock WebGL parameters
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x1F00: return 'WebKit';
          case 0x1F01: return 'WebKit WebGL';
          case 0x1F02: return 'WebGL 1.0';
          case 0x8B8C: return 'WebGL GLSL ES 1.0';
          default: return 'Unknown';
        }
      });

      // Mock canvas operations
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
      mockCanvasContext2D.measureText.mockReturnValue({ width: 100 });

      const result = GraphicsFingerprint.collect();

      expect(result).toHaveProperty('webgl');
      expect(result).toHaveProperty('canvas');
      expect(result).toHaveProperty('fonts');
    });

    it('should handle missing document gracefully', () => {
      delete (global as any).document;

      const result = GraphicsFingerprint.collect();

      expect(result).toEqual({
        webgl: null,
        canvas: null,
        fonts: []
      });
    });
  });

  describe('WebGL fingerprinting', () => {
    beforeEach(() => {
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl' || type === 'experimental-webgl') {
          return mockWebGLContext;
        }
        return null;
      });
    });

    it('should collect WebGL information when available', () => {
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x1F00: return 'Google Inc.';
          case 0x1F01: return 'ANGLE (Intel, Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8681)';
          case 0x1F02: return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
          case 0x8B8C: return 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)';
          default: return 'Unknown';
        }
      });

      mockWebGLContext.getExtension.mockReturnValue(null);

      const result = GraphicsFingerprint.collect();

      expect(result.webgl).toEqual({
        vendor: 'Google Inc.',
        renderer: 'ANGLE (Intel, Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8681)',
        version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
        shadingLanguageVersion: 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)'
      });
    });

    it('should collect unmasked vendor and renderer when debug extension is available', () => {
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x1F00: return 'Google Inc.';
          case 0x1F01: return 'ANGLE';
          case 0x1F02: return 'WebGL 1.0';
          case 0x8B8C: return 'WebGL GLSL ES 1.0';
          case 0x9245: return 'Intel Inc.';
          case 0x9246: return 'Intel(R) HD Graphics 620';
          default: return 'Unknown';
        }
      });

      mockWebGLContext.getExtension.mockReturnValue(mockDebugExtension);

      const result = GraphicsFingerprint.collect();

      expect(result.webgl).toEqual({
        vendor: 'Google Inc.',
        renderer: 'ANGLE',
        version: 'WebGL 1.0',
        shadingLanguageVersion: 'WebGL GLSL ES 1.0',
        unmaskedVendor: 'Intel Inc.',
        unmaskedRenderer: 'Intel(R) HD Graphics 620'
      });
    });

    it('should return null when WebGL is not supported', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const result = GraphicsFingerprint.collect();

      expect(result.webgl).toBeNull();
    });

    it('should fallback to experimental-webgl when webgl is not available', () => {
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl') {
          return null;
        }
        if (type === 'experimental-webgl') {
          return mockWebGLContext;
        }
        return null;
      });

      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x1F00: return 'WebKit';
          case 0x1F01: return 'WebKit WebGL';
          case 0x1F02: return 'WebGL 1.0';
          case 0x8B8C: return 'WebGL GLSL ES 1.0';
          default: return 'Unknown';
        }
      });

      const result = GraphicsFingerprint.collect();

      expect(result.webgl).toBeDefined();
      expect(result.webgl!.vendor).toBe('WebKit');
    });

    it('should handle WebGL context creation errors', () => {
      mockCanvas.getContext.mockImplementation(() => {
        throw new Error('WebGL context creation failed');
      });

      const result = GraphicsFingerprint.collect();

      expect(result.webgl).toBeNull();
    });

    it('should handle WebGL parameter retrieval errors', () => {
      mockWebGLContext.getParameter.mockImplementation(() => {
        throw new Error('Parameter retrieval failed');
      });

      const result = GraphicsFingerprint.collect();

      expect(result.webgl).toBeNull();
    });
  });

  describe('Canvas fingerprinting', () => {
    beforeEach(() => {
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === '2d') {
          return mockCanvasContext2D;
        }
        return null;
      });
    });

    it('should generate canvas fingerprint when 2D context is available', () => {
      const expectedDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      mockCanvas.toDataURL.mockReturnValue(expectedDataURL);

      const result = GraphicsFingerprint.collect();

      expect(result.canvas).toBe(expectedDataURL);
    });

    it('should draw complex pattern for fingerprinting', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,test');

      GraphicsFingerprint.collect();

      // Check text baseline
      expect(mockCanvasContext2D.textBaseline).toBe('alphabetic');

      // Check drawing operations
      expect(mockCanvasContext2D.fillRect).toHaveBeenCalledWith(125, 1, 62, 20);
      expect(mockCanvasContext2D.fillText).toHaveBeenCalledWith('FPS Device Fingerprint 🔍', 2, 15);
      expect(mockCanvasContext2D.fillText).toHaveBeenCalledWith('TypeScript Client v1.0', 4, 45);

      // Check geometric shapes
      expect(mockCanvasContext2D.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext2D.arc).toHaveBeenCalledWith(50, 50, 50, 0, Math.PI * 2, true);
      expect(mockCanvasContext2D.closePath).toHaveBeenCalled();
      expect(mockCanvasContext2D.fill).toHaveBeenCalled();

      // Check styles
      expect(mockCanvasContext2D.fillStyle).toBe('rgb(255,0,255)');
      expect(mockCanvasContext2D.globalCompositeOperation).toBe('multiply');
    });

    it('should return null when 2D context is not available', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const result = GraphicsFingerprint.collect();

      expect(result.canvas).toBeNull();
    });

    it('should handle canvas drawing errors', () => {
      mockCanvasContext2D.fillRect.mockImplementation(() => {
        throw new Error('Canvas drawing error');
      });

      const result = GraphicsFingerprint.collect();

      expect(result.canvas).toBeNull();
    });

    it('should handle toDataURL errors', () => {
      mockCanvas.toDataURL.mockImplementation(() => {
        throw new Error('toDataURL failed');
      });

      const result = GraphicsFingerprint.collect();

      expect(result.canvas).toBeNull();
    });
  });

  describe('Font detection', () => {
    beforeEach(() => {
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === '2d') {
          return mockCanvasContext2D;
        }
        return null;
      });
    });

    it('should detect available fonts when canvas context is available', () => {
      // Mock different widths for different fonts - simulate the baseline measurement
      let fontCallCount = 0;
      mockCanvasContext2D.measureText.mockImplementation((text: string) => {
        const font = mockCanvasContext2D.font;
        fontCallCount++;
        
        // First call is baseline measurement with 'serif'
        if (font.includes('serif') && !font.includes(',')) {
          return { width: 100 }; // baseline width
        }
        
        // Subsequent calls test specific fonts
        if (font.includes('Arial,')) return { width: 150 };
        if (font.includes('Times,')) return { width: 130 };
        if (font.includes('Helvetica,')) return { width: 145 };
        
        return { width: 100 }; // same as baseline - font not available
      });

      const result = GraphicsFingerprint.collect();

      expect(result.fonts).toContain('Arial');
      expect(result.fonts).toContain('Times');
      expect(result.fonts).toContain('Helvetica');
      expect(result.fonts.length).toBeGreaterThan(0);
    });

    it('should return empty array when canvas context is not available', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const result = GraphicsFingerprint.collect();

      expect(result.fonts).toEqual([]);
    });

    it('should handle all fonts having same width as baseline', () => {
      // All fonts return same width as baseline
      mockCanvasContext2D.measureText.mockReturnValue({ width: 100 });

      const result = GraphicsFingerprint.collect();

      expect(result.fonts).toEqual([]);
    });

    it('should test specific font list', () => {
      const expectedFonts = [
        'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
        'Avant Garde', 'Calibri', 'Candara', 'Century Gothic', 'Comic Sans MS',
        'Courier', 'Courier New', 'Geneva', 'Georgia', 'Helvetica',
        'Helvetica Neue', 'Impact', 'Lucida Console', 'Lucida Grande',
        'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Monaco', 'Palatino',
        'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana'
      ];

      // Mock different width for Arial only - first call is baseline measurement
      let callIndex = 0;
      mockCanvasContext2D.measureText.mockImplementation((text: string) => {
        const font = mockCanvasContext2D.font;
        callIndex++;
        
        // First call is baseline measurement
        if (callIndex === 1) {
          return { width: 100 }; // baseline
        }
        
        // Only Arial shows different width
        if (font.includes('Arial,')) {
          return { width: 150 };
        }
        
        return { width: 100 }; // baseline width
      });

      GraphicsFingerprint.collect();

      // Verify that the font detection logic tests all expected fonts
      expect(mockCanvasContext2D.measureText).toHaveBeenCalledWith('mmmmmmmmmmlli');
      
      // Should be called 28 times: once for baseline + 27 font tests
      expect(mockCanvasContext2D.measureText).toHaveBeenCalledTimes(28);
    });

    it('should handle measureText errors gracefully', () => {
      mockCanvasContext2D.measureText.mockImplementation(() => {
        throw new Error('measureText failed');
      });

      const result = GraphicsFingerprint.collect();

      expect(result.fonts).toEqual([]);
    });

    it('should detect multiple fonts correctly', () => {
      const fontWidths: { [key: string]: number } = {
        'serif': 100, // baseline
        'Arial': 150,
        'Times': 130,
        'Georgia': 140,
        'Helvetica': 145
      };

      let callIndex = 0;
      mockCanvasContext2D.measureText.mockImplementation((text: string) => {
        const font = mockCanvasContext2D.font;
        callIndex++;
        
        // First call is baseline measurement
        if (callIndex === 1) {
          return { width: 100 }; // baseline
        }
        
        // Check for specific fonts in the font string
        for (const [fontName, width] of Object.entries(fontWidths)) {
          if (font.includes(fontName + ',')) {
            return { width };
          }
        }
        return { width: 100 };
      });

      const result = GraphicsFingerprint.collect();

      expect(result.fonts).toContain('Arial');
      expect(result.fonts).toContain('Times');
      expect(result.fonts).toContain('Georgia');
      expect(result.fonts).toContain('Helvetica');
      expect(result.fonts.length).toBe(4);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle document.createElement errors', () => {
      mockDocument.createElement.mockImplementation(() => {
        throw new Error('createElement failed');
      });

      const result = GraphicsFingerprint.collect();

      expect(result).toEqual({
        webgl: null,
        canvas: null,
        fonts: []
      });
    });

    it('should handle mixed success and failure scenarios', () => {
      // WebGL works, canvas fails
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl') {
          return mockWebGLContext;
        }
        if (type === '2d') {
          throw new Error('2D context failed');
        }
        return null;
      });

      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x1F00: return 'WebKit';
          case 0x1F01: return 'WebKit WebGL';
          case 0x1F02: return 'WebGL 1.0';
          case 0x8B8C: return 'WebGL GLSL ES 1.0';
          default: return 'Unknown';
        }
      });

      const result = GraphicsFingerprint.collect();

      expect(result.webgl).toBeDefined();
      expect(result.webgl!.vendor).toBe('WebKit');
      expect(result.canvas).toBeNull();
      expect(result.fonts).toEqual([]);
    });

    it('should handle all methods failing', () => {
      mockCanvas.getContext.mockImplementation(() => {
        throw new Error('Context creation failed');
      });

      const result = GraphicsFingerprint.collect();

      expect(result).toEqual({
        webgl: null,
        canvas: null,
        fonts: []
      });
    });
  });

  describe('data consistency and uniqueness', () => {
    it('should return consistent results for same environment', () => {
      // Setup consistent mocks
      mockCanvas.getContext.mockImplementation((type: string) => {
        if (type === 'webgl') return mockWebGLContext;
        if (type === '2d') return mockCanvasContext2D;
        return null;
      });

      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 0x1F00: return 'Consistent Vendor';
          case 0x1F01: return 'Consistent Renderer';
          case 0x1F02: return 'WebGL 1.0';
          case 0x8B8C: return 'GLSL 1.0';
          default: return 'Unknown';
        }
      });

      mockCanvas.toDataURL.mockReturnValue('consistent-data-url');
      mockCanvasContext2D.measureText.mockReturnValue({ width: 100 });

      const result1 = GraphicsFingerprint.collect();
      const result2 = GraphicsFingerprint.collect();

      expect(result1).toEqual(result2);
    });
  });
});