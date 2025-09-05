interface IPCollectionResult {
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
  collectionMetadata: {
    timestamp: number;
    collectionTime: number;
    methodsUsed: string[];
    totalIPs: number;
    successRate: number;
  };
}

let ipCache: IPCollectionResult | null = null;
const CACHE_TTL = 2 * 60 * 1000;

const IP_COLLECTION_CONFIG = {
  STUN_SERVERS: [
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun2.l.google.com:19302",
    "stun:stun3.l.google.com:19302",
    "stun:stun4.l.google.com:19302",
    "stun:stun.ekiga.net",
    "stun:stun.fwdnet.net",
    "stun:stun.ideasip.com",
    "stun:stun.iptel.org",
    "stun:stun.rixtelecom.se",
    "stun:stun.schlund.de",
    "stun:stun.stunprotocol.org:3478",
    "stun:stun.voiparound.com",
    "stun:stun.voipbuster.com",
    "stun:stun.voipstunt.com",
    "stun:stun.counterpath.com",
    "stun:stun.1und1.de",
    "stun:stun.gmx.net",
    "stun:stun.callwithus.com",
    "stun:stun.counterpath.net",
    "stun:stun.internetcalls.com"
  ],
  
  TURN_SERVERS: [
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:80?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    }
  ],
  
  COLLECTION_METHODS: [
    "webrtc_standard",
    "webrtc_aggressive", 
    "webrtc_multiple_connections",
    "webrtc_different_configs",
    "webrtc_extended_timeout"
  ]
};

export async function collectAllIPTypes(timeout: number = 3000): Promise<IPCollectionResult> {
  try {
    if (shouldUseCache()) {
      return ipCache!;
    }

    const startTime = performance.now();
    const result = await collectIPsComprehensively(timeout);
    const endTime = performance.now();
    const collectionTime = endTime - startTime;
    
    const metadata = {
      timestamp: Date.now(),
      collectionTime,
      methodsUsed: IP_COLLECTION_CONFIG.COLLECTION_METHODS,
      totalIPs: result.localIPs.length + result.publicIPs.length + result.relayIPs.length,
      successRate: calculateSuccessRate(result)
    };
    
    const finalResult: IPCollectionResult = {
      ...result,
      collectionMetadata: metadata
    };
    
    ipCache = finalResult;
    return finalResult;
  } catch (error) {
    return {
      localIPs: [],
      publicIPs: [],
      relayIPs: [],
      collectionMetadata: {
        timestamp: Date.now(),
        collectionTime: 0,
        methodsUsed: [],
        totalIPs: 0,
        successRate: 0
      }
    };
  }
}

function shouldUseCache(): boolean {
  return ipCache !== null && 
         (Date.now() - ipCache.collectionMetadata.timestamp) < CACHE_TTL;
}

async function collectIPsComprehensively(timeout: number): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
}> {
  const allLocalIPs = new Set<string>();
  const allPublicIPs = new Set<string>();
  const allRelayIPs = new Set<string>();

  const methods = [
    collectWithStandardWebRTC(timeout),
    collectWithAggressiveWebRTC(timeout),
    collectWithMultipleConnections(timeout),
    collectWithDifferentConfigs(timeout),
    collectWithExtendedTimeout(timeout * 1.5)
  ];

  const results = await Promise.allSettled(methods);
  
  results.forEach((promiseResult) => {
    if (promiseResult.status === 'fulfilled') {
      const result = promiseResult.value;
      if (result) {
        result.localIPs.forEach(ip => allLocalIPs.add(ip));
        result.publicIPs.forEach(ip => allPublicIPs.add(ip));
        result.relayIPs.forEach(ip => allRelayIPs.add(ip));
      }
    }
  });

  return {
    localIPs: [...allLocalIPs],
    publicIPs: [...allPublicIPs],
    relayIPs: [...allRelayIPs]
  };
}

async function collectWithStandardWebRTC(timeout: number): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
} | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve(null);
        return;
      }

      const localIPs = new Set<string>();
      const publicIPs = new Set<string>();
      const relayIPs = new Set<string>();

      const iceServers: RTCIceServer[] = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ];

      const pc = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10
      });

      pc.createDataChannel("", { ordered: true });

      const cleanupAndResolve = () => {
        pc.close();
        clearTimeout(timeoutId);
        resolve({
          localIPs: [...localIPs],
          publicIPs: [...publicIPs],
          relayIPs: [...relayIPs]
        });
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          cleanupAndResolve();
          return;
        }

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        );

        if (ipMatch?.[1]) {
          const ip = ipMatch[1];

          if (candidate.includes("typ host")) {
            localIPs.add(ip);
          } else if (candidate.includes("typ srflx")) {
            publicIPs.add(ip);
          } else if (candidate.includes("typ relay") || candidate.includes("typ prflx")) {
            relayIPs.add(ip);
          } else {
            if (isPrivateOrInvalidIP(ip)) {
              localIPs.add(ip);
            } else {
              publicIPs.add(ip);
            }
          }
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          cleanupAndResolve();
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => {
          pc.close();
          clearTimeout(timeoutId);
          resolve(null);
        });

      const timeoutId = setTimeout(() => {
        cleanupAndResolve();
      }, timeout);
    } catch (error) {
      resolve(null);
    }
  });
}

