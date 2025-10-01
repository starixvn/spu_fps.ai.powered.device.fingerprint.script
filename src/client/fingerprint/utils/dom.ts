import { parseSimpleCssSelector } from './data'

export type MaybePromise<T> = Promise<T> | T

export function wait<T = void>(durationMs: number, resolveWith?: T): Promise<T> {
  return new Promise((resolve) => setTimeout(resolve, durationMs, resolveWith))
}

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

/**
 * Creates and keeps an invisible iframe while the given function runs.
 */
export async function withIframe<T>(
  action: (iframe: HTMLIFrameElement, iWindow: typeof window) => MaybePromise<T>,
  initialHtml?: string,
  domPollInterval = 50,
): Promise<T> {
  const d = document

  // document.body can be null while the page is loading
  while (!d.body) {
    await wait(domPollInterval)
  }

  const iframe = d.createElement('iframe')

  try {
    await new Promise<void>((_resolve, _reject) => {
      let isComplete = false
      const resolve = () => {
        isComplete = true
        _resolve()
      }
      const reject = (error: unknown) => {
        isComplete = true
        _reject(error)
      }

      iframe.onload = resolve
      iframe.onerror = reject
      const { style } = iframe
      style.setProperty('display', 'block', 'important') // Required for browsers to calculate the layout
      style.position = 'absolute'
      style.top = '0'
      style.left = '0'
      style.visibility = 'hidden'
      if (initialHtml && 'srcdoc' in iframe) {
        iframe.srcdoc = initialHtml
      } else {
        iframe.src = 'about:blank'
      }
      d.body.appendChild(iframe)

      // WebKit in WeChat doesn't fire the iframe's `onload` for some reason.
      const checkReadyState = () => {
        // The ready state may never become 'complete' in Firefox despite the 'load' event being fired.
        if (isComplete) {
          return
        }

        // Make sure iframe.contentWindow and iframe.contentWindow.document are both loaded
        if (iframe.contentWindow?.document?.readyState === 'complete') {
          resolve()
        } else {
          setTimeout(checkReadyState, 10)
        }
      }
      checkReadyState()
    })

    while (!iframe.contentWindow?.document?.body) {
      await wait(domPollInterval)
    }

    return await action(iframe, iframe.contentWindow as typeof window)
  } finally {
    iframe.parentNode?.removeChild(iframe)
  }
}

/**
 * Creates a DOM element that matches the given selector.
 * Only single element selector are supported (without operators like space, +, >, etc).
 */
export function selectorToElement(selector: string): HTMLElement {
  const [tag, attributes] = parseSimpleCssSelector(selector)
  const element = document.createElement(tag ?? 'div')
  for (const name of Object.keys(attributes)) {
    const value = attributes[name].join(' ')
    if (name === 'style') {
      addStyleString(element.style, value)
    } else {
      element.setAttribute(name, value)
    }
  }
  return element
}

/**
 * Adds CSS styles from a string in such a way that doesn't trigger a CSP warning (unsafe-inline or unsafe-eval)
 */
export function addStyleString(style: CSSStyleDeclaration, source: string): void {
  for (const property of source.split(';')) {
    const match = /^\s*([\w-]+)\s*:\s*(.+?)(\s*!([\w-]+))?\s*$/.exec(property)
    if (match) {
      const [, name, value, , priority] = match
      style.setProperty(name, value, priority || '') 
    }
  }
}

/**
 * Returns true if the code runs in an iframe, and any parent page's origin doesn't match the current origin
 */
export function isAnyParentCrossOrigin(): boolean {
  let currentWindow: Window = window

  for (;;) {
    const parentWindow = currentWindow.parent
    if (!parentWindow || parentWindow === currentWindow) {
      return false // The top page is reached
    }

    try {
      if (parentWindow.location.origin !== currentWindow.location.origin) {
        return true
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'SecurityError') {
        return true
      }
      throw error
    }

    currentWindow = parentWindow
  }
}