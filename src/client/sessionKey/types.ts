export interface SessionKeyData {
    sessionKey: string;
    timestamp: number;
    expiresAt: number;
}

declare global {
    interface Window {
        sessionKey: string;
    }
}