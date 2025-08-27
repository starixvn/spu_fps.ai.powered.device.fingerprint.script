import type { AudioInfo } from "../../types";

const AUDIO_SESSION_CACHE_KEY = "__audio_fp_session__";
const AUDIO_LOCAL_CACHE_KEY = "__audio_fp_local__";

export async function collectAudio(): Promise<AudioInfo> {
  try {
    return await getAudioInfo();
  } catch {
    return getEmptyAudioInfo();
  }
}

async function getAudioInfo(): Promise<AudioInfo> {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = ctx.sampleRate;

  const oscillator = ctx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.value = 1000;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.fftSize;
  const data = new Float32Array(bufferLength);

  oscillator.connect(analyser);
  analyser.connect(ctx.destination);
  oscillator.start();

  await new Promise((resolve) => setTimeout(resolve, 100));
  analyser.getFloatTimeDomainData(data);
  oscillator.stop();
  ctx.close();

  const rawSamples = Array.from(data);

  const entropy = computeEntropy(rawSamples);

  const fingerprint = simpleChecksum(rawSamples);

  let noiseType: "ok" | "blocked" | "spoofed" | "randomized" = "ok";

  if (!rawSamples.length || rawSamples.every((v) => v === 0)) {
    noiseType = "blocked";
  } else if (entropy < 0.5) {
    noiseType = "spoofed";
  } else {
    const cachedSession = sessionStorage.getItem(AUDIO_SESSION_CACHE_KEY);
    const cachedLocal = localStorage.getItem(AUDIO_LOCAL_CACHE_KEY);

    if (cachedSession && cachedSession !== fingerprint) {
      noiseType = "randomized";
    }

    sessionStorage.setItem(AUDIO_SESSION_CACHE_KEY, fingerprint);

    if (cachedLocal && cachedLocal !== fingerprint) {
      noiseType = "randomized";
    }

    localStorage.setItem(AUDIO_LOCAL_CACHE_KEY, fingerprint);
  }

  return {
    fingerprint,
    raw: rawSamples,
    entropy,
    noiseType,
    sampleRate,
    length: rawSamples.length,
  };
}

function computeEntropy(arr: number[]): number {
  if (!arr.length) return 0;

  const hist = new Map<number, number>();

  for (const v of arr) {
    const bucket = Math.round((v + 1) * 100); // map -1..1 → 0..200
    hist.set(bucket, (hist.get(bucket) || 0) + 1);
  }

  const total = arr.length;

  let entropy = 0;

  for (const count of hist.values()) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

function simpleChecksum(arr: number[]): string {
  let hash = 0;

  for (let i = 0; i < arr.length; i++) {
    hash = (hash * 31 + Math.floor(arr[i] * 1e6)) >>> 0;
  }

  return hash.toString(16);
}

function getEmptyAudioInfo(): AudioInfo {
  return {
    fingerprint: "",
    raw: [],
    entropy: 0,
    noiseType: "blocked",
    sampleRate: 0,
    length: 0,
  };
}
