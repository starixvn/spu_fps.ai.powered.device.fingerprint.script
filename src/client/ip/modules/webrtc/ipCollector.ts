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

// Simple DOM Logger cho mobile debugging
class VisualLogger {
  private static instance: VisualLogger;
  private logs: string[] = [];
  private maxLogs = 20;
  private logElement: HTMLElement | null = null;

  static getInstance(): VisualLogger {
    if (!VisualLogger.instance) {
      VisualLogger.instance = new VisualLogger();
    }
    return VisualLogger.instance;
  }

  private createLogElement(): void {
    if (typeof window === "undefined" || this.logElement) return;

    // Tạo element đơn giản inject vào page
    this.logElement = document.createElement('div');
    this.logElement.id = 'webrtc-debug-logs';
    this.logElement.style.cssText = `
      background: #000 !important;
      color: #0f0 !important;
      font-family: monospace !important;
      font-size: 11px !important;
      padding: 10px !important;
      margin: 10px 0 !important;
      border: 2px solid #0f0 !important;
      border-radius: 5px !important;
      white-space: pre-wrap !important;
      word-break: break-word !important;
      max-height: 300px !important;
      overflow-y: auto !important;
    `;

    // Thêm vào đầu body hoặc sau element đầu tiên
    try {
      if (document.body.firstChild) {
        document.body.insertBefore(this.logElement, document.body.firstChild);
      } else {
        document.body.appendChild(this.logElement);
      }
    } catch (error) {
      console.error('Failed to inject debug element:', error);
    }
  }

  log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    
    // Console log
    console.log(`[WebRTC-Debug] ${logMessage}`);
    
    // Add to logs array
    this.logs.push(logMessage);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Inject vào DOM
    if (typeof window !== "undefined") {
      if (!this.logElement) {
        this.createLogElement();
      }
      
      if (this.logElement) {
        this.logElement.textContent = this.logs.join('\n');
        this.logElement.scrollTop = this.logElement.scrollHeight;
      }
    }
  }

  error(message: string): void {
    this.log(`❌ ${message}`);
  }

  warn(message: string): void {
    this.log(`⚠️ ${message}`);
  }

  info(message: string): void {
    this.log(`ℹ️ ${message}`);
  }

  success(message: string): void {
    this.log(`✅ ${message}`);
  }

  clear(): void {
    this.logs = [];
    if (this.logElement) {
      this.logElement.textContent = '';
    }
  }

  getLogs() {
    return [...this.logs];
  }
}

const logger = VisualLogger.getInstance();

// Export logger for external access/control
export const debugLogger = logger;

// Global access for debugging
if (typeof window !== "undefined") {
  (window as any).webrtcDebugLogger = logger;
}

// Add mobile-specific timeouts for problematic browsers
const MOBILE_BROWSER_TIMEOUTS = {
  MiBrowser: {
    OFFER_TIMEOUT: 2000,    // Longer timeout for MiBrowser
    FAST_EXIT: 1500,        // Slightly longer fast exit
    FULL_TIMEOUT: 5000      // Longer full timeout
  },
  UCBrowser: {
    OFFER_TIMEOUT: 2000,
    FAST_EXIT: 1500,
    FULL_TIMEOUT: 5000
  },
  default: {
    OFFER_TIMEOUT: 1200,
    FAST_EXIT: 1000,
    FULL_TIMEOUT: 3000
  }
};

