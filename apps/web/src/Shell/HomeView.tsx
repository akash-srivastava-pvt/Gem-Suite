import React from "react";
import { ShellApp } from "@gem/shared";
import AppTile from "./AppTile.js";
import { theme } from "../theme.js";

type Props = {
    apps: ShellApp[];
    onSelectApp: (appId: string) => void;
    isAgreed: boolean;
};

const HomeView: React.FC<Props> = ({ apps, onSelectApp, isAgreed }) => {
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={{ textAlign: "center" }}>
                    <h1 style={styles.heading}>Aryavarta Gem Suite</h1>
                    <p style={{ color: theme.colors.textSecondary, marginTop: "8px", fontSize: "16px" }}>
                        {isAgreed
                            ? "Intelligent laboratory of connected AI assistants."
                            : "Please complete the User Agreement in Gem Profile to unlock all apps."}
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
            <div style={{ position: "absolute", bottom: "32px", fontSize: "12px", color: theme.colors.textSecondary, opacity: 0.5 }}>
                Aryavarta Labs © 2026
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
        background: `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`,
        padding: "40px",
        minHeight: "100%",
        position: "relative" as const,
    },
    content: {
        maxWidth: "1000px",
        width: "100%",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "64px",
    },
    heading: {
        fontSize: "42px",
        fontWeight: 800,
        color: theme.colors.primary,
        margin: 0,
        letterSpacing: "-0.02em",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        width: "100%",
    },
};

export default HomeView;
