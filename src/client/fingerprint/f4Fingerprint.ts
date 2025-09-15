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
    const audioAliases = {
      audio: 'aud',
      audioBaseLatency: 'abl',
    } as const;

    return {
      [audioAliases.audio]: data.audio.audio,
      [audioAliases.audioBaseLatency]: data.audio.audioBaseLatency,
    };
  }

  private extractBrowserAttributes(data: F4Data): Record<string, BrowserGroupInfo[keyof BrowserGroupInfo]> {
    const browserAliases = {
      browserName: 'brn',
      osName: 'osn',
      userAgent: 'uag',
      vendor: 'vdr',
      vendorFlavors: 'vfl',
      plugins: 'plg',
      pdfViewerEnabled: 'pve',
    } as const;

    return {
      [browserAliases.browserName]: data.browser.browserName,
      [browserAliases.osName]: data.browser.osName,
      [browserAliases.userAgent]: data.browser.userAgent,
      [browserAliases.vendor]: data.browser.vendor,
      [browserAliases.vendorFlavors]: data.browser.vendorFlavors,
      [browserAliases.plugins]: data.browser.plugins,
      [browserAliases.pdfViewerEnabled]: data.browser.pdfViewerEnabled,
    };
  }

  private extractHardwareAttributes(data: F4Data): Record<string, HardwareGroupInfo[keyof HardwareGroupInfo]> {
    const hardwareAliases = {
      platform:            'plf',
      cpuClass:            'ccl',
      architecture:        'arc',
      oscpu:               'osc',
      hardwareConcurrency: 'hwc',
      deviceMemory:        'dvm',
    } as const;

    return {
      [hardwareAliases.platform]:            data.hardware.platform,
      [hardwareAliases.cpuClass]:            data.hardware.cpuClass,
      [hardwareAliases.architecture]:        data.hardware.architecture,
      [hardwareAliases.oscpu]:               data.hardware.oscpu,
      [hardwareAliases.hardwareConcurrency]: data.hardware.hardwareConcurrency,
      [hardwareAliases.deviceMemory]:        data.hardware.deviceMemory,
    };
  }

  private extractPreferencesAttributes(data: F4Data): Record<string, PreferencesGroupInfo[keyof PreferencesGroupInfo]> {
    const preferencesAliases = {
      languages: 'lng',
      timezone: 'tze',
      touchSupport: 'tsp',
      sessionStorage: 'ssg',
      openDatabase: 'odb',
      localStorage: 'lst',
      indexedDB: 'idb',
      cookiesEnabled: 'cke',
    } as const;

    return {
      [preferencesAliases.languages]: data.preferences.languages,
      [preferencesAliases.timezone]: data.preferences.timezone,
      [preferencesAliases.touchSupport]: data.preferences.touchSupport,
      [preferencesAliases.sessionStorage]: data.preferences.sessionStorage,
      [preferencesAliases.openDatabase]: data.preferences.openDatabase,
      [preferencesAliases.localStorage]: data.preferences.localStorage,
      [preferencesAliases.indexedDB]: data.preferences.indexedDB,
      [preferencesAliases.cookiesEnabled]: data.preferences.cookiesEnabled,
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
