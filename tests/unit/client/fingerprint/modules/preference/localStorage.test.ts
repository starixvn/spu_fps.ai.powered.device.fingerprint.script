/**
 * @jest-environment jsdom
 */

import { collectLocalStorage } from '../../../../../../src/client/fingerprint/modules/preference/localStorage';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

describe('Local Storage Module', () => {
  beforeEach(() => {
    // Clear localStorage if it exists
    if (typeof Storage !== 'undefined' && window.localStorage) {
      try {
        localStorage.clear();
      } catch (e) {
        // Ignore clear errors
      }
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('collectLocalStorage', () => {
    it('should return 1 when localStorage is working correctly', () => {
      // Act
      const result = collectLocalStorage();

      // Assert
      expect(result).toEqual({ localStorage: 1 });
    });

    it('should return UNDEFINED when window.localStorage is undefined', () => {
      // Arrange
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectLocalStorage();

      // Assert
      expect(result).toEqual({ localStorage: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return UNDEFINED when window.localStorage is null', () => {
      // Arrange
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectLocalStorage();

      // Assert
      expect(result).toEqual({ localStorage: FingerprintSpecialValue.UNDEFINED });
    });

    it('should handle SecurityError and return 1', () => {
      // Arrange
      const mockSetItem = jest.fn(() => {
        const error = new DOMException('SecurityError', 'SecurityError');
        Object.defineProperty(error, 'name', { value: 'SecurityError', configurable: true });
        throw error;
      });

      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: mockSetItem,
          getItem: jest.fn(),
          removeItem: jest.fn()
        },
        writable: true,
        configurable: true
      });

      // Act
      const result = collectLocalStorage();

      // Assert
      expect(result).toEqual({ localStorage: 1 });
    });

    it('should return ERROR for non-SecurityError exceptions', () => {
      // Arrange
      const mockSetItem = jest.fn(() => {
        throw new Error('Some other error');
      });

      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: mockSetItem,
          getItem: jest.fn(),
          removeItem: jest.fn()
        },
        writable: true,
        configurable: true
      });

      // Act
      const result = collectLocalStorage();

      // Assert
      expect(result).toEqual({ localStorage: FingerprintSpecialValue.ERROR });
    });

    it('should return 0 when localStorage data is not retrievable correctly', () => {
      // Arrange
      const mockGetItem = jest.fn(() => 'wrong_value'); // Return wrong value

      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: jest.fn(),
          getItem: mockGetItem,
          removeItem: jest.fn()
        },
        writable: true,
        configurable: true
      });

      // Act
      const result = collectLocalStorage();

      // Assert
      expect(result).toEqual({ localStorage: 0 });
    });

    it('should handle getItem returning null', () => {
      // Arrange
      const mockGetItem = jest.fn(() => null);

      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: jest.fn(),
          getItem: mockGetItem,
          removeItem: jest.fn()
        },
        writable: true,
        configurable: true
      });

      // Act
      const result = collectLocalStorage();

      // Assert
      expect(result).toEqual({ localStorage: 0 });
    });

    it('should use unique random key for each test', () => {
      // Arrange
      const setItemSpy = jest.spyOn(localStorage, 'setItem');
      setItemSpy.mockClear(); // Clear any previous calls

      // Act
      collectLocalStorage();
      collectLocalStorage();

      // Assert
      expect(setItemSpy).toHaveBeenCalledTimes(2);
      const firstCallKey = setItemSpy.mock.calls[0][0];
      const secondCallKey = setItemSpy.mock.calls[1][0];
      expect(firstCallKey).not.toBe(secondCallKey); // Keys should be different
      expect(firstCallKey).toMatch(/^localstorage_test_/);
      expect(secondCallKey).toMatch(/^localstorage_test_/);
    });

    it('should return object with localStorage property', () => {
      // Act
      const result = collectLocalStorage();

      // Assert
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('localStorage');
      expect([0, 1, FingerprintSpecialValue.UNDEFINED, FingerprintSpecialValue.ERROR]).toContain(result.localStorage);
    });

    it('should handle localStorage with missing methods', () => {
      // Arrange
      Object.defineProperty(window, 'localStorage', {
        value: {}, // Empty object without setItem/getItem methods
        writable: true,
        configurable: true
      });

      // Act
      const result = collectLocalStorage();

      // Assert
      expect(result).toEqual({ localStorage: FingerprintSpecialValue.ERROR });
    });

    it('should clean up test data after testing', () => {
      // Arrange
      const initialKeys = Object.keys(localStorage);

      // Act
      collectLocalStorage();

      // Assert
      const finalKeys = Object.keys(localStorage);
      expect(finalKeys).toEqual(initialKeys); // Should not leave test data behind
    });
  });
});