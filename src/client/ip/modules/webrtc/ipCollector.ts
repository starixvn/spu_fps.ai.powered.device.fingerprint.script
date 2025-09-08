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

const IP_COLLECTION_CONFIG_OPT = {
  STUN_SERVERS: [
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun.ekiga.net"
  ],
  
  TURN_SERVERS: [
    {
      urls: "turn:openrelay.metered.ca:443",
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
    return ip.startsWith("fe80:") || ip.startsWith("fc00:") || ip.startsWith("fd00:");
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

function createPeerConnection(
  iceServers: RTCIceServer[],
  timeout: number,
  poolSize = 10
): Promise<{ localIPs: string[]; publicIPs: string[]; relayIPs: string[] }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.RTCPeerConnection)
      return resolve({ localIPs: [], publicIPs: [], relayIPs: [] });

    const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: poolSize });
    const localIPs = new Set<string>();
    const publicIPs = new Set<string>();
    const relayIPs = new Set<string>();

    const cleanup = () => {
      pc.close();
      clearTimeout(timeoutId);
      resolve({ localIPs: [...localIPs], publicIPs: [...publicIPs], relayIPs: [...relayIPs] });
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      const candidate = event.candidate.candidate;
      const ipMatch = candidate.match(
        /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
      );
      if (!ipMatch?.[1]) return;
      const ip = ipMatch[1];

      if (candidate.includes("typ host")) localIPs.add(ip);
      else if (candidate.includes("typ srflx")) publicIPs.add(ip);
      else if (candidate.includes("typ relay") || candidate.includes("typ prflx")) relayIPs.add(ip);
      else {
        if (isPrivateOrInvalidIP(ip)) localIPs.add(ip);
        else publicIPs.add(ip);
      }
    };

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") cleanup();
    };

    pc.createDataChannel("channel");
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => cleanup());

    const timeoutId = setTimeout(cleanup, timeout);
  });
}

async function collectWithStandardWebRTC(timeout: number) {
  return createPeerConnection(
    [
      { urls: IP_COLLECTION_CONFIG_OPT.STUN_SERVERS[0] },
      {
        urls: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].urls,
        username: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].username,
        credential: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].credential
      }
    ],
    timeout,
    10
  );
}

async function collectWithAggressiveWebRTC(timeout: number) {
  return createPeerConnection(
    [
      ...IP_COLLECTION_CONFIG_OPT.STUN_SERVERS.map(url => ({ urls: url })),
      ...IP_COLLECTION_CONFIG_OPT.TURN_SERVERS
    ],
    timeout,
    15
  );
}

async function collectWithMultipleConnections(timeout: number) {
  const promises = Array.from({ length: 3 }, (_, i) =>
    createPeerConnection(
      [
        { urls: IP_COLLECTION_CONFIG_OPT.STUN_SERVERS[0] },
        {
          urls: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].urls,
          username: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].username,
          credential: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].credential
        }
      ],
      timeout + i * 500,
      10
    )
  );

  const results = await Promise.all(promises);
  const localIPs = new Set<string>();
  const publicIPs = new Set<string>();
  const relayIPs = new Set<string>();
  results.forEach(r => { r.localIPs.forEach(ip => localIPs.add(ip)); r.publicIPs.forEach(ip => publicIPs.add(ip)); r.relayIPs.forEach(ip => relayIPs.add(ip)); });
  return { localIPs: [...localIPs], publicIPs: [...publicIPs], relayIPs: [...relayIPs] };
}

async function collectWithDifferentConfigs(timeout: number) {
  const poolSizes = [10, 15, 20];
  const promises = poolSizes.map(size =>
    createPeerConnection(
      [
        { urls: IP_COLLECTION_CONFIG_OPT.STUN_SERVERS[0] },
        {
          urls: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].urls,
          username: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].username,
          credential: IP_COLLECTION_CONFIG_OPT.TURN_SERVERS[0].credential
        }
      ],
      timeout,
      size
    )
  );

  const results = await Promise.all(promises);
  const localIPs = new Set<string>();
  const publicIPs = new Set<string>();
  const relayIPs = new Set<string>();
  results.forEach(r => { r.localIPs.forEach(ip => localIPs.add(ip)); r.publicIPs.forEach(ip => publicIPs.add(ip)); r.relayIPs.forEach(ip => relayIPs.add(ip)); });
  return { localIPs: [...localIPs], publicIPs: [...publicIPs], relayIPs: [...relayIPs] };
}

async function collectWithExtendedTimeout(timeout: number) {
  return createPeerConnection(
    [
      ...IP_COLLECTION_CONFIG_OPT.STUN_SERVERS.map(url => ({ urls: url })),
      ...IP_COLLECTION_CONFIG_OPT.TURN_SERVERS
    ],
    timeout * 1.5,
    15
  );
}

export async function collectAllIPTypes(timeout: number = 3000): Promise<IPCollectionResult> {
  try {
    if (ipCache && (Date.now() - ipCache.collectionMetadata.timestamp) < CACHE_TTL) {
      return ipCache;
    }

    const startTime = performance.now();

    const results = await Promise.allSettled([
      collectWithStandardWebRTC(timeout),
      collectWithAggressiveWebRTC(timeout),
      collectWithMultipleConnections(timeout),
      collectWithDifferentConfigs(timeout),
      collectWithExtendedTimeout(timeout)
    ]);

    const localIPs = new Set<string>();
    const publicIPs = new Set<string>();
    const relayIPs = new Set<string>();

    results.forEach(res => {
      if (res.status === "fulfilled" && res.value) {
        res.value.localIPs.forEach(ip => localIPs.add(ip));
        res.value.publicIPs.forEach(ip => publicIPs.add(ip));
        res.value.relayIPs.forEach(ip => relayIPs.add(ip));
      }
    });

    const collectionTime = performance.now() - startTime;

    const finalResult: IPCollectionResult = {
      localIPs: [...localIPs],
      publicIPs: [...publicIPs],
      relayIPs: [...relayIPs],
      collectionMetadata: {
        timestamp: Date.now(),
        collectionTime,
        methodsUsed: IP_COLLECTION_CONFIG_OPT.COLLECTION_METHODS,
        totalIPs: localIPs.size + publicIPs.size + relayIPs.size,
        successRate: (localIPs.size + publicIPs.size + relayIPs.size > 0 ? 100 : 0)
      }
    };

    ipCache = finalResult;
    return finalResult;
  } catch {
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

export function cleanupIPCache(): void {
  ipCache = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanupIPCache);
  window.addEventListener("pagehide", cleanupIPCache);
}
