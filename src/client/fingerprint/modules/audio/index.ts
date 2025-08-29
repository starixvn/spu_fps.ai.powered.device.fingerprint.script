import { collectAudioBaseLatency } from "./audioBaseLatency";
import { collectAudio } from "./audio";
import type { AudioGroupInfo } from "../../types";

export class AudioFingerprint {
  public static async collect(): Promise<AudioGroupInfo> {
    try {
      const [audioResult, audioBaseLatencyResult] = await Promise.allSettled([
        collectAudio(),
        collectAudioBaseLatency()
      ]);

      const audio = audioResult.status === "fulfilled" 
        ? audioResult.value 
        : { audio: null, noiseType: "block" as const };

      const audioBaseLatency = audioBaseLatencyResult.status === "fulfilled"
        ? audioBaseLatencyResult.value.audioBaseLatency
        : "";

      const audioGroup: AudioGroupInfo = {
        audio,
        audioBaseLatency,
      };

      return audioGroup;
    } catch (error) {
      return {
        audio: {
          audio: null,
          noiseType: "block",
        },
        audioBaseLatency: "",
      };
    }
  }
}
