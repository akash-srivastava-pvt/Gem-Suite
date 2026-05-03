# Gem Vitya - Integration Guide

This guide explains how to integrate Gem Vitya into the existing Gem Suite application.

## 1. Register the Routes in Server

Edit `apps/server/src/server.ts`:

```typescript
import { createGemVityaRoutes } from './routes/gemVityaRoutes';

// Initialize services
const transactionService = new TransactionService(db);
const analyticsService = new AnalyticsService(db);
const taxAdvisor = new TaxAdvisor(aiProvider);

// Register routes
app.use('/api/gem-vitya', createGemVityaRoutes(db, aiProvider));

// Or if you have an app routing system:
registerRoute('gem-vitya', createGemVityaRoutes(db, aiProvider));
```

## 2. Register the Component in Shell

Edit `apps/web/src/Shell/appRegistry.ts` or similar:

```typescript
import GemVitya from '../appGroup/GemVitya/GemVitya';

export const APPS = [
  // ... other apps
  {
    id: 'gem-vitya',
    name: 'Gem Vitya',
    description: 'Personal Finance AI Assistant',
    icon: '💎',
    component: GemVitya,
    category: 'Finance'
  }
];
```

Or in your app shell component:

```tsx
<ShellApp
  id="gem-vitya"
  name="Gem Vitya"
  icon="💎"
  component={GemVitya}
/>
```

## 3. Create Database Tables

Run these SQL migrations:

```sql
-- Transactions table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('CREDIT', 'DEBIT')),
  mode TEXT NOT NULL CHECK(mode IN ('CASH', 'ONLINE')),
  transactionId TEXT,
  date TEXT NOT NULL,
  expenseCategory TEXT,
  savingCategory TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(expenseCategory);
CREATE INDEX idx_transactions_month ON transactions(strftime('%Y-%m', date));

-- Tax documents table (optional)
CREATE TABLE taxDocuments (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('FORM16', 'FORM26AS')),
  fileName TEXT,
  filePath TEXT,
  uploadedAt TEXT,
  processedAt TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tax extractions table (optional)
CREATE TABLE taxExtractions (
  id TEXT PRIMARY KEY,
  documentId TEXT,
  pan TEXT,
  grossSalary REAL,
  taxableSalary REAL,
  tds REAL,
  employerName TEXT,
  deductionsJson TEXT,
  assessmentYear TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(documentId) REFERENCES taxDocuments(id)
);
```

## 4. Initialize AI Provider

If using Gem Suite's existing AI provider:

```typescript
// In server initialization
import { initializeAIProvider } from '@gem/ai';

const aiProvider = initializeAIProvider({
  provider: process.env.AI_PROVIDER || 'gemini',
  apiKey: process.env.AI_API_KEY
});

const gemVityaRoutes = createGemVityaRoutes(db, aiProvider);
```

## 5. Connect Frontend to Backend

In `GemVitya.tsx`, the API base URL defaults to `/api/gem-vitya`, but you can customize:

```tsx
<GemVitya apiBaseURL="http://localhost:3001/api/gem-vitya" />
```

## 6. Environment Setup

Add to your `.env`:

```env
# Gem Vitya Configuration
GEM_VITYA_ENABLED=true
GEM_VITYA_API_BASE=http://localhost:3001/api/gem-vitya

# Optional AI Features
ENABLE_TAX_AI=true
ENABLE_EXPENSE_CLASSIFICATION=true
ENABLE_RECURRING_DETECTION=true

# PDF Processing (if using)
ENABLE_PDF_EXTRACTION=false  # Requires pdfjs-dist
```

## 7. Install Additional Dependencies (Optional)

For advanced features, install:

```bash
# PDF extraction
npm install pdfjs-dist

# Professional charts
npm install recharts

# Email notifications
npm install nodemailer

# Background jobs
npm install bull redis
```

## 8. Add Budget Alerts (Optional)

Create a service worker or background job:

```typescript
// services/budgetAlertService.ts
export class BudgetAlertService {
  async checkBudgets(userId: string) {
    const budgets = await this.getBudgets(userId);
    const currentSpending = await this.getCurrentMonthSpending(userId);
    
    for (const budget of budgets) {
      if (currentSpending[budget.category] > budget.limit * 0.8) {
        await this.sendAlert(userId, {
          category: budget.category,
          budget: budget.limit,
          spent: currentSpending[budget.category]
        });
      }
    }
  }
}
```

## 9. Add Recurring Expense Detection (Optional)

