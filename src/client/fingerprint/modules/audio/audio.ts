import type { AudioInfo, Bit } from '../../types';
import { FingerprintSpecialValue } from '../../utils/consts';
import { boolToBit } from '../../utils/data';
import { collectBrowserName } from '../browser/browserName';
import {
  isChromium,
  isChromium122OrNewer,
  isMobile,
  isSafariWebKit,
  isSamsungInternet,
  isWebKit,
} from '../../utils/browser';

export const enum AudioStatus {
  CLEAN = 'clean',
  RANDOMIZE = 'randomize',
  SPOOF = 'spoof',
  BLOCK = 'block',
}

const enum InnerErrorName {
  Timeout = 'timeout',
}

let audioCache: number | null = null;
let lastMedian: number | null = null;

const OSC_FREQUENCY = 10000; // 10kHz triangle wave frequency
const SAMPLE_RATE = 44100; // 44.1kHz standard sample rate
const DURATION = 0.5; // 0.5s audio duration
const SNAPSHOTS = 3; // audio samples

const SPOOF_VALUES = [-100, -120, 0];
const SPOOF_RANGES = [
  [-101, -99], // Brave
  [-121, -119], // Tor
];

const VARIANCE_THRESHOLD = 25;
const MEDIAN_DIFF_THRESHOLD = 5;
const RMS_DIFF_THRESHOLD = 3;

export async function collectAudio(): Promise<AudioInfo> {
  try {
    if (doesBrowserPerformAntifingerprinting()) {
      return FingerprintSpecialValue.ANTI_FINGERPRINTED;
    }

    const AudioCtxClass =
      (window as any).OfflineAudioContext ||
      (window as any).webkitOfflineAudioContext;

    if (!AudioCtxClass) {
      return FingerprintSpecialValue.UNDEFINED;
    }

    if (audioCache !== null) {
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
      return FingerprintSpecialValue.TIMEOUT;
    }

    // Statistical analysis and noise detection
    const median = computeMedian(samples);
    const status = detectNoise(samples, median, snapshotsRMS);

    // Cache clean results
    return status === AudioStatus.CLEAN
      ? (audioCache = median)
      : FingerprintSpecialValue.ANTI_FINGERPRINTED;
  } catch (error) {
    return FingerprintSpecialValue.ERROR;
  }
}

function doesBrowserPerformAntifingerprinting(): Bit {
  const browserName = collectBrowserName().toString().toLowerCase();

  // Safari WebKit has Intelligent Tracking Prevention with audio normalization
  if (isWebKit() && isSafariWebKit()) return 1;

  // Samsung Browser 26+ has enhanced privacy
  if (isChromium() && isSamsungInternet() && isChromium122OrNewer()) return 1;

  // Brave Browser has built-in fingerprinting protection
  if (browserName === 'brave') return 1;

  // Firefox with privacy.resistFingerprinting detection
  if (browserName === 'firefox') return detectFirefoxResistFingerprinting();

  return 0;
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
        await new Promise((resolve) => setTimeout(resolve, retryDelay * 2));
      } else {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    } catch (err: any) {
      if (
        err.name === 'NotAllowedError' ||
        err.message?.includes('user gesture')
      ) {
        return null;
      }

      if (attempt === maxRetries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return null;
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
): AudioStatus {
  if (SPOOF_VALUES.includes(Math.round(median))) return AudioStatus.SPOOF;

  if (SPOOF_RANGES.some(([min, max]) => median >= min && median <= max))
    return AudioStatus.SPOOF;

  // Variance => randomization
  const variance =
    cleanSamples.reduce((acc, v) => acc + Math.pow(v - median, 2), 0) /
    cleanSamples.length;

  if (variance > VARIANCE_THRESHOLD) return AudioStatus.RANDOMIZE;

  // RMS stability => randomization
  const maxRMS = Math.max(...snapshotsRMS);
  const minRMS = Math.min(...snapshotsRMS);

  if (maxRMS - minRMS > RMS_DIFF_THRESHOLD) return AudioStatus.RANDOMIZE;

  // Temporal consistency with last run
  if (
    lastMedian !== null &&
    Math.abs(median - lastMedian) > MEDIAN_DIFF_THRESHOLD
  )
    return AudioStatus.RANDOMIZE;

  lastMedian = median;
  return AudioStatus.CLEAN;
}

function detectFirefoxResistFingerprinting(): Bit {
  try {
    let indicators = 0;

    // Check timezone spoofing - resistFingerprinting forces UTC
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneOffset = new Date().getTimezoneOffset();
    if (timezone === 'UTC' && timezoneOffset !== 0) {
      indicators++;
    }

    // Check screen resolution normalization
    const { width, height } = screen;
    const commonResolutions = [
      [1024, 768],
      [1366, 768],
      [1920, 1080],
      [1280, 720],
    ];
    const hasCommonResolution = commonResolutions.some(
      ([w, h]) => width === w && height === h
    );
    if (
      hasCommonResolution &&
      screen.availWidth === width &&
      screen.availHeight === height
    ) {
      indicators++;
    }

    // Check Date
    const dates = [];
    for (let i = 0; i < 10; i++) {
      dates.push(new Date().getTime());
    }
    const uniqueDates = new Set(dates).size;
    if (uniqueDates <= 2) {
      // resistFingerprinting reduces Date precision
      indicators++;
    }

    // Check language spoofing - resistFingerprinting often forces 'en-US'
    if (
      navigator.language === 'en-US' &&
      navigator.languages &&
      navigator.languages.length === 1 &&
      navigator.languages[0] === 'en-US'
    ) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (
        !timezone.includes('America') &&
        !timezone.includes('US') &&
        !timezone.includes('Canada')
      ) {
        indicators++;
      }
    }

    // Check navigator.hardwareConcurrency spoofing
    if (navigator.hardwareConcurrency === 2) {
      if (indicators > 0) {
        indicators++;
      }
    }

    // Check canvas fingerprinting normalization
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 10, 10);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.fillText('fingerprint test', 2, 2);
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.fillRect(5, 5, 10, 10);

        const dataURL = canvas.toDataURL();

        if (dataURL.length < 3000) {
          indicators++;
        }
      }
    } catch (err) {
      indicators++;
    }

    // Check WebGL renderer spoofing
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const webglContext = gl as WebGLRenderingContext;
        const renderer = webglContext.getParameter(webglContext.RENDERER);

        if (
          renderer.includes('llvmpipe') ||
          renderer.includes('Software') ||
          renderer.includes('Mesa') ||
          renderer.includes('SwiftShader')
        ) {
          indicators++;
        }
      }
    } catch (err) {
      indicators++; // WebGL blocked
    }

    // Require at least 2 indicators for positive detection
    return boolToBit(indicators >= 2);
  } catch (err) {
    return 0;
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
        err.name === 'NotAllowedError' ||
        err.message?.includes('user gesture') ||
        err.message?.includes('AudioContext was not allowed') ||
        err.message?.includes('autoplay policy')
      ) {
        return null;
      }
      throw err;
    }

    // Build chain: oscillator -> compressor -> destination
    const osc = ctx.createOscillator();
    const comp = ctx.createDynamicsCompressor();

    osc.type = 'triangle';
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

    const buffer = await Promise.race([ctx.startRendering(), timeoutPromise]);

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
