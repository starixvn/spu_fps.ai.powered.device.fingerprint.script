export interface PdfViewerEnabledResult {
  pdfViewerEnabled: boolean;
}

export async function collectPdfViewerEnabled(): Promise<PdfViewerEnabledResult> {
  try {
    const pdfViewerEnabled = navigator.pdfViewerEnabled ?? false;
    return { pdfViewerEnabled };
  } catch (error) {
    console.error("Error collecting PDF viewer status:", error);
    return { pdfViewerEnabled: false };
  }
}
