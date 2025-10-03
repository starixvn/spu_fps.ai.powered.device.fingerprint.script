import { WebRTCFingerprint } from '../../../../../../src/client/ip/modules/webrtc/index';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';
import * as ipCollector from '../../../../../../src/client/ip/modules/webrtc/ipCollector';

// Mock collectAllIPTypes
const mockCollectAllIPTypes = jest.spyOn(ipCollector, 'collectAllIPTypes');

// Mock WebRTC APIs
Object.defineProperty(global, 'window', {
  value: {
    RTCPeerConnection: jest.fn(),
    RTCSessionDescription: jest.fn(),
    RTCIceCandidate: jest.fn(),
  },
  writable: true,
});

describe('WebRTCFingerprint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementation
    mockCollectAllIPTypes.mockReset();
  });

  describe('collect', () => {
    it('should return UNDEFINED when WebRTC is not supported', async () => {
      // Arrange - Mock WebRTC not available
      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: undefined,
          RTCSessionDescription: jest.fn(),
          RTCIceCandidate: jest.fn(),
        },
        writable: true,
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return UNDEFINED when RTCSessionDescription is not available', async () => {
      // Arrange - Mock partial WebRTC support
      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: jest.fn(),
          RTCSessionDescription: undefined,
          RTCIceCandidate: jest.fn(),
        },
        writable: true,
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return UNDEFINED when RTCIceCandidate is not available', async () => {
      // Arrange - Mock partial WebRTC support
      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: jest.fn(),
          RTCSessionDescription: jest.fn(),
          RTCIceCandidate: undefined,
        },
        writable: true,
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return ERROR when collectAllIPTypes throws', async () => {
      // Arrange - Mock WebRTC supported but collectAllIPTypes throws
      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: jest.fn(),
          RTCSessionDescription: jest.fn(),
          RTCIceCandidate: jest.fn(),
        },
        writable: true,
      });

      mockCollectAllIPTypes.mockRejectedValue(new Error('Collection failed'));

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should return formatted string when collection succeeds with arrays', async () => {
      // Arrange - Mock WebRTC supported and successful collection
      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: jest.fn(),
          RTCSessionDescription: jest.fn(),
          RTCIceCandidate: jest.fn(),
        },
        writable: true,
      });

      mockCollectAllIPTypes.mockResolvedValue({
        localIPs: ['192.168.1.100', '10.0.0.1'],
        publicIPs: ['203.0.113.1', '203.0.113.2'],
        collectionMetadata: {
          timestamp: Date.now(),
          collectionTime: 1000,
          methodsUsed: ['single_pc_all_servers'],
          totalIPs: 4,
          successRate: 100,
          webrtcSupported: true,
        },
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe('192.168.1.100,10.0.0.1;203.0.113.1,203.0.113.2');
    });

    it('should return formatted string with empty arrays', async () => {
      // Arrange - Mock WebRTC supported but no IPs found
      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: jest.fn(),
          RTCSessionDescription: jest.fn(),
          RTCIceCandidate: jest.fn(),
        },
        writable: true,
      });

      mockCollectAllIPTypes.mockResolvedValue({
        localIPs: [],
        publicIPs: [],
        collectionMetadata: {
          timestamp: Date.now(),
          collectionTime: 1000,
          methodsUsed: ['single_pc_all_servers'],
          totalIPs: 0,
          successRate: 0,
          webrtcSupported: true,
        },
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe(';');
    });

    it('should handle special values in IP collections', async () => {
      // Arrange - Mock WebRTC supported but collection returns special values
      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: jest.fn(),
          RTCSessionDescription: jest.fn(),
          RTCIceCandidate: jest.fn(),
        },
        writable: true,
      });

      mockCollectAllIPTypes.mockResolvedValue({
        localIPs: FingerprintSpecialValue.ERROR,
        publicIPs: FingerprintSpecialValue.TIMEOUT,
        collectionMetadata: {
          timestamp: Date.now(),
          collectionTime: 1000,
          methodsUsed: ['single_pc_all_servers'],
          totalIPs: 0,
          successRate: 0,
          webrtcSupported: true,
        },
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe(`${FingerprintSpecialValue.ERROR};${FingerprintSpecialValue.TIMEOUT}`);
    });

    it('should handle mixed arrays and special values', async () => {
      // Arrange - Mock mixed results
      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: jest.fn(),
          RTCSessionDescription: jest.fn(),
          RTCIceCandidate: jest.fn(),
        },
        writable: true,
      });

      mockCollectAllIPTypes.mockResolvedValue({
        localIPs: ['192.168.1.100'],
        publicIPs: FingerprintSpecialValue.ERROR,
        collectionMetadata: {
          timestamp: Date.now(),
          collectionTime: 1000,
          methodsUsed: ['single_pc_all_servers'],
          totalIPs: 1,
          successRate: 50,
          webrtcSupported: true,
        },
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe(`192.168.1.100;${FingerprintSpecialValue.ERROR}`);
    });

    it('should handle window undefined (Node.js environment)', async () => {
      // Arrange - Mock window undefined
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);

      // Cleanup
      if (originalWindow) {
        global.window = originalWindow;
      }
    });

    it('should handle navigator undefined', async () => {
      // Arrange - Mock navigator undefined but WebRTC supported
      const originalNavigator = global.navigator;
      // @ts-ignore
      delete global.navigator;

      Object.defineProperty(global, 'window', {
        value: {
          RTCPeerConnection: jest.fn(),
          RTCSessionDescription: jest.fn(),
          RTCIceCandidate: jest.fn(),
        },
        writable: true,
      });

      // Mock successful collection since WebRTC is supported
      mockCollectAllIPTypes.mockResolvedValue({
        localIPs: ['192.168.1.100'],
        publicIPs: ['203.0.113.1'],
        collectionMetadata: {
          timestamp: Date.now(),
          collectionTime: 1000,
          methodsUsed: ['single_pc_all_servers'],
          totalIPs: 2,
          successRate: 100,
          webrtcSupported: true,
        },
      });

      // Act
      const result = await WebRTCFingerprint.collect();

      // Assert - Should work normally since WebRTC is supported
      expect(result).toBe('192.168.1.100;203.0.113.1');

      // Cleanup
      if (originalNavigator) {
        global.navigator = originalNavigator;
      }
    });
  });
});
