import { collectAllIPTypes, cleanupIPCache } from '../../../../../../src/client/ip/modules/webrtc/ipCollector';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock RTCPeerConnection
const mockRTCPeerConnection = jest.fn();
const mockRTCIceCandidate = jest.fn();
const mockRTCSessionDescription = jest.fn();

// Mock WebRTC APIs
Object.defineProperty(global, 'RTCPeerConnection', {
  value: mockRTCPeerConnection,
  writable: true,
});

Object.defineProperty(global, 'RTCIceCandidate', {
  value: mockRTCIceCandidate,
  writable: true,
});

Object.defineProperty(global, 'RTCSessionDescription', {
  value: mockRTCSessionDescription,
  writable: true,
});

// Mock performance
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
  writable: true,
});

describe('IP Collector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanupIPCache();
    
    // Reset mocks
    mockRTCPeerConnection.mockClear();
    mockRTCIceCandidate.mockClear();
    mockRTCSessionDescription.mockClear();
    
    // Reset global mocks
    Object.defineProperty(global, 'RTCPeerConnection', {
      value: mockRTCPeerConnection,
      writable: true,
    });
    Object.defineProperty(global, 'RTCIceCandidate', {
      value: mockRTCIceCandidate,
      writable: true,
    });
    Object.defineProperty(global, 'RTCSessionDescription', {
      value: mockRTCSessionDescription,
      writable: true,
    });
  });

  describe('collectAllIPTypes', () => {
    it('should return ERROR when WebRTC is not supported', async () => {
      // Arrange - Mock WebRTC not available
      Object.defineProperty(global, 'RTCPeerConnection', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = await collectAllIPTypes();

      // Assert
      expect(result.localIPs).toBe(FingerprintSpecialValue.ERROR);
      expect(result.publicIPs).toBe(FingerprintSpecialValue.ERROR);
      expect(result.collectionMetadata.webrtcSupported).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should return ERROR when RTCPeerConnection constructor fails', async () => {
      // Arrange - Mock RTCPeerConnection constructor to throw
      mockRTCPeerConnection.mockImplementation(() => {
        throw new Error('WebRTC not supported');
      });

      // Act
      const result = await collectAllIPTypes();

      // Assert
      expect(result.localIPs).toBe(FingerprintSpecialValue.ERROR);
      expect(result.publicIPs).toBe(FingerprintSpecialValue.ERROR);
      expect(result.collectionMetadata.webrtcSupported).toBe(FingerprintSpecialValue.ERROR);
      expect(result.collectionMetadata.methodsUsed).toContain('webrtc_ctor_error');
    });

    it('should return ERROR when createOffer fails', async () => {
      // Arrange - Mock successful RTCPeerConnection but failed offer
      const mockPC = {
        createDataChannel: jest.fn(),
        createOffer: jest.fn().mockRejectedValue(new Error('Offer failed')),
        setLocalDescription: jest.fn(),
        close: jest.fn(),
        connectionState: 'new',
        iceGatheringState: 'new',
        onicecandidate: null as any,
        onicegatheringstatechange: null as any,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPC);

      // Act
      const result = await collectAllIPTypes();

      // Assert
      expect(result.localIPs).toBe(FingerprintSpecialValue.ERROR);
      expect(result.publicIPs).toBe(FingerprintSpecialValue.ERROR);
      expect(result.collectionMetadata.webrtcSupported).toBe(FingerprintSpecialValue.ERROR);
      expect(result.collectionMetadata.methodsUsed).toContain('offer_failed');
    });

    it('should return successful result with collected IPs', async () => {
      // Arrange - Mock successful WebRTC flow
      const mockPC = {
        createDataChannel: jest.fn(),
        createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        connectionState: 'new',
        iceGatheringState: 'complete',
        onicecandidate: null as any,
        onicegatheringstatechange: null as any,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPC);

      // Mock ICE candidates
      const mockCandidates = [
        { candidate: 'candidate:1 1 UDP 2113667326 192.168.1.100 54400 typ host' },
        { candidate: 'candidate:2 1 UDP 1694498814 203.0.113.1 54400 typ srflx' },
        { candidate: 'candidate:3 1 UDP 1694498815 203.0.113.2 54400 typ srflx' },
      ];

      // Simulate ICE candidate events
      setTimeout(() => {
        if (mockPC.onicecandidate) {
          mockCandidates.forEach(candidate => {
            mockPC.onicecandidate!({ candidate });
          });
          // Signal completion
          mockPC.onicecandidate!({ candidate: null });
        }
      }, 100);

      // Act
      const result = await collectAllIPTypes();

      // Assert
      expect(Array.isArray(result.localIPs)).toBe(true);
      expect(Array.isArray(result.publicIPs)).toBe(true);
      expect(result.collectionMetadata.webrtcSupported).toBe(true);
      expect(result.collectionMetadata.methodsUsed).toContain('single_pc_all_servers');
    });

    it('should handle timeout correctly', async () => {
      // Arrange - Mock slow WebRTC flow
      const mockPC = {
        createDataChannel: jest.fn(),
        createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        connectionState: 'new',
        iceGatheringState: 'gathering',
        onicecandidate: null as any,
        onicegatheringstatechange: null as any,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPC);

      // Act
      const result = await collectAllIPTypes();

      // Assert - Should return result after timeout
      expect(result).toBeDefined();
      expect(result.collectionMetadata.webrtcSupported).toBe(true);
    });

    it('should cache results correctly', async () => {
      // Arrange - Mock successful WebRTC flow
      const mockPC = {
        createDataChannel: jest.fn(),
        createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        connectionState: 'new',
        iceGatheringState: 'complete',
        onicecandidate: null as any,
        onicegatheringstatechange: null as any,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPC);

      // Act - Call twice
      const result1 = await collectAllIPTypes();
      const result2 = await collectAllIPTypes();

      // Assert - Should use cache on second call
      expect(result1).toBe(result2);
      expect(mockRTCPeerConnection).toHaveBeenCalledTimes(1);
    });

    it('should handle different browser timeouts', async () => {
      // Arrange - Mock MiBrowser user agent
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Linux; Android 10; Mi Browser)',
        },
        writable: true,
      });

      const mockPC = {
        createDataChannel: jest.fn(),
        createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        connectionState: 'new',
        iceGatheringState: 'complete',
        onicecandidate: null as any,
        onicegatheringstatechange: null as any,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPC);

      // Act
      const result = await collectAllIPTypes();

      // Assert
      expect(result).toBeDefined();
      expect(result.collectionMetadata.webrtcSupported).toBe(true);
    });

    it('should classify IPs correctly', async () => {
      // Arrange - Mock WebRTC with specific candidates
      const mockPC = {
        createDataChannel: jest.fn(),
        createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        connectionState: 'new',
        iceGatheringState: 'complete',
        onicecandidate: null as any,
        onicegatheringstatechange: null as any,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPC);

      // Mock different types of ICE candidates
      const mockCandidates = [
        { candidate: 'candidate:1 1 UDP 2113667326 192.168.1.100 54400 typ host' }, // Local
        { candidate: 'candidate:2 1 UDP 1694498814 203.0.113.1 54400 typ srflx' }, // Public
        { candidate: 'candidate:3 1 UDP 1694498815 10.0.0.1 54400 typ host' }, // Private
        { candidate: 'candidate:4 1 UDP 1694498816 203.0.113.2 54400 typ srflx' }, // Public
      ];

      setTimeout(() => {
        if (mockPC.onicecandidate) {
          mockCandidates.forEach(candidate => {
            mockPC.onicecandidate!({ candidate });
          });
          mockPC.onicecandidate!({ candidate: null });
        }
      }, 100);

      // Act
      const result = await collectAllIPTypes();

      // Assert
      expect(Array.isArray(result.localIPs)).toBe(true);
      expect(Array.isArray(result.publicIPs)).toBe(true);
      
      if (Array.isArray(result.localIPs)) {
        expect(result.localIPs).toContain('192.168.1.100');
        expect(result.localIPs).toContain('10.0.0.1');
      }
      
      if (Array.isArray(result.publicIPs)) {
        expect(result.publicIPs).toContain('203.0.113.1');
        expect(result.publicIPs).toContain('203.0.113.2');
      }
    });

    it('should handle empty ICE candidates', async () => {
      // Arrange - Mock WebRTC with no candidates
      const mockPC = {
        createDataChannel: jest.fn(),
        createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        connectionState: 'new',
        iceGatheringState: 'complete',
        onicecandidate: null as any,
        onicegatheringstatechange: null as any,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPC);

      // No ICE candidates will be generated

      // Act
      const result = await collectAllIPTypes();

      // Assert
      expect(Array.isArray(result.localIPs)).toBe(true);
      expect(Array.isArray(result.publicIPs)).toBe(true);
      expect(result.localIPs).toHaveLength(0);
      expect(result.publicIPs).toHaveLength(0);
      expect(result.collectionMetadata.totalIPs).toBe(0);
    });
  });

  describe('cleanupIPCache', () => {
    it('should clear the IP cache', async () => {
      // Arrange - First call to populate cache
      const mockPC = {
        createDataChannel: jest.fn(),
        createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        connectionState: 'new',
        iceGatheringState: 'complete',
        onicecandidate: null as any,
        onicegatheringstatechange: null as any,
      };

      mockRTCPeerConnection.mockImplementation(() => mockPC);

      const result1 = await collectAllIPTypes();
      
      // Act - Clear cache
      cleanupIPCache();
      
      // Mock different result for second call
      const result2 = await collectAllIPTypes();

      // Assert - Should not use cache
      expect(mockRTCPeerConnection).toHaveBeenCalledTimes(2);
    });
  });
});
