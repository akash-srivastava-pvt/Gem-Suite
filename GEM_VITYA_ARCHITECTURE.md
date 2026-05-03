# Gem Vitya - Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GEM SUITE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │   React Frontend     │         │   Express Backend    │    │
│  │   apps/web/         │         │   apps/server/      │    │
│  ├──────────────────────┤         ├──────────────────────┤    │
│  │ GemVitya.tsx         │◄────────┤ gemVityaRoutes.ts    │    │
│  │ ├─ e-Bahikhata       │  JSON   │ ├─ /transactions     │    │
│  │ ├─ Tax Simulator     │◄────────┤ ├─ /analytics       │    │
│  │ └─ Finance Dashboard │         │ ├─ /tax             │    │
│  │                      │         │ └─ /export          │    │
│  │ GemVitya.css         │         │                     │    │
│  │ ├─ Dark Mode         │         └──────────────────────┘    │
│  │ ├─ Responsive        │                ▲                     │
│  │ └─ Charts            │                │                     │
│  │                      │                │ SQL                 │
│  │ Components:          │                │                     │
│  │ ├─ EBahikhataTab    │         ┌──────┴──────────────┐    │
│  │ ├─ TaxSimulatorTab  │         │  SQLite Database    │    │
│  │ └─ DashboardTab     │         │  gem-suite.sqlite   │    │
│  │                      │         └─────────────────────┘    │
│  └──────────────────────┘                                      │
│                                                                 │
│  ┌──────────────────────┐                                      │
│  │  Shared Packages     │                                      │
│  │  packages/          │                                      │
│  ├──────────────────────┤                                      │
│  │ db/                  │                                      │
│  │ ├─ db.ts             │                                      │
│  │ └─ gemVitya.schema   │                                      │
│  │                      │                                      │
│  │ shared/              │                                      │
│  │ └─ types.ts          │                                      │
│  └──────────────────────┘                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: e-Bahikhata (Transaction Management)

```
User Input (Form)
      │
      ▼
┌─────────────────────┐
│ handleFormChange()   │
│ - Validate input     │
│ - Update state       │
└─────────────────────┘
      │
      ▼
┌──────────────────────────────┐
│ handleSubmit()               │
│ - Prepare payload            │
│ - Call API                   │
└──────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────┐
│ REST API Call                            │
│ POST /api/gem-vitya/transactions         │
└───────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ Backend: gemVityaRoutes.ts           │
│ POST /transactions handler           │
│ ├─ Validate required fields          │
│ ├─ Call TransactionService           │
│ └─ Return success/error              │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ TransactionService.createTransaction()│
│ ├─ Generate UUID                     │
│ ├─ Prepare INSERT query              │
│ ├─ Execute SQL                       │
│ └─ Return Transaction object         │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ Database: transactions table         │
│ ├─ id (UUID primary key)             │
│ ├─ amount, type, mode                │
│ ├─ date, categories                  │
│ └─ created_at timestamp              │
└──────────────────────────────────────┘
      │
      ▼
      │ (Response)
      ▼
┌──────────────────────────────────────────┐
│ Frontend: loadTransactions()             │
│ ├─ GET /api/gem-vitya/transactions      │
│ ├─ Parse response                       │
│ ├─ Update component state               │
│ └─ Re-render table                      │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────┐
│ UI Update                    │
│ ├─ New row in table          │
│ ├─ Summary metrics recalc    │
│ ├─ Charts refresh            │
│ └─ Success message displayed │
└──────────────────────────────┘
```

---

## Data Flow: Tax Simulator

