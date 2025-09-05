import type { WebRTCGroupInfo } from "../../types";
import { collectAllIPTypes } from "./ipCollector";

export class WebRTCFingerprint {
  public static async collect(
    timeout: number = 3000
  ): Promise<WebRTCGroupInfo> {
    try {
      if (!this.isWebRTCSupported()) {
        return "";
      }

      const result = await collectAllIPTypes(timeout);
      const { localIPs, publicIPs, relayIPs } = result;
      
      const ipGroups: string[] = [];
      
      if (localIPs.length > 0) {
        ipGroups.push(localIPs.join(','));
      }
      
      if (publicIPs.length > 0) {
        ipGroups.push(publicIPs.join(','));
      }
      
      if (relayIPs.length > 0) {
        ipGroups.push(relayIPs.join(','));
      }
      
      return ipGroups.join(';');
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
