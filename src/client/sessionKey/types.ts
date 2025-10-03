export interface SessionKeyData {
    sessionKey: string;
    timestamp: number;
}

declare global {
    interface Window {
        sessionKey: string;
    }
}