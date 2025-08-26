interface AudioFingerprintResult {
  audio: string | null;
}

export async function collectAudio(): Promise<AudioFingerprintResult> {
  try {
    const audio = await getAudioFingerprint();
    return { audio };
  } catch (error) {
    console.error("Error collecting audio:", error);
    return { audio: null };
  }
}

async function getAudioFingerprint(): Promise<string | null> {
  try {
    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const context: AudioContext = new AudioContextClass();

    if (!AudioContextClass) return null;

    if (context.state === "suspended") {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();

    gain.gain.value = 0;
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(context.destination);

    oscillator.start();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const audioData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(audioData);

    oscillator.stop();
    await context.close();

    return Array.from(audioData).slice(0, 30).join(",");
  } catch (e) {
    console.error("Audio fingerprint error:", e);
    return null;
  }
}
