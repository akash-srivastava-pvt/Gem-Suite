/**
 * Gem Vitya - Personal Finance AI Application
 * Database Schema Definition
 */

export interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  mode: 'CASH' | 'ONLINE';
  transactionId?: string;
  date: Date;
  expenseCategory?: string;
  savingCategory?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TaxDocument {
  id: string;
  type: 'FORM16' | 'FORM26AS';
  fileName: string;
  filePath: string;
  uploadedAt: Date;
  extractedData?: TaxDocumentExtraction;
  processedAt?: Date;
  createdAt: Date;
}

export interface TaxDocumentExtraction {
  pan: string;
  grossSalary: number;
  taxableSalary: number;
  tds: number;
  employerName: string;
  deductions: {
    section80C?: number;
    section80D?: number;
    hra?: number;
    otherAllowances?: number;
  };
  assessmentYear: string;
  rawText?: string;
}

export interface TaxSimulation {
  id: string;
  documentId: string;
  oldRegimeTax: TaxCalculation;
  newRegimeTax: TaxCalculation;
  refund: number;
  taxSavings: TaxSavingsSuggestion[];
  filingGuide: ITRFilingStep[];
  createdAt: Date;
}

export interface TaxCalculation {
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  standardDeduction: number;
  taxPayable: number;
  healthInsuranceDeduction: number;
  homeLoantInterestDeduction: number;
  npsDeduction: number;
}

export interface TaxSavingsSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  applicableSection: string;
}

export interface ITRFilingStep {
  stepNumber: number;
  title: string;
  description: string;
  details: string[];
  hints?: string[];
}

export interface FinanceAnalytics {
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

export interface BudgetAlert {
  id: string;
  category: string;
  budgetLimit: number;
  alertThreshold: number;
  currentSpending: number;
  isExceeded: boolean;
  createdAt: Date;
}

export interface RecurringExpense {
  id: string;
  pattern: string;
  category: string;
  estimatedMonthlyAmount: number;
  confidence: number;
  detectedOn: Date;
}
