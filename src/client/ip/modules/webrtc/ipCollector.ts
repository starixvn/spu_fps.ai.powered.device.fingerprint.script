export interface IPCollectionResult {
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
const CACHE_TTL = 2 * 60 * 1000; // Cache valid for 2 minutes

const HYBRID_CONFIG = {
  STUN_SERVERS: [
    "stun:stun.l.google.com:19302",        // Google primary (fastest response)
    "stun:stun1.l.google.com:19302",       // Google secondary
    "stun:stun.services.mozilla.com:3478"  // Mozilla alternative
  ],
  
  TURN_SERVERS: [
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ],
  
  FAST_PATH_MS: 300,        
  FULL_TIMEOUT_MS: 1000,    
  ICE_CANDIDATE_POOL_SIZE: 10,  
  METHODS: ["parallel_fastpath_stun_turn"]
};


// IPv4 and IPv6 address extraction
const IP_RE = /([0-9]{1,3}(?:\.[0-9]{1,3}){3}|([a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4})/i;

function isPrivateOrInvalidIP(ip: string): boolean {
  if (!ip) return true;
  
  const v = ip.trim();
  
  const invalid = new Set(["0.0.0.0", "127.0.0.1", "::1", "localhost"]);
  if (invalid.has(v)) return true;
  
  // IPv6 private ranges
  if (v.includes(":")) {
    const low = v.toLowerCase();
    return low.startsWith("fe80:") || low.startsWith("fc00:") || low.startsWith("fd00:");
  }
  
  // IPv4 private range 
  const parts = v.split(".").map(n => Number(n));
  if (parts.length !== 4 || parts.some(isNaN)) return true;
  
  const [a, b] = parts;
  return (
    a === 10 ||                               // Class A private (10.0.0.0/8)
    (a === 172 && b >= 16 && b <= 31) ||      // Class B private (172.16.0.0/12)
    (a === 192 && b === 168) ||               // Class C private (192.168.0.0/16)
    a === 127 ||                              // Loopback (127.0.0.0/8)
    a === 0 ||                                // This network (0.0.0.0/8)
    (a === 169 && b === 254)                  // Link-local (169.254.0.0/16)
  );
}

function createPC(iceServers: RTCIceServer[], timeoutMs: number): Promise<{
  localIPs: Set<string>;
  publicIPs: Set<string>;
  relayIPs: Set<string>;
}> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("RTCPeerConnection" in window)) {
      return resolve({
        localIPs: new Set(),
        publicIPs: new Set(),
        relayIPs: new Set()
      });
    }

    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: HYBRID_CONFIG.ICE_CANDIDATE_POOL_SIZE
    });

    // IP collection sets
    const localIPs = new Set<string>();
    const publicIPs = new Set<string>();
    const relayIPs = new Set<string>();
    const seen = new Set<string>(); // duplicate 

    const cleanup = () => {
      try {
        pc.close();
      } catch (e) {
      }
      clearTimeout(timeoutId);
      resolve({ localIPs, publicIPs, relayIPs });
    };

    // Process incoming ICE candidates and extract IP addresses
    pc.onicecandidate = (ev) => {
      try {
        const cand = ev.candidate?.candidate;
        if (!cand || seen.has(cand)) return;
        seen.add(cand);

        // Extract IP address from candidate string
        const m = cand.match(IP_RE);
        if (!m || !m[1]) return;
        const ip = m[1];
        const candidateLower = cand.toLowerCase();

        // Classify IP based on ICE candidate type
        if (candidateLower.includes("typ host") || isPrivateOrInvalidIP(ip)) {
          localIPs.add(ip);   
        } else if (candidateLower.includes("typ srflx")) {
          publicIPs.add(ip);  
        } else if (candidateLower.includes("typ relay") || candidateLower.includes("typ prflx")) {
          relayIPs.add(ip);    
        } else {
          if (isPrivateOrInvalidIP(ip)) {
            localIPs.add(ip);
          } else {
            publicIPs.add(ip);
          }
        }
      } catch (e) {
      }
    };

    // Handle ICE gathering completion
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") {
        setTimeout(cleanup, 100); 
      }
    };

    // Initialize WebRTC connection to trigger ICE gathering
    try {
      pc.createDataChannel("parallel"); 
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => cleanup());
    } catch (e) {
      cleanup();
    }

    const timeoutId = setTimeout(cleanup, timeoutMs);
  });
}

