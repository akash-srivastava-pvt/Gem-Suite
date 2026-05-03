/**
 * Gem Vitya - Analytics Service
 * Aggregates transaction data and derives financial metrics
 */

import { FinanceAnalytics, RecurringExpense } from '@gem/shared';

export class AnalyticsService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async getMonthlyAnalytics(month?: string): Promise<FinanceAnalytics> {
    const monthFilter = month || new Date().toISOString().slice(0, 7);

    const monthlyQuery = `
      SELECT 
        SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE strftime("%Y-%m", date) = ?
    `;

    const monthlyData = this.db.query(monthlyQuery, [monthFilter]);
    const { income = 0, expenses = 0 } = monthlyData?.[0] || {};

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Top expense category
    const categoryQuery = `
      SELECT expenseCategory as category, SUM(amount) as amount
      FROM transactions
      WHERE type = 'DEBIT' AND strftime("%Y-%m", date) = ?
      GROUP BY expenseCategory
      ORDER BY amount DESC
      LIMIT 1
    `;

    const topCategory = this.db.query(categoryQuery, [monthFilter]);
    const topExpenseCategory = topCategory?.[0] 
      ? { category: topCategory[0].category, amount: topCategory[0].amount }
      : { category: 'Unknown', amount: 0 };

    // Total investments
    const investmentsQuery = `
      SELECT SUM(amount) as total
      FROM transactions
      WHERE savingCategory IS NOT NULL AND strftime("%Y-%m", date) = ?
    `;

    const investmentData = this.db.query(investmentsQuery, [monthFilter]);
    const totalInvestments = investmentData?.[0]?.total || 0;

    // Cash vs Online
    const modeQuery = `
      SELECT mode, SUM(amount) as amount
      FROM transactions
      WHERE strftime("%Y-%m", date) = ?
      GROUP BY mode
    `;

    const modeData = this.db.query(modeQuery, [monthFilter]);
    const modeMap = new Map(modeData?.map((d: any) => [d.mode, d.amount]) || []);
    const cashSpending = (modeMap.get('CASH') as number) || 0;
    const onlineSpending = (modeMap.get('ONLINE') as number) || 0;

    // Category breakdown
    const categoryBreakdownQuery = `
      SELECT 
        COALESCE(expenseCategory, savingCategory) as category,
        SUM(amount) as amount
      FROM transactions
      WHERE strftime("%Y-%m", date) = ?
      GROUP BY category
      ORDER BY amount DESC
    `;

    const categoryBreakdown = this.db.query(categoryBreakdownQuery, [monthFilter]);
    const totalAmount = (categoryBreakdown || []).reduce((sum: number, cat: any) => sum + cat.amount, 0);
    
    const categoryBreakdownFormatted = (categoryBreakdown || []).map((cat: any) => ({
      category: cat.category || 'Others',
      amount: cat.amount,
      percentage: totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0
    }));

    // Monthly trend (last 12 months)
    const trendQuery = `
      SELECT 
        strftime("%Y-%m", date) as month,
        SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) as expenses
      FROM transactions
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;

    const trendData = this.db.query(trendQuery, []);
    const monthlyTrend = (trendData || []).reverse().map((row: any) => ({
      month: row.month,
      income: row.income || 0,
      expenses: row.expenses || 0,
      savings: (row.income || 0) - (row.expenses || 0)
    }));

    // Mode distribution
    const totalSpending = cashSpending + onlineSpending;
    const modeDistribution = [
      {
        mode: 'CASH' as const,
        amount: cashSpending,
        percentage: totalSpending > 0 ? (cashSpending / totalSpending) * 100 : 0
      },
      {
        mode: 'ONLINE' as const,
        amount: onlineSpending,
        percentage: totalSpending > 0 ? (onlineSpending / totalSpending) * 100 : 0
      }
    ];

    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate,
      topExpenseCategory,
      totalInvestments,
      cashSpending,
      onlineSpending,
      monthlyTrend,
      categoryBreakdown: categoryBreakdownFormatted,
      modeDistribution
    };
  }

  async getCategoryAnalytics(month?: string): Promise<Array<{ category: string; total: number; count: number }>> {
    const monthFilter = month || new Date().toISOString().slice(0, 7);

    const query = `
      SELECT 
        COALESCE(expenseCategory, savingCategory) as category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE strftime("%Y-%m", date) = ?
      GROUP BY category
      ORDER BY total DESC
    `;

    return this.db.query(query, [monthFilter]);
  }

  async getSavingsAnalytics(month?: string): Promise<Array<{ savingType: string; total: number; transactions: number }>> {
    const monthFilter = month || new Date().toISOString().slice(0, 7);

    const query = `
      SELECT 
        savingCategory as savingType,
        SUM(amount) as total,
        COUNT(*) as transactions
      FROM transactions
      WHERE savingCategory IS NOT NULL AND strftime("%Y-%m", date) = ?
      GROUP BY savingCategory
      ORDER BY total DESC
    `;

    return this.db.query(query, [monthFilter]);
  }

  async detectRecurringExpenses(): Promise<RecurringExpense[]> {
    const query = `
      SELECT 
        expenseCategory as category,
        COUNT(*) as frequency,
        AVG(amount) as avgAmount,
        SUM(amount) as totalAmount
      FROM transactions
      WHERE type = 'DEBIT'
      GROUP BY expenseCategory
      HAVING frequency >= 3
      ORDER BY totalAmount DESC
    `;

    const results = this.db.query(query, []);
    
    return (results || []).map((row: any, index: number) => ({
      id: `recurring_${index}`,
      pattern: `Monthly ${row.category}`,
      category: row.category as string,
      estimatedMonthlyAmount: Math.round(row.avgAmount as number),
      confidence: Math.min((row.frequency as number) / 10 * 100, 100),
      detectedOn: new Date()
    }));
  }

  async getFinancialHealthScore(): Promise<{
    score: number;
    rating: string;
    breakdown: { category: string; score: number }[];
  }> {
    const analytics = await this.getMonthlyAnalytics();

    const savings_score = Math.min(analytics.savingsRate * 2, 100);
    const expense_diversity_score = Math.min(analytics.categoryBreakdown.length * 10, 100);
    const cash_to_online_score = Math.abs(50 - (analytics.modeDistribution[0]?.percentage || 0)) > 30 ? 60 : 80;
    const investment_score = analytics.totalInvestments > 0 ? 85 : 40;

    const overallScore = Math.round(
      (savings_score * 0.3 + expense_diversity_score * 0.2 + cash_to_online_score * 0.2 + investment_score * 0.3)
    );

    let rating = 'Excellent';
    if (overallScore < 40) rating = 'Poor';
    else if (overallScore < 60) rating = 'Fair';
    else if (overallScore < 80) rating = 'Good';

    return {
      score: overallScore,
      rating,
      breakdown: [
        { category: 'Savings Rate', score: savings_score },
        { category: 'Expense Diversity', score: expense_diversity_score },
        { category: 'Payment Balance', score: cash_to_online_score },
        { category: 'Investment Activity', score: investment_score }
      ]
    };
  }
}
