import { HashService } from '../../../../src/server/services/hashService';

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(() => {
    hashService = new HashService();
  });

  describe('hashFingerprint', () => {
    it('should generate consistent hashes for the same fingerprint', () => {
      const fingerprint = {
        userAgent: 'Mozilla/5.0',
        platform: 'Windows',
        canvas: 'canvas-hash'
      };

      const result1 = hashService.hashFingerprint(fingerprint);
      const result2 = hashService.hashFingerprint(fingerprint);

      expect(result1).toEqual(result2);
      expect(result1.murmur).toBe(result2.murmur);
      expect(result1.sha256).toBe(result2.sha256);
      expect(result1.combined).toBe(result2.combined);
    });

    it('should generate different hashes for different fingerprints', () => {
      const fingerprint1 = { userAgent: 'Chrome' };
      const fingerprint2 = { userAgent: 'Firefox' };

      const result1 = hashService.hashFingerprint(fingerprint1);
      const result2 = hashService.hashFingerprint(fingerprint2);

      expect(result1.murmur).not.toBe(result2.murmur);
      expect(result1.sha256).not.toBe(result2.sha256);
      expect(result1.combined).not.toBe(result2.combined);
    });

    it('should return object with murmur, sha256, and combined properties', () => {
      const fingerprint = { test: 'value' };
      const result = hashService.hashFingerprint(fingerprint);

      expect(result).toHaveProperty('murmur');
      expect(result).toHaveProperty('sha256');
      expect(result).toHaveProperty('combined');
    //   expect(typeof result.murmur).toBe('string');
      expect(typeof result.sha256).toBe('string');
      expect(typeof result.combined).toBe('string');
    });

    it('should generate 64-character SHA-256 hashes', () => {
      const fingerprint = { test: 'value' };
      const result = hashService.hashFingerprint(fingerprint);

      expect(result.sha256).toHaveLength(64);
      expect(result.combined).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(result.sha256)).toBe(true);
      expect(/^[a-f0-9]+$/.test(result.combined)).toBe(true);
    });

    it('should handle empty fingerprint objects', () => {
      const emptyFingerprint = {};
      const result = hashService.hashFingerprint(emptyFingerprint);

      expect(result.murmur).toBeDefined();
      expect(result.sha256).toBeDefined();
      expect(result.combined).toBeDefined();
    });

    it('should handle complex nested fingerprint objects', () => {
      const complexFingerprint = {
        client: {
          canvas: 'canvas-data',
          webgl: { vendor: 'NVIDIA', renderer: 'GeForce' },
          screen: { width: 1920, height: 1080 }
        },
        server: {
          userAgent: 'Mozilla/5.0',
          headers: { accept: 'text/html' }
        }
      };

      const result = hashService.hashFingerprint(complexFingerprint);

      expect(result.murmur).toBeDefined();
      expect(result.sha256).toBeDefined();
      expect(result.combined).toBeDefined();
    });

    it('should be sensitive to property order changes', () => {
      const fingerprint1 = { a: 1, b: 2 };
      const fingerprint2 = { b: 2, a: 1 };

      const result1 = hashService.hashFingerprint(fingerprint1);
      const result2 = hashService.hashFingerprint(fingerprint2);

      // JSON.stringify preserves property order, so these should be different
      expect(result1.sha256).not.toBe(result2.sha256);
    });
  });

  describe('hashString', () => {
    it('should generate consistent SHA-256 hash for same input', () => {
      const input = 'test-string';
      const result1 = hashService.hashString(input);
      const result2 = hashService.hashString(input);

      expect(result1).toBe(result2);
      expect(result1).toHaveLength(64);
    });

    it('should generate different hashes for different inputs', () => {
      const result1 = hashService.hashString('input1');
      const result2 = hashService.hashString('input2');

      expect(result1).not.toBe(result2);
    });

    it('should handle empty strings', () => {
      const result = hashService.hashString('');
      expect(result).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(result)).toBe(true);
    });

    it('should handle special characters and unicode', () => {
      const specialChars = 'Hello 世界! @#$%^&*()';
      const result = hashService.hashString(specialChars);

      expect(result).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(result)).toBe(true);
    });

    it('should be case sensitive', () => {
      const result1 = hashService.hashString('Test');
      const result2 = hashService.hashString('test');

      expect(result1).not.toBe(result2);
    });
  });
});

