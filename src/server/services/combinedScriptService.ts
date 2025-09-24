import { ScriptService } from './scriptService';

export class CombinedScriptService extends ScriptService {
    
    protected getScriptName(): string {
        return 'Combined';
    }

    protected getScriptFiles(): string[] {
        return [
            // Utils (shared)
            "utils/hash.js",
            "utils/data.js",
            "utils/browser.js",
            "utils/dom.js",
            "utils/consts.js",
            "deviceFactory.js",
            
            // Session
            "sessionKey/index.js",
            
            // Fingerprint Utils
            "fingerprint/utils/hash.js",
            "fingerprint/utils/data.js", 
            "fingerprint/utils/browser.js",
            "fingerprint/utils/dom.js",
            "fingerprint/utils/consts.js",
            
            // Hardware modules
            "fingerprint/modules/hardware/platform.js",
            "fingerprint/modules/hardware/architecture.js",
            "fingerprint/modules/hardware/osCpu.js",
            "fingerprint/modules/hardware/cpuClass.js",
            "fingerprint/modules/hardware/hardwareConcurrency.js",
            "fingerprint/modules/hardware/deviceMemory.js",
            "fingerprint/modules/hardware/index.js",
            
            // Graphics modules
            "fingerprint/modules/graphics/canvas.js",
            "fingerprint/modules/graphics/webglBasics.js",
            "fingerprint/modules/graphics/webglExtensions.js",
            "fingerprint/modules/graphics/fonts.js",
            "fingerprint/modules/graphics/fontPreferences.js",
            "fingerprint/modules/graphics/screenResolution.js",
            "fingerprint/modules/graphics/screenFrame.js",
            "fingerprint/modules/graphics/colorDepth.js",
            "fingerprint/modules/graphics/colorGamut.js",
            "fingerprint/modules/graphics/index.js",
            
            // Audio modules
            "fingerprint/modules/audio/audio.js",
            "fingerprint/modules/audio/audioBaseLatency.js",
            "fingerprint/modules/audio/index.js",
            
            // Browser modules
            "fingerprint/modules/browser/browserName.js",
            "fingerprint/modules/browser/osName.js",
            "fingerprint/modules/browser/userAgent.js",
            "fingerprint/modules/browser/vendor.js",
            "fingerprint/modules/browser/vendorFlavors.js",
            "fingerprint/modules/browser/plugins.js",
            "fingerprint/modules/browser/pdfViewerEnabled.js",
            "fingerprint/modules/browser/index.js",
            
            // Preference modules
            "fingerprint/modules/preference/languages.js",
            "fingerprint/modules/preference/timezone.js",
            "fingerprint/modules/preference/touchSupport.js",
            "fingerprint/modules/preference/cookiesEnabled.js",
            "fingerprint/modules/preference/localStorage.js",
            "fingerprint/modules/preference/sessionStorage.js",
            "fingerprint/modules/preference/openDatabase.js",
            "fingerprint/modules/preference/indexedDb.js",
            "fingerprint/modules/preference/index.js",
            
            // Fingerprint Core
            "fingerprint/abstract/abstractFingerprint.js",
            "fingerprint/f4Fingerprint.js",
            "fingerprint/f5Fingerprint.js",
            
            // IP modules
            "ip/modules/webrtc/ipCollector.js",
            "ip/modules/webrtc/index.js",
            "ip/index.js",

            // Tagging modules
            "tagging/modules/cacheApi.js",
            "tagging/modules/cookie.js",
            "tagging/modules/etag.js",
            "tagging/modules/indexedDB.js",
            "tagging/modules/localStorage.js",
            "tagging/modules/windowName.js",
            "tagging/tagging.js",
            "tagging/index.js",

            // Core files
            "index.js", 
            "dom.js"
        ];
    }

    /**
     * Get the combined script bundle
     */
    getCombinedScript(): string {
        return this.getScript();
    }

    async getMinifiedCombinedScript(): Promise<string> {
        return await this.getMinifiedScript();
    }

    /**
     * Get script info for debugging
     */
    async getCombinedScriptInfo(): Promise<{
        size: number;
        minifiedSize: number;
        lastBuilt: string;
        source: string;
        includedServices: string[];
    }> {
        const baseInfo = await this.getScriptInfo();
        
        return {
            ...baseInfo,
            includedServices: ['Fingerprint', 'Tagging'],
            source: 'Combined FPS bundle'
        };
    }
}
