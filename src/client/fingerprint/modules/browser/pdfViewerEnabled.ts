import type { PdfViewerEnabledInfo } from "../../types";

export async function collectPdfViewerEnabled(): Promise<PdfViewerEnabledInfo> {
  try {
    const pdfViewerEnabled = navigator.pdfViewerEnabled ?? false;
    return { pdfViewerEnabled };
  } catch (error) {
    return { pdfViewerEnabled: false };
  }
}
