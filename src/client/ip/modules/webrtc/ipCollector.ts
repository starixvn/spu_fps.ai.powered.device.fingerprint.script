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
    webrtcSupported: boolean;
  };
}

let ipCache: IPCollectionResult | null = null;
const CACHE_TTL = 2 * 60 * 1000; // 2 mins cache

const HYBRID_CONFIG = {
  STUN_SERVERS: [
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun.services.mozilla.com:3478"
  ],
  TURN_SERVERS: [
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ],
  FAST_EXIT_MS: 1000,       // early exit ~1s
  FULL_TIMEOUT_MS: 3000,    // max wait relay
  ICE_CANDIDATE_POOL_SIZE: 10,
  METHODS: ["single_pc_all_servers"]
};

const IP_RE = /([0-9]{1,3}(?:\.[0-9]{1,3}){3}|([a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4})/i;

export async function collectAllIPTypes(): Promise<IPCollectionResult> {
  if (ipCache && Date.now() - ipCache.collectionMetadata.timestamp < CACHE_TTL) {
    return ipCache;
  }

  const result = await collectAllIPTypes1PC();
  ipCache = result;
  return result;
}

async function collectAllIPTypes1PC(): Promise<IPCollectionResult> {
  const start = performance.now();

  if (!isWebRTCSupported()) {
    return emptyResult(performance.now() - start, ["fallback_no_webrtc"], false);
  }

  const localIPs = new Set<string>();
  const publicIPs = new Set<string>();
  const relayIPs = new Set<string>();
  const seen = new Set<string>();

  const iceServers: RTCIceServer[] = [
    ...HYBRID_CONFIG.STUN_SERVERS.map(url => ({ urls: url })),
    ...HYBRID_CONFIG.TURN_SERVERS
  ];

  let pc: RTCPeerConnection | null = null;
  try {
    pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: HYBRID_CONFIG.ICE_CANDIDATE_POOL_SIZE
    });
  } catch {
    return emptyResult(performance.now() - start, ["webrtc_ctor_error"], true);
  }

  const buildResult = (label: string) => {
    const filter = (set: Set<string>) =>
      [...set].filter(ip => !isPrivateOrInvalidIP(ip));

    const l = filter(localIPs);
    const p = filter(publicIPs);
    const r = filter(relayIPs);
    const total = l.length + p.length + r.length;
    const collectionTime = performance.now() - start;

    console.log(`[IP-Collector] ${label}: ${total} IPs collected in ${collectionTime.toFixed(2)}ms (L:${l.length}, P:${p.length}, R:${r.length})`);

    return {
      localIPs: l,
      publicIPs: p,
      relayIPs: r,
      collectionMetadata: {
        timestamp: Date.now(),
        collectionTime,
        methodsUsed: ["single_pc_all_servers", label],
        totalIPs: total,
        successRate: total > 0 ? 100 : 0,
        webrtcSupported: true
      }
    };
  };

  // ICE candidate handler
  pc.onicecandidate = (ev) => {
    const cand = ev.candidate?.candidate;
    if (!cand || seen.has(cand)) return;
    seen.add(cand);

    const m = cand.match(IP_RE);
    if (!m?.[1]) return;
    const ip = m[1].trim();
    const candLower = cand.toLowerCase();

    if (candLower.includes("typ relay")) relayIPs.add(ip);
    else if (candLower.includes("typ srflx")) publicIPs.add(ip);
    else if (candLower.includes("typ host")) localIPs.add(ip);
    else {
      isPrivateOrInvalidIP(ip) ? localIPs.add(ip) : publicIPs.add(ip);
    }
  };

  // prevent hanging
  const setupOffer = Promise.race([
    (async () => {
      pc.createDataChannel("singlePC");
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      return true;
    })(),
    new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("offer_timeout")), 1200)
    )
  ]);

  try {
    await setupOffer;
  } catch {
    try { pc.close(); } catch {}
    return emptyResult(performance.now() - start, ["offer_failed"], true);
  }

  // FastResult (~1s snapshot)
  const fastResultPromise = new Promise<IPCollectionResult>((resolve) => {
    const finish = (label: string) => {
      clearTimeout(fastTimer);
      clearInterval(checker);
      resolve(buildResult(label));
    };

    const checker = setInterval(() => {
      if (localIPs.size && publicIPs.size) {
        finish("fast-exit");
      }
    }, 50);

    const fastTimer = setTimeout(() => {
      finish("fast-exit");
    }, HYBRID_CONFIG.FAST_EXIT_MS);
  });

  // FullResult (~3s max)
  const fullResultPromise = new Promise<IPCollectionResult>((resolve) => {
    const cleanup = (label: string) => {
      clearTimeout(fullTimer);
      if (pc && pc.connectionState !== "closed") {
        try { pc.close(); } catch {}
      }
      resolve(buildResult(label));
    };

    pc.onicegatheringstatechange = () => {
      if (pc?.iceGatheringState === "complete") {
        setTimeout(() => cleanup("full"), 50);
      }
    };

    const fullTimer = setTimeout(() => {
      cleanup("full");
    }, HYBRID_CONFIG.FULL_TIMEOUT_MS);
  });

  fastResultPromise.then(res => {
    console.log("[IP-Collector] fastResult ready:", res.collectionMetadata.collectionTime.toFixed(2), "ms");
  });

  return fullResultPromise;
}

function emptyResult(collectionTime: number, methodsUsed: string[], webrtcSupported: boolean): IPCollectionResult {
  return {
    localIPs: [],
    publicIPs: [],
    relayIPs: [],
    collectionMetadata: {
      timestamp: Date.now(),
      collectionTime,
      methodsUsed,
      totalIPs: 0,
      successRate: 0,
      webrtcSupported
    }
  };
}

function isWebRTCSupported(): boolean {
  return typeof window !== "undefined" && "RTCPeerConnection" in window;
}

function isPrivateOrInvalidIP(ip: string): boolean {
  if (!ip) return true;
  const v = ip.trim();
  const invalid = new Set(["0.0.0.0", "127.0.0.1", "::1", "localhost"]);
  if (invalid.has(v)) return true;
  if (v.includes(":")) {
    const low = v.toLowerCase();
    return low.startsWith("fe80:") || low.startsWith("fc00:") || low.startsWith("fd00:");
  }
  const parts = v.split(".").map(n => Number(n));
  if (parts.length !== 4 || parts.some(isNaN)) return true;
  const [a, b] = parts;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 127 || a === 0 || (a === 169 && b === 254);
}

export function cleanupIPCache(): void {
  ipCache = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanupIPCache);
  window.addEventListener("pagehide", cleanupIPCache);
}
