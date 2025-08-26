export async function collectPublicIPs(): Promise<string[]> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve([]);
        return;
      }

      const publicIPs = new Set<string>();

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

      const filterValidIPs = (ips: Set<string>): string[] => {
        return [...ips].filter((ip) => !isPrivateOrInvalidIP(ip));
      };

      const stunServers: RTCIceServer[] = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ];

      const pc = new RTCPeerConnection({
        iceServers: stunServers,
        iceCandidatePoolSize: 10,
      });

      pc.createDataChannel("", { ordered: true });

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          pc.close();
          clearTimeout(timeoutId);
          resolve(filterValidIPs(publicIPs));
          return;
        }

        const ipMatch = event.candidate.candidate.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        );

        if (ipMatch?.[1]) {
          publicIPs.add(ipMatch[1]);
        }
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) {
          pc.close();
          clearTimeout(timeoutId);
          resolve(filterValidIPs(publicIPs));
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => {
          console.error("❌ Error creating WebRTC offer:", error);
          pc.close();
          clearTimeout(timeoutId);
          resolve([]);
        });

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          pc.close();
          clearTimeout(timeoutId);
          resolve(filterValidIPs(publicIPs));
        }
      };

      const timeoutId = setTimeout(() => {
        if (pc.iceGatheringState !== "complete") {
          pc.close();
          resolve(filterValidIPs(publicIPs));
        }
      }, 2000);
    } catch (error) {
      console.error("❌ Error in collectPublicIPs:", error);
      resolve([]);
    }
  });
}
