/**
 * TaggingService Unit Tests
 * Server-side tagging service testing
 */

import { Request, Response } from 'express';
import { TaggingService } from '../../../../src/server/services/taggingService';

describe('TaggingService', () => {
  let taggingService: TaggingService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    taggingService = new TaggingService();
    
    // Mock Request object
    mockRequest = {
      cookies: {},
      headers: {}
    };

    // Mock Response object
    mockResponse = {
      setHeader: jest.fn(),
      cookie: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should set header with string value', () => {
      const key = 'test-header';
      const value = 'test-value';

      taggingService.set(mockResponse as Response, key, value);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(key, value);
    });

    it('should convert value to string', () => {
      const key = 'numeric-header';
      const value = 123;

      taggingService.set(mockResponse as Response, key, value.toString());

      expect(mockResponse.setHeader).toHaveBeenCalledWith(key, '123');
    });

    it('should handle empty string value', () => {
      const key = 'empty-header';
      const value = '';

      taggingService.set(mockResponse as Response, key, value);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(key, '');
    });
  });

  describe('get', () => {
    it('should return header value when present', () => {
      const key = 'test-header';
      const value = 'test-value';
      mockRequest.headers = { [key]: value };

      const result = taggingService.get(mockRequest as Request, key);

      expect(result).toBe(value);
    });

    it('should return undefined when header not present', () => {
      const key = 'missing-header';
      mockRequest.headers = {};

      const result = taggingService.get(mockRequest as Request, key);

      expect(result).toBe(undefined);
    });

    it('should throw error when headers is undefined', () => {
      const key = 'test-header';
      mockRequest.headers = undefined;

      expect(() => {
        taggingService.get(mockRequest as Request, key);
      }).toThrow();
    });

    it('should handle case-sensitive header names', () => {
      const key = 'Test-Header';
      const value = 'test-value';
      mockRequest.headers = { [key]: value };

      const result = taggingService.get(mockRequest as Request, key);

      expect(result).toBe(value);
    });
  });

  describe('formatEtag', () => {
    it('should return null for null input', () => {
      const result = taggingService.formatEtag(null);

      expect(result).toBe(null);
    });

    it('should return null for empty string', () => {
      const result = taggingService.formatEtag('');

      expect(result).toBe(null);
    });

    it('should remove W/ prefix', () => {
      const etag = 'W/"abc123"';
      const result = taggingService.formatEtag(etag);

      expect(result).toBe('abc123');
    });

    it('should remove surrounding quotes', () => {
      const etag = '"abc123"';
      const result = taggingService.formatEtag(etag);

      expect(result).toBe('abc123');
    });

    it('should remove both W/ prefix and quotes', () => {
      const etag = 'W/"abc123"';
      const result = taggingService.formatEtag(etag);

      expect(result).toBe('abc123');
    });

    it('should handle etag without quotes or W/ prefix', () => {
      const etag = 'abc123';
      const result = taggingService.formatEtag(etag);

      expect(result).toBe('abc123');
    });

    it('should handle etag with only W/ prefix', () => {
      const etag = 'W/abc123';
      const result = taggingService.formatEtag(etag);

      expect(result).toBe('abc123');
    });

    it('should handle etag with only quotes', () => {
      const etag = '"abc123"';
      const result = taggingService.formatEtag(etag);

      expect(result).toBe('abc123');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow: set header -> get header', () => {
      const key = 'etag';
      const value = 'workflow-etag';

      // Set header
      taggingService.set(mockResponse as Response, key, value);

      // Get header should return the set value
      mockRequest.headers = { [key]: value };
      const result = taggingService.get(mockRequest as Request, key);

      expect(result).toBe(value);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(key, value);
    });

    it('should handle etag formatting workflow', () => {
      const rawEtag = 'W/"abc123"';
      const formattedEtag = 'abc123';

      // Format etag
      const result = taggingService.formatEtag(rawEtag);

      expect(result).toBe(formattedEtag);
    });

    it('should handle multiple header operations', () => {
      const headers = {
        'etag': 'etag-value',
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      };

      // Set multiple headers
      Object.entries(headers).forEach(([key, value]) => {
        taggingService.set(mockResponse as Response, key, value);
      });

      // Get multiple headers
      mockRequest.headers = headers;
      Object.entries(headers).forEach(([key, value]) => {
        const result = taggingService.get(mockRequest as Request, key);
        expect(result).toBe(value);
      });

      // Verify setHeader was called for each header
      expect(mockResponse.setHeader).toHaveBeenCalledTimes(3);
    });
  });
});