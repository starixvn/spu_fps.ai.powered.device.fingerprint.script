import { collectAudioBaseLatency } from "./audio_base_latency";
import { collectAudio } from "./audio";
import type { AudioGroupResult } from "../../types";

export class AudioFingerprint {
  public static async collect(): Promise<AudioGroupResult> {
    try {
      console.log("Starting audio fingerprint collection...");

      const audioBaseLatencyResult = await collectAudioBaseLatency();
      const audioResult = await collectAudio();

      const audioGroup: AudioGroupResult = {
        audio: audioResult.audio,
        audioBaseLatency: audioBaseLatencyResult.audioBaseLatency,
      };

      console.log("Audio fingerprint collected:", audioGroup);
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

export { collectAudioBaseLatency, collectAudio };
