import { collectAudioBaseLatency, SpecialFingerprint } from "./audioBaseLatency";
import { collectAudio } from "./audio";
import type { AudioGroupInfo } from "../../types";

export class AudioFingerprint {
  public static async collect(): Promise<AudioGroupInfo> {
    try {
      const audioResult = await collectAudio();
      const audioBaseLatencyResult = collectAudioBaseLatency();

      const audioGroup: AudioGroupInfo = {
        audio: audioResult,
        audioBaseLatency: audioBaseLatencyResult.audioBaseLatency,
      };

      return audioGroup;
    } catch (error) {
      console.error('Error collecting audio fingerprint:', error);
      return {
        audio: null,
        audioBaseLatency: SpecialFingerprint.NotSupported,
      };
    }
  }
}
