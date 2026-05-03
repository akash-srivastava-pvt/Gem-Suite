/**
 * Gem Vitya - Finance Dashboard Tab
 * Analytics and insights dashboard with charts
 */

import React, { useState, useEffect } from 'react';
import '../GemVitya.css';

interface FinanceAnalytics {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topExpenseCategory: { category: string; amount: number };
  totalInvestments: number;
  cashSpending: number;
  onlineSpending: number;
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  modeDistribution: {
    mode: 'CASH' | 'ONLINE';
    amount: number;
    percentage: number;
  }[];
}

interface FinanceDashboardTabProps {
  apiBaseURL: string;
}

const FinanceDashboardTab: React.FC<FinanceDashboardTabProps> = ({ apiBaseURL }) => {
  const [analytics, setAnalytics] = useState<FinanceAnalytics | null>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [recurring, setRecurring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadAnalytics();
  }, [selectedMonth]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [analyticsRes, healthRes, recurringRes] = await Promise.all([
        fetch(`${apiBaseURL}/analytics/monthly?month=${selectedMonth}`),
        fetch(`${apiBaseURL}/analytics/health`),
        fetch(`${apiBaseURL}/analytics/recurring`)
      ]);

      const analyticsData = await analyticsRes.json();
      const healthData = await healthRes.json();
      const recurringData = await recurringRes.json();

      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (healthData.success) setHealthScore(healthData.data);
      if (recurringData.success) setRecurring(recurringData.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="gv-card">⏳ Loading analytics...</div>;
  }

  if (error) {
    return <div className="gv-alert gv-alert-error">{error}</div>;
  }

  if (!analytics) {
    return <div className="gv-alert gv-alert-warning">📊 No data available for this month</div>;
  }

  const fmt = (val: any) =>
    val != null && !isNaN(Number(val)) ? Number(val).toLocaleString() : '0';
  const fmtPct = (val: any) =>
    val != null && !isNaN(Number(val)) ? Number(val).toFixed(1) : '0.0';

  // Simple Bar Chart Component
  const BarChart = ({ data, title }: any) => {
    const maxValue = Math.max(...data.map((d: any) => Number(d.value) || 0)) || 1;
    return (
      <div className="gv-chart-container">
        <div className="gv-chart-title">{title}</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {data.map((item: any) => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span>{item.label}</span>
                <span style={{ fontWeight: '600' }}>₹{fmt(item.value)}</span>
              </div>
              <div style={{
                background: 'var(--gv-bg-secondary)',
                height: '24px',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    height: '100%',
                    background: item.color || 'var(--gv-primary)',
                    width: `${(Number(item.value) / maxValue) * 100}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple Pie Chart Component
  const PieChart = ({ data, title }: any) => {
    const total = data.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0) || 1;
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    return (
      <div className="gv-chart-container">
        <div className="gv-chart-title">{title}</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {data.map((item: any, idx: number) => {
            const percentage = (Number(item.value) / total) * 100;
            return (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        background: colors[idx % colors.length]
                      }}
                    />
                    {item.label}
                  </span>
                  <span style={{ fontWeight: '600' }}>{percentage.toFixed(1)}%</span>
                </div>
                <div style={{
                  background: 'var(--gv-bg-secondary)',
                  height: '20px',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      height: '100%',
                      background: colors[idx % colors.length],
                      width: `${percentage}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Line Chart Component
  const LineChart = ({ data, title }: any) => {
    const maxValue = Math.max(...data.flatMap((d: any) => [Number(d.income) || 0, Number(d.expenses) || 0, Number(d.savings) || 0])) || 1;
    const minValue = 0;
    const range = maxValue - minValue || 1;

    return (
      <div className="gv-chart-container">
        <div className="gv-chart-title">{title}</div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '16px', minWidth: '100%' }}>
            {data.map((item: any, idx: number) => (
              <div key={idx} style={{ flex: 1, minWidth: '80px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', marginBottom: '8px', color: 'var(--gv-text-secondary)' }}>
                  {item.month}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '120px'
                }}>
                  <div title={`Income: ₹${item.income}`} style={{
                    height: `${((Number(item.income) - minValue) / range) * 100}%`,
                    width: '20px',
                    background: '#10b981',
                    borderRadius: '2px 2px 0 0'
                  }} />
                  <div title={`Expenses: ₹${item.expenses}`} style={{
                    height: `${((Number(item.expenses) - minValue) / range) * 100}%`,
                    width: '20px',
                    background: '#ef4444',
                    borderRadius: '2px 2px 0 0'
                  }} />
                  <div title={`Savings: ₹${item.savings}`} style={{
                    height: `${((Number(item.savings) - minValue) / range) * 100}%`,
                    width: '20px',
                    background: '#8b5cf6',
                    borderRadius: '2px 2px 0 0'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center', fontSize: '11px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ width: '12px', height: '12px', background: '#10b981' }} />
            Income
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ width: '12px', height: '12px', background: '#ef4444' }} />
            Expenses
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ width: '12px', height: '12px', background: '#8b5cf6' }} />
            Savings
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="gv-dashboard">
      {/* Month Selector */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label className="gv-label" style={{ margin: 0 }}>Select Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="gv-input"
          style={{ width: '200px' }}
        />
      </div>

      {/* Key Metrics */}
      <div className="gv-grid-2col" style={{ marginBottom: '24px' }}>
        <div className="gv-metric">
          <div className="gv-metric-label">Monthly Income</div>
          <div className="gv-metric-value" style={{ color: '#10b981' }}>
            ₹{fmt(analytics.monthlyIncome)}
          </div>
        </div>

        <div className="gv-metric">
          <div className="gv-metric-label">Monthly Expenses</div>
          <div className="gv-metric-value" style={{ color: '#ef4444' }}>
            ₹{fmt(analytics.monthlyExpenses)}
          </div>
        </div>

        <div className="gv-metric">
          <div className="gv-metric-label">Savings Rate</div>
          <div className="gv-metric-value" style={{ color: '#8b5cf6' }}>
            {fmtPct(analytics.savingsRate)}%
          </div>
        </div>

        <div className="gv-metric">
          <div className="gv-metric-label">Total Investments</div>
          <div className="gv-metric-value" style={{ color: 'var(--gv-primary)' }}>
            ₹{fmt(analytics.totalInvestments)}
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      {healthScore && (
        <div className="gv-card" style={{ marginBottom: '24px' }}>
          <h3 className="gv-card-title">💪 Financial Health Score</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'conic-gradient(#10b981 0%, #10b981 ' + healthScore.score + '%, var(--gv-bg-secondary) ' + healthScore.score + '%, var(--gv-bg-secondary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>{healthScore.score}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>out of 100</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>📊 Rating: {healthScore.rating}</h4>
                <p style={{ margin: '0', fontSize: '13px', color: 'var(--gv-text-secondary)' }}>
                  {healthScore.rating === 'Excellent' && '🌟 Excellent financial health! Keep up the great work.'}
                  {healthScore.rating === 'Good' && '👍 Good financial health. Room for optimization.'}
                  {healthScore.rating === 'Fair' && '⚠️ Fair financial health. Focus on savings and investments.'}
                  {healthScore.rating === 'Poor' && '❌ Poor financial health. Urgent action needed.'}
                </p>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {healthScore.breakdown.map((item: any, idx: number) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                      <span>{item.category}</span>
                      <span style={{ fontWeight: '600' }}>{Number(item.score || 0).toFixed(0)}</span>
                    </div>
                    <div style={{ background: 'var(--gv-bg-secondary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: (Number(item.score) || 0) + '%', background: '#10b981' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="gv-grid-2col" style={{ marginBottom: '24px' }}>
        <LineChart
          data={analytics.monthlyTrend}
          title="📈 Monthly Trend (Last 12 Months)"
        />

        <PieChart
          data={analytics.categoryBreakdown.map((cat: any) => ({
            label: cat.category,
            value: cat.amount
          }))}
          title="🗂️ Expense by Category"
        />

        <BarChart
          data={analytics.categoryBreakdown.map((cat: any) => ({
            label: cat.category,
            value: cat.amount,
            color: 'var(--gv-primary)'
          }))}
          title="💰 Category Breakdown"
        />

        <PieChart
          data={analytics.modeDistribution.map((mode: any) => ({
            label: mode.mode === 'CASH' ? '💵 Cash' : '💳 Online',
            value: mode.amount
          }))}
          title="💳 Payment Mode Distribution"
        />
      </div>

      {/* Recurring Expenses */}
      {recurring.length > 0 && (
        <div className="gv-card">
          <h3 className="gv-card-title">🔄 Detected Recurring Expenses</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {recurring.slice(0, 5).map((item: any, idx: number) => (
              <div key={idx} style={{
                padding: '12px',
                background: 'var(--gv-bg-secondary)',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.pattern}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>
                    Category: {item.category} • Confidence: {(Number(item.confidence || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    ₹{fmt(item.estimatedMonthlyAmount)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gv-text-secondary)' }}>per month</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Tips */}
      <div className="gv-alert gv-alert-info" style={{ marginTop: '24px' }}>
        <strong>💡 Finance Tip:</strong> Your savings rate is {fmtPct(analytics.savingsRate)}%. 
        {Number(analytics.savingsRate) < 20 ? ' Try to increase it by reducing discretionary expenses.' : ' Excellent! Keep investing for long-term growth.'}
      </div>
    </div>
  );
};

export default FinanceDashboardTab;
