import type { AudioBaseLatencyInfo } from "../../types";

export async function collectAudioBaseLatency(): Promise<AudioBaseLatencyInfo> {
  try {
    const audioBaseLatency = await getAudioBaseLatency();
    return { audioBaseLatency };
  } catch (error) {
    return { audioBaseLatency: "" };
  }
}

async function getAudioBaseLatency(): Promise<number | string> {
  try {
    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) return "not_supported";

    const audioContext: AudioContext = new AudioContextClass();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (audioContext.baseLatency !== undefined) {
      return audioContext.baseLatency;
    }

    const startTime = performance.now();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    gainNode.gain.value = 0;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.001);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const endTime = performance.now();
    const measuredLatency = endTime - startTime;

    try {
      await audioContext.close();
    } catch (closeError) {}

    return Math.round(measuredLatency * 100) / 100;
  } catch (error) {
    return "";
  }
}
