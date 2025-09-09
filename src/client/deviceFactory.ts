import { GuidGenerator, PacketTransformer } from "./utils/hash";

export class DeviceFactory {
    public static generateId(): string {
        const guid = GuidGenerator.generateGuid();
        return guid;
    }

    public static generateTagging(): string {
        const guid = this.generateId();
        const encryptedGuid = PacketTransformer.wrapMessage(guid);
        return encryptedGuid;
    }

    public static isValidTagging(taggingValue: string): boolean {
        try {
            if (!taggingValue || taggingValue.trim() === '') {
                return false;
            }

            const decryptedTagging = PacketTransformer.unwrapMessage(taggingValue);

            return this.isValidGuid(decryptedTagging);
        } catch (error) {
            return false;
        }
    }

    public static isValidGuid(guid: string): boolean {
        if (!guid) {
            return false;
        }

        const guidWithoutHyphensRegex = /^[0-9a-f]{32}$/i;
        
        return guidWithoutHyphensRegex.test(guid);
    }
}