```
User: Select Document Type (Form 16 / 26AS)
      │
      ▼
User: Enter/Upload Financial Data
      │
      ├─ Option A: Upload PDF
      │     │
      │     ▼
      │  PDFExtractionService.extractTextFromPDF()
      │     │
      │     ▼
      │  PDFExtractionService.parseForm16/26AS()
      │
      ├─ Option B: Manual Entry
      │     │
      │     ▼
      │  User fills form manually
      │
      └──────┬──────────────────┘
             │
             ▼
      ┌─────────────────────────┐
      │ DataMaskingService      │
      │ - Mask PAN              │
      │ - Mask Aadhaar          │
      │ - Mask Account#         │
      │ - Mask Email            │
      │ - Mask all sensitive    │
      └─────────────────────────┘
             │
             ▼
      ┌─────────────────────────────────┐
      │ POST /tax/simulate              │
      │ - Send masked data to API       │
      └─────────────────────────────────┘
             │
             ▼
      ┌──────────────────────────────────────┐
      │ TaxAdvisorService.simulateTax()      │
      │                                      │
      │ ├─ Validate extraction               │
      │ ├─ Prepare AI prompt                 │
      │ ├─ Call AI with masked data          │
      │ └─ Parse AI response                 │
      └──────────────────────────────────────┘
             │
             ├─ If AI available ────────┐
             │                          │
             │                          ▼
             │          ┌───────────────────────────┐
             │          │ Call AI Provider          │
             │          │ - Send prompt             │
             │          │ - Get Tax Calculations    │
             │          │ - Get Recommendations     │
             │          │ - Get ITR Guide           │
             │          └───────────────────────────┘
             │                    │
             └────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────┐
         │ Calculate Old Regime Tax     │
         │ ├─ Apply deductions (80C,80D)│
         │ ├─ Calculate taxable income  │
         │ ├─ Apply tax slabs           │
         │ ├─ Add surcharge             │
         │ ├─ Add cess                  │
         │ └─ Return tax amount         │
         └──────────────────────────────┘
         ┌──────────────────────────────┐
         │ Calculate New Regime Tax     │
         │ ├─ No deductions (standard)  │
         │ ├─ Calculate taxable income  │
         │ ├─ Apply lower slabs         │
         │ ├─ Add surcharge             │
         │ ├─ Add cess                  │
         │ └─ Return tax amount         │
         └──────────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────┐
         │ TaxSimulation Object         │
         │ {                            │
         │   oldRegime: TaxCalc,        │
         │   newRegime: TaxCalc,        │
         │   refund: num,               │
         │   recommendations: [],       │
         │   guide: ITRFilingSteps[]    │
         │ }                            │
         └──────────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────┐
         │ Frontend: Display Results    │
         │ ├─ Show old vs new comparison│
         │ ├─ Highlight best option     │
         │ ├─ Show refund/demand        │
         │ ├─ Display recommendations   │
         │ └─ Show ITR filing guide     │
         └──────────────────────────────┘
```

---

## Data Flow: Analytics Dashboard

```
User: Select Month (e.g., "2024-12")
      │
      ▼
┌──────────────────────────────────────┐
│ Frontend: loadAnalytics()            │
│ Parallel requests:                   │
│ 1. GET /analytics/monthly?month=...  │
│ 2. GET /analytics/health             │
│ 3. GET /analytics/recurring          │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ Backend: AnalyticsService            │
│                                      │
│ ├─ getMonthlyAnalytics()             │
│ │  ├─ SUM(CREDIT amounts) → income  │
│ │  ├─ SUM(DEBIT amounts) → expenses │
│ │  ├─ Calculate savings rate         │
│ │  ├─ Top expense category           │
│ │  ├─ Cash vs Online split           │
│ │  ├─ Category breakdown             │
│ │  └─ 12-month trend                 │
│ │                                    │
│ ├─ getFinancialHealthScore()        │
│ │  ├─ Calculate savings score        │
│ │  ├─ Calculate diversity score      │
│ │  ├─ Calculate balance score        │
│ │  ├─ Calculate investment score     │
│ │  ├─ Combine into overall score     │
│ │  └─ Assign rating                  │
│ │                                    │
│ └─ detectRecurringExpenses()        │
│    ├─ Group by category              │
│    ├─ Count frequency                │
│    ├─ Calculate average              │
│    └─ Return patterns                │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ Database Queries (Optimized)        │
│                                      │
│ ├─ SELECT SUM(amount) WHERE type=...│
│ ├─ SELECT category, SUM(amount)... │
│ ├─ SELECT * BY month ORDER BY date │
│ └─ Uses indexes for speed           │
└──────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────┐
│ Frontend: Display Analytics                │
│                                            │
│ ├─ Key Metrics Cards                       │
│ │  └─ Income, Expenses, Savings, Invest   │
│ │                                          │
│ ├─ Financial Health Score                  │
│ │  ├─ Donut chart (0-100)                 │
│ │  ├─ Rating badge                        │
│ │  └─ Component breakdown                 │
│ │                                          │
│ ├─ Charts                                  │
│ │  ├─ Line Chart (12-month trend)        │
│ │  ├─ Pie Chart (category breakdown)      │
│ │  ├─ Bar Chart (category amounts)        │
│ │  └─ Distribution (cash vs online)       │
│ │                                          │
│ └─ Recurring Expenses List                │
│    ├─ Pattern name                        │
│    ├─ Monthly amount                      │
│    └─ Confidence %                        │
└────────────────────────────────────────────┘
```

---

## Data Masking Pipeline

