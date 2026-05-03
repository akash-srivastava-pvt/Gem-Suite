/**
 * Gem Vitya - Tax Advisor Service
 * Handles tax calculations, simulations, and AI-driven recommendations
 */

import { TaxDocumentExtraction, TaxSimulation, TaxCalculation, TaxSavingsSuggestion, ITRFilingStep } from '@gem/shared';
import { DataMaskingService } from './maskingService.js';
import { TaxPromptTemplates } from './promptTemplates.js';
import { v4 as uuidv4 } from 'uuid';

export interface AIResponse {
  oldRegime: TaxCalculation;
  newRegime: TaxCalculation;
  refund: number;
  recommendations: TaxSavingsSuggestion[];
  itrFilingSteps: ITRFilingStep[];
}

export class TaxAdvisorService {
  private aiProvider: any;

  constructor(aiProvider: any) {
    this.aiProvider = aiProvider;
  }

  /**
   * Simulate tax calculation using AI
   */
  async simulateTax(documentId: string, extractedData: TaxDocumentExtraction): Promise<TaxSimulation> {
    // Step 1: Validate extraction
    if (!this.isValidExtraction(extractedData)) {
      throw new Error('Invalid tax document extraction');
    }

    // Step 2: Mask sensitive data
    const maskedData = DataMaskingService.maskTaxDocumentData(extractedData);

    // Step 3: Validate masking
    const maskValidation = DataMaskingService.validateMasking(maskedData);
    if (!maskValidation.isValid) {
      throw new Error(`Masking validation failed: ${maskValidation.issues.join(', ')}`);
    }

    // Step 4: Generate prompt and send to AI
    const prompt = TaxPromptTemplates.getTaxCalculationPrompt(maskedData);
    
    let aiResponse: AIResponse;
    try {
      const response = await this.aiProvider.callAI(prompt);
      aiResponse = JSON.parse(response);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get tax calculation from AI service');
    }

    // Step 5: Validate AI response
    if (!this.isValidAIResponse(aiResponse)) {
      throw new Error('Invalid tax calculation response from AI');
    }

    // Step 6: Return tax simulation
    const taxSimulation: TaxSimulation = {
      id: uuidv4(),
      documentId,
      oldRegimeTax: aiResponse.oldRegime,
      newRegimeTax: aiResponse.newRegime,
      refund: aiResponse.refund,
      taxSavings: aiResponse.recommendations.map(rec => ({
        ...rec,
        id: uuidv4()
      })),
      filingGuide: aiResponse.itrFilingSteps,
      createdAt: new Date()
    };

    return taxSimulation;
  }

  /**
   * Calculate manual tax (fallback when AI is unavailable)
   */
  calculateManualTax(data: TaxDocumentExtraction): { oldRegime: TaxCalculation; newRegime: TaxCalculation } {
    const standardDeduction = 50000;

    // OLD REGIME
    const oldRegimeDeductions = 
      (data.deductions?.section80C || 0) +
      (data.deductions?.section80D || 0) +
      (data.deductions?.hra || 0) +
      standardDeduction;

    const oldRegimeTaxable = Math.max(0, data.grossSalary - oldRegimeDeductions);
    const oldRegimeTax = this.calculateOldRegimeTax(oldRegimeTaxable);

    // NEW REGIME (No deductions except standard deduction)
    const newRegimeTaxable = Math.max(0, data.grossSalary - standardDeduction);
    const newRegimeTax = this.calculateNewRegimeTax(newRegimeTaxable);

    return {
      oldRegime: {
        grossIncome: data.grossSalary,
        deductions: oldRegimeDeductions,
        taxableIncome: oldRegimeTaxable,
        standardDeduction: standardDeduction,
        taxPayable: oldRegimeTax,
        healthInsuranceDeduction: data.deductions?.section80D || 0,
        homeLoantInterestDeduction: 0,
        npsDeduction: 0
      },
      newRegime: {
        grossIncome: data.grossSalary,
        deductions: standardDeduction,
        taxableIncome: newRegimeTaxable,
        standardDeduction: standardDeduction,
        taxPayable: newRegimeTax,
        healthInsuranceDeduction: 0,
        homeLoantInterestDeduction: 0,
        npsDeduction: 0
      }
    };
  }

  /**
   * Calculate tax under old regime (FY 2024-25)
   */
  private calculateOldRegimeTax(taxableIncome: number): number {
    let tax = 0;

    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 10000 + (taxableIncome - 500000) * 0.2;
    } else {
      tax = 110000 + (taxableIncome - 1000000) * 0.3;
    }

    // Add surcharge if applicable
    if (taxableIncome > 5000000) {
      tax = tax * 1.25; // 25% surcharge
    } else if (taxableIncome > 1000000) {
      tax = tax * 1.15; // 15% surcharge
    }

    // Add cess (4%)
    tax = tax * 1.04;

