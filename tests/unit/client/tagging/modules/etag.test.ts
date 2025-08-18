import { ETagHandler } from '../../../../../src/client/tagging/modules/etag';

// Mock fetch globally
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe('etagHandler', () => {
  let etagHandler: ETagHandler;
  
  beforeEach(() => {
    jest.clearAllMocks();
    etagHandler = new ETagHandler();
    // Reset the internal state
    (etagHandler as any)._etag = null;
  });

  describe('constructor', () => {
    it('should initialize with SERVER_DOMAIN as base URL', () => {
      expect((etagHandler as any)._baseUrl).toBe('__SERVER_DOMAIN__');
    });

    it('should initialize with null etag', () => {
      expect((etagHandler as any)._etag).toBeNull();
    });
  });

  describe('available', () => {
    it('should return true when base URL is set to SERVER_DOMAIN', () => {
      const result = etagHandler.available();
      
      expect(result).toBe(true);
    });

    it('should return false when base URL is empty', () => {
      // Manually set base URL to empty for testing
      (etagHandler as any)._baseUrl = '';
      
      const result = etagHandler.available();
      
      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    it('should return null when base URL is not set', async () => {
      // Manually set base URL to empty for testing
      (etagHandler as any)._baseUrl = '';
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return cached etag when available', async () => {
      const cachedEtag = 'cached-etag-123';
      
      (etagHandler as any)._etag = cachedEtag;
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBe(cachedEtag);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch etag when not cached and return it', async () => {
      const testKey = 'testKey';
      const etagValue = 'etag-456';
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: etagValue
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.get(testKey);
      
      expect(result).toBe(etagValue);
      expect(mockFetch).toHaveBeenCalledWith('__SERVER_DOMAIN__/resources/versions', {
        method: 'GET'
      });
      expect((etagHandler as any)._etag).toBe(etagValue);
    });

    it('should return null when fetch response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
      expect((etagHandler as any)._etag).toBeNull();
    });

    it('should return null when response data is invalid', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          t: null
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
      expect((etagHandler as any)._etag).toBeNull();
    });

    it('should return null when response data lacks t property', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true
          // Missing 't' property
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
      expect((etagHandler as any)._etag).toBeNull();
    });

    it('should return null when fetch throws an error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
      expect((etagHandler as any)._etag).toBeNull();
    });

    it('should return null when JSON parsing fails', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
      expect((etagHandler as any)._etag).toBeNull();
    });
  });

  describe('set', () => {
    it('should return false when base URL is not set', async () => {
      // Manually set base URL to empty for testing
      (etagHandler as any)._baseUrl = '';
      
      const result = await etagHandler.set('testKey', 'test-value');
      
      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return false when value is empty', async () => {
      const result = await etagHandler.set('testKey', '');
      
      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return true when value matches cached etag', async () => {
      const etagValue = 'cached-etag-123';
      
      (etagHandler as any)._etag = etagValue;
      
      const result = await etagHandler.set('testKey', etagValue);
      
      expect(result).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch and update etag when value differs from cached', async () => {
      const newValue = 'new-etag-456';
      const fetchedEtag = 'fetched-etag-789';
      
      (etagHandler as any)._etag = 'old-etag';
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: fetchedEtag
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.set('testKey', newValue);
      
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('__SERVER_DOMAIN__/resources/versions', {
        method: 'GET'
      });
      expect((etagHandler as any)._etag).toBe(fetchedEtag);
    });

    it('should fetch and update etag when no cached etag exists', async () => {
      const newValue = 'new-etag-456';
      const fetchedEtag = 'fetched-etag-789';
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: fetchedEtag
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.set('testKey', newValue);
      
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('__SERVER_DOMAIN__/resources/versions', {
        method: 'GET'
      });
      expect((etagHandler as any)._etag).toBe(fetchedEtag);
    });

    it('should return false when fetch response is not ok', async () => {
      const newValue = 'new-etag-456';
      
      const mockResponse = {
        ok: false,
        status: 500
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.set('testKey', newValue);
      
      expect(result).toBe(false);
      expect((etagHandler as any)._etag).toBeNull();
    });

    it('should return false when response data is invalid', async () => {
      const newValue = 'new-etag-456';
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          t: null
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.set('testKey', newValue);
      
      expect(result).toBe(false);
      expect((etagHandler as any)._etag).toBeNull();
    });

    it('should return false when fetch throws an error', async () => {
      const newValue = 'new-etag-456';
      
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const result = await etagHandler.set('testKey', newValue);
      
      expect(result).toBe(false);
      expect((etagHandler as any)._etag).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete workflow: available -> get -> set', async () => {
      const etagValue = 'integration-etag-123';
      
      // Check availability
      expect(etagHandler.available()).toBe(true);
      
      // Mock successful fetch
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: etagValue
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      // Get etag (should fetch from API)
      const getResult = await etagHandler.get('testKey');
      expect(getResult).toBe(etagValue);
      
      // Set same etag (should use cached value)
      const setResult = await etagHandler.set('testKey', etagValue);
      expect(setResult).toBe(true);
      
      // Verify fetch was called only once (for get, not for set due to cache)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle state persistence across multiple operations', async () => {
      const firstEtag = 'first-etag';
      const secondEtag = 'second-etag';
      
      // First fetch
      let mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: firstEtag
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const firstGet = await etagHandler.get('key1');
      expect(firstGet).toBe(firstEtag);
      
      // Second get should use cached value
      const secondGet = await etagHandler.get('key2');
      expect(secondGet).toBe(firstEtag);
      
      // Verify fetch was called only once
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Set different value should trigger new fetch
      mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: secondEtag
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const setResult = await etagHandler.set('testKey', 'different-value');
      expect(setResult).toBe(true);
      expect((etagHandler as any)._etag).toBe(secondEtag);
      
      // Verify fetch was called again
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle edge cases with malformed responses', async () => {
      // Test with null response
      mockFetch.mockResolvedValue(null);
      let result = await etagHandler.get('testKey');
      expect(result).toBeNull();
      
      // Test with response missing json method
      mockFetch.mockResolvedValue({ ok: true });
      result = await etagHandler.get('testKey');
      expect(result).toBeNull();
      
      // Test with malformed JSON structure
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          // Missing success and t properties
          data: 'some data'
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      result = await etagHandler.get('testKey');
      expect(result).toBeNull();
    });
  });
});