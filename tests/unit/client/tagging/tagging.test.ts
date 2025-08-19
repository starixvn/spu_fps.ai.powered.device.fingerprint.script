import { TaggingHandler } from '../../../../src/client/tagging/tagging';
import { DeviceEncryption } from '../../../../src/client/tagging/utils/hash';
import { CacheApiHandler } from '../../../../src/client/tagging/modules/cacheApi';
import { CookiesHandler } from '../../../../src/client/tagging/modules/cookie';
import { ETagHandler } from '../../../../src/client/tagging/modules/etag';
import { IndexedDBHandler } from '../../../../src/client/tagging/modules/indexedDB';
import { LocalStorageHandler } from '../../../../src/client/tagging/modules/localStorage';
import { WindowNameHandler } from '../../../../src/client/tagging/modules/windowName';

// Mock all the storage handlers
jest.mock('../../../../src/client/tagging/modules/cacheApi');
jest.mock('../../../../src/client/tagging/modules/cookie');
jest.mock('../../../../src/client/tagging/modules/etag');
jest.mock('../../../../src/client/tagging/modules/indexedDB');
jest.mock('../../../../src/client/tagging/modules/localStorage');
jest.mock('../../../../src/client/tagging/modules/windowName');
jest.mock('../../../../src/client/tagging/utils/hash');

// Mock crypto API
const mockCrypto = {
  randomUUID: jest.fn(),
  getRandomValues: jest.fn(),
};

