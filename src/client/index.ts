import { DOMUtils } from "./dom";
import { CollectedDeviceInfo } from "./types";
import { Base64Encoder } from "./fingerprint/utils/hash";
import { IPClass } from "./ip";
import { PacketTransformer } from "./utils/hash";
import { SessionKeyManager } from "./sessionKey";   
import { TaggingClass } from "./tagging";
import { FingerprintResult } from "./fingerprint/abstract/abstractFingerprint";
import { FingerprintClass } from "./fingerprint";

export const CONFIG = {
    VERSION: "__VERSION__",
    ENCODING_KEY: "__ENCODE_KEY__",
    GATEWAY_URL: "__GATEWAY_URL__",
    ENDPOINTS: {
      F4: "/meta-data",
      F5: "/logs-sync"
    },
    FIELD_NAMES: {
      DEVICE_INFO: "__di"
    }
}

export type FingerprintStep = 'F4' | 'F5';
  
class ClientClass {
    private readonly directory = {
        audio: "au",
        browser: "br",
        hardware: "hw",
        preferences: "pf",
        graphics: "gp",
      };
    private readonly fingerprint: FingerprintClass;
    private readonly tagging: TaggingClass;
    private readonly ip: IPClass;

    constructor() {
        this.fingerprint = new FingerprintClass();
        this.tagging = new TaggingClass();
        this.ip = new IPClass();
    }

    private injectValueIntoHiddenField(value: string, hiddenField?: string): void {
        try {
            if(hiddenField) {
                DOMUtils.injectValueIntoHiddenField(hiddenField, value);
            } else {
                DOMUtils.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, value);
            }
        } catch (error) {
          // console.error(`Failed to inject value into field ${fieldName}:`, error);
        }
    }

    private updateDeviceInfo(deviceInfo: CollectedDeviceInfo): void {
        const finalEncodedData = Base64Encoder.encodeBase64(JSON.stringify(deviceInfo), CONFIG.ENCODING_KEY);
        this.injectValueIntoHiddenField(finalEncodedData);

        if (typeof window !== "undefined") {
            (window as any).deviceInfo = deviceInfo;
        }
    }

    private handleF4(deviceInfo: CollectedDeviceInfo, result: FingerprintResult): void {
        deviceInfo.f4 = result.hashed;
        this.updateDeviceInfo(deviceInfo);

        const payload = this.buildF4Payload(deviceInfo.sk, result.attributes);
        this.fingerprint.sendToServer(`${CONFIG.GATEWAY_URL}${CONFIG.ENDPOINTS.F4}`, payload);

        if(window !== undefined) {
            (window as any).f4Attributes = result.attributes;
        }
    }

    private handleF5(deviceInfo: CollectedDeviceInfo, result: FingerprintResult): void {
        deviceInfo.f5 = result.hashed;
        this.updateDeviceInfo(deviceInfo);

        const payload = this.buildF5Payload(deviceInfo.sk, result.attributes);
        this.fingerprint.sendToServer(`${CONFIG.GATEWAY_URL}${CONFIG.ENDPOINTS.F5}`, payload);

        if(window !== undefined) {
            (window as any).f5Attributes = result.attributes;
        }
    }

    private handleIP(deviceInfo: CollectedDeviceInfo, rtc: any): void {
        deviceInfo.rtc = rtc;
        this.updateDeviceInfo(deviceInfo);
    }

    private buildF4Payload(
        sessionKey: string,
        fingerprintData: Record<string, any>
      ): any {
            const payload = Base64Encoder.encodeBase64(JSON.stringify({sk: sessionKey, fp: {
                [this.directory.audio]: JSON.stringify(fingerprintData.audio), 
                [this.directory.browser]: JSON.stringify(fingerprintData.browser), 
                [this.directory.hardware]: JSON.stringify(fingerprintData.hardware), 
                [this.directory.preferences]: JSON.stringify(fingerprintData.preferences)
            }}), CONFIG.ENCODING_KEY);
    
        return payload;
      }

    private buildF5Payload(
        sessionKey: string,
        fingerprintData: Record<string, any>
      ): any {
        const payload = Base64Encoder.encodeBase64(JSON.stringify({sk: sessionKey, fp: {
            [this.directory.graphics]: JSON.stringify(fingerprintData.graphics)
        }}), CONFIG.ENCODING_KEY);
    
        return payload;
      }

    public async start(): Promise<void> {
        try {
            console.log('v' + CONFIG.VERSION);

            const sessionKey = SessionKeyManager.getSessionKey();
            const deviceInfo: CollectedDeviceInfo = { sk: sessionKey, v: CONFIG.VERSION };

            await this.ensureDOMReady();
            
            this.injectValueIntoHiddenField(sessionKey, "__fdi");

            await Promise.all([
                this.tagging.start().then((tagging: string) => {
                    deviceInfo.tag = PacketTransformer.unwrapMessage(tagging);
                    this.updateDeviceInfo(deviceInfo);
                }),
                this.fingerprint.start((result: FingerprintResult) => {
                    this.handleF4(deviceInfo, result);
                }, (result: FingerprintResult) => {
                    this.handleF5(deviceInfo, result);
                }, (rtc: any) => {
                    this.handleIP(deviceInfo, rtc);
                })
            ]);
        } catch (error) {
            // console.error('Client start failed:', error);
        }
    }

    private async ensureDOMReady(): Promise<void> {
        return new Promise((resolve) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(resolve, 10);
            } else {
                const handler = () => {
                    document.removeEventListener('DOMContentLoaded', handler);
                    setTimeout(resolve, 10);
                };
                document.addEventListener('DOMContentLoaded', handler);
            }
        });
    }
}

const client = new ClientClass();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        client.start();
    });
} else {
    client.start();
}
