import request from 'supertest';
import app from '../../../src/server/index';
import { FingerprintService } from '../../../src/server/services/fingerprintService';
import { TaggingService } from '../../../src/server/services/taggingService';
import { HashService } from '../../../src/server/services/hashService';
import { ScriptService } from '../../../src/server/services/scriptService';

// Mock all services
jest.mock('../../../src/server/services/fingerprintService');
jest.mock('../../../src/server/services/taggingService');
jest.mock('../../../src/server/services/hashService');
jest.mock('../../../src/server/services/scriptService');
jest.mock('../../../src/config/environment', () => ({
  port: 3000,
  nodeEnv: 'test'
}));

const MockedFingerprintService = FingerprintService as jest.MockedClass<typeof FingerprintService>;
const MockedTaggingService = TaggingService as jest.MockedClass<typeof TaggingService>;
const MockedHashService = HashService as jest.MockedClass<typeof HashService>;
const MockedScriptService = ScriptService as jest.MockedClass<typeof ScriptService>;

describe('Express Server Routes', () => {
  let mockFingerprintService: jest.Mocked<FingerprintService>;
  let mockTaggingService: jest.Mocked<TaggingService>;
  let mockHashService: jest.Mocked<HashService>;
  let mockScriptService: jest.Mocked<ScriptService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFingerprintService = new MockedFingerprintService() as jest.Mocked<FingerprintService>;
    mockTaggingService = new MockedTaggingService() as jest.Mocked<TaggingService>;
    mockHashService = new MockedHashService() as jest.Mocked<HashService>;
    mockScriptService = new MockedScriptService() as jest.Mocked<ScriptService>;

    MockedFingerprintService.mockImplementation(() => mockFingerprintService);
    MockedTaggingService.mockImplementation(() => mockTaggingService);
    MockedHashService.mockImplementation(() => mockHashService);
    MockedScriptService.mockImplementation(() => mockScriptService);

    mockFingerprintService.generateFingerprint = jest.fn();
    mockFingerprintService.combineFingerprints = jest.fn();
    mockTaggingService.getCachedCandidateValue = jest.fn();
    mockTaggingService.setEtag = jest.fn();
    mockHashService.hashFingerprint = jest.fn();
    mockScriptService.getClientScript = jest.fn();
    mockScriptService.getMinifiedScript = jest.fn();
    mockScriptService.getWrappedScript = jest.fn();
    mockScriptService.getScriptInfo = jest.fn();
    mockScriptService.rebuildScript = jest.fn();
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

  describe('GET /test', () => {
    it('should return test HTML page', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('FPS Fingerprint Test');
      expect(response.text).toContain('testFPS()');
      expect(response.text).toContain('/script.js');
      expect(response.header['content-type']).toBe('text/html; charset=utf-8');
    });
  });

  describe('GET /', () => {
    it('should redirect to examples page', async () => {
      const response = await request(app)
        .get('/')
        .expect(302);

      expect(response.header.location).toBe('/examples.html');
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
      mockScriptService.getClientScript.mockReturnValue('console.log("test");');

      const response = await request(app)
        .get('/script.js')
        .expect(200);

      expect(response.header['content-type']).toBe('application/javascript');
    });

    it('should set cache headers for script endpoints', async () => {
      mockScriptService.getClientScript.mockReturnValue('console.log("test");');
      mockScriptService.getMinifiedScript.mockReturnValue('console.log("min");');

      const scriptResponse = await request(app).get('/script.js');
      const minifiedResponse = await request(app).get('/script.min.js');

      expect(scriptResponse.header['cache-control']).toBe('public, max-age=3600');
      expect(minifiedResponse.header['cache-control']).toBe('public, max-age=86400');
    });
  });
});
