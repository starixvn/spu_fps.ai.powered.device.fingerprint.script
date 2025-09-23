/// <reference lib="dom" />

import {
  F4Data,
  AudioGroupInfo,
  BrowserGroupInfo,
  HardwareGroupInfo,
  PreferencesGroupInfo,
} from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { AbstractFingerprint, InjectValueCallback } from "./abstract/abstractFingerprint";
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

  private extractAudioAttributes(data: AudioGroupInfo): Record<string, AudioGroupInfo[keyof AudioGroupInfo]> {
    return {
      [F4Fingerprint.audioAliases.audio]: data.audio,
      [F4Fingerprint.audioAliases.audioBaseLatency]: data.audioBaseLatency,
    };
  }

  private extractBrowserAttributes(data: BrowserGroupInfo): Record<string, BrowserGroupInfo[keyof BrowserGroupInfo]> {
    return {
      [F4Fingerprint.browserAliases.browserName]: data.browserName,
      [F4Fingerprint.browserAliases.osName]: data.osName,
      [F4Fingerprint.browserAliases.userAgent]: data.userAgent,
      [F4Fingerprint.browserAliases.vendor]: data.vendor,
      [F4Fingerprint.browserAliases.vendorFlavors]: data.vendorFlavors,
      [F4Fingerprint.browserAliases.plugins]: data.plugins,
      [F4Fingerprint.browserAliases.pdfViewerEnabled]: data.pdfViewerEnabled,
    };
  }

  private extractHardwareAttributes(data: HardwareGroupInfo): Record<string, HardwareGroupInfo[keyof HardwareGroupInfo]> {
    return {
      [F4Fingerprint.hardwareAliases.platform]:            data.platform,
      [F4Fingerprint.hardwareAliases.cpuClass]:            data.cpuClass,
      [F4Fingerprint.hardwareAliases.architecture]:        data.architecture,
      [F4Fingerprint.hardwareAliases.oscpu]:               data.oscpu,
      [F4Fingerprint.hardwareAliases.hardwareConcurrency]: data.hardwareConcurrency,
      [F4Fingerprint.hardwareAliases.deviceMemory]:        data.deviceMemory,
    };
  }

  private extractPreferencesAttributes(data: PreferencesGroupInfo): Record<string, PreferencesGroupInfo[keyof PreferencesGroupInfo]> {
    return {
      [F4Fingerprint.preferencesAliases.languages]: data.languages,
      [F4Fingerprint.preferencesAliases.timezone]: data.timezone,
      [F4Fingerprint.preferencesAliases.touchSupport]: data.touchSupport,
      [F4Fingerprint.preferencesAliases.sessionStorage]: data.sessionStorage,
      [F4Fingerprint.preferencesAliases.openDatabase]: data.openDatabase,
      [F4Fingerprint.preferencesAliases.localStorage]: data.localStorage,
      [F4Fingerprint.preferencesAliases.indexedDB]: data.indexedDB,
      [F4Fingerprint.preferencesAliases.cookiesEnabled]: data.cookiesEnabled,
    };
  }

  protected extractAttributes(data: F4Data): Record<string, any> {
    return {
      ...this.extractHardwareAttributes(data.hardware),
      ...this.extractAudioAttributes(data.audio),
      ...this.extractBrowserAttributes(data.browser),
      ...this.extractPreferencesAttributes(data.preferences),
    };
  }

  protected buildPayload(
    sessionKey: string,
    fingerprintData: F4Data,
  ): any {
    const aliasedAudio = this.extractAudioAttributes(fingerprintData.audio);
    const aliasedBrowser = this.extractBrowserAttributes(fingerprintData.browser);
    const aliasedHardware = this.extractHardwareAttributes(fingerprintData.hardware);
    const aliasedPreferences = this.extractPreferencesAttributes(fingerprintData.preferences);

    const serverPayload = {
      sk: sessionKey, 
      fp: {
        [this.f4Directory.audio]: JSON.stringify(aliasedAudio), 
        [this.f4Directory.browser]: JSON.stringify(aliasedBrowser), 
        [this.f4Directory.hardware]: JSON.stringify(aliasedHardware), 
        [this.f4Directory.preferences]: JSON.stringify(aliasedPreferences)
      }
    };

    const payload = this.encodeData(serverPayload);

    return payload;
  }

  public async processF4Data(
    sessionKey: string,
    callback: InjectValueCallback
  ): Promise<Record<string, any>> {
    const result = await this.process(sessionKey, callback);

    if(window !== undefined) {
      (window as any).f4Attributes = result.attributes;
    }

    return result.attributes;
  }

}
