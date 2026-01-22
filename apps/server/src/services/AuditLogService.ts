import { LoggerModel } from "../models/loggerModel.js";

export const AuditLogService = {
    log: (event: string, dataType: string = "RESUME", piiExposed: boolean = false, status: string = "SUCCESS"): void => {
        const logData = {
            event,
            timestamp: new Date().toISOString(),
            dataType,
            piiExposed,
            status
        };
        LoggerModel.log(JSON.stringify(logData));
    }
};
