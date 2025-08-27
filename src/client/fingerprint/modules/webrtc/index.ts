import type { WebRTCGroupResult } from "../../types";
import { collectAllIPTypes } from "./ipCollector";

export class WebRTCFingerprint {
  public static async collect(
    timeout: number = 2000
  ): Promise<WebRTCGroupResult> {
    try {
      if (!this.isWebRTCSupported()) {
        return {
          localIPs: [],
          publicIPs: [],
          relayIPs: [],
          flags: {
            isSupported: false,
            isBlocked: true,
            hasNoise: false,
            relayOnly: false,
          },
          error: "WebRTC not supported in this browser",
          timestamp: new Date().toISOString(),
        };
      }

      const { localIPs, publicIPs, relayIPs } = await collectAllIPTypes(timeout);
      const flags = this.analyzeFlags(localIPs, publicIPs, relayIPs);

      return {
        localIPs,
        publicIPs,
        relayIPs,
        flags,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        localIPs: [],
        publicIPs: [],
        relayIPs: [],
        flags: {
          isSupported: this.isWebRTCSupported(),
          isBlocked: true,
          hasNoise: false,
          relayOnly: false,
        },
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static analyzeFlags(
    localIPs: string[],
    publicIPs: string[],
    relayIPs: string[]
  ) {
    let hasNoise = false;

    const allIPs = [...localIPs, ...publicIPs, ...relayIPs];

    for (const ip of allIPs) {
      if (
        /^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.|0\.0\.0\.0|127\.0\.0\.1)/.test(
          ip
        )
      ) {
        hasNoise = true;
        break;
      }
    }

    const relayOnly =
      relayIPs.length > 0 && localIPs.length === 0 && publicIPs.length === 0;
    const isBlocked =
      localIPs.length === 0 && publicIPs.length === 0 && relayIPs.length === 0;

    return {
      isSupported: true,
      isBlocked,
      hasNoise,
      relayOnly,
    };
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

  public static async getLocalIPs(timeout: number = 2000): Promise<string[]> {
    try {
      if (!this.isWebRTCSupported()) {
        return [];
      }

      const { localIPs } = await collectAllIPTypes(timeout);
      return localIPs;
    } catch (error) {
      return [];
    }
  }

  public static async getPublicIPs(timeout: number = 2000): Promise<string[]> {
    try {
      if (!this.isWebRTCSupported()) {
        return [];
      }

      const { publicIPs } = await collectAllIPTypes(timeout);
      return publicIPs;
    } catch (error) {
      return [];
    }
  }

  public static async getRelayIPs(timeout: number = 2000): Promise<string[]> {
    try {
      if (!this.isWebRTCSupported()) {
        return [];
      }

      const { relayIPs } = await collectAllIPTypes(timeout);
      return relayIPs;
    } catch (error) {
      return [];
    }
  }
}
