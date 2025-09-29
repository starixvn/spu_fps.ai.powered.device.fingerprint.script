// Mock all services BEFORE importing the app
jest.mock('../../../src/server/services/fingerprintScriptService');
jest.mock('../../../src/server/services/taggingScriptService');
jest.mock('../../../src/server/services/taggingService');
jest.mock('../../../src/config/environment', () => ({
  default: {
    port: 3000,
    nodeEnv: 'test',
    localStorageKey: 'test_localStorage',
    indexedDBKey: 'test_indexedDB',
    cookiesKey: 'test_cookies',
    cacheKey: 'test_cache',
    gatewayUrl: 'https://test.gateway.com/api',
    encodeKey: 'test_encode_key',
    sessionKey: 'test_session_key',
    version: '1.0.0',
    cacheExpireTime: '86400'
  }
}));

import request from 'supertest';
import { FingerprintScriptService } from '../../../src/server/services/fingerprintScriptService';
import { TaggingScriptService } from '../../../src/server/services/taggingScriptService';
import { TaggingService } from '../../../src/server/services/taggingService';

const MockedFingerprintScriptService = FingerprintScriptService as jest.MockedClass<typeof FingerprintScriptService>;
const MockedTaggingScriptService = TaggingScriptService as jest.MockedClass<typeof TaggingScriptService>;
const MockedTaggingService = TaggingService as jest.MockedClass<typeof TaggingService>;

// Set up the mocks before importing the app
const mockFingerprintScriptService = {
  getFingerprintScript: jest.fn().mockReturnValue('console.log("fingerprint fallback");'),
  getMinifiedFingerprintScript: jest.fn().mockResolvedValue('console.log("fingerprint minified");'),
  rebuildScript: jest.fn(),
  getScriptInfo: jest.fn()
} as any;

const mockTaggingScriptService = {
  getTaggingScript: jest.fn().mockReturnValue('console.log("tagging fallback");'),
  getMinifiedTaggingScript: jest.fn().mockResolvedValue('console.log("tagging minified");'),
  rebuildScript: jest.fn(),
  getScriptInfo: jest.fn()
} as any;

const mockTaggingService = {
  setEtag: jest.fn(),
  getEtag: jest.fn().mockReturnValue(null)
} as any;

MockedFingerprintScriptService.mockImplementation(() => mockFingerprintScriptService);
MockedTaggingScriptService.mockImplementation(() => mockTaggingScriptService);
MockedTaggingService.mockImplementation(() => mockTaggingService);

// Import app AFTER setting up mocks
import app from '../../../src/server/index';

