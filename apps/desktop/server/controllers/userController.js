import { DatabaseModel } from '@gem/db';
const db = new DatabaseModel();
db.init(); // Initialize the WASM database
export const UserController = {
    // GET /api/users
    getAll: async (req, res) => {
        try {
            const users = db.query("SELECT * FROM users");
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch users" });
        }
    },
    // POST /api/users
    create: async (req, res) => {
        try {
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ error: "Name is required" });
            db.execute("INSERT INTO users (name) VALUES (?)", [name]);
            res.status(201).json({ message: "User created" });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to save user" });
        }
    }
};
