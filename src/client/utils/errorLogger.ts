import { CONFIG } from "./domain";

export interface LogEntry {
    timestamp: string;
    level: 'error' | 'warn' | 'info';
    message: string;
    context?: string;
    error?: Error | any;
    stack?: string;
}

class ErrorLoggerClass {
    private logs: LogEntry[] = [];
    private readonly MAX_LOGS = 100; // Giới hạn số logs để tránh memory leak

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
            error,
            stack: error?.stack
        };

        this.logs.push(entry);
        
        // Giới hạn số logs
        if (this.logs.length > this.MAX_LOGS) {
            this.logs = this.logs.slice(-this.MAX_LOGS);
        }
        
        if(CONFIG.DEBUG === 'true') {
            if (typeof window !== 'undefined') {
                (window as any).errorLogger = this.logs;
                console[level](`[${context || 'Unknown'}] ${message}`, error);
            }
        }
    }

    public getLogs(): LogEntry[] {
        return [...this.logs]; // Return copy để tránh mutation
    }

    public clear(): void {
        this.logs = [];
        if (typeof window !== 'undefined') {
            (window as any).errorLogger = [];
        }
    }

    public getErrorCount(): number {
        return this.logs.filter(log => log.level === 'error').length;
    }

    public getWarnCount(): number {
        return this.logs.filter(log => log.level === 'warn').length;
    }
}

export const ErrorLogger = new ErrorLoggerClass();