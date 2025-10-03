/**
 * @jest-environment jsdom
 */

import { collectTimezone } from '../../../../../../src/client/fingerprint/modules/preference/timezone';

describe('Timezone Module', () => {
  beforeEach(() => {
    // Reset Intl global
    Object.defineProperty(global, 'Intl', {
      value: undefined,
      writable: true,
      configurable: true
    });

    // Reset Date
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('collectTimezone', () => {
    it('should return timezone from Intl.DateTimeFormat when available', () => {
      // Arrange
      const mockIntl = {
        DateTimeFormat: jest.fn().mockImplementation(() => ({
          resolvedOptions: jest.fn().mockReturnValue({
            timeZone: 'America/New_York'
          })
        }))
      };

      Object.defineProperty(global, 'Intl', {
        value: mockIntl,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectTimezone();

      // Assert
      expect(result).toEqual('America/New_York');
      expect(mockIntl.DateTimeFormat).toHaveBeenCalled();
    });

    it('should trim whitespace from timezone string', () => {
      // Arrange
      const mockIntl = {
        DateTimeFormat: jest.fn().mockImplementation(() => ({
          resolvedOptions: jest.fn().mockReturnValue({
            timeZone: '  Asia/Tokyo  '
          })
        }))
      };

      Object.defineProperty(global, 'Intl', {
        value: mockIntl,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectTimezone();

      // Assert
      expect(result).toEqual('Asia/Tokyo'); // Code trims whitespace correctly
    });

    it('should fallback to offset when Intl.DateTimeFormat returns empty string', () => {
      // Arrange
      const mockIntl = {
        DateTimeFormat: jest.fn().mockImplementation(() => ({
          resolvedOptions: jest.fn().mockReturnValue({
            timeZone: ''
          })
        }))
      };

      Object.defineProperty(global, 'Intl', {
        value: mockIntl,
        writable: true,
        configurable: true
      });

      // Mock Date.getTimezoneOffset to return -480 (UTC+8)
      const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => ({
        getTimezoneOffset: jest.fn().mockReturnValue(-480)
      } as any));

      // Act
      const result = collectTimezone();

      // Assert
      expect(result).toEqual('UTC+08:00');

      mockDate.mockRestore();
    });

    it('should use offset when Intl is undefined', () => {
      // Arrange
      Object.defineProperty(global, 'Intl', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Mock Date.getTimezoneOffset to return 0 (UTC)
      const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => ({
        getTimezoneOffset: jest.fn().mockReturnValue(0)
      } as any));

      // Act
      const result = collectTimezone();

      // Assert
      expect(result).toEqual('UTC+00:00');

      mockDate.mockRestore();
    });

    it('should return empty string when getTimezoneOffset returns NaN', () => {
      // Arrange
      Object.defineProperty(global, 'Intl', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Mock Date.getTimezoneOffset to return NaN
      const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => ({
        getTimezoneOffset: jest.fn().mockReturnValue(NaN)
      } as any));

      // Act
      const result = collectTimezone();

      // Assert
      expect(result).toBe(-3); // ERROR = -3

      mockDate.mockRestore();
    });

    it('should handle error and return empty string', () => {
      // Arrange
      Object.defineProperty(global, 'Intl', {
        value: {
          DateTimeFormat: jest.fn().mockImplementation(() => {
            throw new Error('DateTimeFormat error');
          })
        },
        writable: true,
        configurable: true
      });

      // Act
      const result = collectTimezone();

      // Assert
      expect(result).toBe(-3); // ERROR = -3
    });

    it('should format positive offset correctly', () => {
      // Arrange
      Object.defineProperty(global, 'Intl', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Mock Date.getTimezoneOffset to return 330 (UTC-5:30)
      const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => ({
        getTimezoneOffset: jest.fn().mockReturnValue(330)
      } as any));

      // Act
      const result = collectTimezone();

      // Assert
      expect(result).toEqual('UTC-05:30');

      mockDate.mockRestore();
    });

    it('should format negative offset correctly', () => {
      // Arrange
      Object.defineProperty(global, 'Intl', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Mock Date.getTimezoneOffset to return -630 (UTC+10:30)
      const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => ({
        getTimezoneOffset: jest.fn().mockReturnValue(-630)
      } as any));

      // Act
      const result = collectTimezone();

      // Assert
      expect(result).toEqual('UTC+10:30');

      mockDate.mockRestore();
    });
  });
});