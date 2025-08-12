
export class ETagHandler {
    private static _etag: string | null = null;
    private static _baseUrl: string = '';
    
    public static setBaseUrl(url: string): void {
        this._baseUrl = url;
    }

    public static async get(key: string): Promise<string | null> {
        try {
            if (this._baseUrl) {
                const headers: HeadersInit = {};
                
                if (this._etag) {
                    return this._etag;
                }
                
                const response = await fetch(`${this._baseUrl}/session`, {
                    headers
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('ETag fetched:', data.session);
                    if (data.session) {
                        this._etag = data.session;
                    }
                    return data.session || null;
                }
            }
            
            return this._etag;
        } catch (error) {
            return this._etag;
        }
    }

    public static async set(key: string, value: string): Promise<boolean> {
        try {
            if (this._etag === value) {
                return true;
            }

            this._etag = value;

            if (this._baseUrl) {
                const response = await fetch(`${this._baseUrl}/session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session: value })
                });
                
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