async function collectWithAggressiveWebRTC(timeout: number): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
} | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve(null);
        return;
      }

      const localIPs = new Set<string>();
      const publicIPs = new Set<string>();
      const relayIPs = new Set<string>();

      const iceServers: RTCIceServer[] = [
        ...IP_COLLECTION_CONFIG.STUN_SERVERS.map(url => ({ urls: url })),
        ...IP_COLLECTION_CONFIG.TURN_SERVERS
      ];

      const pc = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 25,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });

      pc.createDataChannel("channel1", { ordered: true });
      pc.createDataChannel("channel2", { ordered: false });
      pc.createDataChannel("channel3", { ordered: true, maxRetransmits: 3 });

      const cleanupAndResolve = () => {
        pc.close();
        clearTimeout(timeoutId);
        resolve({
          localIPs: [...localIPs],
          publicIPs: [...publicIPs],
          relayIPs: [...relayIPs]
        });
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          cleanupAndResolve();
          return;
        }

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        );

        if (ipMatch?.[1]) {
          const ip = ipMatch[1];

          if (candidate.includes("typ host")) {
            localIPs.add(ip);
          } else if (candidate.includes("typ srflx")) {
            publicIPs.add(ip);
          } else if (candidate.includes("typ relay") || candidate.includes("typ prflx")) {
            relayIPs.add(ip);
          } else {
            if (isPrivateOrInvalidIP(ip)) {
              localIPs.add(ip);
            } else {
              publicIPs.add(ip);
            }
          }
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          cleanupAndResolve();
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => {
          pc.close();
          clearTimeout(timeoutId);
          resolve(null);
        });

      const timeoutId = setTimeout(() => {
        cleanupAndResolve();
      }, timeout);
    } catch (error) {
      resolve(null);
    }
  });
}

async function collectWithMultipleConnections(timeout: number): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
} | null> {
  const localIPs = new Set<string>();
  const publicIPs = new Set<string>();
  const relayIPs = new Set<string>();

  const connections = Array.from({ length: 5 }, (_, i) => 
    createSingleConnection(timeout + i * 500)
  );

  const results = await Promise.allSettled(connections);
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      result.value.localIPs.forEach(ip => localIPs.add(ip));
      result.value.publicIPs.forEach(ip => publicIPs.add(ip));
      result.value.relayIPs.forEach(ip => relayIPs.add(ip));
    }
  });

  return {
    localIPs: [...localIPs],
    publicIPs: [...publicIPs],
    relayIPs: [...relayIPs]
  };
}

async function collectWithDifferentConfigs(timeout: number): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
} | null> {
  const localIPs = new Set<string>();
  const publicIPs = new Set<string>();
  const relayIPs = new Set<string>();

  const configs = [
    { iceCandidatePoolSize: 10, iceTransportPolicy: 'all' as RTCIceTransportPolicy },
    { iceCandidatePoolSize: 20, iceTransportPolicy: 'relay' as RTCIceTransportPolicy },
    { iceCandidatePoolSize: 15, iceTransportPolicy: 'all' as RTCIceTransportPolicy },
    { iceCandidatePoolSize: 25, iceTransportPolicy: 'all' as RTCIceTransportPolicy }
  ];

  const promises = configs.map(config => 
    createConnectionWithConfig(config, timeout)
  );

  const results = await Promise.allSettled(promises);
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      result.value.localIPs.forEach(ip => localIPs.add(ip));
      result.value.publicIPs.forEach(ip => publicIPs.add(ip));
      result.value.relayIPs.forEach(ip => relayIPs.add(ip));
    }
  });

  return {
    localIPs: [...localIPs],
    publicIPs: [...publicIPs],
    relayIPs: [...relayIPs]
  };
}

