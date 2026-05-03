/**
 * Gem Vitya - AI Prompt Templates
 * Pre-built prompts for tax calculation and financial advice
 */

import { TaxDocumentExtraction } from '@gem/shared';

export class TaxPromptTemplates {
  /**
   * Generate prompt for tax simulation calculation
   */
  static getTaxCalculationPrompt(maskedData: TaxDocumentExtraction): string {
    return `You are an expert Indian Chartered Accountant and tax advisor with deep knowledge of Indian Income Tax laws.

Given the following financial data from a tax document:

FINANCIAL DATA:
- Gross Salary: ₹${maskedData.grossSalary}
- Taxable Salary: ₹${maskedData.taxableSalary}
- TDS Already Paid: ₹${maskedData.tds}
- Assessment Year: ${maskedData.assessmentYear}

DEDUCTIONS AVAILABLE:
- Section 80C (Insurance/Provident Fund/Investments): ₹${maskedData.deductions?.section80C || 0}
- Section 80D (Health Insurance): ₹${maskedData.deductions?.section80D || 0}
- HRA (House Rent Allowance): ₹${maskedData.deductions?.hra || 0}
- Other Allowances: ₹${maskedData.deductions?.otherAllowances || 0}

TASK:
Please perform the following:

1. CALCULATE TAX LIABILITY FOR OLD REGIME:
   - Calculate taxable income
   - Apply standard deduction (₹50,000 for FY${maskedData.assessmentYear})
   - Calculate tax as per old regime rates
   - Calculate surcharge and cess if applicable
   - Calculate total tax payable
   - Calculate refund/demand considering TDS of ₹${maskedData.tds}

2. CALCULATE TAX LIABILITY FOR NEW REGIME:
   - Calculate taxable income
   - Apply standard deduction (₹50,000 for FY${maskedData.assessmentYear})
   - Calculate tax as per new regime rates (lower slabs)
   - Calculate surcharge and cess if applicable
   - Calculate total tax payable
   - Calculate refund/demand considering TDS of ₹${maskedData.tds}

3. PROVIDE TAX SAVING RECOMMENDATIONS:
   For each recommendation, include:
   - Specific action title
   - Detailed explanation
   - Section of Income Tax Act
   - Estimated potential savings in rupees
   - Priority (HIGH/MEDIUM/LOW) based on applicability

   Consider these options:
   a) Increasing Section 80C investments (ILife Insurance, Provident Fund, ELSS)
   b) National Pension Scheme (NPS) - Additional ₹200,000 deduction allowed
   c) Additional Health Insurance under Section 80D
   d) HRA optimization if applicable
   e) Home Loan interest deduction under Section 24
   f) Medical/Education expenses deduction
   g) Fixed Deposit interest optimization
   h) Senior Citizen specific deductions (if applicable)

4. GENERATE STEP-BY-STEP ITR FILING GUIDE:
   Create a numbered list of steps to file Income Tax Return:
   - Step numbers (1-15 or as needed)
   - Clear titles for each step
   - Detailed descriptions
   - Specific sub-steps or details to follow
   - Helpful hints where applicable

RESPONSE FORMAT:
Please structure your response as valid JSON with the following structure:
{
  "oldRegime": {
    "grossIncome": number,
    "deductions": number,
    "taxableIncome": number,
    "standardDeduction": 50000,
    "taxPayable": number,
    "healthInsuranceDeduction": 0,
    "homeLoantInterestDeduction": 0,
    "npsDeduction": 0
  },
  "newRegime": {
    "grossIncome": number,
    "deductions": number,
    "taxableIncome": number,
    "standardDeduction": 50000,
    "taxPayable": number,
    "healthInsuranceDeduction": 0,
    "homeLoantInterestDeduction": 0,
    "npsDeduction": 0
  },
  "refund": number,
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "potentialSavings": number,
      "priority": "HIGH|MEDIUM|LOW",
      "applicableSection": "string"
    }
  ],
  "itrFilingSteps": [
    {
      "stepNumber": number,
      "title": "string",
      "description": "string",
      "details": ["string"],
      "hints": ["string"]
    }
  ]
}

IMPORTANT CONSTRAINTS:
- All monetary values should be in rupees (₹)
- Only provide recommendations that are legally applicable
- Consider the person's income slab for accurate calculations
- Use FY${maskedData.assessmentYear} tax rates and slabs
- Be conservative in savings estimates
- Include surcharge (if income > threshold) in calculations`;
  }

