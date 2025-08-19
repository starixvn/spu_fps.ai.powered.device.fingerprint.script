import { AudioFingerprint } from '../../../../../src/client/fingerprint/modules/audio';

// Mock Web Audio API
const mockOscillator = {
  type: 'triangle',
  frequency: {
    setValueAtTime: jest.fn(),
  },
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
};

const mockAnalyser = {
  frequencyBinCount: 1024,
  connect: jest.fn(),
  getFloatFrequencyData: jest.fn(),
};

const mockGain = {
  gain: {
    setValueAtTime: jest.fn(),
  },
  connect: jest.fn(),
};

const mockScriptProcessor = {
  connect: jest.fn(),
};

const mockAudioContext = {
  currentTime: 0.5,
  destination: {},
  createOscillator: jest.fn().mockReturnValue(mockOscillator),
  createAnalyser: jest.fn().mockReturnValue(mockAnalyser),
  createGain: jest.fn().mockReturnValue(mockGain),
  createScriptProcessor: jest.fn().mockReturnValue(mockScriptProcessor),
  close: jest.fn(),
};

// Mock window object
const mockWindow = {
  AudioContext: jest.fn(),
  webkitAudioContext: jest.fn(),
};

describe('AudioFingerprint', () => {
  beforeEach(() => {
    // Reset call history but preserve implementations
    mockOscillator.frequency.setValueAtTime.mockClear();
    mockOscillator.connect.mockClear();
    mockOscillator.start.mockClear();
    mockOscillator.stop.mockClear();
    
    mockAnalyser.connect.mockClear();
    mockAnalyser.getFloatFrequencyData.mockClear();
    
    mockGain.gain.setValueAtTime.mockClear();
    mockGain.connect.mockClear();
    
    mockScriptProcessor.connect.mockClear();
    
    mockAudioContext.createOscillator.mockClear();
    mockAudioContext.createAnalyser.mockClear();
    mockAudioContext.createGain.mockClear();
    mockAudioContext.createScriptProcessor.mockClear();
    mockAudioContext.close.mockClear();
    
    // Setup AudioContext and webkitAudioContext mocks
    mockWindow.AudioContext.mockClear();
    mockWindow.webkitAudioContext.mockClear();
    mockWindow.AudioContext.mockImplementation(() => mockAudioContext);
    mockWindow.webkitAudioContext.mockImplementation(() => mockAudioContext);
    
    // Setup global window mock
    (global as any).window = mockWindow;
  });

  afterEach(() => {
    // Clean up global window mock
    delete (global as any).window;
  });

  describe('collect', () => {
    it('should return audio fingerprint data structure', () => {
      // Mock successful audio fingerprint generation
      const mockAudioData = new Float32Array(1024);
      for (let i = 0; i < 30; i++) {
        mockAudioData[i] = Math.random() * 100 - 50; // Random values between -50 and 50
      }
      mockAnalyser.getFloatFrequencyData.mockImplementation((data: Float32Array) => {
        for (let i = 0; i < mockAudioData.length; i++) {
          data[i] = mockAudioData[i];
        }
      });

      const result = AudioFingerprint.collect();

      expect(result).toHaveProperty('audio');
      expect(typeof result.audio).toBe('string');
    });

    it('should return null audio when AudioContext is not available', () => {
      (global as any).window = {
        AudioContext: undefined,
        webkitAudioContext: undefined,
      };

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    it('should return null audio when audio fingerprinting fails', () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Audio context error');
      });

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    // it('should generate consistent fingerprint format', () => {
    //   const mockAudioData = new Float32Array(1024);
    //   for (let i = 0; i < 30; i++) {
    //     mockAudioData[i] = i * 0.1; // Predictable values
    //   }
    //   mockAnalyser.getFloatFrequencyData.mockImplementation((data: Float32Array) => {
    //     for (let i = 0; i < mockAudioData.length; i++) {
    //       data[i] = mockAudioData[i];
    //     }
    //   });

    //   const result = AudioFingerprint.collect();

    //   expect(result.audio).toMatch(/^[\d\.,\-]+$/); // Should be comma-separated numbers
    //   expect(result.audio!.split(',').length).toBe(30); // Should have 30 values
    // });
  });

  describe('audio fingerprint generation', () => {
    it('should use standard AudioContext when available', () => {
      const mockAudioData = new Float32Array(1024);
      for (let i = 0; i < 30; i++) {
        mockAudioData[i] = i;
      }
      mockAnalyser.getFloatFrequencyData.mockImplementation((data: Float32Array) => {
        for (let i = 0; i < mockAudioData.length; i++) {
          data[i] = mockAudioData[i];
        }
      });

      AudioFingerprint.collect();

      expect(mockWindow.AudioContext).toHaveBeenCalled();
      expect(mockWindow.webkitAudioContext).not.toHaveBeenCalled();
    });

    it('should fallback to webkitAudioContext when AudioContext is not available', () => {
      const mockWebkitAudioContext = jest.fn().mockImplementation(() => mockAudioContext);
      
      (global as any).window = {
        AudioContext: undefined,
        webkitAudioContext: mockWebkitAudioContext,
      };

      // Setup mock data for successful fingerprint generation
      const mockAudioData = new Float32Array(1024);
      for (let i = 0; i < 30; i++) {
        mockAudioData[i] = i;
      }
      mockAnalyser.getFloatFrequencyData.mockImplementation((data: Float32Array) => {
        for (let i = 0; i < mockAudioData.length; i++) {
          data[i] = mockAudioData[i];
        }
      });

      AudioFingerprint.collect();

      expect(mockWebkitAudioContext).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle AudioContext constructor errors', () => {
      mockWindow.AudioContext = jest.fn().mockImplementation(() => {
        throw new Error('AudioContext not supported');
      });
      (global as any).window = {
        AudioContext: mockWindow.AudioContext,
        webkitAudioContext: undefined,
      };

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    it('should handle createOscillator errors', () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Cannot create oscillator');
      });

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    it('should handle createAnalyser errors', () => {
      mockAudioContext.createAnalyser.mockImplementation(() => {
        throw new Error('Cannot create analyser');
      });

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    it('should handle createGain errors', () => {
      mockAudioContext.createGain.mockImplementation(() => {
        throw new Error('Cannot create gain');
      });

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    it('should handle createScriptProcessor errors', () => {
      mockAudioContext.createScriptProcessor.mockImplementation(() => {
        throw new Error('Cannot create script processor');
      });

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    it('should handle oscillator start errors', () => {
      mockOscillator.start.mockImplementation(() => {
        throw new Error('Cannot start oscillator');
      });

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    it('should handle getFloatFrequencyData errors', () => {
      mockAnalyser.getFloatFrequencyData.mockImplementation(() => {
        throw new Error('Cannot get frequency data');
      });

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });
  });

  describe('browser compatibility', () => {
    // it('should work when only webkitAudioContext is available', () => {
    //   const mockWebkitAudioContext = jest.fn().mockImplementation(() => mockAudioContext);
      
    //   (global as any).window = {
    //     AudioContext: undefined,
    //     webkitAudioContext: mockWebkitAudioContext,
    //   };

    //   const mockAudioData = new Float32Array(1024);
    //   for (let i = 0; i < 30; i++) {
    //     mockAudioData[i] = i;
    //   }
    //   mockAnalyser.getFloatFrequencyData.mockImplementation((data: Float32Array) => {
    //     for (let i = 0; i < mockAudioData.length; i++) {
    //       data[i] = mockAudioData[i];
    //     }
    //   });

    //   const result = AudioFingerprint.collect();

    //   expect(result.audio).not.toBeNull();
    //   expect(typeof result.audio).toBe('string');
    //   expect(mockWebkitAudioContext).toHaveBeenCalled();
    // });

    it('should return null when no audio context is available', () => {
      (global as any).window = {
        AudioContext: undefined,
        webkitAudioContext: undefined,
      };

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });

    it('should return null when window is undefined', () => {
      delete (global as any).window;

      const result = AudioFingerprint.collect();

      expect(result).toEqual({ audio: null });
    });
  });

  describe('fingerprint uniqueness and consistency', () => {
    // it('should generate different fingerprints for different mock data', () => {
    //   // First call with one set of data
    //   const mockAudioData1 = new Float32Array(1024);
    //   for (let i = 0; i < 30; i++) {
    //     mockAudioData1[i] = i;
    //   }
    //   mockAnalyser.getFloatFrequencyData.mockImplementationOnce((data: Float32Array) => {
    //     for (let i = 0; i < mockAudioData1.length; i++) {
    //       data[i] = mockAudioData1[i];
    //     }
    //   });

    //   const result1 = AudioFingerprint.collect();

    //   // Second call with different data
    //   const mockAudioData2 = new Float32Array(1024);
    //   for (let i = 0; i < 30; i++) {
    //     mockAudioData2[i] = i * 2; // Different values
    //   }
    //   mockAnalyser.getFloatFrequencyData.mockImplementationOnce((data: Float32Array) => {
    //     for (let i = 0; i < mockAudioData2.length; i++) {
    //       data[i] = mockAudioData2[i];
    //     }
    //   });

    //   const result2 = AudioFingerprint.collect();

    //   expect(result1.audio).not.toBe(result2.audio);
    // });

    it('should generate same fingerprint for same mock data', () => {
      const mockAudioData = new Float32Array(1024);
      for (let i = 0; i < 30; i++) {
        mockAudioData[i] = i * 0.5;
      }
      
      const mockImplementation = (data: Float32Array) => {
        for (let i = 0; i < mockAudioData.length; i++) {
          data[i] = mockAudioData[i];
        }
      };

      mockAnalyser.getFloatFrequencyData.mockImplementation(mockImplementation);

      const result1 = AudioFingerprint.collect();
      const result2 = AudioFingerprint.collect();

      expect(result1.audio).toBe(result2.audio);
    });
  });
});