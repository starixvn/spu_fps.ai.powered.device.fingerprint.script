
export class ETagHandler {
    private static _baseUrl: string = '';
    private static _etag: string | null = null;
    
    public static setBaseUrl(url: string): void {
        this._baseUrl = url;
    }

    public static async get(key: string): Promise<string | null> {
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

    public static async set(value: string): Promise<boolean> {
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
    
    public static available(): boolean {
        return Boolean(this._baseUrl);
    }
}
