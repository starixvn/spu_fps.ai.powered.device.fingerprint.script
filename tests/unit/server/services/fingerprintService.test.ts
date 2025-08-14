import { Request } from 'express';
import { FingerprintService } from '../../../../src/server/services/fingerprintService';

describe('FingerprintService', () => {
  let fingerprintService: FingerprintService;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    fingerprintService = new FingerprintService();
    
    mockRequest = {
      get: jest.fn(),
      headers: {},
      connection: {
        remoteAddress: '192.168.1.1',
        remotePort: 12345
      } as any,
      socket: {
        remoteAddress: '192.168.1.1',
        remotePort: 12345
      } as any
    };

    jest.clearAllMocks();
  });

  describe('generateFingerprint', () => {
    it('should generate complete server fingerprint with all properties', async () => {
      const mockUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const mockLanguage = 'en-US,en;q=0.9';

      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          switch (header) {
            case 'User-Agent': return mockUserAgent;
            case 'Accept-Language': return mockLanguage;
            case 'Accept': return 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
            case 'Accept-Encoding': return 'gzip, deflate, br';
            default: return undefined;
          }
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);

      expect(result).toMatchObject({
        userAgent: mockUserAgent,
        language: mockLanguage,
        ip: '192.168.1.1',
        headers: expect.any(Object),
        connection: {
          remoteAddress: '192.168.1.1',
          remotePort: 12345
        },
        platform: 'Windows 10',
        timestamp: expect.any(String)
      });

      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle missing User-Agent gracefully', async () => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);

      expect(result.userAgent).toBe('');
      expect(result.platform).toBe('Unknown');
    });

    it('should handle missing Accept-Language gracefully', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'User-Agent') return 'Mozilla/5.0';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);

      expect(result.language).toBe('');
    });

    it('should handle missing connection info gracefully', async () => {
      mockRequest.connection = undefined as any;
      mockRequest.socket = undefined as any;
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);

      expect(result.connection).toEqual({
        remoteAddress: 'unknown',
        remotePort: 0
      });
      expect(result.ip).toBe('unknown');
    });
  });

  describe('combineFingerprints', () => {
    it('should combine client and server fingerprints correctly', () => {
      const clientFingerprint = {
        canvas: 'canvas-hash',
        webgl: 'webgl-info',
        timezone: 'America/New_York'
      };

      const serverFingerprint = {
        userAgent: 'Mozilla/5.0',
        language: 'en-US',
        ip: '192.168.1.1',
        headers: {},
        connection: { remoteAddress: '192.168.1.1', remotePort: 12345 },
        platform: 'Windows 10',
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      const result = fingerprintService.combineFingerprints(clientFingerprint, serverFingerprint);

      expect(result).toMatchObject({
        client: clientFingerprint,
        server: serverFingerprint,
        combined: true,
        timestamp: expect.any(String)
      });

      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('getClientIP (private method testing through generateFingerprint)', () => {
    it('should extract IP from CF-Connecting-IP header', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'CF-Connecting-IP') return '203.0.113.1';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('203.0.113.1');
    });

    it('should extract IP from X-Forwarded-For header', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'X-Forwarded-For') return '203.0.113.2, 198.51.100.1';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('203.0.113.2'); // Should take first IP
    });

    it('should extract IP from X-Real-IP header', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'X-Real-IP') return '203.0.113.3';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('203.0.113.3');
    });

    it('should fallback to connection.remoteAddress when no headers', async () => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('192.168.1.1');
    });

    it('should fallback to socket.remoteAddress when connection unavailable', async () => {
      mockRequest.connection = { remoteAddress: undefined } as any;
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('192.168.1.1'); // From socket
    });

    it('should return "unknown" when no IP available', async () => {
      mockRequest.connection = { remoteAddress: undefined } as any;
      mockRequest.socket = { remoteAddress: undefined } as any;
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('unknown');
    });

    it('should skip invalid IP addresses', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'X-Forwarded-For') return 'invalid-ip, 203.0.113.4';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('192.168.1.1'); // Fallback to connection
    });
  });

//   describe('extractPlatform (private method testing through generateFingerprint)', () => {
//     const testCases = [
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//         expected: 'Windows 10'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36',
//         expected: 'Windows 8.1'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36',
//         expected: 'Windows 8'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36',
//         expected: 'Windows 7'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101',
//         expected: 'Windows'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
//         expected: 'macOS 10.15'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15.7) AppleWebKit/537.36',
//         expected: 'macOS 10.15.7'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36',
//         expected: 'macOS 10.14'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Macintosh; PowerPC Mac OS X) AppleWebKit/537.36',
//         expected: 'macOS'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
//         expected: 'Android 11'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-A505F) AppleWebKit/537.36',
//         expected: 'Android 10'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36',
//         expected: 'Android'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
//         expected: 'iOS 15.0'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
//         expected: 'iOS 14.7'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
//         expected: 'Linux'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101',
//         expected: 'Ubuntu'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (X11; Debian; Linux x86_64; rv:94.0) Gecko/20100101',
//         expected: 'Debian'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:94.0) Gecko/20100101',
//         expected: 'Fedora'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (X11; CentOS; Linux x86_64; rv:94.0) Gecko/20100101',
//         expected: 'CentOS'
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Unknown OS) AppleWebKit/537.36',
//         expected: 'Unknown'
//       }
//     ];