export async function collectAllIPTypesParallel(): Promise<{
  fastResult: IPCollectionResult;
  fullResult: Promise<IPCollectionResult>;
}> {
  const start = performance.now();
  
  const globalLocal = new Set<string>();
  const globalPublic = new Set<string>();
  const globalRelay = new Set<string>();

  // Create server configurations for parallel connections
  const servers: RTCIceServer[][] = HYBRID_CONFIG.STUN_SERVERS.map((stun) => {
    const serverConfig: RTCIceServer[] = [{ urls: stun }]; // STUN server
    if (HYBRID_CONFIG.TURN_SERVERS.length) {
      serverConfig.push(HYBRID_CONFIG.TURN_SERVERS[0]); // TURN server
    }
    return serverConfig;
  });

  // Launch peer connections in parallel (non-blocking)
  const pcPromises = servers.map((iceConfig) =>
    createPC(iceConfig, HYBRID_CONFIG.FULL_TIMEOUT_MS).then(
      ({ localIPs, publicIPs, relayIPs }) => {
        localIPs.forEach((ip) => globalLocal.add(ip));
        publicIPs.forEach((ip) => globalPublic.add(ip));
        relayIPs.forEach((ip) => globalRelay.add(ip));
      }
    ).catch(() => {
    })
  );

  const buildResult = (label: string): IPCollectionResult => {
    // Filter out invalid/unwanted IP addresses
    const filter = (ipSet: Set<string>) =>
      [...ipSet].filter(
        (ip) =>
          ip &&
          !["0.0.0.0", "127.0.0.1", "::1"].includes(ip.trim())
      );
      
    const localIPs = filter(globalLocal);
    const publicIPs = filter(globalPublic);
    const relayIPs = filter(globalRelay);
    const totalIPs = localIPs.length + publicIPs.length + relayIPs.length;
    const collectionTime = performance.now() - start;
    
    console.log(`[IP-Collector] ${label}: ${totalIPs} IPs collected in ${collectionTime.toFixed(2)}ms (L:${localIPs.length}, P:${publicIPs.length}, R:${relayIPs.length})`);
    
    return {
      localIPs,
      publicIPs,
      relayIPs,
      collectionMetadata: {
        timestamp: Date.now(),
        collectionTime,
        methodsUsed: [label, ...HYBRID_CONFIG.METHODS],
        totalIPs,
        successRate: totalIPs > 0 ? 100 : 0
      }
    };
  };

  // Resolves after 300ms timeout OR immediately when first public IP is discovered
  const fastResult: IPCollectionResult = await new Promise((resolve) => {
    const fastTimer = setTimeout(() => {
      clearInterval(checker);
      resolve(buildResult("fast-path"));
    }, HYBRID_CONFIG.FAST_PATH_MS);

    // Check every 50ms for public IP discovery
    const checker = setInterval(() => {
      if (globalPublic.size >= 1) {
        clearTimeout(fastTimer);
        clearInterval(checker);
        resolve(buildResult("fast-path"));
      }
    }, 50);
  });

  // Waits for all peer connections to complete for maximum IP discovery
  const fullResult = (async () => {
    await Promise.allSettled(pcPromises);
    return buildResult("full-path");
  })();

  return { fastResult, fullResult };
}

export async function collectAllIPTypes(timeout: number = HYBRID_CONFIG.FULL_TIMEOUT_MS): Promise<IPCollectionResult> {
  // Return cached results if still valid
  if (ipCache && (Date.now() - ipCache.collectionMetadata.timestamp) < CACHE_TTL) {
    return ipCache;
  }

  const { fastResult, fullResult } = await collectAllIPTypesParallel();
  
  const result = await fullResult;
  
  ipCache = result;
  
  return result;
}


export function cleanupIPCache(): void {
  ipCache = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanupIPCache);
  window.addEventListener("pagehide", cleanupIPCache);
}
