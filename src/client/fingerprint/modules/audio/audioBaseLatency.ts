import type { AudioBaseLatencyInfo } from "../../types";

const LATENCY_SAMPLE_RATE = 44100;      // 44.1kHz standard sample rate
const LATENCY_DURATION = 0.1;           // 0.1s buffer duration
const LATENCY_CHANNELS = 1;   // Mono audio
const LATENCY_BUFFER_LENGTH = LATENCY_SAMPLE_RATE * LATENCY_DURATION; // 4410 samples total

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
    const OfflineAudioContextClass =
      (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;

    if (!OfflineAudioContextClass) {
      return "not_supported";
    }

    let offlineContext: OfflineAudioContext;
    
    try {
      offlineContext = new OfflineAudioContextClass(LATENCY_CHANNELS, LATENCY_BUFFER_LENGTH, LATENCY_SAMPLE_RATE);
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

    // audio processing chain for latency measurement
    const oscillator = offlineContext.createOscillator();
    const gainNode = offlineContext.createGain();

    // audio signal
    gainNode.gain.value = 0.01;  // Low volume to minimize processing overhead
    oscillator.type = "sine";    // sine wave (1kHz)
    oscillator.frequency.setValueAtTime(1000, offlineContext.currentTime);

    // Connect audio processing chain
    oscillator.connect(gainNode);
    gainNode.connect(offlineContext.destination);

    // Schedule audio playback for the entire buffer duration
    oscillator.start(0);
    oscillator.stop(LATENCY_DURATION);

    // Audio rendering performance
    const renderStartTime = performance.now();
    await offlineContext.startRendering();
    const renderEndTime = performance.now();
    
    // Timing metrics
    const processingTime = renderEndTime - renderStartTime; 
    
    // Formula: Processing time + Buffer duration = Total estimated latency
    const bufferDuration = (LATENCY_BUFFER_LENGTH / LATENCY_SAMPLE_RATE * 1000);  // Buffer time in milliseconds
    const estimatedLatency = Math.round((processingTime + bufferDuration) * 100) / 100;
    
    return estimatedLatency;
  } catch (error) {
    return "";
  }
}
