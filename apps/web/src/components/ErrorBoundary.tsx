import React, { Component, ErrorInfo, ReactNode } from 'react';
import { theme } from '../theme.js';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    appName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in App [${this.props.appName || 'Unknown'}]:`, error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={styles.container}>
                    <div className="card" style={styles.card}>
                        <div style={styles.icon}>⚠️</div>
                        <h2 style={styles.title}>Application Error</h2>
                        <p style={styles.message}>
                            The <strong>{this.props.appName || 'Selected App'}</strong> encountered an unexpected issue and was suspended to prevent affecting the rest of the workspace.
                        </p>
                        <div style={styles.errorDetail}>
                            <code>{this.state.error?.message}</code>
                        </div>
                        <div style={styles.actions}>
                            <button
                                className="primary-btn"
                                onClick={this.handleReset}
                                style={{ flex: 1 }}
                            >
                                Try Again
                            </button>
                            <button
                                className="secondary-btn"
                                onClick={() => window.location.reload()}
                                style={{ flex: 1 }}
                            >
                                Reload Gem Suite
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
        backgroundColor: 'var(--background)',
    },
    card: {
        maxWidth: '500px',
        width: '100%',
        padding: '32px',
        textAlign: 'center' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-modal)',
        backgroundColor: 'var(--surface)',
    },
    icon: {
        fontSize: '48px',
        marginBottom: '8px',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        color: 'var(--text)',
    },
    message: {
        margin: 0,
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
    },
    errorDetail: {
        padding: '12px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.8rem',
        color: 'var(--error)',
        textAlign: 'left' as const,
        overflowX: 'auto' as const,
    },
    actions: {
        display: 'flex',
        gap: '12px',
        marginTop: '8px',
    }
};
