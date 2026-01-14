import React, { useState } from 'react';
import { theme } from '../../theme.js';
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
            <div style={styles.card}>
                <h2 style={styles.title}>User Agreement & Liability Notice</h2>

                <div style={styles.agreementText}>
                    <p>This application is a fully on-premise desktop system. All data, content, and generated artifacts remain strictly on your local machine.</p>
                    <p>The application and its services do not collect, transmit, or store any personal data externally.</p>
                    <p>By proceeding, you acknowledge that:</p>
                    <ul>
                        <li>You are solely responsible for the personal data you enter</li>
                        <li>You understand that all AI-generated content is for assistance only</li>
                        <li>You accept full responsibility for how generated content is used</li>
                    </ul>
                    <p>By entering your name below, you agree to these terms.</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            style={styles.checkbox}
                        />
                        <span style={styles.checkboxLabel}>I agree to the terms above</span>
                    </label>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                        disabled={loading}
                    />

                    {error && <p style={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        disabled={!agreed || !name.trim() || loading}
                        style={{
                            ...styles.button,
                            opacity: (!agreed || !name.trim() || loading) ? 0.5 : 1,
                            cursor: (!agreed || !name.trim() || loading) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Processing...' : 'Agree & Proceed'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
        background: theme.colors.background,
    },
    card: {
        background: theme.colors.surface,
        padding: '32px',
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.hover,
        maxWidth: '500px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 700,
        color: theme.colors.primary,
        margin: 0,
        textAlign: 'center' as const,
    },
    agreementText: {
        maxHeight: '300px',
        overflowY: 'auto' as const,
        fontSize: '14px',
        color: theme.colors.textSecondary,
        lineHeight: '1.6',
        padding: '16px',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    },
    checkboxContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    },
    checkbox: {
        width: '18px',
        height: '18px',
    },
    checkboxLabel: {
        fontSize: '14px',
        color: theme.colors.text,
    },
    input: {
        padding: '12px 16px',
        borderRadius: theme.borderRadius.sm,
        border: `1px solid ${theme.colors.border}`,
        fontSize: '16px',
        outline: 'none',
        transition: theme.transitions.default,
    },
    button: {
        padding: '14px',
        borderRadius: theme.borderRadius.sm,
        background: theme.colors.primary,
        color: '#fff',
        border: 'none',
        fontSize: '16px',
        fontWeight: 600,
        transition: theme.transitions.default,
    },
    error: {
        color: '#d32f2f',
        fontSize: '12px',
        margin: 0,
    },
};

export default UserAgreementPage;
