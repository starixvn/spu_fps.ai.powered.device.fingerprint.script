import type { OSCpuInfo } from "../../types";

export function collectOSCpu(): Promise<OSCpuInfo> {
  return getOSCpu().then(function(oscpu) {
    return { oscpu };
  }).catch(function(error) {
    return { oscpu: "" };
  });
}

function getOSCpu(): Promise<string> {
  try {
    if (navigator.oscpu) return Promise.resolve(navigator.oscpu);

    if (navigator.userAgentData?.getHighEntropyValues) {
      try {
        return navigator.userAgentData.getHighEntropyValues([
          "architecture",
          "platform",
        ]).then(function(data) {
          if (data?.platform && data?.architecture) {
            return `${data.platform}; ${data.architecture}`;
          }
          return "";
        }).catch(function() {
          return "";
        });
      } catch {
        return Promise.resolve("");
      }
    }

    return Promise.resolve("");
  } catch {
    return Promise.resolve("");
  }
}
