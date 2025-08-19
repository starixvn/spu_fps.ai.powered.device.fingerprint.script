import { IStorageHandler } from "../types";

const SERVER_DOMAIN = '__SERVER_DOMAIN__';

export class ETagHandler implements IStorageHandler {
    private _etag: string | null = null;
    private _baseUrl: string | '' = '';

    constructor() {
        this._baseUrl = SERVER_DOMAIN;
    }

    public async get(key: string): Promise<string | null> {
        try {
            if (!this._baseUrl) {
                return null;
            }

            if (this._etag) {
                return this._etag;
            }

            const response = await fetch(`${this._baseUrl}/resources/versions`, {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.t) {
                    this._etag = data.t;
                    return this._etag;
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    public async set(key: string, value: string): Promise<boolean> {
        try {
            if (!this._baseUrl || !value) {
                return false;
            }

            if (this._etag === value) {
                return true; 
            }

            const response = await fetch(`${this._baseUrl}/resources/versions`, {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.t) {
                    this._etag = data.t;
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    public available(): boolean {
        return this._baseUrl !== '';
    }
}