```
Raw Document
      │
      ▼
┌──────────────────────────────────────┐
│ extract()                            │
│ Read PDF → Extract Text              │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ parse()                              │
│ Structured Data Parsing              │
│ ├─ Find PAN patterns                │
│ ├─ Find salary amounts               │
│ ├─ Find deduction values             │
│ └─ Extract employer names            │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ mask()                               │
│ DataMaskingService                   │
│ ├─ maskPAN()           ABC1234F      │
│ ├─ maskAadhaar()       1234****3456  │
│ ├─ maskEmail()         u***@ex.com   │
│ ├─ maskPhone()         98765*****    │
│ ├─ maskBankAccount()   ****7654      │
│ ├─ maskEmployerName()  ABC****       │
│ ├─ maskRawText()       [MASKED]      │
│ └─ All sensitive data hidden         │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ validate()                           │
│ Check if masking is complete         │
│ ├─ No PAN patterns found ✓           │
│ ├─ No aadhaar patterns found ✓       │
│ ├─ No email patterns found ✓         │
│ ├─ No long numbers found ✓           │
│ └─ Ready for AI ✓                    │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ send_to_ai()                         │
│ Safe, Masked Data                    │
│ └─ NO raw sensitive data sent!       │
└──────────────────────────────────────┘
```

---

## Database Index Strategy

```
transactions TABLE

┌─────────────────────────────────────────────────┐
│ PRIMARY KEY: id (UUID)                          │
│ - Ensures uniqueness                            │
│ - Used for GET /transactions/:id                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ INDEX: idx_transactions_date ON (date)          │
│ - Used by: ORDER BY date, monthly queries       │
│ - Speed: 10x faster on 10K+ rows                │
│ - Query: SELECT * WHERE strftime('%Y-%m', date)│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ INDEX: idx_transactions_type ON (type)          │
│ - Used by: WHERE type='CREDIT'/'DEBIT'          │
│ - Speed: 5x faster filtering                    │
│ - Query: SELECT * WHERE type='DEBIT'            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ INDEX: idx_transactions_category                │
│ - Used by: WHERE category='Food'                │
│ - Speed: Instant category filtering             │
│ - Query: WHERE expenseCategory = ?              │
└─────────────────────────────────────────────────┘

Example Query Performance:

❌ Without Index:        ✅ With Index:
   Scan: 10,000 rows       Scan: 50 rows
   Time: 150ms             Time: 5ms
   
   Improvement: 30x faster!
```

---

## Component Hierarchy

```
┌─ GemVitya (Main)
│
├─ Header
│  └─ Theme Toggle (Dark/Light)
│
├─ Tab Navigation
│  ├─ e-Bahikhata Button
│  ├─ Tax Simulator Button
│  └─ Finance Dashboard Button
│
├─ Tab Content (Active)
│  │
│  ├─ [e-Bahikhata Tab]
│  │  ├─ Summary Metrics (Grid)
│  │  │  ├─ Income Card
│  │  │  ├─ Expenses Card
│  │  │  ├─ Savings Card
│  │  │  └─ Count Card
│  │  │
│  │  ├─ Alerts
│  │  │  ├─ Error Alert
│  │  │  └─ Success Alert
│  │  │
│  │  ├─ Action Bar
│  │  │  ├─ Add Transaction Button
│  │  │  └─ Export CSV Button
│  │  │
│  │  ├─ [Conditional] Add/Edit Form
│  │  │  └─ Form with inputs and selects
│  │  │
│  │  ├─ Filters Card
│  │  │  ├─ Month Input
│  │  │  ├─ Category Select
│  │  │  ├─ Type Select
│  │  │  └─ Mode Select
│  │  │
│  │  └─ Transactions Table
│  │     ├─ Table Header (th)
│  │     └─ Table Body Rows (tr)
│  │        ├─ Date
│  │        ├─ Amount (Badge)
│  │        ├─ Type (Badge)
│  │        ├─ Mode (Badge)
│  │        ├─ Category
│  │        ├─ Notes
│  │        └─ Actions (Edit, Delete buttons)
│  │
│  ├─ [Tax Simulator Tab]
│  │  ├─ [Upload View]
│  │  │  ├─ Document Type Radio
│  │  │  ├─ File Upload Input
│  │  │  └─ Manual Data Entry Form
│  │  │     ├─ PAN Input
│  │  │     ├─ Salary Inputs
│  │  │     ├─ TDS Input
│  │  │     ├─ Employer Input
│  │  │     └─ Deductions Section
│  │  │
│  │  ├─ [Preview View]
│  │  │  ├─ Data Summary Cards
│  │  │  └─ Simulate Button
│  │  │
│  │  ├─ [Simulation View]
│  │  │  ├─ Old Regime Card
│  │  │  ├─ New Regime Card
│  │  │  ├─ Recommendation Alert
│  │  │  └─ ITR Guide Button
│  │  │
│  │  └─ [Guide View]
│  │     └─ Numbered Steps (1-16)
│  │        ├─ Step Number Circle
│  │        ├─ Step Title
│  │        ├─ Step Description
│  │        ├─ Details List
│  │        └─ Hints Box
│  │
│  └─ [Finance Dashboard Tab]
│     ├─ Month Selector
│     │  └─ Input Month
│     │
│     ├─ Key Metrics (Grid 2x2)
│     │  ├─ Monthly Income
│     │  ├─ Monthly Expenses
│     │  ├─ Savings Rate
│     │  └─ Total Investments
│     │
│     ├─ [Conditional] Health Score Section
│     │  ├─ Health Score Circle Chart
│     │  ├─ Rating Badge
│     │  └─ Component Scores
│     │
│     ├─ Charts Grid (2x2)
│     │  ├─ Line Chart (Trend)
│     │  ├─ Pie Chart (Categories)
│     │  ├─ Bar Chart (Breakdown)
│     │  └─ Distribution Chart
│     │
│     └─ [Conditional] Recurring Expenses
│        └─ Recurring List Items
│           ├─ Pattern Name
│           ├─ Category
│           ├─ Amount
│           └─ Confidence %
│
└─ Footer
   ├─ Version Info
   └─ Disclaimer
```

