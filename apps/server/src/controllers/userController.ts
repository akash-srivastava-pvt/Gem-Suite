import { Request, Response } from 'express';
import { DatabaseModel } from '@gem/db';
import { User } from '@gem/shared';

const db = new DatabaseModel();
db.init(); // Initialize the WASM database

export const UserController = {
  // GET /api/users
  getAll: async (req: Request, res: Response) => {
    try {
      const users = db.query<User>("SELECT * FROM users");
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },

  // POST /api/users
  create: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      
      db.execute("INSERT INTO users (name) VALUES (?)", [name]);
      res.status(201).json({ message: "User created" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save user" });
    }
  }
};