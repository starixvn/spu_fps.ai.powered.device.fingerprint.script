import { DOMUtils } from "./dom";
import { CollectedDeviceInfo } from "./types";
import { Base64Encoder } from "./fingerprint/utils/hash";
import { IPClass } from "./ip";
import { PacketTransformer } from "./utils/hash";
import { SessionKeyManager } from "./sessionKey";   
import { F4Fingerprint } from "./fingerprint/f4Fingerprint";
import { F5Fingerprint } from "./fingerprint/f5Fingerprint";

export const CONFIG = {
    ENCODING_KEY: "__ENCODE_KEY__",
    GATEWAY_URL: "__GATEWAY_URL__",
    ENDPOINTS: {
      F4: "/meta_data",
      F5: "/logs_sync"
    },
    FIELD_NAMES: {
      DEVICE_INFO: "__di"
    }
}

export type FingerprintStep = 'F4' | 'F5';
  
class ClientClass {

    private readonly f4Fingerprint: F4Fingerprint;
    private readonly f5Fingerprint: F5Fingerprint;
    private readonly ip: IPClass;

    constructor() {
        this.f4Fingerprint = new F4Fingerprint();
        this.f5Fingerprint = new F5Fingerprint();
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

    private injectCallback(deviceInfo: CollectedDeviceInfo, hashed: string, step?: FingerprintStep): void {
        if (step === 'F4') {
            deviceInfo.f4Hashed = hashed;
        } else if (step === 'F5') {
            deviceInfo.f5Hashed = hashed;
        }

        const encodedData = Base64Encoder.encodeBase64(JSON.stringify(deviceInfo), CONFIG.ENCODING_KEY);
        this.injectValueIntoHiddenField(encodedData);
    }

    private updateDeviceInfo(deviceInfo: CollectedDeviceInfo): void {
        const finalEncodedData = Base64Encoder.encodeBase64(JSON.stringify(deviceInfo), CONFIG.ENCODING_KEY);
        this.injectValueIntoHiddenField(finalEncodedData);

        if (typeof window !== "undefined") {
            (window as any).deviceInfo = deviceInfo;
        }
    }

    public async start(): Promise<void> {
        try {
            const sessionKey = SessionKeyManager.getSessionKey();
            const deviceInfo: CollectedDeviceInfo = { sessionKey };

            await this.ensureDOMReady();
            
            this.injectValueIntoHiddenField(sessionKey, "__fdi");

            const [tagging, f4Attributes] = await Promise.all([
                (window.history as any).tag.self,
                this.f4Fingerprint.processF4Data(sessionKey, (hashed: string, step?: FingerprintStep) => {
                    this.injectCallback(deviceInfo, hashed, step);
                })
            ]);

            deviceInfo.deviceId = PacketTransformer.unwrapMessage(tagging);
            this.updateDeviceInfo(deviceInfo);

            await Promise.all([
                this.f5Fingerprint.processF5Data(sessionKey, f4Attributes, (hashed: string, step?: FingerprintStep) => {
                    this.injectCallback(deviceInfo, hashed, step);
                }),
                this.ip.start((webRTC: any) => {
                    deviceInfo.webrtc = webRTC;
                    this.updateDeviceInfo(deviceInfo);
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