---

## API Response Examples

### Create Transaction
```json
POST /api/gem-vitya/transactions

REQUEST:
{
  "amount": 5000,
  "type": "DEBIT",
  "mode": "ONLINE",
  "date": "2024-12-01",
  "expenseCategory": "Food",
  "notes": "Groceries"
}

RESPONSE:
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 5000,
    "type": "DEBIT",
    "mode": "ONLINE",
    "date": "2024-12-01",
    "expenseCategory": "Food",
    "notes": "Groceries",
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

### Get Monthly Analytics
```json
GET /api/gem-vitya/analytics/monthly?month=2024-12

RESPONSE:
{
  "success": true,
  "data": {
    "monthlyIncome": 50000,
    "monthlyExpenses": 35500,
    "savingsRate": 29,
    "topExpenseCategory": {
      "category": "Rent",
      "amount": 15000
    },
    "categoryBreakdown": [
      { "category": "Rent", "amount": 15000, "percentage": 42.25 },
      { "category": "Food", "amount": 2500, "percentage": 7.04 }
    ]
  }
}
```

### Get Health Score
```json
GET /api/gem-vitya/analytics/health

RESPONSE:
{
  "success": true,
  "data": {
    "score": 72,
    "rating": "Good",
    "breakdown": [
      { "category": "Savings Rate", "score": 65 },
      { "category": "Expense Diversity", "score": 80 },
      { "category": "Payment Balance", "score": 75 },
      { "category": "Investment Activity", "score": 75 }
    ]
  }
}
```

---

## Security & Privacy Flow

```
User Data Input
      │
      ├─────────────────────────────────┐
      │                                 │
      ▼                                 ▼
   Regular Data              Sensitive Data
   (Amounts, Dates)          (PAN, Aadhaar, etc.)
      │                                 │
      │                                 ▼
      │                      DataMaskingService
      │                      - masks all sensitive
      │                      - ABC1234F → ABC****F
      │                                 │
      └─────────────────┬───────────────┘
                        │
                        ▼
              Masked Safe Payload
                        │
                        ▼
              Validation Check
              - No PAN patterns
              - No aadhaar found
              - No account numbers
              - Safe for AI ✓
                        │
                        ▼
              Ready for Processing
              - Database storage (safe)
              - AI API calls (safe)
              - Log files (safe)
```

---

## Performance Optimization Points

```
Database:
├─ Indexes on frequently filtered columns
├─ Pagination for large result sets
├─ Cached aggregations (analytics)
└─ Connection pooling

API:
├─ Parallel requests for analytics
├─ Response compression
├─ Request validation early
└─ Error handling with specific codes

Frontend:
├─ Component memoization
├─ Lazy loading for tabs
├─ Chart data pre-computation
├─ Local state caching
└─ Efficient re-renders

Caching:
├─ Analytics cache (5 min TTL)
├─ Tax calculations cache (1 hr TTL)
├─ Browser localStorage for prefs
└─ Redis for distributed cache (optional)
```

---

This architecture is designed to be:
- **Scalable**: Can handle growing data
- **Secure**: Privacy-first with masking
- **Fast**: Indexed queries, caching
- **Maintainable**: Modular components
- **Extensible**: Easy to add features

Perfect for growth from startup to scale! 🚀
