export class DomainUtils {
    constructor() {}
    
    public static getServerDomain(): string {
        try {
            const currentScript = document.currentScript as HTMLScriptElement;
            const scriptSrc = currentScript?.src;
            
            if (scriptSrc) {
                return new URL(scriptSrc).origin;
            }
            
            const fallbackUrl = (window as any)?.Detecas?.Config?.nsc;
            if (fallbackUrl) {
                return new URL(fallbackUrl, window.location.href).origin;
            }
            
            return '//localhost:3000';
        } catch (error) {
            return '//localhost:3000';
        }
    }
}