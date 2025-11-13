import type { IndexedDBInfo, Bit } from '../../types';
import { isEdgeHTML, isTrident } from '../../utils/browser';
import { FingerprintSpecialValue } from '../../utils/consts';

export async function collectIndexedDB(): Promise<IndexedDBInfo> {
  if (isTrident() || isEdgeHTML()) return FingerprintSpecialValue.UNDEFINED;

  if (typeof window === 'undefined' || !window.indexedDB)
    return FingerprintSpecialValue.UNDEFINED;

  try {
    return !window.indexedDB ? 0 : 1;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'SecurityError') return 1;

    return FingerprintSpecialValue.ERROR;
  }
}
