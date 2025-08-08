/// <reference lib="dom" />

/**
 * Audio Fingerprinting Module
 * Collects audio context fingerprint
 */

export class AudioFingerprint {
  
  /**
   * Get audio fingerprint data
   */
  public static collect(): {
    audio: string | null;
  } {
    return {
      audio: this.getAudioFingerprint()
    };
  }

  /**
   * Generate audio fingerprint
   */
  private static getAudioFingerprint(): string | null {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);
      
      gain.gain.setValueAtTime(0, context.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gain);
      gain.connect(context.destination);
      
      oscillator.start(0);
      
      const audioData = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(audioData);
      
      oscillator.stop();
      context.close();
      
      return Array.from(audioData).slice(0, 30).join(',');
    } catch (e) {
      return null;
    }
  }
}
