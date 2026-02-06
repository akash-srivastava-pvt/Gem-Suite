import { LoggerModel } from "../models/loggerModel.js";

export const AuditLogService = {
    log: (event: string, gemName: string = "resumemaker", piiExposed: boolean = false, status: string = "SUCCESS", details?: Record<string, any>): void => {
        const logData = {
            event,
            timestamp: new Date().toISOString(),
            gemName,
            actionType: event.split(':')[0] || 'ACTION', // Basic heuristic or rely on event string
            piiExposed,
            status,
            ...details
        };
        // Ensure consistent structure for Requirement 4
        LoggerModel.log(JSON.stringify(logData));
    }
};