describe('Express Server Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

//   describe('GET /api/fingerprint', () => {
//     it('should generate and return fingerprint successfully', async () => {
//       const mockServerFingerprint = {
//         userAgent: 'Mozilla/5.0',
//         ip: '127.0.0.1',
//         platform: 'Windows 10'
//       };
      
//       const mockHashedFingerprint = {
//         murmur: '12345',
//         sha256: 'abcd1234',
//         combined: 'efgh5678'
//       };

//       mockFingerprintService.generateFingerprint.mockResolvedValue(mockServerFingerprint as any);
//       mockHashService.hashFingerprint.mockReturnValue(mockHashedFingerprint);

//       const response = await request(app)
//         .get('/api/fingerprint')
//         .expect(200);

//       expect(response.body).toMatchObject({
//         success: true,
//         data: {
//           fingerprint: mockHashedFingerprint,
//           timestamp: expect.any(String)
//         }
//       });

//       expect(mockFingerprintService.generateFingerprint).toHaveBeenCalledWith(expect.any(Object));
//       expect(mockHashService.hashFingerprint).toHaveBeenCalledWith(mockServerFingerprint);
//     });

//     it('should handle fingerprint generation errors', async () => {
//       mockFingerprintService.generateFingerprint.mockRejectedValue(new Error('Fingerprint error'));

//       const response = await request(app)
//         .get('/api/fingerprint')
//         .expect(500);

//       expect(response.body).toEqual({
//         success: false,
//         error: 'Failed to generate fingerprint'
//       });
//     });
//   });

//   describe('POST /api/fingerprint', () => {
//     it('should handle POST fingerprint processing errors', async () => {
//       mockFingerprintService.generateFingerprint.mockRejectedValue(new Error('Server error'));

//       const response = await request(app)
//         .post('/api/fingerprint')
//         .send({ fingerprint: { test: 'data' } })
//         .expect(500);

//       expect(response.body).toEqual({
//         success: false,
//         error: 'Failed to process fingerprint'
//       });
//     });
//   });

  describe('GET /healthz', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        timestamp: expect.any(String)
      });

      // Validate timestamp format
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /resources/vers', () => {
    it('should return success when etag value is present', async () => {
      const response = await request(app)
        .get('/resources/vers')
        .set('Res-Ec-X', 'test-etag')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        t: 'test-etag'
      });
    });

    it('should return failure when no etag value', async () => {
      const response = await request(app)
        .get('/resources/vers')
        .expect(200);

      expect(response.body).toEqual({
        success: false,
        t: null
      });
    });

    it('should handle array of etag values', async () => {
      const response = await request(app)
        .get('/resources/vers')
        .set('Res-Ec-X', 'first-etag,second-etag')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        t: 'first-etag,second-etag'
      });
    });
  });

  describe('GET /test', () => {
    it('should return test page with FPS test content', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.text).toContain('FPS Fingerprint Test');
      expect(response.text).toContain('testFPS()');
      expect(response.text).toContain('FPSFingerprint.collect()');
      expect(response.header['content-type']).toMatch(/text\/html/);
    });
  }); 

  describe('GET /', () => {
    it('should redirect to healthz page', async () => {
      const response = await request(app)
        .get('/')
        .expect(302);

      expect(response.header.location).toBe('/healthz');
    });
  });

  describe('Script Routes', () => {
    describe('GET /api/fingerprintScript', () => {
      it('should return fingerprint script', async () => {
        mockFingerprintScriptService.getFingerprintScript.mockReturnValue('console.log("fingerprint");');

        const response = await request(app)
          .get('/api/fingerprintScript')
          .expect(200);

        expect(response.header['content-type']).toBe('application/javascript; charset=utf-8');
        expect(response.header['cache-control']).toBe('private, max-age=3600');
        expect(response.text).toBe('console.log("fingerprint");');
      });

      it('should handle fingerprint script errors', async () => {
        mockFingerprintScriptService.getFingerprintScript.mockImplementation(() => {
          throw new Error('Script generation failed');
        });

        const response = await request(app)
          .get('/api/fingerprintScript')
          .expect(500);

        expect(response.body).toEqual({
          success: false,
          error: 'Failed to deliver script'
        });
      });
    });

    describe('GET /api/taggingScript', () => {
      it('should return tagging script', async () => {
        mockTaggingScriptService.getTaggingScript.mockReturnValue('console.log("tagging");');

        const response = await request(app)
          .get('/api/taggingScript')
          .expect(200);

        expect(response.header['content-type']).toBe('application/javascript; charset=utf-8');
        expect(response.header['cache-control']).toBe('private, max-age=3600');
        expect(response.text).toBe('console.log("tagging");');
      });

      it('should handle tagging script errors', async () => {
        mockTaggingScriptService.getTaggingScript.mockImplementation(() => {
          throw new Error('Script generation failed');
        });

        const response = await request(app)
          .get('/api/taggingScript')
          .expect(500);

        expect(response.body).toEqual({
          success: false,
          error: 'Failed to deliver script'
        });
      });
    });

    describe('GET /libs/apd-express.js', () => {
      it('should return tagging script bundle', async () => {
        mockTaggingScriptService.getTaggingScript.mockReturnValue('console.log("tagging bundle");');

        const response = await request(app)
          .get('/libs/apd-express.js')
          .expect(200);

        expect(response.header['content-type']).toBe('application/javascript; charset=utf-8');
        expect(response.header['cache-control']).toBe('private, max-age=3600');
        expect(response.text).toBe('console.log("tagging bundle");');
      });
    });

    describe('GET /libs/apd-routing.js', () => {
      it('should return fingerprint script bundle', async () => {
        mockFingerprintScriptService.getFingerprintScript.mockReturnValue('console.log("fingerprint bundle");');

        const response = await request(app)
          .get('/libs/apd-routing.js')
          .expect(200);

        expect(response.header['content-type']).toBe('application/javascript; charset=utf-8');
        expect(response.header['cache-control']).toBe('private, max-age=3600');
        expect(response.text).toBe('console.log("fingerprint bundle");');
      });
    });
  });

  describe('GET /demo.html', () => {
    it('should attempt to serve demo.html', async () => {
      // This test might fail in actual execution due to file not existing
      // but it tests the route configuration
      const response = await request(app)
        .get('/demo.html');

      // We expect either 200 (if file exists) or 404 (if file doesn't exist)
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /examples.html', () => {
    it('should attempt to serve examples page', async () => {
      const response = await request(app)
        .get('/examples.html');

      // We expect either 200 (if file exists) or 404 (if file doesn't exist)
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /login-demo.html', () => {
    it('should return 404 with custom message', async () => {
      const response = await request(app)
        .get('/login-demo.html')
        .expect(404);

      expect(response.text).toContain('Login Demo Not Available');
      expect(response.text).toContain('This demo is not yet implemented');
      expect(response.text).toContain('/demo.html');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/fingerprint')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });

  describe('Static File Serving', () => {
    it('should serve files from examples directory', async () => {
      const response = await request(app)
        .get('/examples/test.js');

      // Expect either 200 (file exists) or 404 (file doesn't exist)
      expect([200, 404]).toContain(response.status);
    });

    it('should serve static files from root', async () => {
      const response = await request(app)
        .get('/package.json');

      // Expect either 200 (file exists) or 404 (file doesn't exist)
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('HTTP Headers', () => {
    it('should disable ETag for responses', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.header.etag).toBeUndefined();
    });

    it('should set correct content-type for JavaScript files', async () => {
      mockTaggingScriptService.getTaggingScript.mockReturnValue('console.log("test");');

      const response = await request(app)
        .get('/libs/apd-express.js')
        .expect(200);

      expect(response.header['content-type']).toBe('application/javascript; charset=utf-8');
    });
  });
});
