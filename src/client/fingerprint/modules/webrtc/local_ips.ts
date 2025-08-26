export async function collectLocalIPs(): Promise<string[]> {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined" || !window.RTCPeerConnection) {
        resolve([]);
        return;
      }

      const ips: string[] = [];
      const pc = new RTCPeerConnection({
        iceServers: [],
        iceCandidatePoolSize: 0,
      });

      const filterValidIPs = (list: string[]): string[] => {
        const invalidIPs = new Set([
          "0.0.0.0",
          "127.0.0.1",
          "::1",
          "localhost",
        ]);

        return [...new Set(list)].filter((ip) => ip && !invalidIPs.has(ip));
      };

      pc.createDataChannel("", { ordered: true });

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          pc.close();
          resolve(filterValidIPs(ips));
          return;
        }

        const ipMatch = event.candidate.candidate.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        );

        if (ipMatch && ipMatch[1] && !ips.includes(ipMatch[1])) {
          ips.push(ipMatch[1]);
        }
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) {
          pc.close();
          resolve(filterValidIPs(ips));
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => {
          console.error("Error creating WebRTC offer:", error);
          pc.close();
          resolve([]);
        });

      const timeoutId = setTimeout(() => {
        if (pc.iceGatheringState !== "complete") {
          pc.close();
          resolve(filterValidIPs(ips));
        }
      }, 2000);

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          clearTimeout(timeoutId);
          pc.close();
          resolve(filterValidIPs(ips));
        }
      };
    } catch (error) {
      console.error("Error in collectLocalIPs:", error);
      resolve([]);
    }
  });
}
