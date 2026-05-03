# 💎 Gem Vitya - Personal Finance AI Assistant

A production-ready personal finance AI application for Indian users, built inside Gem Suite. Gem Vitya is a modular, scalable, privacy-first financial assistant that helps users track finances, simulate taxes, and gain financial insights.

## 🎯 Features

### Tab 1: e-Bahikhata (Digital Transaction Ledger)
- **Complete Transaction Management**
  - Add, edit, delete transactions
  - Search and filter by month, category, type, or mode
  - Export transactions as CSV
  - Real-time summary: Income, Expenses, Savings

- **Transaction Fields**
  - Amount, Type (Credit/Debit), Mode (Cash/Online)
  - Transaction ID, Date
  - Expense Categories: Food, Lifestyle, Transport, Rent, Shopping, Entertainment, Medical, Education, Others
  - Saving Categories: FD, SIP, PPF, Stocks, Mutual Funds, Gold, Emergency Fund, Others
  - Notes

### Tab 2: Income Tax Simulator
- **Form Upload & Extraction**
  - Support for Form 16 and Form 26AS
  - Data masking for sensitive information (PAN, Aadhaar, etc.)
  - Validated extraction pipeline

- **Tax Calculation**
  - Dual regime comparison (Old vs New)
  - Automatic tax calculation with surcharge and cess
  - TDS credit and refund calculation

- **Tax Saving Recommendations**
  - Section 80C (Insurance, PPF, ELSS)
  - Section 80D (Health Insurance)
  - NPS deductions
  - HRA optimization
  - Home loan interest deduction

- **Step-by-Step ITR Filing Guide**
  - 16-step comprehensive guide
  - Portal navigation instructions
  - Document requirements
  - E-verification process

### Tab 3: Finance Dashboard
- **Analytics & Insights**
  - Monthly income, expenses, savings rate
  - Top expense categories
  - Cash vs Online spending analysis
  - Investment tracking

- **Interactive Charts** (Built with custom components, Recharts-ready)
  - Monthly trend line chart
  - Expense pie chart by category
  - Payment mode distribution
  - Category breakdown bar chart

- **Financial Health Score**
  - AI-driven assessment (0-100)
  - Rating: Excellent/Good/Fair/Poor
  - Component breakdown analysis
  - Actionable recommendations

- **Recurring Expense Detection**
  - ML-based pattern detection
  - Confidence scoring
  - Category classification

## 📁 Project Structure

```
Gem-Suite/
├── packages/
│   ├── db/
│   │   └── src/
│   │       ├── db.ts
│   │       └── gemVitya.schema.ts          # Data schemas
│   └── shared/
│       └── src/
│           └── types.ts
│
├── apps/
│   ├── server/
│   │   └── src/
│   │       ├── server.ts
│   │       ├── routes/
│   │       │   └── gemVityaRoutes.ts       # All API endpoints
│   │       ├── services/
│   │       │   ├── transactionService.ts   # CRUD operations
│   │       │   └── analyticsService.ts     # Analytics aggregation
│   │       ├── ai/
│   │       │   ├── maskingService.ts       # Data masking utility
│   │       │   ├── taxAdvisor.ts           # Tax calculations
│   │       │   └── promptTemplates.ts      # AI prompts
│   │       └── utility/
│   │           └── pdfExtraction.ts        # PDF parsing
│   │
│   └── web/
│       └── src/
│           └── appGroup/
│               └── GemVitya/
│                   ├── GemVitya.tsx        # Main app component
│                   ├── GemVitya.css        # Styles
│                   ├── sampleData.ts       # Demo data
│                   └── tabs/
│                       ├── EBahikhataTab.tsx        # Transaction management
│                       ├── TaxSimulatorTab.tsx      # Tax calculations
│                       └── FinanceDashboardTab.tsx  # Analytics dashboard
```

## 🚀 API Endpoints

### Transaction APIs
```
POST   /api/gem-vitya/transactions          # Create transaction
GET    /api/gem-vitya/transactions          # Get all (with filters)
GET    /api/gem-vitya/transactions/:id      # Get single
PUT    /api/gem-vitya/transactions/:id      # Update
DELETE /api/gem-vitya/transactions/:id      # Delete
```

**Query Filters:**
- `?month=YYYY-MM` - Filter by month
- `?category=Food` - Filter by category
- `?type=CREDIT|DEBIT` - Filter by type
- `?mode=CASH|ONLINE` - Filter by mode

### Analytics APIs
```
GET    /api/gem-vitya/analytics/monthly     # Monthly summary
GET    /api/gem-vitya/analytics/categories  # By category
GET    /api/gem-vitya/analytics/savings     # Savings breakdown
GET    /api/gem-vitya/analytics/recurring   # Recurring expenses
GET    /api/gem-vitya/analytics/health      # Financial health score
```

### Tax APIs
```
POST   /api/gem-vitya/tax/simulate          # Run tax simulation
POST   /api/gem-vitya/tax/calculate-manual  # Manual calculation
GET    /api/gem-vitya/tax/itr-guide         # Get filing guide
POST   /api/gem-vitya/documents/extract     # Extract from PDF
POST   /api/gem-vitya/documents/validate    # Validate data
```

### Export APIs
```
GET    /api/gem-vitya/export/csv            # Export as CSV
GET    /api/gem-vitya/export/summary        # Export monthly summary
```

## 🛡️ Privacy & Security

### Data Masking Pipeline
```
Raw Document → Extract Text → Parse Data → Mask Sensitive → AI Processing
```

