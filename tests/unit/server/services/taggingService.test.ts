/**
 * TaggingService Unit Tests
 * Server-side tagging service testing
 */

import { Request, Response } from 'express';
import { TaggingService } from '../../../../src/server/services/taggingService';
import { DeviceEncryption } from '../../../../src/server/services/hashService';

// Mock DeviceEncryption
jest.mock('../../../../src/server/services/hashService', () => ({
  DeviceEncryption: {
    Decrypt: jest.fn(),
    Encrypt: jest.fn()
  }
}));

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

  describe('getCachedCandidateValue', () => {
    it('should return etag value when available', () => {

      mockRequest.headers = { 'if-none-match': 'test-etag-value' };

      const result = taggingService.getCachedCandidateValue(mockRequest as Request);

      expect(result).toBe('test-etag-value');
    });

    it('should return cookie value when etag not available', () => {

      const testCookieValue = 'encrypted-cookie-value';
      mockRequest.cookies = { 'pwr_client_sync': testCookieValue };
      
      (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue('12345678123456781234567812345678');
      jest.spyOn(taggingService, 'isValidTagValue').mockReturnValue(true);

      const result = taggingService.getCachedCandidateValue(mockRequest as Request);

      expect(result).toBe(testCookieValue);
    });

    it('should return null when neither etag nor valid cookie available', () => {
      
      mockRequest.cookies = { 'pwr_client_sync': 'invalid-value' };
      jest.spyOn(taggingService, 'isValidTagValue').mockReturnValue(false);

      const result = taggingService.getCachedCandidateValue(mockRequest as Request);

      expect(result).toBe(null);
    });
  });

  describe('getEtag', () => {
    it('should return internal etag when set', () => {
      
      taggingService.setEtag(mockResponse as Response, 'internal-etag');

      const result = taggingService.getEtag(mockRequest as Request);

      expect(result).toBe('internal-etag');
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
  });

  describe('setEtag', () => {
    it('should set etag and headers when etag is new', () => {
      const testEtag = 'new-etag-value';

      taggingService.setEtag(mockResponse as Response, testEtag);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Etag', testEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, max-age=3600');
    });

    it('should not set headers when etag is same as current', () => {
      const testEtag = 'same-etag';

      taggingService.setEtag(mockResponse as Response, testEtag);
      jest.clearAllMocks();

      taggingService.setEtag(mockResponse as Response, testEtag);

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should update internal etag value', () => {
      const testEtag = 'updated-etag';

      taggingService.setEtag(mockResponse as Response, testEtag);

      const result = taggingService.getEtag(mockRequest as Request);
      expect(result).toBe(testEtag);
    });
  });

  describe('isValidTagValue', () => {
    it('should return false for null or empty values', () => {
      expect(taggingService.isValidTagValue('')).toBe(false);
      expect(taggingService.isValidTagValue('   ')).toBe(false);
      expect(taggingService.isValidTagValue(null as any)).toBe(false);
      expect(taggingService.isValidTagValue(undefined as any)).toBe(false);
    });

    it('should return true for valid encrypted GUID', () => {
      const validGuid = '12345678123456781234567812345678'; // 32 hex chars without hyphens
      (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue(validGuid);

      const result = taggingService.isValidTagValue('encrypted-value');

      expect(result).toBe(true);
      expect(DeviceEncryption.Decrypt).toHaveBeenCalledWith('encrypted-value');
    });

    it('should return true for valid GUID without hyphens', () => {
      const validGuidNoHyphens = '12345678123441238123123456789012'; // 32 hex chars
      (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue(validGuidNoHyphens);

      const result = taggingService.isValidTagValue('encrypted-value');

      expect(result).toBe(true);
    });

    it('should return false for invalid GUID format', () => {
      const invalidGuid = 'not-a-valid-guid';
      (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue(invalidGuid);

      const result = taggingService.isValidTagValue('encrypted-value');

      expect(result).toBe(false);
    });

    it('should return false when decryption fails', () => {
      (DeviceEncryption.Decrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      const result = taggingService.isValidTagValue('encrypted-value');

      expect(result).toBe(false);
    });
  });

//   describe('isValidGuid (private method testing through isValidTagValue)', () => {
//     it('should validate GUID without hyphens (32 hex chars)', () => {
//       const validGuidsNoHyphens = [
//         '12345678123456781234567812345678',
//         'abcdef01234567890abcdef0123456789',
//         'ABCDEF01234567890ABCDEF0123456789',
//         '00000000000000000000000000000000',
//         'ffffffffffffffffffffffffffffffff'
//       ];

//       validGuidsNoHyphens.forEach(guid => {
//         (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue(guid);
//         expect(taggingService.isValidTagValue('test')).toBe(true);
//       });
//     });

//     it('should reject GUID with hyphens (not matching C# ToString("N") format)', () => {
//       const invalidGuidsWithHyphens = [
//         '12345678-1234-4123-8123-123456789012',
//         'abcdef01-2345-4678-9abc-def012345678',
//         'ABCDEF01-2345-4678-9ABC-DEF012345678'
//       ];

//       invalidGuidsWithHyphens.forEach(guid => {
//         (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue(guid);
//         expect(taggingService.isValidTagValue('test')).toBe(false);
//       });
//     });

//     it('should reject invalid GUID formats', () => {
//       const invalidGuids = [
//         'too-short',
//         '12345678123456781234567812345678123', // Too long (33 chars)
//         '1234567812345678123456781234567', // Too short (31 chars)
//         '1234567g123456781234567812345678', // Invalid hex char 'g'
//         'not-a-guid-at-all',
//         '12345678-1234-4123-8123-123456789012', // Has hyphens
//         '', // Empty string
//         '   ' // Whitespace only
//       ];

//       invalidGuids.forEach(guid => {
//         (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue(guid);
//         expect(taggingService.isValidTagValue('test')).toBe(false);
//       });
//     });
//   });

  describe('getValueFromCookie', () => {
    it('should return cookie value when valid', () => {
      const cookieValue = 'valid-encrypted-value';
      mockRequest.cookies = { 'pwr_client_sync': cookieValue };
      
      (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue('12345678123456781234567812345678');

      // Use reflection to access private method
      const result = (taggingService as any).getValueFromCookie(mockRequest);

      expect(result).toBe(cookieValue);
    });

    it('should return null when cookie value is invalid', () => {
      mockRequest.cookies = { 'pwr_client_sync': 'invalid-value' };
      
      (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue('invalid-guid');

      const result = (taggingService as any).getValueFromCookie(mockRequest);

      expect(result).toBe(null);
    });

    it('should return null when no cookie present', () => {
      mockRequest.cookies = {};

      const result = (taggingService as any).getValueFromCookie(mockRequest);

      expect(result).toBe(null);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow: set etag -> get cached value', () => {
      const testEtag = 'workflow-etag';

      // Set etag
      taggingService.setEtag(mockResponse as Response, testEtag);

      // Get cached value should return the etag
      const result = taggingService.getCachedCandidateValue(mockRequest as Request);

      expect(result).toBe(testEtag);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Etag', testEtag);
    });

    it('should fallback from etag to cookie when etag not available', () => {
      const cookieValue = 'fallback-cookie-value';
      mockRequest.cookies = { 'pwr_client_sync': cookieValue };
      
      (DeviceEncryption.Decrypt as jest.Mock).mockReturnValue('12345678123456781234567812345678');

      const result = taggingService.getCachedCandidateValue(mockRequest as Request);

      expect(result).toBe(cookieValue);
    });
  });
});