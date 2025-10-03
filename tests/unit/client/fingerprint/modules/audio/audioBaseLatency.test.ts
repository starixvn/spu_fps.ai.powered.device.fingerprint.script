/**
 * @jest-environment jsdom
 */

import { collectAudioBaseLatency } from '../../../../../../src/client/fingerprint/modules/audio/audioBaseLatency';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';
import { isAndroid, isWebKit } from '../../../../../../src/client/fingerprint/utils/browser';

// Mock dependencies
jest.mock('../../../../../../src/client/fingerprint/utils/browser');

const mockIsAndroid = jest.mocked(isAndroid);
const mockIsWebKit = jest.mocked(isWebKit);

// Mock AudioContext
const mockAudioContext = {
  baseLatency: 0.02666666666666667 as any,
  close: jest.fn()
};

// Setup mock values
const setupMocks = () => {
  // Setup window audio context
  (window as any).AudioContext = jest.fn(() => mockAudioContext);
  (window as any).webkitAudioContext = jest.fn(() => mockAudioContext);
  
  // Setup default platform checks
  mockIsAndroid.mockReturnValue(0);
  mockIsWebKit.mockReturnValue(1); // Default to WebKit (allowed platform)
};

describe('Audio Base Latency Module', () => {
  beforeEach(() => {
    setupMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('collectAudioBaseLatency', () => {
    it('should collect audio base latency successfully on WebKit', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      mockAudioContext.baseLatency = 0.02666666666666667;

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(0.02666666666666667);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should collect audio base latency successfully on Android', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(1);
      mockIsWebKit.mockReturnValue(0);
      mockAudioContext.baseLatency = 0.04;

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(0.04);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should return DISABLED for non-allowed platforms', () => {
      // Arrange - Neither Android nor WebKit
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(0);

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.DISABLED);
    });

    it('should return UNDEFINED when AudioContext not available', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(1);
      mockIsWebKit.mockReturnValue(0);
      delete (window as any).AudioContext;
      delete (window as any).webkitAudioContext;

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return UNDEFINED when AudioContext constructor throws', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(1);
      mockIsWebKit.mockReturnValue(0);
      (window as any).AudioContext = jest.fn(() => {
        throw new Error('AudioContext creation failed');
      });

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return UNDEFINED when baseLatency property is undefined', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      mockAudioContext.baseLatency = undefined;

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should return UNDEFINED when baseLatency property is null', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      mockAudioContext.baseLatency = null;

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should return NOT_FINITE when baseLatency is not finite', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      mockAudioContext.baseLatency = Infinity;

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.NOT_FINITE);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should return NOT_FINITE when baseLatency is NaN', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      mockAudioContext.baseLatency = NaN;

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.NOT_FINITE);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should return NOT_FINITE when baseLatency is negative infinity', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      mockAudioContext.baseLatency = -Infinity;

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.NOT_FINITE);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should return ERROR when unexpected error occurs', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      (window as any).AudioContext = jest.fn(() => mockAudioContext);
      
      // Make baseLatency property access throw
      Object.defineProperty(mockAudioContext, 'baseLatency', {
        get: () => {
          throw new Error('Property access error');
        }
      });

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle different valid latency values', () => {
      // Test various valid latency values
      const testValues = [
        0.0, 
        0.01, 
        0.02666666666666667, 
        0.05, 
        0.1, 
        1.0,
        0.00001
      ];

      for (const latencyValue of testValues) {
        // Arrange
        mockIsAndroid.mockReturnValue(1);
        mockIsWebKit.mockReturnValue(0);
        Object.defineProperty(mockAudioContext, 'baseLatency', {
          value: latencyValue,
          writable: true,
          configurable: true
        });
        jest.clearAllMocks();

        // Act
        const result = collectAudioBaseLatency();

        // Assert
        expect(result).toBe(latencyValue);
        expect(mockAudioContext.close).toHaveBeenCalled();
      }
    });

    it('should handle both Android and WebKit platforms correctly', () => {
      // Test Android + WebKit
      mockIsAndroid.mockReturnValue(1);
      mockIsWebKit.mockReturnValue(1);
      Object.defineProperty(mockAudioContext, 'baseLatency', {
        value: 0.03,
        writable: true,
        configurable: true
      });

      const result = collectAudioBaseLatency();
      expect(result).toBe(0.03);
    });

    it('should handle webkitAudioContext fallback', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      delete (window as any).AudioContext;
      (window as any).webkitAudioContext = jest.fn(() => mockAudioContext);
      Object.defineProperty(mockAudioContext, 'baseLatency', {
        value: 0.025,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(0.025);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should close audio context even when baseLatency is undefined', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      Object.defineProperty(mockAudioContext, 'baseLatency', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should handle missing close method gracefully', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      Object.defineProperty(mockAudioContext, 'baseLatency', {
        value: 0.04,
        writable: true,
        configurable: true
      });
      (mockAudioContext as any).close = undefined; // No close method

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(0.04);
      // Should not throw error even without close method
    });

    it('should handle extremely small latency values', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      Object.defineProperty(mockAudioContext, 'baseLatency', {
        value: Number.MIN_VALUE,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(Number.MIN_VALUE);
      expect(isFinite(result)).toBe(true);
    });

    it('should handle negative latency values', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(0);
      mockIsWebKit.mockReturnValue(1);
      Object.defineProperty(mockAudioContext, 'baseLatency', {
        value: -0.01,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectAudioBaseLatency();

      // Assert
      expect(result).toBe(-0.01);
      expect(isFinite(result)).toBe(true);
    });
  });
});
