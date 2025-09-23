import { FINGERPRINT_SPECIAL_VALUES, FingerprintSpecialValue } from "../../utils/consts";
import { isAndroid, isWebKit } from "../../utils/browser";

export function collectAudioBaseLatency(): number | FingerprintSpecialValue {
  try {
    const isAllowedPlatform = isAndroid() === 1 || isWebKit() === 1;
    
    if (!isAllowedPlatform) {
      return FINGERPRINT_SPECIAL_VALUES.DISABLED;
    }

    const AudioContextClass =
      (window as any).AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return FINGERPRINT_SPECIAL_VALUES.UNDEFINED;
    }

    let ctx: AudioContext;
    try {
      ctx = new AudioContextClass();
    } catch (err) {
      return FINGERPRINT_SPECIAL_VALUES.UNDEFINED;
    }


    if ((ctx as any).baseLatency === undefined) {
      ctx.close?.();
      return FINGERPRINT_SPECIAL_VALUES.UNDEFINED;
    }

    const latency = (ctx as any).baseLatency;

    if (latency === null || latency === undefined) {
      ctx.close?.();
      return FINGERPRINT_SPECIAL_VALUES.UNDEFINED;
    }

    if (!isFinite(latency)) {
      ctx.close?.();
      return FINGERPRINT_SPECIAL_VALUES.NOT_FINITE;
    }

    ctx.close?.();
    return latency;
  } catch (error) {
    return FINGERPRINT_SPECIAL_VALUES.ERROR;
  }
}
