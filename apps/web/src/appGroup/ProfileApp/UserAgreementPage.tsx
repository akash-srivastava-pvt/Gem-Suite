import React, { useState } from 'react';
import { userService } from '../../services/userService.js';

interface Props {
    onAgreed: () => void;
}

const UserAgreementPage: React.FC<Props> = ({ onAgreed }) => {
    const [name, setName] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !agreed) return;

        setLoading(true);
        setError(null);
        try {
            await userService.agree(name.trim());
            onAgreed();
        } catch (err) {
            setError('Failed to save agreement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div className="card" style={styles.card}>
                <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>User Agreement</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
                    Liability and Data Privacy Notice
                </p>

                <div style={styles.agreementText}>
                    <p>This is a strictly on-premise system. All data and AI-generated artifacts are stored locally on your device.</p>
                    <p>By using this workspace, you acknowledge:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                        <li><strong>Data Residency:</strong> All data is stored locally on this machine. You are responsible for its backup and security.</li>
                        <li><strong>AI Fallibility:</strong> AI outputs may be inaccurate or biased. Always human-verify critical information before use.</li>
                        <li><strong>Prohibited Use:</strong> You agree not to use this tool for generating harmful, illegal, or deceptive content.</li>
                        <li><strong>Liability:</strong> Gem Suite is not liable for any direct or indirect damages arising from the use of generated data.</li>
                        <li><strong>API Usage:</strong> API keys are stored locally but transmitted securely to Google's servers for inference only.</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <span style={styles.checkboxLabel}>I accept the workspace policy</span>
                    </label>

                    <input
                        type="text"
                        placeholder="Confirm your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%' }}
                        disabled={loading}
                        autoFocus
                    />

                    {error && <p style={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={!agreed || !name.trim() || loading}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Finalising Setup...' : 'Accept & Initialise Workspace'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
        padding: '24px',
    },
    card: {
        padding: '40px',
        maxWidth: '540px',
        width: '100%',
    },
    agreementText: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        padding: '20px',
        backgroundColor: 'var(--background)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        marginBottom: '24px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    },
    checkboxContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '0.875rem',
        color: 'var(--text)',
    },
    error: {
        color: 'var(--error)',
        fontSize: '0.75rem',
        margin: 0,
    },
};

export default UserAgreementPage;
