import { CONFIG } from "../../utils/domain";
import { ErrorLogger } from "../../utils/errorLogger";
import { IStorageHandler } from "../types";

export class ETagHandler implements IStorageHandler {
    private _baseUrl: string;
    private readonly TIMEOUT_MS = 5000; // 5 seconds timeout

    constructor() {
        this._baseUrl = `${CONFIG.SERVER_DOMAIN}/resources/vers`;
    }

    public async get(key: string): Promise<string | null> {
        try {
            if (!this._baseUrl) {
                return null;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

            const response = await fetch(this._baseUrl, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const etag = response.headers.get('etag');
            return this.formatEtag(etag || "");
                
        } catch (error: any) {
            if (error.name === 'AbortError') {
                ErrorLogger.warn('ETag request timeout:', error);
            } else {
                ErrorLogger.error('Failed to get etag:', error);
            }
            return null;
        }
    }

    public async set(key: string, value: string): Promise<boolean> {
        try {
            if (!this._baseUrl || !value) {
                return false;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

            const response = await fetch(this._baseUrl, {
                method: 'GET',
                headers: {
                    'Res-Ec-X': `${value}`
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                ErrorLogger.warn('ETag set request timeout:', error);
            } else {
                ErrorLogger.error('Failed to set etag:', error);
            }
            return false;
        }
    }

    public available(): boolean {
        return this._baseUrl !== '';
    }

    private formatEtag(etag: string): string {
        return etag.replace(/^W\//, "")?.replace(/^"|"$/g, "") || "";
    }
}