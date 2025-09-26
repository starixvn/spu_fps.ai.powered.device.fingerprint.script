import { DomainUtils } from "../../utils/domain";
import { IStorageHandler } from "../types";

export class ETagHandler implements IStorageHandler {
    private _baseUrl: string | '';

    constructor() {
        this._baseUrl = `${DomainUtils.getServerDomain()}/resources/vers`;
    }

    public async get(key: string): Promise<string | null> {
        try {
            if (!this._baseUrl) {
                return null;
            }

            const response = await fetch(this._baseUrl, {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.t) {
                    return data.t;
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

            const response = await fetch(this._baseUrl, {
                method: 'GET',
                headers: {
                    'Res-Ec-X': value
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.t) {
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
