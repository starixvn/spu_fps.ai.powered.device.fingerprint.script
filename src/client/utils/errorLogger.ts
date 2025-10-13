/**
 * Simple Error Logger
 * Logs errors and stores them in window for easy access
 */

export interface LogEntry {
    timestamp: string;
    level: 'error' | 'warn' | 'info';
    message: string;
    context?: string;
    error?: Error | any;
}

class ErrorLoggerClass {
    private logs: LogEntry[] = [];

    public error(message: string, error?: Error | any, context?: string): void {
        this.log('error', message, error, context);
    }

    public warn(message: string, error?: Error | any, context?: string): void {
        this.log('warn', message, error, context);
    }

    public info(message: string, error?: Error | any, context?: string): void {
        this.log('info', message, error, context);
    }

    private log(level: 'error' | 'warn' | 'info', message: string, error?: Error | any, context?: string): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            error
        };

        this.logs.push(entry);

        // Update window
        if (typeof window !== 'undefined') {
            (window as any).errorLogger = this.logs;
        }
    }

    public getLogs(): LogEntry[] {
        return this.logs;
    }

    public clear(): void {
        this.logs = [];
        if (typeof window !== 'undefined') {
            (window as any).errorLogger = [];
        }
    }
}

export const ErrorLogger = new ErrorLoggerClass();

