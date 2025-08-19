declare module 'murmurhash3js' {
  export interface X86 {
    hash32(input: string | Buffer, seed?: number): string;
    hash128(input: string | Buffer, seed?: number): string;
  }
  
  export interface X64 {
    hash128(input: string | Buffer, seed?: number): string;
  }
  
  export const x86: X86;
  export const x64: X64;
}
