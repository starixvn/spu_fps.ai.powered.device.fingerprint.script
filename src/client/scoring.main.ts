import { SessionKeyManager } from './sessionKey';
import { Base64Encoder } from './scoring/utils/base64Encoder';
import { SCORING_CONFIG } from './scoring/config';
import { DOMUtils } from './utils/dom';
import { ScoringCollector } from './scoring';

class ScoringMain {
    private readonly scoring: ScoringCollector;

    constructor() {
        this.scoring = new ScoringCollector();
    }

    private getScoringServerUrl(): string {
        const searchPattern = "nsc.";
        const replacePattern = "sc.";
        const placeholder = "__GatewayDomain__";
        const serverDomain = SCORING_CONFIG.serverDomain;
        let updatedDomainName = serverDomain.replace(searchPattern, replacePattern);
        return updatedDomainName.replace(placeholder, updatedDomainName);
    }

    private async sendToServer(
        endpoint: string,
        payload: any
    ): Promise<boolean> {
        try {
            const formData = new FormData();
            formData.append('request', payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                keepalive: true
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }

    public async start(): Promise<void> {
        try {
            const scoringGroup = this.scoring.start();
            const sessionKey = SessionKeyManager.getSessionKey();

            const jsonPayload = JSON.stringify({ sk: sessionKey, sg: scoringGroup });
            const encodedPayload = Base64Encoder.encodeBase64(jsonPayload, SCORING_CONFIG.encodingKey);

            DOMUtils.injectValueIntoHiddenField("__rsg", encodedPayload);

            const apiEndpoint = this.getScoringServerUrl() + SCORING_CONFIG.endpoints.scoring;

            await this.sendToServer(apiEndpoint, encodedPayload);
        } catch (error) {
            // console.error('Failed to start scoring:', error);
        }
    }
}

const scoringMain = new ScoringMain();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        scoringMain.start();
    });
} else {
    scoringMain.start();
}