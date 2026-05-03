/**
 * Gem Vitya - e-Bahikhata Tab (Digital Transaction Ledger)
 */

import React, { useState, useEffect } from 'react';
import '../GemVitya.css';

interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  mode: 'CASH' | 'ONLINE';
  transactionId?: string;
  date: string;
  expenseCategory?: string;
  savingCategory?: string;
  notes?: string;
  createdAt: string;
}

const EXPENSE_CATEGORIES = [
  'Food', 'Lifestyle', 'Transport', 'Rent', 'Shopping',
  'Entertainment', 'Medical', 'Education', 'Others'
];

const SAVING_CATEGORIES = [
  'FD', 'SIP', 'PPF', 'Stocks', 'Mutual Funds', 'Gold', 'Emergency Fund', 'Others'
];

interface EBahikhataTabProps {
  apiBaseURL: string;
}

const EBahikhataTab: React.FC<EBahikhataTabProps> = ({ apiBaseURL }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    type: 'DEBIT' as 'DEBIT' | 'CREDIT',
    mode: 'ONLINE' as 'CASH' | 'ONLINE',
    transactionId: '',
    date: new Date().toISOString().split('T')[0],
    expenseCategory: '',
    savingCategory: '',
    notes: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    category: '',
    type: '',
    mode: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load transactions
  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.mode) params.append('mode', filters.mode);

      const response = await fetch(`${apiBaseURL}/transactions?${params}`);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data);
      } else {
        setError(result.error || 'Failed to load transactions');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      const url = editingId
        ? `${apiBaseURL}/transactions/${editingId}`
        : `${apiBaseURL}/transactions`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingId ? 'Transaction updated!' : 'Transaction added!');
        setFormData({
          amount: '',
          type: 'DEBIT',
          mode: 'ONLINE',
          transactionId: '',
          date: new Date().toISOString().split('T')[0],
          expenseCategory: '',
          savingCategory: '',
          notes: ''
        });
        setEditingId(null);
        setShowForm(false);
        loadTransactions();
      } else {
        setError(result.error || 'Failed to save transaction');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      mode: transaction.mode,
      transactionId: transaction.transactionId || '',
      date: transaction.date,
      expenseCategory: transaction.expenseCategory || '',
      savingCategory: transaction.savingCategory || '',
      notes: transaction.notes || ''
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseURL}/transactions/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Transaction deleted!');
        loadTransactions();
      } else {
        setError(result.error || 'Failed to delete transaction');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${apiBaseURL}/export/csv?month=${filters.month}`);
      const csv = await response.text();
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${filters.month}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to export CSV: ' + err.message);
    }
  };

  const getTotalIncome = () => transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const getTotalExpense = () => transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="gv-bahikhata">
      {/* Summary Cards */}
      <div className="gv-grid-2col" style={{ marginBottom: '24px' }}>
        <div className="gv-metric">
          <div className="gv-metric-label">Total Income</div>
          <div className="gv-metric-value" style={{ color: '#10b981' }}>
            ₹{getTotalIncome().toLocaleString()}
          </div>
        </div>

        <div className="gv-metric">
          <div className="gv-metric-label">Total Expenses</div>
          <div className="gv-metric-value" style={{ color: '#ef4444' }}>
            ₹{getTotalExpense().toLocaleString()}
          </div>
        </div>

        <div className="gv-metric">
          <div className="gv-metric-label">Net Savings</div>
          <div className="gv-metric-value" style={{ color: '#8b5cf6' }}>
            ₹{(getTotalIncome() - getTotalExpense()).toLocaleString()}
          </div>
        </div>

        <div className="gv-metric">
          <div className="gv-metric-label">Transaction Count</div>
          <div className="gv-metric-value">{transactions.length}</div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="gv-alert gv-alert-error">{error}</div>}
      {success && <div className="gv-alert gv-alert-success">{success}</div>}

      {/* Action Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className="gv-btn gv-btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setEditingId(null);
          }}
        >
          ➕ {showForm ? 'Cancel' : 'Add Transaction'}
        </button>
        <button className="gv-btn gv-btn-secondary" onClick={handleExport}>
          📥 Export CSV
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="gv-card">
          <h3 className="gv-card-title">
            {editingId ? '✏️ Edit Transaction' : '➕ Add New Transaction'}
          </h3>

          <form onSubmit={handleSubmit} className="gv-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Amount */}
              <div className="gv-form-group">
                <label className="gv-label">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="gv-input"
                />
              </div>

              {/* Type */}
              <div className="gv-form-group">
                <label className="gv-label">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                  className="gv-select"
                >
                  <option value="DEBIT">Debit (Expense)</option>
                  <option value="CREDIT">Credit (Income)</option>
                </select>
              </div>

              {/* Mode */}
              <div className="gv-form-group">
                <label className="gv-label">Mode *</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleFormChange}
                  required
                  className="gv-select"
                >
                  <option value="ONLINE">Online</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              {/* Date */}
              <div className="gv-form-group">
                <label className="gv-label">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="gv-input"
                />
              </div>

              {/* Transaction ID */}
              <div className="gv-form-group">
                <label className="gv-label">Transaction ID</label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleFormChange}
                  placeholder="e.g., TXN123456"
                  className="gv-input"
                />
              </div>

              {/* Expense Category */}
              {formData.type === 'DEBIT' && (
                <div className="gv-form-group">
                  <label className="gv-label">Expense Category</label>
                  <select
                    name="expenseCategory"
                    value={formData.expenseCategory}
                    onChange={handleFormChange}
                    className="gv-select"
                  >
                    <option value="">Select...</option>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Saving Category */}
              {formData.type === 'CREDIT' && (
                <div className="gv-form-group">
                  <label className="gv-label">Saving Category</label>
                  <select
                    name="savingCategory"
                    value={formData.savingCategory}
                    onChange={handleFormChange}
                    className="gv-select"
                  >
                    <option value="">Select...</option>
                    {SAVING_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="gv-form-group">
              <label className="gv-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Add any additional details..."
                className="gv-textarea"
              />
            </div>

            <div className="gv-card-footer">
              <button type="submit" className="gv-btn gv-btn-primary" disabled={loading}>
                {loading ? '⏳ Saving...' : '💾 Save'}
              </button>
              <button
                type="button"
                className="gv-btn gv-btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="gv-card">
        <h3 className="gv-card-title">🔍 Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div className="gv-form-group">
            <label className="gv-label">Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="gv-input"
            />
          </div>

          <div className="gv-form-group">
            <label className="gv-label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="gv-select"
            >
              <option value="">All</option>
              {[...EXPENSE_CATEGORIES, ...SAVING_CATEGORIES].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="gv-form-group">
            <label className="gv-label">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="gv-select"
            >
              <option value="">All</option>
              <option value="CREDIT">Income</option>
              <option value="DEBIT">Expense</option>
            </select>
          </div>

          <div className="gv-form-group">
            <label className="gv-label">Mode</label>
            <select
              value={filters.mode}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
              className="gv-select"
            >
              <option value="">All</option>
              <option value="CASH">Cash</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="gv-table-container">
        <table className="gv-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Mode</th>
              <th>Category</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>
                  📭 No transactions found
                </td>
              </tr>
            ) : (
              transactions.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: '600' }}>₹{t.amount.toLocaleString()}</td>
                  <td>
                    <span className={`gv-badge gv-badge-${t.type === 'CREDIT' ? 'credit' : 'debit'}`}>
                      {t.type === 'CREDIT' ? '↓ Income' : '↑ Expense'}
                    </span>
                  </td>
                  <td>
                    <span className={`gv-badge gv-badge-${t.mode === 'CASH' ? 'cash' : 'online'}`}>
                      {t.mode}
                    </span>
                  </td>
                  <td>{t.expenseCategory || t.savingCategory || '—'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>{t.notes || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="gv-btn gv-btn-secondary"
                        onClick={() => handleEdit(t)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        ✏️
                      </button>
                      <button
                        className="gv-btn gv-btn-danger"
                        onClick={() => handleDelete(t.id)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EBahikhataTab;
