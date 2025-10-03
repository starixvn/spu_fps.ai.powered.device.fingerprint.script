import { AudioFingerprint } from '../../../../../../src/client/fingerprint/modules/audio';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock all audio modules
jest.mock('../../../../../../src/client/fingerprint/modules/audio/audio');
jest.mock('../../../../../../src/client/fingerprint/modules/audio/audioBaseLatency');

const mockCollectAudio = jest.mocked(require('../../../../../../src/client/fingerprint/modules/audio/audio').collectAudio);
const mockCollectAudioBaseLatency = jest.mocked(require('../../../../../../src/client/fingerprint/modules/audio/audioBaseLatency').collectAudioBaseLatency);

describe('Audio Fingerprint Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('AudioFingerprint.collect', () => {
    it('should collect complete audio information successfully', async () => {
      // Arrange
      const mockAudioResult = -100.12345;
      const mockAudioBaseLatencyResult = 0.02666666666666667;

      mockCollectAudio.mockResolvedValue(mockAudioResult);
      mockCollectAudioBaseLatency.mockReturnValue(mockAudioBaseLatencyResult);

      const expectedResult = {
        audio: -100.12345,
        audioBaseLatency: 0.02666666666666667,
      };

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCollectAudio).toHaveBeenCalledTimes(1);
      expect(mockCollectAudioBaseLatency).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed valid and invalid values from collectors', async () => {
      // Arrange
      mockCollectAudio.mockResolvedValue(-125.6789);
      mockCollectAudioBaseLatency.mockReturnValue(FingerprintSpecialValue.UNDEFINED);

      const expectedResult = {
        audio: -125.6789,
        audioBaseLatency: FingerprintSpecialValue.UNDEFINED,
      };

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle all special values from collectors', async () => {
      // Arrange
      mockCollectAudio.mockResolvedValue(FingerprintSpecialValue.ANTI_FINGERPRINTED);
      mockCollectAudioBaseLatency.mockReturnValue(FingerprintSpecialValue.DISABLED);

      const expectedResult = {
        audio: FingerprintSpecialValue.ANTI_FINGERPRINTED,
        audioBaseLatency: FingerprintSpecialValue.DISABLED,
      };

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle audio timeout and audioBaseLatency error', async () => {
      // Arrange
      mockCollectAudio.mockResolvedValue(FingerprintSpecialValue.TIMEOUT);
      mockCollectAudioBaseLatency.mockReturnValue(FingerprintSpecialValue.ERROR);

      const expectedResult = {
        audio: FingerprintSpecialValue.TIMEOUT,
        audioBaseLatency: FingerprintSpecialValue.ERROR,
      };

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from individual collectors gracefully', async () => {
      // Arrange
      mockCollectAudio.mockRejectedValue(new Error('Audio collection failed'));
      mockCollectAudioBaseLatency.mockReturnValue(0.025);

      // Act & Assert
      await expect(AudioFingerprint.collect()).rejects.toThrow('Audio collection failed');
      expect(mockCollectAudio).toHaveBeenCalledTimes(1);
      // collectAudioBaseLatency should not be called if collectAudio fails first
      expect(mockCollectAudioBaseLatency).toHaveBeenCalledTimes(0);
    });

    it('should handle audioBaseLatency throwing error', async () => {
      // Arrange
      mockCollectAudio.mockResolvedValue(-110.555);
      mockCollectAudioBaseLatency.mockImplementation(() => {
        throw new Error('AudioBaseLatency collection failed');
      });

      // Act & Assert
      await expect(AudioFingerprint.collect()).rejects.toThrow('AudioBaseLatency collection failed');
    });

    it('should maintain proper data types for all collectors', async () => {
      // Arrange
      mockCollectAudio.mockResolvedValue(-95.123456);
      mockCollectAudioBaseLatency.mockReturnValue(0.03);

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(typeof result.audio).toBe('number');
      expect(typeof result.audioBaseLatency).toBe('number');
      expect(result.audio).toBe(-95.123456);
      expect(result.audioBaseLatency).toBe(0.03);
    });

    it('should return the exact structure from individual collectors', async () => {
      // Arrange
      const mockResults = {
        audio: -142.333333,
        audioBaseLatency: 0.05333333333333334,
      };

      mockCollectAudio.mockResolvedValue(mockResults.audio);
      mockCollectAudioBaseLatency.mockReturnValue(mockResults.audioBaseLatency);

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(result.audio).toBe(mockResults.audio);
      expect(result.audioBaseLatency).toBe(mockResults.audioBaseLatency);
    });

    it('should handle special fingerprint values correctly', async () => {
      // Arrange
      const specialValues = [
        FingerprintSpecialValue.UNDEFINED,
        FingerprintSpecialValue.ERROR,
        FingerprintSpecialValue.TIMEOUT,
        FingerprintSpecialValue.ANTI_FINGERPRINTED,
        FingerprintSpecialValue.DISABLED,
        FingerprintSpecialValue.NOT_FINITE,
      ];

      for (const specialValue of specialValues) {
        mockCollectAudio.mockResolvedValue(specialValue);
        mockCollectAudioBaseLatency.mockReturnValue(specialValue);

        // Act
        const result = await AudioFingerprint.collect();

        // Assert
        expect(result.audio).toBe(specialValue);
        expect(result.audioBaseLatency).toBe(specialValue);
      }
    });

    it('should handle null and undefined values properly', async () => {
      // Arrange - Test that null/undefined are handled correctly
      mockCollectAudio.mockResolvedValue(null as any);
      mockCollectAudioBaseLatency.mockReturnValue(undefined as any);

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(result.audio).toBeNull();
      expect(result.audioBaseLatency).toBeUndefined();
    });

    it('should handle concurrent calls consistently', async () => {
      // Arrange
      mockCollectAudio.mockResolvedValue(-88.999);
      mockCollectAudioBaseLatency.mockReturnValue(0.0213);

      // Act - Make multiple concurrent calls
      const promises = Array.from({ length: 5 }, () => AudioFingerprint.collect());
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toEqual({
          audio: -88.999,
          audioBaseLatency: 0.0213,
        });
      });

      // Each collector should be called once per AudioFingerprint.collect() call
      expect(mockCollectAudio).toHaveBeenCalledTimes(5);
      expect(mockCollectAudioBaseLatency).toHaveBeenCalledTimes(5);
    });

    it('should handle very large and very small numbers', async () => {
      // Arrange
      const veryLargeNumber = Number.MAX_SAFE_INTEGER;
      const verySmallNumber = Number.MIN_SAFE_INTEGER;
      
      mockCollectAudio.mockResolvedValue(veryLargeNumber);
      mockCollectAudioBaseLatency.mockReturnValue(verySmallNumber);

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(result.audio).toBe(veryLargeNumber);
      expect(result.audioBaseLatency).toBe(verySmallNumber);
      expect(Number.isSafeInteger(result.audio)).toBe(true);
      expect(Number.isSafeInteger(result.audioBaseLatency)).toBe(true);
    });

    it('should handle floating point precision correctly', async () => {
      // Arrange
      const preciseFloat = -123.456789012345;
      const anotherPreciseFloat = 0.123456789012345;
      
      mockCollectAudio.mockResolvedValue(preciseFloat);
      mockCollectAudioBaseLatency.mockReturnValue(anotherPreciseFloat);

      // Act
      const result = await AudioFingerprint.collect();

      // Assert
      expect(result.audio).toBe(preciseFloat);
      expect(result.audioBaseLatency).toBe(anotherPreciseFloat);
    });
  });
});