async function collectWithExtendedTimeout(timeout: number): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
} | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve(null);
        return;
      }

      const localIPs = new Set<string>();
      const publicIPs = new Set<string>();
      const relayIPs = new Set<string>();

      const iceServers: RTCIceServer[] = [
        ...IP_COLLECTION_CONFIG.STUN_SERVERS.map(url => ({ urls: url })),
        ...IP_COLLECTION_CONFIG.TURN_SERVERS
      ];

      const pc = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 30,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });

      for (let i = 0; i < 5; i++) {
        pc.createDataChannel(`channel${i}`, { 
          ordered: i % 2 === 0,
          maxRetransmits: i % 3
        });
      }

      const cleanupAndResolve = () => {
        pc.close();
        clearTimeout(timeoutId);
        resolve({
          localIPs: [...localIPs],
          publicIPs: [...publicIPs],
          relayIPs: [...relayIPs]
        });
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          cleanupAndResolve();
          return;
        }

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        );

        if (ipMatch?.[1]) {
          const ip = ipMatch[1];

          if (candidate.includes("typ host")) {
            localIPs.add(ip);
          } else if (candidate.includes("typ srflx")) {
            publicIPs.add(ip);
          } else if (candidate.includes("typ relay") || candidate.includes("typ prflx")) {
            relayIPs.add(ip);
          } else {
            if (isPrivateOrInvalidIP(ip)) {
              localIPs.add(ip);
            } else {
              publicIPs.add(ip);
            }
          }
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          cleanupAndResolve();
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => {
          pc.close();
          clearTimeout(timeoutId);
          resolve(null);
        });

      const timeoutId = setTimeout(() => {
        cleanupAndResolve();
      }, timeout);
    } catch (error) {
      resolve(null);
    }
  });
}

async function createSingleConnection(timeout: number): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
} | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve(null);
        return;
      }

      const localIPs = new Set<string>();
      const publicIPs = new Set<string>();
      const relayIPs = new Set<string>();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ],
        iceCandidatePoolSize: 10
      });

      pc.createDataChannel("", { ordered: true });

      const cleanupAndResolve = () => {
        pc.close();
        clearTimeout(timeoutId);
        resolve({
          localIPs: [...localIPs],
          publicIPs: [...publicIPs],
          relayIPs: [...relayIPs]
        });
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          cleanupAndResolve();
          return;
        }

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        );

        if (ipMatch?.[1]) {
          const ip = ipMatch[1];

          if (candidate.includes("typ host")) {
            localIPs.add(ip);
          } else if (candidate.includes("typ srflx")) {
            publicIPs.add(ip);
          } else if (candidate.includes("typ relay") || candidate.includes("typ prflx")) {
            relayIPs.add(ip);
          } else {
            if (isPrivateOrInvalidIP(ip)) {
              localIPs.add(ip);
            } else {
              publicIPs.add(ip);
            }
          }
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          cleanupAndResolve();
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => {
          pc.close();
          clearTimeout(timeoutId);
          resolve(null);
        });

      const timeoutId = setTimeout(() => {
        cleanupAndResolve();
      }, timeout);
    } catch (error) {
      resolve(null);
    }
  });
}

async function createConnectionWithConfig(config: any, timeout: number): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
} | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve(null);
        return;
      }

      const localIPs = new Set<string>();
      const publicIPs = new Set<string>();
      const relayIPs = new Set<string>();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          }
        ],
        iceCandidatePoolSize: config.iceCandidatePoolSize,
        iceTransportPolicy: config.iceTransportPolicy
      });

      pc.createDataChannel("", { ordered: true });

      const cleanupAndResolve = () => {
        pc.close();
        clearTimeout(timeoutId);
        resolve({
          localIPs: [...localIPs],
          publicIPs: [...publicIPs],
          relayIPs: [...relayIPs]
        });
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          cleanupAndResolve();
          return;
        }

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        );

        if (ipMatch?.[1]) {
          const ip = ipMatch[1];

          if (candidate.includes("typ host")) {
            localIPs.add(ip);
          } else if (candidate.includes("typ srflx")) {
            publicIPs.add(ip);
          } else if (candidate.includes("typ relay") || candidate.includes("typ prflx")) {
            relayIPs.add(ip);
          } else {
            if (isPrivateOrInvalidIP(ip)) {
              localIPs.add(ip);
            } else {
              publicIPs.add(ip);
            }
          }
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          cleanupAndResolve();
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => {
          pc.close();
          clearTimeout(timeoutId);
          resolve(null);
        });

      const timeoutId = setTimeout(() => {
        cleanupAndResolve();
      }, timeout);
    } catch (error) {
      resolve(null);
    }
  });
}

function isPrivateOrInvalidIP(ip: string): boolean {
  if (!ip) return true;

  const invalidIPs = new Set([
    "0.0.0.0",
    "127.0.0.1",
    "::1",
    "localhost",
  ]);

  if (invalidIPs.has(ip)) return true;

  if (ip.includes(":")) {
    return (
      ip.startsWith("fe80:") ||
      ip.startsWith("fc00:") ||
      ip.startsWith("fd00:")
    );
  }

  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return true;

  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127 ||
    parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254)
  );
}

function calculateSuccessRate(result: any): number {
  const totalMethods = IP_COLLECTION_CONFIG.COLLECTION_METHODS.length;
  const successfulMethods = result.localIPs.length + result.publicIPs.length + result.relayIPs.length > 0 ? 1 : 0;
  return (successfulMethods / totalMethods) * 100;
}

export function cleanupIPCache(): void {
  ipCache = null;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupIPCache);
  window.addEventListener('pagehide', cleanupIPCache);
}