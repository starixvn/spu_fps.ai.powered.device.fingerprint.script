import * as crypto from 'crypto';
import * as murmurhash from 'murmurhash3js';

export class HashService {
  /**
   * Hash fingerprint using both MurmurHash3 and SHA-256
   */
  hashFingerprint(fingerprint: any): {
    murmur: string;
    sha256: string;
    combined: string;
  } {
    const fingerprintString = JSON.stringify(fingerprint);
    
    // MurmurHash3
    const murmurHash = murmurhash.x86.hash32(fingerprintString);
    
    // SHA-256
    const sha256Hash = crypto
      .createHash('sha256')
      .update(fingerprintString)
      .digest('hex');
    
    // Combined hash (SHA-256 of concatenated hashes)
    const combinedHash = crypto
      .createHash('sha256')
      .update(murmurHash + sha256Hash)
      .digest('hex');
    
    return {
      murmur: murmurHash.toString(),
      sha256: sha256Hash,
      combined: combinedHash
    };
  }
  
  /**
   * Create a simple hash from string input
   */
  hashString(input: string): string {
    return crypto
      .createHash('sha256')
      .update(input)
      .digest('hex');
  }
}
