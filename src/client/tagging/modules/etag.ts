
export class ETagHandler {
    private static _baseUrl: string = '';
    
    public static setBaseUrl(url: string): void {
        this._baseUrl = url;
    }

    public static async get(key: string): Promise<string | null> {
        try {
            if (this._baseUrl) {
                const response = await fetch(`${this._baseUrl}/session`);

                if (response.status === 204) {
                    const deviceId = response.headers.get('X-Meta-Tag');

                    if (deviceId) {
                        return deviceId;
                    }
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    public static async set(value: string): Promise<boolean> {
        try {
            if (this._baseUrl) {
                const response = await fetch(`${this._baseUrl}/session`);
                
                return response.ok;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }    
    
    public static available(): boolean {
        return true;
    }
}
