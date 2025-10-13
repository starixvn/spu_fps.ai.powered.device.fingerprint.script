export const CONFIG = {
    VERSION: "__VERSION__",
    ENCODING_KEY: "__ENCODE_KEY__",
    GATEWAY_URL: "__GATEWAY_URL__",
    SERVER_DOMAIN: getServerDomain(),
    DEBUG: "__DEBUG__",
    ENDPOINTS: {
      F4: "/meta-data",
      F5: "/logs-sync"
    },
    FIELD_NAMES: {
      DEVICE_INFO: "__di"
    }
}

function getServerDomain(): string {
    try {
      const script = document.currentScript as HTMLScriptElement | null;
      if (script?.src) {
        return new URL(script.src).origin;
      }
  
      const fallbackUrl = (window as any)?.Detecas?.Config?.nsc;
      if (fallbackUrl) {
        return new URL(fallbackUrl, window.location.href).origin;
      }
  
      return "//localhost:3000";
    } catch {
      return "//localhost:3000";
    }
  }