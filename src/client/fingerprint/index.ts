import { F4Fingerprint } from "./f4Fingerprint";
import { F5Fingerprint } from "./f5Fingerprint";
import { FingerprintStep } from "..";
import { DOMUtils } from "../dom";
import { CollectedDeviceInfo } from "./types";
import { SessionKeyManager } from "../sessionKey";
import { Base64Encoder } from "./utils/hash";
import { FingerprintResult } from "./abstract/abstractFingerprint";
import { IPClass } from "../ip";

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

export class FingerprintClass {
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

    private injectCallback(deviceInfo: CollectedDeviceInfo, hashed?: string, step?: FingerprintStep): void {
        if (step === 'F4') {
            deviceInfo.f4 = hashed;
        } else if (step === 'F5') {
            deviceInfo.f5 = hashed;
        }

        const encodedData = Base64Encoder.encodeBase64(JSON.stringify(deviceInfo), CONFIG.ENCODING_KEY);
        this.injectValueIntoHiddenField(encodedData);
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

    public async start(): Promise<void> {
        console.log('v' + CONFIG.VERSION);

        const sessionKey = SessionKeyManager.getSessionKey();
        const deviceInfo: CollectedDeviceInfo = { sk: sessionKey, v: CONFIG.VERSION };

        await this.ensureDOMReady();
        
        this.injectValueIntoHiddenField(sessionKey, "__fdi");

        const f4Attributes = await this.f4Fingerprint.start(sessionKey, (result: FingerprintResult) => {
            this.injectCallback(deviceInfo, result.hashed, result.step);
        });

        await Promise.all([
            this.f5Fingerprint.start(sessionKey, f4Attributes, (result: FingerprintResult) => {
                this.injectCallback(deviceInfo, result.hashed, result.step);
            }),
            this.ip.start((webRTC: any) => {
                deviceInfo.rtc = webRTC;
                this.injectCallback(deviceInfo);
            })
        ]);

        if (typeof window !== "undefined") {
            (window as any).deviceInfo = deviceInfo;
        }
    }
}

const fingerprint = new FingerprintClass();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        fingerprint.start();
    });
} else {
    fingerprint.start();
}