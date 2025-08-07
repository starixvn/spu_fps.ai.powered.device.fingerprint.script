/**
 * Preferences Fingerprinting Module
 * Collects language, timezone, and client preferences
 */

import { ClientHints } from './types';

export class PreferencesFingerprint {
  
  /**
   * Get user preferences data
   */
  public static collect(): {
    language: string;
    languages: string[];
    timezone: string;
    timezoneOffset: number;
    clientHints: ClientHints | null;
  } {
    return {
      language: navigator.language,
      languages: Array.from(navigator.languages || [navigator.language]),
      timezone: this.getTimezone(),
      timezoneOffset: new Date().getTimezoneOffset(),
      clientHints: this.getClientHints()
    };
  }

  /**
   * Get timezone information
   */
  private static getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Get client hints (modern browsers)
   */
  private static getClientHints(): ClientHints | null {
    const hints: ClientHints = {};
    
    if (navigator.userAgentData) {
      hints.brands = navigator.userAgentData.brands;
      hints.mobile = navigator.userAgentData.mobile;
      hints.platform = navigator.userAgentData.platform;
    }
    
    return Object.keys(hints).length > 0 ? hints : null;
  }
}
