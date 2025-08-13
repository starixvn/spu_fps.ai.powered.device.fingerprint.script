
import { Request, Response } from 'express';
import { DeviceEncryption } from './HashService';

const cookieKey: string = process.env.CookieStorage || 'pwr_client_sync';

export class TaggingService {
    private _etag: string | null = null;

    public GetCachedCandidateDeviceId(req: Request): string | null {
        const cachedDeviceId = this.GetEtag(req);

        if (!cachedDeviceId) {
            return this.GetDeviceIDFromCookie(req);
        }
        return cachedDeviceId;
    }
    
    private GetDeviceIDFromCookie(req: Request): string | null {
        const cookieValue = req.cookies?.[cookieKey];

        return this.IsValidDeviceId(cookieValue) ? cookieValue : null;
    }

    public GetEtag(req: Request): string | null {
        return this._etag || req.headers['if-none-match'] as string || null;
    }

    public SetEtag(res: Response, etag: string): void {
        if (this._etag === etag) {
            return;
        }

        this._etag = etag;
        
        res.setHeader('Etag', etag);

        res.setHeader('Cache-Control', 'private, max-age=3600');
    }

    public IsValidDeviceId(deviceId: string): boolean {
        if (!deviceId || deviceId.trim() === '') {
            return false;
        }

        try {
            const decryptedDeviceId = DeviceEncryption.Decrypt(deviceId);
            
            return this.isValidGuid(decryptedDeviceId);
        } catch (error) {
            return false;
        }
    }

    private isValidGuid(guid: string): boolean {
        if (!guid) {
            return false;
        }

        const guidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?4[0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i;
        const guidWithoutHyphensRegex = /^[0-9a-f]{32}$/i;
        
        return guidRegex.test(guid) || guidWithoutHyphensRegex.test(guid);
    }
}