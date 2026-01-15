import { db } from "@gem/db";

export interface Resume {
    id?: number;
    name: string;
    contacts: string; // JSON
    links: string;    // JSON
    work_history: string; // JSON
    education: string;    // JSON
    personal_projects: string; // JSON
    skills: string;           // JSON
    cover_letter_para: string;
}

export const ResumeService = {
    async getResume(): Promise<Resume | null> {
        const results = db.query<Resume>("SELECT * FROM resume LIMIT 1");
        return results.length > 0 ? results[0] : null;
    },

    async createOrUpdateResume(data: Partial<Resume>): Promise<void> {
        const existing = await this.getResume();
        if (existing) {
            const sets = Object.keys(data).map(key => `${key} = ?`).join(", ");
            const values = Object.values(data);
            db.execute(`UPDATE resume SET ${sets} WHERE id = ?`, [...values, existing.id]);
        } else {
            const columns = Object.keys(data).join(", ");
            const placeholders = Object.keys(data).map(() => "?").join(", ");
            const values = Object.values(data);
            db.execute(`INSERT INTO resume (${columns}) VALUES (${placeholders})`, values);
        }
    }
};
