
import { Request, Response } from 'express';
export class TaggingService {
    private _etag: string | null = null;

    public getEtag(req: Request): string | null {
        return this._etag || req.headers['if-none-match'] as string || null;
    }

    public setEtag(res: Response, etag: string): void {
        this._etag = etag;
        
        res.setHeader('Etag', etag);

        res.setHeader('Cache-Control', 'private, max-age=600');
    }
}