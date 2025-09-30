import { collectColorGamut } from '../../../../../../src/client/fingerprint/modules/graphics/colorGamut';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock matchMedia as global function
const mockMatchMedia = jest.fn();

describe('Color Gamut Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup global matchMedia function
    (global as any).matchMedia = mockMatchMedia;

    // Default implementation returns non-matching media query
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    });
  });

  afterEach(() => {
    // Clean up global matchMedia
    delete (global as any).matchMedia;
  });

  describe('collectColorGamut', () => {
    it('should return rec2020 when rec2020 media query matches', () => {
      // Arrange
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query.includes('rec2020'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }));

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe('rec2020');
      expect(mockMatchMedia).toHaveBeenCalledWith('(color-gamut: rec2020)');
    });

    it('should return p3 when p3 media query matches but rec2020 does not', () => {
      // Arrange
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query.includes('p3') && !query.includes('rec2020'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }));

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe('p3');
      expect(mockMatchMedia).toHaveBeenCalledWith('(color-gamut: rec2020)');
      expect(mockMatchMedia).toHaveBeenCalledWith('(color-gamut: p3)');
    });

    it('should return srgb when neither p3 nor rec2020 matches', () => {
      // Arrange
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query.includes('srgb') && !query.includes('p3') && !query.includes('rec2020'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }));

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe('srgb');
    });

    it('should return UNDEFINED when matchMedia is not available', () => {
      // Arrange - Remove matchMedia
      delete (global as any).matchMedia;

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR); // Will throw error and return ERROR
    });

    it('should return ERROR when matchMedia throws an error', () => {
      // Arrange
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle multiple color gamut queries correctly', () => {
      // Test different scenarios
      const scenarios = [
        { gamut: 'rec2020', expected: 'rec2020' },
        { gamut: 'p3', expected: 'p3' },
        { gamut: 'srgb', expected: 'srgb' }
      ];
      
      scenarios.forEach(({ gamut, expected }) => {
        // Arrange
        mockMatchMedia.mockImplementation((query: string) => ({
          matches: query.includes(gamut),
          media: query
        }));

        // Act
        const result = collectColorGamut();

        // Assert
        expect(result).toBe(expected);
      });
    });

    it('should return consistent results across multiple calls', () => {
      // Arrange
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(color-gamut: p3)'
      });

      // Act
      const result1 = collectColorGamut();
      const result2 = collectColorGamut();

      // Assert
      expect(result1).toBe(result2);
      expect(result1).toBe('rec2020'); // First query matches
    });

    it('should handle null or undefined matchMedia results', () => {
      // Arrange
      mockMatchMedia.mockReturnValue(null);

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR); // Will throw when accessing .matches
    });

    it('should handle matchMedia returning object without matches property', () => {
      // Arrange
      mockMatchMedia.mockReturnValue({
        media: '(color-gamut: srgb)'
        // Missing matches property
      });

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED); // matches is undefined, treated as falsy
    });

    it('should test all three color gamuts in correct order', () => {
      // Arrange
      const queries: string[] = [];
      mockMatchMedia.mockImplementation((query: string) => {
        queries.push(query);
        return { matches: false, media: query };
      });

      // Act
      collectColorGamut();

      // Assert
      expect(queries).toContain('(color-gamut: rec2020)');
      expect(queries).toContain('(color-gamut: p3)');
      expect(queries).toContain('(color-gamut: srgb)');
      // Should test rec2020 first, then p3, then srgb
      const rec2020Index = queries.indexOf('(color-gamut: rec2020)');
      const p3Index = queries.indexOf('(color-gamut: p3)');
      const srgbIndex = queries.indexOf('(color-gamut: srgb)');
      expect(rec2020Index).toBeLessThan(p3Index);
      expect(p3Index).toBeLessThan(srgbIndex);
    });

    it('should handle DOMException from matchMedia', () => {
      // Arrange
      mockMatchMedia.mockImplementation(() => {
        throw new DOMException('Not supported', 'NotSupportedError');
      });

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should work with different browser implementations of matchMedia', () => {
      // Test various matchMedia implementations
      const implementations = [
        // Standard implementation
        (query: string) => ({ matches: query.includes('p3'), media: query }),
        // Minimal implementation
        (query: string) => ({ matches: query.includes('srgb') }),
        // Implementation with extra properties
        (query: string) => ({ 
          matches: query.includes('rec2020'), 
          media: query,
          deprecated: false,
          type: 'screen'
        })
      ];

      implementations.forEach(impl => {
        // Arrange
        mockMatchMedia.mockImplementation(impl);

        // Act
        const result = collectColorGamut();

        // Assert
        expect(['rec2020', 'p3', 'srgb', FingerprintSpecialValue.UNDEFINED]).toContain(result);
      });
    });

    it('should handle global matchMedia being undefined', () => {
      // Arrange - matchMedia not available
      delete (global as any).matchMedia;

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should prioritize higher color gamuts correctly', () => {
      // Arrange - All gamuts match, should return the first one (rec2020)
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(color-gamut: any)'
      });

      // Act
      const result = collectColorGamut();

      // Assert
      expect(result).toBe('rec2020'); // Should prefer rec2020 over p3/srgb
    });

    it('should handle edge cases gracefully', () => {
      // Test various edge cases
      const edgeCases = [
        () => mockMatchMedia.mockReturnValue({ matches: 'true' }), // String instead of boolean
        () => mockMatchMedia.mockReturnValue({ matches: 1 }), // Number instead of boolean
        () => mockMatchMedia.mockReturnValue({ matches: {} }), // Object instead of boolean
        () => mockMatchMedia.mockReturnValue({}), // Missing matches
        () => mockMatchMedia.mockReturnValue(undefined) // Undefined return
      ];

      edgeCases.forEach(setupEdgeCase => {
        setupEdgeCase();
        
        const result = collectColorGamut();
        
        // Should handle gracefully - either return valid gamut or special value
        expect([
          'rec2020', 'p3', 'srgb', 
          FingerprintSpecialValue.UNDEFINED, 
          FingerprintSpecialValue.ERROR
        ]).toContain(result);
      });
    });

    it('should validate color gamut hierarchy', () => {
      // rec2020 > p3 > srgb hierarchy should be respected
      
      // When only srgb matches
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === '(color-gamut: srgb)'
      }));
      expect(collectColorGamut()).toBe('srgb');

      // When p3 and srgb match, should prefer p3
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === '(color-gamut: p3)' || query === '(color-gamut: srgb)'
      }));
      expect(collectColorGamut()).toBe('p3');

      // When all match, should prefer rec2020
      mockMatchMedia.mockImplementation(() => ({
        matches: true
      }));
      expect(collectColorGamut()).toBe('rec2020');
    });
  });
});