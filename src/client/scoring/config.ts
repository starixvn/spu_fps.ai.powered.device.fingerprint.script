export const SCORING_CONFIG = {
  encodingKey: "__ENCODE_KEY__",
  serverDomain: getServerDomain(),
  sessionKey: "__SESSION_KEY__",
  version: "__VERSION__",
  debug: "__DEBUG__",
  endpoints: {
    scoring: "/scoring",
  }
}

export enum ScoringConstants {
  UNDEFINED = -1,
  ERROR = -3,  
}

function getServerDomain(): string {
  try {
    const script = document.currentScript as HTMLScriptElement | null;
    if (script?.src) {
      return new URL(script.src).origin;
    }

    return "//localhost:3000";
  } catch {
    return "//localhost:3000";
  }
}