//     testCases.forEach(({ userAgent, expected }) => {
//       it(`should extract "${expected}" from "${userAgent.substring(0, 50)}..."`, async () => {
//         (mockRequest.get as jest.Mock)
//           .mockImplementation((header: string) => {
//             if (header === 'User-Agent') return userAgent;
//             return undefined;
//           });

//         const result = await fingerprintService.generateFingerprint(mockRequest as Request);
//         expect(result.platform).toBe(expected);
//       });
//     });
//   });

  describe('getRelevantHeaders (private method testing through generateFingerprint)', () => {
    it('should extract relevant headers for fingerprinting', async () => {
      const mockHeaders: Record<string, string> = {
        'accept': 'text/html,application/xhtml+xml',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'Mozilla/5.0',
        'dnt': '1',
        'sec-ch-ua': '"Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'irrelevant-header': 'should-be-ignored'
      };

      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => mockHeaders[header.toLowerCase()]);

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);

      expect(result.headers).toEqual({
        'accept': 'text/html,application/xhtml+xml',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'Mozilla/5.0',
        'dnt': '1',
        'sec-ch-ua': '"Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      });

      expect(result.headers).not.toHaveProperty('irrelevant-header');
    });

    it('should exclude headers that are not present', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'user-agent') return 'Mozilla/5.0';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);

      expect(result.headers).toEqual({
        'user-agent': 'Mozilla/5.0'
      });
    });
  });

//   describe('getBrowserInfo', () => {
//     const browserTestCases = [
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//         expected: { name: 'Chrome', version: '120.0.0.0' }
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
//         expected: { name: 'Firefox', version: '119.0' }
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
//         expected: { name: 'Safari', version: '17.1' }
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
//         expected: { name: 'Edge', version: '120.0.2210.91' }
//       },
//       {
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
//         expected: { name: 'Opera', version: '106.0.0.0' }
//       },
//       {
//         userAgent: 'Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 10.0; WOW64; Trident/7.0)',
//         expected: { name: 'Internet Explorer', version: '11.0' }
//       },
//       {
//         userAgent: 'Unknown/1.0 Browser',
//         expected: { name: 'Unknown', version: 'Unknown' }
//       }
//     ];

//     browserTestCases.forEach(({ userAgent, expected }) => {
//       it(`should identify ${expected.name} ${expected.version} from user agent`, () => {
//         const result = fingerprintService.getBrowserInfo(userAgent);
//         expect(result).toEqual(expected);
//       });
//     });
//   });

  describe('IP validation (private method)', () => {
    // We'll test this indirectly through the IP extraction logic
    it('should accept valid IPv4 addresses', async () => {
      const validIPs = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '203.0.113.1'];
      
      for (const ip of validIPs) {
        (mockRequest.get as jest.Mock)
          .mockImplementation((header: string) => {
            if (header === 'X-Real-IP') return ip;
            return undefined;
          });

        const result = await fingerprintService.generateFingerprint(mockRequest as Request);
        expect(result.ip).toBe(ip);
      }
    });

    it('should accept IPv6 localhost', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'X-Real-IP') return '::1';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('::1');
    });

    it('should accept IPv4-mapped IPv6 addresses', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'X-Real-IP') return '::ffff:192.168.1.1';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('::ffff:192.168.1.1');
    });

    it('should reject invalid IP formats and fallback', async () => {
      (mockRequest.get as jest.Mock)
        .mockImplementation((header: string) => {
          if (header === 'X-Real-IP') return 'not-an-ip';
          return undefined;
        });

      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      expect(result.ip).toBe('192.168.1.1'); // Fallback to connection
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null request gracefully', async () => {
      const nullRequest = {} as Request;
      nullRequest.get = jest.fn().mockReturnValue(undefined);
      nullRequest.connection = undefined as any;
      nullRequest.socket = undefined as any;

      const result = await fingerprintService.generateFingerprint(nullRequest);

      expect(result).toMatchObject({
        userAgent: '',
        language: '',
        ip: 'unknown',
        headers: {},
        connection: {
          remoteAddress: 'unknown',
          remotePort: 0
        },
        platform: 'Unknown',
        timestamp: expect.any(String)
      });
    });

    it('should handle request with only partial data', async () => {
      const partialRequest = {
        get: jest.fn().mockImplementation((header: string) => {
          if (header === 'User-Agent') return 'Partial/1.0';
          return undefined;
        }),
        connection: {
          remoteAddress: '127.0.0.1'
        }
      } as any;

      const result = await fingerprintService.generateFingerprint(partialRequest);

      expect(result.userAgent).toBe('Partial/1.0');
      expect(result.ip).toBe('127.0.0.1');
      expect(result.language).toBe('');
    });

    it('should generate consistent timestamp format', async () => {
      const result = await fingerprintService.generateFingerprint(mockRequest as Request);
      
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });
});
