import { collectFontPreferences } from '../../../../../../src/client/fingerprint/modules/graphics/fontPreferences';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock the withNaturalFonts utility
jest.mock('../../../../../../src/client/fingerprint/utils/dom', () => ({
  withNaturalFonts: jest.fn()
}));

import { withNaturalFonts } from '../../../../../../src/client/fingerprint/utils/dom';

const mockWithNaturalFonts = withNaturalFonts as jest.MockedFunction<typeof withNaturalFonts>;

// Mock DOM elements
const mockElement = {
  getBoundingClientRect: jest.fn(() => ({ width: 100 })),
  style: {} as CSSStyleDeclaration,
  textContent: ''
};

const mockDocument = {
  createElement: jest.fn((tagName: string) => {
    if (tagName === 'span') return mockElement;
    return { style: {} as CSSStyleDeclaration };
  })
};

const mockContainer = {
  appendChild: jest.fn()
};

describe('Font Preferences Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock behavior
    mockWithNaturalFonts.mockImplementation(async (action) => {
      return await action(mockDocument as any, mockContainer as any);
    });
    
    mockElement.getBoundingClientRect.mockReturnValue({ width: 100 } as DOMRect);
  });

  describe('collectFontPreferences', () => {
    it('should return font preference measurements when available', async () => {
      // Arrange - Set different widths for different font families
      let elementCount = 0;
      mockElement.getBoundingClientRect.mockImplementation(() => {
        elementCount++;
        return { width: 100 + (elementCount % 5) } as DOMRect; // Vary dimensions
      });

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      expect(result).not.toBe(null);
      expect(result).toHaveProperty('default');
      expect(result).toHaveProperty('apple');
      expect(result).toHaveProperty('serif');
      expect(result).toHaveProperty('sans');
      expect(result).toHaveProperty('mono');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('system');

      // All values should be numbers (not error values)
      expect(typeof result.default).toBe('number');
      expect(typeof result.apple).toBe('number');
      expect(typeof result.serif).toBe('number');
      expect(typeof result.sans).toBe('number');
      expect(typeof result.mono).toBe('number');
      expect(typeof result.min).toBe('number');
      expect(typeof result.system).toBe('number');
    });

    it('should return ERROR values when withNaturalFonts fails', async () => {
      // Arrange
      mockWithNaturalFonts.mockRejectedValue(new Error('withNaturalFonts failed'));

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      expect(result.default).toBe(FingerprintSpecialValue.ERROR);
      expect(result.apple).toBe(FingerprintSpecialValue.ERROR);
      expect(result.serif).toBe(FingerprintSpecialValue.ERROR);
      expect(result.sans).toBe(FingerprintSpecialValue.ERROR);
      expect(result.mono).toBe(FingerprintSpecialValue.ERROR);
      expect(result.min).toBe(FingerprintSpecialValue.ERROR);
      expect(result.system).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should return ERROR values when DOM operations fail', async () => {
      // Arrange
      mockWithNaturalFonts.mockImplementation(async (action) => {
        throw new Error('DOM operation failed');
      });

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      expect(result.default).toBe(FingerprintSpecialValue.ERROR);
      expect(result.apple).toBe(FingerprintSpecialValue.ERROR);
      expect(result.serif).toBe(FingerprintSpecialValue.ERROR);
      expect(result.sans).toBe(FingerprintSpecialValue.ERROR);
      expect(result.mono).toBe(FingerprintSpecialValue.ERROR);
      expect(result.min).toBe(FingerprintSpecialValue.ERROR);
      expect(result.system).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should return ERROR values when element creation fails', async () => {
      // Arrange
      mockDocument.createElement.mockImplementation(() => {
        throw new Error('createElement failed');
      });

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      expect(result.default).toBe(FingerprintSpecialValue.ERROR);
      expect(result.apple).toBe(FingerprintSpecialValue.ERROR);
      expect(result.serif).toBe(FingerprintSpecialValue.ERROR);
      expect(result.sans).toBe(FingerprintSpecialValue.ERROR);
      expect(result.mono).toBe(FingerprintSpecialValue.ERROR);
      expect(result.min).toBe(FingerprintSpecialValue.ERROR);
      expect(result.system).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should detect different font family preferences', async () => {
      // Arrange - Mock withNaturalFonts with custom action that creates different elements
      let elementIndex = 0;
      const fontWidths = [100, 102, 98, 105, 95, 103, 101]; // Different widths for each font preset
      
      mockWithNaturalFonts.mockImplementation(async (action) => {
        elementIndex = 0; // Reset for each call
        
        const mockDoc = {
          createElement: jest.fn((tagName: string) => {
            if (tagName === 'span') {
              const element = {
                getBoundingClientRect: jest.fn().mockReturnValue({
                  width: fontWidths[elementIndex],
                  height: 20,
                  top: 0,
                  left: 0,
                  bottom: 20,
                  right: fontWidths[elementIndex]
                } as DOMRect),
                style: {} as CSSStyleDeclaration,
                textContent: '',
                appendChild: jest.fn()
              };
              elementIndex++;
              return element;
            }
            return { 
              style: {} as CSSStyleDeclaration,
              appendChild: jest.fn()
            }; // For 'br' elements
          })
        };
        
        return await action(mockDoc as any, mockContainer as any);
      });

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('default');
      expect(result).toHaveProperty('apple'); 
      expect(result).toHaveProperty('serif');
      expect(result).toHaveProperty('sans');
      expect(result).toHaveProperty('mono');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('system');

      // Should detect variations in font rendering
      const values = Object.values(result).filter(v => typeof v === 'number') as number[];
      expect(values.length).toBe(7); // All 7 font presets
      
      // Should have some variation in measurements
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });

    it('should handle getBoundingClientRect errors', async () => {
      // Arrange - Mock withNaturalFonts to throw error during getBoundingClientRect
      mockWithNaturalFonts.mockImplementation(async (action) => {
        const mockErrorElement = {
          getBoundingClientRect: jest.fn(() => {
            throw new Error('getBoundingClientRect failed');
          }),
          style: {} as CSSStyleDeclaration,
          textContent: ''
        };
        
        const mockDoc = {
          createElement: jest.fn((tagName: string) => {
            if (tagName === 'span') return mockErrorElement;
            return { style: {} as CSSStyleDeclaration };
          })
        };
        
        return await action(mockDoc as any, mockContainer as any);
      });

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      expect(result.default).toBe(FingerprintSpecialValue.ERROR);
      expect(result.apple).toBe(FingerprintSpecialValue.ERROR);
      expect(result.serif).toBe(FingerprintSpecialValue.ERROR);
      expect(result.sans).toBe(FingerprintSpecialValue.ERROR);
      expect(result.mono).toBe(FingerprintSpecialValue.ERROR);
      expect(result.min).toBe(FingerprintSpecialValue.ERROR);
      expect(result.system).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should create span elements for each font preset', async () => {
      // Arrange
      const createElementSpy = jest.fn((tagName: string) => {
        if (tagName === 'span') return mockElement;
        return { style: {} as CSSStyleDeclaration }; // For 'br' elements
      });
      (mockDocument.createElement as jest.Mock) = createElementSpy;

      // Act
      await collectFontPreferences();

      // Assert
      expect(createElementSpy).toHaveBeenCalledWith('span');
      expect(createElementSpy).toHaveBeenCalledWith('br');
      expect(createElementSpy).toHaveBeenCalledTimes(14); // 7 span + 7 br elements
      
      // Check specific calls for span elements
      const spanCalls = createElementSpy.mock.calls.filter(call => call[0] === 'span');
      expect(spanCalls.length).toBe(7);
    });

    it('should test all font presets systematically', async () => {
      // Arrange
      const createElementSpy = jest.fn((tagName: string) => {
        if (tagName === 'span') return mockElement;
        return { style: {} as CSSStyleDeclaration }; // For 'br' elements
      });
      const appendChildSpy = jest.fn();
      
      (mockDocument.createElement as jest.Mock) = createElementSpy;
      (mockContainer.appendChild as jest.Mock) = appendChildSpy;

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(createElementSpy).toHaveBeenCalledWith('span');
      expect(createElementSpy).toHaveBeenCalledWith('br');
      expect(createElementSpy).toHaveBeenCalledTimes(14); // 7 span + 7 br elements
      expect(appendChildSpy).toHaveBeenCalledTimes(14); // Each element is appended
      
      // Should return measurements for all presets
      expect(typeof result).toBe('object');
      expect(Object.keys(result)).toHaveLength(7);
    });

    it('should return consistent structure with all required properties', async () => {
      // Arrange
      mockElement.getBoundingClientRect.mockReturnValue({ width: 100 } as DOMRect);

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('default');
      expect(result).toHaveProperty('apple');
      expect(result).toHaveProperty('serif');
      expect(result).toHaveProperty('sans');
      expect(result).toHaveProperty('mono');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('system');
      
      // All properties should have numeric values
      expect(typeof result.default).toBe('number');
      expect(typeof result.apple).toBe('number');
      expect(typeof result.serif).toBe('number');
      expect(typeof result.sans).toBe('number');
      expect(typeof result.mono).toBe('number');
      expect(typeof result.min).toBe('number');
      expect(typeof result.system).toBe('number');
    });

    it('should handle zero width measurements correctly', async () => {
      // Arrange
      mockElement.getBoundingClientRect.mockReturnValue({ width: 0 } as DOMRect);

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      expect(result.default).toBe(0);
      expect(result.apple).toBe(0);
      expect(result.serif).toBe(0);
      expect(result.sans).toBe(0);
      expect(result.mono).toBe(0);
      expect(result.min).toBe(0);
      expect(result.system).toBe(0);
    });

    it('should detect font rendering differences across platforms', async () => {
      // Arrange - Simulate platform-specific font rendering differences
      const platformFontSizes = [100, 102, 105, 98, 110, 95, 101]; // Different sizes for each preset
      let measurementCount = 0;
      
      mockElement.getBoundingClientRect.mockImplementation(() => {
        const width = platformFontSizes[measurementCount % platformFontSizes.length];
        measurementCount++;
        return { width } as DOMRect;
      });

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(typeof result).toBe('object');
      const values = Object.values(result).filter(v => typeof v === 'number') as number[];
      expect(values.length).toBe(7);
      
      // Should detect variations in font rendering across different categories
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });

    it('should handle withNaturalFonts async operation correctly', async () => {
      // Arrange
      let actionCalled = false;
      mockWithNaturalFonts.mockImplementation(async (action) => {
        actionCalled = true;
        return await action(mockDocument as any, mockContainer as any);
      });

      // Act
      const result = await collectFontPreferences();

      // Assert
      expect(actionCalled).toBe(true);
      expect(typeof result).toBe('object');
      expect(withNaturalFonts).toHaveBeenCalledTimes(1);
    });

    it('should set element properties correctly', async () => {
      // Arrange
      let textContentSet = '';
      let whiteSpaceSet = '';
      const mockElementWithProps = {
        getBoundingClientRect: jest.fn(() => ({ width: 100 } as DOMRect)),
        style: {} as CSSStyleDeclaration,
        set textContent(value: string) { textContentSet = value; },
        get textContent() { return textContentSet; }
      };
      
      Object.defineProperty(mockElementWithProps.style, 'whiteSpace', {
        set: (value: string) => { whiteSpaceSet = value; },
        get: () => whiteSpaceSet
      });

      (mockDocument.createElement as jest.Mock).mockImplementation((tagName: string) => {
        if (tagName === 'span') return mockElementWithProps;
        return { style: {} as CSSStyleDeclaration };
      });

      // Act
      await collectFontPreferences();

      // Assert
      expect(textContentSet).toBe('mmMwWLliI0fiflO&1'); // defaultText
      expect(whiteSpaceSet).toBe('nowrap');
    });
  });
});
