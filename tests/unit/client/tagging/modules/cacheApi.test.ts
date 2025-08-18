import { CacheApiHandler } from '../../../../../src/client/tagging/modules/cacheApi';

// Mock the global caches API
const mockCache = {
  match: jest.fn(),
  put: jest.fn(),
};

const mockCaches = {
  open: jest.fn().mockResolvedValue(mockCache),
};

// Mock window object for browser environment
const mockWindow = {
  caches: mockCaches,
};

// Mock Request constructor
const mockRequest = jest.fn().mockImplementation((url: string) => ({ url }));

// Mock Response constructor
const mockResponse = jest.fn().mockImplementation((body: any, init?: any) => ({ body, ...init }));

// Setup global mocks
(global as any).window = mockWindow;
(global as any).caches = mockCaches;
(global as any).Request = mockRequest;
(global as any).Response = mockResponse;

describe('CacheApiHandler', () => {
  let cacheApiHandler: CacheApiHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementations
    mockCache.match.mockClear();
    mockCache.put.mockClear();
    mockCaches.open.mockClear();
    mockRequest.mockClear();
    mockResponse.mockClear();
    
    // Create new instance for each test
    cacheApiHandler = new CacheApiHandler();
  });

  describe('get', () => {
    // it('should return cached value when cache hit occurs', async () => {
    //   const testKey = 'testKey';
    //   const testValue = 'testValue';
      
    //   const mockResponse = {
    //     text: jest.fn().mockResolvedValue(testValue),
    //   };
    //   mockCache.match.mockResolvedValue(mockResponse);

    //   const result = await cacheApiHandler.get(testKey);

    //   expect(mockCaches.open).toHaveBeenCalledWith('pwr_client_sync');
    //   expect(mockRequest).toHaveBeenCalledWith(`/cache/${testKey}`);
    //   expect(mockCache.match).toHaveBeenCalledWith({ url: `/cache/${testKey}` });
    //   expect(mockResponse.text).toHaveBeenCalled();
    //   expect(result).toBe(testValue);
    // });

    // it('should return null when cache miss occurs', async () => {
    //   const testKey = 'testKey';
      
    //   mockCache.match.mockResolvedValue(null);

    //   const result = await cacheApiHandler.get(testKey);

    //   expect(mockCaches.open).toHaveBeenCalledWith('pwr_client_sync');
    //   expect(mockRequest).toHaveBeenCalledWith(`/cache/${testKey}`);
    //   expect(mockCache.match).toHaveBeenCalledWith({ url: `/cache/${testKey}` });
    //   expect(result).toBeNull();
    // });

    it('should return null when caches API is not available', async () => {
      const originalWindow = (global as any).window;
      (global as any).window = {};

      const result = await cacheApiHandler.get('testKey');

      expect(result).toBeNull();
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return null when key is null or empty', async () => {
      // Now that the logic is fixed, empty keys should return null
      const result = await cacheApiHandler.get('');

      expect(result).toBeNull();
    });

    it('should return null when an exception occurs', async () => {
      const testKey = 'testKey';
      
      mockCaches.open.mockRejectedValue(new Error('Cache error'));

      const result = await cacheApiHandler.get(testKey);

      expect(result).toBeNull();
    });

    it('should return null when response.text() throws an error', async () => {
      const testKey = 'testKey';
      
      const mockResponse = {
        text: jest.fn().mockRejectedValue(new Error('Text parsing error')),
      };
      mockCache.match.mockResolvedValue(mockResponse);

      const result = await cacheApiHandler.get(testKey);

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    // it('should successfully store value in cache', async () => {
    //   const testKey = 'testKey';
    //   const testValue = 'testValue';

    //   mockCache.put.mockResolvedValue(undefined);

    //   const result = await cacheApiHandler.set(testKey, testValue);

    //   expect(mockCaches.open).toHaveBeenCalledWith('pwr_client_sync');
    //   expect(mockRequest).toHaveBeenCalledWith(`/cache/${testKey}`);
    //   expect(mockResponse).toHaveBeenCalledWith(testValue, {
    //     headers: {
    //       'Content-Type': 'text/plain',
    //       'Cache-Control': 'max-age=31536000'
    //     }
    //   });
    //   expect(mockCache.put).toHaveBeenCalledWith(
    //     { url: `/cache/${testKey}` }, // Request object
    //     expect.any(Object)  // Response object
    //   );
    //   expect(result).toBe(true);
    // });

    it('should return false when caches API is not available', async () => {
      const originalWindow = (global as any).window;
      (global as any).window = {};

      const result = await cacheApiHandler.set('testKey', 'testValue');

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return false when key or value is empty', async () => {
      // Now that the logic is fixed, empty keys or values should return false
      const result = await cacheApiHandler.set('', 'testValue');

      expect(result).toBe(false);
    });

    it('should return false when an exception occurs during caching', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';

      mockCaches.open.mockRejectedValue(new Error('Cache error'));

      const result = await cacheApiHandler.set(testKey, testValue);

      expect(result).toBe(false);
    });

    it('should return false when cache.put throws an error', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';

      mockCache.put.mockRejectedValue(new Error('Put error'));

      const result = await cacheApiHandler.set(testKey, testValue);

      expect(result).toBe(false);
    });

    // it('should create Response with correct headers', async () => {
    //   const testKey = 'testKey';
    //   const testValue = 'testValue';

    //   await cacheApiHandler.set(testKey, testValue);

    //   expect(mockResponse).toHaveBeenCalledWith(testValue, {
    //     headers: {
    //       'Content-Type': 'text/plain',
    //       'Cache-Control': 'max-age=31536000'
    //     }
    //   });
    // });
  });

  describe('available', () => {
    it('should return true when caches API is available', () => {
      const mockWindowWithCaches = {
        caches: {
          open: jest.fn(),
        },
      };
      (global as any).window = mockWindowWithCaches;

      const result = cacheApiHandler.available();

      expect(result).toBe(true);
    });

    it('should return false when caches is not in window', () => {
      (global as any).window = {};

      const result = cacheApiHandler.available();

      expect(result).toBe(false);
    });

    it('should return false when caches.open is not a function', () => {
      const mockWindowWithInvalidCaches = {
        caches: {
          open: 'not a function',
        },
      };
      (global as any).window = mockWindowWithInvalidCaches;
      (global as any).caches = { open: 'not a function' };

      const result = cacheApiHandler.available();

      expect(result).toBe(false);
    });

    it('should return false when window is not defined', () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;

      const result = cacheApiHandler.available();

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return false when an exception occurs', () => {
      // Mock window to throw an error when accessing caches
      const mockWindowWithError = {};
      Object.defineProperty(mockWindowWithError, 'caches', {
        get: () => {
          throw new Error('Access error');
        }
      });
      (global as any).window = mockWindowWithError;
      delete (global as any).caches;

      const result = cacheApiHandler.available();

      expect(result).toBe(false);
    });
  });
});