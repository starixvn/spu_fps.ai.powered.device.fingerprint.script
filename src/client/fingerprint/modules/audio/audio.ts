import type { AudioInfo } from "../../types";

let audioCache: AudioInfo | null = null;
let lastMedian: number | null = null;

const OSC_FREQUENCY = 10000; // 10kHz
const SAMPLE_RATE = 44100; // 44.1kHz
const DURATION = 0.5; // 0.5s
const SPOOF_VALUES = [-100, -120, 0];
const SPOOF_RANGES = [
  [-101, -99], // Brave
  [-121, -119], // Tor
];
const VARIANCE_THRESHOLD = 25;
const MEDIAN_DIFF_THRESHOLD = 5;

export async function collectAudio(): Promise<AudioInfo> {
  try {
    if (audioCache) return audioCache;

    const start = performance.now();
    const samples: (number | null)[] = [];

    for (let i = 0; i < 3; i++) {
      samples.push(await getAudioSample());
    }

    if (samples.every((v) => v === null)) {
      return { audio: null, duration: 0, noiseType: "block" };
    }

    const cleanSamples = samples
      .filter((v): v is number => v !== null)
      .sort((a, b) => a - b);

    const median =
      cleanSamples.length % 2 === 1
        ? cleanSamples[(cleanSamples.length - 1) / 2]
        : (cleanSamples[0] + cleanSamples[1]) / 2;

    let noiseType: AudioInfo["noiseType"] = detectNoise(cleanSamples, median);
    const duration = performance.now() - start;
    const result: AudioInfo = { audio: median, duration, noiseType };

    if (noiseType !== "randomize") {
      audioCache = result;
    }

    return result;
  } catch {
    return { audio: null, duration: 0, noiseType: "block" };
  }
}

async function getAudioSample(): Promise<number | null> {
  try {
    const ctx = new OfflineAudioContext(1, SAMPLE_RATE * DURATION, SAMPLE_RATE);
    const oscillator = ctx.createOscillator();
    const startIndex = 4500;
    const endIndex = 5000;
    let sum = 0;

    oscillator.type = "triangle";
    oscillator.frequency.value = OSC_FREQUENCY;

    const compressor = ctx.createDynamicsCompressor();

    compressor.threshold.setValueAtTime(-50, ctx.currentTime);
    compressor.knee.setValueAtTime(40, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    oscillator.connect(compressor);
    compressor.connect(ctx.destination);

    oscillator.start(0);
    oscillator.stop(DURATION);

    const buffer = await ctx.startRendering();
    const channelData = buffer.getChannelData(0);

    for (let i = startIndex; i < endIndex; i++) {
      sum += Math.abs(channelData[i]);
    }

    return sum;
  } catch {
    return null;
  }
}

function detectNoise(
  cleanSamples: number[],
  median: number
): AudioInfo["noiseType"] {
  if (SPOOF_VALUES.includes(Math.round(median))) return "spoof";
  if (SPOOF_RANGES.some(([min, max]) => median >= min && median <= max))
    return "spoof";

  const variance =
    cleanSamples.reduce((acc, v) => acc + Math.pow(v - median, 2), 0) /
    cleanSamples.length;

  if (variance > VARIANCE_THRESHOLD) return "randomize";

  if (
    lastMedian !== null &&
    Math.abs(median - lastMedian) > MEDIAN_DIFF_THRESHOLD
  ) {
    return "randomize";
  }

  lastMedian = median;
  return "clean";
}
