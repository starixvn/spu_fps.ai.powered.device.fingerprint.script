/// <reference lib="dom" />

import { 
  WebRTCGroupResult, 
  AudioGroupResult, 
  BrowserGroupResult, 
  HardwareGroupResult, 
  PreferencesGroupResult, 
  GraphicsGroupResult, 
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

const CONFIG = {
  ENCODING_KEY: "__ENCODE_KEY__",
  GATEWAY_URL: "__GATEWAY_URL__",
  ENDPOINTS: {
    F4: "/InsertFP4",
    F5: "/InsertFP5"
  },
  TIMEOUTS: {
    DEFAULT: 5000
  },
  FIELD_NAMES: {
    DEVICE_INFO: "__di"
  }
}

class FPSFingerprintClass {
  public readonly version: string = "1.9.0";

  // // WebRTC Methods
  // public async collectIPs(timeout: number = CONFIG.TIMEOUTS.DEFAULT): Promise<WebRTCGroupResult> {
  //   try {
  //     return await WebRTCFingerprint.collect(timeout);
  //   } catch (error) {
  //     throw new FingerprintError(`Failed to collect IPs: ${error}`, ErrorCodes.IP_COLLECTION_FAILED);
  //   }
  // }

  // public async collectLocalIPs(timeout: number = CONFIG.TIMEOUTS.DEFAULT): Promise<string[]> {
  //   try {
  //     return await WebRTCFingerprint.getLocalIPs(timeout);
  //   } catch (error) {
  //     throw new FingerprintError(`Failed to collect local IPs: ${error}`, ErrorCodes.LOCAL_IP_COLLECTION_FAILED);
  //   }
  // }

  // public async collectPublicIPs(timeout: number = CONFIG.TIMEOUTS.DEFAULT): Promise<string[]> {
  //   try {
  //     return await WebRTCFingerprint.getPublicIPs(timeout);
  //   } catch (error) {
  //     throw new FingerprintError(`Failed to collect public IPs: ${error}`, ErrorCodes.PUBLIC_IP_COLLECTION_FAILED);
  //   }
  // }

  // public async collectRelayIPs(timeout: number = CONFIG.TIMEOUTS.DEFAULT): Promise<string[]> {
  //   try {
  //     return await WebRTCFingerprint.getRelayIPs(timeout);
  //   } catch (error) {
  //     throw new FingerprintError(`Failed to collect relay IPs: ${error}`, ErrorCodes.RELAY_IP_COLLECTION_FAILED);
  //   }
  // }

  public generateGroupHashes(fingerprint: any): string {
    try {
      return MurmurHash128.hash128(JSON.stringify(fingerprint));
    } catch (error) {
      console.log('error', error);
      return "";
      // throw new FingerprintError(`Failed to generate hash: ${error}`, ErrorCodes.HASH_GENERATION_FAILED);
    }
  }

  public async collectF4(): Promise<{
    AudioFingerprint: AudioGroupResult;
    BrowserFingerprint: BrowserGroupResult;
    HardwareFingerprint: HardwareGroupResult;
    PreferencesFingerprint: PreferencesGroupResult;
  }> {
    const [audio,browser, hardware, preferences] = await Promise.all([
      AudioFingerprint.collect(),
      BrowserFingerprint.collect(),
      HardwareFingerprint.collect(),
      PreferencesFingerprint.collect()
    ]);

    return {
      AudioFingerprint: audio,
      BrowserFingerprint: browser,
      HardwareFingerprint: hardware,
      PreferencesFingerprint: preferences,
    };
    
  }

  public async collectF5(): Promise<{
    GraphicsFingerprint: GraphicsGroupResult;
  }> {
    const graphics = await GraphicsFingerprint.collect();
    return {
      GraphicsFingerprint: graphics,
    };
  }

  public async sendToServer(endpoint: string, payload: any): Promise<boolean> {
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        return navigator.sendBeacon(endpoint, blob);
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify(payload)
        });
        return response.ok;
      }
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
      fingerprint.audio = this.encodeData(fingerprintData.AudioFingerprint);
      fingerprint.browser = this.encodeData(fingerprintData.BrowserFingerprint);
      fingerprint.hardware = this.encodeData(fingerprintData.HardwareFingerprint);
      fingerprint.preferences = this.encodeData(fingerprintData.PreferencesFingerprint);
    }
  
    if (type === 'F5') {
      fingerprint.graphics = this.encodeData(fingerprintData.GraphicsFingerprint);
    }
  
    return { sessionKey, fingerprint, hashed };
  }

  public injectValueIntoHiddenField(fieldName: string, value: string): void {
    try {
      DOMUtils.injectValueIntoHiddenField(fieldName, value);
    } catch (error) {
      // console.error(`Failed to inject value into field ${fieldName}:`, error);
    }
  }

  private async processF4Data(sessionKey: string, collectedDeviceInfo: CollectedDeviceInfo): Promise<boolean> {
    const f4Data = await this.collectF4();
    collectedDeviceInfo.f4Hashed = this.generateGroupHashes(f4Data);
    
    const f4Payload = this.buildPayload('F4', sessionKey, f4Data, collectedDeviceInfo.f4Hashed);
    const f4Result = await this.sendToServer(`${CONFIG.GATEWAY_URL}${CONFIG.ENDPOINTS.F4}`, f4Payload);

    this.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, this.encodeData(collectedDeviceInfo));
    
    return f4Result;
  }

  private async processF5Data(sessionKey: string, collectedDeviceInfo: CollectedDeviceInfo): Promise<boolean> {
    const f5Data = await this.collectF5();
    collectedDeviceInfo.f5Hashed = this.generateGroupHashes(f5Data);

    const f5Payload = this.buildPayload('F5', sessionKey, f5Data, collectedDeviceInfo.f5Hashed);
    const f5Result = await this.sendToServer(`${CONFIG.GATEWAY_URL}${CONFIG.ENDPOINTS.F5}`, f5Payload);

    this.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, this.encodeData(collectedDeviceInfo));
    
    return f5Result;
  }

  public async start(): Promise<{ f4Success: boolean; f5Success: boolean; }> {
    try {
      console.log('start');
      const tagging = new TaggingClass();

      const sessionKey = await tagging.getStorage();

      const collectedDeviceInfo: CollectedDeviceInfo = { sessionKey };
      console.log('collectedDeviceInfo', collectedDeviceInfo);
      const f4Result = await this.processF4Data(sessionKey, collectedDeviceInfo);
      console.log('f4Result', f4Result);
      
      const f5Result = await this.processF5Data(sessionKey, collectedDeviceInfo);
      console.log('f5Result', f5Result);
      return {
        f4Success: f4Result,
        f5Success: f5Result
      };
    } catch (error) {
      // console.error('Fingerprint collection failed:', error);
      return {
        f4Success: false,
        f5Success: false
      };
    }
  }
}

const fpsFingerprint = new FPSFingerprintClass();

if (typeof window !== "undefined") {
  (async () => {
    try {
      (window as any).FPSFingerprint = await fpsFingerprint.start();
    } catch (error) {
      console.error('Failed to initialize FPSFingerprint:', error);
    }
  })();
}

export default fpsFingerprint;
