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
            // Use a transaction for atomic deletion
            db.execute('BEGIN TRANSACTION');

            db.execute('DELETE FROM users');
            db.execute('DELETE FROM resume');
            db.execute('DELETE FROM user_api_keys');
            db.execute('DELETE FROM usage_metrics');
            db.execute('DELETE FROM saved_artifacts');

            // Try to delete legacy table if it exists
            try {
                db.execute('DELETE FROM activate');
            } catch (e) {
                // Ignore error if table doesn't exist
            }

            db.execute('INSERT INTO logger (event) VALUES (?)', ['All user data deleted']);

            db.execute('COMMIT');
        } catch (error) {
            db.execute('ROLLBACK');
            throw error;
        }
    },

    hasAgreed: (): boolean => {
        const user = UserModel.getUser();
        return user ? !!user.personalAgreement : false;
    }
};