**Masked Fields:**
- PAN: `ABC1234567Z` → `ABC****67Z`
- Aadhaar: `1234 5678 9012 3456` → `**** **** 3456`
- Account: `1234567890987654` → `****7654`
- Email: `user@example.com` → `u***@example.com`

**Validation:**
- Pre-masking validation checks
- Post-masking security verification
- No sensitive data in logs

## 🧠 AI Integration

### Voice & Config
AI providers should implement:
```typescript
interface AIProvider {
  callAI(prompt: string): Promise<string>;
  getEmbeddings(text: string): Promise<number[]>;
}
```

### Prompt Templates
- Tax calculation prompt with masked data
- Expense classification
- Recurring pattern detection
- Financial health assessment
- Investment suggestions

## 🗄️ Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  amount FLOAT NOT NULL,
  type TEXT CHECK (type IN ('CREDIT', 'DEBIT')),
  mode TEXT CHECK (mode IN ('CASH', 'ONLINE')),
  transactionId VARCHAR(100),
  date DATETIME NOT NULL,
  expenseCategory VARCHAR(50),
  savingCategory VARCHAR(50),
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME
);
```

### Indexes
```sql
CREATE INDEX idx_date ON transactions(date);
CREATE INDEX idx_type ON transactions(type);
CREATE INDEX idx_category ON transactions(expenseCategory, savingCategory);
CREATE INDEX idx_month ON transactions(strftime("%Y-%m", date));
```

## 📊 Sample Data

See `sampleData.ts` for:
- Sample transactions (Income, Expenses, Investments)
- Sample tax data (Form 16 information)
- Sample ITR filing steps
- Sample analytics output

## 🎨 UI/UX Features

### Design System
- **Modern**: Gradient headers, smooth animations
- **Dark Mode**: Full dark mode support with toggle
- **Responsive**: Mobile-first design
- **Accessible**: Semantic HTML, ARIA labels

### Theme Colors
- Primary: `#8b5cf6` (Purple)
- Secondary: `#ec4899` (Pink)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)
- Accent: `#f59e0b` (Amber)

### Components
- Form inputs with validation
- Table with sorting/filtering
- Cards with hover effects
- Charts (custom-built, Recharts-compatible)
- Badges for status indicators
- Alerts for user feedback

## 🔧 Configuration

### Environment Variables
```env
# Server
NODE_ENV=production
API_PORT=3001

# Database
DB_PATH=/path/to/gem-suite.sqlite

# AI Provider
AI_PROVIDER=openai|gemini|local
AI_API_KEY=your_api_key

# Features
ENABLE_PDF_EXTRACTION=true
ENABLE_AI_SUGGESTIONS=true
ENABLE_EMAIL_ALERTS=false
```

### Feature Flags
- `ENABLE_PDF_EXTRACTION` - Use ML for PDF extraction
- `ENABLE_AI_SUGGESTIONS` - Run AI recommendations
- `ENABLE_BUDGET_ALERTS` - Send email notifications
- `ENABLE_RECURRING_DETECTION` - Pattern detection

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "sql.js": "Latest",
  "uuid": "Latest"
}
```

### Frontend
```json
{
  "react": "^18.0.0",
  "typescript": "Latest"
}
```

**Optional (for advanced features):**
- `pdfjs-dist` - PDF text extraction
- `recharts` - Professional charts
- `nodemailer` - Email notifications
- `bull` - Background jobs

## 🧪 Testing

### Transaction Service
```typescript
const service = new TransactionService(db);
const tx = await service.createTransaction({
  amount: 1000,
  type: 'DEBIT',
  mode: 'ONLINE',
  date: new Date(),
  expenseCategory: 'Food'
});
```

### Analytics Service
```typescript
const analytics = new AnalyticsService(db);
const monthly = await analytics.getMonthlyAnalytics('2024-12');
const health = await analytics.getFinancialHealthScore();
```

### Tax Advisor
```typescript
const taxAdvisor = new TaxAdvisor(aiProvider);
const simulation = await taxAdvisor.simulateTax(docId, extractedData);
const guide = taxAdvisor.generateITRFilingGuide();
```

## 🚀 Deployment

### Development
```bash
# Terminal 1: Start backend
cd apps/server
npm run dev

# Terminal 2: Start frontend
cd apps/web
npm run dev
```

### Production Build
```bash
# Build backend
cd apps/server
npm run bundle

# Build frontend
cd apps/web
npm run build

# Run bundled version
NODE_ENV=production node dist/server.js
```

## 📈 Future Enhancements

### Phase 2 Features
- ✅ Budget alerts via email
- ✅ Multi-currency support
- ✅ Investment portfolio tracking
- ✅ Expense categorization ML
- ✅ Tax projection for next year
- ✅ Financial goal setting
- ✅ Loan EMI calculator

### Phase 3 (YC-Level Features)
- 🤖 **AI Financial Copilot**
  - Auto-transaction classification
  - Expense predictions
  - Investment recommendations
  - Tax forecast
  - Financial health score with actions

- 📱 **Mobile App** (React Native)
  - Receipt scanning OCR
  - Voice transaction input
  - Push notifications
  - Offline sync

- 🔄 **Integration Layer**
  - Bank auto-sync (Plaid API)
  - Investment platform APIs
  - Tax filing portal integration
  - Accounting software sync

## 📝 License

This project is part of Gem Suite. All rights reserved.

## 🤝 Contributing

For contributions:
1. Follow the modular architecture
2. Add tests for new services
3. Update type definitions
4. Follow the coding style
5. Document API changes

## 💬 Support

For issues or questions, open an issue in the Gem Suite repository.

---

**Made with ❤️ for Indian Personal Finance | 🇮🇳**
