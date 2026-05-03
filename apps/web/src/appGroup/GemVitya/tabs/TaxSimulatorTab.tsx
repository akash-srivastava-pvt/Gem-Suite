/**
 * Gem Vitya - Tax Simulator Tab
 * Upload Form 16/26AS and simulate tax calculations
 */

import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import '../GemVitya.css';

// Point worker to the bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

interface TaxDocumentExtraction {
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
}

interface TaxCalculation {
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  standardDeduction: number;
  taxPayable: number;
}

interface TaxSavingsSuggestion {
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  applicableSection: string;
}

interface ITRFilingStep {
  stepNumber: number;
  title: string;
  description: string;
  details: string[];
  hints?: string[];
}

interface TaxSimulatorTabProps {
  apiBaseURL: string;
}

const TaxSimulatorTab: React.FC<TaxSimulatorTabProps> = ({ apiBaseURL }) => {
  const [documentType, setDocumentType] = useState<'FORM16' | 'FORM26AS'>('FORM16');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<TaxDocumentExtraction> | null>(null);
  const [simulation, setSimulation] = useState<{
    oldRegime: TaxCalculation;
    newRegime: TaxCalculation;
    refund: number;
    recommendations: TaxSavingsSuggestion[];
    guide: ITRFilingStep[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'extracted' | 'simulation' | 'guide'>('upload');

  // Manual data entry state
  const [manualData, setManualData] = useState<Partial<TaxDocumentExtraction>>({
    pan: '',
    grossSalary: 0,
    taxableSalary: 0,
    tds: 0,
    employerName: '',
    deductions: {},
    assessmentYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
  });

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  const parseExtractedText = (text: string, type: 'FORM16' | 'FORM26AS'): Partial<TaxDocumentExtraction> => {
    // Find the number that appears after a label match (within next 60 chars)
    const extractAmount = (pattern: RegExp): number => {
      const m = text.match(pattern);
      if (!m || m.index == null) return 0;
      const after = text.slice(m.index + m[0].length, m.index + m[0].length + 60);
      const num = after.match(/[\d,]{3,}/);
      return num ? parseInt(num[0].replace(/,/g, ''), 10) : 0;
    };

    // Also try capturing group approach for patterns that embed the number
    const extractAmountGroup = (pattern: RegExp): number => {
      const m = text.match(pattern);
      if (!m) return 0;
      const raw = (m[1] || m[0]).replace(/,/g, '');
      const num = raw.match(/\d+/);
      return num ? parseInt(num[0], 10) : 0;
    };

    const pan = text.match(/[A-Z]{3}[P-Z][A-Z]\d{4}[A-Z]/)?.[0] || '';

    const assessmentYear =
      text.match(/(?:Assessment\s*Year|A\.?Y\.?)[\s:]*([\d]{4}[-–][\d]{2,4})/i)?.[1] ||
      text.match(/(?:F\.?Y\.?|Financial\s*Year)[\s:]*([\d]{4}[-–][\d]{2,4})/i)?.[1] ||
      text.match(/\b(20\d{2}[-–]\d{2,4})\b/)?.[1] || '';

    if (type === 'FORM26AS') {
      return {
        pan,
        assessmentYear,
        grossSalary:
          extractAmount(/(?:Gross|Total)\s+(?:Income|Salary)/i) ||
          extractAmountGroup(/(?:Gross|Total)\s+(?:Income|Salary)[\s:]*([\d,]+)/i),
        taxableSalary:
          extractAmount(/(?:Taxable|Net)\s+(?:Income|Salary)/i) ||
          extractAmount(/(?:Gross|Total)\s+(?:Income|Salary)/i),
        tds:
          extractAmount(/(?:Total\s+TDS|TDS\s+(?:Deducted|Credit|Amount))/i) ||
          extractAmount(/Tax\s+Deducted\s+at\s+Source/i),
        employerName:
          text.match(/(?:Name\s+of\s+(?:Employer|Deductor)|Employer\s+Name)[\s:]*([^\n\r]{3,50})/i)?.[1]?.trim() || '',
        deductions: {}
      };
    }

    // Form 16
    return {
      pan,
      assessmentYear,
      grossSalary:
        extractAmount(/Gross\s+Salary/i) ||
        extractAmount(/(?:Total\s+)?(?:Salary|Income)\s+(?:as\s+per|u\/s)/i) ||
        extractAmountGroup(/Gross\s+Salary[\s:]*([\d,]+)/i),
      taxableSalary:
        extractAmount(/(?:Taxable|Net)\s+Salary/i) ||
        extractAmount(/Income\s+(?:chargeable|taxable)/i) ||
        extractAmountGroup(/(?:Taxable|Net)\s+Salary[\s:]*([\d,]+)/i),
      tds:
        extractAmount(/(?:Tax\s+Deducted|TDS)\s+(?:at\s+Source|Deducted)/i) ||
        extractAmount(/(?:Total\s+)?Tax\s+(?:Deducted|Paid)/i) ||
        extractAmountGroup(/(?:Tax\s+Deducted|TDS)[\s:]*([\d,]+)/i),
      employerName:
        text.match(/(?:Name\s+of\s+Employer|Employer(?:'s)?\s+Name)[\s:]*([^\n\r]{3,60})/i)?.[1]?.trim() ||
        text.match(/(?:Employer|Organization|Company)[\s:]+([A-Z][^\n\r]{2,50})/i)?.[1]?.trim() || '',
      deductions: {
        section80C:
          extractAmount(/(?:Section\s*)?80\s*C\b/i) ||
          extractAmountGroup(/80\s*C[\s:]*([\d,]+)/i),
        section80D:
          extractAmount(/(?:Section\s*)?80\s*D\b/i) ||
          extractAmountGroup(/80\s*D[\s:]*([\d,]+)/i),
        hra:
          extractAmount(/(?:House\s+Rent\s+Allowance|HRA\b)/i) ||
          extractAmountGroup(/HRA[\s:]*([\d,]+)/i),
        otherAllowances:
          extractAmount(/(?:Other\s+(?:Special\s+)?Allowances?|Leave\s+Travel)/i) ||
          extractAmountGroup(/(?:Other\s+Allowances?)[\s:]*([\d,]+)/i)
      }
    };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setError('');
    try {
      setExtracting(true);
      const text = await extractTextFromPDF(file);
      const parsed = parseExtractedText(text, documentType);
      setManualData(prev => ({ ...prev, ...parsed }));
    } catch (err: any) {
      setError('Failed to extract PDF: ' + err.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleManualDataChange = (field: string, value: any) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeductionChange = (section: string, value: number) => {
    setManualData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [section]: value
      }
    }));
  };

  const handleExtractData = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate manual data
      if (!manualData.pan || manualData.grossSalary! <= 0) {
        setError('Please fill in PAN and Gross Salary');
        setLoading(false);
        return;
      }

      // Use manual data as extracted data
      setExtractedData(manualData);
      setActiveTab('extracted');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTax = async () => {
    try {
      setLoading(true);
      setError('');

      if (!extractedData) {
        setError('No extracted data available');
        return;
      }

      const response = await fetch(`${apiBaseURL}/tax/calculate-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedData })
      });

      const result = await response.json();

      if (result.success) {
        setSimulation({
          oldRegime: result.data.calculation.oldRegime,
          newRegime: result.data.calculation.newRegime,
          refund: Math.abs(result.data.calculation.oldRegime.taxPayable - (extractedData.tds || 0)),
          recommendations: [], // Would come from AI
          guide: result.data.guide
        });
        setActiveTab('simulation');
      } else {
        setError(result.error || 'Failed to simulate tax');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const maskPAN = (pan: string) => {
    if (!pan || pan.length < 6) return '***';
    return pan.substring(0, 3) + '****' + pan.substring(pan.length - 2);
  };

  const fmt = (val: number | null | undefined) =>
    val != null && !isNaN(val) ? val.toLocaleString() : '0';

  return (
    <div className="gv-tax-simulator">
      {error && <div className="gv-alert gv-alert-error">{error}</div>}

      {/* Upload Section */}
      {activeTab === 'upload' && (
        <div className="gv-card">
          <h2 className="gv-card-title">📝 Enter Tax Details</h2>

          <div style={{ marginBottom: '24px' }}>
            <label className="gv-label">Document Type *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="FORM16"
                  checked={documentType === 'FORM16'}
                  onChange={(e) => setDocumentType(e.target.value as 'FORM16')}
                />
                <span>Form 16 (Salary Certificate)</span>
              </label>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="FORM26AS"
                  checked={documentType === 'FORM26AS'}
                  onChange={(e) => setDocumentType(e.target.value as 'FORM26AS')}
                />
                <span>Form 26AS (AIS)</span>
              </label>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="gv-form-group" style={{ marginBottom: '24px' }}>
            <label className="gv-label">Upload PDF (auto-fills fields below)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="gv-input"
              disabled={extracting}
            />
            {extracting && <p style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>⏳ Extracting data from PDF...</p>}
            {uploadedFile && !extracting && <p style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>📎 {uploadedFile.name} — fields pre-filled below, please verify</p>}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--gv-text-secondary)' }}>
            <p>— OR enter manually —</p>
          </div>

          {/* Manual Data Entry */}
          <div>

            <div className="gv-form">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* PAN */}
                <div className="gv-form-group">
                  <label className="gv-label">PAN (Permanent Account Number) *</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={manualData.pan || ''}
                    onChange={(e) => handleManualDataChange('pan', e.target.value.toUpperCase())}
                    className="gv-input"
                    maxLength={10}
                  />
                </div>

                {/* Gross Salary */}
                <div className="gv-form-group">
                  <label className="gv-label">Gross Salary *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={manualData.grossSalary || ''}
                    onChange={(e) => handleManualDataChange('grossSalary', parseFloat(e.target.value))}
                    className="gv-input"
                  />
                </div>

                {/* Taxable Salary */}
                <div className="gv-form-group">
                  <label className="gv-label">Taxable Salary *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={manualData.taxableSalary || ''}
                    onChange={(e) => handleManualDataChange('taxableSalary', parseFloat(e.target.value))}
                    className="gv-input"
                  />
                </div>

                {/* TDS */}
                <div className="gv-form-group">
                  <label className="gv-label">TDS Paid *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={manualData.tds || ''}
                    onChange={(e) => handleManualDataChange('tds', parseFloat(e.target.value))}
                    className="gv-input"
                  />
                </div>

                {/* Employer Name */}
                <div className="gv-form-group">
                  <label className="gv-label">Employer Name *</label>
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={manualData.employerName || ''}
                    onChange={(e) => handleManualDataChange('employerName', e.target.value)}
                    className="gv-input"
                  />
                </div>

                {/* Assessment Year */}
                <div className="gv-form-group">
                  <label className="gv-label">Assessment Year *</label>
                  <input
                    type="text"
                    placeholder="2024-25"
                    value={manualData.assessmentYear || ''}
                    onChange={(e) => handleManualDataChange('assessmentYear', e.target.value)}
                    className="gv-input"
                  />
                </div>
              </div>

              {/* Deductions */}
              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--gv-bg-secondary)', borderRadius: '6px' }}>
                <h4 style={{ marginTop: 0 }}>Tax Deductions (Optional)</h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="gv-form-group">
                    <label className="gv-label">Section 80C (LIC, PPF, ELSS, etc.)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualData.deductions?.section80C || ''}
                      onChange={(e) => handleDeductionChange('section80C', parseFloat(e.target.value))}
                      className="gv-input"
                    />
                    <small style={{ color: 'var(--gv-text-secondary)' }}>Max: ₹150,000</small>
                  </div>

                  <div className="gv-form-group">
                    <label className="gv-label">Section 80D (Health Insurance)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualData.deductions?.section80D || ''}
                      onChange={(e) => handleDeductionChange('section80D', parseFloat(e.target.value))}
                      className="gv-input"
                    />
                    <small style={{ color: 'var(--gv-text-secondary)' }}>Max: ₹25,000</small>
                  </div>

                  <div className="gv-form-group">
                    <label className="gv-label">HRA (House Rent Allowance)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualData.deductions?.hra || ''}
                      onChange={(e) => handleDeductionChange('hra', parseFloat(e.target.value))}
                      className="gv-input"
                    />
                  </div>

                  <div className="gv-form-group">
                    <label className="gv-label">Other Allowances</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualData.deductions?.otherAllowances || ''}
                      onChange={(e) => handleDeductionChange('otherAllowances', parseFloat(e.target.value))}
                      className="gv-input"
                    />
                  </div>
                </div>
              </div>

              <div className="gv-card-footer" style={{ marginTop: '24px' }}>
                <button
                  onClick={handleExtractData}
                  disabled={loading}
                  className="gv-btn gv-btn-primary"
                >
                  {loading ? '⏳ Processing...' : '▶️ Next: Preview & Edit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {activeTab === 'extracted' && extractedData && (
        <div className="gv-card">
          <h2 className="gv-card-title">👀 Verify Extracted Data</h2>

          <div style={{ background: 'var(--gv-bg-secondary)', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>PAN</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{maskPAN(extractedData.pan || '')}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Gross Salary</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>₹{fmt(extractedData.grossSalary)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Taxable Salary</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>₹{fmt(extractedData.taxableSalary)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>TDS Paid</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gv-success)' }}>₹{fmt(extractedData.tds)}</div>
              </div>
            </div>
          </div>

          <div className="gv-card-footer">
            <button
              onClick={handleSimulateTax}
              disabled={loading}
              className="gv-btn gv-btn-primary"
            >
              {loading ? '⏳ Calculating...' : '🧮 Simulate Tax'}
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className="gv-btn gv-btn-secondary"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Simulation Results */}
      {activeTab === 'simulation' && simulation && (
        <div>
          {/* Comparison Cards */}
          <div className="gv-grid-2col" style={{ marginBottom: '24px' }}>
            <div className="gv-card">
              <h3 style={{ marginTop: 0 }}>📊 Old Regime</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Gross Income</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>₹{fmt(simulation.oldRegime.grossIncome)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Total Deductions</div>
                  <div style={{ fontSize: '16px' }}>₹{fmt(simulation.oldRegime.deductions)}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--gv-bg-secondary)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Taxable Income</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gv-primary)' }}>
                    ₹{fmt(simulation.oldRegime.taxableIncome)}
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', borderLeft: '4px solid var(--gv-danger)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Tax Payable</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gv-danger)' }}>
                    ₹{fmt(simulation.oldRegime.taxPayable)}
                  </div>
                </div>
              </div>
            </div>

            <div className="gv-card">
              <h3 style={{ marginTop: 0 }}>📊 New Regime</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Gross Income</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>₹{fmt(simulation.newRegime.grossIncome)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Standard Deduction Only</div>
                  <div style={{ fontSize: '16px' }}>₹{fmt(simulation.newRegime.deductions)}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--gv-bg-secondary)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Taxable Income</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gv-primary)' }}>
                    ₹{fmt(simulation.newRegime.taxableIncome)}
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', borderLeft: '4px solid var(--gv-success)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gv-text-secondary)' }}>Tax Payable</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gv-success)' }}>
                    ₹{fmt(simulation.newRegime.taxPayable)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Regime Recommendation */}
          <div className="gv-alert gv-alert-info" style={{ marginBottom: '24px' }}>
            <strong>💡 Recommendation:</strong> Use the{' '}
            <strong>
              {simulation.oldRegime.taxPayable < simulation.newRegime.taxPayable ? 'Old Regime' : 'New Regime'}
            </strong>{' '}
            to save ₹{fmt(Math.abs(simulation.oldRegime.taxPayable - simulation.newRegime.taxPayable))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setActiveTab('guide')}
              className="gv-btn gv-btn-primary"
            >
              📖 View ITR Filing Guide
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className="gv-btn gv-btn-secondary"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ITR Filing Guide */}
      {activeTab === 'guide' && simulation && (
        <div>
          <h2 style={{ marginBottom: '24px' }}>📖 Step-by-Step ITR Filing Guide</h2>

          <div style={{ display: 'grid', gap: '16px' }}>
            {simulation.guide.slice(0, 5).map((step, idx) => (
              <div key={idx} className="gv-card">
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    background: 'var(--gv-primary)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {step.stepNumber}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>{step.title}</h3>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--gv-text-secondary)' }}>
                      {step.description}
                    </p>
                    <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px' }}>
                      {step.details.map((detail, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>{detail}</li>
                      ))}
                    </ul>
                    {step.hints && step.hints.length > 0 && (
                      <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--gv-bg-secondary)', borderRadius: '4px', fontSize: '12px' }}>
                        <strong>💡 Hint:</strong> {step.hints[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="gv-alert gv-alert-info" style={{ marginTop: '24px' }}>
            📌 Full guide has {simulation.guide.length} steps. View all steps on the IT portal.
          </div>

          <button
            onClick={() => setActiveTab('simulation')}
            className="gv-btn gv-btn-secondary"
            style={{ marginTop: '24px' }}
          >
            ← Back to Results
          </button>
        </div>
      )}
    </div>
  );
};

export default TaxSimulatorTab;
