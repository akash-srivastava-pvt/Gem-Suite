import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import './ResumeMaker.css';
import { StandardLaTeX } from './templates/StandardLaTeX.js';
import { PremiumModern } from './templates/PremiumModern.js';
import { StandardDocument } from './templates/StandardDocument.js';
import ResizableLayout from '../../components/ResizableLayout.js';
import { useShell } from '../../context/ShellContext.js';
import { aiCache } from '../../utils/storage.js';

interface KeyValue {
    key: string;
    value: string;
}

interface ResumeData {
    name: string;
    contacts: KeyValue[];
    links: KeyValue[];
    work_history: any[];
    education: any[];
    personal_projects: any[];
    skills: KeyValue[];
    cover_letter_para: string;
}

type OutputTab = 'ats' | 'coverLetter' | 'sop';
type TemplateId = 'latex' | 'premium';

export const ResumeMakerApp: React.FC = () => {
    const { setHeaderActions } = useShell();
    const [data, setData] = useState<ResumeData>({
        name: '',
        contacts: [{ key: 'Email', value: '' }],
        links: [{ key: 'LinkedIn', value: '' }],
        work_history: [],
        education: [],
        personal_projects: [],
        skills: [],
        cover_letter_para: '',
    });

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<OutputTab>('ats');
    const [generated, setGenerated] = useState<{
        ats?: any;
        coverLetter?: any;
        sop?: any;
    }>({});

    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('latex');
    const [previewMode, setPreviewMode] = useState(true);

    useEffect(() => {
        fetch('/api/v1/resume')
            .then(res => res.json())
            .then(savedData => {
                if (savedData) {
                    setData(savedData);
                }
            });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.name) {
                fetch('/api/v1/resume', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [data]);

    // Update header actions
    useEffect(() => {
        setHeaderActions(
            <>
                <button className="gen-btn-header" disabled={loading} onClick={() => generate('generate-ats')}>Draft Resume</button>
                <button className="gen-btn-header" disabled={loading} onClick={() => generate('generate-cover-letter')}>Draft Cover Letter</button>
                <button className="gen-btn-header" disabled={loading} onClick={() => generate('generate-sop')}>Draft SOP</button>
            </>
        );
        return () => setHeaderActions(null);
    }, [loading, data]);

    const handleAddField = (section: keyof ResumeData) => {
        setData(prev => ({
            ...prev,
            [section]: [...(prev[section] as any[]), { key: '', value: '' }],
        }));
    };

    const handleRemoveField = (section: keyof ResumeData, index: number) => {
        setData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).filter((_, i) => i !== index),
        }));
    };

    const handleChangeField = (section: keyof ResumeData, index: number, field: string, value: string) => {
        setData(prev => {
            const newSection = [...(prev[section] as any[])];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };

    const handleAddObject = (section: 'work_history' | 'education' | 'personal_projects') => {
        const templates = {
            work_history: { role: '', company: '', duration: '', description: '' },
            education: { degree: '', institution: '', year: '', details: '' },
            personal_projects: { title: '', description: '', technologies: '' },
        };
        setData(prev => ({
            ...prev,
            [section]: [...prev[section], templates[section]],
        }));
    };

    const handleChangeObject = (section: 'work_history' | 'education' | 'personal_projects', index: number, field: string, value: string) => {
        setData(prev => {
            const newSection = [...(prev[section] as any[])];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };

    const generate = async (type: 'generate-ats' | 'generate-cover-letter' | 'generate-sop') => {
        // Check cache first
        const cacheKey = { type, data };
        const appName = `resume-${type}`;
        const cached = aiCache.get<any>(appName, cacheKey);
        if (cached) {
            let key: OutputTab = 'ats';
            if (type === 'generate-ats') {
                key = 'ats';
            } else if (type === 'generate-cover-letter') {
                key = 'coverLetter';
            } else if (type === 'generate-sop') {
                key = 'sop';
            }
            setGenerated(prev => ({ ...prev, [key]: cached }));
            setActiveTab(key);
            setPreviewMode(true);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/v1/resume/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();

            // Cache the result
            aiCache.set(appName, cacheKey, result);

            let key: OutputTab = 'ats';

            if (type === 'generate-ats') {
                key = 'ats';
            } else if (type === 'generate-cover-letter') {
                key = 'coverLetter';
            } else if (type === 'generate-sop') {
                key = 'sop';
            }

            setGenerated(prev => ({ ...prev, [key]: result }));
            setActiveTab(key);
            setPreviewMode(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        setShowTemplateModal(false);
        const content = document.getElementById('pdf-render-hidden');
        if (!content) return;

        const opt = {
            margin: 0,
            filename: `Gem_Vivarad_${activeTab}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        } as const;

        html2pdf().from(content).set(opt).save();
    };

    const getDocTitle = () => {
        if (activeTab === 'coverLetter') return 'Cover Letter';
        if (activeTab === 'sop') return 'Statement of Purpose';
        return 'Resume';
    }

    const FormSection = (
        <section className="form-section">
            <div className="section-header">
                <h2>Professional Profile</h2>
                <p>Provide your background details. AI will use these to generate polished documents.</p>
            </div>

            <div className="field-group">
                <label>Full Name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    style={{ width: '100%' }}
                />
            </div>

            <DynamicSection
                title="Contacts"
                items={data.contacts}
                onAdd={() => handleAddField('contacts')}
                onRemove={(i) => handleRemoveField('contacts', i)}
                onChange={(i, f, v) => handleChangeField('contacts', i, f, v)}
            />

            <DynamicSection
                title="Social Links"
                items={data.links}
                onAdd={() => handleAddField('links')}
                onRemove={(i) => handleRemoveField('links', i)}
                onChange={(i, f, v) => handleChangeField('links', i, f, v)}
            />

            <section className="complex-section">
                <div className="sub-header">
                    <h3>Work History</h3>
                    <button className="icon-add-btn" onClick={() => handleAddObject('work_history')}>+ Add Field</button>
                </div>
                {data.work_history.map((work, i) => (
                    <div key={i} className="object-entry card">
                        <div className="entry-grid">
                            <input placeholder="Role" value={work.role} onChange={e => handleChangeObject('work_history', i, 'role', e.target.value)} />
                            <input placeholder="Company" value={work.company} onChange={e => handleChangeObject('work_history', i, 'company', e.target.value)} />
                            <input placeholder="Duration" value={work.duration} onChange={e => handleChangeObject('work_history', i, 'duration', e.target.value)} />
                        </div>
                        <textarea placeholder="Key Achievements & Responsibilities" value={work.description} onChange={e => handleChangeObject('work_history', i, 'description', e.target.value)} />
                        <button className="remove-link" onClick={() => handleRemoveField('work_history', i)}>Delete Entry</button>
                    </div>
                ))}
            </section>

            <section className="complex-section">
                <div className="sub-header">
                    <h3>Education</h3>
                    <button className="icon-add-btn" onClick={() => handleAddObject('education')}>+ Add Field</button>
                </div>
                {data.education.map((edu, i) => (
                    <div key={i} className="object-entry card">
                        <div className="entry-grid">
                            <input placeholder="Degree" value={edu.degree} onChange={e => handleChangeObject('education', i, 'degree', e.target.value)} />
                            <input placeholder="Institution" value={edu.institution} onChange={e => handleChangeObject('education', i, 'institution', e.target.value)} />
                            <input placeholder="Year" value={edu.year} onChange={e => handleChangeObject('education', i, 'year', e.target.value)} />
                        </div>
                        <textarea placeholder="Academic Details" value={edu.details} onChange={e => handleChangeObject('education', i, 'details', e.target.value)} />
                        <button className="remove-link" onClick={() => handleRemoveField('education', i)}>Delete Entry</button>
                    </div>
                ))}
            </section>

            <section className="complex-section">
                <div className="sub-header">
                    <h3>Special Projects</h3>
                    <button className="icon-add-btn" onClick={() => handleAddObject('personal_projects')}>+ Add Field</button>
                </div>
                {data.personal_projects.map((proj, i) => (
                    <div key={i} className="object-entry card">
                        <div className="entry-grid">
                            <input placeholder="Project Title" value={proj.title} onChange={e => handleChangeObject('personal_projects', i, 'title', e.target.value)} />
                            <input placeholder="Technologies Used" value={proj.technologies} onChange={e => handleChangeObject('personal_projects', i, 'technologies', e.target.value)} />
                        </div>
                        <textarea placeholder="Brief Project Description" value={proj.description} onChange={e => handleChangeObject('personal_projects', i, 'description', e.target.value)} />
                        <button className="remove-link" onClick={() => handleRemoveField('personal_projects', i)}>Delete Entry</button>
                    </div>
                ))}
            </section>

            <DynamicSection
                title="Skills & Expertise"
                items={data.skills}
                onAdd={() => handleAddField('skills')}
                onRemove={(i) => handleRemoveField('skills', i)}
                onChange={(i, f, v) => handleChangeField('skills', i, f, v)}
            />

            <div className="field-group">
                <label>Job Context (Target Role/Company)</label>
                <textarea
                    value={data.cover_letter_para}
                    onChange={e => setData(prev => ({ ...prev, cover_letter_para: e.target.value }))}
                    placeholder="Provide specific context to help AI customize your documents..."
                    style={{ width: '100%', minHeight: '120px' }}
                />
            </div>
        </section>
    );

    const PreviewSection = (
        <section className="preview-section">
            <div className="tabs">
                <button className={activeTab === 'ats' ? 'active' : ''} onClick={() => setActiveTab('ats')}>Resume</button>
                <button className={activeTab === 'coverLetter' ? 'active' : ''} onClick={() => setActiveTab('coverLetter')}>Cover Letter</button>
                <button className={activeTab === 'sop' ? 'active' : ''} onClick={() => setActiveTab('sop')}>SOP</button>
            </div>

            <div className="output-container">
                {loading ? (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>AI is generating your {getDocTitle()}...</p>
                    </div>
                ) : generated[activeTab] ? (
                    <>
                        <div className="output-toolbar">
                            {activeTab === 'ats' && (
                                <div className="template-selector-inline">
                                    <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value as TemplateId)}>
                                        <option value="latex">Modern LaTeX Style</option>
                                        <option value="premium">Premium Design</option>
                                    </select>
                                </div>
                            )}
                            <button 
                                className="secondary-btn" 
                                onClick={() => setPreviewMode(!previewMode)}
                                style={{ marginLeft: 'auto' }}
                            >
                                {previewMode ? (activeTab === 'ats' ? 'Edit JSON' : 'Edit Text') : 'Show Preview'}
                            </button>
                            <button onClick={() => activeTab === 'ats' ? setShowTemplateModal(true) : downloadPDF()} className="primary-btn">Download PDF</button>
                        </div>
                        <div className="editor-area" style={{ border: 'none', background: 'transparent', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {previewMode ? (
                                <>
                                    <div className="template-preview-wrapper" style={{ 
                                        background: 'white', 
                                        padding: '0.75in', 
                                        overflowY: 'auto',
                                        flex: 1,
                                        minHeight: 0
                                    }}>
                                        {activeTab === 'ats' ? (
                                            selectedTemplate === 'latex' ? <StandardLaTeX data={generated.ats} /> : <PremiumModern data={generated.ats} />
                                        ) : (
                                            <StandardDocument data={generated[activeTab]} title={getDocTitle()} />
                                        )}
                                    </div>
                                    {/* Hidden element for PDF rendering */}
                                    <div id="pdf-render-hidden" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '8.5in', background: 'white', padding: '0.75in' }}>
                                        {activeTab === 'ats' ? (
                                            selectedTemplate === 'latex' ? <StandardLaTeX data={generated.ats} /> : <PremiumModern data={generated.ats} />
                                        ) : (
                                            <StandardDocument data={generated[activeTab]} title={getDocTitle()} />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <textarea
                                    value={activeTab === 'ats' 
                                        ? JSON.stringify(generated[activeTab], null, 2)
                                        : (generated[activeTab]?.content || '')
                                    }
                                    onChange={(e) => {
                                        if (activeTab === 'ats') {
                                            try {
                                                const val = JSON.parse(e.target.value);
                                                setGenerated(prev => ({ ...prev, [activeTab]: val }));
                                            } catch (err) {
                                                // Allow invalid JSON while typing
                                            }
                                        } else {
                                            // For cover letter and SOP, update content directly
                                            setGenerated(prev => ({ 
                                                ...prev, 
                                                [activeTab]: { ...prev[activeTab], content: e.target.value } 
                                            }));
                                        }
                                    }}
                                    className="output-editor card"
                                    style={{ 
                                        width: '100%',
                                        flex: 1,
                                        minHeight: 0,
                                        padding: '20px',
                                        fontSize: activeTab === 'ats' ? '13px' : '14px',
                                        fontFamily: activeTab === 'ats' ? 'monospace' : 'inherit',
                                        lineHeight: activeTab === 'ats' ? '1.5' : '1.6',
                                        resize: 'none',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        outline: 'none'
                                    }}
                                    placeholder={activeTab === 'ats' ? 'Edit JSON structure...' : 'Edit your text here...'}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="placeholder-state">
                        <div className="icon">📄</div>
                        <h3>Your {getDocTitle()} will appear here</h3>
                        <p>Fill out your profile and click 'Draft' in the header to start.</p>
                    </div>
                )}
            </div>
        </section>
    );

    return (
        <div className="resume-maker-container">
            <ResizableLayout
                leftPanel={FormSection}
                rightPanel={PreviewSection}
                initialLeftWidth={500}
            />

            {/* Hidden Render Area for PDF Export */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div id="pdf-render-hidden" style={{ width: '8.5in', background: 'white' }}>
                    {activeTab === 'ats' ? (
                        selectedTemplate === 'latex' ? <StandardLaTeX data={generated.ats} /> : <PremiumModern data={generated.ats} />
                    ) : (
                        <StandardDocument data={generated[activeTab]} title={getDocTitle()} />
                    )}
                </div>
            </div>

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="modal-overlay">
                    <div className="modal-content template-gallery card">
                        <h2>Choose Download Style</h2>
                        <div className="template-options">
                            <div className={`template-card ${selectedTemplate === 'latex' ? 'selected' : ''}`} onClick={() => setSelectedTemplate('latex')}>
                                <div className="template-thumb latex-thumb">
                                    <div className="line"></div><div className="line"></div><div className="line short"></div>
                                </div>
                                <div style={{ fontWeight: 600 }}>Modern LaTeX</div>
                            </div>
                            <div className={`template-card ${selectedTemplate === 'premium' ? 'selected' : ''}`} onClick={() => setSelectedTemplate('premium')}>
                                <div className="template-thumb premium-thumb">
                                    <div className="side"></div><div className="main"><div className="line"></div><div className="line"></div></div>
                                </div>
                                <div style={{ fontWeight: 600 }}>Premium Design</div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                            <button className="primary-btn" onClick={downloadPDF}>Download Document</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DynamicSection: React.FC<{
    title: string;
    items: KeyValue[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, field: 'key' | 'value', value: string) => void;
}> = ({ title, items, onAdd, onRemove, onChange }) => (
    <section className="dynamic-section">
        <div className="sub-header">
            <h3>{title}</h3>
            <button className="icon-add-btn" onClick={onAdd}>+ Add Field</button>
        </div>
        <div className="kv-grid">
            {items.map((item, i) => (
                <div key={i} className="key-value-row">
                    <input
                        placeholder="Label"
                        value={item.key}
                        onChange={e => onChange(i, 'key', e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <input
                        placeholder="Details"
                        value={item.value}
                        onChange={e => onChange(i, 'value', e.target.value)}
                        style={{ flex: 2 }}
                    />
                    <button className="round-remove-btn" onClick={() => onRemove(i)} title="Remove Entry">×</button>
                </div>
            ))}
        </div>
    </section>
);
