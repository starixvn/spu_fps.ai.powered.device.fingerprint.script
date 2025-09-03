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

  describe('getEtag', () => {
    it('should return internal etag when set', () => {
      const testEtag = 'internal-etag';
      
      // Set internal etag first
      taggingService.setEtag(mockResponse as Response, testEtag);

      const result = taggingService.getEtag(mockRequest as Request);

      expect(result).toBe(testEtag);
    });

    it('should return etag from if-none-match header when internal etag not set', () => {
      mockRequest.headers = { 'if-none-match': 'header-etag' };

      const result = taggingService.getEtag(mockRequest as Request);

      expect(result).toBe('header-etag');
    });

    it('should return null when no etag available', () => {
      const result = taggingService.getEtag(mockRequest as Request);

      expect(result).toBe(null);
    });

    it('should prioritize internal etag over header', () => {
      const internalEtag = 'internal-etag';
      const headerEtag = 'header-etag';
      
      mockRequest.headers = { 'if-none-match': headerEtag };
      taggingService.setEtag(mockResponse as Response, internalEtag);

      const result = taggingService.getEtag(mockRequest as Request);

      expect(result).toBe(internalEtag);
    });

    it('should handle string header values correctly', () => {
      mockRequest.headers = { 'if-none-match': 'single-etag' };

      const result = taggingService.getEtag(mockRequest as Request);

      expect(result).toBe('single-etag');
    });
  });

  describe('setEtag', () => {
    it('should set etag and headers when etag is new', () => {
      const testEtag = 'new-etag-value';

      taggingService.setEtag(mockResponse as Response, testEtag);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Etag', testEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, max-age=600');
    });

    it('should not set headers when etag is same as current', () => {
      const testEtag = 'same-etag';

      // Set etag first time
      taggingService.setEtag(mockResponse as Response, testEtag);
      jest.clearAllMocks();

      // Set same etag again
      taggingService.setEtag(mockResponse as Response, testEtag);

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should update internal etag value', () => {
      const testEtag = 'updated-etag';

      taggingService.setEtag(mockResponse as Response, testEtag);

      const result = taggingService.getEtag(mockRequest as Request);
      expect(result).toBe(testEtag);
    });

    it('should allow updating to different etag', () => {
      const firstEtag = 'first-etag';
      const secondEtag = 'second-etag';

      // Set first etag
      taggingService.setEtag(mockResponse as Response, firstEtag);
      expect(taggingService.getEtag(mockRequest as Request)).toBe(firstEtag);

      // Clear mocks to check second call
      jest.clearAllMocks();

      // Set second etag
      taggingService.setEtag(mockResponse as Response, secondEtag);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Etag', secondEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, max-age=600');
      expect(taggingService.getEtag(mockRequest as Request)).toBe(secondEtag);
    });

    it('should handle empty string etag (returns null due to falsy check)', () => {
      const emptyEtag = '';

      taggingService.setEtag(mockResponse as Response, emptyEtag);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Etag', emptyEtag);
      // Empty string is falsy, so getEtag returns null instead of empty string
      expect(taggingService.getEtag(mockRequest as Request)).toBe(null);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow: set etag -> get etag', () => {
      const testEtag = 'workflow-etag';

      // Set etag
      taggingService.setEtag(mockResponse as Response, testEtag);

      // Get etag should return the set value
      const result = taggingService.getEtag(mockRequest as Request);

      expect(result).toBe(testEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Etag', testEtag);
    });

    it('should handle multiple etag updates', () => {
      const etag1 = 'etag-1';
      const etag2 = 'etag-2';
      const etag3 = 'etag-3';

      // Set multiple etags in sequence
      taggingService.setEtag(mockResponse as Response, etag1);
      expect(taggingService.getEtag(mockRequest as Request)).toBe(etag1);

      taggingService.setEtag(mockResponse as Response, etag2);
      expect(taggingService.getEtag(mockRequest as Request)).toBe(etag2);

      taggingService.setEtag(mockResponse as Response, etag3);
      expect(taggingService.getEtag(mockRequest as Request)).toBe(etag3);

      // Verify setHeader was called for each unique etag
      expect(mockResponse.setHeader).toHaveBeenCalledTimes(6); // 3 etags * 2 headers each
    });

    it('should fallback to header when no internal etag set', () => {
      const headerEtag = 'fallback-header-etag';
      mockRequest.headers = { 'if-none-match': headerEtag };

      // Don't set internal etag, should fallback to header
      const result = taggingService.getEtag(mockRequest as Request);

      expect(result).toBe(headerEtag);
    });

    it('should persist internal state across multiple operations', () => {
      const persistentEtag = 'persistent-etag';

      // Set etag once
      taggingService.setEtag(mockResponse as Response, persistentEtag);

      // Call getEtag multiple times
      expect(taggingService.getEtag(mockRequest as Request)).toBe(persistentEtag);
      expect(taggingService.getEtag(mockRequest as Request)).toBe(persistentEtag);
      expect(taggingService.getEtag(mockRequest as Request)).toBe(persistentEtag);

      // All should return the same value
      expect(mockResponse.setHeader).toHaveBeenCalledTimes(2); // Only called once during setEtag
    });
  });
});