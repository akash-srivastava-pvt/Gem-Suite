import React from "react";
import { ShellApp } from "@gem/shared";
import AppTile from "./AppTile.js";

type Props = {
    apps: ShellApp[];
    onSelectApp: (appId: string) => void;
    isAgreed: boolean;
};

const HomeView: React.FC<Props> = ({ apps, onSelectApp, isAgreed }) => {
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.headerArea}>
                    <h1 style={styles.heading}>Gem Desktop</h1>
                    <p style={styles.subheading}>
                        {isAgreed
                            ? "Professional AI workspace for creative and analytical tasks."
                            : "Action Required: Please complete the User Agreement in Gem Profile to unlock all features."}
                    </p>
                </div>
                <div style={styles.grid}>
                    {apps.map((app) => (
                        <AppTile
                            key={app.id}
                            app={app}
                            onClick={() => onSelectApp(app.id)}
                            disabled={!isAgreed && app.id !== 'profile'}
                        />
                    ))}
                </div>
            </div>
            <div style={styles.footer}>
                Aryavarta Labs © 2026 • Private Beta v1.0
            </div>
        </div>
    );
};

const styles = {
    container: {
        flex: 1,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        padding: "64px 40px",
        minHeight: "100vh",
        position: "relative" as const,
        overflowY: "auto" as const,
    },
    content: {
        maxWidth: "1200px",
        width: "100%",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "48px",
    },
    headerArea: {
        textAlign: "center" as const,
        maxWidth: "600px",
    },
    heading: {
        fontSize: "3.5rem",
        fontWeight: 800,
        color: "var(--primary)",
        margin: 0,
        letterSpacing: "-0.04em",
        lineHeight: 1.1,
    },
    subheading: {
        color: "var(--text-secondary)",
        marginTop: "16px",
        fontSize: "1.125rem",
        lineHeight: 1.6,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px",
        width: "100%",
        paddingBottom: "80px",
    },
    footer: {
        position: "absolute" as const,
        bottom: "32px",
        fontSize: "0.75rem",
        color: "var(--text-secondary)",
        opacity: 0.6,
        letterSpacing: "0.05em",
        textTransform: "uppercase" as const,
    },
};

export default HomeView;
