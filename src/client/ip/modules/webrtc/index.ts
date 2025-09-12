import type { WebRTCGroupInfo } from '../../types';
import { collectAllIPTypes } from './ipCollector';

export class WebRTCFingerprint {
    public static async collect(): Promise<WebRTCGroupInfo> {
        try {
            if (!this.isWebRTCSupported()) {
                return '';
            }

            const result = await collectAllIPTypes();
            const { localIPs, publicIPs } = result;

            const localIPsStr = localIPs.length > 0 ? localIPs.join(',') : '';
            const publicIPsStr =
                publicIPs.length > 0 ? publicIPs.join(',') : '';

            return `${localIPsStr};${publicIPsStr}`;
        } catch (error) {
            return '';
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
