# Gem Vitya - Quick Start Guide

Get Gem Vitya up and running in 5 minutes!

## ⚡ Quick Start

### 1. **Server Setup** (2 min)

```bash
# Terminal 1: Start the backend
cd apps/server

# Install if not done
npm install

# Start dev server
npm run dev
```

Server runs on `http://localhost:3001`

### 2. **Frontend Setup** (2 min)

```bash
# Terminal 2: Start the frontend
cd apps/web

# Install if not done
npm install

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5173` (or similar)

### 3. **Database Setup** (1 min)

The database is automatically initialized on first run at:
- **Development**: `./gem-suite.sqlite`
- **Production**: `~/.local/share/GemSuite/gem-suite.sqlite`

Run the SQL migrations from `GEM_VITYA_INTEGRATION.md` to create tables.

### 4. **Access Gem Vitya**

Navigate to your app shell and look for **"Gem Vitya"** (💎 icon):

```
Your App Shell
├── 🏠 Home
├── 💎 Gem Vitya  ← Click here
└── Other Apps
```

## 🎯 First Steps

### Fill in e-Bahikhata (Digital Ledger)

1. Click **"📊 e-Bahikhata"** tab
2. Click **"➕ Add Transaction"**
3. Fill in the form:
   ```
   Amount: 5000
   Type: Debit (Expense)
   Mode: Online
   Date: Today
   Category: Food
   Notes: Groceries
   ```
4. Click **"💾 Save"**
5. See it appear in the table below

### Try Tax Simulator

1. Click **"📋 Tax Simulator"** tab
2. Fill in your financial data:
   ```
   PAN: ABCDE1234F
   Gross Salary: 1,200,000
   Taxable Salary: 1,200,000
   TDS Paid: 150,000
   Employer: Your Company
   Section 80C: 150,000
   ```
3. Click **"▶️ Next: Preview & Edit"**
4. Review and click **"🧮 Simulate Tax"**
5. See tax comparison: Old Regime vs New Regime
6. Click **"📖 View ITR Filing Guide"** for step-by-step instructions

### View Finance Dashboard

1. Click **"📈 Finance Dashboard"** tab
2. See your financial metrics:
   - Monthly Income & Expenses
   - Savings Rate
   - Financial Health Score
3. View interactive charts showing trends and patterns
4. Check detected recurring expenses

## 📊 Example Scenario

Let's say you earn ₹50,000/month:

### Transactions for November
```
Nov 1:  +50,000  (Salary)        [CREDIT]
Nov 5:  -15,000  (Rent)          [DEBIT, Cash]
Nov 10: -2,500   (Groceries)     [DEBIT, Online]
Nov 15: -5,000   (Transport)     [DEBIT, Cash]
Nov 20: -3,000   (Entertainment) [DEBIT, Online]
Nov 25: -5,000   (SIP)           [CREDIT, Online]
```

### Dashboard Shows
- Income: ₹50,000
- Expenses: ₹25,500
- Savings: ₹24,500
- Savings Rate: 49%
- Top Category: Rent (₹15,000)

### Tax Simulator With
```
Gross: ₹1,200,000
TDS: ₹150,000
Deductions: ₹475,000 (80C + 80D + HRA)

Old Regime Tax: ₹125,000
New Regime Tax: ₹140,000

→ Old Regime SAVES ₹15,000 ✅
```

## 🎨 Features Demo

### Dark Mode
- Click **🌙** in header to toggle dark mode
- Preference is remembered in browser

### Export Transactions
- Click **"📥 Export CSV"** to download
- Opens in Excel or spreadsheet app

### Search & Filter
- Filter by Month, Category, Type, Mode
- Real-time updates
- Multiple filters work together

## 🔧 API Endpoints (for testing)

Use Postman, Insomnia, or `curl`:

### Create Transaction
```bash
curl -X POST http://localhost:3001/api/gem-vitya/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "type": "DEBIT",
    "mode": "ONLINE",
    "date": "2024-12-01",
    "expenseCategory": "Food",
    "notes": "Groceries"
  }'
```

### Get Transactions
```bash
curl "http://localhost:3001/api/gem-vitya/transactions?month=2024-12"
```

### Get Analytics
```bash
curl "http://localhost:3001/api/gem-vitya/analytics/monthly?month=2024-12"
```

### Get Financial Health
```bash
curl "http://localhost:3001/api/gem-vitya/analytics/health"
```

## 📱 Mobile Testing

The app is fully responsive:

### Desktop (1920px)
- All features visible
- 2-column charts

### Tablet (768px)
- Stacked layout
- Single column charts
- Touch-friendly buttons

### Mobile (375px)
- Vertical stack
- Large touch targets
- Hamburger menu support

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Database Locked
```bash
# SQLite is single-writer
# Close other connections and retry
rm gem-suite.sqlite
npm run dev  # Reinitialize
```

### CORS Errors
```typescript
// Ensure CORS is enabled in server
app.use(cors());
```

### No Data Showing
1. Check browser console for errors (F12)
2. Check server logs
3. Verify database has tables (see Integration Guide)
4. Try adding sample data first

## 📚 Sample Data

To start with demo data:

```typescript
// In your database initialization
import { SAMPLE_TRANSACTIONS } from './sampleData';

// Insert sample transactions
for (const tx of SAMPLE_TRANSACTIONS) {
  await transactionService.createTransaction(tx);
}
```

## 🚀 Next Steps

1. **Integrate with Gem Suite** → See `GEM_VITYA_INTEGRATION.md`
2. **Setup AI Features** → Configure AI provider (Gemini/OpenAI)
3. **Add Notifications** → Setup email alerts for budget
4. **Connect Bank Account** → Use Plaid API for auto-sync
5. **Deploy to Production** → Build and deploy Docker container

## 📖 Documentation

- **Full README**: `GEM_VITYA_README.md`
- **Integration Guide**: `GEM_VITYA_INTEGRATION.md`
- **API Docs**: See routes in `apps/server/src/routes/gemVityaRoutes.ts`

## 💡 Pro Tips

### ✅ Best Practices
- ✅ Categorize all transactions consistently
- ✅ Add notes for large or unclear transactions
- ✅ Review your dashboard monthly
- ✅ Update deductions before tax season
- ✅ Keep Form 16 handy for reference

### ❌ Avoid
- ❌ Mixing personal and business expenses
- ❌ Not keeping receipts for deductions
- ❌ Forgetting about small recurring expenses
- ❌ Filing taxes at the last minute
- ❌ Trusting calculations without verification

## 🎓 Learn More

### Tax Concepts
- **Section 80C**: Life insurance, PPF, ELSS (Max ₹150,000)
- **Section 80D**: Health insurance (Max ₹25,000)
- **HRA**: House Rent Allowance
- **New Regime**: Lower tax rates but no deductions

### Finance Concepts
- **Savings Rate**: (Income - Expenses) / Income
- **Recurring Expenses**: Monthly repeat transactions
- **Financial Health**: Composite score of your finances
- **ITR**: Income Tax Return filing document

## 🤝 Support

- **Issues**: Check Integration Guide troubleshooting
- **Questions**: Refer to full README
- **Code**: All well-commented and typed with TypeScript

---

**🎉 Congratulations!** You're now using Gem Vitya!

Start tracking your finances today and get smarter with your money. 💰

Made with ❤️ for Indian Personal Finance | 🇮🇳
