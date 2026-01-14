import React, { useEffect, useState } from 'react';
import UserAgreementPage from './UserAgreementPage.js';
import { userService, UserStatus, LogEntry } from '../../services/userService.js';
import { theme } from '../../theme.js';

export const ProfileApp = () => {
    const [status, setStatus] = useState<UserStatus | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        try {
            const [statusData, logsData] = await Promise.all([
                userService.getStatus(),
                userService.getLogs()
            ]);
            setStatus(statusData);
            setLogs(logsData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDeleteAll = async () => {
        if (!window.confirm("Are you sure you want to delete all personal data? This action is IRREVERSIBLE. Logs will be preserved for audit purposes.")) {
            return;
        }

        setDeleting(true);
        try {
            await userService.deleteData();
            await fetchData();
            window.location.reload(); // Force reload to trigger agreement flow
        } catch (err) {
            alert("Failed to delete data");
        } finally {
            setDeleting(false);
        }
    };

    if (!status) return <div style={{ padding: '40px', color: theme.colors.textSecondary }}>Loading...</div>;

    if (!status.agreed) {
        return <UserAgreementPage onAgreed={fetchData} />;
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Gem Profile</h1>
                <p style={styles.subtitle}>Identity & Audit Management</p>
            </header>

            <div style={styles.main}>
                <section style={styles.card}>
                    <h2 style={styles.cardTitle}>User Identity</h2>
                    <div style={styles.identityGrid}>
                        <div style={styles.identityItem}>
                            <span style={styles.label}>Signature</span>
                            <span style={styles.value}>{status.name}</span>
                        </div>
                        <div style={styles.identityItem}>
                            <span style={styles.label}>Agreement Status</span>
                            <span style={{ ...styles.value, color: '#10b981' }}>Verified & Signed ✅</span>
                        </div>
                    </div>
                </section>

                <section style={styles.card}>
                    <h2 style={styles.cardTitle}>Activity Audit Log</h2>
                    <div style={styles.logContainer}>
                        {logs.length === 0 ? (
                            <p style={styles.emptyLogs}>No audit logs available.</p>
                        ) : (
                            <ul style={styles.logList}>
                                {logs.map(log => (
                                    <li key={log.id} style={styles.logItem}>
                                        <span style={styles.logEvent}>{log.event}</span>
                                        <span style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                <section style={{ ...styles.card, border: '1px solid #fee2e2' }}>
                    <h2 style={{ ...styles.cardTitle, color: '#dc2626' }}>Danger Zone</h2>
                    <p style={styles.dangerText}>
                        Deleting your data will remove your agreement signature, API keys, and all generated artifacts across the suite.
                        <strong> Audit logs remain intact for compliance.</strong>
                    </p>
                    <button
                        onClick={handleDeleteAll}
                        disabled={deleting}
                        style={{
                            ...styles.deleteButton,
                            opacity: deleting ? 0.7 : 1,
                        }}
                    >
                        {deleting ? 'Wiping Data...' : 'Delete All Personal Data'}
                    </button>
                </section>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '32px',
        minHeight: '100%',
        background: theme.colors.background,
    },
    header: {
        textAlign: 'left' as const,
    },
    title: {
        fontSize: '32px',
        fontWeight: 800,
        color: theme.colors.primary,
        margin: 0,
        letterSpacing: '-0.02em',
    },
    subtitle: {
        fontSize: '16px',
        color: theme.colors.textSecondary,
        marginTop: '4px',
    },
    main: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },
    card: {
        background: theme.colors.surface,
        padding: '24px',
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.card,
        border: `1px solid ${theme.colors.border}`,
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: 700,
        color: theme.colors.primary,
        marginBottom: '20px',
        marginTop: 0,
    },
    identityGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
    },
    identityItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    label: {
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        color: theme.colors.textSecondary,
        letterSpacing: '0.05em',
    },
    value: {
        fontSize: '16px',
        fontWeight: 500,
        color: theme.colors.text,
    },
    logContainer: {
        maxHeight: '430px',
        overflowY: 'auto' as const,
        background: '#fafafa',
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
    },
    logList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    logItem: {
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
    },
    logEvent: {
        fontSize: '14px',
        color: theme.colors.text,
    },
    logTime: {
        fontSize: '12px',
        color: theme.colors.textSecondary,
        whiteSpace: 'nowrap' as const,
    },
    emptyLogs: {
        padding: '24px',
        textAlign: 'center' as const,
        color: theme.colors.textSecondary,
        fontSize: '14px',
    },
    dangerText: {
        fontSize: '14px',
        color: theme.colors.textSecondary,
        marginBottom: '20px',
        lineHeight: '1.5',
    },
    deleteButton: {
        padding: '12px 24px',
        background: '#dc2626',
        color: '#fff',
        border: 'none',
        borderRadius: theme.borderRadius.sm,
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
};