import { PreferencesFingerprint } from '../../../../../../src/client/fingerprint/modules/preference';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock all preference modules
jest.mock('../../../../../../src/client/fingerprint/modules/preference/languages');
jest.mock('../../../../../../src/client/fingerprint/modules/preference/timezone');
jest.mock('../../../../../../src/client/fingerprint/modules/preference/touchSupport');
jest.mock('../../../../../../src/client/fingerprint/modules/preference/sessionStorage');
jest.mock('../../../../../../src/client/fingerprint/modules/preference/openDatabase');
jest.mock('../../../../../../src/client/fingerprint/modules/preference/localStorage');
jest.mock('../../../../../../src/client/fingerprint/modules/preference/indexedDb');
jest.mock('../../../../../../src/client/fingerprint/modules/preference/cookiesEnabled');

const mockCollectLanguages = jest.mocked(require('../../../../../../src/client/fingerprint/modules/preference/languages').collectLanguages);
const mockCollectTimezone = jest.mocked(require('../../../../../../src/client/fingerprint/modules/preference/timezone').collectTimezone);
const mockCollectTouchSupport = jest.mocked(require('../../../../../../src/client/fingerprint/modules/preference/touchSupport').collectTouchSupport);
const mockCollectSessionStorage = jest.mocked(require('../../../../../../src/client/fingerprint/modules/preference/sessionStorage').collectSessionStorage);
const mockCollectOpenDatabase = jest.mocked(require('../../../../../../src/client/fingerprint/modules/preference/openDatabase').collectOpenDatabase);
const mockCollectLocalStorage = jest.mocked(require('../../../../../../src/client/fingerprint/modules/preference/localStorage').collectLocalStorage);
const mockCollectIndexedDB = jest.mocked(require('../../../../../../src/client/fingerprint/modules/preference/indexedDb').collectIndexedDB);
const mockCollectCookiesEnabled = jest.mocked(require('../../../../../../src/client/fingerprint/modules/preference/cookiesEnabled').collectCookiesEnabled);

