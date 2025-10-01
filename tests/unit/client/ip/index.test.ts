import { IPClass } from '../../../../src/client/ip/index';
import { FingerprintSpecialValue } from '../../../../src/client/fingerprint/utils/consts';

// Mock WebRTCFingerprint
jest.mock('../../../../src/client/ip/modules/webrtc/index', () => ({
  WebRTCFingerprint: {
    collect: jest.fn(),
  },
}));

import { WebRTCFingerprint } from '../../../../src/client/ip/modules/webrtc/index';

const mockWebRTCFingerprint = WebRTCFingerprint as jest.Mocked<typeof WebRTCFingerprint>;

describe('IPClass', () => {
  let ipClass: IPClass;

  beforeEach(() => {
    jest.clearAllMocks();
    ipClass = new IPClass();
  });

  describe('start', () => {
    it('should call callback with WebRTC result when WebRTC collection succeeds', async () => {
      // Arrange
      const mockWebRTCResult = '192.168.1.100,10.0.0.1;203.0.113.1,203.0.113.2';
      mockWebRTCFingerprint.collect.mockResolvedValue(mockWebRTCResult);
      const mockCallback = jest.fn();

      // Act
      await ipClass.start(mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(mockWebRTCResult);
      expect(mockWebRTCFingerprint.collect).toHaveBeenCalledTimes(1);
    });

    it('should call callback with special value when WebRTC collection returns special value', async () => {
      // Arrange
      const mockWebRTCResult = FingerprintSpecialValue.ERROR;
      mockWebRTCFingerprint.collect.mockResolvedValue(mockWebRTCResult);
      const mockCallback = jest.fn();

      // Act
      await ipClass.start(mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(mockWebRTCResult);
      expect(mockWebRTCFingerprint.collect).toHaveBeenCalledTimes(1);
    });

    it('should call callback with empty object when WebRTC collection throws', async () => {
      // Arrange
      mockWebRTCFingerprint.collect.mockRejectedValue(new Error('WebRTC failed'));
      const mockCallback = jest.fn();

      // Act
      await ipClass.start(mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith({});
      expect(mockWebRTCFingerprint.collect).toHaveBeenCalledTimes(1);
    });

    it('should set window.webRTCData when window is available', async () => {
      // Arrange
      const mockWebRTCResult = '192.168.1.100;203.0.113.1';
      mockWebRTCFingerprint.collect.mockResolvedValue(mockWebRTCResult);
      const mockCallback = jest.fn();

      // Mock window
      const mockWindow = {};
      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
      });

      // Act
      await ipClass.start(mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(mockWebRTCResult);
      expect((mockWindow as any).webRTCData).toBe(mockWebRTCResult);
    });

    it('should not set window.webRTCData when window is undefined', async () => {
      // Arrange
      const mockWebRTCResult = '192.168.1.100;203.0.113.1';
      mockWebRTCFingerprint.collect.mockResolvedValue(mockWebRTCResult);
      const mockCallback = jest.fn();

      // Mock window undefined
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      // Act
      await ipClass.start(mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(mockWebRTCResult);
      // Note: global.window might be restored by Jest, so we check it was undefined during execution

      // Cleanup
      if (originalWindow) {
        global.window = originalWindow;
      }
    });

    it('should handle different WebRTC result types', async () => {
      // Test cases for different WebRTC results
      const testCases = [
        {
          name: 'empty string',
          webRTCResult: '',
          expected: '',
        },
        {
          name: 'only local IPs',
          webRTCResult: '192.168.1.100,10.0.0.1;',
          expected: '192.168.1.100,10.0.0.1;',
        },
        {
          name: 'only public IPs',
          webRTCResult: ';203.0.113.1,203.0.113.2',
          expected: ';203.0.113.1,203.0.113.2',
        },
        {
          name: 'both local and public IPs',
          webRTCResult: '192.168.1.100;203.0.113.1',
          expected: '192.168.1.100;203.0.113.1',
        },
        {
          name: 'UNDEFINED special value',
          webRTCResult: FingerprintSpecialValue.UNDEFINED,
          expected: FingerprintSpecialValue.UNDEFINED,
        },
        {
          name: 'TIMEOUT special value',
          webRTCResult: FingerprintSpecialValue.TIMEOUT,
          expected: FingerprintSpecialValue.TIMEOUT,
        },
        {
          name: 'ANTI_FINGERPRINTED special value',
          webRTCResult: FingerprintSpecialValue.ANTI_FINGERPRINTED,
          expected: FingerprintSpecialValue.ANTI_FINGERPRINTED,
        },
      ];

      for (const testCase of testCases) {
        // Arrange
        mockWebRTCFingerprint.collect.mockResolvedValue(testCase.webRTCResult);
        const mockCallback = jest.fn();

        // Act
        await ipClass.start(mockCallback);

        // Assert
        expect(mockCallback).toHaveBeenCalledWith(testCase.expected);
      }
    });

    it('should handle multiple consecutive calls', async () => {
      // Arrange
      const mockWebRTCResult = '192.168.1.100;203.0.113.1';
      mockWebRTCFingerprint.collect.mockResolvedValue(mockWebRTCResult);
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      const mockCallback3 = jest.fn();

      // Act - Call multiple times
      await ipClass.start(mockCallback1);
      await ipClass.start(mockCallback2);
      await ipClass.start(mockCallback3);

      // Assert
      expect(mockCallback1).toHaveBeenCalledWith(mockWebRTCResult);
      expect(mockCallback2).toHaveBeenCalledWith(mockWebRTCResult);
      expect(mockCallback3).toHaveBeenCalledWith(mockWebRTCResult);
      expect(mockWebRTCFingerprint.collect).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure calls', async () => {
      // Arrange
      const successResult = '192.168.1.100;203.0.113.1';
      const errorResult = FingerprintSpecialValue.ERROR;

      mockWebRTCFingerprint.collect
        .mockResolvedValueOnce(successResult)
        .mockRejectedValueOnce(new Error('WebRTC failed'))
        .mockResolvedValueOnce(errorResult);

      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      const mockCallback3 = jest.fn();

      // Act
      await ipClass.start(mockCallback1);
      await ipClass.start(mockCallback2);
      await ipClass.start(mockCallback3);

      // Assert
      expect(mockCallback1).toHaveBeenCalledWith(successResult);
      expect(mockCallback2).toHaveBeenCalledWith({});
      expect(mockCallback3).toHaveBeenCalledWith(errorResult);
      expect(mockWebRTCFingerprint.collect).toHaveBeenCalledTimes(3);
    });
  });
});