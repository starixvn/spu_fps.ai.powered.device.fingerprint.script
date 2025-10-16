import { Request, Response } from 'express';
export class TaggingService {   

    public set(res: Response, key: string, value: string): void {
        res.setHeader(key, `${value}`);
    }

    public get(req: Request, key: string): string | null {
        // For now, we only support headers        
        return req.headers[key] as string | null;
    }   
    
    public formatEtag(etag: string | null): string | null {
        if (!etag) {
          return null;
        }
        return etag.replace(/^W\//, "").replace(/^"|"$/g, "");
      }
}