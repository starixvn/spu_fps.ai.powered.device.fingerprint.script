import type { WebRTCGroupInfo } from "../../types";
import { collectAllIPTypes } from "./ipCollector";

export class WebRTCFingerprint {
  public static async collect(): Promise<WebRTCGroupInfo> {
    try {
      if (!this.isWebRTCSupported()) {
        return "";
      }

      const result = await collectAllIPTypes();
      const { localIPs, publicIPs, relayIPs } = result;
      
      const localIPsStr = localIPs.length > 0 ? localIPs.join(',') : '';
      const publicIPsStr = publicIPs.length > 0 ? publicIPs.join(',') : '';
      const relayIPsStr = relayIPs.length > 0 ? relayIPs.join(',') : '';
      
      return `${localIPsStr};${publicIPsStr};${relayIPsStr}`;
    } catch (error) {
      return "";
    }
  }

  private static isWebRTCSupported(): boolean {
    try {
      return !!(
        typeof window !== "undefined" &&
        window.RTCPeerConnection &&
        window.RTCSessionDescription &&
        window.RTCIceCandidate
      );
    } catch {
      return false;
    }
  }
}
