import { FingerprintSpecialValue } from "../../utils/consts";
import { isAndroid, isWebKit } from "../../utils/browser";

export function collectAudioBaseLatency(): number | FingerprintSpecialValue {
  try {
    const isAllowedPlatform = isAndroid() === 1 || isWebKit() === 1;
    
    if (!isAllowedPlatform) {
      return FingerprintSpecialValue.DISABLED;
    }

    const AudioContextClass =
      (window as any).AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return FingerprintSpecialValue.UNDEFINED;
    }

    let ctx: AudioContext;
    try {
      ctx = new AudioContextClass();
    } catch (err) {
      return FingerprintSpecialValue.UNDEFINED;
    }


    if ((ctx as any).baseLatency === undefined) {
      ctx.close?.();
      return FingerprintSpecialValue.UNDEFINED;
    }

    const latency = (ctx as any).baseLatency;

    if (latency === null || latency === undefined) {
      ctx.close?.();
      return FingerprintSpecialValue.UNDEFINED;
    }

    if (!isFinite(latency)) {
      ctx.close?.();
      return FingerprintSpecialValue.NOT_FINITE;
    }

    ctx.close?.();
    return latency;
  } catch (error) {
    return FingerprintSpecialValue.ERROR;
  }
}
