/**
 * @jest-environment jsdom
 */

import { collectSessionStorage } from '../../../../../../src/client/fingerprint/modules/preference/sessionStorage';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

describe('SessionStorage Module', () => {
  beforeEach(() => {
    // Setup clean window.sessionStorage mock (don't access global sessionStorage)
    jest.clearAllMocks();
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('collectSessionStorage', () => {
    it('should return UNDEFINED when window.sessionStorage is undefined', () => {
      // Arrange
      Object.defineProperty(window, 'sessionStorage', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectSessionStorage();

      // Assert
      expect(result).toEqual(-1); // UNDEFINED = -1
    });

    it('should return 1 when sessionStorage works correctly', () => {
      // Arrange
      let storedData: { [key: string]: string } = {};
      
      const mockSessionStorage = {
        setItem: jest.fn((key, value) => {
          storedData[key] = value;
        }),
        getItem: jest.fn((key) => storedData[key] || null),
        removeItem: jest.fn((key) => {
          delete storedData[key];
        }),
        clear: jest.fn(() => {
          storedData = {};
        })
      };

      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectSessionStorage();

      // Assert
      expect(result).toEqual(1);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/^sessionstorage_test_/),
        'test_value'
      );
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
        expect.stringMatching(/^sessionstorage_test_/)
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        expect.stringMatching(/^sessionstorage_test_/)
      );
    });

    it('should return 1 when SecurityError occurs', () => {
      // Arrange
      const mockSessionStorage = {
        setItem: jest.fn(() => {
          const error = new DOMException('Security error', 'SecurityError');
          Object.defineProperty(error, 'name', { value: 'SecurityError', configurable: true });
          throw error;
        }),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };

      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectSessionStorage();

      // Assert
      expect(result).toEqual(1);
    });

    it('should return ERROR when non-SecurityError DOMException occurs', () => {
      // Arrange
      const mockSessionStorage = {
        setItem: jest.fn(() => {
          const error = new DOMException('Other error', 'NotAllowedError');
          Object.defineProperty(error, 'name', { value: 'NotAllowedError', configurable: true });
          throw error;
        }),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };

      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectSessionStorage();

      // Assert
      expect(result).toEqual(-3); // ERROR = -3
    });
  });
});