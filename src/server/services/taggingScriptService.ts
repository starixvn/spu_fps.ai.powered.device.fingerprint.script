
import { ScriptService } from './scriptService';

export class TaggingScriptService extends ScriptService {
    protected getScriptName(): string {
        return 'Tagging';
    }

    protected getScriptFiles(): string[] {
        return [
            'utils/domain.js',
            'utils/errorLogger.js',
            'utils/hash.js',
            'deviceFactory.js',
            'tagging/modules/cacheApi.js',
            'tagging/modules/cookie.js',
            'tagging/modules/etag.js',
            'tagging/modules/indexedDB.js',
            'tagging/modules/localStorage.js',
            'tagging/modules/windowName.js',
            'tagging/tagging.js',
            'tagging/index.js',
        ];
    }

    protected wrapInIIFE(jsCode: string): string {
        return `
        (function(global) {
            'use strict';
            global.enabledTag = true;
            ${jsCode}
        })(typeof window !== 'undefined' ? window : global);
        `;
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