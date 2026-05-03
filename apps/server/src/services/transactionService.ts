/**
 * Gem Vitya - Transaction Service
 * Handles all transaction CRUD operations and filtering
 */

import { db } from '@gem/db';
import { Transaction } from '@gem/shared';
import { v4 as uuidv4 } from 'uuid';

export class TransactionService {
  private db: typeof db;

  constructor(database: typeof db) {
    this.db = database;
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const id = uuidv4();
    const createdAt = new Date();
    
    const query = `
      INSERT INTO transactions (
        id, amount, type, mode, transactionId, date, 
        expenseCategory, savingCategory, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      transaction.amount,
      transaction.type,
      transaction.mode,
      transaction.transactionId || null,
      transaction.date.toISOString(),
      transaction.expenseCategory || null,
      transaction.savingCategory || null,
      transaction.notes || null,
      createdAt.toISOString()
    ];

    this.db.execute(query, params);

    return {
      id,
      ...transaction,
      createdAt
    };
  }

  async getTransactions(filters?: {
    month?: string;
    category?: string;
    type?: 'CREDIT' | 'DEBIT';
    mode?: 'CASH' | 'ONLINE';
  }): Promise<Transaction[]> {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (filters?.month) {
      query += ' AND strftime("%Y-%m", date) = ?';
      params.push(filters.month);
    }

    if (filters?.category) {
      query += ' AND (expenseCategory = ? OR savingCategory = ?)';
      params.push(filters.category, filters.category);
    }

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters?.mode) {
      query += ' AND mode = ?';
      params.push(filters.mode);
    }

    query += ' ORDER BY date DESC';

    const rows = this.db.query<any>(query, params);
    return rows.map((row: any) => this.mapRowToTransaction(row));
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE id = ?';
    const rows = this.db.query<any>(query, [id]);
    
    if (rows.length === 0) return null;
    return this.mapRowToTransaction(rows[0]);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) throw new Error('Transaction not found');

    const updatedTransaction = { ...transaction, ...updates };
    
    const query = `
      UPDATE transactions SET 
        amount = ?, type = ?, mode = ?, transactionId = ?,
        date = ?, expenseCategory = ?, savingCategory = ?, notes = ?,
        updatedAt = ?
      WHERE id = ?
    `;

    const params = [
      updatedTransaction.amount,
      updatedTransaction.type,
      updatedTransaction.mode,
      updatedTransaction.transactionId || null,
      updatedTransaction.date.toISOString(),
      updatedTransaction.expenseCategory || null,
      updatedTransaction.savingCategory || null,
      updatedTransaction.notes || null,
      new Date().toISOString(),
      id
    ];

    this.db.execute(query, params);
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    const query = 'DELETE FROM transactions WHERE id = ?';
    this.db.execute(query, [id]);
  }

  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      amount: row.amount,
      type: row.type,
      mode: row.mode,
      transactionId: row.transactionId,
      date: new Date(row.date),
      expenseCategory: row.expenseCategory,
      savingCategory: row.savingCategory,
      notes: row.notes,
      createdAt: new Date(row.createdAt)
    };
  }
}
