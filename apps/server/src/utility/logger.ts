/**
 * Centralized logging utility
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}

interface LogEntry {
    timestamp: string;
    level: string;
    module: string;
    message: string;
    data?: any;
}

class Logger {
    private logLevel: LogLevel = LogLevel.INFO;
    private isDev = process.env.NODE_ENV === 'development';

    constructor() {
        // Allow log level override via environment variable
        const envLevel = process.env.LOG_LEVEL?.toUpperCase();
        if (envLevel && LogLevel[envLevel as keyof typeof LogLevel] !== undefined) {
            this.logLevel = LogLevel[envLevel as keyof typeof LogLevel];
        }
    }

    private formatMessage(entry: LogEntry): string {
        const { timestamp, level, module, message, data } = entry;
        let formatted = `[${timestamp}] [${level}] [${module}] ${message}`;

        if (data) {
            if (typeof data === 'object') {
                formatted += `\n${JSON.stringify(data, null, 2)}`;
            } else {
                formatted += ` ${data}`;
            }
        }

        return formatted;
    }

    private log(level: LogLevel, module: string, message: string, data?: any): void {
        if (level < this.logLevel) {
            return;
        }

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: LogLevel[level],
            module,
            message,
            data
        };

        const formatted = this.formatMessage(entry);

        // Use appropriate console method
        switch (level) {
            case LogLevel.DEBUG:
                if (this.isDev) console.debug(formatted);
                break;
            case LogLevel.INFO:
                console.info(formatted);
                break;
            case LogLevel.WARN:
                console.warn(formatted);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(formatted);
                break;
        }
    }

    debug(module: string, message: string, data?: any): void {
        this.log(LogLevel.DEBUG, module, message, data);
    }

    info(module: string, message: string, data?: any): void {
        this.log(LogLevel.INFO, module, message, data);
    }

    warn(module: string, message: string, data?: any): void {
        this.log(LogLevel.WARN, module, message, data);
    }

    error(module: string, message: string, data?: any): void {
        this.log(LogLevel.ERROR, module, message, data);
    }

    fatal(module: string, message: string, data?: any): void {
        this.log(LogLevel.FATAL, module, message, data);
    }
}

export const logger = new Logger();
