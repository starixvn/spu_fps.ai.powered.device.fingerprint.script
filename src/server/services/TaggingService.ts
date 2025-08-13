
import { Request, Response } from 'express';

const cookieKey: string = process.env.CookieStorage || 'pwr_client_sync';

export class TaggingService {
    private _etag: string | null = null;

    public GetCachedCandidateDeviceId(req: Request): string | null {
        const cachedDeviceId = this.GetDeviceIDFromCookie(req);

        if (!cachedDeviceId) {
            return this.GetDeviceIDFromETag(req);
        }
        return cachedDeviceId;
    }
    
    private GetDeviceIDFromCookie(req: Request): string | null {
        const cookieValue = req.cookies?.[cookieKey];

        return cookieValue || null;
    }

    private GetDeviceIDFromETag(req: Request): string | null {
        return this.GetEtag(req);
    }

    public GetEtag(req: Request): string | null {
        return this._etag || req.headers['if-none-match'] as string || null;
    }

    public SetEtag(res: Response, etag: string): string | null {
        if (this._etag === etag) {
            return this._etag;
        }

        this._etag = etag;
        res.setHeader('ETag', etag);
        return etag;
    }
}