import { collectPlugins } from '../../../../../../src/client/fingerprint/modules/browser/plugins';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock navigator
const mockNavigator = {
  plugins: undefined as any,
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Plugins Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock values using defineProperty to avoid getter-only errors
    try {
      mockNavigator.plugins = undefined;
    } catch {
      // Property might be read-only, use defineProperty
      Object.defineProperty(mockNavigator, 'plugins', {
        value: undefined,
        writable: true,
        configurable: true
      });
    }
  });

  describe('collectPlugins', () => {
    it('should collect plugin names successfully', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Chrome PDF Plugin' },
        1: { name: 'Widevine Content Decryption Module' },
        2: { name: 'Flash Player' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Chrome PDF Plugin', 'Widevine Content Decryption Module', 'Flash Player']);
    });

    it('should return empty array when no plugins are available', () => {
      // Arrange
      const mockPlugins = {
        length: 0
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return UNDEFINED when navigator.plugins is not available', () => {
      // Arrange
      mockNavigator.plugins = undefined;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return UNDEFINED when navigator.plugins is null', () => {
      // Arrange
      mockNavigator.plugins = null;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should skip null plugin entries', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Plugin 1' },
        1: null, // Null plugin
        2: { name: 'Plugin 3' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Plugin 1', 'Plugin 3']);
    });

    it('should skip undefined plugin entries', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Plugin 1' },
        1: undefined, // Undefined plugin
        2: { name: 'Plugin 3' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Plugin 1', 'Plugin 3']);
    });

    it('should handle plugins with empty names', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Valid Plugin' },
        1: { name: '' }, // Empty name
        2: { name: 'Another Plugin' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Valid Plugin', '', 'Another Plugin']);
    });

    it('should handle plugins without name property', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Plugin 1' },
        1: {}, // No name property
        2: { name: 'Plugin 3' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Plugin 1', undefined, 'Plugin 3']);
    });

    it('should handle plugins with non-string name property', () => {
      // Arrange
      const mockPlugins = {
        length: 4,
        0: { name: 'Valid Plugin' },
        1: { name: 123 }, // Number name
        2: { name: true }, // Boolean name
        3: { name: { toString: () => 'Object Name' } } // Object name
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Valid Plugin', 123, true, { toString: expect.any(Function) }]);
    });

    it('should handle large number of plugins', () => {
      // Arrange
      const pluginCount = 100;
      const mockPlugins: any = { length: pluginCount };
      for (let i = 0; i < pluginCount; i++) {
        mockPlugins[i] = { name: `Plugin ${i}` };
      }
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toHaveLength(pluginCount);
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result[0]).toBe('Plugin 0');
        expect(result[pluginCount - 1]).toBe(`Plugin ${pluginCount - 1}`);
      }
    });

    it('should handle plugins with special characters in names', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Plugin with spaces' },
        1: { name: 'Plugin-with-dashes' },
        2: { name: 'Plugin (with parentheses) & symbols!' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual([
        'Plugin with spaces',
        'Plugin-with-dashes',
        'Plugin (with parentheses) & symbols!'
      ]);
    });

    it('should handle plugins with unicode characters in names', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Plugin français' },
        1: { name: 'プラグイン' },
        2: { name: 'Плагин' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Plugin français', 'プラグイン', 'Плагин']);
    });

    it('should return ERROR when an exception occurs', () => {
      // Arrange
      Object.defineProperty(mockNavigator, 'plugins', {
        get: () => {
          throw new Error('Test error');
        }
      });

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle plugins collection that throws on access', () => {
      // Arrange
      const mockPlugins = {
        length: 2,
        0: { name: 'Plugin 1' },
        get 1() {
          throw new Error('Plugin access error');
        }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle plugins with null name property', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Plugin 1' },
        1: { name: null }, // Null name
        2: { name: 'Plugin 3' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Plugin 1', null, 'Plugin 3']);
    });

    it('should handle plugins with undefined name property', () => {
      // Arrange
      const mockPlugins = {
        length: 3,
        0: { name: 'Plugin 1' },
        1: { name: undefined }, // Undefined name
        2: { name: 'Plugin 3' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Plugin 1', undefined, 'Plugin 3']);
    });

    it('should work with real-world plugin examples', () => {
      // Arrange
      const mockPlugins = {
        length: 5,
        0: { name: 'Chrome PDF Plugin' },
        1: { name: 'Widevine Content Decryption Module' },
        2: { name: 'Native Client' },
        3: { name: 'Flash Player' },
        4: { name: 'Java Deployment Toolkit' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual([
        'Chrome PDF Plugin',
        'Widevine Content Decryption Module',
        'Native Client',
        'Flash Player',
        'Java Deployment Toolkit'
      ]);
    });

    it('should handle sparse plugin arrays', () => {
      // Arrange - Some indices are missing
      const mockPlugins = {
        length: 5,
        0: { name: 'Plugin 0' },
        // 1 is missing
        2: { name: 'Plugin 2' },
        // 3 is missing  
        4: { name: 'Plugin 4' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Plugin 0', 'Plugin 2', 'Plugin 4']);
    });

    it('should handle plugins length being 0', () => {
      // Arrange
      const mockPlugins = {
        length: 0
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle plugins length being negative', () => {
      // Arrange
      const mockPlugins = {
        length: -1
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle plugins length being NaN', () => {
      // Arrange
      const mockPlugins = {
        length: NaN
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle plugins length being a string', () => {
      // Arrange
      const mockPlugins = {
        length: '2',
        0: { name: 'Plugin 1' },
        1: { name: 'Plugin 2' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Plugin 1', 'Plugin 2']);
    });

    it('should preserve order of plugins as they appear', () => {
      // Arrange
      const mockPlugins = {
        length: 4,
        0: { name: 'Z Plugin' },
        1: { name: 'A Plugin' },
        2: { name: 'M Plugin' },
        3: { name: 'B Plugin' }
      };
      mockNavigator.plugins = mockPlugins;

      // Act
      const result = collectPlugins();

      // Assert
      expect(result).toEqual(['Z Plugin', 'A Plugin', 'M Plugin', 'B Plugin']);
      // Should NOT be sorted alphabetically
    });
  });
});
