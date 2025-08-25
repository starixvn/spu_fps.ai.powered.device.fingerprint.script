// /**
//  * Graphics Fingerprinting Module
//  * Collects WebGL and Canvas fingerprints
//  */

// import { WebGLInfo } from '../types';

// export class GraphicsFingerprint {

//   /**
//    * Get graphics fingerprinting data
//    */
//   public static collect(): {
//     webgl: WebGLInfo | null;
//     canvas: string | null;
//     fonts: string[];
//   } {
//     return {
//       webgl: this.getWebGLInfo(),
//       canvas: this.getCanvasFingerprint(),
//       fonts: this.getFontList()
//     };
//   }

//   /**
//    * Get WebGL renderer information
//    */
//   private static getWebGLInfo(): WebGLInfo | null {
//     try {
//       if (typeof document === 'undefined') return null;

//       const canvas = document.createElement('canvas');
//       const gl = canvas.getContext('webgl') as WebGLRenderingContext ||
//                  canvas.getContext('experimental-webgl') as WebGLRenderingContext;

//       if (!gl) return null;

//       const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
//       const result: WebGLInfo = {
//         vendor: gl.getParameter(gl.VENDOR),
//         renderer: gl.getParameter(gl.RENDERER),
//         version: gl.getParameter(gl.VERSION),
//         shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
//       };

//       if (debugInfo) {
//         result.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
//         result.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
//       }

//       return result;
//     } catch (e) {
//       return null;
//     }
//   }

//   /**
//    * Generate canvas fingerprint
//    */
//   private static getCanvasFingerprint(): string | null {
//     try {
//       if (typeof document === 'undefined') return null;

//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');

//       if (!ctx) return null;

//       // Set canvas size
//       canvas.width = 280;
//       canvas.height = 60;

//       // Draw complex pattern for fingerprinting
//       ctx.textBaseline = 'alphabetic';
//       ctx.fillStyle = '#f60';
//       ctx.fillRect(125, 1, 62, 20);

//       ctx.fillStyle = '#069';
//       ctx.font = '11pt Arial';
//       ctx.fillText('FPS Device Fingerprint 🔍', 2, 15);

//       ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
//       ctx.font = '18pt Arial';
//       ctx.fillText('TypeScript Client v1.0', 4, 45);

//       // Add some geometric shapes
//       ctx.globalCompositeOperation = 'multiply';
//       ctx.fillStyle = 'rgb(255,0,255)';
//       ctx.beginPath();
//       ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
//       ctx.closePath();
//       ctx.fill();

//       return canvas.toDataURL();
//     } catch (e) {
//       return null;
//     }
//   }

//   /**
//    * Detect installed fonts
//    */
//   private static getFontList(): string[] {
//     try {
//       if (typeof document === 'undefined') return [];

//       const fonts = [
//         'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
//         'Avant Garde', 'Calibri', 'Candara', 'Century Gothic', 'Comic Sans MS',
//         'Courier', 'Courier New', 'Geneva', 'Georgia', 'Helvetica',
//         'Helvetica Neue', 'Impact', 'Lucida Console', 'Lucida Grande',
//         'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Monaco', 'Palatino',
//         'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana'
//       ];

//       const availableFonts: string[] = [];
//       const testString = 'mmmmmmmmmmlli';
//       const testSize = '72px';
//       const baseline = 'serif';

//       const canvas = document.createElement('canvas');
//       const context = canvas.getContext('2d');
//       if (!context) return [];

//       // Get baseline width
//       context.font = testSize + ' ' + baseline;
//       const baselineWidth = context.measureText(testString).width;

//       // Test each font
//       for (let i = 0; i < fonts.length; i++) {
//         context.font = testSize + ' ' + fonts[i] + ', ' + baseline;
//         const width = context.measureText(testString).width;

//         if (width !== baselineWidth) {
//           availableFonts.push(fonts[i]);
//         }
//       }

//       return availableFonts;
//     } catch (e) {
//       return [];
//     }
//   }
// }
