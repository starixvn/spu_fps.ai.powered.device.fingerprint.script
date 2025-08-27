import { collectAudioBaseLatency } from "./audioBaseLatency";
import { collectAudio } from "./audio";
import type { AudioGroupResult } from "../../types";

export class AudioFingerprint {
  public static async collect(): Promise<AudioGroupResult> {
    try {
      const audioResult = await collectAudio();
      const audioBaseLatencyResult = await collectAudioBaseLatency();

      const audioGroup: AudioGroupResult = {
        audio: audioResult.audio,
        audioBaseLatency: audioBaseLatencyResult.audioBaseLatency,
      };

      return audioGroup;
    } catch (error) {
      console.error("Error collecting audio fingerprint:", error);
      return {
        audio: "",
        audioBaseLatency: 0,
      };
    }
  }
}