describe('TaggingHandler', () => {
  let indexedDBHandler: jest.Mocked<IndexedDBHandler>;
  let localStorageHandler: jest.Mocked<LocalStorageHandler>;
  let windowNameHandler: jest.Mocked<WindowNameHandler>;
  let cacheApiHandler: jest.Mocked<CacheApiHandler>;
  let cookiesHandler: jest.Mocked<CookiesHandler>;
  let etagHandler: jest.Mocked<ETagHandler>;

  beforeAll(() => {
    // Create mock instances
    indexedDBHandler = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      available: jest.fn()
    } as any;
    localStorageHandler = {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
      available: jest.fn()
    } as any;
    windowNameHandler = {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
      available: jest.fn()
    } as any;
    cacheApiHandler = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      available: jest.fn()
    } as any;
    cookiesHandler = {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
      available: jest.fn()
    } as any;
    etagHandler = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      available: jest.fn()
    } as any;

    // Mock the constructors to return our test instances
    (IndexedDBHandler as jest.Mock).mockImplementation(() => indexedDBHandler);
    (LocalStorageHandler as jest.Mock).mockImplementation(() => localStorageHandler);
    (WindowNameHandler as jest.Mock).mockImplementation(() => windowNameHandler);
    (CacheApiHandler as jest.Mock).mockImplementation(() => cacheApiHandler);
    (CookiesHandler as jest.Mock).mockImplementation(() => cookiesHandler);
    (ETagHandler as jest.Mock).mockImplementation(() => etagHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocked handler instance methods - clear both default and queued values
    indexedDBHandler.get.mockReset().mockResolvedValue(null);
    etagHandler.get.mockReset().mockResolvedValue(null);
    cacheApiHandler.get.mockReset().mockResolvedValue(null);
    cookiesHandler.get.mockReset().mockResolvedValue(null);
    localStorageHandler.get.mockReset().mockResolvedValue(null);
    windowNameHandler.get.mockReset().mockResolvedValue(null);
    // Reset crypto mock
    mockCrypto.randomUUID.mockClear();
    mockCrypto.getRandomValues.mockClear();
  });

  describe('getTagValue', () => {
    it('should return value from indexedDBHandler when found with old key', async () => {
      const testValue = 'indexeddb-value';
      indexedDBHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingValue();

      expect(indexedDBHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(result).toBe(testValue);
    });

    it('should return value from indexedDBHandler when found with new key', async () => {
      const testValue = 'indexeddb-new-value';
      indexedDBHandler.get
        .mockResolvedValueOnce(null) // old key
        .mockResolvedValueOnce(testValue); // new key

      const result = await TaggingHandler.getTaggingValue();

      expect(indexedDBHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(indexedDBHandler.get).toHaveBeenCalledWith('__STORAGE_NEW_KEY__');
      expect(result).toBe(testValue);
    });

    it('should return value from etagHandler when IndexedDB returns null', async () => {
      const testValue = 'etag-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingValue();

      expect(etagHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(result).toBe(testValue);
    });

    it('should return value from cacheApiHandler when previous handlers return null', async () => {
      const testValue = 'cache-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingValue();

      expect(cacheApiHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(result).toBe(testValue);
    });

    it('should return value from cookiesHandler when previous handlers return null', async () => {
      const testValue = 'cookie-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingValue();

      // Due to mocking, instanceof check might not work, so it uses STORAGE_OLD_KEY
      expect(cookiesHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(result).toBe(testValue);
    });

    it('should return value from localStorageHandler when previous handlers return null', async () => {
      const testValue = 'localstorage-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingValue();

      expect(localStorageHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(result).toBe(testValue);
    });

    it('should return value from windowNameHandler when previous handlers return null', async () => {
      const testValue = 'windowname-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValue(null);
      windowNameHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingValue();

      expect(windowNameHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(result).toBe(testValue);
    });

    it('should return null when all handlers return null', async () => {
      // Mock all handlers to return null
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValue(null);
      windowNameHandler.get.mockResolvedValue(null);

      const result = await TaggingHandler.getTaggingValue();

      expect(result).toBeNull();
    });

    it('should check both old and new keys for each handler', async () => {
      // All handlers return null
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValue(null);
      windowNameHandler.get.mockResolvedValue(null);

      await TaggingHandler.getTaggingValue();

      // Verify each handler was called with both keys
      expect(indexedDBHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(indexedDBHandler.get).toHaveBeenCalledWith('__STORAGE_NEW_KEY__');
      expect(etagHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(etagHandler.get).toHaveBeenCalledWith('__STORAGE_NEW_KEY__');
      expect(cacheApiHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(cacheApiHandler.get).toHaveBeenCalledWith('__STORAGE_NEW_KEY__');
      expect(cookiesHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(cookiesHandler.get).toHaveBeenCalledWith('__STORAGE_NEW_KEY__');
      expect(localStorageHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(localStorageHandler.get).toHaveBeenCalledWith('__STORAGE_NEW_KEY__');
      expect(windowNameHandler.get).toHaveBeenCalledWith('__STORAGE_OLD_KEY__');
      expect(windowNameHandler.get).toHaveBeenCalledWith('__STORAGE_NEW_KEY__');
    });

    it('should stop searching when a value is found', async () => {
      const testValue = 'found-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get
        .mockResolvedValueOnce(null) // old key
        .mockResolvedValueOnce(testValue); // new key - found!

      const result = await TaggingHandler.getTaggingValue();

      expect(result).toBe(testValue);
      
      // Should not have called subsequent handlers
      expect(cacheApiHandler.get).not.toHaveBeenCalled();
      expect(cookiesHandler.get).not.toHaveBeenCalled();
      expect(localStorageHandler.get).not.toHaveBeenCalled();
      expect(windowNameHandler.get).not.toHaveBeenCalled();
    });

    it('should handle handler errors gracefully', async () => {
      // First handler throws error - this should cause the method to throw
      indexedDBHandler.get.mockRejectedValue(new Error('IndexedDB error'));

      await expect(TaggingHandler.getTaggingValue()).rejects.toThrow('IndexedDB error');
    });

    it('should prioritize old key over new key within same handler', async () => {
      const oldKeyValue = 'old-key-value';
      const newKeyValue = 'new-key-value';
      
      indexedDBHandler.get
        .mockResolvedValueOnce(oldKeyValue) // old key found
        .mockResolvedValueOnce(newKeyValue); // new key (should not be reached)

      const result = await TaggingHandler.getTaggingValue();

      expect(result).toBe(oldKeyValue);
      expect(indexedDBHandler.get).toHaveBeenCalledTimes(1); // Only old key checked
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete tagging workflow', async () => {
      // Setup: no existing tags, should return null
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValue(null);
      windowNameHandler.get.mockResolvedValue(null);

      const result = await TaggingHandler.getTaggingValue();

      expect(result).toBeNull();
    });

    it('should handle mixed sync and async handlers', async () => {
      const testValue = 'mixed-handler-value';
      
      // Async handlers return null
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      
      // Sync handler returns value
      cookiesHandler.get.mockResolvedValue(testValue);

      const result = await TaggingHandler.getTaggingValue();

      expect(result).toBe(testValue);
    });

    it('should maintain correct order of storage priority', async () => {
      const callOrder: string[] = [];
      
      // Track call order
      indexedDBHandler.get.mockImplementation(() => {
        callOrder.push('IndexedDB');
        return Promise.resolve(null);
      });
      etagHandler.get.mockImplementation(() => {
        callOrder.push('ETag');
        return Promise.resolve(null);
      });
      cacheApiHandler.get.mockImplementation(() => {
        callOrder.push('CacheApi');
        return Promise.resolve(null);
      });
      cookiesHandler.get.mockImplementation(() => {
        callOrder.push('Cookies');
        return Promise.resolve(null);
      });
      localStorageHandler.get.mockImplementation(() => {
        callOrder.push('LocalStorage');
        return Promise.resolve(null);
      });
      windowNameHandler.get.mockImplementation(() => {
        callOrder.push('WindowName');
        return Promise.resolve(null);
      });

      await TaggingHandler.getTaggingValue();

      const expectedOrder = [
        'IndexedDB', 'IndexedDB', // old key, new key
        'ETag', 'ETag',
        'CacheApi', 'CacheApi',
        'Cookies', 'Cookies',
        'LocalStorage', 'LocalStorage',
        'WindowName', 'WindowName'
      ];

      expect(callOrder).toEqual(expectedOrder);
    });
  });
});