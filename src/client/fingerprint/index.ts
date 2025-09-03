/// <reference lib="dom" />

import { 
  AudioGroupInfo, 
  BrowserGroupInfo, 
  HardwareGroupInfo, 
  PreferencesGroupInfo, 
  GraphicsGroupInfo, 
  CollectedDeviceInfo
} from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { WebRTCFingerprint } from "./modules/webrtc/index";
import { TaggingClass } from "../tagging/index";
import { MurmurHash128, Base64Encoder } from "./utils/hash";
import { DOMUtils } from "./dom";
import { PacketTransformer } from "../tagging/utils/hash";

const CONFIG = {
  ENCODING_KEY: "__ENCODE_KEY__",
  GATEWAY_URL: "__GATEWAY_URL__",
  ENDPOINTS: {
    F4: "/CheckFP4",
    F5: "/CheckFP5"
  },
  FIELD_NAMES: {
    DEVICE_INFO: "__di"
  }
}

class FingerprintClass {
  public readonly version: string = "1.9.0";

  private async collectWebRTC(): Promise<any> {
    try {
      return await WebRTCFingerprint.collect();
    } catch (error) {
      // console.error('Failed to collect WebRTC:', error);
      return { webrtc: {} };
    }
  }

  private generateGroupHashes(fingerprint: any): string {
    try {
      return MurmurHash128.hash128(JSON.stringify(fingerprint));
    } catch (error) {
      // console.log('error', error);
      return "";
    }
  }

  private async collectF4(): Promise<{
    audio: AudioGroupInfo;
    browser: BrowserGroupInfo;
    hardware: HardwareGroupInfo;
    preferences: PreferencesGroupInfo;
  }> {

    const [audio, browser, hardware, preferences] = await Promise.all([
      AudioFingerprint.collect(),
      BrowserFingerprint.collect(),
      HardwareFingerprint.collect(),
      PreferencesFingerprint.collect()
    ]);

    return {
      audio,
      browser,
      hardware,
      preferences,
    };
  }

  private async collectF5(): Promise<{
    graphics: GraphicsGroupInfo;
  }> {
    const graphics = await GraphicsFingerprint.collect();
    return {
      graphics,
    };
  }

  private async sendToServer(endpoint: string, payload: any): Promise<boolean> {
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

        let success = navigator.sendBeacon(endpoint, blob);
        if (success) {
          return true;
        }
      } 

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      // console.error('Failed to send data to server:', error);
      return false;
    }
  }

  private encodeData(obj: any): string {
    return Base64Encoder.encodeBase64(JSON.stringify(obj), CONFIG.ENCODING_KEY);
  }

  private buildPayload(type: 'F4' | 'F5', sessionKey: string, fingerprintData: any, hashed: string): any {
    const fingerprint: any = {};

    if (type === 'F4') {
      fingerprint.audio = this.encodeData(fingerprintData.audio);
      fingerprint.browser = this.encodeData(fingerprintData.browser);
      fingerprint.hardware = this.encodeData(fingerprintData.hardware);
      fingerprint.preferences = this.encodeData(fingerprintData.preferences);
    }
  
    if (type === 'F5') {
      fingerprint.graphics = this.encodeData(fingerprintData.graphics);
    }
  
    return { sessionKey, fingerprint, hashed };
  }

  private injectValueIntoHiddenField(fieldName: string, value: string): void {
    try {
      DOMUtils.injectValueIntoHiddenField(fieldName, value);
    } catch (error) {
      // console.error(`Failed to inject value into field ${fieldName}:`, error);
    }
  }

  private async processF4Data(sessionKey: string, collectedDeviceInfo: CollectedDeviceInfo): Promise<any> {
    try {
      const f4Data = await this.collectF4();
      const attributes = {
        ...f4Data.audio,
        ...f4Data.browser,
        ...f4Data.hardware,
        ...f4Data.preferences
      }
      collectedDeviceInfo.f4Hashed = this.generateGroupHashes(attributes);
  
      const f4Payload = this.buildPayload('F4', sessionKey, f4Data, collectedDeviceInfo.f4Hashed);
      
      await this.sendToServer(`${CONFIG.GATEWAY_URL}${CONFIG.ENDPOINTS.F4}`, f4Payload);
  
      this.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, this.encodeData(collectedDeviceInfo));
      
      return attributes;
    } catch (error) {
      // console.error('F4 data collection failed:', error);
    }
  }

  private async processF5Data(sessionKey: string, collectedDeviceInfo: CollectedDeviceInfo, f4Attributes: any): Promise<void> {
    try {
      const f5Data = await this.collectF5();

      const attributes = {
        ...f4Attributes, 
        ...f5Data.graphics               
      };

      collectedDeviceInfo.f5Hashed = this.generateGroupHashes(attributes);

      const f5Payload = this.buildPayload('F5', sessionKey, f5Data, collectedDeviceInfo.f5Hashed);
      await this.sendToServer(`${CONFIG.GATEWAY_URL}${CONFIG.ENDPOINTS.F5}`, f5Payload);

      this.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, this.encodeData(collectedDeviceInfo));

    } catch (error) {
      // console.error('F5 data collection failed:', error);
    }
  }

  public async start(): Promise<void> {
    try {
      const tagging = new TaggingClass();
      const sessionKey = await tagging.getStorage();

      const collectedDeviceInfo: CollectedDeviceInfo = { sessionKey, deviceID: PacketTransformer.unwrapMessage(sessionKey) };

      const f4Attributes = await this.processF4Data(sessionKey, collectedDeviceInfo);
      await this.processF5Data(sessionKey, collectedDeviceInfo, f4Attributes);

      const webrtc = await this.collectWebRTC();
      collectedDeviceInfo.webrtc = webrtc;

      this.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, this.encodeData(collectedDeviceInfo));

    } catch (error) {
      // console.error('Fingerprint collection failed:', error);
    }
  }
}

const fingerprint = new FingerprintClass();

if (typeof window !== "undefined") {
  (async () => {
    try {
      (window as any).fingerprint = await fingerprint.start();
    } catch (error) {
      console.error('Failed to initialize fingerprint:', error);
    }
  })();
}

export default fingerprint;
