/**
 * Hardware Fingerprinting Module
 * Collects CPU, memory, and device capabilities
 */

import { ScreenInfo } from './types';

export class HardwareFingerprint {
  
  /**
   * Get comprehensive hardware information
   */
  public static collect(): {
    deviceMemory: number;
    hardwareConcurrency: number;
    maxTouchPoints: number;
    colorDepth: number;
    pixelDepth: number;
    screen: ScreenInfo;
    cpuClass: string;
    oscpu: string;
    buildID: string;
  } {
    return {
      deviceMemory: navigator.deviceMemory || -1,
      hardwareConcurrency: navigator.hardwareConcurrency || -1,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      screen: this.getScreenInfo(),
      cpuClass: navigator.cpuClass || 'unknown',
      oscpu: navigator.oscpu || 'unknown',
      buildID: navigator.buildID || 'unknown'
    };
  }

  /**
   * Get detailed screen information
   */
  private static getScreenInfo(): ScreenInfo {
    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    };
  }
}
