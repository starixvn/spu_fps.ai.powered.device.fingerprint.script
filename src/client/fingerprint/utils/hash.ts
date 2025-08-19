/**
 * Hash Utility Functions
 * Provides various hashing algorithms for fingerprinting
 */

/**
 * DJB2 hash algorithm
 */
export function djb2Hash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Simple hash function for shorter strings
 */
export function simpleHash(input: string): number {
  let hash = 0;
  if (input.length === 0) return hash;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate hash from array of strings
 */
export function hashArray(items: string[]): string {
  return djb2Hash(items.join('|'));
}

/**
 * Generate hash from object
 */
export function hashObject(obj: Record<string, any>): string {
  const sortedKeys = Object.keys(obj).sort();
  const values = sortedKeys.map(key => `${key}:${obj[key]}`);
  return djb2Hash(values.join('|'));
}
