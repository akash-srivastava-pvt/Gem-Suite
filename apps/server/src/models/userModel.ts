import { db } from '@gem/db';

export interface User {
    id: number;
    name: string;
    personalAgreement: boolean;
}

export const UserModel = {
    getUser: (): User | null => {
        const rows = db.query<User>('SELECT * FROM users LIMIT 1');
        if (rows.length > 0) {
            return rows[0];
        }
        return null;
    },

    createUser: (name: string): void => {
        db.execute(
            'INSERT INTO users (name, personalAgreement) VALUES (?, ?)',
            [name, true]
        );
        db.execute('INSERT INTO logger (event) VALUES (?)', [`User agreement signed by ${name}`]);
    },



    deleteData: (): void => {
        try {
            // No auto-save during this batch
            db.run('BEGIN TRANSACTION');

            // Deleting ALL tables for a complete reset
            db.run('DELETE FROM users');
            db.run('DELETE FROM resume');
            db.run('DELETE FROM user_api_keys');
            db.run('DELETE FROM usage_metrics');
            db.run('DELETE FROM saved_artifacts');
            db.run('DELETE FROM logger');

            // Try to delete legacy table if it exists
            try {
                db.run('DELETE FROM activate');
            } catch (e) {
                // Ignore error if table doesn't exist
            }

            db.run('INSERT INTO logger (event) VALUES (?)', ['⚠️ COMPLETE FACTORY RESET PERFOMED']);

            db.run('COMMIT');

            // Save to disk ONCE after the batch
            db.save();

            // Reclaim space and defragment database file
            try {
                db.run('VACUUM');
                db.save();
            } catch (vErr) {
                console.warn('VACUUM failed (not critical):', vErr);
            }
        } catch (error) {
            db.run('ROLLBACK');
            throw error;
        }
    },

    hasAgreed: (): boolean => {
        const user = UserModel.getUser();
        return user ? !!user.personalAgreement : false;
    }
};
