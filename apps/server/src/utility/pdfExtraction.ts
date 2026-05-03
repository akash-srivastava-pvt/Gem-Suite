/**
 * Gem Vitya - PDF Extraction Service
 * Extracts text and data from Form 16 and Form 26AS documents
 */

import { TaxDocumentExtraction } from '@gem/shared';

export class PDFExtractionService {
  /**
   * Extract text from PDF (requires pdfjs-dist or similar library)
   * This is a placeholder - you'll need to install a PDF library
   */
  static async extractTextFromPDF(filePath: string): Promise<string> {
    // In production, use pdfjs-dist or similar:
    // const pdfLib = require('pdfjs-dist');
    // const pdf = await pdfLib.getDocument(filePath).promise;
    // Extract and concatenate text from all pages
    
    throw new Error('PDF extraction requires pdfjs-dist installation');
  }

  /**
   * Parse Form 16 extracted text to structured data
   */
  static parseForm16(extractedText: string): Partial<TaxDocumentExtraction> {
    const data: Partial<TaxDocumentExtraction> = {
      deductions: {}
    };

    // PAN extraction (format: ABCDE1234F)
    const panMatch = extractedText.match(/[A-Z]{3}[P-Z][A-Z]\d{4}[A-Z]/);
    if (panMatch) {
      data.pan = panMatch[0];
    }

    // Gross Salary extraction
    const grossMatch = extractedText.match(/Gross\s+Salary[:\s]*[\d,]+|Total\s+Salary[:\s]*[\d,]+/i);
    if (grossMatch) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.grossSalary = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    // Taxable Salary
    const taxableMatch = extractedText.match(/Taxable\s+Salary[:\s]*[\d,]+|Net\s+Salary[:\s]*[\d,]+/i);
    if (taxableMatch) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.taxableSalary = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    // TDS extraction
    const tdsMatch = extractedText.match(/TDS[:\s]*[\d,]+|Tax\s+Deducted[:\s]*[\d,]+/i);
    if (tdsMatch) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.tds = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    // Employer name
    const employerMatch = extractedText.match(/Employer[:\s]([^\n]+)|Organization[:\s]([^\n]+)/i);
    if (employerMatch) {
      data.employerName = employerMatch[1] || employerMatch[2];
    }

    // Section 80C (Life Insurance, PPF, ELSS, etc.)
    const section80CMatch = extractedText.match(/80C[:\s]*[\d,]+/i);
    if (section80CMatch && data.deductions) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.deductions.section80C = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    // Section 80D (Health Insurance)
    const section80DMatch = extractedText.match(/80D[:\s]*[\d,]+/i);
    if (section80DMatch && data.deductions) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.deductions.section80D = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    // HRA (House Rent Allowance)
    const hraMatch = extractedText.match(/HRA[:\s]*[\d,]+/i);
    if (hraMatch && data.deductions) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.deductions.hra = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    // Other Allowances
    const otherMatch = extractedText.match(/Allowances[:\s]*[\d,]+|Other[:\s]*[\d,]+/i);
    if (otherMatch && data.deductions) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.deductions.otherAllowances = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    // Assessment Year
    const yearMatch = extractedText.match(/FY\s*(\d{4}-\d{4})|Assessment\s+Year[:\s]*(\d{4}-\d{4})/i);
    if (yearMatch) {
      data.assessmentYear = yearMatch[1] || yearMatch[2];
    }

    return data;
  }

  /**
   * Parse Form 26AS (Annual Information Statement)
   */
  static parseForm26AS(extractedText: string): Partial<TaxDocumentExtraction> {
    const data: Partial<TaxDocumentExtraction> = {
      deductions: {}
    };

    // PAN extraction
    const panMatch = extractedText.match(/[A-Z]{3}[P-Z][A-Z]\d{4}[A-Z]/);
    if (panMatch) {
      data.pan = panMatch[0];
    }

    // Extract TDS information
    const tdsMatch = extractedText.match(/Total\s+TDS[:\s]*[\d,]+|TDS\s+Credit[:\s]*[\d,]+/i);
    if (tdsMatch) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.tds = parseInt(numbers[0].replace(/,/g, ''), 10);
      }
    }

    // Extract income information
    const incomeMatch = extractedText.match(/Total\s+Income[:\s]*[\d,]+|Gross\s+Income[:\s]*[\d,]+/i);
    if (incomeMatch) {
      const numbers = extractedText.match(/[\d,]+/);
      if (numbers) {
        data.grossSalary = parseInt(numbers[0].replace(/,/g, ''), 10);
        data.taxableSalary = data.grossSalary; // For 26AS, these are typically the same
      }
    }

    // Assessment year
    const yearMatch = extractedText.match(/FY\s*(\d{4}-\d{4})|Assessment\s+Year[:\s]*(\d{4}-\d{4})/i);
    if (yearMatch) {
      data.assessmentYear = yearMatch[1] || yearMatch[2];
    }

    return data;
  }

  /**
   * Generic document parser that detects type and parses accordingly
   */
  static parseDocument(extractedText: string, documentType: 'FORM16' | 'FORM26AS'): TaxDocumentExtraction {
    let data: Partial<TaxDocumentExtraction>;

    if (documentType === 'FORM16') {
      data = this.parseForm16(extractedText);
    } else {
      data = this.parseForm26AS(extractedText);
    }

    // Set defaults for missing fields
    return {
      pan: data.pan || '',
      grossSalary: data.grossSalary || 0,
      taxableSalary: data.taxableSalary || 0,
      tds: data.tds || 0,
      employerName: data.employerName || 'Unknown',
      deductions: data.deductions || {},
      assessmentYear: data.assessmentYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      rawText: extractedText
    };
  }

  /**
   * Validate extracted data quality
   */
  static validateExtraction(data: TaxDocumentExtraction): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!data.pan || data.pan.length !== 10) {
      issues.push('Invalid or missing PAN');
    }

    if (!data.grossSalary || data.grossSalary <= 0) {
      issues.push('Gross salary is missing or invalid');
    }

    if (!data.taxableSalary || data.taxableSalary <= 0) {
      issues.push('Taxable salary is missing or invalid');
    }

    if (data.taxableSalary > data.grossSalary) {
      issues.push('Taxable salary cannot be greater than gross salary');
    }

    if (!data.assessmentYear || !data.assessmentYear.match(/\d{4}-\d{4}/)) {
      issues.push('Invalid assessment year format');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Enrich extraction with calculated/inferred fields
   */
  static enrichExtraction(data: TaxDocumentExtraction): TaxDocumentExtraction {
    const enriched = { ...data };

    // Calculate total deductions
    const totalDeductions = 
      (enriched.deductions?.section80C || 0) +
      (enriched.deductions?.section80D || 0) +
      (enriched.deductions?.hra || 0) +
      (enriched.deductions?.otherAllowances || 0);

    // Infer deduction details if missing
    if (totalDeductions === 0 && enriched.taxableSalary < enriched.grossSalary) {
      enriched.deductions = {
        ...enriched.deductions,
        section80C: Math.round((enriched.grossSalary - enriched.taxableSalary) * 0.5),
        hra: Math.round((enriched.grossSalary - enriched.taxableSalary) * 0.5)
      };
    }

    return enriched;
  }
}
