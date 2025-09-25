import type { PdfViewerEnabledInfo } from "../../types";
import { FingerprintSpecialValue } from "../../utils/consts";

export function collectPdfViewerEnabled(): PdfViewerEnabledInfo {
  try {
    if (typeof navigator === "undefined" || typeof navigator.pdfViewerEnabled === "undefined") {
      return FingerprintSpecialValue.UNDEFINED;
    }

    return navigator.pdfViewerEnabled ? 1 : 0;

  } catch (error) {
    return FingerprintSpecialValue.ERROR;
  }
}
