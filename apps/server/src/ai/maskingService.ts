/**
 * Gem Vitya - Data Masking Service
 * Masks sensitive financial and personal data before sending to AI
 */

export class DataMaskingService {
  /**
   * Mask PAN (Permanent Account Number)
   * Example: ABC1234567Z -> ABC****67Z
   */
  static maskPAN(pan: string): string {
    if (!pan || pan.length < 6) return '***';
    return pan.substring(0, 3) + '****' + pan.substring(pan.length - 2);
  }

  /**
   * Mask Aadhaar number
   * Example: 1234 5678 9012 3456 -> **** **** 3456
   */
  static maskAadhaar(aadhaar: string): string {
    const cleaned = aadhaar.replace(/\s/g, '');
    if (cleaned.length < 4) return '***';
    return '**** **** ' + cleaned.substring(cleaned.length - 4);
  }

  /**
   * Mask Bank Account number
   * Example: 1234567890987654 -> ****7654
   */
  static maskBankAccount(account: string): string {
    if (!account || account.length < 4) return '***';
    return '****' + account.substring(account.length - 4);
  }

  /**
   * Mask email address
   * Example: user@example.com -> u***@example.com
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***';
    const [local, domain] = email.split('@');
    return local[0] + '***@' + domain;
  }

  /**
   * Mask phone number
   * Example: 9876543210 -> 98765*****
   */
  static maskPhone(phone: string): string {
    if (!phone || phone.length < 5) return '***';
    return phone.substring(0, 5) + '*****';
  }

  /**
   * Mask employer name - partially reveal first word
   * Example: "ABC Limited Private Company" -> "ABC****"
   */
  static maskEmployerName(name: string): string {
    if (!name || name.length < 3) return '***';
    return name.substring(0, 3) + '****';
  }

  /**
   * Mask salary amount - show only first and last digit
   * Example: 1200000 -> 1***000
   */
  static maskSalaryAmount(amount: number): string {
    const str = Math.round(amount).toString();
    if (str.length < 3) return '***';
    return str[0] + '****' + str.substring(str.length - 2);
  }

  /**
   * Remove document file paths and names before processing
   */
  static maskDocumentPath(path: string): string {
    return 'document_' + Date.now();
  }

  /**
   * Mask full tax document extraction data
   */
  static maskTaxDocumentData(data: any): any {
    if (!data) return null;

    return {
      pan: this.maskPAN(data.pan || ''),
      grossSalary: data.grossSalary,
      taxableSalary: data.taxableSalary,
      tds: data.tds,
      employerName: this.maskEmployerName(data.employerName || ''),
      deductions: {
        section80C: data.deductions?.section80C,
        section80D: data.deductions?.section80D,
        hra: data.deductions?.hra,
        otherAllowances: data.deductions?.otherAllowances
      },
      assessmentYear: data.assessmentYear
    };
  }

  /**
   * Remove sensitive fields from raw text extraction
   */
  static maskRawText(text: string): string {
    let masked = text;

    // Mask PAN patterns (3 letters + 4 digits + 1 letter + 1 digit + 1 letter + 1 digit)
    masked = masked.replace(/[A-Z]{3}P[A-Z]\d{4}[A-Z]\d/g, '[PAN_MASKED]');

    // Mask Aadhaar patterns (12 digits)
    masked = masked.replace(/(?:\d{1,4}\s*){3}\d{1,4}/g, '[AADHAAR_MASKED]');

    // Mask email addresses
    masked = masked.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '[EMAIL_MASKED]');

    // Mask phone numbers (10 digits)
    masked = masked.replace(/\b\d{10}\b/g, '[PHONE_MASKED]');

    // Mask account numbers (long sequences of digits)
    masked = masked.replace(/(?<!\d)\d{10,}\b/g, '[ACCOUNT_MASKED]');

    return masked;
  }

  /**
   * Validate that data has been properly masked before AI processing
   */
  static validateMasking(data: any): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for unmasked PAN pattern
    if (/[A-Z]{3}P[A-Z]\d{4}[A-Z]\d/g.test(JSON.stringify(data))) {
      issues.push('Unmasked PAN found');
    }

    // Check for long digit sequences that might be sensitive
    if (/\d{10,}/g.test(JSON.stringify(data))) {
      issues.push('Potential unmasked account number found');
    }

    // Check for common email pattern
    if (/[\w\.-]+@[\w\.-]+\.\w+/g.test(JSON.stringify(data))) {
      issues.push('Unmasked email found');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
