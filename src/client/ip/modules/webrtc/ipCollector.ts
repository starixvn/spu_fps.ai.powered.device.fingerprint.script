export interface IPCollectionResult {
    localIPs: string[];
    publicIPs: string[];
    collectionMetadata: {
        timestamp: number;
        collectionTime: number;
        methodsUsed: string[];
        totalIPs: number;
        successRate: number;
        webrtcSupported: boolean;
    };
}

// Add mobile-specific timeouts for problematic browsers
const MOBILE_BROWSER_TIMEOUTS = {
    MiBrowser: {
        OFFER_TIMEOUT: 2000, // Longer timeout for MiBrowser
        FAST_EXIT: 1500, // Slightly longer fast exit
        FULL_TIMEOUT: 5000, // Longer full timeout
    },
    UCBrowser: {
        OFFER_TIMEOUT: 2000,
        FAST_EXIT: 1500,
        FULL_TIMEOUT: 5000,
    },
    default: {
        OFFER_TIMEOUT: 1200,
        FAST_EXIT: 1000,
        FULL_TIMEOUT: 3000,
    },
};

function getBrowserTimeouts() {
    const browser = getBrowserInfo();
    return (
        MOBILE_BROWSER_TIMEOUTS[
            browser as keyof typeof MOBILE_BROWSER_TIMEOUTS
        ] || MOBILE_BROWSER_TIMEOUTS.default
    );
}

let ipCache: IPCollectionResult | null = null;
const CACHE_TTL = 2 * 60 * 1000; // 2 mins cache

const HYBRID_CONFIG = {
    STUN_SERVERS: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun.services.mozilla.com:3478',
    ],
    FAST_EXIT_MS: 1000, // early exit ~1s
    FULL_TIMEOUT_MS: 3000, // max wait relay
    ICE_CANDIDATE_POOL_SIZE: 10,
    METHODS: ['single_pc_all_servers'],
};

const IP_RE =
    /([0-9]{1,3}(?:\.[0-9]{1,3}){3}|([a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4})/i;

export async function collectAllIPTypes(): Promise<IPCollectionResult> {
    if (
        ipCache &&
        Date.now() - ipCache.collectionMetadata.timestamp < CACHE_TTL
    ) {
        return ipCache;
    }

    try {
        const result = await collectAllIPTypes1PC();
        ipCache = result;
        return result;
    } catch (error) {
        throw error;
    }
}

async function collectAllIPTypes1PC(): Promise<IPCollectionResult> {
    const start = performance.now();
    const localIPs = new Set<string>();
    const publicIPs = new Set<string>();
    const seen = new Set<string>();

    // Setup ICE servers
    const iceServers: RTCIceServer[] = [
        ...HYBRID_CONFIG.STUN_SERVERS.map((url) => ({ urls: url })),
    ];

    // Create RTCPeerConnection - critical checkpoint
    let pc: RTCPeerConnection | null = null;
    try {
        pc = new RTCPeerConnection({
            iceServers,
            iceCandidatePoolSize: HYBRID_CONFIG.ICE_CANDIDATE_POOL_SIZE,
        });
    } catch (error) {
        return emptyResult(
            performance.now() - start,
            ['webrtc_ctor_error'],
            true
        );
    }

    const buildResult = (label: string) => {
        const filter = (set: Set<string>) => [...set].filter((ip) => true);

        const l = filter(localIPs);
        const p = filter(publicIPs);
        const total = l.length + p.length;
        const collectionTime = performance.now() - start;

        return {
            localIPs: l,
            publicIPs: p,
            collectionMetadata: {
                timestamp: Date.now(),
                collectionTime,
                methodsUsed: ['single_pc_all_servers', label],
                totalIPs: total,
                successRate: total > 0 ? 100 : 0,
                webrtcSupported: true,
            },
        };
    };

    // ICE candidate handler
    let candidateCount = 0;

    pc.onicecandidate = (ev) => {
        if (ev.candidate === null) {
            return;
        }

        const cand = ev.candidate?.candidate;
        if (!cand || seen.has(cand)) return;
        seen.add(cand);
        candidateCount++;

        const m = cand.match(IP_RE);
        if (!m?.[1]) return;

        const ip = m[1].trim();
        console.log('Found candidate:', cand, 'IP:', ip);
        const candLower = cand.toLowerCase();

        if (candLower.includes('typ srflx')) publicIPs.add(ip);
        else if (candLower.includes('typ host')) localIPs.add(ip);
        else {
            isPrivateOrInvalidIP(ip) ? localIPs.add(ip) : publicIPs.add(ip);
        }
    };

    const timeouts = getBrowserTimeouts();

    // Create offer
    const setupOffer = Promise.race([
        (async () => {
            pc.createDataChannel('singlePC');
            const offer = await pc.createOffer({ iceRestart: true });
            await pc.setLocalDescription(offer);
            return true;
        })(),
        new Promise<boolean>((_, reject) => {
            setTimeout(() => {
                reject(new Error('offer_timeout'));
            }, timeouts.OFFER_TIMEOUT);
        }),
    ]);

    try {
        await setupOffer;
    } catch (error) {
        try {
            pc.close();
        } catch {}
        return emptyResult(performance.now() - start, ['offer_failed'], true);
    }

    // Result collection with timeouts
    const fullResultPromise = new Promise<IPCollectionResult>((resolve) => {
        const cleanup = (label: string) => {
            clearTimeout(fullTimer);
            if (pc && pc.connectionState !== 'closed') {
                try {
                    pc.close();
                } catch {}
            }
            resolve(buildResult(label));
        };

        // Override to catch ICE completion
        pc.onicegatheringstatechange = () => {
            const state = pc?.iceGatheringState;
            if (state === 'complete') {
                setTimeout(() => cleanup('complete'), 50);
            }
        };

        const fullTimer = setTimeout(() => {
            cleanup('timeout');
        }, timeouts.FULL_TIMEOUT);
    });

    return fullResultPromise;
}

function emptyResult(
    collectionTime: number,
    methodsUsed: string[],
    webrtcSupported: boolean
): IPCollectionResult {
    return {
        localIPs: [],
        publicIPs: [],
        collectionMetadata: {
            timestamp: Date.now(),
            collectionTime,
            methodsUsed,
            totalIPs: 0,
            successRate: 0,
            webrtcSupported,
        },
    };
}

function getBrowserInfo(): string {
    if (typeof window === 'undefined' || !window.navigator) return 'unknown';
    const ua = window.navigator.userAgent;

    if (ua.includes('MiBrowser')) return 'MiBrowser';
    if (ua.includes('UCBrowser')) return 'UCBrowser';
    if (ua.includes('UC/')) return 'UCBrowser';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';

    return 'unknown';
}

function isPrivateOrInvalidIP(ip: string): boolean {
    if (!ip) return true;

    const v = ip.trim();
    const invalid = new Set(['0.0.0.0', '127.0.0.1', '::1', 'localhost']);

    if (invalid.has(v)) return true;
    if (v.includes(':')) {
        const low = v.toLowerCase();
        return (
            low.startsWith('fe80:') ||
            low.startsWith('fc00:') ||
            low.startsWith('fd00:')
        );
    }

    const parts = v.split('.').map((n) => Number(n));

    if (parts.length !== 4 || parts.some(isNaN)) return true;

    const [a, b] = parts;
    return (
        a === 10 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a === 127 ||
        a === 0 ||
        (a === 169 && b === 254)
    );
}

export function cleanupIPCache(): void {
    ipCache = null;
}

// Global error handlers for debugging hangs
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanupIPCache);
    window.addEventListener('pagehide', cleanupIPCache);
}
