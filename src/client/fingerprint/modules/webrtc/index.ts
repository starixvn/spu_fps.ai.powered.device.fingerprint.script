import { collectLocalIPs } from "./local_ips";
import { collectPublicIPs } from "./public_ips";
import { collectRelayIPs } from "./relay_ips";
import type { WebRTCGroupResult } from "../../types";

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

      const localPromise = this.createIPPromise(
        collectLocalIPs,
        Math.min(timeout, 1500)
      );

      const publicPromise = this.createIPPromise(
        collectPublicIPs,
        Math.min(timeout, 1500)
      );

      const relayPromise = this.createIPPromise(
        collectRelayIPs,
        Math.min(timeout, 1500)
      );

      const result = await Promise.race([
        Promise.allSettled([localPromise, publicPromise, relayPromise]),
        new Promise<PromiseSettledResult<string[]>[]>((resolve) =>
          setTimeout(
            () =>
              resolve([
                { status: "fulfilled", value: [] } as PromiseFulfilledResult<
                  string[]
                >,
                { status: "fulfilled", value: [] } as PromiseFulfilledResult<
                  string[]
                >,
                { status: "fulfilled", value: [] } as PromiseFulfilledResult<
                  string[]
                >,
              ]),
            timeout
          )
        ),
      ]);

      const [localIPs, publicIPs, relayIPs] = result.map((r) =>
        r.status === "fulfilled" ? r.value : []
      );

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
      console.error("Error collecting WebRTC fingerprint:", error);
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

  private static createIPPromise(
    collector: () => Promise<string[]>,
    timeout: number
  ): Promise<string[]> {
    return new Promise((resolve) => {
      let resolved = false;

      const fallbackTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve([]);
        }
      }, timeout);

      collector()
        .then((ips) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(fallbackTimeout);
            resolve(ips);
          }
        })
        .catch(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(fallbackTimeout);
            resolve([]);
          }
        });
    });
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

      return await this.createIPPromise(collectLocalIPs, timeout);
    } catch (error) {
      return [];
    }
  }

  public static async getPublicIPs(timeout: number = 2000): Promise<string[]> {
    try {
      if (!this.isWebRTCSupported()) {
        return [];
      }

      return await this.createIPPromise(collectPublicIPs, timeout);
    } catch (error) {
      return [];
    }
  }

  public static async getRelayIPs(timeout: number = 2000): Promise<string[]> {
    try {
      if (!this.isWebRTCSupported()) {
        return [];
      }

      return await this.createIPPromise(collectRelayIPs, timeout);
    } catch (error) {
      return [];
    }
  }
}
