import { Request } from 'express';

interface ServerFingerprintData {
  userAgent: string;
  language: string;
  ip: string;
  headers: Record<string, string>;
  connection: {
    remoteAddress: string;
    remotePort: number;
  };
  platform: string;
  timestamp: string;
}

export class FingerprintService {
  /**
   * Generate server-side fingerprint from HTTP request
   */
  async generateFingerprint(req: Request): Promise<ServerFingerprintData> {
    const userAgent = req.get('User-Agent') || '';
    const acceptLanguage = req.get('Accept-Language') || '';
    const ip = this.getClientIP(req);
    
    // Extract server-side fingerprint data from request
    const fingerprint: ServerFingerprintData = {
      userAgent,
      language: acceptLanguage,
      ip,
      headers: this.getRelevantHeaders(req),
      connection: {
        remoteAddress: req.connection?.remoteAddress || 'unknown',
        remotePort: req.connection?.remotePort || 0
      },
      platform: this.extractPlatform(userAgent),
      timestamp: new Date().toISOString()
    };
    
    return fingerprint;
  }
  
  /**
   * Combine client and server fingerprints
   */
  combineFingerprints(clientFingerprint: any, serverFingerprint: ServerFingerprintData) {
    return {
      client: clientFingerprint,
      server: serverFingerprint,
      combined: true,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Extract client IP address with priority order
   */
  private getClientIP(req: Request): string {
    // Check various headers that might contain the real IP
    const possibleHeaders = [
      'CF-Connecting-IP',     // Cloudflare
      'True-Client-IP',       // Cloudflare Enterprise
      'X-Real-IP',           // Nginx
      'X-Forwarded-For',     // Standard
      'X-Client-IP',         // Apache
      'X-Cluster-Client-IP', // Cluster
      'Forwarded-For',
      'Forwarded'
    ];
    
    for (const header of possibleHeaders) {
      const value = req.get(header);
      if (value) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        const ip = value.split(',')[0].trim();
        if (this.isValidIP(ip)) {
          return ip;
        }
      }
    }
    
    // Fallback to connection remote address
    return req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           'unknown';
  }
  
  /**
   * Validate IP address format
   */
  private isValidIP(ip: string): boolean {
    // Basic IP validation (IPv4 and IPv6)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === '::1' || ip.startsWith('::ffff:');
  }
  
  /**
   * Extract platform from user agent
   */
  private extractPlatform(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('windows nt 10.0')) return 'Windows 10';
    if (ua.includes('windows nt 6.3')) return 'Windows 8.1';
    if (ua.includes('windows nt 6.2')) return 'Windows 8';
    if (ua.includes('windows nt 6.1')) return 'Windows 7';
    if (ua.includes('windows')) return 'Windows';
    
    if (ua.includes('mac os x')) {
      const match = ua.match(/mac os x (\d+[._]\d+)/);
      return match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
    }
    if (ua.includes('macintosh')) return 'macOS';
    
    if (ua.includes('android')) {
      const match = ua.match(/android (\d+(?:\.\d+)?)/);
      return match ? `Android ${match[1]}` : 'Android';
    }
    
    if (ua.includes('iphone') || ua.includes('ipad')) {
      const match = ua.match(/os (\d+[._]\d+)/);
      return match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
    }
    
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('ubuntu')) return 'Ubuntu';
    if (ua.includes('debian')) return 'Debian';
    if (ua.includes('fedora')) return 'Fedora';
    if (ua.includes('centos')) return 'CentOS';
    
    return 'Unknown';
  }
  
  /**
   * Get relevant headers for fingerprinting
   */
  private getRelevantHeaders(req: Request): Record<string, string> {
    const relevantHeaders = [
      'accept',
      'accept-encoding',
      'accept-language',
      'user-agent',
      'dnt',
      'connection',
      'upgrade-insecure-requests',
      'sec-fetch-site',
      'sec-fetch-mode',
      'sec-fetch-user',
      'sec-fetch-dest',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
      'sec-ch-ua-platform-version',
      'sec-ch-ua-arch',
      'sec-ch-ua-model',
      'sec-ch-ua-bitness'
    ];
    
    const headers: Record<string, string> = {};
    relevantHeaders.forEach(header => {
      const value = req.get(header);
      if (value) {
        headers[header] = value;
      }
    });
    
    return headers;
  }
  
  /**
   * Get browser information from User-Agent
   */
  getBrowserInfo(userAgent: string) {
    const browsers = [
      { name: 'Chrome', regex: /Chrome\/(\d+(?:\.\d+)?)/ },
      { name: 'Firefox', regex: /Firefox\/(\d+(?:\.\d+)?)/ },
      { name: 'Safari', regex: /Version\/(\d+(?:\.\d+)?).*Safari/ },
      { name: 'Edge', regex: /Edg\/(\d+(?:\.\d+)?)/ },
      { name: 'Opera', regex: /OPR\/(\d+(?:\.\d+)?)/ },
      { name: 'Internet Explorer', regex: /MSIE (\d+(?:\.\d+)?)/ }
    ];
    
    for (const browser of browsers) {
      const match = userAgent.match(browser.regex);
      if (match) {
        return {
          name: browser.name,
          version: match[1]
        };
      }
    }
    
    return {
      name: 'Unknown',
      version: 'Unknown'
    };
  }
}