    return Math.round(tax);
  }

  /**
   * Calculate tax under new regime (FY 2024-25)
   */
  private calculateNewRegimeTax(taxableIncome: number): number {
    let tax = 0;

    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 400000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 500000) {
      tax = 5000 + (taxableIncome - 400000) * 0.1;
    } else if (taxableIncome <= 750000) {
      tax = 15000 + (taxableIncome - 500000) * 0.15;
    } else if (taxableIncome <= 1000000) {
      tax = 52500 + (taxableIncome - 750000) * 0.2;
    } else if (taxableIncome <= 1250000) {
      tax = 112500 + (taxableIncome - 1000000) * 0.25;
    } else if (taxableIncome <= 1500000) {
      tax = 175000 + (taxableIncome - 1250000) * 0.3;
    } else {
      tax = 250000 + (taxableIncome - 1500000) * 0.3;
    }

    // Add surcharge if applicable
    if (taxableIncome > 5000000) {
      tax = tax * 1.25; // 25% surcharge
    } else if (taxableIncome > 1000000) {
      tax = tax * 1.15; // 15% surcharge
    }

    // Add cess (4%)
    tax = tax * 1.04;

    return Math.round(tax);
  }

  /**
   * Generate ITR filing guide
   */
  generateITRFilingGuide(): ITRFilingStep[] {
    return [
      {
        stepNumber: 1,
        title: 'Login to Income Tax Portal',
        description: 'Visit https://www.incometax.gov.in and login with your credentials',
        details: [
          'Go to Income Tax e-filing portal',
          'Click on "Login" button',
          'Select "Login as Individual"',
          'Enter your PAN and password',
          'Enter OTP sent to registered mobile/email'
        ],
        hints: ['Use strong password', 'Have your mobile phone ready for OTP']
      },
      {
        stepNumber: 2,
        title: 'Select Assessment Year',
        description: 'Choose the correct financial year for your return',
        details: [
          'After login, go to "My Account"',
          'Click on "Fill/Submit Income Tax Return"',
          'Select the financial year (e.g., FY 2023-24)',
          'Click on "Submit ITR-1 or other applicable form"'
        ],
        hints: ['Make sure you select the correct FY', 'Refer to your Form 16 for the assessment year']
      },
      {
        stepNumber: 3,
        title: 'Choose Applicable ITR Form',
        description: 'Select the right ITR form based on your income sources',
        details: [
          'For salary income: ITR-1 (Sahaj)',
          'For business/profession: ITR-3 or ITR-4',
          'For capital gains: ITR-2',
          'Fill only the selected form'
        ],
        hints: ['ITR-1 is for individuals with only salary and house property income', 'Consult CA if unsure about form selection']
      },
      {
        stepNumber: 4,
        title: 'Enter Personal Information',
        description: 'Fill in your basic details from Form 16',
        details: [
          'Name (as per PAN)',
          'Father/Mother Name',
          'Date of Birth',
          'Residential Status (Resident/Non-resident)',
          'Address',
          'Email and Mobile Number'
        ],
        hints: ['Information should match your PAN records', 'Ensure correct address for official communication']
      },
      {
        stepNumber: 5,
        title: 'Enter Income Details',
        description: 'Fill all sources of income from your Form 16',
        details: [
          'Gross Salary (as per Form 16)',
          'Standard Deduction (₹50,000)',
          'Deductions under Chapter VI-A (if claiming)',
          'Income from other sources (interest, dividends, etc.)',
          'Income from house property'
        ],
        hints: ['Cross-verify amounts with Form 16', 'Include all income sources, even small amounts']
      },
      {
        stepNumber: 6,
        title: 'Claim Applicable Deductions',
        description: 'Enter deductions you are eligible for',
        details: [
          'Section 80C: Insurance, Provident Fund, ELSS, etc. (Max ₹150,000)',
          'Section 80D: Health Insurance Premium (Max ₹25,000/₹50,000)',
          'Section 80E: Education Loan Interest',
          'NPS Contribution: Section 80CCD (Additional ₹200,000)',
          'Home Loan Interest: Section 24 (Max ₹200,000)'
        ],
        hints: ['Keep supporting documents (receipts, policies, etc.)', 'Only claim deductions for which you have proof', 'NPS contribution is an additional deduction beyond 80C']
      },
      {
        stepNumber: 7,
        title: 'Calculate Tax Liability',
        description: 'Review tax calculation (auto-calculated by portal)',
        details: [
          'Portal will auto-calculate taxable income',
          'Review the tax calculation shown',
          'Verify TDS credit from Form 16',
          'Check if you have paid advance tax',
          'Net tax payable/refund will be calculated'
        ],
        hints: ['TDS amount should match your Form 16', 'Refund is calculated as: TDS paid - Total tax due']
      },
      {
        stepNumber: 8,
        title: 'Choose Old or New Tax Regime',
        description: 'Select which tax regime gives you the lowest liability',
        details: [
          'Compare Old Regime (with deductions) vs New Regime (lower slabs)',
          'Usually old regime is better if you have deductions > ₹300,000',
          'New regime is better if you have minimal deductions',
          'System will show comparison'
        ],
        hints: ['Run both scenarios to compare', 'Consider long-term tax planning implications']
      },
      {
        stepNumber: 9,
        title: 'Review Schedule Wise Details',
        description: 'Fill any applicable schedules for specified deductions',
        details: [
          'Schedule 80C: Life Insurance premiums, PPF, ELSS',
          'Schedule 80D: Health Insurance details',
          'Schedule 80E: Education loan details',
          'Schedule CG: Capital Gains (if applicable)',
          'Schedule S: Income from other sources'
        ],
        hints: ['Only fill schedules for deductions you are claiming', 'Keep policy numbers/reference handy']
      },
      {
        stepNumber: 10,
        title: 'Attach Form 16 and Documents',
        description: 'Upload Form 16 and supporting documents',
        details: [
          'Upload Form 16 (Copy from employer)',
          'Upload Form 16 Part B (Deductions and exemptions)',
          'Supported formats: PDF only',
          'File size limit: 5 MB each'
        ],
        hints: ['Ensure Form 16 is readable and clear', 'Use color scans for better clarity']
      },
      {
        stepNumber: 11,
        title: 'Verify Bank and PAN Details',
        description: 'Confirm your bank account for refund',
        details: [
          'Enter bank account number (for refund)',
          'Enter IFSC code',
          'Confirm PAN if different from filing PAN',
          'Ensure bank account is linked to PAN'
        ],
        hints: ['Bank account must be in your name', 'IFSC code is available in canceled check or passbook']
      },
      {
        stepNumber: 12,
        title: 'Preview and Validate ITR',
        description: 'Review complete return before submission',
        details: [
          'Click "Preview" to see complete return',
          'Verify all details carefully',
          'Check for validation errors (marked in red)',
          'Correct any errors',
          'Confirm all details are accurate'
        ],
        hints: ['Don\'t rush this step', 'Review each field carefully', 'Ensure no red error marks remain']
      },
      {
        stepNumber: 13,
        title: 'Generate E-Filing Reference Number (ERN)',
        description: 'Submit ITR and get acknowledgment',
        details: [
          'Click "Submit" button',
          'Portal will show "Submitted Successfully"',
          'Note down the ERN (e-filing reference number)',
          'ERN will be sent to your registered email',
          'ITR status will show "Submitted"'
        ],
        hints: ['Keep ERN safe for future reference', 'Check email for official acknowledgment']
      },
      {
        stepNumber: 14,
        title: 'Download ITR-V for E-Verification',
        description: 'Download and e-verify your return within 30 days',
        details: [
          'Go to "My Account" → "View Submitted Returns"',
          'Download ITR-V (Verification form)',
          'Do NOT print and send physical copies if e-verifying',
          'You must e-verify within 30 days of submission'
        ],
        hints: ['E-verification can only be done online', 'Physical verification is not required if e-verified within 30 days']
      },
      {
        stepNumber: 15,
        title: 'E-Verify Your Return',
        description: 'Complete e-verification using Aadhaar OTP or DigiSign',
        details: [
          'Go to "My Account" → "View Submitted Returns"',
          'Click on the submitted ITR',
          'Click "E-Verify"',
          'Choose verification method:',
          '  • Aadhaar OTP (recommended) - Fastest',
          '  • Internet Banking OTP',
          '  • Digital Signature (DSC)',
          'Complete the verification process'
        ],
        hints: ['E-verification must be completed within 30 days', 'Aadhaar OTP is the simplest method', 'Your Aadhaar must be linked to your PAN']
      },
      {
        stepNumber: 16,
        title: 'Track Refund Status',
        description: 'Monitor your refund after verification',
        details: [
          'After e-verification, status becomes "Verified"',
          'Refund is processed within 7-15 working days',
          'Go to "My Account" → "Refund Status"',
          'Enter Form ITR-V details to track',
          'Refund will be credited to your bank account'
        ],
        hints: ['Ensure your bank account details are correct', 'Refund is tax-free', 'Keep a copy of ITR for records']
      }
    ];
  }

  /**
   * Validate extraction data
   */
  private isValidExtraction(data: TaxDocumentExtraction): boolean {
    return !!(
      data.pan &&
      data.grossSalary > 0 &&
      data.taxableSalary > 0 &&
      data.assessmentYear
    );
  }

  /**
   * Validate AI response
   */
  private isValidAIResponse(response: AIResponse): boolean {
    return !!(
      response.oldRegime &&
      response.oldRegime.taxPayable >= 0 &&
      response.newRegime &&
      response.newRegime.taxPayable >= 0 &&
      response.recommendations &&
      Array.isArray(response.recommendations) &&
      response.itrFilingSteps &&
      Array.isArray(response.itrFilingSteps)
    );
  }
}