describe('Preferences Fingerprint Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('PreferencesFingerprint.collect', () => {
    it('should collect complete preferences information successfully', async () => {
      // Arrange
      const mockLanguagesResult = { languages: [['en-US', 'en'], ['vi-VN', 'vi']] };
      const mockTimezoneResult = { timezone: 'Asia/Ho_Chi_Minh' };
      const mockTouchSupportResult = [10, 1, 1]; // [maxTouchPoints, touchEvent, touchStart]
      const mockSessionStorageResult = { sessionStorage: 1 };
      const mockOpenDatabaseResult = { openDatabase: 1 };
      const mockLocalStorageResult = { localStorage: 1 };
      const mockIndexedDBResult = { indexedDB: 1 };
      const mockCookiesEnabledResult = { cookiesEnabled: 1 };

      mockCollectLanguages.mockReturnValue(mockLanguagesResult);
      mockCollectTimezone.mockReturnValue(mockTimezoneResult);
      mockCollectTouchSupport.mockReturnValue(mockTouchSupportResult);
      mockCollectSessionStorage.mockReturnValue(mockSessionStorageResult);
      mockCollectOpenDatabase.mockReturnValue(mockOpenDatabaseResult);
      mockCollectLocalStorage.mockReturnValue(mockLocalStorageResult);
      mockCollectIndexedDB.mockResolvedValue(mockIndexedDBResult);
      mockCollectCookiesEnabled.mockReturnValue(mockCookiesEnabledResult);

      const expectedResult = {
        languages: [['en-US', 'en'], ['vi-VN', 'vi']],
        timezone: 'Asia/Ho_Chi_Minh',
        touchSupport: [10, 1, 1],
        sessionStorage: 1,
        openDatabase: 1,
        localStorage: 1,
        indexedDB: 1,
        cookiesEnabled: 1,
      };

      // Act
      const result = await PreferencesFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCollectLanguages).toHaveBeenCalledTimes(1);
      expect(mockCollectTimezone).toHaveBeenCalledTimes(1);
      expect(mockCollectTouchSupport).toHaveBeenCalledTimes(1);
      expect(mockCollectSessionStorage).toHaveBeenCalledTimes(1);
      expect(mockCollectOpenDatabase).toHaveBeenCalledTimes(1);
      expect(mockCollectLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockCollectIndexedDB).toHaveBeenCalledTimes(1);
      expect(mockCollectCookiesEnabled).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed valid and special values from collectors', async () => {
      // Arrange
      mockCollectLanguages.mockReturnValue({ languages: [['en-US', 'en']] });
      mockCollectTimezone.mockReturnValue({ timezone: 'UTC' });
      mockCollectTouchSupport.mockReturnValue([0, 0, 0]); // No touch support
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: FingerprintSpecialValue.UNDEFINED });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: FingerprintSpecialValue.UNDEFINED });
      mockCollectLocalStorage.mockReturnValue({ localStorage: 1 });
      mockCollectIndexedDB.mockResolvedValue({ indexedDB: FingerprintSpecialValue.ERROR });
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 1 });

      const expectedResult = {
        languages: [['en-US', 'en']],
        timezone: 'UTC',
        touchSupport: [0, 0, 0],
        sessionStorage: FingerprintSpecialValue.UNDEFINED,
        openDatabase: FingerprintSpecialValue.UNDEFINED,
        localStorage: 1,
        indexedDB: FingerprintSpecialValue.ERROR,
        cookiesEnabled: 1,
      };

      // Act
      const result = await PreferencesFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle all special values from collectors', async () => {
      // Arrange
      mockCollectLanguages.mockReturnValue({ languages: [] }); // Empty languages
      mockCollectTimezone.mockReturnValue({ timezone: '' }); // Empty timezone
      mockCollectTouchSupport.mockReturnValue([0, 0, 0]); // No touch support
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: FingerprintSpecialValue.ERROR });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: FingerprintSpecialValue.UNDEFINED });
      mockCollectLocalStorage.mockReturnValue({ localStorage: FingerprintSpecialValue.ERROR });
      mockCollectIndexedDB.mockResolvedValue({ indexedDB: FingerprintSpecialValue.UNDEFINED });
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 0 });

      const expectedResult = {
        languages: [],
        timezone: '',
        touchSupport: [0, 0, 0],
        sessionStorage: FingerprintSpecialValue.ERROR,
        openDatabase: FingerprintSpecialValue.UNDEFINED,
        localStorage: FingerprintSpecialValue.ERROR,
        indexedDB: FingerprintSpecialValue.UNDEFINED,
        cookiesEnabled: 0,
      };

      // Act
      const result = await PreferencesFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from individual collectors gracefully', async () => {
      // Arrange
      mockCollectLanguages.mockReturnValue({ languages: [['en-US', 'en']] });
      mockCollectTimezone.mockImplementation(() => {
        throw new Error('Timezone collection failed');
      });
      mockCollectTouchSupport.mockReturnValue([5, 1, 1]);
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: 1 });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: 1 });
      mockCollectLocalStorage.mockReturnValue({ localStorage: 1 });
      mockCollectIndexedDB.mockResolvedValue({ indexedDB: 1 });
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 1 });

      // Act & Assert
      await expect(PreferencesFingerprint.collect()).rejects.toThrow('Timezone collection failed');
    });

    it('should handle async indexedDB errors gracefully', async () => {
      // Arrange
      mockCollectLanguages.mockReturnValue({ languages: [['en-US', 'en']] });
      mockCollectTimezone.mockReturnValue({ timezone: 'UTC' });
      mockCollectTouchSupport.mockReturnValue([0, 0, 0]);
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: 1 });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: 1 });
      mockCollectLocalStorage.mockReturnValue({ localStorage: 1 });
      mockCollectIndexedDB.mockRejectedValue(new Error('IndexedDB collection failed'));
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 1 });

      // Act & Assert
      await expect(PreferencesFingerprint.collect()).rejects.toThrow('IndexedDB collection failed');
    });

    it('should maintain proper data types for all collectors', async () => {
      // Arrange
      mockCollectLanguages.mockReturnValue({ languages: [['en-US', 'en'], ['zh-CN', 'zh']] });
      mockCollectTimezone.mockReturnValue({ timezone: 'America/New_York' });
      mockCollectTouchSupport.mockReturnValue([8, 1, 1]);
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: 1 });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: 0 });
      mockCollectLocalStorage.mockReturnValue({ localStorage: 1 });
      mockCollectIndexedDB.mockResolvedValue({ indexedDB: 1 });
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 1 });

      // Act
      const result = await PreferencesFingerprint.collect();

      // Assert
      expect(Array.isArray(result.languages)).toBe(true);
      expect(typeof result.timezone).toBe('string');
      expect(Array.isArray(result.touchSupport)).toBe(true);
      expect(result.touchSupport).toHaveLength(3);
      expect(typeof result.sessionStorage).toBe('number');
      expect(typeof result.openDatabase).toBe('number');
      expect(typeof result.localStorage).toBe('number');
      expect(typeof result.indexedDB).toBe('number');
      expect(typeof result.cookiesEnabled).toBe('number');
    });

    it('should handle different language formats correctly', async () => {
      // Arrange
      const complexLanguages = [
        ['en-US', 'en'],
        ['zh-Hans-CN', 'zh-Hans', 'zh'],
        ['es-419', 'es'],
        ['fr-CA', 'fr']
      ];
      
      mockCollectLanguages.mockReturnValue({ languages: complexLanguages });
      mockCollectTimezone.mockReturnValue({ timezone: 'America/Toronto' });
      mockCollectTouchSupport.mockReturnValue([10, 1, 1]);
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: 1 });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: 1 });
      mockCollectLocalStorage.mockReturnValue({ localStorage: 1 });
      mockCollectIndexedDB.mockResolvedValue({ indexedDB: 1 });
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 1 });

      // Act
      const result = await PreferencesFingerprint.collect();

      // Assert
      expect(result.languages).toEqual(complexLanguages);
      expect(result.languages).toHaveLength(4);
      expect((result.languages as string[][])[1]).toHaveLength(3);
    });

    it('should handle touch support variations correctly', async () => {
      // Test different touch support scenarios
      const touchTestCases = [
        [0, 0, 0], // No touch support
        [1, 1, 1], // Single touch
        [10, 1, 1], // Multi-touch
        [2, 0, 1], // Partial touch support
      ];

      for (const touchSupport of touchTestCases) {
        // Arrange
        mockCollectLanguages.mockReturnValue({ languages: [['en-US', 'en']] });
        mockCollectTimezone.mockReturnValue({ timezone: 'UTC' });
        mockCollectTouchSupport.mockReturnValue(touchSupport);
        mockCollectSessionStorage.mockReturnValue({ sessionStorage: 1 });
        mockCollectOpenDatabase.mockReturnValue({ openDatabase: 1 });
        mockCollectLocalStorage.mockReturnValue({ localStorage: 1 });
        mockCollectIndexedDB.mockResolvedValue({ indexedDB: 1 });
        mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 1 });

        // Act
        const result = await PreferencesFingerprint.collect();

        // Assert
        if (Array.isArray(result.touchSupport)) {
          expect(result.touchSupport).toEqual(touchSupport);
          expect(result.touchSupport).toHaveLength(3);
          expect(typeof result.touchSupport[0]).toBe('number'); // maxTouchPoints
          expect([0, 1]).toContain(result.touchSupport[1]);      // touchEvent bit
          expect([0, 1]).toContain(result.touchSupport[2]);      // touchStart bit
        }
      }
    });

    it('should handle storage-related special values correctly', async () => {
      // Arrange
      mockCollectLanguages.mockReturnValue({ languages: [['en-US', 'en']] });
      mockCollectTimezone.mockReturnValue({ timezone: 'UTC' });
      mockCollectTouchSupport.mockReturnValue([0, 0, 0]);
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: FingerprintSpecialValue.ERROR });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: FingerprintSpecialValue.UNDEFINED });
      mockCollectLocalStorage.mockReturnValue({ localStorage: FingerprintSpecialValue.ERROR });
      mockCollectIndexedDB.mockResolvedValue({ indexedDB: FingerprintSpecialValue.UNDEFINED });
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 0 });

      // Act
      const result = await PreferencesFingerprint.collect();

      // Assert
      expect(result.sessionStorage).toBe(FingerprintSpecialValue.ERROR);
      expect(result.openDatabase).toBe(FingerprintSpecialValue.UNDEFINED);
      expect(result.localStorage).toBe(FingerprintSpecialValue.ERROR);
      expect(result.indexedDB).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return the exact structure from individual collectors', async () => {
      // Arrange
      const mockResults = {
        languages: [['ja-JP', 'ja'], ['ko-KR', 'ko']],
        timezone: 'Asia/Tokyo',
        touchSupport: [5, 1, 0],
        sessionStorage: 1,
        openDatabase: 0,
        localStorage: 1,
        indexedDB: 1,
        cookiesEnabled: 1,
      };

      mockCollectLanguages.mockReturnValue({ languages: mockResults.languages });
      mockCollectTimezone.mockReturnValue({ timezone: mockResults.timezone });
      mockCollectTouchSupport.mockReturnValue(mockResults.touchSupport);
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: mockResults.sessionStorage });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: mockResults.openDatabase });
      mockCollectLocalStorage.mockReturnValue({ localStorage: mockResults.localStorage });
      mockCollectIndexedDB.mockResolvedValue({ indexedDB: mockResults.indexedDB });
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: mockResults.cookiesEnabled });

      // Act
      const result = await PreferencesFingerprint.collect();

      // Assert
      expect(result.languages).toBe(mockResults.languages);
      expect(result.timezone).toBe(mockResults.timezone);
      expect(result.touchSupport).toBe(mockResults.touchSupport);
      expect(result.sessionStorage).toBe(mockResults.sessionStorage);
      expect(result.openDatabase).toBe(mockResults.openDatabase);
      expect(result.localStorage).toBe(mockResults.localStorage);
      expect(result.indexedDB).toBe(mockResults.indexedDB);
      expect(result.cookiesEnabled).toBe(mockResults.cookiesEnabled);
    });

    it('should handle concurrent calls consistently', async () => {
      // Arrange
      mockCollectLanguages.mockReturnValue({ languages: [['en-US', 'en']] });
      mockCollectTimezone.mockReturnValue({ timezone: 'UTC' });
      mockCollectTouchSupport.mockReturnValue([2, 1, 1]);
      mockCollectSessionStorage.mockReturnValue({ sessionStorage: 1 });
      mockCollectOpenDatabase.mockReturnValue({ openDatabase: 1 });
      mockCollectLocalStorage.mockReturnValue({ localStorage: 1 });
      mockCollectIndexedDB.mockResolvedValue({ indexedDB: 1 });
      mockCollectCookiesEnabled.mockReturnValue({ cookiesEnabled: 1 });

      // Act - Make multiple concurrent calls
      const promises = Array.from({ length: 3 }, () => PreferencesFingerprint.collect());
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toEqual({
          languages: [['en-US', 'en']],
          timezone: 'UTC',
          touchSupport: [2, 1, 1],
          sessionStorage: 1,
          openDatabase: 1,
          localStorage: 1,
          indexedDB: 1,
          cookiesEnabled: 1,
        });
      });

      // Each collector should be called once per PreferencesFingerprint.collect() call
      expect(mockCollectLanguages).toHaveBeenCalledTimes(3);
      expect(mockCollectIndexedDB).toHaveBeenCalledTimes(3);
    });
  });
});

