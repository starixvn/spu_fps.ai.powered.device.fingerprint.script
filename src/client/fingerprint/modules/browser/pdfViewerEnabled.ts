import type { Bit } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

export function collectPdfViewerEnabled(): Bit | FingerprintSpecialValue {
  try {
    if (typeof navigator === "undefined" || typeof navigator.pdfViewerEnabled === "undefined") {
      return FingerprintSpecialValue.UNDEFINED;
    }
    
    return navigator.pdfViewerEnabled ? 1 : 0;

  } catch (error) {
    return FingerprintSpecialValue.ERROR;
  }
}
