import { TaggingClass } from './tagging';
import { DOMUtils } from './utils/dom';

class TaggingMain {

    private readonly tagging: TaggingClass;

    constructor() {
        this.tagging = new TaggingClass();
    }

    public async start(): Promise<void> {
        try {
            const taggingValue = await this.tagging.getTaggingValue();
            DOMUtils.injectValueIntoHiddenField("__tg", taggingValue);
        } catch (error) {
            // ErrorLogger.error('Tagging main start failed:', error);
        }
    }
}

const taggingMain = new TaggingMain();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        taggingMain.start();
    });
} else {
    taggingMain.start();
}