/**
 * Creates a DOM environment optimized for font measurements with natural font rendering.
 */
export function withNaturalFonts<T>(
  action: (doc: Document, container: HTMLElement) => T | Promise<T>,
  containerWidthPx = 4000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");

    iframe.style.cssText = "position:absolute;left:-9999px;width:0;height:0;border:0;visibility:hidden;";
    iframe.srcdoc = `
      <!doctype html>
      <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body></body>
      </html>`;

    iframe.onload = async () => {
      try {
        const doc = iframe.contentDocument!;
        const body = doc.body;

        // Font-specific optimizations
        body.style.width = `${containerWidthPx}px`;
        body.style.webkitTextSizeAdjust = "none";
        (body.style as any).textSizeAdjust = "none";

        // Chromium zoom reset for accurate measurements
        if ("chrome" in window) {
          body.style.zoom = `${1 / (iframe.contentWindow!.devicePixelRatio || 1)}`;
        } else {
          body.style.zoom = "reset";
        }

        // Add lines of text to enforce natural font rendering
        const filler = doc.createElement("div");
        filler.textContent = Array(Math.floor(containerWidthPx / 20)).fill("word").join(" ");
        body.appendChild(filler);

        const result = await action(doc, body);
        document.body.removeChild(iframe);
        resolve(result);
      } catch (err) {
        document.body.removeChild(iframe);
        reject(err);
      }
    };

    iframe.onerror = () => {
      document.body.removeChild(iframe);
      reject(new Error('Failed to load iframe'));
    };

    document.body.appendChild(iframe);
  });
}