  /**
   * Generate prompt for expense classification
   */
  static getExpenseClassificationPrompt(description: string): string {
    return `You are a financial advisor categorizing personal expenses.

Given the transaction description: "${description}"

Classify this into one of these expense categories:
- Food
- Lifestyle
- Transport
- Rent
- Shopping
- Entertainment
- Medical
- Education
- Others

Also determine if this could be a SAVING category:
- FD (Fixed Deposit)
- SIP (Systematic Investment Plan)
- PPF (Public Provident Fund)
- Stocks
- Mutual Funds
- Gold
- Emergency Fund
- Others

Respond with JSON:
{
  "expenseCategory": "string or null",
  "savingCategory": "string or null",
  "confidence": 0.0 to 1.0
}`;
  }

  /**
   * Generate prompt for recurring expense detection
   */
  static getRecurringExpensePrompt(transactions: any[]): string {
    const transactionList = transactions.map(t => ({
      date: t.date,
      amount: t.amount,
      category: t.expenseCategory,
      notes: t.notes
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return `You are an AI financial analyst detecting recurring patterns in spending.

TRANSACTION HISTORY:
${JSON.stringify(transactionList, null, 2)}

Analyze these transactions and identify:

1. Monthly recurring expenses (consistent amount and date pattern)
2. Weekly recurring expenses
3. Seasonal patterns
4. Irregular but frequent expenses

For each identified pattern, provide:
- Pattern name
- Category
- Estimated monthly amount
- Confidence score (0-100)
- Frequency (daily, weekly, monthly, quarterly)

Respond with JSON:
{
  "recurringPatterns": [
    {
      "pattern": "string",
      "category": "string",
      "estimatedMonthlyAmount": number,
      "confidence": number,
      "frequency": "daily|weekly|monthly|quarterly"
    }
  ]
}`;
  }

  /**
   * Generate prompt for financial health assessment
   */
  static getFinancialHealthPrompt(analytics: any): string {
    return `You are a certified financial advisor evaluating someone's financial health.

FINANCIAL SNAPSHOT:
${JSON.stringify(analytics, null, 2)}

Provide a comprehensive assessment including:

1. STRENGTHS:
   - What's working well in their finances?
   - Positive indicators?

2. AREAS FOR IMPROVEMENT:
   - What needs attention?
   - Risk factors?

3. ACTIONABLE RECOMMENDATIONS:
   - Top 5 specific actions to improve financial health
   - Priority order
   - Expected impact

4. DASHBOARD INSIGHTS:
   - Key observations
   - Trends to watch

Respond with JSON:
{
  "overallAssessment": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "recommendations": [
    {
      "action": "string",
      "priority": "HIGH|MEDIUM|LOW",
      "expectedImpact": "string"
    }
  ],
  "insights": ["string"]
}`;
  }

  /**
   * Generate prompt for investment suggestions
   */
  static getInvestmentSuggestionsPrompt(income: number, savingsRate: number, expenses: any[]): string {
    return `You are a certified investment advisor.

CLIENT PROFILE:
- Monthly Income: ₹${income}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Expense Categories: ${JSON.stringify(expenses)}

Based on this profile and considering:
- Risk tolerance: Moderate (adjust recommender)
- Time horizon: 5-10 years
- Tax optimization needs
- Emergency fund requirements

Recommend a portfolio allocation including:
1. Emergency Fund size
2. Debt instruments (FD, Government bonds)
3. Equity investments (Stocks, Mutual Funds, ETFs)
4. Tax-advantaged vehicles (PPF, NPS, ELSS)
5. Alternative investments (Gold, Real Estate)

Respond with JSON:
{
  "recommendedAllocation": [
    {
      "instrument": "string",
      "allocationType": "percentage or amount",
      "allocation": number,
      "rationale": "string"
    }
  ],
  "emergencyFundTarget": number,
  "priorityActions": ["string"]
}`;
  }
}
