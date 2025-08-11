/**
 * Device Encryption Utilities
 * Implements the exact same logic as C# DeviceEncryption class
 * Uses RC4 encryption with Hex encoding for device fingerprinting
 */

import { RC4, Hex } from './hash';

// Default encryption key for client-side (browser environment)
const DEVICE_ID_ENCRYPT_KEY = '&％#@?,:*!~^.';

export class DeviceEncryption {

    public static Encrypt(plaintext: string): string {
        const encryptedText = RC4.encrypt(DEVICE_ID_ENCRYPT_KEY, plaintext);
        return Hex.encode(encryptedText);
    }

    public static Decrypt(encryptedText: string): string {
        let decryptedText = Hex.decode(encryptedText);
        decryptedText = RC4.decrypt(DEVICE_ID_ENCRYPT_KEY, decryptedText);
        return decryptedText;
    }
}
