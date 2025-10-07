import { CONFIG } from "../../utils/domain";
import { ErrorLogger } from "../../utils/errorLogger";
import { IStorageHandler } from "../types";

export class ETagHandler implements IStorageHandler {
    private _baseUrl: string;

    constructor() {
        this._baseUrl = `${CONFIG.SERVER_DOMAIN}/resources/vers`;
    }

    public async get(key: string): Promise<string | null> {
        try {
            if (!this._baseUrl) {
                return null;
            }

            const response = await fetch(this._baseUrl, {
                method: 'GET'
            });

            const etag = response.headers.get('etag');

            return this.formatEtag(etag || "");
                
        } catch (error) {
            ErrorLogger.error('Failed to get etag:', error);
            return null;
        }
    }

    public async set(key: string, value: string): Promise<boolean> {
        try {
            if (!this._baseUrl || !value) {
                return false;
            }

            const response = await fetch(this._baseUrl, {
                method: 'GET',
                headers: {
                    'Res-Ec-X': `${value}`
                }
            });

            return response.ok;
        } catch (error) {
            ErrorLogger.error('Failed to set etag:', error);
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
