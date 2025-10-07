import { TaggingHandler } from '../../../../src/client/tagging/tagging';
import { CacheApiHandler } from '../../../../src/client/tagging/modules/cacheApi';
import { CookiesHandler } from '../../../../src/client/tagging/modules/cookie';
import { ETagHandler } from '../../../../src/client/tagging/modules/etag';
import { IndexedDBHandler } from '../../../../src/client/tagging/modules/indexedDB';
import { LocalStorageHandler } from '../../../../src/client/tagging/modules/localStorage';
import { WindowNameHandler } from '../../../../src/client/tagging/modules/windowName';
import { PacketTransformer } from '../../../../src/client/utils/hash';
import { DeviceFactory } from '../../../../src/client/utils/deviceFactory';

// Mock all the storage handlers
jest.mock('../../../../src/client/tagging/modules/cacheApi');
jest.mock('../../../../src/client/tagging/modules/cookie');
jest.mock('../../../../src/client/tagging/modules/etag');
jest.mock('../../../../src/client/tagging/modules/indexedDB');
jest.mock('../../../../src/client/tagging/modules/localStorage');
jest.mock('../../../../src/client/tagging/modules/windowName');
jest.mock('../../../../src/client/utils/hash');
jest.mock('../../../../src/client/utils/deviceFactory');

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

  // Mock the PacketTransformer module
  const mockPacketTransformer = PacketTransformer as jest.Mocked<typeof PacketTransformer>;
  
  // Mock the DeviceFactory module
  const mockDeviceFactory = DeviceFactory as jest.Mocked<typeof DeviceFactory>;

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

    // Mock PacketTransformer to simulate valid device IDs
    mockPacketTransformer.unwrapMessage = jest.fn().mockImplementation((value: string) => {
      // Return a valid GUID format for our test values
      if (value === 'valid-encrypted-value') return '12345678901234567890123456789012';
      if (value === 'indexeddb-value') return '12345678901234567890123456789012';
      if (value === 'indexeddb-new-value') return '12345678901234567890123456789012';
      if (value === 'etag-value') return '12345678901234567890123456789012';
      if (value === 'cache-value') return '12345678901234567890123456789012';
      if (value === 'cookie-value') return '12345678901234567890123456789012';
      if (value === 'localstorage-value') return '12345678901234567890123456789012';
      if (value === 'windowname-value') return '12345678901234567890123456789012';
      if (value === 'found-value') return '12345678901234567890123456789012';
      if (value === 'old-key-value') return '12345678901234567890123456789012';
      if (value === 'new-key-value') return '12345678901234567890123456789012';
      if (value === 'mixed-handler-value') return '12345678901234567890123456789012';
      
      // For invalid values, return something that won't match GUID pattern
      return 'invalid';
    });

    // Mock DeviceFactory.isValidTagging to return true for valid test values
    mockDeviceFactory.isValidTagging = jest.fn().mockImplementation((value: string) => {
      const validValues = [
        'valid-encrypted-value', 'indexeddb-value', 'indexeddb-new-value', 
        'etag-value', 'cache-value', 'cookie-value', 'localstorage-value', 
        'windowname-value', 'found-value', 'old-key-value', 'new-key-value', 
        'mixed-handler-value'
      ];
      return validValues.includes(value);
    });
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

    // Reset PacketTransformer mock
    mockPacketTransformer.unwrapMessage.mockClear();
    
    // Reset DeviceFactory mock
    mockDeviceFactory.isValidTagging.mockClear();
  });

  describe('getTaggingFromStorages', () => {
    it('should return value from indexedDBHandler when found with old key', async () => {
      const testValue = 'indexeddb-value';
      indexedDBHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(indexedDBHandler.get).toHaveBeenCalledWith('(global.c3)');
      expect(result).toEqual({
        key: '__indexedDB_key__',
        value: testValue,
        type: 1001
      });
    });

    it('should return value from indexedDBHandler when found with new key', async () => {
      const testValue = 'indexeddb-new-value';
      indexedDBHandler.get
        .mockResolvedValueOnce(null) // old key
        .mockResolvedValueOnce(testValue); // new key

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(indexedDBHandler.get).toHaveBeenCalledWith('(global.c3)');
      expect(indexedDBHandler.get).toHaveBeenCalledWith('__indexedDB_key__');
      expect(result).toEqual({
        key: '__indexedDB_key__',
        value: testValue,
        type: 1001
      });
    });

    it('should return value from etagHandler when IndexedDB returns null', async () => {
      const testValue = 'etag-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(etagHandler.get).toHaveBeenCalledWith('__etag_key__');
      expect(result).toEqual({
        key: '__etag_key__',
        value: testValue,
        type: 2002
      });
    });

    it('should return value from cacheApiHandler when previous handlers return null', async () => {
      const testValue = 'cache-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(cacheApiHandler.get).toHaveBeenCalledWith('__cache_key__');
      expect(result).toEqual({
        key: '__cache_key__',
        value: testValue,
        type: 3003
      });
    });

    it('should return value from cookiesHandler when previous handlers return null', async () => {
      const testValue = 'cookie-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingFromStorages();

      // Cookies handler uses different old key
      expect(cookiesHandler.get).toHaveBeenCalledWith('gfp');
      expect(result).toEqual({
        key: '__cookies_key__',
        value: testValue,
        type: 4004
      });
    });

    it('should return value from localStorageHandler when previous handlers return null', async () => {
      const testValue = 'localstorage-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(localStorageHandler.get).toHaveBeenCalledWith('(global.c3)');
      expect(result).toEqual({
        key: '__localStorage_key__',
        value: testValue,
        type: 5005
      });
    });

    it('should return value from windowNameHandler when previous handlers return null', async () => {
      const testValue = 'windowname-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValue(null);
      windowNameHandler.get.mockResolvedValueOnce(testValue);

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(windowNameHandler.get).toHaveBeenCalledWith('__window_key__');
      expect(result).toEqual({
        key: '__window_key__',
        value: testValue,
        type: 6006
      });
    });

    it('should return undefined values when all handlers return null', async () => {
      // Mock all handlers to return null
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValue(null);
      windowNameHandler.get.mockResolvedValue(null);

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(result).toEqual({
        key: undefined,
        value: undefined,
        type: undefined
      });
    });

    it('should check both old and new keys for each handler', async () => {
      // All handlers return null
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValue(null);
      windowNameHandler.get.mockResolvedValue(null);

      await TaggingHandler.getTaggingFromStorages();

      // Verify each handler was called with both keys
      expect(indexedDBHandler.get).toHaveBeenCalledWith('(global.c3)');
      expect(indexedDBHandler.get).toHaveBeenCalledWith('__indexedDB_key__');
      expect(etagHandler.get).toHaveBeenCalledWith('__etag_key__');
      expect(cacheApiHandler.get).toHaveBeenCalledWith('__cache_key__');
      expect(cookiesHandler.get).toHaveBeenCalledWith('gfp');
      expect(cookiesHandler.get).toHaveBeenCalledWith('__cookies_key__');
      expect(localStorageHandler.get).toHaveBeenCalledWith('(global.c3)');
      expect(localStorageHandler.get).toHaveBeenCalledWith('__localStorage_key__');
      expect(windowNameHandler.get).toHaveBeenCalledWith('__window_key__');
    });

    it('should stop searching when a value is found', async () => {
      const testValue = 'found-value';
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValueOnce(testValue); // found!

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(result).toEqual({
        key: '__etag_key__',
        value: testValue,
        type: 2002
      });
      
      // Should not have called subsequent handlers
      expect(cacheApiHandler.get).not.toHaveBeenCalled();
      expect(cookiesHandler.get).not.toHaveBeenCalled();
      expect(localStorageHandler.get).not.toHaveBeenCalled();
      expect(windowNameHandler.get).not.toHaveBeenCalled();
    });

    it('should handle handler errors gracefully', async () => {
      // First handler throws error - this should cause the method to throw
      indexedDBHandler.get.mockRejectedValue(new Error('IndexedDB error'));

      await expect(TaggingHandler.getTaggingFromStorages()).rejects.toThrow('IndexedDB error');
    });

    it('should prioritize old key over new key within same handler', async () => {
      const oldKeyValue = 'old-key-value';
      const newKeyValue = 'new-key-value';
      
      indexedDBHandler.get
        .mockResolvedValueOnce(oldKeyValue); // old key found

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(result).toEqual({
        key: '__indexedDB_key__',
        value: oldKeyValue,
        type: 1001
      });
      expect(indexedDBHandler.get).toHaveBeenCalledTimes(1); // Only old key checked
      expect(indexedDBHandler.get).toHaveBeenCalledWith('(global.c3)');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete tagging workflow', async () => {
      // Setup: no existing tags, should return undefined values
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      cookiesHandler.get.mockResolvedValue(null);
      localStorageHandler.get.mockResolvedValue(null);
      windowNameHandler.get.mockResolvedValue(null);

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(result).toEqual({
        key: undefined,
        value: undefined,
        type: undefined
      });
    });

    it('should handle mixed sync and async handlers', async () => {
      const testValue = 'mixed-handler-value';
      
      // Async handlers return null
      indexedDBHandler.get.mockResolvedValue(null);
      etagHandler.get.mockResolvedValue(null);
      cacheApiHandler.get.mockResolvedValue(null);
      
      // Sync handler returns value
      cookiesHandler.get.mockResolvedValue(testValue);

      const result = await TaggingHandler.getTaggingFromStorages();

      expect(result).toEqual({
        key: '__cookies_key__',
        value: testValue,
        type: 4004
      });
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

      await TaggingHandler.getTaggingFromStorages();

      const expectedOrder = [
        'IndexedDB', 'IndexedDB', // old key, new key
        'ETag', // only new key (no old key for etag)
        'CacheApi', // only new key (no old key for cache)
        'Cookies', 'Cookies', // old key, new key
        'LocalStorage', 'LocalStorage', // old key, new key
        'WindowName' // only new key (no old key for window)
      ];

      expect(callOrder).toEqual(expectedOrder);
    });
  });
});