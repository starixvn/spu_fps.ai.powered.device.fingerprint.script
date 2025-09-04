import type { AudioInfo } from "../../types";

const enum SpecialFingerprint {
  NotSupported = -1,
  Timeout = -2,
  KnownForAntifingerprinting = -3,
}

const enum InnerErrorName {
  Timeout = 'timeout',
}

let audioCache: AudioInfo | null = null;
let lastMedian: number | null = null;

const OSC_FREQUENCY = 10000; // 10kHz triangle wave frequency
const SAMPLE_RATE = 44100;   // 44.1kHz standard sample rate
const DURATION = 0.5;        // 0.5s audio duration
const SNAPSHOTS = 3;         // audio samples

const SPOOF_VALUES = [-100, -120, 0];     
const SPOOF_RANGES = [
  [-101, -99], // Brave
  [-121, -119], // Tor
];

const VARIANCE_THRESHOLD = 25;      
const MEDIAN_DIFF_THRESHOLD = 5;   
const RMS_DIFF_THRESHOLD = 3;     

function getBrowserName(): string {
  try {
    const userAgent = (navigator.userAgent || "").toLowerCase();
    
    if (window.chrome && !window.opr && !navigator.brave) 
      return "Chrome";
    
    if (navigator.brave && navigator.brave.isBrave) 
      return "Brave";
    
    if (typeof window.InstallTrigger !== "undefined") 
      return "Firefox";
    
    if (window.safari && window.safari.pushNotification) 
      return "Safari";
    
    if (/safari(?!.*chrome)/.test(userAgent)) return "Safari";
    if (/edg\//.test(userAgent)) return "Edge";
    if (/opr|opera/.test(userAgent)) return "Opera";
    if (/chrome/.test(userAgent)) return "Chrome";
    if (/firefox/.test(userAgent)) return "Firefox";
    
    return "";
  } catch {
    return "";
  }
}

function isMobile(): boolean {
  try {
    return /Mobi|Android/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

function getBrowserVersion(): number {
  try {
    const userAgent = navigator.userAgent;
    const browserName = getBrowserName().toLowerCase();
    
    if (browserName === "safari") {
      const match = userAgent.match(/Version\/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    
    if (browserName === "chrome") {
      const match = userAgent.match(/Chrome\/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    
    if (browserName === "firefox") {
      const match = userAgent.match(/Firefox\/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    
    return 0;
  } catch {
    return 0;
  }
}


function doesBrowserPerformAntifingerprinting(): boolean {
  const browserName = getBrowserName().toLowerCase();
  const version = getBrowserVersion();
  
  // Safari 17+ has Intelligent Tracking Prevention with audio normalization
  if (browserName === "safari" && version >= 17) {
    return true;
  }
  
  // Brave Browser has built-in fingerprinting protection
  if (browserName === "brave") {
    return true;
  }
  
  // Tor Browser detection via canvas fingerprinting test
  if (browserName === "firefox" && navigator.userAgent.includes("rv:")) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Tor test', 2, 2);

        const data = canvas.toDataURL();
        
        // Tor Browser returns normalized canvas data < 5000 characters
        if (data.length < 5000) return true;
      }
    } catch {
      return true;
    }
  }
  
  // Samsung Browser 26+ has enhanced privacy features
  if (navigator.userAgent.includes("SamsungBrowser") && version >= 26) {
    return true;
  }
  
  return false;
}

export async function collectAudio(): Promise<AudioInfo> {
  try {
    // Pre-screening for known anti-fingerprinting browsers
    if (doesBrowserPerformAntifingerprinting()) {
      return { 
        audio: SpecialFingerprint.KnownForAntifingerprinting, 
        noiseType: "spoof" 
      };
    }

    const AudioCtxClass =
      (window as any).OfflineAudioContext ||
      (window as any).webkitOfflineAudioContext;
      
    if (!AudioCtxClass) {
      return { 
        audio: SpecialFingerprint.NotSupported, 
        noiseType: "block" 
      };
    }

    if (audioCache) {
      return audioCache;
    }

    // Generate multiple audio samples for analysis
    const samples: number[] = [];
    const snapshotsRMS: number[] = [];

    for (let i = 0; i < SNAPSHOTS; i++) {
      const result = await getAudioSampleWithRMSAndRetry();

      if (result !== null) {
        samples.push(result.sample);     
        snapshotsRMS.push(result.rms);   
      }
    }

    if (samples.length === 0) {
      return { audio: SpecialFingerprint.Timeout, noiseType: "block" };
    }

    // Statistical analysis and noise detection
    const median = computeMedian(samples);
    const noiseType = detectNoise(samples, median, snapshotsRMS);
    const result: AudioInfo = { audio: median, noiseType };

    // Cache clean results
    if (noiseType === "clean") {
      audioCache = result;
    }

    return result;
  } catch (error) {
    return { audio: SpecialFingerprint.Timeout, noiseType: "block" };
  }
}

async function getAudioSampleWithRMSAndRetry(): Promise<{
  sample: number;
  rms: number;
} | null> {
  const maxRetries = 3;
  const retryDelay = 500;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await getAudioSampleWithRMS();

      if (result !== null) return result;
      
      if (isMobile() && document.hidden) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * 2));
      } else {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError" || 
          err.message?.includes("user gesture")) {
        return null;
      }
      
      if (attempt === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return null;
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
        err.message?.includes("user gesture") ||
        err.message?.includes("AudioContext was not allowed") ||
        err.message?.includes("autoplay policy")
      ) {
        return null;
      }
      throw err;
    }

    // Build chain: oscillator -> compressor -> destination
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

    // Render audio with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(InnerErrorName.Timeout)), 5000);
    });

    const buffer = await Promise.race([
      ctx.startRendering(),
      timeoutPromise
    ]);
    
    // Analyze audio data for fingerprinting
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

  // Variance => randomization
  const variance =
    cleanSamples.reduce((acc, v) => acc + Math.pow(v - median, 2), 0) /
    cleanSamples.length;

  if (variance > VARIANCE_THRESHOLD) return "randomize";

  // RMS stability => randomization
  const maxRMS = Math.max(...snapshotsRMS);
  const minRMS = Math.min(...snapshotsRMS);

  if (maxRMS - minRMS > RMS_DIFF_THRESHOLD) return "randomize";

  // Temporal consistency with last run
  if (
    lastMedian !== null &&
    Math.abs(median - lastMedian) > MEDIAN_DIFF_THRESHOLD
  )
    return "randomize";

  lastMedian = median;
  return "clean";
}
