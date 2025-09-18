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
  } as const;

  private static readonly browserAliases = {
    browserName: 'brn',
    osName: 'osn',
    userAgent: 'uag',
    vendor: 'vdr',
    vendorFlavors: 'vfl',
    plugins: 'plg',
    pdfViewerEnabled: 'pve',
  } as const;

  private static readonly hardwareAliases = {
    platform:            'plf',
    cpuClass:            'ccl',
    architecture:        'arc',
    oscpu:               'osc',
    hardwareConcurrency: 'hwc',
    deviceMemory:        'dvm',
  } as const;

  private static readonly preferencesAliases = {
    languages: 'lng',
    timezone: 'tze',
    touchSupport: 'tsp',
    sessionStorage: 'ssg',
    openDatabase: 'odb',
    localStorage: 'lst',
    indexedDB: 'idb',
    cookiesEnabled: 'cke',
  } as const;
  
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

  private extractAudioAttributes(data: F4Data): Record<string, AudioGroupInfo[keyof AudioGroupInfo]> {
    return {
      [F4Fingerprint.audioAliases.audio]: data.audio.audio,
      [F4Fingerprint.audioAliases.audioBaseLatency]: data.audio.audioBaseLatency,
    };
  }

  private extractBrowserAttributes(data: F4Data): Record<string, BrowserGroupInfo[keyof BrowserGroupInfo]> {
    return {
      [F4Fingerprint.browserAliases.browserName]: data.browser.browserName,
      [F4Fingerprint.browserAliases.osName]: data.browser.osName,
      [F4Fingerprint.browserAliases.userAgent]: data.browser.userAgent,
      [F4Fingerprint.browserAliases.vendor]: data.browser.vendor,
      [F4Fingerprint.browserAliases.vendorFlavors]: data.browser.vendorFlavors,
      [F4Fingerprint.browserAliases.plugins]: data.browser.plugins,
      [F4Fingerprint.browserAliases.pdfViewerEnabled]: data.browser.pdfViewerEnabled,
    };
  }

  private extractHardwareAttributes(data: F4Data): Record<string, HardwareGroupInfo[keyof HardwareGroupInfo]> {
    return {
      [F4Fingerprint.hardwareAliases.platform]:            data.hardware.platform,
      [F4Fingerprint.hardwareAliases.cpuClass]:            data.hardware.cpuClass,
      [F4Fingerprint.hardwareAliases.architecture]:        data.hardware.architecture,
      [F4Fingerprint.hardwareAliases.oscpu]:               data.hardware.oscpu,
      [F4Fingerprint.hardwareAliases.hardwareConcurrency]: data.hardware.hardwareConcurrency,
      [F4Fingerprint.hardwareAliases.deviceMemory]:        data.hardware.deviceMemory,
    };
  }

  private extractPreferencesAttributes(data: F4Data): Record<string, PreferencesGroupInfo[keyof PreferencesGroupInfo]> {
    return {
      [F4Fingerprint.preferencesAliases.languages]: data.preferences.languages,
      [F4Fingerprint.preferencesAliases.timezone]: data.preferences.timezone,
      [F4Fingerprint.preferencesAliases.touchSupport]: data.preferences.touchSupport,
      [F4Fingerprint.preferencesAliases.sessionStorage]: data.preferences.sessionStorage,
      [F4Fingerprint.preferencesAliases.openDatabase]: data.preferences.openDatabase,
      [F4Fingerprint.preferencesAliases.localStorage]: data.preferences.localStorage,
      [F4Fingerprint.preferencesAliases.indexedDB]: data.preferences.indexedDB,
      [F4Fingerprint.preferencesAliases.cookiesEnabled]: data.preferences.cookiesEnabled,
    };
  }

  protected extractAttributes(data: F4Data): Record<string, any> {
    return {
      ...this.extractHardwareAttributes(data),
      ...this.extractAudioAttributes(data),
      ...this.extractBrowserAttributes(data),
      ...this.extractPreferencesAttributes(data),
    };
  }

  protected buildPayload(
    sessionKey: string,
    fingerprintData: F4Data,
  ): any {
    const aliasedAudio = this.extractAudioAttributes(fingerprintData);
    const aliasedBrowser = this.extractBrowserAttributes(fingerprintData);
    const aliasedHardware = this.extractHardwareAttributes(fingerprintData);
    const aliasedPreferences = this.extractPreferencesAttributes(fingerprintData);

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