```typescript
// services/recurringExpenseDetector.ts
export class RecurringExpenseDetector {
  async detectPatterns(transactions: Transaction[]) {
    const monthlyTotals = this.groupByMonth(transactions);
    const patterns = [];
    
    // ML logic to detect recurring amounts
    for (const category in monthlyTotals) {
      const amounts = monthlyTotals[category].amounts;
      if (this.isRecurring(amounts)) {
        patterns.push({
          category,
          estimatedAmount: this.calculateAverage(amounts),
          confidence: this.calculateConfidence(amounts)
        });
      }
    }
    
    return patterns;
  }
}
```

## 10. Add Tax Simulation Cache

For performance, cache tax calculations:

```typescript
// ai/taxAdvisor.ts - enhanced version
private cache = new Map<string, TaxSimulation>();

async simulateTax(documentId: string, extractedData: TaxDocumentExtraction) {
  const cacheKey = `${extractedData.pan}-${extractedData.assessmentYear}`;
  
  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey);
  }
  
  const simulation = await this.runSimulation(extracted Data);
  this.cache.set(cacheKey, simulation);
  
  // Expire cache after 1 hour
  setTimeout(() => this.cache.delete(cacheKey), 3600000);
  
  return simulation;
}
```

## Testing Gem Vitya

### Unit Tests

```typescript
// tests/unit/transactionService.spec.ts
describe('TransactionService', () => {
  let service: TransactionService;
  let db: DatabaseModel;

  beforeEach(() => {
    db = new DatabaseModel();
    service = new TransactionService(db);
  });

  it('should create a transaction', async () => {
    const tx = await service.createTransaction({
      amount: 1000,
      type: 'DEBIT',
      mode: 'ONLINE',
      date: new Date(),
      expenseCategory: 'Food'
    });
    
    expect(tx.id).toBeDefined();
    expect(tx.amount).toBe(1000);
  });
});
```

### Integration Tests

```typescript
// tests/integration/gemVitya.spec.ts
describe('Gem Vitya Integration', () => {
  let app: Express;
  let db: DatabaseModel;

  beforeAll(() => {
    db = new DatabaseModel();
    app = createApp(db);
  });

  it('POST /api/gem-vitya/transactions creates transaction', async () => {
    const res = await request(app)
      .post('/api/gem-vitya/transactions')
      .send({
        amount: 1000,
        type: 'DEBIT',
        mode: 'ONLINE',
        date: new Date().toISOString(),
        expenseCategory: 'Food'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

## Troubleshooting

### Issue: CORS errors
**Solution**: Ensure CORS is configured in server
```typescript
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));
```

### Issue: Database not initialized
**Solution**: Initialize DB before registering routes
```typescript
await db.init();
app.use('/api/gem-vitya', createGemVityaRoutes(db, aiProvider));
```

### Issue: Tax calculation not working
**Solution**: Ensure AI provider is configured
```typescript
if (!aiProvider) {
  taxAdvisor.calculateManualTax(data);  // Fallback
}
```

### Issue: Chart not displaying
**Solution**: Ensure component renders properly
```tsx
{analytics && <FinanceDashboardTab apiBaseURL={apiBaseURL} />}
```

## Performance Optimization

### Database Queries
```typescript
// Add indexes for frequently filtered fields
CREATE INDEX idx_month_category ON transactions(
  strftime('%Y-%m', date), expenseCategory
);

// Use pagination for large datasets
const limit = 50;
const offset = (page - 1) * limit;
query += ` LIMIT ${limit} OFFSET ${offset}`;
```

### API Response Caching
```typescript
// Cache analytics for 5 minutes
const analyticsCache = new Map();
const getCachedAnalytics = (month: string) => {
  const cached = analyticsCache.get(month);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  return null;
};
```

### Frontend Optimization
```tsx
// Memoize expensive components
const ExpenseChart = React.memo(({ data }) => (
  <Chart data={data} />
));

// Use lazy loading for tabs
const TaxSimulator = lazy(() => import('./TaxSimulator'));
```

## Monitoring & Analytics

Add logging for important operations:

```typescript
// Log transaction creation
logger.info('transaction.created', {
  transactionId: tx.id,
  amount: tx.amount,
  category: tx.category,
  timestamp: new Date().toISOString()
});

// Log tax simulations
logger.info('tax.simulated', {
  documentId,
  grossSalary: data.grossSalary,
  oldRegimeTax,
  newRegimeTax
});
```

---

For questions or issues, refer to `GEM_VITYA_README.md` or the main Gem Suite documentation.
