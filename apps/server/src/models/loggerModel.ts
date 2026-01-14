import { db } from '@gem/db';

export interface LogEntry {
    id: number;
    event: string;
    timestamp: string;
}

export const LoggerModel = {
    getLogs: (): LogEntry[] => {
        return db.query<LogEntry>('SELECT * FROM logger ORDER BY timestamp DESC LIMIT 50');
    },

    log: (event: string): void => {
        db.execute('INSERT INTO logger (event) VALUES (?)', [event]);
    }
};
