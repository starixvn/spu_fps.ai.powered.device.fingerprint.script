/**
 * Entropy Calculation Utilities
 * Measures uniqueness and randomness of fingerprint attributes
 */

/**
 * Calculate Shannon entropy of a string
 */
export function calculateEntropy(input: string): number {
  const frequencies: { [key: string]: number } = {};
  
  // Count character frequencies
  for (const char of input) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  const length = input.length;
  let entropy = 0;
  
  // Calculate entropy
  for (const freq of Object.values(frequencies)) {
    const probability = freq / length;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

/**
 * Calculate entropy for an array of values
 */
export function calculateArrayEntropy(values: any[]): number {
  const frequencies: { [key: string]: number } = {};
  
  // Count value frequencies
  for (const value of values) {
    const key = JSON.stringify(value);
    frequencies[key] = (frequencies[key] || 0) + 1;
  }
  
  const length = values.length;
  let entropy = 0;
  
  // Calculate entropy
  for (const freq of Object.values(frequencies)) {
    const probability = freq / length;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

/**
 * Estimate uniqueness score (0-1) based on entropy
 */
export function estimateUniqueness(entropy: number, maxPossibleEntropy: number): number {
  return Math.min(entropy / maxPossibleEntropy, 1);
}

/**
 * Calculate maximum theoretical entropy for a given length
 */
export function calculateMaxEntropy(distinctValues: number): number {
  return Math.log2(distinctValues);
}
