interface AudioBaseLatencyResult {
  audioBaseLatency: number | string;
}

export async function collectAudioBaseLatency(): Promise<AudioBaseLatencyResult> {
  try {
    const audioBaseLatency = await getAudioBaseLatency();
    return { audioBaseLatency };
  } catch (error) {
    console.error("Error collecting audio base latency:", error);
    return { audioBaseLatency: "" };
  }
}

async function getAudioBaseLatency(): Promise<number | string> {
  try {
    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const audioContext: AudioContext = new AudioContextClass();

    if (!AudioContextClass) return "not_supported";

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

    audioContext.close();

    return Math.round(measuredLatency * 100) / 100;
  } catch (error) {
    console.error("Error in getAudioBaseLatency:", error);
    return "";
  }
}
