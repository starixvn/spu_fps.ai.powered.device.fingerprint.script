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
const RMS_DIFF_THRESHOLD = 3;
const SNAPSHOTS = 3;

export async function collectAudio(): Promise<AudioInfo> {
  try {
    if (audioCache) return audioCache;

    const samples: number[] = [];
    const snapshotsRMS: number[] = [];

    for (let i = 0; i < SNAPSHOTS; i++) {
      const result = await getAudioSampleWithRMS();

      if (result !== null) {
        samples.push(result.sample);
        snapshotsRMS.push(result.rms);
      }
    }

    if (samples.length === 0) return { audio: null, noiseType: "block" };

    const median = computeMedian(samples);
    const noiseType = detectNoise(samples, median, snapshotsRMS);
    const result: AudioInfo = { audio: median, noiseType };

    if (noiseType === "clean") audioCache = result;

    return result;
  } catch {
    return { audio: null, noiseType: "block" };
  }
}

async function getAudioSampleWithRMS(): Promise<{
  sample: number;
  rms: number;
} | null> {
  try {
    const AudioCtxClass =
      (window as any).OfflineAudioContext ||
      (window as any).webkitOfflineAudioContext;

    if (!AudioCtxClass) return null;

    let ctx: OfflineAudioContext;

    try {
      ctx = new AudioCtxClass(1, SAMPLE_RATE * DURATION, SAMPLE_RATE);
    } catch (err: any) {
      if (
        err.name === "NotAllowedError" ||
        err.message?.includes("user gesture")
      )
        return null;
      throw err;
    }

    const osc = ctx.createOscillator();
    const comp = ctx.createDynamicsCompressor();

    osc.type = "triangle";
    osc.frequency.value = OSC_FREQUENCY;

    comp.threshold.setValueAtTime(-50, ctx.currentTime);
    comp.knee.setValueAtTime(40, ctx.currentTime);
    comp.ratio.setValueAtTime(12, ctx.currentTime);
    comp.attack.setValueAtTime(0, ctx.currentTime);
    comp.release.setValueAtTime(0.25, ctx.currentTime);

    osc.connect(comp);
    comp.connect(ctx.destination);

    osc.start(0);
    osc.stop(DURATION);

    const buffer = await ctx.startRendering();
    const data = buffer.getChannelData(0);

    let sum = 0;
    let sumSquares = 0;
    const start = Math.floor(data.length * 0.2);
    const end = Math.floor(data.length * 0.25);

    for (let i = start; i < end; i++) {
      const absValue = Math.abs(data[i]);
      sum += absValue;
      sumSquares += data[i] * data[i];
    }

    const sampleCount = end - start;
    const rms = Math.sqrt(sumSquares / sampleCount);

    return { sample: sum, rms };
  } catch {
    return null;
  }
}

function computeMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function detectNoise(
  cleanSamples: number[],
  median: number,
  snapshotsRMS: number[]
): "clean" | "randomize" | "spoof" | "block" {
  if (SPOOF_VALUES.includes(Math.round(median))) return "spoof";
  if (SPOOF_RANGES.some(([min, max]) => median >= min && median <= max))
    return "spoof";

  const variance =
    cleanSamples.reduce((acc, v) => acc + Math.pow(v - median, 2), 0) /
    cleanSamples.length;

  if (variance > VARIANCE_THRESHOLD) return "randomize";

  const maxRMS = Math.max(...snapshotsRMS);
  const minRMS = Math.min(...snapshotsRMS);

  if (maxRMS - minRMS > RMS_DIFF_THRESHOLD) return "randomize";

  if (
    lastMedian !== null &&
    Math.abs(median - lastMedian) > MEDIAN_DIFF_THRESHOLD
  )
    return "randomize";

  lastMedian = median;
  return "clean";
}
