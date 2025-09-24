/// <reference lib="dom" />

import {
  F4Data,
} from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { AbstractFingerprint } from "./abstract/abstractFingerprint";
import { CONFIG, FingerprintStep } from "../index";

export class F4Fingerprint extends AbstractFingerprint {
  private readonly f4Directory = {
    audio: "au",
    browser: "br",
    hardware: "hw",
    preferences: "pf",
  };

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
  
  protected readonly step: FingerprintStep = "F4";
  protected readonly endpoint: string = CONFIG.ENDPOINTS.F4;

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

  protected buildPayload(
    sessionKey: string,
    fingerprintData: Record<string, any>,
  ): any {

    const serverPayload = {
      sk: sessionKey, 
      fp: {
        [this.f4Directory.audio]: JSON.stringify(fingerprintData.audio), 
        [this.f4Directory.browser]: JSON.stringify(fingerprintData.browser), 
        [this.f4Directory.hardware]: JSON.stringify(fingerprintData.hardware), 
        [this.f4Directory.preferences]: JSON.stringify(fingerprintData.preferences)
      }
    };

    const payload = this.encodeData(serverPayload);

    return payload;
  }

  public async start(sessionKey: string, callback:Function): Promise<Record<string, any>> {
    const result = await this.process();

    callback(result);

    const payload = this.buildPayload(sessionKey, result.attributes);

    await this.sendToServer(this.endpoint, payload);

    if(window !== undefined) {
      (window as any).f4Attributes = result.attributes;
    }

    return result.attributes;
  }

}
