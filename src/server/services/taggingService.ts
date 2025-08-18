
import { Request, Response } from 'express';
import { DeviceEncryption } from './hashService';

const cookieKey: string = process.env.CookieStorage || 'pwr_client_sync';

export class TaggingService {
    private _etag: string | null = null;

    public getCachedCandidateValue(req: Request): string | null {
        const cookieValue = this.getValueFromCookie(req);

        if (!cookieValue) {
            return this.getEtag(req);
        }
        return cookieValue;
    }
    
    private getValueFromCookie(req: Request): string | null {
        const cookieValue = req.cookies?.[cookieKey];

        return this.isValidTagValue(cookieValue) ? cookieValue : null;
    }

    public getEtag(req: Request): string | null {
        return this._etag || req.headers['if-none-match'] as string || null;
    }

    public setEtag(res: Response, etag: string): void {
        if (this._etag === etag) {
            return;
        }

        this._etag = etag;
        
        res.setHeader('Etag', etag);

        res.setHeader('Cache-Control', 'private, max-age=600');
    }

    public isValidTagValue(tagValue: string): boolean {
        if (!tagValue || tagValue.trim() === '') {
            return false;
        }

        try {
            const decryptedValue = DeviceEncryption.Decrypt(tagValue);
            
            return this.isValidGuid(decryptedValue);
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