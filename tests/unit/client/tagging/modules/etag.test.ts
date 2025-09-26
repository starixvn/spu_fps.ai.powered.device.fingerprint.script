import { ETagHandler } from '../../../../../src/client/tagging/modules/etag';
import { DomainUtils } from '../../../../../src/client/utils/domain';

// Mock fetch globally
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// Mock DomainUtils to return consistent value for tests
jest.mock('../../../../../src/client/utils/domain', () => ({
  DomainUtils: {
    getServerDomain: jest.fn().mockReturnValue('__SERVER_DOMAIN__')
  }
}));

describe('ETagHandler', () => {
  let etagHandler: ETagHandler;
  
  beforeEach(() => {
    jest.clearAllMocks();
    etagHandler = new ETagHandler();
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

    it('should fetch etag from API and return it', async () => {
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
      expect(mockFetch).toHaveBeenCalledWith('__SERVER_DOMAIN__/resources/vers', {
        method: 'GET'
      });
    });

    it('should return null when fetch response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
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
    });

    it('should return null when fetch throws an error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
    });

    it('should return null when JSON parsing fails', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await etagHandler.get('testKey');
      
      expect(result).toBeNull();
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

    it('should fetch and return true when API responds successfully', async () => {
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
      expect(mockFetch).toHaveBeenCalledWith('__SERVER_DOMAIN__/resources/vers', {
        method: 'GET',
        headers: {
          'Res-Ec-X': newValue
        }
      });
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
    });

    it('should return false when fetch throws an error', async () => {
      const newValue = 'new-etag-456';
      
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const result = await etagHandler.set('testKey', newValue);
      
      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete workflow: available -> get -> set', async () => {
      const etagValue = 'integration-etag-123';
      
      // Check availability
      expect(etagHandler.available()).toBe(true);
      
      // Mock successful fetch for get
      let mockResponse = {
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
      
      // Mock successful fetch for set
      mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: 'set-response-etag'
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      // Set etag (should also fetch from API)
      const setResult = await etagHandler.set('testKey', 'new-value');
      expect(setResult).toBe(true);
      
      // Verify fetch was called twice (once for get, once for set)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple get operations independently', async () => {
      const firstEtag = 'first-etag';
      const secondEtag = 'second-etag';
      
      // First get
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
      
      // Second get with different response
      mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: secondEtag
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const secondGet = await etagHandler.get('key2');
      expect(secondGet).toBe(secondEtag);
      
      // Verify fetch was called twice (no caching)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle set operations with headers correctly', async () => {
      const setValue = 'test-set-value';
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          t: 'response-etag'
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const setResult = await etagHandler.set('testKey', setValue);
      expect(setResult).toBe(true);
      
      // Verify the correct headers were sent
      expect(mockFetch).toHaveBeenCalledWith('__SERVER_DOMAIN__/resources/vers', {
        method: 'GET',
        headers: {
          'Res-Ec-X': setValue
        }
      });
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