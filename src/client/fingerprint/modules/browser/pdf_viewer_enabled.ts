export interface PdfViewerEnabledResult {
  pdfViewerEnabled: boolean;
}

const PDF_APIS = [
  "PDFViewerApplication",
  "pdfjsLib",
  "PDFJS",
  "PDFObject",
  "PDFViewer",
  "PDFDocument",
  "PDFPage",
];

export function collectPdfViewerEnabled(): PdfViewerEnabledResult {
  try {
    const pdfViewerEnabled = detectPdfApis();

    console.log("PdfViewerEnabled fingerprint collected:", {
      pdfViewerEnabled,
    });

    return { pdfViewerEnabled };
  } catch (error) {
    console.error("Error collecting PDF viewer status:", error);
    return { pdfViewerEnabled: false };
  }
}

function detectPdfApis(): boolean {
  if (PDF_APIS.some((api) => api in window)) {
    return true;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (
    userAgent.includes("chrome") ||
    userAgent.includes("firefox") ||
    userAgent.includes("safari")
  ) {
    return true;
  }

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.font = "12px sans-serif";
      ctx.fillText("A", 10, 15);
      const imageData = ctx.getImageData(0, 0, 20, 20);

      return imageData.data.some((pixel) => pixel !== 0);
    }
  } catch {}

  return false;
}
