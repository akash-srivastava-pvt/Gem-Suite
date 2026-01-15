import React, { useEffect, useState } from 'react';
import UserAgreementPage from './UserAgreementPage.js';
import { userService, UserStatus, LogEntry } from '../../services/userService.js';

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
            window.location.reload();
        } catch (err) {
            alert("Failed to delete data");
        } finally {
            setDeleting(false);
        }
    };

    if (!status) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Gathering profile records...</div>;

    if (!status.agreed) {
        return <UserAgreementPage onAgreed={fetchData} />;
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <header style={styles.header}>
                    <h1 style={{ marginBottom: '8px' }}>Workspace Identity</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your professional profile and review audit logs.</p>
                </header>

                <div style={styles.grid}>
                    <section className="card" style={styles.section}>
                        <h2 style={styles.sectionTitle}>User Credentials</h2>
                        <div style={styles.infoRow}>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Electronic Signature</span>
                                <span style={styles.value}>{status.name}</span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Authorisation Status</span>
                                <span style={{ ...styles.value, color: 'var(--success)' }}>Verified & Active ✅</span>
                            </div>
                        </div>
                    </section>

                    <section className="card" style={styles.section}>
                        <h2 style={styles.sectionTitle}>Compliance Audit Trail</h2>
                        <div style={styles.logContainer}>
                            {logs.length === 0 ? (
                                <p style={styles.emptyLogs}>No audit records found for this workspace.</p>
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

                    <section className="card" style={{ ...styles.section, borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
                        <h2 style={{ ...styles.sectionTitle, color: 'var(--error)' }}>Restricted Zone</h2>
                        <p style={styles.dangerText}>
                            Resetting your profile will purge all local data, configuration, and generated assets.
                            <strong> This action cannot be undone.</strong>
                        </p>
                        <button
                            className="primary-btn"
                            onClick={handleDeleteAll}
                            disabled={deleting}
                            style={{ background: 'var(--error)', borderColor: 'var(--error)' }}
                        >
                            {deleting ? 'Wiping workspace...' : 'Purge All Profile Data'}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        height: '100%',
        overflowY: 'auto' as const,
        padding: '64px 24px',
        backgroundColor: 'var(--background)',
    },
    content: {
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '40px',
    },
    header: {
        textAlign: 'center' as const,
    },
    grid: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },
    section: {
        padding: '32px',
    },
    sectionTitle: {
        fontSize: '1.2rem',
        marginBottom: '24px',
    },
    infoRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    label: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    value: {
        fontSize: '1.1rem',
        fontWeight: 500,
    },
    logContainer: {
        maxHeight: '400px',
        overflowY: 'auto' as const,
        background: 'var(--background)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
    },
    logList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    logItem: {
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logEvent: {
        fontSize: '0.875rem',
    },
    logTime: {
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
    },
    emptyLogs: {
        padding: '32px',
        textAlign: 'center' as const,
        color: 'var(--text-secondary)',
    },
    dangerText: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        lineHeight: 1.6,
    }
};