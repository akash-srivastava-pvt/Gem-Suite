/**
 * Gem Vitya - API Routes
 * Express routes for all Gem Vitya endpoints
 */

import express, { Router, Request, Response } from 'express';
import { TransactionService } from '../services/transactionService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { TaxAdvisorService } from '../ai/taxAdvisor.js';
import { PDFExtractionService } from '../utility/pdfExtraction.js';

export function createGemVityaRoutes(db: any, aiProvider: any): Router {
  const router = Router();

  const transactionService = new TransactionService(db);
  const analyticsService = new AnalyticsService(db);
  const taxAdvisor = new TaxAdvisorService(aiProvider);

  // ============================================
  // TRANSACTION ENDPOINTS (e-Bahikhata)
  // ============================================

  /**
   * POST /api/gem-vitya/transactions
   * Create a new transaction
   */
  router.post('/transactions', async (req: Request, res: Response) => {
    try {
      const { amount, type, mode, transactionId, date, expenseCategory, savingCategory, notes } = req.body;

      // Validate required fields
      if (!amount || !type || !mode || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const transaction = await transactionService.createTransaction({
        amount: parseFloat(amount),
        type,
        mode,
        transactionId,
        date: new Date(date),
        expenseCategory,
        savingCategory,
        notes
      });

      res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/gem-vitya/transactions
   * Get transactions with optional filters
   */
  router.get('/transactions', async (req: Request, res: Response) => {
    try {
      const { month, category, type, mode } = req.query;

      const transactions = await transactionService.getTransactions({
        month: month as string,
        category: category as string,
        type: type as 'CREDIT' | 'DEBIT',
        mode: mode as 'CASH' | 'ONLINE'
      });

      res.json({ success: true, data: transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/gem-vitya/transactions/:id
   * Get a specific transaction
   */
  router.get('/transactions/:id', async (req: Request, res: Response) => {
    try {
      const transaction = await transactionService.getTransactionById(req.params.id);

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/gem-vitya/transactions/:id
   * Update a transaction
   */
  router.put('/transactions/:id', async (req: Request, res: Response) => {
    try {
      const updates = req.body;

      // Parse date if provided
      if (updates.date) {
        updates.date = new Date(updates.date);
      }

      const transaction = await transactionService.updateTransaction(req.params.id, updates);

      res.json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /api/gem-vitya/transactions/:id
   * Delete a transaction
   */
  router.delete('/transactions/:id', async (req: Request, res: Response) => {
    try {
      await transactionService.deleteTransaction(req.params.id);
      res.json({ success: true, message: 'Transaction deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // ANALYTICS ENDPOINTS (Finance Dashboard)
  // ============================================

  /**
   * GET /api/gem-vitya/analytics/monthly
   * Get monthly financial analytics
   */
  router.get('/analytics/monthly', async (req: Request, res: Response) => {
    try {
      const { month } = req.query;
      const analytics = await analyticsService.getMonthlyAnalytics(month as string);

      res.json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/gem-vitya/analytics/categories
   * Get category-wise breakdown
   */
  router.get('/analytics/categories', async (req: Request, res: Response) => {
    try {
      const { month } = req.query;
      const categories = await analyticsService.getCategoryAnalytics(month as string);

      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/gem-vitya/analytics/savings
   * Get savings analytics
   */
  router.get('/analytics/savings', async (req: Request, res: Response) => {
    try {
      const { month } = req.query;
      const savings = await analyticsService.getSavingsAnalytics(month as string);

      res.json({ success: true, data: savings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/gem-vitya/analytics/recurring
   * Detect recurring expenses
   */
  router.get('/analytics/recurring', async (req: Request, res: Response) => {
    try {
      const recurring = await analyticsService.detectRecurringExpenses();

      res.json({ success: true, data: recurring });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/gem-vitya/analytics/health
   * Get financial health score
   */
  router.get('/analytics/health', async (req: Request, res: Response) => {
    try {
      const healthScore = await analyticsService.getFinancialHealthScore();

      res.json({ success: true, data: healthScore });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // TAX SIMULATION ENDPOINTS
  // ============================================

  /**
   * POST /api/gem-vitya/tax/simulate
   * Simulate tax calculation
   */
  router.post('/tax/simulate', async (req: Request, res: Response) => {
    try {
      const { documentId, extractedData } = req.body;

      if (!documentId || !extractedData) {
        return res.status(400).json({ error: 'Missing documentId or extractedData' });
      }

      const simulation = await taxAdvisor.simulateTax(documentId, extractedData);

      res.json({ success: true, data: simulation });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/gem-vitya/tax/calculate-manual
   * Calculate tax manually (without AI)
   */
  router.post('/tax/calculate-manual', (req: Request, res: Response) => {
    try {
      const { extractedData } = req.body;

      if (!extractedData) {
        return res.status(400).json({ error: 'Missing extractedData' });
      }

      const calculation = taxAdvisor.calculateManualTax(extractedData);
      const guide = taxAdvisor.generateITRFilingGuide();

      res.json({ 
        success: true, 
        data: { 
          calculation,
          guide
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/gem-vitya/tax/itr-guide
   * Get ITR filing guide
   */
  router.get('/tax/itr-guide', (req: Request, res: Response) => {
    try {
      const guide = taxAdvisor.generateITRFilingGuide();

      res.json({ success: true, data: guide });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PDF DOCUMENT ENDPOINTS
  // ============================================

  /**
   * POST /api/gem-vitya/documents/extract
   * Extract data from uploaded PDF (requires file upload implementation)
   */
  router.post('/documents/extract', async (req: Request, res: Response) => {
    try {
      const { filePath, documentType } = req.body;

      if (!filePath || !documentType) {
        return res.status(400).json({ error: 'Missing filePath or documentType' });
      }

      // In production, use actual PDF extraction
      // const extractedText = await PDFExtractionService.extractTextFromPDF(filePath);
      
      // For now, validate the extraction would work
      const parsed = PDFExtractionService.parseDocument('', documentType);
      
      const validation = PDFExtractionService.validateExtraction(parsed);

      res.json({ 
        success: true, 
        data: {
          extracted: parsed,
          validation
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/gem-vitya/documents/validate
   * Validate extracted data
   */
  router.post('/documents/validate', (req: Request, res: Response) => {
    try {
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      const validation = PDFExtractionService.validateExtraction(data);
      const enriched = PDFExtractionService.enrichExtraction(data);

      res.json({ 
        success: true, 
        data: {
          validation,
          enrichedData: enriched
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // EXPORT & UTILITIES
  // ============================================

  /**
   * GET /api/gem-vitya/export/csv
   * Export transactions as CSV
   */
  router.get('/export/csv', async (req: Request, res: Response) => {
    try {
      const { month } = req.query;

      const transactions = await transactionService.getTransactions({
        month: month as string
      });

      // Convert to CSV
      const csv = generateCSV(transactions);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/gem-vitya/export/summary
   * Get monthly summary
   */
  router.get('/export/summary', async (req: Request, res: Response) => {
    try {
      const { month } = req.query;

      const analytics = await analyticsService.getMonthlyAnalytics(month as string);
      const recurring = await analyticsService.detectRecurringExpenses();

      res.json({ 
        success: true, 
        data: {
          analytics,
          recurringExpenses: recurring
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

/**
 * Helper: Convert transactions to CSV format
 */
function generateCSV(transactions: any[]): string {
  if (transactions.length === 0) {
    return 'Date,Amount,Type,Mode,Category,Notes\n';
  }

  const headers = ['Date', 'Amount', 'Type', 'Mode', 'Expense Category', 'Saving Category', 'Notes'];
  const rows = transactions.map(t => [
    t.date?.toISOString?.()?.split('T')[0] || t.date,
    t.amount,
    t.type,
    t.mode,
    t.expenseCategory || '',
    t.savingCategory || '',
    `"${(t.notes || '').replace(/"/g, '""')}"` // Escape quotes
  ]);

  return [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
}
