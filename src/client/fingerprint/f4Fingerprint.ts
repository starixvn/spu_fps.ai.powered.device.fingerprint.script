/// <reference lib="dom" />

import {
  F4Data,
} from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { AbstractFingerprint, FingerprintResult } from "./abstract/abstractFingerprint";

export class F4Fingerprint extends AbstractFingerprint {
  private static readonly audioAliases = {
    audio: 'aud',
    audioBaseLatency: 'abl',
  };

  private static readonly browserAliases = {
    browserName: 'brn',
    osName: 'osn',
    userAgent: 'uag',
    vendor: 'vdr',
    vendorFlavors: 'vfl',
    plugins: 'plg',
    pdfViewerEnabled: 'pve',
  };

  private static readonly hardwareAliases = {
    platform:            'plf',
    cpuClass:            'ccl',
    architecture:        'arc',
    oscpu:               'osc',
    hardwareConcurrency: 'hwc',
    deviceMemory:        'dvm',
  };

  private static readonly preferencesAliases = {
    languages: 'lng',
    timezone: 'tze',
    touchSupport: 'tsp',
    sessionStorage: 'ssg',
    openDatabase: 'odb',
    localStorage: 'lst',
    indexedDB: 'idb',
    cookiesEnabled: 'cke',
  };
  
  protected async collectData(): Promise<F4Data> {
    const [audio, browser, hardware, preferences] = await Promise.all([
      AudioFingerprint.collect(),
      BrowserFingerprint.collect(),
      HardwareFingerprint.collect(),
      PreferencesFingerprint.collect(),
    ]);

    return {
      audio,
      browser,
      hardware,
      preferences,
    };
  }

  protected extractFlatAttributes(data: F4Data): Record<string, any> {
    return {
      ...data.audio,
      ...data.browser,
      ...data.hardware,
      ...data.preferences,
    };
  }

  protected extractAttributes(data: F4Data): Record<string, any> {
    return {
      hardware: this.mapAttributes(F4Fingerprint.hardwareAliases, data.hardware),
      audio: this.mapAttributes(F4Fingerprint.audioAliases, data.audio),
      browser: this.mapAttributes(F4Fingerprint.browserAliases, data.browser),
      preferences: this.mapAttributes(F4Fingerprint.preferencesAliases, data.preferences),
    };
  }

  public async start(callback:Function): Promise<Record<string, any>> {
    return this.process().then((result: FingerprintResult) => {
      callback(result);
      return result.attributes;
    });
  }

}
