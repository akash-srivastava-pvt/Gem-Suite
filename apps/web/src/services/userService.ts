const API_BASE = '/api/v1/user';

export interface UserStatus {
    agreed: boolean;
    name?: string;
}

export interface LogEntry {
    id: number;
    event: string;
    timestamp: string;
}

export const userService = {
    getStatus: async (): Promise<UserStatus> => {
        const response = await fetch(`${API_BASE}/status`);
        if (!response.ok) throw new Error('Failed to fetch user status');
        return await response.json();
    },

    agree: async (name: string): Promise<boolean> => {
        const response = await fetch(`${API_BASE}/agree`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (response.status === 409) return true; // Already agreed
        if (!response.ok) throw new Error('Failed to record agreement');
        const res = await response.json();
        return res.success;
    },

    getLogs: async (): Promise<LogEntry[]> => {
        const response = await fetch(`${API_BASE}/logs`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        return await response.json();
    },

    deleteData: async (): Promise<boolean> => {
        const response = await fetch(`${API_BASE}/delete-data`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to delete data');
        const res = await response.json();
        return res.success;
    },


};
