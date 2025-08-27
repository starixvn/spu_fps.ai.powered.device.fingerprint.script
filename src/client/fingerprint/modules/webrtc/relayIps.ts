export async function collectRelayIPs(): Promise<string[]> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve([]);
        return;
      }

      const relayIPs = new Set<string>();

      const filterValidIPs = (list: Set<string>): string[] => {
        const invalidIPs = new Set([
          "0.0.0.0",
          "127.0.0.1",
          "::1",
          "localhost",
        ]);
        return [...list].filter((ip) => ip && !invalidIPs.has(ip));
      };

      const turnServers: RTCIceServer[] = [
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
        iceServers: turnServers,
        iceCandidatePoolSize: 10,
      });

      pc.createDataChannel("", { ordered: true });

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          pc.close();
          clearTimeout(timeoutId);
          resolve(filterValidIPs(relayIPs));
          return;
        }

        const candidate = event.candidate.candidate;

        if (
          candidate.includes("typ relay") ||
          candidate.includes("typ prflx")
        ) {
          const ipMatch = candidate.match(
            /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
          );

          if (ipMatch?.[1]) {
            relayIPs.add(ipMatch[1]);
          }
        }
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) {
          pc.close();
          clearTimeout(timeoutId);
          resolve(filterValidIPs(relayIPs));
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => {
          pc.close();
          clearTimeout(timeoutId);
          resolve([]);
        });

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          pc.close();
          clearTimeout(timeoutId);
          resolve(filterValidIPs(relayIPs));
        }
      };

      const timeoutId = setTimeout(() => {
        if (pc.iceGatheringState !== "complete") {
          pc.close();
          resolve(filterValidIPs(relayIPs));
        }
      }, 2000);
    } catch (error) {
      resolve([]);
    }
  });
}
