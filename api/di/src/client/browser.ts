/**
 * Browser Fingerprinting Module
 * Collects browser info, plugins, and storage capabilities
 */

import { PluginInfo } from './types';

export class BrowserFingerprint {
  
  /**
   * Get browser fingerprinting data
   */
  public static collect(): {
    userAgent: string;
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: string | null;
    onLine: boolean;
    plugins: PluginInfo[];
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    webSQL: boolean;
  } {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      onLine: navigator.onLine,
      plugins: this.getPluginList(),
      localStorage: this.hasLocalStorage(),
      sessionStorage: this.hasSessionStorage(),
      indexedDB: this.hasIndexedDB(),
      webSQL: this.hasWebSQL()
    };
  }

  /**
   * Get browser plugins list
   */
  private static getPluginList(): PluginInfo[] {
    const plugins: PluginInfo[] = [];
    
    if (navigator.plugins) {
      for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push({
          name: navigator.plugins[i].name,
          description: navigator.plugins[i].description,
          filename: navigator.plugins[i].filename,
          version: (navigator.plugins[i] as any).version
        });
      }
    }
    
    return plugins;
  }

  /**
   * Check storage availability
   */
  private static hasLocalStorage(): boolean {
    try {
      const test = 'fps_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private static hasSessionStorage(): boolean {
    try {
      const test = 'fps_test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private static hasIndexedDB(): boolean {
    try {
      return !!(window as any).indexedDB;
    } catch (e) {
      return false;
    }
  }

  private static hasWebSQL(): boolean {
    try {
      return !!(window as any).openDatabase;
    } catch (e) {
      return false;
    }
  }
}
