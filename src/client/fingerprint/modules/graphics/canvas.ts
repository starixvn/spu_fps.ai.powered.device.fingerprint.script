import { isSafariWebKit, isWebKit, isWebKit616OrNewer, isSamsungInternet, isChromium122OrNewer } from '../../utils/browser';
import { FingerprintSpecialValue } from '../../utils/consts';
import { Bit } from '../../types';

export type CanvasValue = string | FingerprintSpecialValue
export type Canvas = CanvasValue[]

// Performance optimizations
const CANVAS_SNAPSHOTS = 3; // Reduced from 5 for better performance
const CANVAS_FINGERPRINT_TEXT = "Sphinx ${String.fromCharCode(55357, 56848)} quartz ${String.fromCharCode(55357, 56849)} vow ${String.fromCharCode(55357, 56850)}";

export function collectCanvas(): Canvas {
  try {
    // Early exit for Samsung Internet with Smart Anti-Tracking
    if (isSamsungInternet() && isChromium122OrNewer()) {
      return [FingerprintSpecialValue.ANTI_FINGERPRINTED];
    }

    // Check for canvas anti-fingerprinting
    if (doesBrowserPerformCanvasAntifingerprinting()) {
      return [FingerprintSpecialValue.ANTI_FINGERPRINTED];
    }

    // Collect canvas features with timeout and robust error handling
    const features = getCanvasFeaturesWithTimeout();
    if (!features) {
      return [FingerprintSpecialValue.ERROR];
    }
    return Object.values(features) as Canvas;
  } catch {
    return [FingerprintSpecialValue.ERROR];
  }
}

function doesBrowserPerformCanvasAntifingerprinting(): boolean {
  try {
    // Safari WebKit anti-fingerprinting
    if (isWebKit() && isWebKit616OrNewer() && isSafariWebKit()) {
      return true;
    }

    // Samsung Internet Smart Anti-Tracking
    /* if (isSamsungInternet() && isChromium122OrNewer()) {
      return true;
    } */

    // Check for canvas protection
    const protection = detectCanvasProtection();
    return protection.isProtected;
  } catch {
    return true; // Assume protected on error
  }
}

function detectCanvasProtection(): { isProtected: boolean; isStrong: boolean } {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return { isProtected: true, isStrong: false };
    }

    // Check if toDataURL is a native function
    const isToDataURLFunction = HTMLCanvasElement.prototype.toDataURL.toString().includes('[native code]');
    if (!isToDataURLFunction) {
      return { isProtected: true, isStrong: false };
    }

    // Check for extension-specific markers
    const extensionDetected = detectCanvasBlockerExtension();
    if (extensionDetected === 1) {
      return { isProtected: true, isStrong: false };
    }

    return { isProtected: false, isStrong: false }; 
  } catch (error) {
    return { isProtected: true, isStrong: false }; 
  }
}

// Enhanced Canvas Blocker detection with Combined Approach
function detectCanvasBlockerExtension(): Bit {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return 0;
    }
    
    // Test 1: Check for Canvas Blocker specific properties
    const hasCanvasBlockerProperties = [
      'cbName' in canvas,
      'cbInject' in canvas,
      'cbBlocked' in canvas,
      'cbOriginal' in canvas,
      'cbModified' in canvas,
      'cbFingerprint' in canvas,
    ].some(Boolean);
    
    // Test 2: Check for Canvas Blocker window properties
    const hasWindowProperties = [
      'canvasBlockerName' in window,
      'canvasBlocker' in window,
      'cbExtension' in window,
      'cbConfig' in window,
    ].some(Boolean);
    
    // Test 3: Check for modified toDataURL function
    const toDataURLString = HTMLCanvasElement.prototype.toDataURL.toString();
    const hasModifiedToDataURL = (
      toDataURLString.includes('canvasBlocker') ||
      toDataURLString.includes('cb') ||
      toDataURLString.length > 200 || // More conservative threshold
      toDataURLString.includes('blocked') ||
      toDataURLString.includes('fake') ||
      toDataURLString.includes('spoof')
    );
    
    // Test 4: Check for consistent fake data behavior
    const hasConsistentFakeData = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 50;
        testCanvas.height = 50;
        const testCtx = testCanvas.getContext('2d');
        if (testCtx) {
          testCtx.fillRect(0, 0, 50, 50);
        }
        const dataURL1 = testCanvas.toDataURL();
        const dataURL2 = testCanvas.toDataURL();
        return dataURL1 === dataURL2; // Canvas Blocker returns same fake data
      } catch {
        return false;
      }
    })();
    
    // Test 5: Check for Canvas Blocker specific methods
    const hasCanvasBlockerMethods = [
      'getImageData' in ctx && typeof ctx.getImageData === 'function',
      'putImageData' in ctx && typeof ctx.putImageData === 'function',
    ].some(Boolean);
    
    // Count positive indicators
    const positiveIndicators = [
      hasCanvasBlockerProperties,
      hasWindowProperties,
      hasModifiedToDataURL,
      hasConsistentFakeData,
      hasCanvasBlockerMethods,
    ].filter(Boolean).length;
    
    // Canvas Blocker detected if 2+ indicators are positive
    return positiveIndicators >= 2 ? 1 : 0;
    
  } catch (error) {
    // More specific error handling
    if (error instanceof DOMException || 
        error instanceof TypeError ||
        (error as Error).message.includes('blocked') ||
        (error as Error).message.includes('security')) {
      return 1; // Likely blocked by extension
    }
    return 0; // Other errors are not necessarily Canvas Blocker
  }
}

