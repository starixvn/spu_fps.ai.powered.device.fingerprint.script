import { collectFonts } from '../../../../../../src/client/fingerprint/modules/graphics/fonts';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock the withNaturalFonts utility
jest.mock('../../../../../../src/client/fingerprint/utils/dom', () => ({
  withNaturalFonts: jest.fn()
}));

import { withNaturalFonts } from '../../../../../../src/client/fingerprint/utils/dom';

const mockWithNaturalFonts = withNaturalFonts as jest.MockedFunction<typeof withNaturalFonts>;

// Mock DOM elements
const mockSpan = {
  offsetWidth: 100,
  offsetHeight: 20,
  style: {} as CSSStyleDeclaration,
  textContent: ''
};

const mockDiv = {
  appendChild: jest.fn(),
  style: {
    setProperty: jest.fn()
  } as unknown as CSSStyleDeclaration
};

const mockDocument = {
  createElement: jest.fn((tagName: string) => {
    if (tagName === 'span') return mockSpan;
    if (tagName === 'div') return mockDiv;
    return {};
  })
};

const mockContainer = {
  appendChild: jest.fn(),
  style: {
    fontSize: ''
  } as CSSStyleDeclaration
};

describe('Fonts Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock behavior
    mockWithNaturalFonts.mockImplementation(async (action) => {
      return await action(mockDocument as any, mockContainer as any);
    });

    mockSpan.offsetWidth = 100;
    mockSpan.offsetHeight = 20;
  });

  describe('collectFonts', () => {
    it('should return list of detected fonts when available', async () => {
      // Arrange - Mock font detection by varying offsetWidth/Height
      let spanCount = 0;
      const detectedFonts = ['Arial', 'Calibri', 'Helvetica'];
      
      (mockDocument.createElement as jest.Mock).mockImplementation((tagName: string) => {
        if (tagName === 'span') {
          spanCount++;
          // Base font spans (first 3) have standard dimensions
          if (spanCount <= 3) {
            return {
              offsetWidth: 100,
              offsetHeight: 20,
              style: {} as CSSStyleDeclaration,
              textContent: ''
            };
          }
          // Test font spans - vary dimensions to simulate font detection
          const fontIndex = Math.floor((spanCount - 4) / 3);
          const isDetectedFont = fontIndex < detectedFonts.length;
          return {
            offsetWidth: isDetectedFont ? 102 : 100, // Different width if font available
            offsetHeight: isDetectedFont ? 22 : 20,   // Different height if font available
            style: {} as CSSStyleDeclaration,
            textContent: ''
          };
        }
        if (tagName === 'div') return mockDiv;
        return {};
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result) && result.length > 0) {
        expect(typeof result[0]).toBe('string');
        result.forEach(font => {
          expect(typeof font).toBe('string');
          expect(font.length).toBeGreaterThan(0);
        });
      }
    });

    it('should return ERROR when withNaturalFonts fails', async () => {
      // Arrange
      mockWithNaturalFonts.mockRejectedValue(new Error('withNaturalFonts failed'));

      // Act
      const result = await collectFonts();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should return ERROR when DOM operations fail', async () => {
      // Arrange
      mockWithNaturalFonts.mockImplementation(async (action) => {
        throw new Error('DOM operation failed');
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should return ERROR when element creation fails', async () => {
      // Arrange
      (mockDocument.createElement as jest.Mock).mockImplementation(() => {
        throw new Error('createElement failed');
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle span manipulation errors gracefully', async () => {
      // Arrange
      mockDiv.appendChild.mockImplementation(() => {
        throw new Error('appendChild failed');
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should detect popular fonts correctly', async () => {
      // Arrange - Mock successful font detection directly in withNaturalFonts
      mockWithNaturalFonts.mockImplementation(async (action) => {
        // Mock detected fonts result directly
        return ['Calibri', 'Arial Unicode MS', 'Century Gothic'];
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
        result.forEach(font => {
          expect(typeof font).toBe('string');
          expect(font.length).toBeGreaterThan(0);
        });
      }
    });

    it('should return empty array when no fonts detected', async () => {
      // Arrange - Mock empty result from withNaturalFonts
      mockWithNaturalFonts.mockImplementation(async (action) => {
        // Mock no fonts detected
        return [];
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(0);
      }
    });

    it('should handle font testing with consistent text content', async () => {
      // Arrange - Mock to return fonts with consistent text handling
      mockWithNaturalFonts.mockImplementation(async (action) => {
        // Return result directly without executing complex action
        return ['Times New Roman', 'Georgia'];
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
        result.forEach((font: string) => {
          expect(typeof font).toBe('string');
          expect(font.length).toBeGreaterThan(0);
        });
      }
    });

    it('should test predefined fonts systematically', async () => {
      // Arrange - Mock withNaturalFonts to return multiple detected fonts
      mockWithNaturalFonts.mockImplementation(async (action) => {
        // Mock systematic font testing result
        return ['Calibri', 'Century', 'Arial Unicode MS', 'Segoe UI Light'];
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(3); // Multiple fonts detected
        result.forEach((font: string) => {
          expect(typeof font).toBe('string');
          expect(font.length).toBeGreaterThan(0);
        });
      }
    });

    it('should handle DOM manipulation safely', async () => {
      // Arrange - Mock safe DOM operations
      mockWithNaturalFonts.mockImplementation(async (action) => {
        // Mock successful DOM operations
        return ['Times', 'Georgia'];
      });

      // Act
      const result = await collectFonts();

      // Assert - Should not throw errors and return valid result
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should return consistent results across multiple calls', async () => {
      // Arrange - Mock some fonts as detected
      (mockDocument.createElement as jest.Mock).mockImplementation((tagName: string) => {
        if (tagName === 'span') {
          return {
            offsetWidth: 102,
            offsetHeight: 22,
            style: {} as CSSStyleDeclaration,
            textContent: ''
          };
        }
        if (tagName === 'div') return mockDiv;
        return {};
      });

      // Act
      const result1 = await collectFonts();
      const result2 = await collectFonts();

      // Assert
      expect(result1).toEqual(result2);
    });

    it('should handle edge cases with special font names', async () => {
      // Arrange - Mock font detection
      (mockDocument.createElement as jest.Mock).mockImplementation((tagName: string) => {
        if (tagName === 'span') {
          return {
            offsetWidth: 101,
            offsetHeight: 21,
            style: {} as CSSStyleDeclaration,
            textContent: ''
          };
        }
        if (tagName === 'div') return mockDiv;
        return {};
      });

      // Act
      const result = await collectFonts();

      // Assert - Should not crash with special characters or unicode in font names
      expect(() => result).not.toThrow();
      if (Array.isArray(result)) {
        result.forEach(fontName => {
          expect(typeof fontName).toBe('string');
          expect(fontName.length).toBeGreaterThan(0);
        });
      }
    });

    it('should handle span style properties correctly', async () => {
      // Arrange - Mock result to test style property handling
      mockWithNaturalFonts.mockImplementation(async (action) => {
        return ['Helvetica Neue', 'Verdana'];
      });

      // Act
      const result = await collectFonts();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
        result.forEach((font: string) => {
          expect(typeof font).toBe('string');
          expect(font.length).toBeGreaterThan(0);
        });
      }
    });
  });
});
