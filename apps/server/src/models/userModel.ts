import { db } from '@gem/db';

export interface User {
    id: number;
    name: string;
    personalAgreement: boolean;
    geminiVersion?: '2' | '3';
}

export const UserModel = {
    getUser: (): User | null => {
        const rows = db.query<User>('SELECT * FROM users LIMIT 1');
        if (rows.length > 0) {
            const user = rows[0];
            // Ensure geminiVersion defaults to '2' if not set
            if (!user.geminiVersion) {
                user.geminiVersion = '2';
            }
            return user;
        }
        return null;
    },

    createUser: (name: string): void => {
        db.execute(
            'INSERT INTO users (name, personalAgreement, geminiVersion) VALUES (?, ?, ?)',
            [name, true, '2']
        );
        db.execute('INSERT INTO logger (event) VALUES (?)', [`User agreement signed by ${name}`]);
    },

    updateGeminiVersion: (version: '2' | '3'): void => {
        const user = UserModel.getUser();
        if (user) {
            db.execute(
                'UPDATE users SET geminiVersion = ? WHERE id = ?',
                [version, user.id]
            );
        }
    },

    getGeminiVersion: (): '2' | '3' => {
        const user = UserModel.getUser();
        return user?.geminiVersion || '2';
    },

    deleteData: (): void => {
        db.execute('DELETE FROM users');
        db.execute('DELETE FROM activate');
        db.execute('DELETE FROM resume');
        db.execute('INSERT INTO logger (event) VALUES (?)', ['All user data deleted']);
    },

    hasAgreed: (): boolean => {
        const user = UserModel.getUser();
        return user ? !!user.personalAgreement : false;
    }
};
