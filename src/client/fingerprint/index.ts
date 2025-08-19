/**
 * FPS Device Fingerprinting Client Library
 * Main coordinator that combines all fingerprinting modules
 */

import { FingerprintData } from './types';
import { HardwareFingerprint } from './modules/hardware';
import { GraphicsFingerprint } from './modules/graphics';
import { AudioFingerprint } from './modules/audio';
import { BrowserFingerprint } from './modules/browser';
import { PreferencesFingerprint } from './modules/preferences';

class FPSFingerprintClass {
  public readonly version: string = '1.9.0';

  /**
   * Collect comprehensive device fingerprint
   */
  public collect(callback?: (fingerprint: FingerprintData) => void): FingerprintData {
    // Collect data from all modules
    const hardware = HardwareFingerprint.collect();
    const graphics = GraphicsFingerprint.collect();
    const audio = AudioFingerprint.collect();
    const browser = BrowserFingerprint.collect();
    const preferences = PreferencesFingerprint.collect();

    const fingerprint: FingerprintData = {
      // Browser data
      ...browser,
      
      // Hardware data
      ...hardware,
      
      // Graphics data  
      ...graphics,
      
      // Audio data
      ...audio,
      
      // Preferences data
      ...preferences,
      
      // Timestamp
      timestamp: new Date().toISOString()
    };
    
    if (callback && typeof callback === 'function') {
      callback(fingerprint);
    }
    
    return fingerprint;
  }

  /**
   * Generate hash from fingerprint data
   */
  public generateHash(fingerprint?: FingerprintData): string {
    const data = fingerprint || this.collect();
    
    // Create a string representation of key fingerprint attributes
    const hashString = [
      data.userAgent,
      data.platform,
      data.language,
      data.screen ? `${data.screen.width}x${data.screen.height}x${data.screen.colorDepth}` : '',
      data.timezone,
      data.hardwareConcurrency,
      data.deviceMemory,
      data.webgl ? `${data.webgl.vendor}-${data.webgl.renderer}` : '',
      data.canvas ? data.canvas.substring(0, 50) : '',
      data.audio ? data.audio.substring(0, 30) : '',
      data.fonts ? data.fonts.slice(0, 10).join(',') : ''
    ].join('|');
    
    // Simple hash function (djb2)
    let hash = 5381;
    for (let i = 0; i < hashString.length; i++) {
      hash = ((hash << 5) + hash) + hashString.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Generate hashes for each fingerprint group
   */
  public generateGroupHashes(fingerprint?: FingerprintData): {
    hardware: string;
    graphics: string;
    audio: string;
    browser: string;
    preferences: string;
    combined: string;
  } {
    const data = fingerprint || this.collect();
    
    // Hardware hash
    const hardwareString = [
      data.deviceMemory,
      data.hardwareConcurrency,
      data.maxTouchPoints,
      data.colorDepth,
      data.pixelDepth,
      data.screen ? `${data.screen.width}x${data.screen.height}x${data.screen.availWidth}x${data.screen.availHeight}` : '',
      data.cpuClass,
      data.oscpu,
      data.buildID
    ].join('|');
    
    // Graphics hash
    const graphicsString = [
      data.webgl ? `${data.webgl.vendor}-${data.webgl.renderer}-${data.webgl.version}` : '',
      data.webgl && data.webgl.unmaskedVendor ? `${data.webgl.unmaskedVendor}-${data.webgl.unmaskedRenderer}` : '',
      data.canvas ? data.canvas.substring(0, 100) : '',
      data.fonts ? data.fonts.slice(0, 15).join(',') : ''
    ].join('|');
    
    // Audio hash
    const audioString = [
      data.audio || ''
    ].join('|');
    
    // Browser hash
    const browserString = [
      data.userAgent,
      data.platform,
      data.cookieEnabled,
      data.doNotTrack,
      data.onLine,
      data.plugins ? data.plugins.map(p => `${p.name}-${p.filename}`).slice(0, 10).join(',') : '',
      data.localStorage,
      data.sessionStorage,
      data.indexedDB,
      data.webSQL
    ].join('|');
    
    // Preferences hash
    const preferencesString = [
      data.language,
      data.languages ? data.languages.join(',') : '',
      data.timezone,
      data.timezoneOffset,
      data.clientHints ? JSON.stringify(data.clientHints) : ''
    ].join('|');
    
    // Combined hash (all groups)
    const combinedString = [
      hardwareString,
      graphicsString,
      audioString,
      browserString,
      preferencesString
    ].join('||');
    
    return {
      hardware: this.hashString(hardwareString),
      graphics: this.hashString(graphicsString),
      audio: this.hashString(audioString),
      browser: this.hashString(browserString),
      preferences: this.hashString(preferencesString),
      combined: this.hashString(combinedString)
    };
  }

  /**
   * Internal hash function (DJB2)
   */
  private hashString(input: string): string {
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) + hash) + input.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Send fingerprint to server
   */
  public sendToServer(
    endpoint: string = '/api/fingerprint',
    fingerprint?: FingerprintData,
    callback?: (error: Error | null, response?: any) => void
  ): void {
    const data = {
      fingerprint: fingerprint || this.collect(),
      timestamp: new Date().toISOString()
    };
    
    if (typeof fetch !== 'undefined') {
      // Modern browsers
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (callback && typeof callback === 'function') {
          callback(null, result);
        }
      })
      .catch(error => {
        if (callback && typeof callback === 'function') {
          callback(error, null);
        }
      });
    } else {
      // Fallback for older browsers
      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              if (callback && typeof callback === 'function') {
                callback(null, result);
              }
            } catch (e) {
              if (callback && typeof callback === 'function') {
                callback(e as Error, null);
              }
            }
          } else {
            if (callback && typeof callback === 'function') {
              callback(new Error('HTTP ' + xhr.status), null);
            }
          }
        }
      };
      
      xhr.send(JSON.stringify(data));
    }
  }
}

// Initialize and expose globally
const fpsFingerprint = new FPSFingerprintClass();

// Export for different environments
if (typeof window !== 'undefined') {
  window.FPSFingerprint = fpsFingerprint;
  
  // Auto-initialize if requested
  if (window.FPSAutoCollect) {
    document.addEventListener('DOMContentLoaded', function() {
      fpsFingerprint.collect(function(fingerprint) {
        console.log('FPS Fingerprint collected:', fingerprint);
        
        if (window.FPSOnCollected && typeof window.FPSOnCollected === 'function') {
          window.FPSOnCollected(fingerprint);
        }
      });
    });
  }
}

export default fpsFingerprint;