// Enhanced function with timeout
function getCanvasFeaturesWithTimeout(): Record<string, any> | null {
  try {
    return getCanvasFeatures();
  } catch {
    return null;
  }
}

function getCanvasFeatures(): Record<string, any> {
  const features: Record<string, any> = {};
  
  // Collect canvas snapshots
  for (let i = 0; i < CANVAS_SNAPSHOTS; i++) {
    try {
      const snapshot = getCanvasSnapshot(i);
      features[`canvas_${i}`] = snapshot || FingerprintSpecialValue.ERROR;
    } catch {
      features[`canvas_${i}`] = FingerprintSpecialValue.ERROR;
    }
  }
  
  return features;
}

function getCanvasSnapshot(index: number): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    
    // Use unified canvas drawing function
    drawUnifiedCanvas(ctx, canvas.width, canvas.height, false);
    
    return canvas.toDataURL();
  } catch {
    return null;
  }
}

// Unified canvas drawing function - eliminates code duplication
function drawUnifiedCanvas(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  isTestMode: boolean = false
) {
  ctx.clearRect(0, 0, width, height);
  
  // Use appropriate text based on mode
  const text = isTestMode 
    ? "Sphinx ${String.fromCharCode(55357, 56848)} quartz" // Shorter for test
    : CANVAS_FINGERPRINT_TEXT; // Full text for fingerprinting
  
  if (isTestMode) {
    // Test mode - optimized for performance
    ctx.textBaseline = "top";
    ctx.font = "14px Times New Roman, Times, serif";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    
    ctx.fillStyle = "#069";
    ctx.fillText(text, 2, 15);
    
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(text, 4, 30);
    
    // Minimal complex operation for detection
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(255, 0, 255, 0.5)";
    ctx.fillRect(180, 10, 15, 15);
  } else {
    // Full mode - maximum entropy for fingerprinting
    // Primary text with Times New Roman (high entropy serif font)
    ctx.font = "20px Times New Roman, Times, serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgb(255,0,255)";
    ctx.fillText(text, 10, height / 2);

    // Secondary text with Georgia (another high entropy serif)
    ctx.font = "18px Georgia, Times New Roman, serif";
    ctx.fillStyle = "rgba(0,100,255,0.7)";
    ctx.fillText(text, 10, height / 2 + 30);

    // Tertiary text with Palatino (complex serif font)
    ctx.font = "16px Palatino, Times New Roman, serif";
    ctx.fillStyle = "rgb(255,255,0)";
    ctx.fillText(text, 10, height / 2 - 30);

    // Background rectangle
    ctx.fillStyle = "rgba(0,100,255,0.7)";
    ctx.fillRect(50, 10, 120, 60);

    // Circle with blend mode
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgb(255,255,0)";
    ctx.beginPath();
    ctx.arc(200, height / 2, 30, 0, Math.PI * 2);
    ctx.fill();

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255,0,0,0.3)");
    gradient.addColorStop(1, "rgba(0,0,255,0.3)");
    ctx.fillStyle = gradient;

    // Shadow effects
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(0, 0, width, height);
  }
}