
import { ScriptService } from './scriptService';

export class TaggingScriptService extends ScriptService {
    protected getScriptName(): string {
        return 'Tagging';
    }

    protected getScriptFiles(): string[] {
        return [
            'deviceFactory.js',
            'tagging/utils/hash.js',
            'tagging/modules/cacheApi.js',
            'tagging/modules/cookie.js',
            'tagging/modules/etag.js',
            'tagging/modules/indexedDB.js',
            'tagging/modules/localStorage.js',
            'tagging/tagging.js',
            'tagging/modules/windowName.js',
            'tagging/index.js',
        ];
    }

    /**
     * Get the tagging script bundle
     */
    getTaggingScript(): string {
        return this.getScript();
    }

    async getMinifiedTaggingScript(): Promise<string> {
        return await this.getMinifiedScript();
    }
}