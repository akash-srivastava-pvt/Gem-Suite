import React, { useState, useEffect } from 'react';
import { User } from '@gem/shared';
import { userService } from './services/userService.js';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch users on mount
  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await userService.create(name);
    setName('');
    await loadUsers();
    setLoading(false);
    
    // Optional: Use the Electron Bridge from our preload script
    if (window.gem) {
      window.gem.sendNotification(`User ${name} added!`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Gem-Suite Dashboard</h1>
      
      <form onSubmit={handleSubmit}>
        <input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter user name"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add User'}
        </button>
      </form>

      <hr />

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}