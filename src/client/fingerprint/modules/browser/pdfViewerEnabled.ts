import type { PdfViewerEnabledInfo } from "../../types";

export async function collectPdfViewerEnabled(): Promise<PdfViewerEnabledInfo> {
  try {
    return { 
      pdfViewerEnabled: navigator.pdfViewerEnabled ? 1 : 0 
    };
  } catch (error) {
    return { pdfViewerEnabled: 0 };
  }
}
