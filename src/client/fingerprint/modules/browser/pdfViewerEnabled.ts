import type { PdfViewerEnabledInfo } from "../../types";
import { boolToBit } from "../../utils/data";

export async function collectPdfViewerEnabled(): Promise<PdfViewerEnabledInfo> {
  try {
    const pdfViewerEnabled = boolToBit(Boolean(navigator.pdfViewerEnabled));
    return { pdfViewerEnabled };
  } catch (error) {
    return { pdfViewerEnabled: 0 };
  }
}
