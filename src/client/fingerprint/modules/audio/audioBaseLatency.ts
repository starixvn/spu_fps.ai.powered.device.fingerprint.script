import type { AudioBaseLatencyInfo } from "../../types";
import { isAndroid, isWebKit } from "../../utils/browser";

export enum SpecialFingerprint {
  NotSupported = -1,
  Disabled = -2,
  NotFinite = -3,
}

export function collectAudioBaseLatency(): AudioBaseLatencyInfo {
  try {
    const isAllowedPlatform = isAndroid() || isWebKit();
    
    if (!isAllowedPlatform) {
      return { audioBaseLatency: SpecialFingerprint.Disabled };
    }

    const OfflineAudioContextClass =
      (window as any).OfflineAudioContext ||
      (window as any).webkitOfflineAudioContext;

    if (!OfflineAudioContextClass) {
      return { audioBaseLatency: SpecialFingerprint.NotSupported };
    }

    let ctx: OfflineAudioContext;
    try {
      ctx = new OfflineAudioContextClass(1, 1, 44100);
    } catch (error) {
      return { audioBaseLatency: SpecialFingerprint.NotSupported };
    }

    if ((ctx as any).baseLatency === undefined) {
      return { audioBaseLatency: SpecialFingerprint.NotSupported };
    }

    const latency = (ctx as any).baseLatency;

    if (latency === null || latency === undefined) {
      return { audioBaseLatency: SpecialFingerprint.NotSupported };
    }

    if (!isFinite(latency)) {
      return { audioBaseLatency: SpecialFingerprint.NotFinite };
    }

    return { audioBaseLatency: latency };
  } catch (error) {
    return { audioBaseLatency: SpecialFingerprint.NotSupported };
  }
}
