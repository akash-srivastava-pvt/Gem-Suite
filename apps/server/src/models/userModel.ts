import { db } from '@gem/db';

export interface User {
    id: number;
    name: string;
    personalAgreement: boolean;
}

export const UserModel = {
    getUser: (): User | null => {
        const rows = db.query<User>('SELECT * FROM users LIMIT 1');
        return rows.length > 0 ? rows[0] : null;
    },

    createUser: (name: string): void => {
        db.execute(
            'INSERT INTO users (name, personalAgreement) VALUES (?, ?)',
            [name, true]
        );
        db.execute('INSERT INTO logger (event) VALUES (?)', [`User agreement signed by ${name}`]);
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
