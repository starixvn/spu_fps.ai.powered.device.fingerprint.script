import { DOMUtils } from "./dom";
import { CollectedDeviceInfo } from "./types";
import { Base64Encoder } from "./fingerprint/utils/hash";
import { FingerprintClass } from "./fingerprint";
import { IPClass } from "./ip";
import { TaggingClass } from "./tagging";
import { PacketTransformer } from "./tagging/utils/hash";

export const CONFIG = {
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

export type FingerprintStep = 'F4' | 'F5';
  
class ClientClass {

    private readonly fingerprint: FingerprintClass;
    private readonly ip: IPClass;

    constructor() {
        this.fingerprint = new FingerprintClass();
        this.ip = new IPClass();
    }

    private injectValueIntoHiddenField(value: string): void {
        try {
          DOMUtils.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, value);
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

    public async start(): Promise<void> {
        const sessionKey = await (window.history as any).tag.self;

        const deviceInfo = {
            sessionKey,
            deviceId: PacketTransformer.unwrapMessage(sessionKey)
        };

        this.fingerprint.start(sessionKey, {
            f4Callback: (hashed: string, step?: FingerprintStep) => this.injectCallback(deviceInfo, hashed, step),
            f5Callback: (hashed: string, step?: FingerprintStep) => this.injectCallback(deviceInfo, hashed, step)
        });

        this.ip.start((webRTC: any) => this.injectCallback(deviceInfo, webRTC));
    }
}

const client = new ClientClass();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", (async () => await client.start()));
} else {
    client.start();
}