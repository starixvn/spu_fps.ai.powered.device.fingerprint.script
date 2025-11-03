import { DOMUtils } from "./utils/dom";
import { CollectedDeviceInfo } from "./types";
import { Base64Encoder } from "./fingerprint/utils/hash";
import { IPClass } from "./ip";
import { PacketTransformer } from "./utils/hash";
import { SessionKeyManager } from "./sessionKey";   
import { TaggingClass } from "./tagging";
import { FingerprintResult } from "./fingerprint/abstract/abstractFingerprint";
import { FingerprintClass } from "./fingerprint";
import { CONFIG } from "./utils/domain";
import { ErrorLogger } from "./utils/errorLogger";
import { DEFAULT_TAGGING_TYPE } from "./utils/constants";
class ClientClass {
    private readonly directory = {
        audio: "au",
        browser: "br",
        hardware: "hw",
        preferences: "pf",
        graphics: "gp",
      };
    private readonly STORAGE_KEYS = {
        F4_CODE: '__f4Code',
        F5_CODE: '__f5Code'
    };
    private readonly fingerprint: FingerprintClass;
    private readonly tagging: TaggingClass;
    private readonly ip: IPClass;

    constructor() {
        this.fingerprint = new FingerprintClass();
        this.tagging = new TaggingClass();
        this.ip = new IPClass();
    }

    private getGatewayUrl(): string {
        const searchPattern = "nsc.";
        const replacePattern = "gw.";
        const placeholder = "__gatewayDomain__";
        const serverDomain = CONFIG.SERVER_DOMAIN;

        let updatedDomainName = serverDomain.replace(searchPattern, replacePattern);

        return CONFIG.GATEWAY_URL.replace(placeholder, updatedDomainName);
    }

    private injectValueIntoHiddenField(value: string, hiddenField?: string): void {
        try {
            if(hiddenField) {
                DOMUtils.injectValueIntoHiddenField(hiddenField, value);
            } else {
                DOMUtils.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, value);
            }
        } catch (error) {
            ErrorLogger.error(
                "Failed to inject value into hidden field", error
            );
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
        if (deviceInfo.f4 !== result.hashed) {
            deviceInfo.f4 = result.hashed;
            this.updateDeviceInfo(deviceInfo);
            
            try {
                localStorage.setItem(this.STORAGE_KEYS.F4_CODE, result.hashed);
            } catch (error) {
            }
        }

        const payload = this.buildF4Payload(deviceInfo.sk, result.attributes, result.hashed);
        this.fingerprint.sendToServer(`${this.getGatewayUrl()}${CONFIG.ENDPOINTS.F4}`, payload);

        if(window !== undefined) {
            (window as any).f4Attributes = result.attributes;
        }
    }

    private handleF5(deviceInfo: CollectedDeviceInfo, result: FingerprintResult): void {
        if (deviceInfo.f5 !== result.hashed) {
            deviceInfo.f5 = result.hashed;
            this.updateDeviceInfo(deviceInfo);
            
            try {
                localStorage.setItem(this.STORAGE_KEYS.F5_CODE, result.hashed);
            } catch (error) {
            }
        }

        const payload = this.buildF5Payload(deviceInfo.sk, result.attributes, result.hashed);
        this.fingerprint.sendToServer(`${this.getGatewayUrl()}${CONFIG.ENDPOINTS.F5}`, payload);

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
        fingerprintData: Record<string, any>,
        hash: string
      ): any {
            const payload = Base64Encoder.encodeBase64(JSON.stringify({sk: sessionKey, fp: {
                [this.directory.audio]: JSON.stringify(fingerprintData.audio), 
                [this.directory.browser]: JSON.stringify(fingerprintData.browser), 
                [this.directory.hardware]: JSON.stringify(fingerprintData.hardware), 
                [this.directory.preferences]: JSON.stringify(fingerprintData.preferences)
            }, hs: hash}), CONFIG.ENCODING_KEY);
    
        return payload;
      }

    private buildF5Payload(
        sessionKey: string,
        fingerprintData: Record<string, any>,
        hash: string
      ): any {
        const payload = Base64Encoder.encodeBase64(JSON.stringify({sk: sessionKey, fp: {
            [this.directory.graphics]: JSON.stringify(fingerprintData.graphics)
        }, hs: hash}), CONFIG.ENCODING_KEY);
    
        return payload;
      }

    public async start(): Promise<void> {
        try {
            console.log('fv' + CONFIG.VERSION);

            const { Detecas } = window as any;
            const { version: scriptVersion, defaultDeviceId } = Detecas?.Config || {};

            const sessionKey = SessionKeyManager.getSessionKey();
            const defaultTagging = PacketTransformer.unwrapMessage(defaultDeviceId) || sessionKey;

            let cachedF4: string | null = null;
            let cachedF5: string | null = null;

            try {
                cachedF4 = localStorage.getItem(this.STORAGE_KEYS.F4_CODE);
                cachedF5 = localStorage.getItem(this.STORAGE_KEYS.F5_CODE);
            } catch (error) {
            }

            const deviceInfo: CollectedDeviceInfo = { 
                sk: sessionKey, 
                v: scriptVersion, 
                fv: CONFIG.VERSION,
                tag: defaultTagging,
                taggingType: DEFAULT_TAGGING_TYPE.DEFAULT,
                f4: cachedF4 || undefined,
                f5: cachedF5 || undefined
            };

            await this.ensureDOMReady();
            
            this.injectValueIntoHiddenField(sessionKey, "__fdi");

            if (cachedF4 || cachedF5) {
                this.updateDeviceInfo(deviceInfo);
            }

            await Promise.all([
                this.tagging.start().then(([tagging, taggingType]: [string, number]) => {
                    deviceInfo.tag = PacketTransformer.unwrapMessage(tagging);
                    deviceInfo.taggingType = taggingType;
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
            ErrorLogger.error('Client start failed:', error);
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
