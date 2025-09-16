import type { AudioBaseLatencyInfo } from "../../types";
import { isAndroid, isWebKit } from "../../utils/browser";

export enum SpecialFingerprint {
  NotSupported = -1,
  Disabled     = -2,
  NotFinite    = -3,
}

export function collectAudioBaseLatency(): AudioBaseLatencyInfo {
  try {
    const isAllowedPlatform = isAndroid() === 1 || isWebKit() === 1;
    
    if (!isAllowedPlatform) {
      return { audioBaseLatency: SpecialFingerprint.Disabled };
    }

    const AudioContextClass =
      (window as any).AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return { audioBaseLatency: SpecialFingerprint.NotSupported };
    }

    let ctx: AudioContext;
    try {
      ctx = new AudioContextClass();
    } catch {
      return { audioBaseLatency: SpecialFingerprint.NotSupported };
    }

    if ((ctx as any).baseLatency === undefined) {
      ctx.close?.();
      return { audioBaseLatency: SpecialFingerprint.NotSupported };
    }

    const latency = (ctx as any).baseLatency;

    if (latency === null || latency === undefined) {
      ctx.close?.();
      return { audioBaseLatency: SpecialFingerprint.NotSupported };
    }

    if (!isFinite(latency)) {
      ctx.close?.();
      return { audioBaseLatency: SpecialFingerprint.NotFinite };
    }

    ctx.close?.();
    return { audioBaseLatency: latency };
  } catch {
    return { audioBaseLatency: SpecialFingerprint.NotSupported };
  }
}
