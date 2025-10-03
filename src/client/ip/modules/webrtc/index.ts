import type { WebRTCGroupInfo } from '../../types';
import { collectAllIPTypes } from './ipCollector';
import { FingerprintSpecialValue } from '../../../fingerprint/utils/consts';

export class WebRTCFingerprint {
    public static async collect(): Promise<WebRTCGroupInfo> {
        try {
            if (!this.isWebRTCSupported()) {
                return FingerprintSpecialValue.UNDEFINED;
            }

            const result = await collectAllIPTypes();
            const { localIPs, publicIPs } = result;

            const localIPsStr = Array.isArray(localIPs) && localIPs.length > 0 ? localIPs.join(',') : (localIPs as any);
            const publicIPsStr = Array.isArray(publicIPs) && publicIPs.length > 0 ? publicIPs.join(',') : (publicIPs as any);

            return `${localIPsStr};${publicIPsStr}`;
        } catch (error) {
            return FingerprintSpecialValue.ERROR;
        }
    }

    private static isWebRTCSupported(): boolean {
        try {
            return !!(
                typeof window !== 'undefined' &&
                window.RTCPeerConnection &&
                window.RTCSessionDescription &&
                window.RTCIceCandidate
            );
        } catch {
            return false;
        }
    }
}
