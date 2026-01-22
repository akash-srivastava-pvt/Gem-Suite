import React, { useEffect, useState } from 'react';
import UserAgreementPage from './UserAgreementPage.js';
import { ApiManager } from './ApiManager.js';
import { userService, UserStatus, LogEntry } from '../../services/userService.js';
import { unlockService } from '../../services/unlockService.js';
import { persistenceService } from '../../services/persistenceService.js';
import { UsageMetrics, HealthStatus, UnlockStatus } from '@gem/shared';

export const ProfileApp = () => {
    const [status, setStatus] = useState<UserStatus | null>(null);
    const [unlockStatus, setUnlockStatus] = useState<UnlockStatus | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [deleting, setDeleting] = useState(false);

    const [usageMetrics, setUsageMetrics] = useState<UsageMetrics[]>([]);
    const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'overview' | 'api-manager'>('overview');

    const fetchData = async () => {
        try {
            const [statusData, unlockData, logsData, healthData] = await Promise.all([
                userService.getStatus(),
                unlockService.getStatus(),
                userService.getLogs(),
                persistenceService.healthCheck().catch(() => ({
                    status: 'unknown' as const,
                    timestamp: new Date().toISOString(),
                    uptime: 0,
                    database: { status: 'unknown' as const },
                    memory: { used: 0, total: 0 },
                    artifacts: { count: 0 },
                    errors: { count: 0 }
                }))
            ]);

            const metricsData = await persistenceService.getUsageMetrics();

            setLastUpdated(new Date());
            setStatus(statusData);
            setUnlockStatus(unlockData.data);
            setLogs(logsData);
            setUsageMetrics(metricsData);
            setHealthStatus(healthData);

        } catch (err) {
            console.error(err);
        }
    };

    const handleApiKeyChange = async () => {
        await fetchData();
        window.location.reload();
    };

    useEffect(() => {
        fetchData();
        // Only poll if user is logged in and not in the process of deleting
        let interval: NodeJS.Timeout;
        if (status?.agreed && !deleting) {
            interval = setInterval(fetchData, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status?.agreed, deleting]);

    const handleDeleteAll = async () => {
        if (!window.confirm("CRITICAL ACTION: This will PERMANENTLY delete all profile data, saved items, AI cache, and configuration. The app will restart in a clean state. Are you sure?")) {
            return;
        }

        setDeleting(true);
        try {
            // Clear server-side database items
            await userService.deleteData();

            // Clear all client-side storage (AI Cache, Form Persistence, etc.)
            localStorage.clear();
            sessionStorage.clear();

            // Skip fetchData() and reload immediately for a clean start
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("An error occurred during reset. Please manually refresh the application.");
            setDeleting(false);
        }
    };



    const getAppDisplayName = (appName: string): string => {
        const displayNames: Record<string, string> = {
            'texteditor': 'Gem Likhit',
            'tripplanner': 'Gem Musafir',
            'invitation': 'Gem Amantrada',
            'resumemaker': 'Gem Vivarad',
            'profile': 'Gem Profile'
        };
        return displayNames[appName] || appName;
    };

    if (!status) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Gathering profile records...</div>;

    if (!status.agreed) {
        return <UserAgreementPage onAgreed={fetchData} />;
    }

    if (!unlockStatus?.hasActiveApiKey) {
        return (
            <div style={styles.container}>
                <div style={styles.content}>
                    <header style={styles.header}>
                        <h1 style={{ marginBottom: '8px' }}>API Configuration Required</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Add at least one API key to unlock all GEM applications.</p>
                    </header>
                    <ApiManager onApiKeyAdded={handleApiKeyChange} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <header style={styles.header}>
                    <h1 style={{ marginBottom: '8px' }}>Workspace Identity</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your professional profile and review audit logs.</p>
                </header>

                <div style={styles.tabs}>
                    <button
                        className={activeTab === 'overview' ? 'primary-btn' : 'secondary-btn'}
                        onClick={() => setActiveTab('overview')}
                        disabled={deleting}
                    >
                        Overview
                    </button>
                    <button
                        className={activeTab === 'api-manager' ? 'primary-btn' : 'secondary-btn'}
                        onClick={() => setActiveTab('api-manager')}
                        disabled={deleting}
                    >
                        API Manager
                    </button>
                </div>

                {deleting && (
                    <div style={styles.deletingOverlay}>
                        <div className="spinning-loader" style={{ width: '40px', height: '40px' }}></div>
                        <p style={{ marginTop: '16px', fontWeight: 600 }}>Purging Workspace Data...</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This will take a moment. The app will restart shortly.</p>
                    </div>
                )}

                {activeTab === 'api-manager' ? (
                    <ApiManager onApiKeyAdded={handleApiKeyChange} />
                ) : (
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <h2 style={styles.sectionTitle}>Usage Insights Dashboard</h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                                        Last updated: {lastUpdated.toLocaleTimeString()}
                                    </p>
                                </div>
                                <button
                                    className="secondary-btn"
                                    onClick={fetchData}
                                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                            {/* Summary Stats */}
                            <div style={styles.summaryStats}>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryValue}>
                                        {usageMetrics.reduce((sum, m) => sum + m.savedArtifacts, 0).toLocaleString()}
                                    </span>
                                    <span style={styles.summaryLabel}>Total Saved Items</span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryValue}>
                                        {usageMetrics.reduce((sum, m) => sum + m.apiHits, 0).toLocaleString()}
                                    </span>
                                    <span style={styles.summaryLabel}>Total API Calls</span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryValue}>
                                        {usageMetrics.reduce((sum, m) => sum + m.generatedArtifacts, 0).toLocaleString()}
                                    </span>
                                    <span style={styles.summaryLabel}>AI Generations</span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={{ ...styles.summaryValue, color: '#fee2e2' }}>
                                        {usageMetrics.reduce((sum, m) => sum + (m.apiErrors || 0), 0).toLocaleString()}
                                    </span>
                                    <span style={styles.summaryLabel}>Failed Requests</span>
                                </div>
                            </div>

                            <div style={styles.metricsGrid}>
                                <div style={styles.metricCard}>
                                    <h3 style={styles.metricTitle}>System Health</h3>
                                    {healthStatus ? (
                                        <div style={styles.healthStatus}>
                                            <div style={{
                                                ...styles.healthIndicator,
                                                backgroundColor: healthStatus.status === 'healthy' ? '#10b981' :
                                                    healthStatus.status === 'degraded' ? '#f59e0b' :
                                                        healthStatus.status === 'unknown' ? '#6b7280' : '#ef4444'
                                            }}>
                                                {(healthStatus.status || 'UNKNOWN').toUpperCase()}
                                            </div>
                                            <div style={styles.healthDetails}>
                                                <p>Uptime: {Math.floor((healthStatus.uptime || 0) / 3600)}h {Math.floor(((healthStatus.uptime || 0) % 3600) / 60)}m</p>
                                                <p>Database: {healthStatus.database?.status || 'unknown'}</p>
                                                <p>Memory: {((healthStatus.memory?.used || 0) / 1024 / 1024).toFixed(1)} MB used</p>
                                                <p>Artifacts: {healthStatus.artifacts?.count || 0}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={styles.loadingText}>Loading health status...</p>
                                    )}
                                </div>

                                <div style={styles.metricCard}>
                                    <h3 style={styles.metricTitle}>App Usage Overview</h3>
                                    {usageMetrics.length > 0 ? (
                                        <div style={styles.usageTable}>
                                            <div style={styles.tableHeader}>
                                                <span>Application</span>
                                                <span>API Calls</span>
                                                <span>Generated</span>
                                                <span>Saved</span>
                                                <span>Errors</span>
                                            </div>
                                            {usageMetrics.map(metric => (
                                                <div key={metric?.appName || 'unknown'} style={styles.tableRow}>
                                                    <span style={styles.appName}>
                                                        {getAppDisplayName(metric?.appName || 'unknown')}
                                                    </span>
                                                    <span title={`${metric?.apiHits || 0} API calls made`}>
                                                        {(metric?.apiHits || 0).toLocaleString()}
                                                    </span>
                                                    <span title={`${metric?.generatedArtifacts || 0} AI generations completed`}>
                                                        {(metric?.generatedArtifacts || 0).toLocaleString()}
                                                    </span>
                                                    <span title={`${metric?.savedArtifacts || 0} items saved`}>
                                                        {(metric?.savedArtifacts || 0).toLocaleString()}
                                                    </span>
                                                    <span title={`${metric?.apiErrors || 0} failed requests`} style={{ color: (metric?.apiErrors || 0) > 0 ? 'var(--error)' : 'inherit' }}>
                                                        {(metric?.apiErrors || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={styles.loadingText}>Loading usage metrics...</p>
                                    )}
                                </div>

                                <div style={styles.metricCard}>
                                    <h3 style={styles.metricTitle}>Usage Distribution</h3>
                                    {usageMetrics.length > 0 ? (
                                        <div style={styles.pieChart}>
                                            {usageMetrics.map((metric, index) => {
                                                const total = usageMetrics.reduce((sum, m) => sum + m.apiHits, 0);
                                                const percentage = total > 0 ? (metric.apiHits / total) * 100 : 0;
                                                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

                                                return (
                                                    <div key={metric.appName} style={styles.pieSegment}>
                                                        <div
                                                            style={{
                                                                ...styles.pieSlice,
                                                                backgroundColor: colors[index % colors.length],
                                                                width: `${percentage}%`
                                                            }}
                                                        >
                                                            <span style={styles.pieLabel}>
                                                                {getAppDisplayName(metric.appName)}: {percentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p style={styles.loadingText}>Loading distribution data...</p>
                                    )}
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
                )}
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
    tabs: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
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
    },
    deletingOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
        textAlign: 'center' as const,
        backdropFilter: 'blur(4px)',
    },

    // Usage Insights Dashboard Styles
    summaryStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, var(--primary, #3b82f6) 0%, var(--primary-hover, #2563eb) 100%)',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
    },
    summaryItem: {
        textAlign: 'center' as const,
    },
    summaryValue: {
        display: 'block',
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: '4px',
    },
    summaryLabel: {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 500,
        opacity: 0.9,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
    },
    metricCard: {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
    },
    metricTitle: {
        fontSize: '1.1rem',
        fontWeight: 600,
        marginBottom: '16px',
        color: 'var(--text-primary)',
    },
    loadingText: {
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        margin: 0,
    },

    // Health Status Styles
    healthStatus: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
    },
    healthIndicator: {
        padding: '4px 12px',
        borderRadius: 'var(--radius-sm)',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 600,
        textAlign: 'center' as const,
        width: 'fit-content',
    },
    healthDetails: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
    },

    // Usage Table Styles
    usageTable: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        gap: '12px',
        padding: '8px 0',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-light, rgba(0,0,0,0.1))',
        alignItems: 'center',
    },
    appName: {
        fontWeight: 500,
        color: 'var(--text-primary)',
    },

    // Pie Chart Styles
    pieChart: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    pieSegment: {
        width: '100%',
        position: 'relative' as const,
    },
    pieSlice: {
        height: '24px',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        minWidth: 'fit-content',
    },
    pieLabel: {
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'white',
        whiteSpace: 'nowrap' as const,
    }
};