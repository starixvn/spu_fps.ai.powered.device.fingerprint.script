export async function collectAllIPTypes(timeout: number = 2000): Promise<{
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
}> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve({ localIPs: [], publicIPs: [], relayIPs: [] });
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
      ];

      const pc = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10,
      });

      pc.createDataChannel("", { ordered: true });

      const isPrivateOrInvalidIP = (ip: string): boolean => {
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
      };

      const cleanupAndResolve = () => {
        pc.close();
        clearTimeout(timeoutId);
        resolve({
          localIPs: [...localIPs].filter((ip) => ip && !["0.0.0.0", "127.0.0.1", "::1", "localhost"].includes(ip)),
          publicIPs: [...publicIPs].filter((ip) => !isPrivateOrInvalidIP(ip)),
          relayIPs: [...relayIPs].filter((ip) => ip && !["0.0.0.0", "127.0.0.1", "::1", "localhost"].includes(ip)),
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
            // Local/Host IPs
            localIPs.add(ip);
          } else if (candidate.includes("typ srflx")) {
            // Server reflexive IPs (Public IPs from STUN)
            publicIPs.add(ip);
          } else if (candidate.includes("typ relay") || candidate.includes("typ prflx")) {
            // Relay IPs from TURN servers
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

      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) {
          cleanupAndResolve();
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
          resolve({ localIPs: [], publicIPs: [], relayIPs: [] });
        });

      const timeoutId = setTimeout(() => {
        if (pc.iceGatheringState !== "complete") {
          cleanupAndResolve();
        }
      }, timeout);
    } catch (error) {
      resolve({ localIPs: [], publicIPs: [], relayIPs: [] });
    }
  });
}