function getBrowserTimeouts() {
  const browser = getBrowserInfo();
  return MOBILE_BROWSER_TIMEOUTS[browser as keyof typeof MOBILE_BROWSER_TIMEOUTS] || MOBILE_BROWSER_TIMEOUTS.default;
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
  logger.info("🚀 Starting WebRTC IP collection");
  
  if (ipCache && Date.now() - ipCache.collectionMetadata.timestamp < CACHE_TTL) {
    return ipCache;
  }

  try {
    const result = await collectAllIPTypes1PC();
    ipCache = result;
    logger.success(`✅ Completed: ${result.collectionMetadata.totalIPs} IPs in ${result.collectionMetadata.collectionTime.toFixed(2)}ms`);
    return result;
  } catch (error) {
    logger.error(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

async function collectAllIPTypes1PC(): Promise<IPCollectionResult> {
  const start = performance.now();

  // Check WebRTC support
  if (!isWebRTCSupported()) {
    logger.error("❌ WebRTC not supported");
    return emptyResult(performance.now() - start, ["fallback_no_webrtc"], false);
  }

  const localIPs = new Set<string>();
  const publicIPs = new Set<string>();
  const relayIPs = new Set<string>();
  const seen = new Set<string>();

  // Setup ICE servers
  const iceServers: RTCIceServer[] = [
    ...HYBRID_CONFIG.STUN_SERVERS.map(url => ({ urls: url })),
    ...HYBRID_CONFIG.TURN_SERVERS
  ];

  // Create RTCPeerConnection - critical checkpoint
  let pc: RTCPeerConnection | null = null;
  logger.info("🔌 Creating RTCPeerConnection...");
  try {
    pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: HYBRID_CONFIG.ICE_CANDIDATE_POOL_SIZE
    });
    logger.info("✅ RTCPeerConnection created");
  } catch (error) {
    logger.error(`❌ RTCPeerConnection failed: ${error instanceof Error ? error.message : String(error)}`);
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
  let candidateCount = 0;
  let firstCandidateReceived = false;
  
  pc.onicecandidate = (ev) => {
    if (ev.candidate === null) {
      logger.info("🏁 ICE gathering complete");
      return;
    }

    if (!firstCandidateReceived) {
      logger.info("🧊 First ICE candidate received");
      firstCandidateReceived = true;
    }

    const cand = ev.candidate?.candidate;
    if (!cand || seen.has(cand)) return;
    seen.add(cand);
    candidateCount++;

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

    // Only log progress at milestones
    if (candidateCount === 1 || candidateCount % 5 === 0) {
      logger.info(`📊 ${candidateCount} candidates, L:${localIPs.size} P:${publicIPs.size} R:${relayIPs.size}`);
    }
  };

  // Critical state monitoring - only log state changes
  pc.onicegatheringstatechange = () => {
    logger.info(`❄️ ICE state: ${pc?.iceGatheringState}`);
  };

  // Get browser-specific timeouts
  const timeouts = getBrowserTimeouts();

  // Create offer 
  logger.info("📄 Creating offer...");
  const setupOffer = Promise.race([
    (async () => {
      pc.createDataChannel("singlePC");
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      logger.info("✅ Offer setup complete");
      return true;
    })(),
    new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        logger.error(`⏰ Offer timeout (${timeouts.OFFER_TIMEOUT}ms)`);
        reject(new Error("offer_timeout"));
      }, timeouts.OFFER_TIMEOUT);
    })
  ]);

  try {
    await setupOffer;
  } catch (error) {
    logger.error(`❌ Offer failed: ${error instanceof Error ? error.message : String(error)}`);
    try { pc.close(); } catch {}
    return emptyResult(performance.now() - start, ["offer_failed"], true);
  }

  // Result collection with timeouts
  logger.info(`⏳ Waiting for ICE candidates (${timeouts.FULL_TIMEOUT}ms max)...`);
  
  const fullResultPromise = new Promise<IPCollectionResult>((resolve) => {
    const cleanup = (label: string) => {
      clearTimeout(fullTimer);
      if (pc && pc.connectionState !== "closed") {
        try { 
          pc.close(); 
        } catch {}
      }
      resolve(buildResult(label));
    };

    // Override to catch ICE completion
    pc.onicegatheringstatechange = () => {
      const state = pc?.iceGatheringState;
      logger.info(`❄️ ICE state: ${state}`);
      if (state === "complete") {
        logger.info("🏁 ICE complete");
        setTimeout(() => cleanup("complete"), 50);
      }
    };

    const fullTimer = setTimeout(() => {
      logger.warn(`⏰ Timeout reached (${timeouts.FULL_TIMEOUT}ms)`);
      cleanup("timeout");
    }, timeouts.FULL_TIMEOUT);
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

function getBrowserInfo(): string {
  if (typeof window === "undefined" || !window.navigator) return "unknown";
  const ua = window.navigator.userAgent;
  
  if (ua.includes("MiBrowser")) return "MiBrowser";
  if (ua.includes("UCBrowser")) return "UCBrowser";
  if (ua.includes("UC/")) return "UCBrowser";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  
  return "unknown";
}

function isWebRTCSupported(): boolean {
  const supported = typeof window !== "undefined" && "RTCPeerConnection" in window;
  const browser = getBrowserInfo();
  
  // Critical info for debugging hang on mobile browsers
  logger.info(`🌐 ${browser} - WebRTC: ${supported ? "✅" : "❌"}`);
  
  // Log user agent for problematic browsers only
  if (browser === "MiBrowser" || browser === "UCBrowser") {
    const ua = typeof window !== "undefined" ? window.navigator?.userAgent || "unknown" : "server";
    logger.info(`🔍 UA: ${ua.substring(0, 80)}...`);
  }
  
  return supported;
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

// Global error handlers for debugging hangs
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanupIPCache);
  window.addEventListener("pagehide", cleanupIPCache);

  // Critical error handlers for mobile debugging
  window.addEventListener("error", (event) => {
    logger.error(`🚨 Error: ${event.message}`);
  });

  window.addEventListener("unhandledrejection", (event) => {
    logger.error(`🚨 Promise rejected: ${event.reason}`);
  });
}
