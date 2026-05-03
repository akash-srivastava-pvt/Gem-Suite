/**
 * Gem Vitya - Sample Data / Fixtures
 * Demo data for testing and showcasing the application
 */

export const SAMPLE_TRANSACTIONS = [
  {
    id: '1',
    amount: 50000,
    type: 'CREDIT' as const,
    mode: 'ONLINE' as const,
    date: '2024-12-01',
    expenseCategory: null,
    savingCategory: null,
    notes: 'Month salary',
    createdAt: '2024-12-01T09:00:00Z'
  },
  {
    id: '2',
    amount: 15000,
    type: 'DEBIT' as const,
    mode: 'CASH' as const,
    date: '2024-12-02',
    expenseCategory: 'Rent',
    savingCategory: null,
    notes: 'Monthly rent payment',
    createdAt: '2024-12-02T10:00:00Z'
  },
  {
    id: '3',
    amount: 2500,
    type: 'DEBIT' as const,
    mode: 'ONLINE' as const,
    date: '2024-12-03',
    expenseCategory: 'Food',
    savingCategory: null,
    notes: 'Groceries',
    createdAt: '2024-12-03T14:00:00Z'
  },
  {
    id: '4',
    amount: 5000,
    type: 'DEBIT' as const,
    mode: 'ONLINE' as const,
    date: '2024-12-05',
    expenseCategory: 'Transport',
    savingCategory: null,
    notes: 'Fuel and cab rides',
    createdAt: '2024-12-05T08:00:00Z'
  },
  {
    id: '5',
    amount: 10000,
    type: 'DEBIT' as const,
    mode: 'ONLINE' as const,
    date: '2024-12-07',
    expenseCategory: 'Medical',
    savingCategory: null,
    notes: 'Doctor fees and medicines',
    createdAt: '2024-12-07T11:00:00Z'
  },
  {
    id: '6',
    amount: 3000,
    type: 'DEBIT' as const,
    mode: 'CASH' as const,
    date: '2024-12-08',
    expenseCategory: 'Entertainment',
    savingCategory: null,
    notes: 'Movie and dinner',
    createdAt: '2024-12-08T19:00:00Z'
  },
  {
    id: '7',
    amount: 5000,
    type: 'CREDIT' as const,
    mode: 'ONLINE' as const,
    date: '2024-12-10',
    expenseCategory: null,
    savingCategory: 'SIP',
    notes: 'SIP investment',
    createdAt: '2024-12-10T09:00:00Z'
  },
  {
    id: '8',
    amount: 50000,
    type: 'DEBIT' as const,
    mode: 'ONLINE' as const,
    date: '2024-12-15',
    expenseCategory: 'Shopping',
    savingCategory: null,
    notes: 'Online shopping',
    createdAt: '2024-12-15T16:00:00Z'
  }
];

export const SAMPLE_TAX_DATA = {
  pan: 'ABCDE1234F',
  grossSalary: 1200000,
  taxableSalary: 1200000,
  tds: 150000,
  employerName: 'Gem Tech Solutions',
  deductions: {
    section80C: 150000,
    section80D: 25000,
    hra: 300000,
    otherAllowances: 0
  },
  assessmentYear: '2024-25'
};

export const SAMPLE_ITR_FILING_STEPS = [
  {
    stepNumber: 1,
    title: 'Gather Required Documents',
    description: 'Collect all necessary documents before starting',
    details: [
      'Form 16 from your employer',
      'Investment receipts (insurance, PPF, ELSS)',
      'Health insurance policy documents',
      'Bank statements',
      'PAN card'
    ],
    hints: ['Keep digital copies handy']
  },
  {
    stepNumber: 2,
    title: 'Login to Income Tax Portal',
    description: 'Access the official IT e-filing portal',
    details: [
      'Go to https://www.incometax.gov.in',
      'Click Login → Login as Individual',
      'Enter PAN and password',
      'Complete OTP verification'
    ],
    hints: ['Use your registered mobile for OTP']
  }
];

/**
 * Generate sample monthly analytics
 */
export const generateSampleAnalytics = () => ({
  monthlyIncome: 50000,
  monthlyExpenses: 35500,
  savingsRate: 29,
  topExpenseCategory: {
    category: 'Rent',
    amount: 15000
  },
  totalInvestments: 5000,
  cashSpending: 8500,
  onlineSpending: 27000,
  monthlyTrend: [
    { month: 'Oct', income: 50000, expenses: 32000, savings: 18000 },
    { month: 'Nov', income: 50000, expenses: 34000, savings: 16000 },
    { month: 'Dec', income: 50000, expenses: 35500, savings: 14500 }
  ],
  categoryBreakdown: [
    { category: 'Rent', amount: 15000, percentage: 42.25 },
    { category: 'Food', amount: 2500, percentage: 7.04 },
    { category: 'Transport', amount: 5000, percentage: 14.08 },
    { category: 'Medical', amount: 10000, percentage: 28.17 },
    { category: 'Entertainment', amount: 3000, percentage: 8.45 }
  ],
  modeDistribution: [
    { mode: 'CASH', amount: 8500, percentage: 23.94 },
    { mode: 'ONLINE', amount: 27000, percentage: 76.06 }
  ]
});

/**
 * Generate sample health score
 */
export const generateSampleHealthScore = () => ({
  score: 72,
  rating: 'Good',
  breakdown: [
    { category: 'Savings Rate', score: 65 },
    { category: 'Expense Diversity', score: 80 },
    { category: 'Payment Balance', score: 75 },
    { category: 'Investment Activity', score: 75 }
  ]
});
