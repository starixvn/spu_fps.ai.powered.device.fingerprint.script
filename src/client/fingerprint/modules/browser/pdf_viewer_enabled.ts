export interface PdfViewerEnabledResult {
  pdfViewerEnabled: boolean;
}

export async function collectPdfViewerEnabled(): Promise<PdfViewerEnabledResult> {
  try {
    const pdfViewerEnabled = navigator.pdfViewerEnabled ?? false;
    return { pdfViewerEnabled };
  } catch (error) {
    return { pdfViewerEnabled: false };
  }
}
