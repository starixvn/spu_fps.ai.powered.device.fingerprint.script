import type { AudioBaseLatencyInfo } from "../../types";

const CACHE_KEY = "audioBaseLatencyCache";
const LATENCY_SAMPLE_RATE = 44100;      
const LATENCY_DURATION = 0.1;           
const LATENCY_CHANNELS = 1;             
const LATENCY_BUFFER_LENGTH = LATENCY_SAMPLE_RATE * LATENCY_DURATION; 
const LATENCY_SNAPSHOTS = 3;
const NOISE_THRESHOLD = 0.1; 

export async function collectAudioBaseLatency(): Promise<AudioBaseLatencyInfo> {
  try {
    let cached: number | null = null;
    const rawCache = localStorage.getItem(CACHE_KEY);

    if (rawCache && !isNaN(Number(rawCache))) {
      cached = Number(rawCache);
    }

    // Measure new median
    const samples: number[] = [];
    for (let i = 0; i < LATENCY_SNAPSHOTS; i++) {
      const value = await getAudioBaseLatency();
      if (typeof value === "number") samples.push(value);
    }

    if (!samples.length) {
      return { audioBaseLatency: "not_supported" };
    }

    const freshMedian = computeMedian(samples);

    // If cache exists, compare values
    if (cached !== null) {
      const diff = Math.abs(freshMedian - cached) / cached;
      
      if (diff <= NOISE_THRESHOLD) {
        // Small deviation -> trust old cache for consistency
        return { audioBaseLatency: cached };
      } else {
        localStorage.setItem(CACHE_KEY, String(freshMedian));
        return { audioBaseLatency: freshMedian };
      }
    }

    // No cache yet -> save new value
    localStorage.setItem(CACHE_KEY, String(freshMedian));
    return { audioBaseLatency: freshMedian };
  } catch {
    return { audioBaseLatency: "error" };
  }
}

async function getAudioBaseLatency(): Promise<number | string> {
  try {
    const OfflineAudioContextClass =
      (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;

    if (!OfflineAudioContextClass) {
      return "not_supported";
    }

    let offlineContext: OfflineAudioContext;

    try {
      offlineContext = new OfflineAudioContextClass(
        LATENCY_CHANNELS,
        LATENCY_BUFFER_LENGTH,
        LATENCY_SAMPLE_RATE
      );
    } catch (err: any) {
      if (
        err.name === "NotAllowedError" ||
        err.message?.includes("user gesture") ||
        err.message?.includes("AudioContext was not allowed") ||
        err.message?.includes("autoplay policy")
      ) {
        return "user_gesture_required";
      }
      throw err;
    }

    if ((offlineContext as any).baseLatency !== undefined) {
      return (offlineContext as any).baseLatency;
    }

    // Simulate audio rendering to estimate latency
    const oscillator = offlineContext.createOscillator();
    const gainNode = offlineContext.createGain();

    gainNode.gain.value = 0.01;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, offlineContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(offlineContext.destination);

    oscillator.start(0);
    oscillator.stop(LATENCY_DURATION);

    const renderStart = performance.now();
    await offlineContext.startRendering();
    const renderEnd = performance.now();

    const processingTime = renderEnd - renderStart;
    const bufferDuration = (LATENCY_BUFFER_LENGTH / LATENCY_SAMPLE_RATE) * 1000;
    const estimatedLatency = Math.round((processingTime + bufferDuration) * 100) / 100;

    return estimatedLatency;
  } catch {
    return "error";
  }
}

function computeMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
