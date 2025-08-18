import { CookiesHandler } from '../../../../../src/client/tagging/modules/cookie';

// Mock document object for browser environment
const mockDocument = {
  cookie: '',
};

const mockWindow = {
  location: {
    hostname: 'test.example.com',
  },
};

(global as any).document = mockDocument;
(global as any).window = mockWindow;

describe('cookiesHandler', () => {
  let cookiesHandler: CookiesHandler;
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document.cookie
    mockDocument.cookie = '';
    cookiesHandler = new CookiesHandler();
  });

  describe('get', () => {
    it('should return cookie value when cookie exists', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';
      
      mockDocument.cookie = `${testKey}=${testValue}; otherCookie=otherValue`;

      const result = await cookiesHandler.get(testKey);

      expect(result).toBe(testValue);
    });

    it('should return null when cookie does not exist', async () => {
      const testKey = 'nonExistentKey';
      
      mockDocument.cookie = 'otherCookie=otherValue; anotherCookie=anotherValue';

      const result = await cookiesHandler.get(testKey);

      expect(result).toBeNull();
    });

    it('should return null when document is undefined', async () => {
      const originalDocument = (global as any).document;
      delete (global as any).document;

      const result = await cookiesHandler.get('testKey');

      expect(result).toBeNull();
      
      // Restore original document
      (global as any).document = originalDocument;
    });

    it('should handle cookies with spaces correctly', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';
      
      mockDocument.cookie = ` ${testKey}=${testValue}; otherCookie=otherValue`;

      const result = await cookiesHandler.get(testKey);

      expect(result).toBe(testValue);
    });

    it('should return the first matching cookie when multiple cookies have same name prefix', async () => {
      const testKey = 'test';
      const testValue = 'value1';
      
      mockDocument.cookie = `${testKey}=${testValue}; testLonger=value2`;

      const result = await cookiesHandler.get(testKey);

      expect(result).toBe(testValue);
    });

    it('should handle empty cookie value', async () => {
      const testKey = 'emptyKey';
      
      mockDocument.cookie = `${testKey}=; otherCookie=otherValue`;

      const result = await cookiesHandler.get(testKey);

      expect(result).toBe('');
    });

    it('should return null when an exception occurs', async () => {
      const originalDocument = (global as any).document;
      
      (global as any).document = {
        get cookie() {
          throw new Error('Cookie access error');
        }
      };

      const result = await cookiesHandler.get('testKey');

      expect(result).toBeNull();
      
      (global as any).document = originalDocument;
    });

    it('should handle special characters in cookie values', async () => {
      const testKey = 'specialKey';
      const testValue = 'value%20with%20spaces';
      
      mockDocument.cookie = `${testKey}=${testValue}`;

      const result = await cookiesHandler.get(testKey);

      expect(result).toBe(testValue);
    });
  });

  describe('set', () => {
    it('should set cookie successfully with default expiration', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';
      
      const result = await cookiesHandler.set(testKey, testValue);

      expect(result).toBe(true);
      expect(mockDocument.cookie).toContain(`${testKey}=${testValue}`);
      expect(mockDocument.cookie).toContain('path=/');
      expect(mockDocument.cookie).toContain('domain=test.example.com');
      expect(mockDocument.cookie).toContain('SameSite=None');
      expect(mockDocument.cookie).toContain('Secure');
    });

    it('should set cookie with custom expiration days', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';
      const exdays = 30;
      
      const result = await cookiesHandler.set(testKey, testValue, exdays);

      expect(result).toBe(true);
      expect(mockDocument.cookie).toContain(`${testKey}=${testValue}`);
    });

    it('should return false when document is undefined', async () => {
      const originalDocument = (global as any).document;
      delete (global as any).document;

      const result = await cookiesHandler.set('testKey', 'testValue');

      expect(result).toBe(false);
      
      (global as any).document = originalDocument;
    });

    it('should return false when window is undefined', async () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;

      const result = await cookiesHandler.set('testKey', 'testValue');

      expect(result).toBe(false);
      
      (global as any).window = originalWindow;
    });

    it('should handle special characters in cookie name and value', async () => {
      const testKey = 'test-key_123';
      const testValue = 'test value with spaces';
      
      const result = await cookiesHandler.set(testKey, testValue);

      expect(result).toBe(true);
      expect(mockDocument.cookie).toContain(`${testKey}=${testValue}`);
    });

    it('should return false when an exception occurs', async () => {
      const originalDocument = (global as any).document;
      
      (global as any).document = {
        configurable: true,
        set cookie(value: string) {
          throw new Error('Cookie set error');
        }
      };

      const result = await cookiesHandler.set('testKey', 'testValue');

      expect(result).toBe(false);
      
      (global as any).document = originalDocument;
    });

    it('should set expiration date correctly', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';
      const exdays = 7;
      
      const mockDate = new Date('2025-01-01T00:00:00Z');
      const expectedExpirationDate = new Date('2025-01-08T00:00:00Z');
      
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      mockDate.setTime = jest.fn();
      mockDate.toUTCString = jest.fn().mockReturnValue(expectedExpirationDate.toUTCString());

      await cookiesHandler.set(testKey, testValue, exdays);

      expect(mockDate.setTime).toHaveBeenCalledWith(
        mockDate.getTime() + (exdays * 24 * 60 * 60 * 1000)
      );
      
      jest.restoreAllMocks();
    });
  });

  describe('available', () => {
    it('should return true when document is available', () => {
      const result = cookiesHandler.available();

      expect(result).toBe(true);
    });

    it('should return false when document is undefined', () => {
      const originalDocument = (global as any).document;
      delete (global as any).document;

      const result = cookiesHandler.available();

      expect(result).toBe(false);
      
      // Restore original document
      (global as any).document = originalDocument;
    });
  });

  // describe('Integration scenarios', () => {
  //   it('should handle complete cookie workflow', async () => {
  //     const testKey = 'integrationKey';
  //     const testValue = 'integrationValue';

  //     // First, check cookies are available
  //     const originalSet = cookiesHandler.set;
  //     const originalGet = cookiesHandler.get;
      
  //     jest.spyOn(cookiesHandler, 'set').mockResolvedValue(true);
  //     jest.spyOn(cookiesHandler, 'get').mockResolvedValue('test');
      
  //     expect(cookiesHandler.available()).toBe(true);
      
  //     // Restore and test actual operations
  //     cookiesHandler.set = originalSet;
  //     cookiesHandler.get = originalGet;

  //     // Set a cookie
  //     const setResult = await cookiesHandler.set(testKey, testValue);
  //     expect(setResult).toBe(true);

  //     // Mock the cookie being set in document
  //     mockDocument.cookie = `${testKey}=${testValue}`;

  //     // Get the cookie
  //     const getValue = await cookiesHandler.get(testKey);
  //     expect(getValue).toBe(testValue);
  //   });

  //   it('should handle empty values correctly', async () => {
  //     const testKey = 'emptyKey';
  //     const testValue = '';

  //     const setResult = await cookiesHandler.set(testKey, testValue);
  //     expect(setResult).toBe(false); // Should return false because empty value is not allowed

  //     mockDocument.cookie = `${testKey}=${testValue}`;

  //     const getValue = await cookiesHandler.get(testKey);
  //     expect(getValue).toBe('');
  //   });

  //   it('should handle URL encoded values', async () => {
  //     const testKey = 'urlKey';
  //     const testValue = 'hello%20world';

  //     const setResult = await cookiesHandler.set(testKey, testValue);
  //     expect(setResult).toBe(true);

  //     mockDocument.cookie = `${testKey}=${testValue}`;

  //     const getValue = await cookiesHandler.get(testKey);
  //     expect(getValue).toBe(testValue);
  //   });

  //   it('should handle multiple cookies', () => {
  //     const key1 = 'key1';
  //     const value1 = 'value1';
  //     const key2 = 'key2';
  //     const value2 = 'value2';

  //     cookiesHandler.set(key1, value1);
  //     cookiesHandler.set(key2, value2);

  //     mockDocument.cookie = `${key1}=${value1}; ${key2}=${value2}`;

  //     expect(cookiesHandler.get(key1)).toBe(value1);
  //     expect(cookiesHandler.get(key2)).toBe(value2);
  //   });
  // });
});