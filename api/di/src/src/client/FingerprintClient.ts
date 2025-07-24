/**
 * FPS Device Fingerprinting Client Library
 * Main coordinator that combines all fingerprinting modules
 */

import { FingerprintData } from './types';
import { HardwareFingerprint } from './hardware';
import { GraphicsFingerprint } from './graphics';
import { AudioFingerprint } from './audio';
import { BrowserFingerprint } from './browser';
import { PreferencesFingerprint } from './preferences';

class FPSFingerprintClass {
  public readonly version: string = '1.0.0';

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
