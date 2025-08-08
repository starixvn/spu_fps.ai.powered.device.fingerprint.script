export interface StorageResult {
    success: boolean;
    value?: string;
    error?: string;
}

export interface EncryptionResult {
    encrypted: string;
    success: boolean;
    error?: string;
}

export interface DecryptionResult {
    decrypted: string;
    success: boolean;
    error?: string;
}
