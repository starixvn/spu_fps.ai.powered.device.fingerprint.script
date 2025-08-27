import { collectAudioBaseLatency } from "./audioBaseLatency";
import { collectAudio } from "./audio";
import type { AudioGroupResult } from "../../types";

export class AudioFingerprint {
  public static async collect(): Promise<AudioGroupResult> {
    try {
      const audioResult = await collectAudio();
      const audioBaseLatencyResult = await collectAudioBaseLatency();

      const audioGroup: AudioGroupResult = {
        audio: audioResult,
        audioBaseLatency: audioBaseLatencyResult.audioBaseLatency,
      };

      return audioGroup;
    } catch (error) {
      return {
        audio: {
          fingerprint: "",
          raw: [],
          entropy: 0,
          noiseType: "blocked",
          sampleRate: 0,
          length: 0,
        },
        audioBaseLatency: 0,
      };
    }
  }
}
