/**
 * @jest-environment jsdom
 */

import { collectOpenDatabase } from '../../../../../../src/client/fingerprint/modules/preference/openDatabase';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

describe('OpenDatabase Module', () => {
  beforeEach(() => {
    // Reset window database APIs
    delete (window as any).openDatabase;
    delete (window as any).webkitOpenDatabase;
    delete (window as any).mozOpenDatabase;
    delete (window as any).msOpenDatabase;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('collectOpenDatabase', () => {
    it('should return UNDEFINED when window is undefined', () => {
      // Arrange
      const originalWindow = global.window;
      delete (global as any).window;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(0); // In jsdom, deleting window triggers outer catch, returns 0

      // Restore window
      (global as any).window = originalWindow;
    });

    it('should return 0 when no database APIs are available', () => {
      // Arrange - no database APIs on window

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(0);
    });

    it('should return 1 when openDatabase API is available and works', () => {
      // Arrange
      const mockOpenDatabase = jest.fn().mockReturnValue({});
      (window as any).openDatabase = mockOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should return 1 when openDatabase API throws error but exists', () => {
      // Arrange
      const mockOpenDatabase = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      (window as any).openDatabase = mockOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should return 1 when webkitOpenDatabase API is available', () => {
      // Arrange
      const mockWebkitOpenDatabase = jest.fn().mockReturnValue({});
      (window as any).webkitOpenDatabase = mockWebkitOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockWebkitOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should return 1 when mozOpenDatabase API is available', () => {
      // Arrange
      const mockMozOpenDatabase = jest.fn().mockReturnValue({});
      (window as any).mozOpenDatabase = mockMozOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockMozOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should return 1 when msOpenDatabase API is available', () => {
      // Arrange
      const mockMsOpenDatabase = jest.fn().mockReturnValue({});
      (window as any).msOpenDatabase = mockMsOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockMsOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should prioritize openDatabase over webkit version', () => {
      // Arrange
      const mockOpenDatabase = jest.fn().mockReturnValue({});
      const mockWebkitOpenDatabase = jest.fn().mockReturnValue({});
      
      (window as any).openDatabase = mockOpenDatabase;
      (window as any).webkitOpenDatabase = mockWebkitOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
      expect(mockWebkitOpenDatabase).not.toHaveBeenCalled();
    });

    it('should check webkit version when openDatabase is not available', () => {
      // Arrange
      const mockWebkitOpenDatabase = jest.fn().mockReturnValue({});
      (window as any).webkitOpenDatabase = mockWebkitOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockWebkitOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should handle non-function database properties', () => {
      // Arrange
      (window as any).openDatabase = "not a function";
      (window as any).webkitOpenDatabase = 12345;
      (window as any).mozOpenDatabase = {};
      (window as any).msOpenDatabase = null;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(0);
    });

    it('should return 0 when all database APIs are not functions', () => {
      // Arrange - Set all database APIs to non-function values
      const originalAPIs = ['openDatabase', 'webkitOpenDatabase', 'mozOpenDatabase', 'msOpenDatabase'].map(api => ({
        name: api,
        value: (window as any)[api]
      }));
      
      // Set all APIs to non-function values
      originalAPIs.forEach(api => {
        (window as any)[api.name] = "not-a-function";
      });

      // Act
      const result = collectOpenDatabase();

      // Assert - Should return 0 when no functional APIs available
      expect(result).toEqual(0);

      // Restore
      originalAPIs.forEach(api => {
        if (api.value !== undefined) {
          (window as any)[api.name] = api.value;
        } else {
          delete (window as any)[api.name];
        }
      });
    });

    it('should check all APIs in order and return first available', () => {
      // Arrange
      const mockMozOpenDatabase = jest.fn().mockReturnValue({});
      (window as any).mozOpenDatabase = mockMozOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockMozOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should handle mixed valid and invalid database APIs', () => {
      // Arrange
      (window as any).openDatabase = "not a function";
      const mockWebkitOpenDatabase = jest.fn().mockReturnValue({});
      (window as any).webkitOpenDatabase = mockWebkitOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockWebkitOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should return 1 even when database function throws error', () => {
      // Arrange
      const mockOpenDatabase = jest.fn().mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      (window as any).openDatabase = mockOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });

    it('should handle undefined database APIs', () => {
      // Arrange
      (window as any).openDatabase = undefined;
      (window as any).webkitOpenDatabase = undefined;
      (window as any).mozOpenDatabase = undefined;
      (window as any).msOpenDatabase = undefined;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(0);
    });

    it('should use last available API if others are not functions', () => {
      // Arrange
      (window as any).openDatabase = "not a function";
      (window as any).webkitOpenDatabase = 123;
      (window as any).mozOpenDatabase = {};
      const mockMsOpenDatabase = jest.fn().mockReturnValue({});
      (window as any).msOpenDatabase = mockMsOpenDatabase;

      // Act
      const result = collectOpenDatabase();

      // Assert
      expect(result).toEqual(1);
      expect(mockMsOpenDatabase).toHaveBeenCalledWith("test", "1.0", "test_db", 1);
    });
  });
});